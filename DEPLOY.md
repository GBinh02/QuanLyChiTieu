# 🚀 Hướng dẫn Deployment (QuanLyChiTieu)

Tài liệu này hướng dẫn cách deploy hệ thống lên VPS, Render, hoặc Vercel.

---

## 🏆 PHẦN DÀNH CHO: Infrastructure Engineer (Deploy Owner)

Để thực hiện đúng yêu cầu **không chạy local khi demo** và đảm bảo các tiêu chí về hạ tầng, hãy làm theo các bước sau:

### 1. Chuẩn bị môi trường
- Đảm bảo đã cài đặt **Docker Desktop** (trên Windows) hoặc **Docker** (trên Linux/VPS).
- Mở Terminal (PowerShell hoặc Bash) tại thư mục gốc của dự án.

### 2. Triển khai nhanh (Dùng Script)
Chạy script tự động đã được chuẩn bị sẵn:
- **Trên Windows (PowerShell):**
  ```powershell
  .\deploy.ps1
  ```
- **Trên Linux/WSL (Bash):**
  ```bash
  chmod +x deploy.sh
  ./deploy.sh
  ```

### 3. Kiểm tra kịch bản Demo
Sau khi script thông báo "TRIỂN KHAI THÀNH CÔNG", hãy kiểm tra các tiêu chí sau để demo:
1. **Thứ tự Deploy**: Script đã tự động build Backend trước, sau đó đến Frontend.
2. **Cấu hình (ENV/CORS)**:
   - File `.env` đã được tạo tự động.
   - CORS đã được xử lý thông qua **Nginx Reverse Proxy** (config trong `frontend/nginx.conf`).
3. **Truy cập hệ thống**:
   - Mở trình duyệt và truy cập: **http://localhost:3000**
   - Thử đăng ký/đăng nhập. Nếu thành công nghĩa là Frontend đã kết nối được Backend thông qua mạng nội bộ Docker.
4. **Kiểm tra Hạ tầng**:
   - Chạy lệnh: `docker ps` để thấy 2 containers `quanlychitieu_backend` và `quanlychitieu_frontend` đang chạy.
   - Chạy lệnh: `docker compose logs -f` để xem log thời gian thực.

---

## 1. Deploy lên VPS (Dùng Docker Compose) - Khuyên dùng
Đây là cách tốt nhất để đảm bảo dữ liệu (SQLite) được lưu trữ bền vững.

### Bước 1: Cài đặt Docker & Docker Compose trên VPS
Nếu chưa có, hãy cài đặt theo tài liệu chính thức của Docker.

### Bước 2: Clone source code và cấu hình
```bash
git clone <your-repo-url>
cd QuanLyChiTieu
cp .env.example .env
```
Sửa file `.env`:
- `JWT_SECRET`: Đổi thành chuỗi bảo mật.
- `CORS_ORIGIN`: Đổi thành domain của bạn (hoặc để `*` nếu muốn mở công khai).

### Bước 3: Chạy hệ thống
```bash
docker compose up -d --build
```
Hệ thống sẽ chạy tại:
- **Frontend**: http://<vps-ip>:3000
- **Backend**: http://<vps-ip>:5000

---

## 2. Deploy lên Render (Miễn phí)
Render có thể host cả Backend và Frontend.

### A. Backend (Web Service)
1. Kết nối GitHub repo với Render.
2. Chọn thư mục `backend` làm root directory (hoặc cấu hình build command).
3. **Build Command**: `npm install`
4. **Start Command**: `node src/server.js`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (chuỗi bí mật)
   - `CORS_ORIGIN`: (URL của frontend sau khi deploy)
   - `DATABASE_PATH`: `database.sqlite`

### B. Frontend (Static Site)
1. Kết nối GitHub repo với Render.
2. Chọn thư mục `frontend` làm root directory.
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: (URL của Backend Web Service bạn vừa tạo, ví dụ: `https://my-backend.onrender.com/api`)

---

## 3. Deploy Frontend lên Vercel
Vercel cực kỳ nhanh cho React apps.

1. Import repo vào Vercel.
2. Chọn thư mục `frontend`.
3. Trong phần **Environment Variables**, thêm:
   - `VITE_API_URL`: (URL của Backend API)
4. Nhấn **Deploy**.

---

## ⚠️ Lưu ý quan trọng về SQLite trên Cloud (Render Free tier)
Trên các dịch vụ Cloud miễn phí như Render (không có Persistent Disk), file `database.sqlite` sẽ bị **XÓA** mỗi khi ứng dụng khởi động lại hoặc redeploy. 
- Để giữ dữ liệu trên VPS: Docker volumes đã được cấu hình tự động lưu vào `sqlite_data`.
- Để giữ dữ liệu trên Render: Bạn cần sử dụng dịch vụ trả phí (Persistent Disk) hoặc đổi sang database external (như PostgreSQL).

---

## 🔄 Thứ tự Deploy chuẩn
1. **Backend** trước -> Lấy URL của Backend.
2. **Frontend** sau -> Điền URL Backend vào config của Frontend.
3. **Config (CORS)** -> Cập nhật `CORS_ORIGIN` ở Backend để cho phép Frontend truy cập.
