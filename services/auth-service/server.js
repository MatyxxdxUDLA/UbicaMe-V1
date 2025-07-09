const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar sistema de eventos
const eventBus = require('../../shared/eventBus');

// Importar rutas del backend original
const authRoutes = require('../../backend/routes/auth');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

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
  max: 100,
  message: 'Demasiadas requests de autenticación'
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[AUTH-SERVICE] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Auth Service',
    port: PORT,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('[AUTH-SERVICE] Error:', error);
  res.status(500).json({
    error: 'Internal auth service error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Authentication error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Auth endpoint not found',
    path: req.originalUrl
  });
});

// Función para inicializar el auth service
async function startServer() {
  try {
    // Establecer nombre del servicio para eventos
    process.env.SERVICE_NAME = 'auth-service';
    
    // Conectar al EventBus
    const eventConnected = await eventBus.connect();
    
    if (eventConnected) {
      // Configurar event handlers
      setupEventHandlers();
      console.log('🐰 Auth Service conectado al EventBus');
    }
    
    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
      console.log(`📊 Service available at http://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando Auth Service:', error);
    process.exit(1);
  }
}

// Configurar manejadores de eventos
function setupEventHandlers() {
  // Escuchar eventos de autenticación
  eventBus.subscribeToAuthEvents(async (event) => {
    console.log('📥 Evento de autenticación recibido:', event.type);
    
    switch (event.type) {
      case 'auth.login':
        console.log('🔐 Usuario autenticado:', event.data.email);
        break;
      case 'auth.logout':
        console.log('🔐 Usuario desconectado:', event.data.email);
        break;
      case 'auth.failed_login':
        console.log('🔐 Intento de login fallido:', event.data.email);
        break;
    }
  });
}

// Hacer el eventBus disponible globalmente para las rutas
global.eventBus = eventBus;

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando Auth Service...');
  await eventBus.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando Auth Service...');
  await eventBus.close();
  process.exit(0);
});

startServer(); 