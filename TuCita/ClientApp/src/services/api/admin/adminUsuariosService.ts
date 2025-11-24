import apiClient from '@/services/api/axiosConfig';

// ========================================
// INTERFACES / TYPES
// ========================================

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  activo: boolean;
  roles: string[];
  creadoEn: string;
  actualizadoEn: string;
  // Doctor fields
  numeroLicencia?: string;
  especialidades?: string[];
  // Paciente fields
  identificacion?: string;
  fechaNacimiento?: string;
}

export interface CrearUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  roles: string[];
  // Doctor fields
  numeroLicencia?: string;
  biografia?: string;
  direccion?: string;
  especialidadesIds?: number[];
  // Paciente fields
  identificacion?: string;
  fechaNacimiento?: string;
  telefonoEmergencia?: string;
}

export interface ActualizarUsuarioDto extends CrearUsuarioDto {
  activo: boolean;
}

export interface FiltrosUsuarios {
  busqueda?: string;
  rol?: string;
  activo?: boolean;
  pagina?: number;
  tamanoPagina?: number;
}

export interface UsuariosPaginados {
  usuarios: Usuario[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

// ========================================
// SERVICE
// ========================================

const adminUsuariosService = {
  /**
   * Obtiene usuarios con filtros y paginación
   */
  async getUsuarios(filtros: FiltrosUsuarios = {}): Promise<UsuariosPaginados> {
    const response = await apiClient.get('/admin/usuarios', { params: filtros });
    return response.data;
  },

  /**
   * Obtiene un usuario por ID
   */
  async getUsuarioById(id: number): Promise<Usuario> {
    const response = await apiClient.get(`/admin/usuarios/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo usuario
   */
  async createUsuario(data: CrearUsuarioDto): Promise<Usuario> {
    const response = await apiClient.post('/admin/usuarios', data);
    return response.data;
  },

  /**
   * Actualiza un usuario existente
   */
  async updateUsuario(id: number, data: ActualizarUsuarioDto): Promise<Usuario> {
    const response = await apiClient.put(`/admin/usuarios/${id}`, data);
    return response.data;
  },

  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  async cambiarEstado(id: number, activo: boolean): Promise<{ message: string }> {
    const response = await apiClient.patch(`/admin/usuarios/${id}/estado`, { activo });
    return response.data;
  },

  /**
   * Cambia la contraseña de un usuario
   */
  async cambiarPassword(id: number, nuevaPassword: string): Promise<{ message: string }> {
    const response = await apiClient.patch(`/admin/usuarios/${id}/password`, { nuevaPassword });
    return response.data;
  },

  /**
   * Elimina un usuario del sistema
   */
  async deleteUsuario(id: number): Promise<void> {
    await apiClient.delete(`/admin/usuarios/${id}`);
  },

  /**
   * Verifica si un email ya existe
   */
  async existeEmail(email: string, excludeId?: number): Promise<boolean> {
    const response = await apiClient.get('/admin/usuarios/existe-email', {
      params: { email, excludeId }
    });
    return response.data.existe;
  }
};

export default adminUsuariosService;
