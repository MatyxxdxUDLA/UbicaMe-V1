const express = require('express');
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await database.all(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener conductores (solo admin)
router.get('/drivers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const drivers = await database.all(
      'SELECT id, email, name, created_at FROM users WHERE role = "driver" ORDER BY name'
    );

    res.json(drivers);
  } catch (error) {
    console.error('Error obteniendo conductores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario (solo admin)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
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

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: { id: result.id, email, name, role }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar usuario (solo admin)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;

    // Verificar que el usuario existe
    const existingUser = await database.get(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Construir query de actualización
    let updateFields = [];
    let updateValues = [];

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (role && ['admin', 'driver'].includes(role)) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    await database.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Obtener usuario actualizado
    const updatedUser = await database.get(
      'SELECT id, email, name, role, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que el admin se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    // Verificar que el usuario existe
    const existingUser = await database.get(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar usuario
    await database.run('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil propio
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await database.get(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 