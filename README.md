# React 쇼핑몰 프로젝트(3)

2교시 응용: 기존 orderResult를 Props로 전달해 주문번호와 서버 총액을 카드로 표시합니다. 비워진 장바구니에서 총액을 다시 계산하지 않습니다.

## 응용 기준

브랜치: `codex/day3-lesson9-order-card`

기준 커밋: [88c4eb6cf0725cf1deecfdb2bddb9610fe41e442](https://github.com/HarenKei/react-mini-shop-day1/commit/88c4eb6cf0725cf1deecfdb2bddb9610fe41e442)

해당 교시 기본 완료 코드에서 이 응용의 표시 변경만 추가했습니다. 기본 코드로 돌아갈 때는 위 기준 커밋을 사용합니다.

## 강의자료와 시작 기준

- [3일차 Figma Slides](https://www.figma.com/slides/kh0F44AWVdpGchEN08qXyp)
- [1일차 PDF](<React 쇼핑몰 프로젝트 (1).pdf>)
- [2일차 PDF, 84페이지](<React 쇼핑몰 프로젝트 (2).pdf>)
- [2일차 Figma Slides](https://www.figma.com/slides/G8qbTpB6jYnAF8dTKkVZEq)
- [기존 2일차 완료 코드](https://github.com/HarenKei/react-mini-shop-day1/tree/5cc2742b9f7d74bb7ad0685d5732539dab9f8d06)

상품 조회는 `ORDER BY product_id DESC LIMIT 4`를 사용합니다. 승인한 상품 4개 입력과 `created_at` SQL을 포함하며, 이메일 확인 필드는 제거했습니다. 장바구니의 수량 변경, 상품 삭제, 전체 비우기는 유지합니다.

## 준비와 실행

Node.js 20.19 이상 또는 22.12 이상과 Python 3.13, PostgreSQL 17을 준비합니다. 아래 명령은 `package.json`이 있는 프로젝트 루트에서 실행합니다.

```sh
npm ci
```

`backend/.env.example`을 `backend/.env`로 복사합니다. DB 이름의 학생용 기본값은 `shop`입니다. DB 접속 정보는 자신의 PostgreSQL 설정으로 바꾸고, `SHOP_JWT_SECRET`에는 아래 명령으로 생성한 값을 넣습니다. 실제 비밀번호와 비밀키는 Git에 올리지 않습니다.

```sh
python -c "import secrets; print(secrets.token_hex(32))"
```

Windows CMD에서는 위 명령의 `python`을 `py -3.13`으로 바꿀 수 있습니다.

Windows CMD — 첫 번째 터미널:

```cmd
py -3.13 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-lock.txt
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

Mac — 첫 번째 터미널:

```sh
python3.13 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements-lock.txt
backend/.venv/bin/python -m uvicorn backend.main:app --reload
```

두 번째 터미널에서 React를 실행합니다.

```sh
npm run dev -- --port 5173 --strictPort
```

React 주소는 `http://localhost:5173`, API 문서는 `http://127.0.0.1:8000/docs`입니다. 가상환경이 생성되기 전에 비밀키를 만들 때 Mac에서는 `python3.13`을 사용합니다.

## SQL 실행 순서

서버는 테이블을 자동 생성하지 않습니다. DBeaver에서 실행할 DB 이름과 `public` 스키마를 먼저 확인합니다.

| 시점 | 실행할 파일 |
| --- | --- |
| 처음 시작하는 빈 DB | `sql/01-create-products.sql`, `sql/02-seed-products.sql` |
| 2일차에서 이어서 시작 | 기존 products 보존, 필요한 경우 `sql/04-add-created-at.sql` |
| 1교시 | `sql/05-create-customers-sales.sql` |
| 2교시 | `sql/06-create-orders.sql` |
| 4교시 | `sql/07-verify-order.sql`의 123을 실제 주문번호로 변경해 조회 |

상품 INSERT는 처음 한 번만 실행합니다. 기존 수업용 `shop`에 3일차 테이블을 미리 만들지 않고, 수업 중 CREATE 쿼리를 작성합니다. 별도 리허설은 `CREATE DATABASE shop_day3_rehearsal;`로 만든 DB에 연결해 진행하며 `.env`의 DB 이름도 함께 바꿉니다.

계정 생성은 1교시 SQL을 실행한 다음 진행합니다. 같은 아이디로 다시 실행하면 기존 계정을 유지합니다. 비밀번호는 Argon2 해시로 저장합니다.

Windows CMD:

```cmd
backend\.venv\Scripts\python.exe -m backend.create_demo_user
```

Mac:

```sh
backend/.venv/bin/python -m backend.create_demo_user
```

## 동작과 확인

1. 상품을 담고 검색이나 메뉴를 바꿔도 장바구니가 유지되는지 확인합니다.
2. 잘못된 비밀번호는 오류를 표시하고, 로그인 성공 후 회원 이름을 표시합니다.
3. 주문 저장 단계부터 주문번호와 서버가 계산한 총액을 확인합니다. 정상 주문은 orders, sales, 재고가 함께 반영됩니다. 재고 부족이나 저장 오류는 전체 작업을 취소합니다.
4. 화면 이동 단계부터 `/`, `/login`, `/cart`와 알 수 없는 주소 안내를 확인합니다. 로그인 성공 후 `/cart`로 이동합니다.
5. 회원 정보 연결 단계에서 체크하면 회원 이름과 이메일을 읽기 전용으로 표시하고, 해제하면 직접 입력한 값을 복원합니다.

JWT 만료 시간은 30분이며 메모리에 보관합니다. 새로고침하면 로그인과 장바구니가 초기화됩니다. 로그아웃이나 인증 만료 시 주문자 입력을 초기화합니다. 실제 결제 기능은 포함하지 않습니다.

## 구현 파일

- `src/App.jsx`: 공유 상태, 상품과 장바구니, 인증과 주문 화면
- `src/main.jsx`: React 시작점, 화면 이동 단계부터 BrowserRouter
- `src/components/`: 화면 이동의 ShopNav, 각 응용 브랜치의 표시 컴포넌트
- `backend/main.py`: 상품 조회, 로그인과 회원 정보, 인증된 주문 API
- `backend/create_demo_user.py`: 실습용 계정 생성
- `backend/.env.example`: 학생용 접속 정보와 비밀키 예시
- `sql/`: 수업 중 실행할 SQL

빌드 확인:

```sh
npm run build
```

## 오류 확인

- 상품 API가 실패하면 PostgreSQL 실행 상태와 `.env`의 DB 이름, 포트, products 테이블을 확인합니다.
- `.env`를 수정했으면 FastAPI를 다시 실행합니다.
- API는 되지만 React 요청이 실패하면 React 주소와 CORS의 5173 포트를 확인합니다.
- 401 응답은 다시 로그인하고, 409 응답은 DB 재고를 확인합니다.
- 수업용 DB를 유지하면서 재고와 오류를 반복 검증하려면 별도 리허설 DB를 사용합니다.

## 공식 문서

- [FastAPI JWT 인증](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [Psycopg 트랜잭션](https://www.psycopg.org/psycopg3/docs/basic/transactions.html)
- [React Props](https://react.dev/learn/passing-props-to-a-component)
- [React Router 화면 이동](https://reactrouter.com/start/declarative/navigating)
