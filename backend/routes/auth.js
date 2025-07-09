const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../config/database');

const router = express.Router();

// Inicializar base de datos
database.connect().catch(console.error);

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'driver' } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password y nombre son requeridos' });
    }

    if (!['admin', 'driver'].includes(role)) {
      return res.status(400).json({ error: 'Rol debe ser admin o driver' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await database.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    // Generar token
    const token = jwt.sign(
      { 
        id: result.id, 
        email, 
        role,
        name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: { id: result.id, email, name, role }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    // Buscar usuario
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      // Publicar evento de login fallido
      if (global.eventBus) {
        await global.eventBus.publishAuthEvent('failed_login', {
          email,
          reason: 'user_not_found',
          timestamp: new Date().toISOString()
        });
      }
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      // Publicar evento de login fallido
      if (global.eventBus) {
        await global.eventBus.publishAuthEvent('failed_login', {
          email,
          reason: 'invalid_password',
          timestamp: new Date().toISOString()
        });
      }
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    };

    // Publicar evento de login exitoso
    if (global.eventBus) {
      await global.eventBus.publishAuthEvent('login', {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      message: 'Login exitoso',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe
    const user = await database.get(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router; 