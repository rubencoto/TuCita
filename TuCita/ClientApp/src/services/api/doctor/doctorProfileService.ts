import api from '../axiosConfig';

// ==========================================
// Types & Interfaces
// ==========================================

export interface DoctorProfileResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar?: string;
  numeroLicencia?: string;
  biografia?: string;
  direccion?: string;
  especialidades: string[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface UpdateDoctorProfileRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  numeroLicencia?: string;
  biografia?: string;
  direccion?: string;
  especialidadIds?: number[];
}

export interface ChangeDoctorPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Especialidad {
  id: number;
  nombre: string;
}

// ==========================================
// Doctor Profile Service
// ==========================================

const API_BASE = '/doctor/profile';

class DoctorProfileService {
  /**
   * Obtener el perfil del doctor autenticado
   * @returns Perfil completo del doctor
   */
  async getProfile(): Promise<DoctorProfileResponse> {
    try {
      const response = await api.get<DoctorProfileResponse>(API_BASE);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener perfil del doctor:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener el perfil del doctor'
      );
    }
  }

  /**
   * Actualizar el perfil del doctor autenticado
   * @param data Datos del perfil a actualizar
   * @returns Perfil actualizado del doctor
   */
  async updateProfile(data: UpdateDoctorProfileRequest): Promise<DoctorProfileResponse> {
    try {
      // Convertir a PascalCase para coincidir con el backend
      const requestData = {
        Nombre: data.nombre,
        Apellido: data.apellido,
        Email: data.email,
        Telefono: data.telefono,
        NumeroLicencia: data.numeroLicencia,
        Biografia: data.biografia,
        Direccion: data.direccion,
        EspecialidadIds: data.especialidadIds
      };

      console.log('?? Enviando datos al servidor:', requestData);

      const response = await api.put<DoctorProfileResponse>(API_BASE, requestData);
      
      console.log('? Respuesta del servidor:', response.data);

      // Actualizar información en localStorage si es necesario
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        user.name = `${data.nombre} ${data.apellido}`;
        user.email = data.email;
        user.phone = data.telefono;
        user.numeroLicencia = data.numeroLicencia;
        user.biografia = data.biografia;
        user.direccion = data.direccion;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('? Error al actualizar perfil del doctor:', error);
      console.error('?? Error response:', error.response);
      console.error('?? Error data:', error.response?.data);
      console.error('?? Error status:', error.response?.status);
      
      throw new Error(
        error.response?.data?.message || error.response?.data?.title || 'Error interno del servidor'
      );
    }
  }

  /**
   * Cambiar la contraseña del doctor
   * @param data Datos para cambiar la contraseña
   */
  async changePassword(data: ChangeDoctorPasswordRequest): Promise<void> {
    try {
      await api.post('/profile/change-password', data);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      throw new Error(
        error.response?.data?.message || 'Error al cambiar la contraseña'
      );
    }
  }

  /**
   * Obtener lista de todas las especialidades disponibles
   * @returns Lista de especialidades
   */
  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const response = await api.get<Especialidad[]>('/especialidades');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener especialidades:', error);
      // Retornar lista por defecto si falla
      return [
        { id: 1, nombre: 'Medicina General' },
        { id: 2, nombre: 'Cardiología' },
        { id: 3, nombre: 'Dermatología' },
        { id: 4, nombre: 'Pediatría' },
        { id: 5, nombre: 'Ginecología' },
        { id: 6, nombre: 'Traumatología' },
      ];
    }
  }

  /**
   * Subir foto de perfil del doctor
   * @param file Archivo de imagen
   * @returns URL de la imagen subida
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<{ url: string }>('/doctor/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error: any) {
      console.error('Error al subir avatar:', error);
      throw new Error(
        error.response?.data?.message || 'Error al subir la imagen de perfil'
      );
    }
  }

  /**
   * Formatear nombre completo del doctor
   * @param profile Perfil del doctor
   * @returns Nombre completo formateado
   */
  getFullName(profile: DoctorProfileResponse): string {
    return `${profile.nombre} ${profile.apellido}`;
  }

  /**
   * Obtener iniciales del doctor para avatar
   * @param profile Perfil del doctor
   * @returns Iniciales (ej: "JD" para Juan Díaz)
   */
  getInitials(profile: DoctorProfileResponse): string {
    const firstInitial = profile.nombre.charAt(0).toUpperCase();
    const lastInitial = profile.apellido.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Formatear fecha de registro
   * @param dateString Fecha en formato ISO
   * @returns Fecha formateada
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Validar formato de email
   * @param email Email a validar
   * @returns true si es válido, false en caso contrario
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar formato de teléfono
   * @param phone Teléfono a validar
   * @returns true si es válido, false en caso contrario
   */
  isValidPhone(phone: string): boolean {
    // Si está vacío, es válido (campo opcional)
    if (!phone || phone.trim() === '') {
      return true;
    }
    
    // Limpiar el teléfono de espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Acepta formatos internacionales con + y números de 8 a 15 dígitos
    // Ejemplos válidos: +506 8888-8888, (506) 8888-8888, 88888888, +1 234 567 8900
    const phoneRegex = /^(\+?\d{1,4})?\d{8,15}$/;
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Validar requisitos de contraseña
   * @param password Contraseña a validar
   * @returns Objeto con validación y mensaje de error
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return {
        valid: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'La contraseña debe contener al menos una letra mayúscula'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: 'La contraseña debe contener al menos una letra minúscula'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: 'La contraseña debe contener al menos un número'
      };
    }

    return { valid: true };
  }
}

// Exportar instancia singleton
export const doctorProfileService = new DoctorProfileService();
export default doctorProfileService;
