import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LocationTracker = () => {
  const [error, setError] = useState(null);
  const { isDriver } = useAuth();

  useEffect(() => {
    if (!isDriver) return;

    let watchId;
    let intervalId;

    const startTracking = () => {
      if (!navigator.geolocation) {
        setError('Geolocalización no soportada por este navegador');
        return;
      }

      setError(null);

      // Función para obtener y enviar ubicación
      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              await api.post('/locations', {
                latitude,
                longitude
              });

              setError(null);
            } catch (error) {
              console.error('Error actualizando ubicación:', error);
              setError('Error enviando ubicación al servidor');
            }
          },
          (error) => {
            let errorMessage = 'Error obteniendo ubicación';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permiso de ubicación denegado';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Ubicación no disponible';
                break;
              case error.TIMEOUT:
                errorMessage = 'Tiempo de espera agotado';
                break;
              default:
                errorMessage = 'Error desconocido';
                break;
            }
            
            setError(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      };

      // Actualizar inmediatamente
      updateLocation();

      // Actualizar cada 10 segundos
      intervalId = setInterval(updateLocation, 10000);
    };

    const stopTracking = () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Cleanup function
    };

    // Solicitar permisos y comenzar seguimiento
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          startTracking();
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('Por favor, permite el acceso a tu ubicación para el seguimiento en tiempo real');
          }
          setError('No se pudo obtener permiso de ubicación');
        }
      );
    }

    // Cleanup
    return () => {
      stopTracking();
    };
  }, [isDriver]);

  // Mostrar notificación de estado si hay error
  useEffect(() => {
    if (error && isDriver) {
      toast.warn(error, { toastId: 'location-error' });
    }
  }, [error, isDriver]);

  // No renderizar nada visible (componente de servicio)
  return null;
};

export default LocationTracker; 