import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from './common/Header';
import Map from './Map';
import TaskList from './TaskList';
import UserManagement from './UserManagement';
import CreateTaskModal from './CreateTaskModal';
import StatsCards from './StatsCards';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverLocations, setDriverLocations] = useState([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTasks(),
        loadDrivers(),
        loadDriverLocations()
      ]);
    } catch (error) {
      toast.error('Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias porque las funciones internas no cambian

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Actualizar ubicaciones cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadDriverLocations();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await api.get('/users/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error cargando conductores:', error);
    }
  };

  const loadDriverLocations = async () => {
    try {
      const response = await api.get('/locations/drivers');
      setDriverLocations(response.data);
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await api.post('/tasks', taskData);
      toast.success('Tarea creada exitosamente');
      setIsCreateTaskModalOpen(false);
      loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creando tarea');
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Estado de tarea actualizado');
      loadTasks();
    } catch (error) {
      toast.error('Error actualizando tarea');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success('Tarea eliminada');
        loadTasks();
      } catch (error) {
        toast.error('Error eliminando tarea');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={true}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>+</span>
                <span>Nueva Tarea</span>
              </button>
            </div>

            <StatsCards tasks={tasks} drivers={drivers} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Ubicación de Conductores</h2>
                <div className="h-96">
                  <Map 
                    driverLocations={driverLocations}
                    tasks={tasks}
                    showTasks={true}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Tareas Recientes</h2>
                <TaskList 
                  tasks={tasks.slice(0, 5)}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onDelete={handleDeleteTask}
                  isAdmin={true}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>+</span>
                <span>Nueva Tarea</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <TaskList 
                tasks={tasks}
                onUpdateStatus={handleUpdateTaskStatus}
                onDelete={handleDeleteTask}
                isAdmin={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement 
            drivers={drivers}
            onUpdate={loadDrivers}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mapa en Tiempo Real</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-[600px]">
                <Map 
                  driverLocations={driverLocations}
                  tasks={tasks}
                  showTasks={true}
                  fullScreen={true}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {isCreateTaskModalOpen && (
        <CreateTaskModal
          drivers={drivers}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 