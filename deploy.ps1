# Script tu dong trien khai QuanLyChiTieu (Docker Compose)
# Cach chay: .\deploy.ps1

Write-Host "--- Start Deployment ---" -ForegroundColor Cyan

# 1. Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed." -ForegroundColor Red
    exit
}

# 2. Create .env if not exists
if (!(Test-Path .env)) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
} else {
    Write-Host ".env already exists." -ForegroundColor Gray
}

# 3. Run Docker Compose
Write-Host "Building and starting containers..." -ForegroundColor Cyan
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n--- DEPLOY SUCCESS ---" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000"
    Write-Host "Backend:  http://localhost:5000"
    Write-Host "Health:   http://localhost:5000/api/health"
    Write-Host "--- Note: Use port 3000 for the demo ---" -ForegroundColor Yellow
} else {
    Write-Host "Error during docker-compose execution." -ForegroundColor Red
}
