import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateTaskModal = ({ drivers = [], onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    driver_id: '',
    priority: 'medium',
    start_location: '',
    end_location: '',
    start_lat: '',
    start_lng: '',
    end_lat: '',
    end_lng: '',
    estimated_duration: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convertir strings vacíos a null para campos opcionales
      const submitData = {
        ...formData,
        driver_id: parseInt(formData.driver_id),
        start_lat: formData.start_lat ? parseFloat(formData.start_lat) : null,
        start_lng: formData.start_lng ? parseFloat(formData.start_lng) : null,
        end_lat: formData.end_lat ? parseFloat(formData.end_lat) : null,
        end_lng: formData.end_lng ? parseFloat(formData.end_lng) : null,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error creando tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillBuenosAiresCoords = (type) => {
    if (type === 'start') {
      setFormData(prev => ({
        ...prev,
        start_lat: '-34.6037',
        start_lng: '-58.3816'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        end_lat: '-34.5973',
        end_lng: '-58.3782'
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" style={{ zIndex: 10000 }}>
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white" style={{ zIndex: 10001 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Crear Nueva Tarea</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Entrega en Centro Comercial"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción detallada de la tarea..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conductor *
              </label>
              <select
                name="driver_id"
                required
                value={formData.driver_id}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar conductor</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Ubicaciones</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ubicación de inicio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación de Inicio
                </label>
                <input
                  type="text"
                  name="start_location"
                  value={formData.start_location}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Almacén Central"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="start_lat"
                    step="any"
                    value={formData.start_lat}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Latitud"
                  />
                  <input
                    type="number"
                    name="start_lng"
                    step="any"
                    value={formData.start_lng}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Longitud"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => fillBuenosAiresCoords('start')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Usar coords. Buenos Aires
                </button>
              </div>

              {/* Ubicación de destino */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación de Destino
                </label>
                <input
                  type="text"
                  name="end_location"
                  value={formData.end_location}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Centro Comercial"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="end_lat"
                    step="any"
                    value={formData.end_lat}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Latitud"
                  />
                  <input
                    type="number"
                    name="end_lng"
                    step="any"
                    value={formData.end_lng}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Longitud"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => fillBuenosAiresCoords('end')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Usar coords. Buenos Aires
                </button>
              </div>
            </div>
          </div>

          {/* Duración estimada */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duración Estimada (minutos)
            </label>
            <input
              type="number"
              name="estimated_duration"
              min="1"
              value={formData.estimated_duration}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 45"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal; 