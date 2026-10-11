from getpass import getpass

from pwdlib import PasswordHash

from backend.main import get_connection

userid = input("실습 아이디: ").strip()
name = input("이름: ").strip()
email = input("이메일: ").strip()
password = getpass("실습 비밀번호(8자 이상): ")

if not userid or not name or not email or len(password) < 8:
    raise SystemExit("아이디·이름·이메일과 8자 이상의 비밀번호가 필요합니다.")

hashed_password = PasswordHash.recommended().hash(password)

with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO public.customers (name, email, userid, passwd)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (userid) DO NOTHING
            RETURNING customer_id
            """,
            (name, email, userid, hashed_password),
        )
        created = cursor.fetchone()

print("계정 생성 완료" if created else "이미 있는 아이디입니다.")
