# Deployment en Vercel - UbicaMe V1

## Configuración para Vercel

### 1. Framework y Configuración

- **Framework**: Create React App
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 2. Variables de Entorno Requeridas

En el dashboard de Vercel, configura las siguientes variables:

| Key | Value | Descripción |
|-----|-------|-------------|
| `REACT_APP_API_URL` | `https://tu-api-gateway.vercel.app` | URL de tu API Gateway en producción |
| `GENERATE_SOURCEMAP` | `false` | Desactiva source maps para producción |
| `NODE_ENV` | `production` | Ambiente de producción |

### 3. Configuración de Proyecto

1. **Team**: Matías Robayo's projects
2. **Project Name**: `ubica-me-v1`
3. **Framework Preset**: Create React App
4. **Root Directory**: `frontend/`

### 4. Configuración Avanzada

- **Build and Output Settings**:
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Install Command: `npm install`

- **Environment Variables**: Agregar las variables listadas arriba

### 5. Archivos de Configuración

- ✅ `vercel.json` - Configuración de rutas para React Router
- ✅ `frontend/.env.production` - Variables de entorno de producción
- ✅ `frontend/package.json` - Configuración limpia sin proxy

### 6. Verificación Pre-Deployment

```bash
# Verificar que el build funciona localmente
cd frontend
npm run build

# Verificar que los archivos se generaron
ls build/
```

### 7. Deployment Backend

Para el backend (API Gateway y microservicios), necesitarás deployar cada servicio por separado:

- **API Gateway**: Vercel Serverless Functions o Railway
- **Microservicios**: Railway, Heroku, o DigitalOcean
- **RabbitMQ**: CloudAMQP o RabbitMQ Cloud
- **Base de Datos**: PostgreSQL en Supabase, Neon, o Railway

### 8. Configuración Post-Deployment

1. Actualizar `REACT_APP_API_URL` con la URL real del API Gateway
2. Configurar CORS en el backend para la nueva URL de frontend
3. Configurar certificados SSL si es necesario
4. Verificar que las WebSockets funcionen correctamente

### 9. Comandos Útiles

```bash
# Build local para testing
npm run build

# Preview del build
npx serve -s build

# Deploy manual (si usas Vercel CLI)
vercel --prod
```

### 10. Troubleshooting

- **404 en rutas**: Verificar que `vercel.json` esté configurado correctamente
- **API no responde**: Verificar `REACT_APP_API_URL` y CORS
- **WebSocket errors**: Verificar configuración de WebSocket en producción 