from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import os
import psycopg
from psycopg.rows import dict_row

from pathlib import Path
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))
JWT_SECRET = os.environ["SHOP_JWT_SECRET"]
password_hasher = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)

class LoginRequest(BaseModel):
    userid: str
    password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health")
def health():
    return {"status": "ok"}

def get_connection():
    return psycopg.connect(
        host=os.getenv("SHOP_DB_HOST", "127.0.0.1"),
        port=int(os.getenv("SHOP_DB_PORT", "5432")),
        dbname=os.getenv("SHOP_DB_NAME", "shop"),
        user=os.environ["SHOP_DB_USER"],
        password=os.environ["SHOP_DB_PASSWORD"],
        row_factory=dict_row,
    )

@app.get("/products")
def list_products():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT product_id, name, category, price, stock_quantity
                FROM public.products
                ORDER BY product_id DESC
                LIMIT 4
                """
            )
            rows = cursor.fetchall()

    emoji_by_category = {"가방": "👜", "주방": "☕", "문구": "📒"}
    return [
        {
            "id": row["product_id"],
            "name": row["name"],
            "category": row["category"],
            "price": float(row["price"]),
            "stock_quantity": row["stock_quantity"],
            "emoji": emoji_by_category.get(row["category"], "🛍️"),
        }
        for row in rows
    ]


@app.post("/login")
def login(body: LoginRequest):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT customer_id, userid, name, passwd
                FROM public.customers
                WHERE userid = %s
                """,
                (body.userid,),
            )
            customer = cursor.fetchone()

    if customer is None or not password_hasher.verify(
        body.password, customer["passwd"]
    ):
        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    token = jwt.encode(
        {"sub": str(customer["customer_id"]), "exp": expires},
        JWT_SECRET,
        algorithm="HS256",
    )
    return {"access_token": token, "token_type": "bearer"}

def get_current_customer(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    unauthorized = HTTPException(
        status_code=401,
        detail="인증이 필요합니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
        )
        customer_id = int(payload.get("sub", ""))
    except (InvalidTokenError, TypeError, ValueError):
        raise unauthorized

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT customer_id, userid, name, email
                FROM public.customers
                WHERE customer_id = %s
                """,
                (customer_id,),
            )
            customer = cursor.fetchone()

    if customer is None:
        raise unauthorized
    return customer

@app.get("/me")
def read_me(customer=Depends(get_current_customer)):
    return customer
