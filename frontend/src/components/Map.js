import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar iconos de Leaflet (fix para React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Componente para ajustar el mapa a las ubicaciones
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);

  return null;
};

const MapComponent = ({ 
  driverLocations = [], 
  tasks = [], 
  showTasks = false, 
  fullScreen = false,
  center = { lng: -58.3816, lat: -34.6037 } // Buenos Aires por defecto
}) => {
  // Estas variables se usan en los event handlers aunque ESLint no las detecte

  // Crear iconos personalizados para conductores
  const createDriverIcon = (driverId) => {
    const driverTasks = tasks.filter(task => task.driver_id === driverId);
    const hasInProgress = driverTasks.some(task => task.status === 'in_progress');
    const color = hasInProgress ? '#3B82F6' : '#10B981'; // Azul si trabajando, verde si disponible

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
               <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
                 <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
               </svg>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  // Crear iconos para tareas
  const createTaskIcon = (task, type) => {
    const priorityColors = {
      high: '#EF4444',
      medium: '#F59E0B', 
      low: '#6B7280'
    };
    const color = priorityColors[task.priority] || '#6B7280';
    const shape = type === 'start' ? 'border-radius: 50%;' : 'border-radius: 2px;';

    return L.divIcon({
      className: 'task-marker',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; ${shape} border: 1px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });
  };

  const getDriverStatusText = (driverId) => {
    const driverTasks = tasks.filter(task => task.driver_id === driverId);
    const hasInProgress = driverTasks.some(task => task.status === 'in_progress');
    return hasInProgress ? 'Trabajando' : 'Disponible';
  };

  const getPriorityText = (priority) => {
    const priorities = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return priorities[priority] || priority;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const mapHeight = fullScreen ? 'h-full' : 'h-96';

  return (
    <div className={`${mapHeight} w-full rounded-lg overflow-hidden`} style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajustar vista a las ubicaciones */}
        {driverLocations.length > 0 && (
          <FitBounds locations={driverLocations} />
        )}

        {/* Marcadores de conductores */}
        {driverLocations.map((location) => (
          <Marker
            key={location.driver_id}
            position={[location.latitude, location.longitude]}
            icon={createDriverIcon(location.driver_id)}
            eventHandlers={{
              click: () => {
                // Funcionalidad de click para conductores
                console.log('Conductor seleccionado:', location);
              },
            }}
          >
            <Popup closeOnClick={false}>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{location.driver_name}</h3>
                <p className="text-xs text-gray-600">{location.driver_email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Última actualización: {formatTimestamp(location.timestamp)}
                </p>
                <div className="mt-2 flex items-center">
                  <span 
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ 
                      backgroundColor: tasks.some(task => task.driver_id === location.driver_id && task.status === 'in_progress') 
                        ? '#3B82F6' 
                        : '#10B981'
                    }}
                  ></span>
                  <span className="text-xs">
                    {getDriverStatusText(location.driver_id)}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de tareas */}
        {showTasks && tasks.map((task) => (
          <React.Fragment key={task.id}>
            {/* Ubicación de inicio */}
            {task.start_lat && task.start_lng && (
              <Marker
                position={[task.start_lat, task.start_lng]}
                icon={createTaskIcon(task, 'start')}
                eventHandlers={{
                  click: () => {
                    // Funcionalidad de click para tarea de inicio
                    console.log('Tarea de inicio seleccionada:', task);
                  },
                }}
              >
                <Popup closeOnClick={false}>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <p className="text-xs text-gray-600 mb-1">
                      Inicio: {task.start_location}
                    </p>
                    <p className="text-xs text-gray-500">
                      Conductor: {task.driver_name || 'No asignado'}
                    </p>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded priority-${task.priority}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Ubicación de destino */}
            {task.end_lat && task.end_lng && (
              <Marker
                position={[task.end_lat, task.end_lng]}
                icon={createTaskIcon(task, 'end')}
                eventHandlers={{
                  click: () => {
                    // Funcionalidad de click para tarea de destino
                    console.log('Tarea de destino seleccionada:', task);
                  },
                }}
              >
                <Popup closeOnClick={false}>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <p className="text-xs text-gray-600 mb-1">
                      Destino: {task.end_location}
                    </p>
                    <p className="text-xs text-gray-500">
                      Conductor: {task.driver_name || 'No asignado'}
                    </p>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded priority-${task.priority}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 