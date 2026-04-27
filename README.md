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
