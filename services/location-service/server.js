const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const database = require('../../backend/config/database');

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
    // Conectar a la base de datos
    await database.connect();
    console.log('✅ Location Service conectado a la base de datos SQLite');
    
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

startServer(); 