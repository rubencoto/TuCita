import axios from 'axios';

const API_URL = '/api/auth';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  token: string;
}

export interface RequestPasswordResetData {
  email: string;
}

export interface ValidateResetTokenData {
  token: string;
}

export interface ResetPasswordData {
  token: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/register`, data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/login`, data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Credenciales inv�lidas');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getProfile(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      const response = await axios.get<AuthResponse>(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  }

  async requestPasswordReset(data: RequestPasswordResetData): Promise<void> {
    try {
      await axios.post(`${API_URL}/request-password-reset`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al solicitar recuperaci�n de contrase�a');
    }
  }

  async validateResetToken(data: ValidateResetTokenData): Promise<{ valid: boolean; email?: string; message?: string }> {
    try {
      const response = await axios.post(`${API_URL}/validate-reset-token`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token inv�lido o expirado');
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await axios.post(`${API_URL}/reset-password`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contrase�a');
    }
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
