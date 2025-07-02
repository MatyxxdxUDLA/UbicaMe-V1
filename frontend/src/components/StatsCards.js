import React from 'react';
import { 
  ClipboardDocumentListIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const StatsCards = ({ tasks = [], drivers = [] }) => {
  const getTaskStats = () => {
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const total = tasks.length;

    return { pending, inProgress, completed, total };
  };

  const getDriverStats = () => {
    const total = drivers.length;
    const activeTasks = tasks.filter(task => task.status === 'in_progress');
    const busyDrivers = new Set(activeTasks.map(task => task.driver_id)).size;
    const availableDrivers = total - busyDrivers;

    return { total, busy: busyDrivers, available: availableDrivers };
  };

  const taskStats = getTaskStats();
  const driverStats = getDriverStats();

  const cards = [
    {
      title: 'Total Tareas',
      value: taskStats.total,
      icon: ClipboardDocumentListIcon,
      color: 'blue',
      description: `${taskStats.pending} pendientes, ${taskStats.inProgress} en progreso`
    },
    {
      title: 'Tareas Completadas',
      value: taskStats.completed,
      icon: CheckCircleIcon,
      color: 'green',
      description: `${taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% del total`
    },
    {
      title: 'Tareas Pendientes',
      value: taskStats.pending,
      icon: ClockIcon,
      color: 'yellow',
      description: 'Esperando asignación'
    },
    {
      title: 'Conductores',
      value: driverStats.total,
      icon: UsersIcon,
      color: 'indigo',
      description: `${driverStats.busy} trabajando, ${driverStats.available} disponibles`
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-500',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600'
      },
      yellow: {
        bg: 'bg-yellow-500',
        iconBg: 'bg-yellow-100',
        iconText: 'text-yellow-600'
      },
      indigo: {
        bg: 'bg-indigo-500',
        iconBg: 'bg-indigo-100',
        iconText: 'text-indigo-600'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colors = getColorClasses(card.color);
        
        return (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-md ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.iconText}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              {card.description && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards; 