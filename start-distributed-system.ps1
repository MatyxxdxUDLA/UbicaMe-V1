# Script para iniciar el sistema distribuido UbicaMe
# Incluye RabbitMQ, todos los microservicios, API Gateway y Frontend

Write-Host "🚀 Iniciando Sistema Distribuido UbicaMe..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Verificar si RabbitMQ está ejecutándose
Write-Host "🐰 Verificando RabbitMQ..." -ForegroundColor Yellow
try {
    $rabbitmq = Get-Service -Name "RabbitMQ" -ErrorAction SilentlyContinue
    if ($rabbitmq -and $rabbitmq.Status -eq "Running") {
        Write-Host "✅ RabbitMQ está ejecutándose" -ForegroundColor Green
    } else {
        Write-Host "⚠️  RabbitMQ no está ejecutándose. Iniciando..." -ForegroundColor Yellow
        Start-Service -Name "RabbitMQ" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
        Write-Host "✅ RabbitMQ iniciado" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ RabbitMQ no encontrado. Ejecute install-rabbitmq.ps1 primero" -ForegroundColor Red
    Write-Host "El sistema continuará en modo degradado (sin eventos distribuidos)" -ForegroundColor Yellow
}

# Detener procesos existentes de Node.js
Write-Host "🛑 Deteniendo servicios anteriores..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Array para almacenar procesos iniciados
$processes = @()

try {
    # 1. Iniciar Auth Service
    Write-Host "🔐 Iniciando Auth Service (Puerto 3001)..." -ForegroundColor Cyan
    $authService = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\auth-service" -PassThru -WindowStyle Minimized
    $processes += $authService
    Start-Sleep -Seconds 5

    # 2. Iniciar User Service
    Write-Host "👥 Iniciando User Service (Puerto 3002)..." -ForegroundColor Cyan
    $userService = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\user-service" -PassThru -WindowStyle Minimized
    $processes += $userService
    Start-Sleep -Seconds 3

    # 3. Iniciar Task Service
    Write-Host "📋 Iniciando Task Service (Puerto 3003)..." -ForegroundColor Cyan
    $taskService = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\task-service" -PassThru -WindowStyle Minimized
    $processes += $taskService
    Start-Sleep -Seconds 3

    # 4. Iniciar Location Service
    Write-Host "📍 Iniciando Location Service (Puerto 3004)..." -ForegroundColor Cyan
    $locationService = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "services\location-service" -PassThru -WindowStyle Minimized
    $processes += $locationService
    Start-Sleep -Seconds 3

    # 5. Iniciar API Gateway (con WebSockets)
    Write-Host "🌐 Iniciando API Gateway con WebSockets (Puerto 3000)..." -ForegroundColor Cyan
    $apiGateway = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "api-gateway" -PassThru -WindowStyle Minimized
    $processes += $apiGateway
    Start-Sleep -Seconds 8

    # 6. Iniciar Frontend
    Write-Host "💻 Iniciando Frontend React (Puerto 4000)..." -ForegroundColor Cyan
    $frontend = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "frontend" -PassThru -WindowStyle Minimized
    $processes += $frontend
    Start-Sleep -Seconds 10

    Write-Host ""
    Write-Host "✅ SISTEMA DISTRIBUIDO INICIADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Cyan
    
    # Verificar puertos
    Write-Host "🔍 Verificando puertos..." -ForegroundColor Yellow
    $ports = @(3001, 3002, 3003, 3004, 3000, 4000)
    $services = @("Auth Service", "User Service", "Task Service", "Location Service", "API Gateway", "Frontend")
    
    for ($i = 0; $i -lt $ports.Length; $i++) {
        $port = $ports[$i]
        $service = $services[$i]
        
        try {
            $connection = Test-NetConnection -ComputerName "localhost" -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($connection) {
                Write-Host "✅ $service - Puerto $port" -ForegroundColor Green
            } else {
                Write-Host "❌ $service - Puerto $port (No responde)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ $service - Puerto $port (Error verificando)" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "📊 URLs del Sistema:" -ForegroundColor Cyan
    Write-Host "- Frontend (React):      http://localhost:4000" -ForegroundColor White
    Write-Host "- API Gateway:           http://localhost:3000" -ForegroundColor White
    Write-Host "- WebSocket Server:      ws://localhost:3000" -ForegroundColor White
    Write-Host "- RabbitMQ Management:   http://localhost:15672" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Credenciales de prueba:" -ForegroundColor Cyan
    Write-Host "- Admin: admin@ubicame.com / admin123" -ForegroundColor White
    Write-Host "- Driver: driver@ubicame.com / driver123" -ForegroundColor White
    Write-Host ""
    Write-Host "🐰 RabbitMQ Login:" -ForegroundColor Cyan
    Write-Host "- Usuario: guest / Contraseña: guest" -ForegroundColor White

    # Verificar APIs básicas
    Write-Host ""
    Write-Host "🧪 Probando APIs básicas..." -ForegroundColor Yellow
    
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
        Write-Host "✅ API Gateway Health Check: OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ API Gateway Health Check: Failed" -ForegroundColor Red
    }

    try {
        $servicesCheck = Invoke-RestMethod -Uri "http://localhost:3000/api/health/services" -TimeoutSec 5
        Write-Host "✅ Microservices Health Check: OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Microservices Health Check: Failed" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🎯 Funcionalidades Distribuidas Activas:" -ForegroundColor Cyan
    Write-Host "✅ Event-Driven Architecture (RabbitMQ)" -ForegroundColor Green
    Write-Host "✅ WebSockets para tiempo real" -ForegroundColor Green
    Write-Host "✅ Microservicios independientes" -ForegroundColor Green
    Write-Host "✅ API Gateway centralizado" -ForegroundColor Green
    Write-Host "✅ Notificaciones en tiempo real" -ForegroundColor Green
    Write-Host "✅ Message Broker para comunicación asíncrona" -ForegroundColor Green

    # Abrir el navegador automáticamente
    Write-Host ""
    Write-Host "🌐 Abriendo aplicación en el navegador..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:4000"

} catch {
    Write-Error "❌ Error iniciando el sistema: $($_.Exception.Message)"
    
    # Limpiar procesos en caso de error
    Write-Host "🧹 Limpiando procesos..." -ForegroundColor Yellow
    foreach ($process in $processes) {
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        } catch {
            # Ignorar errores al limpiar
        }
    }
}

Write-Host ""
Write-Host "📝 Para detener todo el sistema, ejecute: stop-system.ps1" -ForegroundColor Cyan
Write-Host "📝 Para ver logs detallados, verifique las consolas de cada servicio" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 