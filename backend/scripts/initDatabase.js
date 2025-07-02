const bcrypt = require('bcryptjs');
const database = require('../config/database');

async function initDatabase() {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Conectar a la base de datos
    await database.connect();

    // Verificar si ya existen usuarios
    const existingUsers = await database.all('SELECT id FROM users');
    
    if (existingUsers.length > 0) {
      console.log('✅ La base de datos ya tiene datos');
      return;
    }

    console.log('📝 Creando usuarios de prueba...');

    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await database.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@ubicame.com', adminPassword, 'Administrador', 'admin']
    );

    // Crear conductores de prueba
    const conductor1Password = await bcrypt.hash('conductor123', 10);
    const conductor1Result = await database.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['conductor1@ubicame.com', conductor1Password, 'Juan Pérez', 'driver']
    );

    const conductor2Password = await bcrypt.hash('conductor123', 10);
    const conductor2Result = await database.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['conductor2@ubicame.com', conductor2Password, 'María García', 'driver']
    );

    const conductor3Password = await bcrypt.hash('conductor123', 10);
    const conductor3Result = await database.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['conductor3@ubicame.com', conductor3Password, 'Carlos López', 'driver']
    );

    console.log('📋 Creando tareas de prueba...');

    // Crear tareas de prueba
    const tasks = [
      {
        title: 'Entrega en Centro Comercial',
        description: 'Entrega de paquetes en el centro comercial principal',
        driver_id: conductor1Result.id,
        priority: 'high',
        start_location: 'Almacén Central',
        end_location: 'Centro Comercial Plaza',
        start_lat: -34.6037,
        start_lng: -58.3816,
        end_lat: -34.5973,
        end_lng: -58.3782,
        estimated_duration: 45
      },
      {
        title: 'Recogida en Zona Industrial',
        description: 'Recoger mercancía en la zona industrial',
        driver_id: conductor2Result.id,
        priority: 'medium',
        start_location: 'Base de Operaciones',
        end_location: 'Polígono Industrial Norte',
        start_lat: -34.6118,
        start_lng: -58.3960,
        end_lat: -34.5895,
        end_lng: -58.4173,
        estimated_duration: 60
      },
      {
        title: 'Ruta de Distribución Urbana',
        description: 'Múltiples entregas en zona residencial',
        driver_id: conductor3Result.id,
        priority: 'medium',
        start_location: 'Centro de Distribución',
        end_location: 'Barrio Las Flores',
        start_lat: -34.6158,
        start_lng: -58.3734,
        end_lat: -34.6345,
        end_lng: -58.3927,
        estimated_duration: 90
      }
    ];

    for (const task of tasks) {
      await database.run(
        `INSERT INTO tasks (
          title, description, driver_id, priority, start_location, end_location,
          start_lat, start_lng, end_lat, end_lng, estimated_duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.title, task.description, task.driver_id, task.priority,
          task.start_location, task.end_location, task.start_lat, task.start_lng,
          task.end_lat, task.end_lng, task.estimated_duration
        ]
      );
    }

    console.log('📍 Creando ubicaciones iniciales...');

    // Crear ubicaciones iniciales para los conductores
    const initialLocations = [
      { driver_id: conductor1Result.id, lat: -34.6037, lng: -58.3816 },
      { driver_id: conductor2Result.id, lat: -34.6118, lng: -58.3960 },
      { driver_id: conductor3Result.id, lat: -34.6158, lng: -58.3734 }
    ];

    for (const location of initialLocations) {
      await database.run(
        'INSERT INTO locations (driver_id, latitude, longitude) VALUES (?, ?, ?)',
        [location.driver_id, location.lat, location.lng]
      );
    }

    console.log('✅ Base de datos inicializada correctamente');
    console.log('\n👥 Usuarios creados:');
    console.log('📧 Admin: admin@ubicame.com / admin123');
    console.log('🚛 Conductor 1: conductor1@ubicame.com / conductor123');
    console.log('🚛 Conductor 2: conductor2@ubicame.com / conductor123');
    console.log('🚛 Conductor 3: conductor3@ubicame.com / conductor123');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    await database.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase; 