# React 쇼핑몰 프로젝트

2일차까지 구현한 React + FastAPI + PostgreSQL 실습 완성본입니다. 응용 실습의 상품 삭제, 전체 비우기, 이메일 확인, 두 종류의 빈 화면도 포함합니다.

## 강의자료

- [1일차 PDF](<React 쇼핑몰 프로젝트 (1).pdf>)
- [2일차 PDF, 84페이지](<React 쇼핑몰 프로젝트 (2).pdf>)
- [2일차 Figma 자료](https://www.figma.com/slides/G8qbTpB6jYnAF8dTKkVZEq)
- [1일차 코드와 자료](https://github.com/HarenKei/react-mini-shop-day1/tree/ebfbe0412ffc055fd7e0788a2f62b3a317721454)

현재 기본 브랜치의 코드는 2일차 완성본입니다. 1일차 시작 코드가 필요하면 위의 1일차 링크를 사용합니다.

## 구현 기능

- 상품 검색, 카테고리 필터와 초기화
- 상품 담기, 수량 증가와 감소, 수량 0인 상품 제거
- 상품 한 종류 삭제, 전체 장바구니 비우기
- 총 수량, 합계와 주문 요약 계산
- 이름, 이메일, 이메일 확인과 빈 장바구니 검증
- PostgreSQL 상품을 FastAPI로 조회하고 React에 표시
- 로딩, 요청 오류, 등록 상품 없음, 검색 결과 없음 구분
- Effect 요청 취소와 CORS 설정

주문서의 입력 확인과 요약까지 구현되어 있습니다. 현재 코드의 상품 API는 조회 기능이며 주문 저장과 결제 기능은 포함되지 않습니다. 새로고침하면 장바구니와 주문 입력 State가 초기화됩니다.

## 준비

- Node.js 20.19 이상 또는 22.12 이상, npm
- Python 3.13, PostgreSQL
- Docker Desktop으로 실행한 PostgreSQL과 DBeaver 연결

명령은 프로젝트 루트, 즉 package.json이 있는 폴더에서 실행합니다.

### 1. React 패키지 설치

```sh
npm ci
```

### 2. 데이터베이스 준비

DBeaver에서 기존 PostgreSQL 연결의 SQL 편집기를 열고 자동 커밋 상태에서 새 DB를 생성합니다.

```sql
CREATE DATABASE shop;
```

생성 후 shop 데이터베이스에 연결해 아래 파일을 순서대로 실행합니다.

1. [상품 테이블 생성](sql/01-create-products.sql)
2. [상품 3개 입력](sql/02-seed-products.sql)
3. [응용 상품 추가와 조회](sql/03-exercise-product.sql) - 미니 파우치까지 확인할 때 한 번 실행

shop이 이미 사용 중이면 새 이름으로 DB를 생성하고 .env의 SHOP_DB_NAME도 같은 이름으로 지정합니다. 기존 DB를 삭제할 필요가 없습니다. Docker의 호스트 포트와 계정은 DBeaver에서 연결된 실제 값을 사용합니다.

### 3. DB 접속 정보

`backend/.env.example`을 `backend/.env`로 복사하고 본인의 접속 정보로 수정합니다.

```dotenv
SHOP_DB_HOST=127.0.0.1
SHOP_DB_PORT=5432
SHOP_DB_NAME=shop
SHOP_DB_USER=postgres
SHOP_DB_PASSWORD=본인의_DB_비밀번호
```

.env에는 실제 비밀번호를 기록하므로 Git에 올리지 않습니다. 저장소에는 설정 예시만 제공합니다.

### 4. FastAPI 실행

Windows CMD:

```cmd
py -3.13 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

Mac 또는 Linux:

```sh
python3.13 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python -m uvicorn backend.main:app --reload
```

검증 당시 패키지 버전은 backend/requirements-lock.txt에 기록되어 있습니다. 동일한 버전으로 설치하려면 requirements.txt 대신 requirements-lock.txt를 지정합니다.

서버 터미널을 켜 두고 다음 주소를 확인합니다.

- [서버 확인](http://127.0.0.1:8000/health): `{"status":"ok"}`
- [상품 목록](http://127.0.0.1:8000/products): 상품 JSON 배열
- [API 문서](http://127.0.0.1:8000/docs): 경로별 요청과 응답 확인

### 5. React 실행

새 터미널에서 실행합니다.

```sh
npm run dev
```

표시된 브라우저 주소를 엽니다. 기본 허용 출처는 `http://localhost:5173`과 `http://127.0.0.1:5173`입니다. Vite가 다른 포트를 사용하면 backend/main.py의 allow_origins에 실제 React 주소를 맞추거나, 5173 포트를 사용하던 본인의 서버를 종료한 뒤 다시 실행합니다.

React의 상품 요청 주소는 `http://127.0.0.1:8000/products`입니다. 서버 주소를 바꾸면 src/App.jsx의 fetch 주소도 함께 변경합니다.

## 동작 확인

1. 토트백 2개와 머그컵 1개 담기: 총 3개, 48,000원.
2. 검색 조건 변경: 장바구니와 합계 유지.
3. 토트백 삭제: 머그컵 1개, 12,000원. 전체 비우기: 빈 장바구니.
4. 이름과 서로 다른 두 이메일로 입력 확인: 이메일 불일치 오류. 같은 이메일로 수정: 오류 해제.
5. 서버 중지 후 React 새로고침: 조회 오류 안내. 서버 재시작 후 새로고침: 상품 표시.
6. 존재하지 않는 검색어: 조건에 맞는 상품 없음. API가 빈 배열을 반환하면 등록된 상품 없음.

## 파일 구성

```text
src/                         React 화면과 스타일
backend/main.py              FastAPI 상품 조회와 CORS
backend/.env.example         DB 접속 설정 예시
backend/requirements.txt     Python 패키지 목록
backend/requirements-lock.txt 검증 당시 패키지 버전
sql/                         테이블 생성, 상품 입력, 응용 SQL
React 쇼핑몰 프로젝트 (1).pdf
React 쇼핑몰 프로젝트 (2).pdf
```

## 오류 확인

- 서버가 시작되지 않으면 가상환경의 Python, 현재 폴더와 터미널 오류부터 확인합니다.
- health는 되지만 products가 실패하면 .env, PostgreSQL 실행, 포트와 DB 이름, products 테이블을 확인합니다.
- API는 정상인데 React가 실패하면 실제 React 출처와 CORS 설정을 확인합니다.
- `.env` 수정 후에는 FastAPI를 종료하고 다시 실행합니다.

## 프로덕션 빌드

```sh
npm run build
```
