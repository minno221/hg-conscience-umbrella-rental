# 양심우산 대여 시스템

학교 학생포털사이트의 양심우산대여 기능 (Next.js + Prisma).

## 실행 방법

1. 패키지 설치
   ```
   npm install
   ```

2. 환경변수 설정
   ```
   cp .env.example .env
   ```
   `.env` 파일 열어서 `ADMIN_PASSWORD`를 원하는 비밀번호로 바꾸세요.

3. DB 생성 (SQLite 파일 생성 + 테이블 만들기)
   ```
   npx prisma migrate dev --name init
   ```

4. 우산 100개 초기 데이터 넣기
   ```
   npm run seed
   ```

5. 개발 서버 실행
   ```
   npm run dev
   ```

6. 브라우저에서 확인
   - 학생용: http://localhost:3000/umbrella
   - 관리자용: http://localhost:3000/umbrella/admin

## 기능 설명

- **학생**: 대여 가능한 우산 클릭 → 이름/학번 입력 → 대여. 대여중인 우산 클릭 → 바로 반납 처리.
- **관리자**: 비밀번호로 로그인 후, 학생 동의 없이 어떤 우산이든 상태를 강제로 전환 가능 (분실 처리, 오류 수정 등에 사용).

## 나중에 확장하고 싶다면

- 대여 이력을 따로 남기고 싶으면 `Rental` 테이블을 추가해서 대여/반납 로그를 쌓을 수 있어요.
- 실제 배포할 때는 `schema.prisma`의 `provider`를 `sqlite`에서 `postgresql`로 바꾸고 Vercel Postgres 같은 DB를 연결하세요.
