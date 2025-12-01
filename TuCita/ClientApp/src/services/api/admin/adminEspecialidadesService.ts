import apiClient from '@/services/api/axiosConfig';

const API_URL = '/admin/especialidades';

export interface EspecialidadDto {
  id: number;
  nombre: string;
  doctoresAsignados: number;
}

export interface CrearEspecialidadDto {
  nombre: string;
}

export interface ActualizarEspecialidadDto {
  nombre: string;
}

/**
 * Servicio para gestionar especialidades desde el panel de administración
 */
class AdminEspecialidadesService {
  /**
   * Obtiene todas las especialidades
   */
  async getAllEspecialidades(): Promise<EspecialidadDto[]> {
    const response = await apiClient.get<EspecialidadDto[]>(API_URL);
    return response.data;
  }

  /**
   * Obtiene una especialidad por ID
   */
  async getEspecialidadById(id: number): Promise<EspecialidadDto> {
    const response = await apiClient.get<EspecialidadDto>(`${API_URL}/${id}`);
    return response.data;
  }

  /**
   * Crea una nueva especialidad
   */
  async createEspecialidad(dto: CrearEspecialidadDto): Promise<EspecialidadDto> {
    const response = await apiClient.post<EspecialidadDto>(API_URL, dto);
    return response.data;
  }

  /**
   * Actualiza una especialidad existente
   */
  async updateEspecialidad(id: number, dto: ActualizarEspecialidadDto): Promise<EspecialidadDto> {
    const response = await apiClient.put<EspecialidadDto>(`${API_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Elimina una especialidad
   */
  async deleteEspecialidad(id: number): Promise<void> {
    await apiClient.delete(`${API_URL}/${id}`);
  }

  /**
   * Verifica si existe una especialidad con el nombre especificado
   */
  async existeEspecialidad(nombre: string, excludeId?: number): Promise<boolean> {
    const params: any = { nombre };
    if (excludeId !== undefined) {
      params.excludeId = excludeId;
    }

    const response = await apiClient.get<{ existe: boolean }>(`${API_URL}/existe`, { params });
    return response.data.existe;
  }
}

export default new AdminEspecialidadesService();
