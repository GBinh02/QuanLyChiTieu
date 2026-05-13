## 🚀 Cài đặt project

## 🖥️ Backend
### Cài đặt
cd backend
npm install

> Cài đặt toàn bộ thư viện cần thiết cho server (Express, dotenv, Jest, ESLint...)

### Chạy server
npm start

> Khởi động API server (mặc định chạy tại http://localhost:5000)

### Test
npm test

> Chạy test backend bằng Jest (kiểm tra API, validation...)

### Lint
npm run lint

> Kiểm tra code theo chuẩn ESLint (tránh lỗi syntax, code smell)

## 🌐 Frontend
### Cài đặt
cd frontend
npm install

> Cài đặt thư viện cho giao diện (React, Vite, Vitest...)

### Chạy dev
npm run dev

> Chạy frontend ở chế độ development (hot reload, debug)

### Build
npm run build

> Build project sang dạng production (tối ưu hiệu năng)

### Test
npm test

> Chạy test frontend bằng Vitest

## 🔄 Quy trình làm việc

### ❌ Không push trực tiếp vào `main`
> Tránh làm hỏng code chính, tất cả thay đổi phải qua kiểm tra CI

### ✔ Quy trình chuẩn:
git checkout -b feature/<tên-feature>  > Tạo branch riêng cho mỗi feature → giúp quản lý code rõ ràng
git add .
git commit -m "feat: mô tả"
git push origin feature/<tên-feature>

> Tạo branch riêng cho mỗi feature → giúp quản lý code rõ ràng
→ Sau đó tạo **Pull Request**
> Gửi yêu cầu merge để CI kiểm tra và team review code

## 🤖 CI/CD (GitHub Actions)
Pipeline tự động chạy khi:

* push code
* tạo pull request

> Đảm bảo mọi thay đổi đều được kiểm tra tự động

### Backend:
* ✔ Lint (ESLint)
* ✔ Test (Jest)

> Backend phải pass lint + test trước khi merge

### Frontend:
* ✔ Test (Vitest)
* ✔ Build (Vite)

> Frontend phải build thành công và test pass

## ❗ Quy định quan trọng
* Code phải **PASS CI** mới được merge
> Nếu CI fail → Pull Request sẽ bị chặn
* Nếu CI fail → phải fix trước
* Không commit:

  * `node_modules/`
  * `.env`
> Tránh đẩy file nặng và thông tin nhạy cảm lên repo

## 📄 Biến môi trường
Tạo file `.env` trong backend:

env
PORT=5000

> Dùng để cấu hình server (có thể thêm DB_URL, API_KEY sau này)

## 📌 Ghi chú
* CI đã được cấu hình fail khi có lỗi
* Branch `main` đã được bảo vệ

> Đảm bảo chất lượng code luôn ổn định

## 🔗 Repo
https://github.com/GBinh02/QuanLyChiTieu


# Fix khi chạy local
## 🏗️ Kiến trúc

```
quanLyChiTieu/
├── backend/          # Node.js + Express + SQLite
├── frontend/         # React + Vite
└── docker-compose.yml
```

---

## 🚀 Chạy Local (Không cần Docker)

> **Yêu cầu:** Node.js >= 18

### Bước 1 – Clone repo

```bash
git clone <repo-url>
cd quanLyChiTieu
```

### Bước 2 – Chạy Backend

```bash
cd backend
cp ../.env.example .env       # Tạo file .env
npm install
npm start
# Backend chạy tại: http://localhost:5000
# Health check:     http://localhost:5000/api/health
```

### Bước 3 – Chạy Frontend (terminal mới)

```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại: http://localhost:5173
```

> **Lưu ý:** Database SQLite (`database.sqlite`) sẽ tự tạo khi backend khởi động lần đầu.  
> Không cần cài MySQL hay bất kỳ database nào thêm.

---

## 🐳 Chạy với Docker Compose (Deploy)

```bash
# Build và chạy toàn bộ stack
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/health` | ❌ | Kiểm tra server |
| POST | `/api/register` | ❌ | Đăng ký tài khoản |
| POST | `/api/login` | ❌ | Đăng nhập, trả về JWT |
| GET | `/api/transactions` | ✅ | Lấy danh sách giao dịch |
| POST | `/api/transactions` | ✅ | Thêm giao dịch |
| POST | `/api/transactions/bulk` | ✅ | Nhập nhiều giao dịch từ CSV |
| DELETE | `/api/transactions/:id` | ✅ | Xóa giao dịch |

**Auth header:** `Authorization: Bearer <token>`

---

## 🧪 Chạy Tests (Backend)

```bash
cd backend
npm test
```

Tests dùng SQLite in-memory – **không cần cài gì thêm**.

---

## 📋 Format CSV nhập liệu

Tải file mẫu từ trong ứng dụng hoặc tạo file `.csv` với cột:

| description | amount | type | category |
|-------------|--------|------|----------|
| Tiền ăn trưa | 50000 | expense | Thực phẩm |
| Lương tháng | 5000000 | income | Lương |

---

## 👥 Team Workflow

```
main
 └── feature/backend-xxx  ← Backend dev branch
 └── feature/frontend-xxx ← Frontend dev branch
```

1. **Tạo branch** từ `main`: `git checkout -b feature/ten-chuc-nang`
2. **Push** và tạo **Pull Request** → CI chạy tự động
3. **Merge** vào `main` sau khi CI pass và có review

> ⚠️ **KHÔNG push trực tiếp lên `main`**  
> ⚠️ **KHÔNG commit file `.env`** (đã có trong `.gitignore`)
