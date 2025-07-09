# 🚨 Fix Railway Build Error - Exit Code 127

## El Problema

Railway está intentando ejecutar `npm run build` desde la raíz del proyecto, pero nuestros microservicios están en subdirectorios.

**Error**: `process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 127`

## ✅ Solución Paso a Paso

### 1. Verificar Root Directory en Railway

Para **CADA servicio** en Railway:

1. **Ir a Railway Dashboard**
2. **Seleccionar tu proyecto**
3. **Para cada servicio** (auth-service, user-service, etc.):
   - Clic en el servicio
   - **Settings** → **Build**
   - **Root Directory** debe estar configurado así:

| Servicio | Root Directory Correcto |
|----------|------------------------|
| auth-service | `services/auth-service` |
| user-service | `services/user-service` |
| task-service | `services/task-service` |
| location-service | `services/location-service` |
| api-gateway | `api-gateway` |

### 2. Verificar que NO tengas Root Directory en "/"

❌ **Incorrecto**: Root Directory = `/` o vacío  
✅ **Correcto**: Root Directory = `services/auth-service`

### 3. Redeploy Cada Servicio

Después de corregir el Root Directory:

1. **Settings** → **Deployment**
2. **Redeploy**

### 4. Verificar Package.json de Cada Servicio

Cada servicio debe tener estos scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 5. Crear Servicios Separados

Si creaste **UN SOLO servicio** para todo, necesitas crear **5 servicios separados**:

#### ❌ Incorrecto (1 servicio):
```
ubicame-backend (Root: /)
```

#### ✅ Correcto (5 servicios):
```
auth-service (Root: services/auth-service)
user-service (Root: services/user-service)  
task-service (Root: services/task-service)
location-service (Root: services/location-service)
api-gateway (Root: api-gateway)
```

## 🔧 Si Sigue Fallando

### Opción A: Recrear Servicios

1. **Eliminar** servicio problemático
2. **Add Service** → **GitHub Repo**
3. **Configurar Root Directory** correctamente
4. **Deploy**

### Opción B: Verificar Logs

En Railway Dashboard → Servicio → **Logs**:

```bash
# Buscar estos errores:
- "npm: command not found"
- "package.json not found"
- "build script not found"
```

### Opción C: Manual Deploy

Si usas Railway CLI:

```bash
# Para cada servicio
cd services/auth-service
railway login
railway link [project-id]
railway up --service auth-service
```

## 🧪 Verificar la Solución

Después de corregir:

1. **Build debe ser exitoso** ✅
2. **Logs deben mostrar**: `"Auth Service running on port 3001"` ✅
3. **Health check funcional**: `https://auth-service-xxx.up.railway.app/health` ✅

## 📋 Root Directory Cheat Sheet

**Copiar y pegar en Railway:**

```
Auth Service: services/auth-service
User Service: services/user-service
Task Service: services/task-service
Location Service: services/location-service
API Gateway: api-gateway
```

## 🆘 Si Aún No Funciona

1. **Eliminar todos los servicios**
2. **Crear uno por uno** con Root Directory correcto
3. **Verificar que cada package.json** tiene script "start"
4. **Deployar de a uno** para verificar cada build

---

**El error exit code 127 debería desaparecer una vez configurado el Root Directory correctamente! 🚀** 