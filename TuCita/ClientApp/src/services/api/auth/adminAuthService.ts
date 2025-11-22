import axios from 'axios';

const API_URL = '/api/auth/admin';

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  token: string;
  role: string;
}

/**
 * Servicio de autenticación específico para administradores
 * Maneja login, logout y estado de autenticación de admins
 */
class AdminAuthService {
  /**
   * Iniciar sesión como administrador
   * @param data Credenciales de login (email y contraseña)
   * @returns Información del admin autenticado con token JWT
   */
  async login(data: AdminLoginData): Promise<AdminAuthResponse> {
    try {
      const response = await axios.post<AdminAuthResponse>(`${API_URL}/login`, data);
      
      console.log('? Respuesta del servidor (Admin):', response.data);
      
      if (response.data.token) {
        // Formatear datos para consistencia en la aplicación
        const formattedData: AdminAuthResponse = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          avatar: response.data.avatar,
          token: response.data.token,
          role: 'admin',
        };
        
        // Guardar token y datos del admin en localStorage
        localStorage.setItem('token', formattedData.token);
        localStorage.setItem('user', JSON.stringify(formattedData));
        localStorage.setItem('userRole', 'ADMIN');
        
        console.log('? Datos de admin guardados en localStorage:', formattedData);
        
        return formattedData;
      }
      
      throw new Error('No se recibió token de autenticación');
    } catch (error: any) {
      console.error('? Error en login de admin:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        'Credenciales inválidas o usuario no autorizado como administrador'
      );
    }
  }

  /**
   * Cerrar sesión del admin
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
   * Obtener el admin actual desde localStorage
   * @returns Información del admin o null si no está autenticado
   */
  getCurrentAdmin(): AdminAuthResponse | null {
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    
    if (!user || role !== 'ADMIN') {
      return null;
    }
    
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  /**
   * Obtener el token JWT del admin
   * @returns Token JWT o null si no está autenticado
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si hay un admin autenticado
   * @returns true si hay un admin autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const role = localStorage.getItem('userRole');
    return !!token && role === 'ADMIN';
  }

  /**
   * Verificar si el usuario tiene rol de admin
   * @returns true si tiene rol ADMIN, false en caso contrario
   */
  isAdminRole(): boolean {
    const role = localStorage.getItem('userRole');
    return role === 'ADMIN';
  }

  /**
   * Actualizar información del admin en localStorage
   * Útil después de actualizar el perfil
   * @param admin Información actualizada del admin
   */
  updateAdminInfo(admin: Partial<AdminAuthResponse>): void {
    const currentAdmin = this.getCurrentAdmin();
    if (currentAdmin) {
      const updatedAdmin = { ...currentAdmin, ...admin };
      localStorage.setItem('user', JSON.stringify(updatedAdmin));
    }
  }
}

// Exportar instancia singleton
export const adminAuthService = new AdminAuthService();
export default adminAuthService;
