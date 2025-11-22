import api from '../axiosConfig';

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
  TurnoId: number; // PascalCase para coincidir con el backend C#
  DoctorId: number; // PascalCase para coincidir con el backend C#
  Motivo?: string; // PascalCase para coincidir con el backend C#
}

export interface UpdateAppointmentRequest {
  estado?: string;
  inicio?: string;
  fin?: string;
  motivo?: string;
}

export interface RescheduleAppointmentRequest {
  NewTurnoId: number; // PascalCase para coincidir con el backend C#
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
   * Obtener una cita específica por ID
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
      console.log('🔵 appointmentsService.createAppointment - Request:', request);
      const response = await api.post('/api/appointments', request);
      console.log('🟢 appointmentsService.createAppointment - Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔴 appointmentsService.createAppointment - Error:', error);
      console.error('🔴 Error response:', error.response?.data);
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

  /**
   * Reagendar una cita (cambiar a un nuevo turno)
   */
  async rescheduleAppointmentToNewSlot(
    id: number,
    newTurnoId: number
  ): Promise<Appointment | null> {
    try {
      console.log('🔄 Reagendando cita:', { id, newTurnoId });
      const response = await api.post(`/api/appointments/${id}/reschedule`, {
        NewTurnoId: newTurnoId
      });
      console.log('✅ Cita reagendada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al reagendar cita ${id}:`, error);
      return null;
    }
  },
};

export default appointmentsService;
