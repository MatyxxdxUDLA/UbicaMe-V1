import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PlayCircleIcon,
  TrashIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline';

const TaskList = ({ tasks = [], onUpdateStatus, onDelete, isAdmin = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <PlayCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'in_progress';
      case 'in_progress': return 'completed';
      default: return null;
    }
  };

  const getStatusButtonText = (status) => {
    switch (status) {
      case 'pending': return 'Iniciar';
      case 'in_progress': return 'Completar';
      default: return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2">No hay tareas disponibles</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <div key={task.id} className="p-6 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium priority-${task.priority}`}>
                  {getPriorityText(task.priority)}
                </span>
              </div>
              
              {task.description && (
                <p className="mt-2 text-sm text-gray-600">{task.description}</p>
              )}
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                {task.start_location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-green-500" />
                    <span>Origen: {task.start_location}</span>
                  </div>
                )}
                
                {task.end_location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-red-500" />
                    <span>Destino: {task.end_location}</span>
                  </div>
                )}
                
                {task.estimated_duration && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>Duración estimada: {task.estimated_duration} min</span>
                  </div>
                )}
                
                {isAdmin && task.driver_name && (
                  <div className="flex items-center">
                    <span>Conductor: {task.driver_name}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-${task.status}`}>
                  {getStatusText(task.status)}
                </span>
                <span className="text-xs text-gray-400">
                  Creada: {formatDate(task.created_at)}
                </span>
              </div>
            </div>
            
            <div className="ml-4 flex items-center space-x-2">
              {/* Botón de cambio de estado para conductores */}
              {!isAdmin && getNextStatus(task.status) && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus(task.id, getNextStatus(task.status))}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    task.status === 'pending' 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {getStatusButtonText(task.status)}
                </button>
              )}
              
              {/* Controles de admin */}
              {isAdmin && (
                <>
                  {task.status !== 'completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateStatus && onUpdateStatus(task.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Eliminar tarea"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 