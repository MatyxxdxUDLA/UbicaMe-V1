const express = require('express');
const database = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las tareas (admin) o tareas asignadas (driver)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      // Admin ve todas las tareas con información del conductor
      query = `
        SELECT 
          t.*,
          u.name as driver_name,
          u.email as driver_email
        FROM tasks t
        LEFT JOIN users u ON t.driver_id = u.id
        ORDER BY t.created_at DESC
      `;
    } else {
      // Conductor ve solo sus tareas asignadas
      query = `
        SELECT t.* FROM tasks t 
        WHERE t.driver_id = ? 
        ORDER BY t.created_at DESC
      `;
      params = [req.user.id];
    }

    const tasks = await database.all(query, params);
    res.json(tasks);

  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener tareas de un conductor específico (admin)
router.get('/driver/:driverId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { driverId } = req.params;

    const tasks = await database.all(
      'SELECT * FROM tasks WHERE driver_id = ? ORDER BY created_at DESC',
      [driverId]
    );

    res.json(tasks);

  } catch (error) {
    console.error('Error obteniendo tareas del conductor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva tarea (solo admin)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      driver_id,
      priority = 'medium',
      start_location,
      end_location,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      estimated_duration
    } = req.body;

    // Validaciones
    if (!title || !driver_id) {
      return res.status(400).json({ error: 'Título y conductor son requeridos' });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Prioridad debe ser low, medium o high' });
    }

    // Verificar que el conductor existe
    const driver = await database.get(
      'SELECT id FROM users WHERE id = ? AND role = "driver"',
      [driver_id]
    );

    if (!driver) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }

    // Crear tarea
    const result = await database.run(
      `INSERT INTO tasks (
        title, description, driver_id, priority, start_location, end_location,
        start_lat, start_lng, end_lat, end_lng, estimated_duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, driver_id, priority, start_location, end_location,
        start_lat, start_lng, end_lat, end_lng, estimated_duration
      ]
    );

    // Obtener tarea creada con información del conductor
    const task = await database.get(
      `SELECT 
        t.*,
        u.name as driver_name,
        u.email as driver_email
      FROM tasks t
      LEFT JOIN users u ON t.driver_id = u.id
      WHERE t.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      task
    });

  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar tarea
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      driver_id,
      status,
      priority,
      start_location,
      end_location,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      estimated_duration
    } = req.body;

    // Verificar que la tarea existe
    const existingTask = await database.get(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar permisos
    if (req.user.role === 'driver') {
      // Conductor solo puede actualizar sus propias tareas y solo el estado
      if (existingTask.driver_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
      }
      
      // Conductor solo puede cambiar el estado
      if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      if (Object.keys(req.body).length > 1 || (Object.keys(req.body).length === 1 && !status)) {
        return res.status(403).json({ error: 'Solo puedes actualizar el estado de la tarea' });
      }
    }

    // Construir query de actualización
    let updateFields = [];
    let updateValues = [];

    if (title && req.user.role === 'admin') {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (description && req.user.role === 'admin') {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (driver_id && req.user.role === 'admin') {
      // Verificar que el conductor existe
      const driver = await database.get(
        'SELECT id FROM users WHERE id = ? AND role = "driver"',
        [driver_id]
      );
      if (!driver) {
        return res.status(404).json({ error: 'Conductor no encontrado' });
      }
      updateFields.push('driver_id = ?');
      updateValues.push(driver_id);
    }

    if (status && ['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (priority && req.user.role === 'admin' && ['low', 'medium', 'high'].includes(priority)) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }

    if (start_location && req.user.role === 'admin') {
      updateFields.push('start_location = ?');
      updateValues.push(start_location);
    }

    if (end_location && req.user.role === 'admin') {
      updateFields.push('end_location = ?');
      updateValues.push(end_location);
    }

    if (start_lat && req.user.role === 'admin') {
      updateFields.push('start_lat = ?');
      updateValues.push(start_lat);
    }

    if (start_lng && req.user.role === 'admin') {
      updateFields.push('start_lng = ?');
      updateValues.push(start_lng);
    }

    if (end_lat && req.user.role === 'admin') {
      updateFields.push('end_lat = ?');
      updateValues.push(end_lat);
    }

    if (end_lng && req.user.role === 'admin') {
      updateFields.push('end_lng = ?');
      updateValues.push(end_lng);
    }

    if (estimated_duration && req.user.role === 'admin') {
      updateFields.push('estimated_duration = ?');
      updateValues.push(estimated_duration);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    await database.run(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Obtener tarea actualizada
    const updatedTask = await database.get(
      `SELECT 
        t.*,
        u.name as driver_name,
        u.email as driver_email
      FROM tasks t
      LEFT JOIN users u ON t.driver_id = u.id
      WHERE t.id = ?`,
      [id]
    );

    res.json({
      message: 'Tarea actualizada exitosamente',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar tarea (solo admin)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la tarea existe
    const existingTask = await database.get(
      'SELECT id FROM tasks WHERE id = ?',
      [id]
    );

    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Eliminar tarea
    await database.run('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({ message: 'Tarea eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de tareas (admin)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await database.all(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks 
      GROUP BY status
    `);

    const total = await database.get('SELECT COUNT(*) as total FROM tasks');

    res.json({
      by_status: stats,
      total: total.total
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 