# Hướng dẫn Deploy: Render (Backend) + Vercel (Frontend)

> Không cần VPS, không cần SSH key. Cả hai đều có **free tier**.

---

## Tổng quan

```
GitHub repo (main branch)
  │
  ├─ Backend (Node.js + SQLite)  →  Render Web Service
  └─ Frontend (React/Vite)       →  Vercel
```

---

## Phần 1 — Deploy Backend lên Render

### 1.1. Tạo tài khoản & Web Service

1. Vào [render.com](https://render.com) → **Sign up with GitHub**
2. Dashboard → **New** → **Web Service**
3. Chọn repo `QuanLyChiTieu` → **Connect**
4. Điền thông tin:

| Trường | Giá trị |
|--------|---------|
| **Name** | `quanlychitieu-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm ci --omit=dev` |
| **Start Command** | `node src/server.js` |
| **Instance Type** | `Free` |

### 1.2. Cấu hình Environment Variables trên Render

Vào tab **Environment** của service → Add:

```
NODE_ENV          = production
PORT              = 5000
JWT_SECRET        = <chuỗi ngẫu nhiên dài 32+ ký tự>
CORS_ORIGIN       = https://<tên-project>.vercel.app
DATABASE_PATH     = /opt/render/project/src/backend/database.sqlite
```

> ⚠️ **SQLite trên Render free tier**: dữ liệu sẽ **mất khi redeploy** (disk không persist).
> Chấp nhận được cho demo/assignment. Nếu cần giữ data, nâng lên Render Starter ($7/tháng) và bật Persistent Disk.

### 1.3. Lấy Deploy Hook URL

Render Dashboard → service `quanlychitieu-backend` → tab **Settings**
→ kéo xuống **Deploy Hook** → **Copy URL**

URL trông như: `https://api.render.com/deploy/srv-xxxxx?key=yyyy`

→ Lưu lại để dùng ở Bước 3.

---

## Phần 2 — Deploy Frontend lên Vercel

### 2.1. Tạo tài khoản & Project

1. Vào [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **New Project** → Import repo `QuanLyChiTieu`
3. Cấu hình:

| Trường | Giá trị |
|--------|---------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables** → Add:
   ```
   VITE_API_URL = https://quanlychitieu-backend.onrender.com
   ```
   *(Thay bằng URL thật của Render service)*

5. → **Deploy** → lần đầu deploy thủ công thành công.

### 2.2. Lấy Vercel Token & Project IDs

**Token:**
- [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create Token**
- Name: `github-actions`, Scope: `Full Account` → Copy

**Org ID & Project ID** (dùng Vercel CLI):
```bash
npm i -g vercel
cd frontend
vercel link   # đăng nhập và chọn project vừa tạo
cat .vercel/project.json
# → {"orgId": "team_xxx", "projectId": "prj_yyy"}
```

---

## Phần 3 — Thêm Secrets vào GitHub

Repo GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Lấy từ đâu |
|-------------|------------|
| `RENDER_DEPLOY_HOOK_URL` | Render → Settings → Deploy Hook |
| `RENDER_BACKEND_URL` | URL service Render, VD: `https://quanlychitieu-backend.onrender.com` |
| `VERCEL_TOKEN` | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |
| `VITE_API_URL` | URL Render backend (giống RENDER_BACKEND_URL) |

---

## Phần 4 — Kiểm tra hoạt động

Sau khi push lên `main`, vào **Actions** tab trên GitHub:

```
CD - Deploy Production
  ✅ Deploy Backend → Render
  ✅ Deploy Frontend → Vercel  
  ✅ Health Check
```

Test thủ công:
```bash
# Backend health check
curl https://quanlychitieu-backend.onrender.com/api/health

# Frontend
open https://<project>.vercel.app
```

---

## Lưu ý Render Free Tier

- Service sẽ **sleep sau 15 phút** không có request → lần đầu load chậm ~30s
- Giải pháp: dùng [UptimeRobot](https://uptimerobot.com) ping `/api/health` mỗi 10 phút (free)
