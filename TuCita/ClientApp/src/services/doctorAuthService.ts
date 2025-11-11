import axios from 'axios';

const API_URL = '/api/auth';

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
  roles: string[];
  numeroLicencia?: string;
  especialidades?: string[];
}

class DoctorAuthService {
  async login(data: DoctorLoginData): Promise<DoctorAuthResponse> {
    try {
      const response = await axios.post<DoctorAuthResponse>(`${API_URL}/login`, data);
      
      // Verificar que el usuario tenga rol de MEDICO
      if (!response.data.roles?.includes('MEDICO') && response.data.role !== 'MEDICO') {
        throw new Error('Acceso denegado. Solo médicos pueden acceder al portal médico.');
      }
      
      if (response.data.token) {
        localStorage.setItem('doctor_token', response.data.token);
        localStorage.setItem('doctor_user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.message?.includes('Acceso denegado')) {
        throw error;
      }
      throw new Error(error.response?.data?.message || 'Credenciales inválidas');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      localStorage.removeItem('doctor_token');
      localStorage.removeItem('doctor_user');
    }
  }

  async getProfile(): Promise<DoctorAuthResponse> {
    try {
      const token = this.getToken();
      const response = await axios.get<DoctorAuthResponse>(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.roles?.includes('MEDICO') && response.data.role !== 'MEDICO') {
        throw new Error('Acceso denegado. Solo médicos pueden acceder al portal médico.');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  }

  getCurrentUser(): DoctorAuthResponse | null {
    const user = localStorage.getItem('doctor_user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('doctor_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && (user?.roles?.includes('MEDICO') || user?.role === 'MEDICO'));
  }
}

export const doctorAuthService = new DoctorAuthService();