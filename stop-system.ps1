# Script para detener el sistema distribuido UbicaMe

Write-Host "🛑 Deteniendo Sistema Distribuido UbicaMe..." -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Yellow

# Detener todos los procesos de Node.js
Write-Host "🔄 Deteniendo todos los servicios Node.js..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "✅ Servicios Node.js detenidos: $($nodeProcesses.Count) procesos" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No hay servicios Node.js ejecutándose" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error deteniendo servicios Node.js: $($_.Exception.Message)" -ForegroundColor Red
}

# Opcional: Detener RabbitMQ si se desea
Write-Host ""
$stopRabbitMQ = Read-Host "¿Desea detener RabbitMQ también? (y/N)"
if ($stopRabbitMQ -eq "y" -or $stopRabbitMQ -eq "Y") {
    Write-Host "🐰 Deteniendo RabbitMQ..." -ForegroundColor Yellow
    try {
        Stop-Service -Name "RabbitMQ" -Force -ErrorAction SilentlyContinue
        Write-Host "✅ RabbitMQ detenido" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error deteniendo RabbitMQ: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  RabbitMQ continúa ejecutándose" -ForegroundColor Cyan
}

# Verificar puertos liberados
Write-Host ""
Write-Host "🔍 Verificando puertos liberados..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 3003, 3004, 4000)
$services = @("API Gateway", "Auth Service", "User Service", "Task Service", "Location Service", "Frontend")

for ($i = 0; $i -lt $ports.Length; $i++) {
    $port = $ports[$i]
    $service = $services[$i]
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            Write-Host "⚠️  $service - Puerto $port (AÚN EJECUTÁNDOSE)" -ForegroundColor Yellow
        } else {
            Write-Host "✅ $service - Puerto $port (LIBERADO)" -ForegroundColor Green
        }
    } catch {
        Write-Host "✅ $service - Puerto $port (LIBERADO)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Sistema detenido exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Para reiniciar el sistema, ejecute: start-distributed-system.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 