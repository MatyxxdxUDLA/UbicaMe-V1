const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const database = require('../../backend/config/database');

// Importar sistema de eventos
const eventBus = require('../../shared/eventBus');

// Importar rutas del backend original
const locationRoutes = require('../../backend/routes/locations');

const app = express();
const PORT = process.env.LOCATION_SERVICE_PORT || 3004;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting más alto para ubicaciones (tracking frecuente)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // Más requests para tracking en tiempo real
  message: 'Demasiadas requests al servicio de ubicaciones'
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[LOCATION-SERVICE] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de ubicaciones
app.use('/api/locations', locationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Location Service',
    port: PORT,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('[LOCATION-SERVICE] Error:', error);
  res.status(500).json({
    error: 'Internal location service error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Location tracking error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Location endpoint not found',
    path: req.originalUrl
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Establecer nombre del servicio para eventos
    process.env.SERVICE_NAME = 'location-service';
    
    // Conectar a la base de datos
    await database.connect();
    console.log('✅ Location Service conectado a la base de datos SQLite');
    
    // Conectar al EventBus
    const eventConnected = await eventBus.connect();
    
    if (eventConnected) {
      // Configurar event handlers
      setupEventHandlers();
      console.log('🐰 Location Service conectado al EventBus');
    }
    
    app.listen(PORT, () => {
      console.log(`📍 Location Service running on port ${PORT}`);
      console.log(`📊 Service available at http://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando Location Service:', error);
    process.exit(1);
  }
}

// Configurar manejadores de eventos
function setupEventHandlers() {
  // Escuchar eventos de ubicación
  eventBus.subscribeToLocationEvents(async (event) => {
    console.log('📥 Evento de ubicación recibido:', event.type);
    
    switch (event.type) {
      case 'location.updated':
        console.log('📍 Ubicación actualizada para conductor:', event.data.driver_id);
        // Aquí podrías procesar la ubicación, calcular rutas, etc.
        break;
      case 'location.geofence_entered':
        console.log('📍 Conductor entró en geofence:', event.data);
        break;
      case 'location.geofence_exited':
        console.log('📍 Conductor salió de geofence:', event.data);
        break;
    }
  });
  
  // Escuchar eventos de tareas para tracking relacionado
  eventBus.subscribeToTaskEvents(async (event) => {
    if (event.type === 'task.assigned' && event.data.driver_id) {
      console.log('📋 Tarea asignada, iniciando tracking para conductor:', event.data.driver_id);
      // Aquí podrías activar tracking específico para la tarea
    }
  });
}

// Hacer el eventBus disponible globalmente para las rutas
global.eventBus = eventBus;

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando Location Service...');
  await eventBus.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando Location Service...');
  await eventBus.close();
  process.exit(0);
});

startServer(); 