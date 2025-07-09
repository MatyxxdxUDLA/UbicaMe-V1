# 🚀 Railway Deployment - Guía Rápida

## ⚡ Deployment en 15 Minutos

### Paso 1: Pre-requisitos (2 min)

1. **Cuenta en Railway**: [railway.app](https://railway.app) - Gratis
2. **Cuenta en CloudAMQP**: [cloudamqp.com](https://cloudamqp.com) - Gratis
3. **Tu repo en GitHub** - Debe estar público o conectado

### Paso 2: CloudAMQP (3 min)

1. **Crear cuenta** en CloudAMQP
2. **New Instance** → "Little Lemur" (gratis)
3. **Copiar URL**: `amqps://user:pass@host/vhost`

### Paso 3: Railway Setup (5 min)

1. **Ir a Railway** → "New Project"
2. **"Deploy from GitHub repo"** → Seleccionar tu repo
3. **Agregar PostgreSQL**: "Add Service" → "Database" → "PostgreSQL"

### Paso 4: Crear 5 Servicios (3 min)

Para cada servicio, hacer "Add Service" → "GitHub Repo":

| Servicio | Root Directory |
|----------|----------------|
| `auth-service` | `services/auth-service/` |
| `user-service` | `services/user-service/` |
| `task-service` | `services/task-service/` |
| `location-service` | `services/location-service/` |
| `api-gateway` | `api-gateway/` |

### Paso 5: Variables de Entorno (2 min)

**Copiar estas variables en TODOS los servicios:**

```bash
# Básicas
NODE_ENV=production
JWT_SECRET=mi-super-secreto-jwt-2024

# RabbitMQ (pegar tu URL de CloudAMQP)
CLOUDAMQP_URL=amqps://tu-url-de-cloudamqp
RABBITMQ_URL=amqps://tu-url-de-cloudamqp
```

**Variables específicas por servicio:**

#### Auth Service
```bash
AUTH_SERVICE_PORT=3001
SERVICE_NAME=auth-service
```

#### User Service
```bash
USER_SERVICE_PORT=3002
SERVICE_NAME=user-service
```

#### Task Service
```bash
TASK_SERVICE_PORT=3003
SERVICE_NAME=task-service
```

#### Location Service
```bash
LOCATION_SERVICE_PORT=3004
SERVICE_NAME=location-service
```

#### API Gateway (MÁS VARIABLES)
```bash
GATEWAY_PORT=3000
SERVICE_NAME=api-gateway
FRONTEND_URL=https://ubica-me-v1.vercel.app

# URLs de servicios (Railway te las dará después)
AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
USER_SERVICE_URL=https://user-service-production.up.railway.app
TASK_SERVICE_URL=https://task-service-production.up.railway.app
LOCATION_SERVICE_URL=https://location-service-production.up.railway.app
```

**PostgreSQL**: Railway conecta automáticamente las variables `DATABASE_URL`, `PGHOST`, etc.

### Paso 6: Obtener URLs Reales

Después del deployment, Railway te dará URLs reales. **Actualizarlas en API Gateway:**

1. Ir a **API Gateway** → **Variables**
2. **Actualizar** con las URLs reales:
   ```bash
   AUTH_SERVICE_URL=https://auth-service-production-xxxx.up.railway.app
   USER_SERVICE_URL=https://user-service-production-xxxx.up.railway.app
   # ... etc
   ```

### Paso 7: Conectar Frontend

En **Vercel** → **Settings** → **Environment Variables**:

```bash
REACT_APP_API_URL=https://api-gateway-production-xxxx.up.railway.app
REACT_APP_DEMO_MODE=false
```

**Redeploy** en Vercel.

## ✅ Verificar que Funciona

1. **Health checks**: 
   - `https://api-gateway-xxx.up.railway.app/health`
   - `https://api-gateway-xxx.up.railway.app/api/health/services`

2. **Frontend**: Login debería funcionar con:
   - Admin: `admin@ubicame.com` / `admin123`
   - Driver: `driver@ubicame.com` / `driver123`

## 🚨 Si Algo Falla

### Error 503 "Service Unavailable"
- Verificar que todos los servicios estén deployados
- Revisar logs en Railway dashboard

### Error CORS
- Verificar `FRONTEND_URL` en API Gateway
- Redeploy API Gateway

### Error Base de Datos
- Verificar que PostgreSQL esté activo
- Railway conecta automáticamente `DATABASE_URL`

## 💡 Tips

- **Logs**: Railway dashboard → servicio → "Logs"
- **Redeploy**: Railway dashboard → servicio → "Deploy" → "Redeploy"
- **Variables**: Se actualizan en tiempo real
- **Dominios**: Railway te da dominios automáticos

## 📊 Resultado Final

```
Frontend (Vercel) ✅
    ↓
API Gateway (Railway) ✅
    ↓
Auth/User/Task/Location Services (Railway) ✅
    ↓
PostgreSQL (Railway) ✅
    ↓
RabbitMQ (CloudAMQP) ✅
```

**¡Sistema completamente funcional en la nube!** 🎉 