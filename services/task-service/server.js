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
const taskRoutes = require('../../backend/routes/tasks');

const app = express();
const PORT = process.env.TASK_SERVICE_PORT || 3003;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Demasiadas requests al servicio de tareas'
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[TASK-SERVICE] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de tareas
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Task Service',
    port: PORT,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('[TASK-SERVICE] Error:', error);
  res.status(500).json({
    error: 'Internal task service error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Task management error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Task endpoint not found',
    path: req.originalUrl
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Establecer nombre del servicio para eventos
    process.env.SERVICE_NAME = 'task-service';
    
    // Conectar a la base de datos
    await database.connect();
    console.log('✅ Task Service conectado a la base de datos SQLite');
    
    // Conectar al EventBus
    const eventConnected = await eventBus.connect();
    
    if (eventConnected) {
      // Configurar event handlers
      setupEventHandlers();
      console.log('🐰 Task Service conectado al EventBus');
    }
    
    app.listen(PORT, () => {
      console.log(`📋 Task Service running on port ${PORT}`);
      console.log(`📊 Service available at http://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando Task Service:', error);
    process.exit(1);
  }
}

// Configurar manejadores de eventos
function setupEventHandlers() {
  // Escuchar eventos de tareas
  eventBus.subscribeToTaskEvents(async (event) => {
    console.log('📥 Evento de tarea recibido:', event.type);
    
    switch (event.type) {
      case 'task.created':
        console.log('📋 Tarea creada:', event.data.title);
        break;
      case 'task.assigned':
        console.log('📋 Tarea asignada:', event.data.title, 'a conductor', event.data.driver_id);
        break;
      case 'task.updated':
        console.log('📋 Tarea actualizada:', event.data.title);
        break;
      case 'task.completed':
        console.log('📋 Tarea completada:', event.data.title);
        break;
    }
  });
  
  // Escuchar eventos de ubicación para tareas relacionadas
  eventBus.subscribeToLocationEvents(async (event) => {
    if (event.type === 'location.updated') {
      console.log('📍 Ubicación actualizada para conductor:', event.data.driver_id);
      // Aquí podrías actualizar el estado de tareas basado en ubicación
    }
  });
}

// Hacer el eventBus disponible globalmente para las rutas
global.eventBus = eventBus;

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando Task Service...');
  await eventBus.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando Task Service...');
  await eventBus.close();
  process.exit(0);
});

startServer(); 