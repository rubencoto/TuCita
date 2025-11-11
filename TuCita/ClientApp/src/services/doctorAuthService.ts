import axios from 'axios';

const API_URL = '/api/auth/doctor';

export interface DoctorLoginData {
  email: string;
  password: string;
}

export interface DoctorAuthResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  token: string;
  role: string;
  especialidad?: string;
  numeroLicencia?: string;
  biografia?: string;
  direccion?: string;
  especialidades: string[];
}

/**
 * Servicio de autenticación específico para doctores
 * Maneja login, logout y estado de autenticación de médicos
 */
class DoctorAuthService {
  /**
   * Iniciar sesión como doctor
   * @param data Credenciales de login (email y contraseña)
   * @returns Información del doctor autenticado con token JWT
   */
  async login(data: DoctorLoginData): Promise<DoctorAuthResponse> {
    try {
      const response = await axios.post<DoctorAuthResponse>(`${API_URL}/login`, data);
      
      console.log('?? Respuesta del servidor:', response.data);
      
      if (response.data.token) {
        // Formatear datos para consistencia en la aplicación
        const formattedData: DoctorAuthResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          avatar: response.data.avatar,
          token: response.data.token,
          role: 'doctor',
          especialidad: response.data.especialidad,
          numeroLicencia: response.data.numeroLicencia,
          biografia: response.data.biografia,
          direccion: response.data.direccion,
          especialidades: response.data.especialidades || [],
        };
        
        // Guardar token y datos del doctor en localStorage
        localStorage.setItem('token', formattedData.token);
        localStorage.setItem('user', JSON.stringify(formattedData));
        localStorage.setItem('userRole', 'DOCTOR');
        
        console.log('? Datos guardados en localStorage:', formattedData);
        
        return formattedData;
      }
      
      throw new Error('No se recibió token de autenticación');
    } catch (error: any) {
      console.error('? Error en login de doctor:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        'Credenciales inválidas o usuario no autorizado como médico'
      );
    }
  }

  /**
   * Cerrar sesión del doctor
   * Limpia el localStorage y opcionalmente notifica al backend
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        // Opcional: notificar al backend
        await axios.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
  }

  /**
   * Obtener el doctor actual desde localStorage
   * @returns Información del doctor o null si no está autenticado
   */
  getCurrentDoctor(): DoctorAuthResponse | null {
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    
    if (!user || role !== 'DOCTOR') {
      return null;
    }
    
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  /**
   * Obtener el token JWT del doctor
   * @returns Token JWT o null si no está autenticado
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si hay un doctor autenticado
   * @returns true si hay un doctor autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const role = localStorage.getItem('userRole');
    return !!token && role === 'DOCTOR';
  }

  /**
   * Verificar si el usuario tiene rol de doctor
   * @returns true si tiene rol DOCTOR, false en caso contrario
   */
  isDoctorRole(): boolean {
    const role = localStorage.getItem('userRole');
    return role === 'DOCTOR';
  }

  /**
   * Actualizar información del doctor en localStorage
   * Útil después de actualizar el perfil
   * @param doctor Información actualizada del doctor
   */
  updateDoctorInfo(doctor: Partial<DoctorAuthResponse>): void {
    const currentDoctor = this.getCurrentDoctor();
    if (currentDoctor) {
      const updatedDoctor = { ...currentDoctor, ...doctor };
      localStorage.setItem('user', JSON.stringify(updatedDoctor));
    }
  }
}

// Exportar instancia singleton
export const doctorAuthService = new DoctorAuthService();
export default doctorAuthService;
