import axiosInstance from '../axiosConfig';

export interface UpdateProfileRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string; // ISO date string
  identificacion?: string;
  telefonoEmergencia?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  identificacion?: string;
  telefonoEmergencia?: string;
  creadoEn: string;
  actualizadoEn: string;
}

class ProfileService {
  /**
   * Obtener información del perfil del usuario autenticado
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await axiosInstance.get<ProfileResponse>('/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil');
    }
  }

  /**
   * Actualizar información del perfil
   */
  async updateProfile(data: UpdateProfileRequest): Promise<any> {
    try {
      const response = await axiosInstance.put('/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await axiosInstance.post('/profile/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  }
}

const profileService = new ProfileService();
export default profileService;
