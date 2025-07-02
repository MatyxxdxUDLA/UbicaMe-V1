# UbicaMe Fleet Management - Microservices Startup Script
Write-Host "🚀 Starting UbicaMe Microservices Architecture..." -ForegroundColor Green

# Verificar que Node.js esté instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js no está instalado. Por favor instálalo desde https://nodejs.org/"
    exit 1
}

# Crear archivos .env si no existen
Write-Host "📋 Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path "api-gateway\.env")) {
    Copy-Item "api-gateway\env.example" "api-gateway\.env"
    Write-Host "✅ Created api-gateway\.env" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\env.example" "frontend\.env"
    Write-Host "✅ Created frontend\.env" -ForegroundColor Green
}

# Copiar .env del backend a todos los servicios
$services = @("auth-service", "user-service", "task-service", "location-service")
foreach ($service in $services) {
    if (-not (Test-Path "services\$service\.env")) {
        Copy-Item "backend\.env" "services\$service\.env"
        Write-Host "✅ Created services\$service\.env" -ForegroundColor Green
    }
}

Write-Host "`n🔧 Installing dependencies for all services..." -ForegroundColor Yellow
npm run install-all

Write-Host "`n🌐 Architecture Overview:" -ForegroundColor Cyan
Write-Host "├─ API Gateway      : http://localhost:3000" -ForegroundColor White
Write-Host "├─ Auth Service     : http://localhost:3001" -ForegroundColor White
Write-Host "├─ User Service     : http://localhost:3002" -ForegroundColor White
Write-Host "├─ Task Service     : http://localhost:3003" -ForegroundColor White
Write-Host "├─ Location Service : http://localhost:3004" -ForegroundColor White
Write-Host "└─ Frontend         : http://localhost:4000" -ForegroundColor White

Write-Host "`n🚀 Starting all microservices..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Ejecutar todos los servicios
npm run dev 