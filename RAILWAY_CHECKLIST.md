# ✅ Railway Deployment Checklist

## Pre-Deployment

- [ ] **GitHub repo** actualizado con último código
- [ ] **Cuenta Railway** creada ([railway.app](https://railway.app))
- [ ] **Cuenta CloudAMQP** creada ([cloudamqp.com](https://cloudamqp.com))

## CloudAMQP Setup

- [ ] **Instancia creada** (plan "Little Lemur" gratuito)
- [ ] **URL copiada** (`amqps://user:pass@host/vhost`)

## Railway Project Setup

- [ ] **Nuevo proyecto** creado en Railway
- [ ] **Conectado a GitHub** repo
- [ ] **PostgreSQL database** agregada

## Services Deployment

Deploy in order:

- [ ] **Auth Service** (`services/auth-service/`)
- [ ] **User Service** (`services/user-service/`)
- [ ] **Task Service** (`services/task-service/`)
- [ ] **Location Service** (`services/location-service/`)
- [ ] **API Gateway** (`api-gateway/`)

## Environment Variables

### All Services (Common)
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=your-secret-key`
- [ ] `CLOUDAMQP_URL=amqps://...` (from CloudAMQP)
- [ ] `RABBITMQ_URL=amqps://...` (same as CLOUDAMQP_URL)

### Service-Specific
- [ ] Auth: `AUTH_SERVICE_PORT=3001`, `SERVICE_NAME=auth-service`
- [ ] User: `USER_SERVICE_PORT=3002`, `SERVICE_NAME=user-service`
- [ ] Task: `TASK_SERVICE_PORT=3003`, `SERVICE_NAME=task-service`
- [ ] Location: `LOCATION_SERVICE_PORT=3004`, `SERVICE_NAME=location-service`

### API Gateway (Additional)
- [ ] `GATEWAY_PORT=3000`
- [ ] `SERVICE_NAME=api-gateway`
- [ ] `FRONTEND_URL=https://ubica-me-v1.vercel.app`

## Service URLs Update

After deployment, get URLs and update API Gateway:

- [ ] Copy **Auth Service URL** → Update `AUTH_SERVICE_URL` in API Gateway
- [ ] Copy **User Service URL** → Update `USER_SERVICE_URL` in API Gateway
- [ ] Copy **Task Service URL** → Update `TASK_SERVICE_URL` in API Gateway
- [ ] Copy **Location Service URL** → Update `LOCATION_SERVICE_URL` in API Gateway

## Frontend Connection

- [ ] Copy **API Gateway URL**
- [ ] Update Vercel env var: `REACT_APP_API_URL=https://api-gateway-xxx.up.railway.app`
- [ ] Set `REACT_APP_DEMO_MODE=false`
- [ ] **Redeploy** frontend in Vercel

## Verification

- [ ] **API Gateway health**: `https://api-gateway-xxx.up.railway.app/health` ✅
- [ ] **Services health**: `https://api-gateway-xxx.up.railway.app/api/health/services` ✅
- [ ] **Frontend login** works with demo credentials ✅
- [ ] **Dashboard** loads without errors ✅
- [ ] **Database** connected (check logs) ✅
- [ ] **RabbitMQ** connected (check logs) ✅

## Demo Credentials

Test with:
- **Admin**: `admin@ubicame.com` / `admin123`
- **Driver**: `driver@ubicame.com` / `driver123`

## Troubleshooting

If issues occur:
- [ ] Check **Railway logs** for each service
- [ ] Verify **environment variables** are correct
- [ ] Check **PostgreSQL** is active
- [ ] Verify **CloudAMQP** connection
- [ ] Check **CORS** configuration in API Gateway

---

**✅ = Completed | ❌ = Issue | ⏳ = In Progress** 