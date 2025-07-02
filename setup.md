# 🚀 Guía de Instalación - UbicaMe Fleet Management

## ✅ Pre-requisitos

- Node.js (versión 16 o superior)
- npm (viene con Node.js)

## 🔧 Instalación Paso a Paso

### 1. Instalar dependencias

```bash
# Instalar dependencia principal
npm install

# Instalar dependencias del backend
npm run install-backend

# Instalar dependencias del frontend
npm run install-frontend
```

### 2. Configurar variables de entorno

#### Backend (.env en /backend/)
Crear archivo `backend/.env`:
```
PORT=3001
JWT_SECRET=ubicame_jwt_secret_key_academico_2024
DB_PATH=./database/fleet.db
NODE_ENV=development
```

#### Frontend (.env en /frontend/) - OPCIONAL
Crear archivo `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3001
```

### 3. Inicializar base de datos

```bash
cd backend
npm run init-db
cd ..
```

### 4. Ejecutar el proyecto

#### Opción 1: Script automático (recomendado)
```bash
.\start.ps1
```

#### Opción 2: Ambos servicios juntos
```bash
npm run dev
```

#### Opción 3: Servicios por separado
Terminal 1 (Backend):
```bash
npm run dev-backend
```

Terminal 2 (Frontend):
```bash
npm run start-frontend
```

## 🌐 Acceso al Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 👥 Usuarios de Prueba

### Administrador
- **Email**: admin@ubicame.com
- **Password**: admin123

### Conductores
- **Email**: conductor1@ubicame.com
- **Password**: conductor123

- **Email**: conductor2@ubicame.com
- **Password**: conductor123

- **Email**: conductor3@ubicame.com
- **Password**: conductor123

## 🔄 Funcionalidades

### Panel de Administrador
- ✅ Dashboard con estadísticas
- ✅ Gestión de tareas (crear, editar, eliminar)
- ✅ Gestión de usuarios
- ✅ Mapa en tiempo real con ubicaciones de conductores
- ✅ Visualización de rutas y tareas

### Panel de Conductor
- ✅ Ver tareas asignadas
- ✅ Actualizar estado de tareas
- ✅ Envío automático de ubicación cada 10 segundos
- ✅ Dashboard personal

## 🗺️ Sistema de Mapas

### OpenStreetMap + Leaflet
- ✅ **Completamente gratuito**
- ✅ **Sin configuración adicional**
- ✅ **No requiere API keys**
- ✅ **Sin límites de uso**
- ✅ **Datos actualizados por la comunidad**

### Características del Mapa
- 📍 Marcadores personalizados para conductores
- 🎯 Marcadores diferenciados para inicio/destino de tareas
- 🔄 Actualización automática de posiciones
- 📱 Compatible con dispositivos móviles
- 🎨 Colores indicativos de estado (trabajando/disponible)

## 🛠️ Solución de Problemas

### Error de permisos de ubicación
Si no funciona el tracking de ubicación:
1. Permitir acceso a ubicación en el navegador
2. Usar HTTPS en producción (requerido para geolocalización)

### Error de conexión API
Si el frontend no conecta con el backend:
1. Verificar que el backend esté corriendo en puerto 3001
2. Comprobar la configuración de REACT_APP_API_URL

### Base de datos
Si hay problemas con la base de datos:
```bash
cd backend
rm -rf database/
npm run init-db
```

### Problemas con el mapa
Si el mapa no carga correctamente:
1. Verificar conexión a internet (se necesita para cargar tiles de OpenStreetMap)
2. Comprobar que no hay bloqueadores de contenido
3. Verificar en la consola del navegador si hay errores de Leaflet

## 📝 Notas de Desarrollo

- La aplicación usa SQLite para facilidad de desarrollo
- Las ubicaciones se actualizan cada 10 segundos
- El sistema es responsive y funciona en dispositivos móviles
- Incluye datos de prueba para Buenos Aires, Argentina
- Los mapas funcionan offline una vez cargados los tiles

## 🔐 Seguridad

- Autenticación JWT con expiración de 24 horas
- Middleware de seguridad con Helmet
- Rate limiting para protección contra ataques
- Validación de datos en backend y frontend

## 📊 Estructura de Base de Datos

- **users**: Usuarios (admin y conductores)
- **tasks**: Tareas asignadas a conductores
- **locations**: Historial de ubicaciones
- **routes**: Información de rutas (futuro uso)

## 🚀 Ventajas del Nuevo Sistema

### Sin Dependencias Externas
- ❌ No más tokens de API
- ❌ No más límites de uso
- ❌ No más configuración compleja
- ✅ Sistema completamente autónomo

### Mejor Experiencia
- ✅ Instalación más rápida
- ✅ Menos puntos de fallo
- ✅ Mejor rendimiento
- ✅ Mayor privacidad de datos

¡El sistema está listo para usar inmediatamente! 🎉

**No se necesita configuración adicional de mapas** - simplemente ejecuta `npm run dev` y comienza a usar el sistema. 