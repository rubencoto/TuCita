import axios from 'axios';

// Configuración centralizada de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Instancia de Axios configurada para las peticiones API
 * El interceptor de autenticación está configurado en axiosConfig.ts
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const API_ENDPOINTS = {
  // Auth
  AUTH: '/auth',
  DOCTOR_AUTH: '/doctor-auth',
  ADMIN_AUTH: '/admin-auth',
  
  // Pacientes
  APPOINTMENTS: '/appointments',
  MEDICAL_HISTORY: '/medical-history',
  PROFILE: '/profile',
  
  // Doctores
  DOCTORS: '/doctors',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_AVAILABILITY: '/doctor/availability',
  DOCTOR_PROFILE: '/doctor/profile',
  
  // Admin
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_APPOINTMENTS: '/admin/citas',
  ADMIN_SPECIALTIES: '/admin/especialidades',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_REPORTS: '/admin/reportes',
  
  // Especialidades
  SPECIALTIES: '/especialidades',
} as const;

export default api;
