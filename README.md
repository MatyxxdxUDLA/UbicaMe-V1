# UbicaMe - Sistema de Gestión de Flotas de Transporte

Sistema distribuido de gestión de flotas de transporte en tiempo real desarrollado para proyecto académico.

## 🚀 Tecnologías Utilizadas

- **Backend**: Node.js + Express
- **Base de datos**: SQLite
- **Frontend**: React
- **Mapas**: OpenStreetMap con Leaflet
- **Comunicación**: HTTP/REST

## 📁 Estructura del Proyecto

```
UbicaMe V1/
├── backend/          # Servidor Node.js + Express
├── frontend/         # Aplicación React
├── package.json      # Configuración principal
└── README.md         # Documentación
```

## 🏗️ Funcionalidades

### Administrador
- ✅ Gestión de usuarios (admin y conductores)
- ✅ Gestión de tareas
- ✅ Gestión de rutas
- ✅ Visualización en tiempo real de ubicación de conductores
- ✅ Dashboard con métricas

### Conductores
- ✅ Consulta de tareas asignadas
- ✅ Actualización de ubicación cada 10 segundos
- ✅ Actualización de estado de tareas

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
npm run install-all
```

### 2. Ejecutar configuración automática
```bash
# Windows PowerShell
.\start.ps1

# O manualmente
npm run dev
```

### 3. Ejecutar el proyecto

#### Desarrollo (ambos servicios)
```bash
npm run dev
```

#### Individual
```bash
# Solo backend (puerto 3001)
npm run dev-backend

# Solo frontend (puerto 3000)
npm run start-frontend
```

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 👥 Usuarios por Defecto

### Administrador
- **Email**: admin@ubicame.com
- **Password**: admin123

### Conductor de Prueba
- **Email**: conductor1@ubicame.com
- **Password**: conductor123

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `GET /api/tasks/driver/:id` - Tareas de conductor

### Ubicaciones
- `POST /api/locations` - Actualizar ubicación
- `GET /api/locations/drivers` - Ubicaciones de conductores

## 🔄 Flujo de Trabajo

1. **Administrador** crea tareas y asigna a conductores
2. **Conductor** inicia sesión y ve sus tareas asignadas
3. **Sistema** actualiza ubicación del conductor cada 10 segundos
4. **Administrador** visualiza en tiempo real la ubicación de todos los conductores
5. **Conductor** actualiza estado de tareas (pendiente → en progreso → completada)

## 🗺️ Mapas y Ubicación

- Utiliza **OpenStreetMap** (gratuito, sin necesidad de API keys)
- Librería **Leaflet** para interactividad
- Marcadores personalizados para conductores y tareas
- Actualización en tiempo real de posiciones
- Vista adaptativa según ubicaciones activas

## 🛠️ Desarrollo

El proyecto está configurado para desarrollo académico con:
- Base de datos SQLite (archivo local)
- Datos de prueba preconfigurados
- Interfaz intuitiva y responsive
- Actualización en tiempo real
- Mapas gratuitos sin limitaciones

## 📝 Características Técnicas

- **Mapas**: OpenStreetMap + Leaflet (sin costo, sin límites)
- **Base de datos**: SQLite para simplicidad
- **Autenticación**: JWT con expiración configurable
- **Tiempo real**: Polling cada 10 segundos
- **Responsive**: Adaptado para móviles y desktop
- **Seguridad**: Rate limiting y validación de datos

## 🔧 Ventajas de OpenStreetMap

- ✅ **Completamente gratuito**
- ✅ **Sin límites de uso**
- ✅ **No requiere API keys**
- ✅ **Datos actualizados por la comunidad**
- ✅ **Excelente cobertura global**
- ✅ **Múltiples estilos de mapa disponibles**

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles iOS/Android
- ✅ Tablets y desktop
- ✅ Responsive design

¡El sistema está listo para usar sin configuración adicional de mapas! 🎉 