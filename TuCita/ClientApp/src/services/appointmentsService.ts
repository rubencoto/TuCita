import api from './axiosConfig';

export interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialty: string[];
  doctorImage: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no_show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup';
  motivo?: string;
  inicio: string;
  fin: string;
  medicoId: number;
  pacienteId: number;
  sedeId: number;
}

export interface CreateAppointmentRequest {
  turnoId: number;
  medicoId: number;
  sedeId: number;
  motivo?: string;
  inicio: string;
  fin: string;
}

export interface UpdateAppointmentRequest {
  estado?: string;
  inicio?: string;
  fin?: string;
  motivo?: string;
}

const appointmentsService = {
  /**
   * Obtener todas las citas del usuario autenticado
   */
  async getMyAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/api/appointments');
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  /**
   * Obtener una cita espec�fica por ID
   */
  async getAppointmentById(id: number): Promise<Appointment | null> {
    try {
      const response = await api.get(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener cita ${id}:`, error);
      return null;
    }
  },

  /**
   * Crear una nueva cita
   */
  async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await api.post('/api/appointments', request);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  /**
   * Actualizar una cita existente
   */
  async updateAppointment(
    id: number,
    request: UpdateAppointmentRequest
  ): Promise<Appointment> {
    try {
      const response = await api.put(`/api/appointments/${id}`, request);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar cita ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancelar una cita
   */
  async cancelAppointment(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`/api/appointments/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Error al cancelar cita ${id}:`, error);
      return false;
    }
  },

  /**
   * Reprogramar una cita (cambiar de estado a REPROGRAMADA)
   */
  async rescheduleAppointment(id: number): Promise<Appointment | null> {
    try {
      const response = await api.put(`/api/appointments/${id}`, {
        estado: 'REPROGRAMADA'
      });
      return response.data;
    } catch (error) {
      console.error(`Error al reprogramar cita ${id}:`, error);
      return null;
    }
  },
};

export default appointmentsService;
