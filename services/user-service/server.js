const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const database = require('../../backend/config/database');

// Importar rutas del backend original
const userRoutes = require('../../backend/routes/users');

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3002;

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
  message: 'Demasiadas requests al servicio de usuarios'
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[USER-SERVICE] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'User Service',
    port: PORT,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('[USER-SERVICE] Error:', error);
  res.status(500).json({
    error: 'Internal user service error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'User management error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'User endpoint not found',
    path: req.originalUrl
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await database.connect();
    console.log('✅ User Service conectado a la base de datos SQLite');
    
    app.listen(PORT, () => {
      console.log(`👥 User Service running on port ${PORT}`);
      console.log(`📊 Service available at http://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando User Service:', error);
    process.exit(1);
  }
}

startServer(); 