import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Modo demo - usuarios de prueba
const DEMO_USERS = {
  'admin@ubicame.com': {
    email: 'admin@ubicame.com',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador Demo'
  },
  'driver@ubicame.com': {
    email: 'driver@ubicame.com', 
    password: 'driver123',
    role: 'driver',
    name: 'Conductor Demo'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verificar si estamos en modo demo
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || 
                     !process.env.REACT_APP_API_URL || 
                     process.env.REACT_APP_API_URL.includes('localhost');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (isDemoMode) {
        // Modo demo - validación local
        const demoUser = DEMO_USERS[email];
        if (demoUser && demoUser.password === password) {
          const userData = {
            email: demoUser.email,
            role: demoUser.role,
            name: demoUser.name
          };
          
          localStorage.setItem('token', 'demo-token');
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          
          return { success: true, user: userData };
        } else {
          return { 
            success: false, 
            message: 'Credenciales inválidas. Prueba: admin@ubicame.com/admin123 o driver@ubicame.com/driver123' 
          };
        }
      } else {
        // Modo normal - API real
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
          return { success: true, user: response.data.user };
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: isDemoMode ? 'Error en modo demo' : error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isDemoMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 