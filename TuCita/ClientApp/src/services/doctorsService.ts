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
  availableSlots?: number;
  nextAvailable?: string;
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
  inicio: string; // ISO
  fin: string; // ISO
  estado: string;
  medicoId?: number;
  time?: string; // convenience
}

export interface SearchFilters {
  especialidad?: string;
  ciudad?: string;
  location?: string;
}

const API_BASE = '/api/doctor/turnos';

const doctorsService = {
  /**
   * Obtener lista de doctores con filtros opcionales
   */
  async getDoctors(filters?: SearchFilters): Promise<Doctor[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.especialidad) params.append('specialty', filters.especialidad);
      if (filters?.ciudad || filters?.location) {
        params.append('location', filters.ciudad || filters.location || '');
      }

      const response = await api.get(`/api/doctors?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un doctor específico
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

  async getTurnos(doctorId?: number): Promise<AgendaTurno[]> {
    try {
      const res = await api.get(API_BASE, { params: { doctorId } });
      return (res.data || []).map((r: any) => ({
        id: r.id,
        inicio: r.inicio,
        fin: r.fin,
        estado: r.estado,
        medicoId: r.medicoId,
        time: r.timeSlot || undefined
      }));
    } catch (err) {
      console.error('Error fetching turnos:', err);
      return [];
    }
  },

  async getTurnoById(id: number): Promise<AgendaTurno | null> {
    try {
      const res = await api.get(`${API_BASE}/${id}`);
      const r = res.data;
      return r ? { id: r.id, inicio: r.inicio, fin: r.fin, estado: r.estado, medicoId: r.medicoId, time: r.timeSlot } : null;
    } catch (err) {
      console.error(`Error fetching turno ${id}:`, err);
      return null;
    }
  },

  async createTurno(payload: { medicoId: number; inicio: string; fin: string }): Promise<AgendaTurno> {
    try {
      const res = await api.post(API_BASE, payload);
      const r = res.data;
      return { id: r.id, inicio: r.inicio, fin: r.fin, estado: r.estado, medicoId: r.medicoId, time: r.timeSlot };
    } catch (err) {
      console.error('Error creating turno:', err);
      throw err;
    }
  },

  async updateTurno(id: number, payload: { inicio: string; fin: string; estado?: string }): Promise<AgendaTurno> {
    try {
      const res = await api.put(`${API_BASE}/${id}`, payload);
      const r = res.data;
      return { id: r.id, inicio: r.inicio, fin: r.fin, estado: r.estado, medicoId: r.medicoId, time: r.timeSlot };
    } catch (err) {
      console.error(`Error updating turno ${id}:`, err);
      throw err;
    }
  },

  async deleteTurno(id: number): Promise<boolean> {
    try {
      const res = await api.delete(`${API_BASE}/${id}`);
      return res.status === 200 || res.status === 204;
    } catch (err) {
      console.error(`Error deleting turno ${id}:`, err);
      return false;
    }
  },

  /**
   * Obtener turnos disponibles para un doctor en una fecha específica
   */
  async getAvailableSlots(
    doctorId: number,
    fecha: Date
  ): Promise<AgendaTurno[]> {
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const response = await api.get(
        `/api/doctors/${doctorId}/slots?fecha=${fechaStr}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener turnos disponibles:', error);
      return [];
    }
  },

  /**
   * Obtener turnos disponibles para un rango de fechas
   */
  async getAvailableSlotsRange(
    doctorId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, AgendaTurno[]>> {
    try {
      const slots: Record<string, AgendaTurno[]> = {};
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const daySlots = await doctorsService.getAvailableSlots(doctorId, new Date(currentDate));
        if (daySlots.length > 0) {
          slots[dateKey] = daySlots;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return slots;
    } catch (error) {
      console.error('Error al obtener turnos disponibles por rango:', error);
      return {};
    }
  }
};

export default doctorsService;
