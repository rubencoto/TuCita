import axios from 'axios';

/**
 * Instancia de Axios configurada para las peticiones API
 * El interceptor de autenticación está configurado en axiosConfig.ts
 */
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
