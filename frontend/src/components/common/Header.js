import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TruckIcon, 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  UsersIcon, 
  MapIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = ({ user, activeTab, setActiveTab, isAdmin }) => {
  const { logout } = useAuth();

  const adminTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'tasks', name: 'Tareas', icon: ClipboardDocumentListIcon },
    { id: 'users', name: 'Usuarios', icon: UsersIcon },
    { id: 'map', name: 'Mapa', icon: MapIcon },
  ];

  const driverTabs = [
    { id: 'tasks', name: 'Mis Tareas', icon: ClipboardDocumentListIcon },
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
  ];

  const tabs = isAdmin ? adminTabs : driverTabs;

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y Navegación */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">UbicaMe</span>
              {isAdmin && (
                <span className="ml-2 text-sm text-blue-600 font-medium">Admin</span>
              )}
            </div>
            
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="ml-2 hidden sm:block">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 