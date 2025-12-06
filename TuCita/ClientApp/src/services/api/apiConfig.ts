import axiosInstance from './axiosConfig';

// Keep a small constant for other modules if needed
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

// Export the configured axios instance (with auth/interceptors)
export default axiosInstance;
