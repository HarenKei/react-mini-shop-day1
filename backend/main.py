from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel, Field
from decimal import Decimal
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


class OrderItemIn(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=20)

class OrderIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    email: str = Field(
        min_length=3,
        max_length=150,
        pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
    )
    items: list[OrderItemIn] = Field(min_length=1, max_length=20)

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

@app.post("/orders", status_code=201)
def create_order(body: OrderIn, customer=Depends(get_current_customer)):
    contact_name = body.name.strip()
    if not contact_name:
        raise HTTPException(status_code=422, detail="주문자 이름을 입력해 주세요.")

    ids = [item.product_id for item in body.items]
    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=422, detail="같은 상품이 중복되었습니다.")

    lines = []
    total = Decimal("0.00")
    sale_ids = []

    with get_connection() as connection:
        with connection.cursor() as cursor:
            for item in sorted(body.items, key=lambda value: value.product_id):
                cursor.execute(
                    """
                    SELECT product_id, name, price, stock_quantity
                    FROM public.products
                    WHERE product_id = %s
                    FOR UPDATE
                    """,
                    (item.product_id,),
                )
                product = cursor.fetchone()

                if product is None:
                    raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
                if product["price"] < 0:
                    raise HTTPException(status_code=422, detail="상품 가격을 확인해 주세요.")
                if product["stock_quantity"] < item.quantity:
                    raise HTTPException(
                        status_code=409,
                        detail=f"{product['name']}의 재고가 부족합니다.",
                    )

                line_total = product["price"] * item.quantity
                if line_total > Decimal("99999999.99"):
                    raise HTTPException(status_code=422, detail="상품 금액 범위를 초과했습니다.")
                total += line_total
                lines.append((item, product, line_total))

            cursor.execute(
                """
                INSERT INTO public.orders (customer_id, contact_name, contact_email)
                VALUES (%s, %s, %s)
                RETURNING order_id
                """,
                (customer["customer_id"], contact_name, body.email),
            )
            order_id = cursor.fetchone()["order_id"]

            for item, product, line_total in lines:
                cursor.execute(
                    """
                    UPDATE public.products
                    SET stock_quantity = stock_quantity - %s
                    WHERE product_id = %s AND stock_quantity >= %s
                    RETURNING stock_quantity
                    """,
                    (item.quantity, item.product_id, item.quantity),
                )
                if cursor.fetchone() is None:
                    raise HTTPException(status_code=409, detail="재고가 부족합니다.")

                cursor.execute(
                    """
                    INSERT INTO public.sales
                        (order_id, customer_id, product_id, quantity, total_price)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING sale_id
                    """,
                    (
                        order_id,
                        customer["customer_id"],
                        item.product_id,
                        item.quantity,
                        line_total,
                    ),
                )
                sale_ids.append(cursor.fetchone()["sale_id"])

    return {
        "order_id": order_id,
        "sale_ids": sale_ids,
        "total_price": float(total),
    }
