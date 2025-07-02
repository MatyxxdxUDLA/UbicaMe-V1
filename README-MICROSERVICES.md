# 🏗️ UbicaMe - Arquitectura de Microservicios

## 📋 Descripción

**UbicaMe** ha sido transformado de un sistema monolítico a una **arquitectura de microservicios distribuida** que proporciona mayor escalabilidad, mantenibilidad y tolerancia a fallos.

## 🌐 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                  http://localhost:4000                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   API Gateway                               │
│                 http://localhost:3000                       │
│              (Punto de entrada único)                       │
└──┬──────────────┬──────────────┬──────────────┬─────────────┘
   │              │              │              │
   ▼              ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐
│ Auth    │  │ User    │  │ Task    │  │ Location    │
│Service  │  │Service  │  │Service  │  │ Service     │
│:3001    │  │:3002    │  │:3003    │  │ :3004       │
└─────────┘  └─────────┘  └─────────┘  └─────────────┘
```

## 🔧 Servicios

### 🌐 **API Gateway** (Puerto 3000)
- **Propósito**: Punto de entrada único y enrutamiento
- **Responsabilidades**:
  - Routing a microservicios
  - Autenticación centralizada
  - Rate limiting global
  - Health checking de servicios

### 🔐 **Auth Service** (Puerto 3001)
- **Propósito**: Gestión de autenticación
- **Endpoints**:
  - `POST /api/auth/login` - Iniciar sesión
  - `POST /api/auth/register` - Registro de usuarios
  - `GET /api/auth/verify` - Verificar token

### 👥 **User Service** (Puerto 3002)
- **Propósito**: Gestión de usuarios y conductores
- **Endpoints**:
  - `GET /api/users` - Obtener usuarios
  - `GET /api/users/drivers` - Obtener conductores
  - `PUT /api/users/:id` - Actualizar usuario

### 📋 **Task Service** (Puerto 3003)
- **Propósito**: Gestión de tareas y asignaciones
- **Endpoints**:
  - `GET /api/tasks` - Obtener tareas
  - `POST /api/tasks` - Crear tarea
  - `PUT /api/tasks/:id` - Actualizar tarea
  - `DELETE /api/tasks/:id` - Eliminar tarea

### 📍 **Location Service** (Puerto 3004)
- **Propósito**: Tracking de ubicaciones en tiempo real
- **Endpoints**:
  - `POST /api/locations` - Actualizar ubicación
  - `GET /api/locations/drivers` - Obtener ubicaciones
  - `GET /api/locations/driver/:id/history` - Historial

## 🚀 Inicio Rápido

### **Opción 1: Script Automático (Recomendado)**
```powershell
# Ejecutar el script de setup automático
./start-microservices.ps1
```

### **Opción 2: Manual**
```bash
# 1. Instalar dependencias de todos los servicios
npm run install-all

# 2. Copiar archivos de configuración
copy api-gateway\env.example api-gateway\.env
copy frontend\env.example frontend\.env
copy backend\.env services\auth-service\.env
copy backend\.env services\user-service\.env
copy backend\.env services\task-service\.env
copy backend\.env services\location-service\.env

# 3. Ejecutar todos los microservicios
npm run dev
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo - Microservicios
npm run dev                    # Ejecutar todos los microservicios
npm run dev-gateway           # Solo API Gateway
npm run dev-auth              # Solo Auth Service
npm run dev-user              # Solo User Service
npm run dev-task              # Solo Task Service
npm run dev-location          # Solo Location Service

# Desarrollo - Monolito (versión anterior)
npm run dev-monolith          # Ejecutar versión monolítica

# Instalación
npm run install-all           # Instalar deps de todos los servicios
npm run install-gateway       # Solo API Gateway
npm run install-services      # Solo microservicios

# Setup
npm run setup-microservices   # Setup completo automático
```

## 🏥 Health Checks

Verificar el estado de todos los servicios:

- **API Gateway**: http://localhost:3000/health
- **Servicios**: http://localhost:3000/api/health/services
- **Auth Service**: http://localhost:3001/health
- **User Service**: http://localhost:3002/health
- **Task Service**: http://localhost:3003/health
- **Location Service**: http://localhost:3004/health

## 🌟 Ventajas de la Arquitectura de Microservicios

### ✅ **Escalabilidad**
- Cada servicio puede escalarse independientemente
- Mejor distribución de carga
- Optimización específica por servicio

### ✅ **Tolerancia a Fallos**
- Si un servicio falla, los demás siguen funcionando
- Isolation de errores
- Circuit breaker patterns

### ✅ **Desarrollo Independiente**
- Equipos pueden trabajar en servicios separados
- Deploys independientes
- Tecnologías específicas por servicio

### ✅ **Mantenibilidad**
- Código más modular y enfocado
- Testing más específico
- Debugging más fácil

## 🔄 Comunicación Entre Servicios

### **Síncrona (HTTP)**
- API Gateway → Microservicios
- Cliente → API Gateway

### **Asíncrona (Futura implementación)**
- Message Queues (RabbitMQ/Redis)
- Event-driven architecture
- Pub/Sub patterns

## 🛡️ Seguridad

- **JWT centralizado** en API Gateway
- **Rate limiting** por servicio
- **CORS configurado** para cada servicio
- **Helmet** para seguridad HTTP

## 📊 Monitoreo

### **Logs Centralizados**
Cada servicio incluye logging con prefijo:
- `[GATEWAY]` - API Gateway
- `[AUTH-SERVICE]` - Auth Service
- `[USER-SERVICE]` - User Service
- `[TASK-SERVICE]` - Task Service
- `[LOCATION-SERVICE]` - Location Service

### **Métricas**
- Health checks en todos los servicios
- Rate limiting metrics
- Response time monitoring

## 🔮 Próximas Mejoras

### **Fase 2: Infraestructura Avanzada**
- [ ] Docker containerización
- [ ] Kubernetes orchestration
- [ ] Service mesh (Istio)
- [ ] Distributed tracing

### **Fase 3: Datos Distribuidos**
- [ ] Base de datos por microservicio
- [ ] Event sourcing
- [ ] CQRS pattern
- [ ] Distributed caching

### **Fase 4: Observabilidad**
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] ELK stack logging
- [ ] Jaeger tracing

## 🆚 Comparación: Monolito vs Microservicios

| Aspecto | Monolito | Microservicios |
|---------|----------|----------------|
| **Complejidad inicial** | Baja | Alta |
| **Escalabilidad** | Limitada | Excelente |
| **Tolerancia a fallos** | Baja | Alta |
| **Deployment** | Todo junto | Independiente |
| **Testing** | Integración completa | Aislado por servicio |
| **Monitoring** | Centralizado | Distribuido |

## 🎓 Para Proyecto Académico

Esta arquitectura demuestra conceptos avanzados de sistemas distribuidos:

- ✅ **Microservices Pattern**
- ✅ **API Gateway Pattern** 
- ✅ **Circuit Breaker Pattern**
- ✅ **Service Discovery**
- ✅ **Distributed Authentication**
- ✅ **Health Check Pattern**
- ✅ **Rate Limiting**
- ✅ **CQRS preparado**

## 🐛 Troubleshooting

### **Puerto ocupado**
```bash
# Cerrar todos los procesos Node.js
taskkill /F /IM node.exe

# Verificar puertos
netstat -ano | findstr :3000
```

### **Servicios no responden**
1. Verificar que todos los archivos `.env` existen
2. Confirmar que las dependencias están instaladas
3. Revisar logs de cada servicio
4. Verificar health checks

### **CORS errors**
- Verificar que el frontend apunta al puerto 3000 (API Gateway)
- Confirmar configuración de CORS en cada servicio

---

¡Tu sistema **UbicaMe** es ahora un verdadero sistema distribuido! 🎉 