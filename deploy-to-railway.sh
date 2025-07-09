#!/bin/bash

# 🚀 Script de Deployment Automatizado para Railway - UbicaMe
# Asegurate de tener Railway CLI instalado: npm install -g @railway/cli

echo "🚀 Iniciando deployment en Railway..."

# Verificar que Railway CLI esté instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado. Instalando..."
    npm install -g @railway/cli
fi

# Login a Railway (si no está logueado)
echo "🔐 Verificando login en Railway..."
railway login

# Crear nuevo proyecto
echo "📦 Creando proyecto en Railway..."
railway project new

PROJECT_ID=$(railway status --json | jq -r '.project.id')
echo "📋 ID del proyecto: $PROJECT_ID"

# Función para deployar un servicio
deploy_service() {
    local service_name=$1
    local service_path=$2
    
    echo "🚀 Deploying $service_name..."
    
    # Crear servicio en Railway
    railway service create $service_name
    
    # Cambiar al directorio del servicio
    cd $service_path
    
    # Deployar
    railway up --service $service_name
    
    # Volver al directorio raíz
    cd -
    
    echo "✅ $service_name deployado"
}

# Deployar servicios en orden
echo "📋 Comenzando deployment de servicios..."

# 1. Auth Service (primero)
deploy_service "auth-service" "services/auth-service"

# 2. User Service
deploy_service "user-service" "services/user-service"

# 3. Task Service
deploy_service "task-service" "services/task-service"

# 4. Location Service
deploy_service "location-service" "services/location-service"

# 5. API Gateway (último)
deploy_service "api-gateway" "api-gateway"

echo "🎉 Deployment completado!"
echo "📋 Próximos pasos:"
echo "1. Configurar variables de entorno en Railway dashboard"
echo "2. Configurar PostgreSQL database"
echo "3. Configurar CloudAMQP"
echo "4. Actualizar URLs entre servicios"
echo "5. Actualizar frontend en Vercel"

echo "🔗 Railway Dashboard: https://railway.app/dashboard" 