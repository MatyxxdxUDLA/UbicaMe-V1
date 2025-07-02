# Script de inicio para UbicaMe Fleet Management System
# PowerShell Script para Windows

Write-Host "🚀 Iniciando UbicaMe Fleet Management System..." -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si las dependencias están instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias principales..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Verificar archivo .env del backend
if (-not (Test-Path "backend/.env")) {
    Write-Host "⚙️ Creando archivo de configuración del backend..." -ForegroundColor Yellow
    @"
PORT=3001
JWT_SECRET=ubicame_jwt_secret_key_academico_2024
DB_PATH=./database/fleet.db
NODE_ENV=development
"@ | Out-File -FilePath "backend/.env" -Encoding UTF8
}

# Verificar archivo .env del frontend (opcional)
if (-not (Test-Path "frontend/.env")) {
    Write-Host "⚙️ Creando archivo de configuración del frontend..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:3001
"@ | Out-File -FilePath "frontend/.env" -Encoding UTF8
}

# Verificar base de datos
if (-not (Test-Path "backend/database/fleet.db")) {
    Write-Host "🗄️ Inicializando base de datos..." -ForegroundColor Yellow
    cd backend
    npm run init-db
    cd ..
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🗺️ Sistema de Mapas:" -ForegroundColor Cyan
Write-Host "✅ OpenStreetMap configurado automáticamente" -ForegroundColor Green
Write-Host "✅ Sin necesidad de API keys o tokens" -ForegroundColor Green
Write-Host "✅ Completamente gratuito y sin límites" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs del sistema:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "👥 Usuarios de prueba:" -ForegroundColor Cyan
Write-Host "Admin:      admin@ubicame.com / admin123" -ForegroundColor White
Write-Host "Conductor:  conductor1@ubicame.com / conductor123" -ForegroundColor White

# Preguntar si desea iniciar los servicios
$response = Read-Host "`n¿Deseas iniciar los servicios ahora? (s/N)"
if ($response -eq 's' -or $response -eq 'S' -or $response -eq 'si' -or $response -eq 'SI') {
    Write-Host "🚀 Iniciando servicios..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "✅ Para iniciar los servicios más tarde, ejecuta: npm run dev" -ForegroundColor Green
} 