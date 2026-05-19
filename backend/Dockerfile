FROM node:20-alpine

WORKDIR /app

# Cài dependencies trước (tận dụng Docker cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

# Tạo thư mục data cho SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.sqlite
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
