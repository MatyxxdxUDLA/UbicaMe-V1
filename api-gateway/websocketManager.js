const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketManager {
  constructor() {
    this.io = null;
    this.authenticatedUsers = new Map(); // userId -> socket
    this.userRooms = new Map(); // userId -> [rooms]
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: ['http://localhost:4000', 'http://127.0.0.1:4000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io'
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🔌 WebSocket Manager inicializado');
  }

  setupMiddleware() {
    // Middleware de autenticación para WebSockets
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;
        socket.userName = decoded.name;
        next();
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Usuario conectado: ${socket.userName} (${socket.userEmail})`);
      
      // Guardar socket del usuario
      this.authenticatedUsers.set(socket.userId, socket);
      
      // Unir a salas basadas en el rol
      this.joinUserToRooms(socket);
      
      // Manejar eventos del cliente
      this.handleClientEvents(socket);
      
      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log(`🔌 Usuario desconectado: ${socket.userName}`);
        this.authenticatedUsers.delete(socket.userId);
        this.userRooms.delete(socket.userId);
      });
    });
  }

  joinUserToRooms(socket) {
    const rooms = [];
    
    // Sala general para todos los usuarios autenticados
    socket.join('authenticated_users');
    rooms.push('authenticated_users');
    
    // Salas específicas por rol
    if (socket.userRole === 'admin') {
      socket.join('admins');
      socket.join('all_notifications'); // Admins reciben todas las notificaciones
      rooms.push('admins', 'all_notifications');
    } else if (socket.userRole === 'driver') {
      socket.join('drivers');
      socket.join(`driver_${socket.userId}`); // Sala personal del conductor
      rooms.push('drivers', `driver_${socket.userId}`);
    }
    
    this.userRooms.set(socket.userId, rooms);
    console.log(`👥 Usuario ${socket.userName} unido a salas: ${rooms.join(', ')}`);
  }

  handleClientEvents(socket) {
    // Cliente solicita unirse a sala específica
    socket.on('join_room', (roomName) => {
      if (this.isAllowedRoom(socket, roomName)) {
        socket.join(roomName);
        console.log(`👥 ${socket.userName} se unió a la sala: ${roomName}`);
        socket.emit('room_joined', { room: roomName });
      } else {
        socket.emit('error', { message: 'No tienes permisos para unirte a esta sala' });
      }
    });

    // Cliente solicita salir de sala
    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      console.log(`👥 ${socket.userName} salió de la sala: ${roomName}`);
      socket.emit('room_left', { room: roomName });
    });

    // Cliente envía actualización de ubicación (solo conductores)
    socket.on('location_update', (locationData) => {
      if (socket.userRole === 'driver') {
        this.broadcastLocationUpdate(socket.userId, locationData);
      }
    });

    // Cliente solicita información en tiempo real
    socket.on('request_real_time_data', (dataType) => {
      this.sendRealTimeData(socket, dataType);
    });
  }

  isAllowedRoom(socket, roomName) {
    // Lógica para determinar si un usuario puede unirse a una sala específica
    if (socket.userRole === 'admin') {
      return true; // Los admins pueden unirse a cualquier sala
    }
    
    if (socket.userRole === 'driver') {
      // Los conductores solo pueden unirse a salas específicas
      const allowedRooms = ['drivers', `driver_${socket.userId}`, 'general'];
      return allowedRooms.includes(roomName);
    }
    
    return false;
  }

  // Métodos para enviar notificaciones específicas
  sendNotificationToUser(userId, notification) {
    const socket = this.authenticatedUsers.get(userId);
    if (socket) {
      socket.emit('notification', notification);
      console.log(`📨 Notificación enviada a usuario ${userId}`);
      return true;
    }
    return false;
  }

  sendNotificationToRole(role, notification) {
    const room = role === 'admin' ? 'admins' : 'drivers';
    this.io.to(room).emit('notification', notification);
    console.log(`📨 Notificación enviada a todos los ${role}s`);
  }

  broadcastToAll(event, data) {
    this.io.to('authenticated_users').emit(event, data);
    console.log(`📢 Evento ${event} enviado a todos los usuarios conectados`);
  }

  // Eventos específicos del dominio
  sendTaskUpdate(taskData) {
    // Notificar al conductor asignado
    if (taskData.driver_id) {
      this.sendNotificationToUser(taskData.driver_id, {
        type: 'task_update',
        title: 'Tarea Actualizada',
        message: `Tu tarea "${taskData.title}" ha sido actualizada`,
        data: taskData
      });
    }
    
    // Notificar a los admins
    this.sendNotificationToRole('admin', {
      type: 'task_update',
      title: 'Tarea Actualizada',
      message: `La tarea "${taskData.title}" ha sido actualizada`,
      data: taskData
    });
  }

  sendUserUpdate(userData) {
    // Notificar al usuario específico
    this.sendNotificationToUser(userData.id, {
      type: 'user_update',
      title: 'Perfil Actualizado',
      message: 'Tu perfil ha sido actualizado',
      data: userData
    });
    
    // Notificar a los admins
    this.sendNotificationToRole('admin', {
      type: 'user_update',
      title: 'Usuario Actualizado',
      message: `El usuario ${userData.name} ha sido actualizado`,
      data: userData
    });
  }

  broadcastLocationUpdate(driverId, locationData) {
    // Enviar a la sala del conductor específico
    this.io.to(`driver_${driverId}`).emit('location_update', {
      driverId,
      ...locationData,
      timestamp: new Date().toISOString()
    });
    
    // Enviar a los admins para el dashboard
    this.io.to('admins').emit('driver_location_update', {
      driverId,
      ...locationData,
      timestamp: new Date().toISOString()
    });
  }

  sendRealTimeData(socket, dataType) {
    // Enviar datos en tiempo real según el tipo solicitado
    switch (dataType) {
      case 'dashboard_stats':
        if (socket.userRole === 'admin') {
          // Aquí podrías obtener estadísticas en tiempo real
          socket.emit('dashboard_stats', {
            activeDrivers: this.getActiveDriversCount(),
            connectedUsers: this.authenticatedUsers.size
          });
        }
        break;
      case 'driver_status':
        if (socket.userRole === 'driver') {
          // Enviar estado específico del conductor
          socket.emit('driver_status', {
            isOnline: true,
            lastUpdate: new Date().toISOString()
          });
        }
        break;
    }
  }

  getActiveDriversCount() {
    let count = 0;
    for (const [userId, socket] of this.authenticatedUsers) {
      if (socket.userRole === 'driver') {
        count++;
      }
    }
    return count;
  }

  getConnectedUsers() {
    return Array.from(this.authenticatedUsers.keys());
  }

  isUserConnected(userId) {
    return this.authenticatedUsers.has(userId);
  }
}

// Singleton instance
const webSocketManager = new WebSocketManager();

module.exports = webSocketManager; 