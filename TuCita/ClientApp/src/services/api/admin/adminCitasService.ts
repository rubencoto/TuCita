import api from '@/services/api/apiConfig';

// ============================
// INTERFACES / TYPES
// ============================

export interface PacienteSearch {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  identificacion?: string;
}

export interface DoctorConEspecialidad {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  especialidades: string[];
}

export interface SlotDisponible {
  turnoId: number;
  inicio: string;
  fin: string;
  hora: string;
  horaFin: string;
}

export interface CreateCitaAdminRequest {
  pacienteId: number;
  medicoId: number;
  turnoId: number;
  motivo?: string;
  notasInternas?: string;
  enviarEmail: boolean;
}

export interface CitaCreada {
  citaId: number;
  pacienteId: number;
  nombrePaciente: string;
  medicoId: number;
  nombreMedico: string;
  inicio: string;
  fin: string;
  estado: string;
  motivo?: string;
  emailEnviado: boolean;
}

export interface AdminCitaList {
  id: number;
  paciente: string;
  pacienteId: number;
  doctor: string;
  medicoId: number;
  especialidad: string;
  fecha: string;
  fechaStr: string;
  hora: string;
  estado: string;
  motivo?: string;
  origen: 'PACIENTE' | 'ADMIN';
}

export interface UpdateEstadoCitaRequest {
  estado: string;
  notas?: string;
}

export interface CitasFilter {
  fechaDesde?: string;
  fechaHasta?: string;
  medicoId?: number;
  pacienteId?: number;
  estado?: string;
  busqueda?: string;
  pagina?: number;
  tamanoPagina?: number;
}

export interface CitasPaginadas {
  citas: AdminCitaList[];
  totalRegistros: number;
  paginaActual: number;
  totalPaginas: number;
  tamanoPagina: number;
}

// ============================
// ADMIN CITAS SERVICE
// ============================

const adminCitasService = {
  /**
   * Busca pacientes por nombre, email o identificación
   * @param searchTerm Término de búsqueda (mínimo 2 caracteres)
   */
  searchPacientes: async (searchTerm: string): Promise<PacienteSearch[]> => {
    try {
      const response = await api.get<PacienteSearch[]>(
        '/api/admin/citas/pacientes/search',
        {
          params: { q: searchTerm }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar pacientes:', error);
      throw new Error(
        error.response?.data?.error || 'Error al buscar pacientes'
      );
    }
  },

  /**
   * Obtiene todos los doctores activos con sus especialidades
   */
  getDoctores: async (): Promise<DoctorConEspecialidad[]> => {
    try {
      const response = await api.get<DoctorConEspecialidad[]>(
        '/api/admin/citas/doctores'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener doctores:', error);
      throw new Error(
        error.response?.data?.error || 'Error al obtener doctores'
      );
    }
  },

  /**
   * Obtiene doctores filtrados por especialidad
   * @param especialidadId ID de la especialidad
   */
  getDoctoresByEspecialidad: async (
    especialidadId: number
  ): Promise<DoctorConEspecialidad[]> => {
    try {
      const response = await api.get<DoctorConEspecialidad[]>(
        `/api/admin/citas/doctores/especialidad/${especialidadId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener doctores por especialidad:', error);
      throw new Error(
        error.response?.data?.error || 'Error al obtener doctores'
      );
    }
  },

  /**
   * Obtiene slots disponibles de un doctor para una fecha específica
   * @param medicoId ID del médico
   * @param fecha Fecha en formato yyyy-MM-dd
   */
  getSlotsDisponibles: async (
    medicoId: number,
    fecha: string
  ): Promise<SlotDisponible[]> => {
    try {
      const response = await api.get<SlotDisponible[]>(
        `/api/admin/citas/doctores/${medicoId}/slots`,
        {
          params: { fecha }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener slots disponibles:', error);
      throw new Error(
        error.response?.data?.error || 'Error al obtener horarios disponibles'
      );
    }
  },

  /**
   * Crea una nueva cita desde el panel de administración
   * @param citaData Datos de la cita a crear
   */
  createCita: async (
    citaData: CreateCitaAdminRequest
  ): Promise<CitaCreada> => {
    try {
      const response = await api.post<CitaCreada>(
        '/api/admin/citas',
        citaData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      throw new Error(
        error.response?.data?.error || 'Error al crear la cita'
      );
    }
  },

  /**
   * Obtiene todas las citas con filtros y paginación
   * @param filtros Filtros de búsqueda
   */
  getCitasPaginadas: async (
    filtros: CitasFilter = {}
  ): Promise<CitasPaginadas> => {
    try {
      const response = await api.get<CitasPaginadas>('/api/admin/citas', {
        params: filtros
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener citas:', error);
      throw new Error(
        error.response?.data?.error || 'Error al obtener citas'
      );
    }
  },

  /**
   * Obtiene el detalle de una cita específica
   * @param citaId ID de la cita
   */
  getCitaDetalle: async (citaId: number): Promise<AdminCitaList> => {
    try {
      const response = await api.get<AdminCitaList>(
        `/api/admin/citas/${citaId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener detalle de cita:', error);
      throw new Error(
        error.response?.data?.error || 'Error al obtener detalle de la cita'
      );
    }
  },

  /**
   * Actualiza el estado de una cita
   * @param citaId ID de la cita
   * @param updateData Datos de actualización
   */
  updateEstadoCita: async (
    citaId: number,
    updateData: UpdateEstadoCitaRequest
  ): Promise<void> => {
    try {
      await api.patch(`/api/admin/citas/${citaId}/estado`, updateData);
    } catch (error: any) {
      console.error('Error al actualizar estado de cita:', error);
      throw new Error(
        error.response?.data?.error || 'Error al actualizar estado de la cita'
      );
    }
  },

  /**
   * Cancela (elimina) una cita
   * @param citaId ID de la cita
   */
  deleteCita: async (citaId: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/citas/${citaId}`);
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      throw new Error(
        error.response?.data?.error || 'Error al cancelar la cita'
      );
    }
  }
};

export default adminCitasService;
