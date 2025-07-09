import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de un WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (isAuthenticated && token && user) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, token, user]);

  const connectWebSocket = () => {
    try {
      console.log('🔌 Conectando a WebSocket...');
      
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000
      });

      // Event listeners
      newSocket.on('connect', () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Solicitar datos en tiempo real según el rol
        if (user.role === 'admin') {
          newSocket.emit('request_real_time_data', 'dashboard_stats');
        } else if (user.role === 'driver') {
          newSocket.emit('request_real_time_data', 'driver_status');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket desconectado');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error.message);
        setIsConnected(false);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('❌ Máximo número de intentos de reconexión alcanzado');
        }
      });

      // Manejar notificaciones
      newSocket.on('notification', (notification) => {
        console.log('📨 Notificación recibida:', notification);
        
        setNotifications(prev => [{
          id: Date.now(),
          ...notification,
          timestamp: new Date().toISOString(),
          read: false
        }, ...prev.slice(0, 99)]); // Mantener solo las últimas 100

        // Mostrar toast según el tipo
        switch (notification.type) {
          case 'task_assigned':
          case 'task_update':
            toast.info(notification.message, {
              position: "top-right",
              autoClose: 5000
            });
            break;
          case 'user_update':
            toast.success(notification.message, {
              position: "top-right",
              autoClose: 3000
            });
            break;
          case 'system_notification':
            toast.warning(notification.message, {
              position: "top-right",
              autoClose: 7000
            });
            break;
          default:
            toast(notification.message, {
              position: "top-right",
              autoClose: 4000
            });
        }
      });

      // Manejar actualizaciones de ubicación en tiempo real
      newSocket.on('location_update', (locationData) => {
        console.log('📍 Actualización de ubicación:', locationData);
        setRealTimeData(prev => ({
          ...prev,
          myLocation: locationData
        }));
      });

      // Para admins: recibir ubicaciones de todos los conductores
      newSocket.on('driver_location_update', (locationData) => {
        console.log('📍 Ubicación de conductor actualizada:', locationData);
        setRealTimeData(prev => ({
          ...prev,
          driverLocations: {
            ...prev.driverLocations,
            [locationData.driverId]: locationData
          }
        }));
      });

      // Estadísticas del dashboard en tiempo real
      newSocket.on('dashboard_stats', (stats) => {
        console.log('📊 Stats del dashboard:', stats);
        setRealTimeData(prev => ({
          ...prev,
          dashboardStats: stats
        }));
      });

      // Estado del conductor
      newSocket.on('driver_status', (status) => {
        console.log('🚛 Estado del conductor:', status);
        setRealTimeData(prev => ({
          ...prev,
          driverStatus: status
        }));
      });

      // Confirmaciones de sala
      newSocket.on('room_joined', ({ room }) => {
        console.log('👥 Unido a sala:', room);
      });

      newSocket.on('room_left', ({ room }) => {
        console.log('👥 Salió de sala:', room);
      });

      // Errores
      newSocket.on('error', (error) => {
        console.error('❌ Error WebSocket:', error);
        toast.error(error.message || 'Error de conexión', {
          position: "top-right",
          autoClose: 5000
        });
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      console.log('🔌 Desconectando WebSocket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setNotifications([]);
      setRealTimeData({});
    }
  };

  // Funciones para enviar datos
  const sendLocationUpdate = (locationData) => {
    if (socket && isConnected && user?.role === 'driver') {
      socket.emit('location_update', locationData);
    }
  };

  const joinRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomName);
    }
  };

  const leaveRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomName);
    }
  };

  const requestRealTimeData = (dataType) => {
    if (socket && isConnected) {
      socket.emit('request_real_time_data', dataType);
    }
  };

  // Función para marcar notificaciones como leídas
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  // Función para limpiar notificaciones
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Función para obtener notificaciones no leídas
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const value = {
    socket,
    isConnected,
    notifications,
    realTimeData,
    sendLocationUpdate,
    joinRoom,
    leaveRoom,
    requestRealTimeData,
    markNotificationAsRead,
    clearNotifications,
    getUnreadCount,
    reconnectWebSocket: connectWebSocket
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 