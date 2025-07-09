# Solución de Errores de Vercel - UbicaMe

## 🚨 Errores Encontrados

### 1. CORS Error
```
Access to XMLHttpRequest at 'https://ubica-me-v1.vercel.app/api/auth/login' from origin 'https://ubica-me-v1-ctcjpmsds-matias-robayos-projects.vercel.app' has been blocked by CORS policy
```

### 2. Backend no disponible
```
Failed to load resource: net::ERR_FAILED
```

### 3. Manifest.json 401
```
Manifest fetch failed, code 401
```

## 🔧 Soluciones Paso a Paso

### Paso 1: Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```
REACT_APP_API_URL=http://localhost:3000
GENERATE_SOURCEMAP=false
NODE_ENV=production
```

**⚠️ IMPORTANTE**: Cambia `http://localhost:3000` por la URL real de tu backend cuando esté deployado.

### Paso 2: Redeploy en Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en "Deployments"
3. Busca el último deployment
4. Haz clic en los 3 puntos → "Redeploy"

### Paso 3: Configurar Backend (URGENTE)

Tu frontend está tratando de conectarse a un backend que no existe. Tienes 2 opciones:

#### Opción A: Modo Solo Frontend (Temporalmente)
Modificar el código para que no haga peticiones al backend:

```javascript
// En frontend/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Agregar modo demo
const DEMO_MODE = !process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost');
```

#### Opción B: Deploy Backend (Recomendado)
Deployar el backend en Railway, Heroku o DigitalOcean:

1. **API Gateway**: Debe estar en `https://tu-api-gateway.herokuapp.com`
2. **Microservicios**: Cada uno en su propio servicio
3. **RabbitMQ**: CloudAMQP o RabbitMQ Cloud

### Paso 4: Configurar CORS en Backend

En tu API Gateway, asegúrate de tener:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:4000',
    'https://ubica-me-v1-ctcjpmsds-matias-robayos-projects.vercel.app',
    'https://ubica-me-v1.vercel.app'
  ],
  credentials: true
}));
```

### Paso 5: Verificar Configuración

1. **Vercel Dashboard**: Variables de entorno correctas
2. **Backend**: Deployado y accesible
3. **CORS**: Configurado para aceptar tu dominio de Vercel
4. **API URL**: Apuntando al backend correcto

## 🛠️ Solución Temporal (Solo Frontend)

Para que funcione mientras deploys el backend:

### 1. Crear archivo .env en Vercel

En Environment Variables:
```
REACT_APP_API_URL=
REACT_APP_DEMO_MODE=true
```

### 2. Modificar AuthContext

Agregar modo demo que simule login sin backend.

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] Backend deployado y accesible
- [ ] CORS configurado correctamente
- [ ] API_URL apunta al backend correcto
- [ ] Redeploy realizado después de cambios
- [ ] Certificados SSL configurados
- [ ] WebSockets configurados (si aplica)

## 🔗 Próximos Pasos

1. **Inmediato**: Configurar variables de entorno y redeploy
2. **Corto plazo**: Deploy backend en Railway/Heroku
3. **Mediano plazo**: Configurar base de datos y RabbitMQ
4. **Largo plazo**: Optimizar para producción

## 🆘 Si Todo Falla

Contacta con los logs específicos de:
- Vercel Build Logs
- Vercel Function Logs
- Browser Console completo 