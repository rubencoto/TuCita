import api from './axiosConfig';

export interface Doctor {
  id: number;
  nombre: string;
  especialidades: string[];
  numeroLicencia?: string;
  biografia?: string;
  sedes: Sede[];
  telefono?: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  experienceYears: string;
}

export interface Sede {
  id: number;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  telefono?: string;
  activa: boolean;
  location: string;
}

export interface AgendaTurno {
  id: number;
  inicio: string;
  fin: string;
  estado: string;
}

export interface SearchFilters {
  especialidad?: string;
  ciudad?: string;
}

const doctorsService = {
  /**
   * Obtener lista de doctores con filtros opcionales
   */
  async getDoctors(filters?: SearchFilters): Promise<Doctor[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.especialidad) params.append('especialidad', filters.especialidad);
      if (filters?.ciudad) params.append('ciudad', filters.ciudad);

      const response = await api.get(`/api/doctors?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un doctor espec�fico
   */
  async getDoctorById(id: number): Promise<Doctor | null> {
    try {
      const response = await api.get(`/api/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener doctor ${id}:`, error);
      return null;
    }
  },

  /**
   * Obtener lista de especialidades disponibles
   */
  async getSpecialties(): Promise<string[]> {
    try {
      const response = await api.get('/api/doctors/specialties');
      return response.data;
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      return [];
    }
  },

  /**
   * Obtener turnos disponibles para un doctor en una sede espec�fica
   */
  async getAvailableSlots(
    doctorId: number,
    sedeId: number,
    fecha: Date
  ): Promise<AgendaTurno[]> {
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const response = await api.get(
        `/api/doctors/${doctorId}/available-slots?sedeId=${sedeId}&fecha=${fechaStr}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener turnos disponibles:', error);
      return [];
    }
  },
};

export default doctorsService;
