# 🚀 Deployment en Railway - UbicaMe Backend

## 📋 Resumen del Deployment

Railway es perfecto para nuestro sistema de microservicios. Vamos a deployar:

1. **API Gateway** (Puerto 3000)
2. **Auth Service** (Puerto 3001)
3. **User Service** (Puerto 3002)
4. **Task Service** (Puerto 3003)
5. **Location Service** (Puerto 3004)
6. **PostgreSQL Database**
7. **RabbitMQ** (CloudAMQP)

## 🏗️ Arquitectura de Deployment

```
Frontend (Vercel) → API Gateway (Railway) → Microservicios (Railway)
                         ↓
                  RabbitMQ (CloudAMQP)
                         ↓
                PostgreSQL (Railway)
```

## 📦 Pre-requisitos

1. **Cuenta en Railway**: [railway.app](https://railway.app)
2. **Cuenta en CloudAMQP**: [cloudamqp.com](https://cloudamqp.com) (gratis)
3. **Repositorio en GitHub** con tu código

## 🚀 Paso a Paso: Deployment

### Paso 1: Configurar RabbitMQ (CloudAMQP)

1. **Crear cuenta en CloudAMQP**
2. **Crear nueva instancia**: Plan "Little Lemur" (gratuito)
3. **Copiar URL de conexión**: `amqps://username:password@host/vhost`

### Paso 2: Crear Proyecto en Railway

1. **Ir a Railway** → New Project
2. **Deploy from GitHub repo** → Seleccionar tu repositorio
3. **Crear 5 servicios separados**:

#### A. PostgreSQL Database

1. **Add service** → **Database** → **PostgreSQL**
2. **Nombre**: `ubicame-database`
3. **Copiar variables** de conexión generadas

#### B. API Gateway

1. **Add service** → **GitHub Repo** 
2. **Root Directory**: `api-gateway/`
3. **Nombre**: `api-gateway`

#### C. Auth Service

1. **Add service** → **GitHub Repo**
2. **Root Directory**: `services/auth-service/`
3. **Nombre**: `auth-service`

#### D. User Service

1. **Add service** → **GitHub Repo**
2. **Root Directory**: `services/user-service/`
3. **Nombre**: `user-service`

#### E. Task Service

1. **Add service** → **GitHub Repo**
2. **Root Directory**: `services/task-service/`
3. **Nombre**: `task-service`

#### F. Location Service

1. **Add service** → **GitHub Repo**
2. **Root Directory**: `services/location-service/`
3. **Nombre**: `location-service`

### Paso 3: Configurar Variables de Entorno

#### API Gateway Variables

```bash
# Básicas
NODE_ENV=production
GATEWAY_PORT=3000
JWT_SECRET=tu-super-secreto-jwt-key-aqui

# Frontend
FRONTEND_URL=https://ubica-me-v1.vercel.app

# Microservicios (Railway proporcionará estas URLs)
AUTH_SERVICE_URL=https://auth-service-production-xxxx.up.railway.app
USER_SERVICE_URL=https://user-service-production-xxxx.up.railway.app
TASK_SERVICE_URL=https://task-service-production-xxxx.up.railway.app
LOCATION_SERVICE_URL=https://location-service-production-xxxx.up.railway.app

# RabbitMQ (de CloudAMQP)
CLOUDAMQP_URL=amqps://username:password@host/vhost
RABBITMQ_URL=amqps://username:password@host/vhost

# Identificación
SERVICE_NAME=api-gateway
```

#### Auth Service Variables

```bash
# Básicas
NODE_ENV=production
AUTH_SERVICE_PORT=3001
JWT_SECRET=tu-super-secreto-jwt-key-aqui

# Base de datos (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@host:port/railway
PGHOST=host
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=password

# RabbitMQ
CLOUDAMQP_URL=amqps://username:password@host/vhost
RABBITMQ_URL=amqps://username:password@host/vhost

# Identificación
SERVICE_NAME=auth-service
```

#### User Service Variables

```bash
# Básicas
NODE_ENV=production
USER_SERVICE_PORT=3002
JWT_SECRET=tu-super-secreto-jwt-key-aqui

# Base de datos
DATABASE_URL=postgresql://postgres:password@host:port/railway
PGHOST=host
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=password

# RabbitMQ
CLOUDAMQP_URL=amqps://username:password@host/vhost
RABBITMQ_URL=amqps://username:password@host/vhost

# Identificación
SERVICE_NAME=user-service
```

#### Task Service Variables

```bash
# Básicas
NODE_ENV=production
TASK_SERVICE_PORT=3003
JWT_SECRET=tu-super-secreto-jwt-key-aqui

# Base de datos
DATABASE_URL=postgresql://postgres:password@host:port/railway
PGHOST=host
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=password

# RabbitMQ
CLOUDAMQP_URL=amqps://username:password@host/vhost
RABBITMQ_URL=amqps://username:password@host/vhost

# Identificación
SERVICE_NAME=task-service
```

#### Location Service Variables

```bash
# Básicas
NODE_ENV=production
LOCATION_SERVICE_PORT=3004
JWT_SECRET=tu-super-secreto-jwt-key-aqui

# Base de datos
DATABASE_URL=postgresql://postgres:password@host:port/railway
PGHOST=host
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=password

# RabbitMQ
CLOUDAMQP_URL=amqps://username:password@host/vhost
RABBITMQ_URL=amqps://username:password@host/vhost

# Identificación
SERVICE_NAME=location-service
```

### Paso 4: Orden de Deployment

**IMPORTANTE**: Deployar en este orden específico:

1. ✅ **PostgreSQL Database** (ya está)
2. ✅ **Auth Service** (primero)
3. ✅ **User Service**
4. ✅ **Task Service**
5. ✅ **Location Service**
6. ✅ **API Gateway** (último)

### Paso 5: Obtener URLs de Railway

Después del deployment, Railway te dará URLs como:

```
https://auth-service-production-xxxx.up.railway.app
https://user-service-production-xxxx.up.railway.app
https://task-service-production-xxxx.up.railway.app
https://location-service-production-xxxx.up.railway.app
https://api-gateway-production-xxxx.up.railway.app
```

### Paso 6: Actualizar Variables del API Gateway

**CRÍTICO**: Actualizar las URLs de microservicios en el API Gateway:

```bash
AUTH_SERVICE_URL=https://auth-service-production-xxxx.up.railway.app
USER_SERVICE_URL=https://user-service-production-xxxx.up.railway.app
TASK_SERVICE_URL=https://task-service-production-xxxx.up.railway.app
LOCATION_SERVICE_URL=https://location-service-production-xxxx.up.railway.app
```

### Paso 7: Actualizar Frontend en Vercel

En Vercel, actualizar la variable:

```bash
REACT_APP_API_URL=https://api-gateway-production-xxxx.up.railway.app
REACT_APP_DEMO_MODE=false
```

Y hacer **Redeploy**.

## 🧪 Verificación del Deployment

### 1. Health Checks

Verificar que cada servicio responda:

```bash
# API Gateway
GET https://api-gateway-production-xxxx.up.railway.app/health

# Microservicios
GET https://auth-service-production-xxxx.up.railway.app/health
GET https://user-service-production-xxxx.up.railway.app/health
GET https://task-service-production-xxxx.up.railway.app/health
GET https://location-service-production-xxxx.up.railway.app/health

# Estado de servicios
GET https://api-gateway-production-xxxx.up.railway.app/api/health/services
```

### 2. Verificar Conexiones

- ✅ **Base de datos**: Servicios pueden conectar a PostgreSQL
- ✅ **RabbitMQ**: EventBus conectado
- ✅ **CORS**: Frontend puede hacer requests
- ✅ **JWT**: Autenticación funcionando

## 🔧 Configuración Post-Deployment

### 1. Inicializar Base de Datos

Conectar a PostgreSQL y crear tablas iniciales:

```sql
-- Crear usuarios de prueba
-- Crear tablas necesarias
-- Insertar datos iniciales
```

### 2. Verificar Logs

En Railway, revisar logs de cada servicio:

- ✅ Conexión a base de datos exitosa
- ✅ Conexión a RabbitMQ exitosa
- ✅ Servicios iniciados correctamente

### 3. Probar Endpoints

Desde el frontend:

- ✅ Login funcional
- ✅ Dashboards cargan datos
- ✅ WebSockets funcionando
- ✅ Notificaciones en tiempo real

## 📊 Monitoreo y Logs

### Railway Dashboard

- **Metrics**: CPU, Memory, Network
- **Logs**: Real-time logs de cada servicio
- **Deployments**: Historial de deployments

### Endpoints de Monitoreo

```bash
# Status general
GET /health

# Status detallado de servicios
GET /api/health/services

# Métricas específicas (si se implementan)
GET /api/metrics
```

## 🚨 Troubleshooting

### Errores Comunes

1. **Service Unavailable (503)**
   - Verificar que el microservicio esté deployado
   - Revisar variables de entorno

2. **CORS Errors**
   - Verificar FRONTEND_URL en API Gateway
   - Redeploy API Gateway

3. **Database Connection Error**
   - Verificar variables DATABASE_URL
   - Verificar que PostgreSQL esté activo

4. **RabbitMQ Connection Error**
   - Verificar CLOUDAMQP_URL
   - Verificar que CloudAMQP esté activo

### Comandos Útiles

```bash
# Ver logs en Railway
railway logs

# Redeploy servicio
railway redeploy

# Ver variables de entorno
railway variables

# Conectar a base de datos
railway connect postgres
```

## 💰 Costos Estimados

- **Railway**: ~$5-10/mes (después del free tier)
- **CloudAMQP**: Gratis (plan Little Lemur)
- **Vercel**: Gratis

## 🔄 Actualizaciones

Para actualizar el código:

1. **Push a GitHub**
2. **Railway auto-deploy** (si está configurado)
3. **Verificar health checks**
4. **Probar funcionalidad**

---

## 📋 Checklist Final

- [ ] CloudAMQP configurado
- [ ] PostgreSQL creado en Railway
- [ ] 5 servicios deployados en Railway
- [ ] Variables de entorno configuradas
- [ ] URLs actualizadas entre servicios
- [ ] Frontend conectado al API Gateway
- [ ] Health checks exitosos
- [ ] Login funcionando end-to-end
- [ ] WebSockets operativos
- [ ] Monitoreo configurado

**¡Tu sistema distribuido estará completamente operativo!** 🎉 