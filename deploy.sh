#!/bin/bash

# Script tự động triển khai QuanLyChiTieu (Docker Compose)
# Cách chạy: chmod +x deploy.sh && ./deploy.sh

echo -e "\e[36m🚀 Đang khởi động quá trình triển khai hệ thống...\e[0m"

# 1. Kiểm tra Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "\e[31m❌ Lỗi: Docker chưa được cài đặt.\e[0m"
  exit 1
fi

# 2. Tạo file .env nếu chưa có
if [ ! -f .env ]; then
  echo -e "\e[33m📝 Đang tạo file .env từ .env.example...\e[0m"
  cp .env.example .env
  echo -e "\e[32m✅ Đã tạo file .env.\e[0m"
else
  echo -e "\e[90mℹ️ Đã tìm thấy file .env, bỏ qua bước tạo mới.\e[0m"
fi

# 3. Chạy Docker Compose
echo -e "\e[36m🐳 Đang xây dựng và khởi chạy các containers...\e[0m"
docker-compose up -d --build

if [ $? -eq 0 ]; then
  echo -e "\n\e[42m\e[30m✨ TRIỂN KHAI THÀNH CÔNG! \e[0m"
  echo "--------------------------------------------------"
  echo -e "🌍 Frontend: \e[97mhttp://localhost:3000\e[0m"
  echo -e "⚙️  Backend:  \e[97mhttp://localhost:5000\e[0m"
  echo -e "🏥 Health:   \e[97mhttp://localhost:5000/api/health\e[0m"
  echo "--------------------------------------------------"
  echo -e "\e[33m💡 Lưu ý: Buổi demo nên sử dụng cổng 3000 để chạy toàn bộ hệ thống.\e[0m"
else
  echo -e "\e[31m❌ Có lỗi xảy ra trong quá trình chạy Docker Compose.\e[0m"
fi
