import axiosInstance from './axiosConfig';

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
   * Obtener informaci�n del perfil del usuario autenticado
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
   * Actualizar informaci�n del perfil
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
   * Cambiar contrase�a del usuario
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await axiosInstance.post('/profile/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar la contrase�a');
    }
  }
}

const profileService = new ProfileService();
export default profileService;
