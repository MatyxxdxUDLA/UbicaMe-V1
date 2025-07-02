const express = require('express');
const database = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Actualizar ubicación del conductor
router.post('/', authenticateToken, requireRole(['driver']), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
    }

    // Validar rango de coordenadas
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    // Insertar nueva ubicación
    await database.run(
      'INSERT INTO locations (driver_id, latitude, longitude) VALUES (?, ?, ?)',
      [req.user.id, latitude, longitude]
    );

    res.json({ message: 'Ubicación actualizada exitosamente' });

  } catch (error) {
    console.error('Error actualizando ubicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener ubicaciones de todos los conductores (solo admin)
router.get('/drivers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Obtener la última ubicación de cada conductor
    const locations = await database.all(`
      SELECT 
        l.driver_id,
        l.latitude,
        l.longitude,
        l.timestamp,
        u.name as driver_name,
        u.email as driver_email
      FROM locations l
      INNER JOIN users u ON l.driver_id = u.id
      INNER JOIN (
        SELECT driver_id, MAX(timestamp) as latest_timestamp
        FROM locations
        GROUP BY driver_id
      ) latest ON l.driver_id = latest.driver_id AND l.timestamp = latest.latest_timestamp
      WHERE u.role = 'driver'
      ORDER BY l.timestamp DESC
    `);

    res.json(locations);

  } catch (error) {
    console.error('Error obteniendo ubicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener historial de ubicaciones de un conductor
router.get('/driver/:driverId/history', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { driverId } = req.params;
    const { limit = 50 } = req.query;

    const locations = await database.all(
      `SELECT latitude, longitude, timestamp 
       FROM locations 
       WHERE driver_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [driverId, parseInt(limit)]
    );

    res.json(locations);

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 