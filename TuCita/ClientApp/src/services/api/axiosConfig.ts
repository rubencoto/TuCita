import axios from 'axios';

// Configurar base URL desde variable de entorno o usar /api para proxy local
const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar Axios para usar el token en todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      // Asegurar que headers existe
      config.headers = config.headers || {};

      // DEBUG: mostrar si tenemos token y a qué endpoint vamos (quitar en producción)
      // eslint-disable-next-line no-console
      console.debug('[axios] request ->', { url: config.url, method: config.method, hasToken: !!token });

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // eslint-disable-next-line no-console
        console.debug('[axios] Authorization header set for', config.url);
      }

      // Deshabilitar caché en todas las peticiones
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[axios] request interceptor error', err);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // DEBUG: log completo del error para analizar 401
    // eslint-disable-next-line no-console
    console.debug('[axios] response error', {
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
      headers: error?.response?.headers,
    });

    if (error.response?.status === 401) {
      // Token expirado o inválido — limpiar credenciales
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // eslint-disable-next-line no-console
      console.warn('[axios] Unauthorized (401) - cleared localStorage');

      // Emitir evento para que la UI maneje la redirección o notificación
      try {
        window.dispatchEvent(new CustomEvent('app:unauthorized', {
          detail: {
            url: error?.config?.url,
            status: 401,
            message: error?.response?.data || 'Unauthorized'
          }
        }));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[axios] error dispatching unauthorized event', e);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
