# Script para instalar RabbitMQ en Windows
# Ejecutar como administrador

Write-Host "🐰 Instalando RabbitMQ para UbicaMe..." -ForegroundColor Green

# Verificar si está ejecutándose como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Este script debe ejecutarse como Administrador. Reiniciando..."
    Start-Process PowerShell -Verb RunAs "-NoProfile -ExecutionPolicy Bypass -Command `"cd '$pwd'; & '$PSCommandPath';`""
    exit
}

try {
    # Verificar si Chocolatey está instalado
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
        refreshenv
    }

    # Instalar Erlang (requerido por RabbitMQ)
    Write-Host "🔧 Instalando Erlang..." -ForegroundColor Yellow
    choco install erlang -y

    # Instalar RabbitMQ
    Write-Host "🐰 Instalando RabbitMQ..." -ForegroundColor Yellow
    choco install rabbitmq -y

    # Habilitar management plugin
    Write-Host "🔌 Habilitando RabbitMQ Management Plugin..." -ForegroundColor Yellow
    & "C:\Program Files\RabbitMQ Server\rabbitmq_server-*\sbin\rabbitmq-plugins.bat" enable rabbitmq_management

    # Iniciar servicios
    Write-Host "🚀 Iniciando servicio RabbitMQ..." -ForegroundColor Yellow
    Start-Service RabbitMQ

    Write-Host "✅ RabbitMQ instalado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Información importante:" -ForegroundColor Cyan
    Write-Host "- RabbitMQ Server: amqp://localhost:5672" -ForegroundColor White
    Write-Host "- Management UI: http://localhost:15672" -ForegroundColor White
    Write-Host "- Usuario por defecto: guest" -ForegroundColor White
    Write-Host "- Contraseña por defecto: guest" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Para acceder al panel de administración:" -ForegroundColor Cyan
    Write-Host "http://localhost:15672" -ForegroundColor White
    
    # Abrir el navegador automáticamente
    Start-Process "http://localhost:15672"
    
} catch {
    Write-Error "❌ Error instalando RabbitMQ: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "📝 Instalación manual:" -ForegroundColor Yellow
    Write-Host "1. Instala Erlang desde: https://www.erlang.org/downloads" -ForegroundColor White
    Write-Host "2. Instala RabbitMQ desde: https://www.rabbitmq.com/download.html" -ForegroundColor White
    Write-Host "3. Habilita management plugin con:" -ForegroundColor White
    Write-Host "   rabbitmq-plugins enable rabbitmq_management" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 