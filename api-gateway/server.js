const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

// Importar sistema de eventos y WebSockets
const eventBus = require('./eventBus');
const webSocketManager = require('./websocketManager');

const app = express();
const PORT = process.env.PORT || process.env.GATEWAY_PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// CORS - Permitir acceso desde el frontend
const allowedOrigins = [
  'http://localhost:4000', 
  'http://127.0.0.1:4000',
  'https://ubica-me-v1.vercel.app',
  'https://ubica-me-v1-ctcjpmsds-matias-robayos-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite más alto para el gateway
  message: 'Demasiadas requests desde esta IP'
});
app.use(limiter);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Configuración de microservicios
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  USER: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  TASK: process.env.TASK_SERVICE_URL || 'http://localhost:3003',
  LOCATION: process.env.LOCATION_SERVICE_URL || 'http://localhost:3004'
};

// Middleware de autenticación para rutas protegidas
const authenticateGateway = (req, res, next) => {
  // Rutas que no requieren autenticación
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/health'];
  
  console.log(`[GATEWAY] Checking auth for: ${req.path}`);
  
  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => req.path === route || req.path.startsWith(route));
  
  if (isPublicRoute) {
    console.log(`[GATEWAY] Public route allowed: ${req.path}`);
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`[GATEWAY] No token provided for protected route: ${req.path}`);
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`[GATEWAY] Token valid for user: ${decoded.email}`);
    next();
  } catch (error) {
    console.log(`[GATEWAY] Invalid token for route: ${req.path}`);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Configurar proxies para cada microservicio
const authProxy = createProxyMiddleware({
  target: SERVICES.AUTH,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    // Fix para manejar el body en requests POST/PUT
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] Auth service error:', err.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
});

const userProxy = createProxyMiddleware({
  target: SERVICES.USER,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] User service error:', err.message);
    res.status(503).json({ error: 'User service unavailable' });
  }
});

const taskProxy = createProxyMiddleware({
  target: SERVICES.TASK,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tasks': '/api/tasks'
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] Task service error:', err.message);
    res.status(503).json({ error: 'Task service unavailable' });
  }
});

const locationProxy = createProxyMiddleware({
  target: SERVICES.LOCATION,
  changeOrigin: true,
  pathRewrite: {
    '^/api/locations': '/api/locations'
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] Location service error:', err.message);
    res.status(503).json({ error: 'Location service unavailable' });
  }
});

// Body parsing para rutas que necesitan parsear el JSON
app.use('/api/auth', express.json(), authProxy);
app.use('/api/users', express.json(), authenticateGateway, userProxy);
app.use('/api/tasks', express.json(), authenticateGateway, taskProxy);
app.use('/api/locations', express.json(), authenticateGateway, locationProxy);

// Health check del gateway
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'UbicaMe API Gateway',
    services: SERVICES
  });
});

// Ruta para verificar estado de microservicios
app.get('/api/health/services', async (req, res) => {
  const serviceHealth = {};
  
  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      const response = await fetch(`${url}/health`);
      serviceHealth[name] = {
        status: response.ok ? 'UP' : 'DOWN',
        url: url
      };
    } catch (error) {
      serviceHealth[name] = {
        status: 'DOWN',
        url: url,
        error: error.message
      };
    }
  }
  
  res.json({
    gateway: 'UP',
    services: serviceHealth,
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'Check API documentation for available endpoints'
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('[GATEWAY] Error:', error);
  res.status(500).json({
    error: 'Internal gateway error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
  });
});

// Crear servidor HTTP para WebSockets
const server = http.createServer(app);

// Inicializar WebSocket Manager
webSocketManager.initialize(server);

// Función para inicializar el sistema distribuido
async function startDistributedSystem() {
  try {
    // Conectar al EventBus (RabbitMQ)
    const rabbitConnected = await eventBus.connect();
    
    if (rabbitConnected) {
      // Configurar event handlers para el gateway
      setupEventHandlers();
    }
    
    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🌐 API Gateway running on port ${PORT}`);
      console.log(`📊 Gateway available at http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server available at ws://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
      console.log('🔗 Connected services:');
      Object.entries(SERVICES).forEach(([name, url]) => {
        console.log(`   ${name}: ${url}`);
      });
      
      if (rabbitConnected) {
        console.log('🐰 RabbitMQ EventBus conectado');
      } else {
        console.log('⚠️  Ejecutándose sin RabbitMQ (modo degradado)');
      }
    });
    
  } catch (error) {
    console.error('❌ Error iniciando sistema distribuido:', error);
    process.exit(1);
  }
}

// Configurar manejadores de eventos del gateway
function setupEventHandlers() {
  // Escuchar eventos de notificaciones para enviar via WebSocket
  eventBus.subscribeToNotifications(async (event) => {
    console.log('📨 Evento de notificación recibido:', event.type);
    
    switch (event.type) {
      case 'notification.user_update':
        webSocketManager.sendUserUpdate(event.data);
        break;
      case 'notification.task_update':
        webSocketManager.sendTaskUpdate(event.data);
        break;
      case 'notification.location_update':
        webSocketManager.broadcastLocationUpdate(event.data.driverId, event.data);
        break;
      case 'notification.broadcast':
        webSocketManager.broadcastToAll('system_notification', event.data);
        break;
      default:
        console.log('📨 Tipo de notificación no manejado:', event.type);
    }
  });
  
  // Escuchar todos los eventos para logging y analytics
  eventBus.subscribeToEvents('gateway_analytics', eventBus.exchanges.USERS, ['user.*'], async (event) => {
    console.log('📊 Analytics - Evento de usuario:', event.type, event.data);
  });
  
  eventBus.subscribeToEvents('gateway_analytics', eventBus.exchanges.TASKS, ['task.*'], async (event) => {
    console.log('📊 Analytics - Evento de tarea:', event.type, event.data);
  });
  
  eventBus.subscribeToEvents('gateway_analytics', eventBus.exchanges.LOCATIONS, ['location.*'], async (event) => {
    console.log('📊 Analytics - Evento de ubicación:', event.type, event.data);
  });
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando API Gateway...');
  await eventBus.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando API Gateway...');
  await eventBus.close();
  process.exit(0);
});

// Iniciar el sistema
startDistributedSystem(); 