import api from '../axiosConfig';

// ==========================================
// Types & Interfaces
// ==========================================

export interface PacienteInfo {
  id: number;
  nombre: string;
  edad?: number;
  foto?: string;
  correo?: string;
  telefono?: string;
  identificacion?: string;
}

export interface DoctorAppointment {
  id: number;
  paciente: PacienteInfo;
  fecha: string;
  hora: string;
  estado: string;
  motivo?: string;
  observaciones?: string;
  inicio: string;
  fin: string;
}

export interface CreateDoctorAppointmentRequest {
  pacienteId: number;
  fecha: string; // ISO date string
  hora: string; // HH:mm format
  motivo?: string;
  observaciones?: string;
  estado?: string;
}

export interface UpdateAppointmentStatusRequest {
  estado: string;
  observaciones?: string;
}

export interface DoctorPatient {
  idPaciente: number;
  nombre: string;
  correo: string;
  telefono?: string;
}

// Medical History Types
export interface DiagnosticoDto {
  id: number;
  citaId: number;
  codigo?: string;
  descripcion: string;
  fecha: string;
}

export interface NotaClinicaDto {
  id: number;
  citaId: number;
  contenido: string;
  fecha: string;
}

export interface RecetaItemDto {
  id: number;
  medicamento: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  notas?: string;
}

export interface RecetaDto {
  id: number;
  citaId: number;
  indicaciones?: string;
  fecha: string;
  medicamentos: RecetaItemDto[];
}

export interface DocumentoDto {
  id: number;
  citaId: number;
  categoria: 'LAB' | 'IMAGEN' | 'REFERENCIA' | 'CONSTANCIA' | 'OTRO';
  nombreArchivo: string;
  mimeType: string;
  tamanoBytes: number;
  notas?: string;
  fechaSubida: string;
  etiquetas: string[];
}

export interface CreateDiagnosticoRequest {
  citaId: number;
  codigo?: string;
  descripcion: string;
}

export interface CreateNotaClinicaRequest {
  citaId: number;
  contenido: string;
}

export interface CreateRecetaItemRequest {
  medicamento: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  notas?: string;
}

export interface CreateRecetaRequest {
  citaId: number;
  indicaciones?: string;
  medicamentos: CreateRecetaItemRequest[];
}

export interface CreateDocumentoRequest {
  citaId: number;
  categoria: 'LAB' | 'IMAGEN' | 'REFERENCIA' | 'CONSTANCIA' | 'OTRO';
  nombreArchivo: string;
  mimeType: string;
  tamanoBytes: number;
  storageId: number;
  blobNombre: string;
  blobCarpeta?: string;
  blobContainer: string;
  notas?: string;
  etiquetas?: string[];
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

// ==========================================
// Doctor Appointments Service
// ==========================================

const API_BASE = '/api/doctor/appointments';

class DoctorAppointmentsService {
  /**
   * Obtiene todas las citas del doctor autenticado
   * @param fechaInicio Filtro opcional por fecha de inicio
   * @param fechaFin Filtro opcional por fecha de fin
   * @param estado Filtro opcional por estado
   */
  async getDoctorAppointments(
    fechaInicio?: string,
    fechaFin?: string,
    estado?: string
  ): Promise<DoctorAppointment[]> {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (estado) params.append('estado', estado);

      const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<DoctorAppointment[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener citas del doctor:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener citas del doctor'
      );
    }
  }

  /**
   * Obtiene las citas del día actual del doctor
   */
  async getTodayAppointments(): Promise<DoctorAppointment[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      return await this.getDoctorAppointments(
        this.formatDateForBackend(startOfDay),
        this.formatDateForBackend(endOfDay)
      );
    } catch (error: any) {
      console.error('Error al obtener citas del día:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener citas del día'
      );
    }
  }

  /**
   * Calcula las estadísticas del dashboard
   */
  calculateDashboardStats(appointments: DoctorAppointment[]): DashboardStats {
    return {
      total: appointments.length,
      completed: appointments.filter(a => a.estado === 'ATENDIDA').length,
      pending: appointments.filter(a => 
        a.estado === 'CONFIRMADA' || a.estado === 'PENDIENTE'
      ).length,
      cancelled: appointments.filter(a => a.estado === 'CANCELADA').length,
    };
  }

  /**
   * Obtiene la lista de pacientes que han tenido citas con el doctor
   */
  async getDoctorPatients(): Promise<DoctorPatient[]> {
    try {
      const response = await api.get<DoctorPatient[]>(`${API_BASE}/patients`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener pacientes del doctor:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener pacientes del doctor'
      );
    }
  }

  /**
   * Obtiene el detalle completo de una cita específica
   * @param citaId ID de la cita
   */
  async getAppointmentDetail(citaId: number): Promise<any> {
    try {
      const response = await api.get(`${API_BASE}/${citaId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener detalle de cita:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener detalle de cita'
      );
    }
  }

  /**
   * Crea una nueva cita manualmente desde el panel del doctor
   * @param request Datos de la cita a crear
   */
  async createDoctorAppointment(
    request: CreateDoctorAppointmentRequest
  ): Promise<DoctorAppointment> {
    try {
      console.log('?? Creando cita manual:', request);
      const response = await api.post<DoctorAppointment>(API_BASE, request);
      console.log('? Cita creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('? Error al crear cita manual:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear cita manual'
      );
    }
  }

  /**
   * Actualiza el estado de una cita
   * @param citaId ID de la cita
   * @param request Nuevo estado y observaciones
   */
  async updateAppointmentStatus(
    citaId: number,
    request: UpdateAppointmentStatusRequest
  ): Promise<boolean> {
    try {
      console.log(`?? Actualizando estado de cita ${citaId}:`, request);
      const response = await api.put(`${API_BASE}/${citaId}/status`, request);
      console.log('? Estado actualizado');
      return response.status === 200;
    } catch (error: any) {
      console.error('? Error al actualizar estado:', error);
      throw new Error(
        error.response?.data?.message || 'Error al actualizar estado de cita'
      );
    }
  }

  // ==========================================
  // Medical History Methods
  // ==========================================

  /**
   * Crea un nuevo diagnóstico para una cita
   * @param citaId ID de la cita
   * @param request Datos del diagnóstico
   */
  async createDiagnostico(
    citaId: number,
    request: Omit<CreateDiagnosticoRequest, 'citaId'>
  ): Promise<DiagnosticoDto> {
    try {
      console.log(`?? Creando diagnóstico para cita ${citaId}:`, request);
      const response = await api.post<DiagnosticoDto>(
        `${API_BASE}/${citaId}/diagnostico`,
        { ...request, citaId }
      );
      console.log('? Diagnóstico creado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('? Error al crear diagnóstico:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear diagnóstico'
      );
    }
  }

  /**
   * Crea una nueva nota clínica para una cita
   * @param citaId ID de la cita
   * @param request Datos de la nota
   */
  async createNotaClinica(
    citaId: number,
    request: Omit<CreateNotaClinicaRequest, 'citaId'>
  ): Promise<NotaClinicaDto> {
    try {
      console.log(`?? Creando nota clínica para cita ${citaId}:`, request);
      const response = await api.post<NotaClinicaDto>(
        `${API_BASE}/${citaId}/nota`,
        { ...request, citaId }
      );
      console.log('? Nota clínica creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('? Error al crear nota clínica:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear nota clínica'
      );
    }
  }

  /**
   * Crea una nueva receta con medicamentos para una cita
   * @param citaId ID de la cita
   * @param request Datos de la receta
   */
  async createReceta(
    citaId: number,
    request: Omit<CreateRecetaRequest, 'citaId'>
  ): Promise<RecetaDto> {
    try {
      console.log(`?? Creando receta para cita ${citaId}:`, request);
      const response = await api.post<RecetaDto>(
        `${API_BASE}/${citaId}/receta`,
        { ...request, citaId }
      );
      console.log('? Receta creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('? Error al crear receta:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear receta'
      );
    }
  }

  /**
   * Sube un documento médico para una cita
   * @param citaId ID de la cita
   * @param request Datos del documento
   */
  async uploadDocument(
    citaId: number,
    request: Omit<CreateDocumentoRequest, 'citaId'>
  ): Promise<DocumentoDto> {
    try {
      console.log(`?? Subiendo documento para cita ${citaId}:`, request);
      const response = await api.post<DocumentoDto>(
        `${API_BASE}/${citaId}/documento`,
        { ...request, citaId }
      );
      console.log('? Documento subido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('? Error al subir documento:', error);
      throw new Error(
        error.response?.data?.message || 'Error al subir documento'
      );
    }
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Formatea una fecha para el backend (YYYY-MM-DD)
   */
  formatDateForBackend(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formatea una hora para el backend (HH:mm)
   */
  formatTimeForBackend(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  /**
   * Convierte una fecha y hora separadas en un objeto Date
   */
  combineDateAndTime(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  /**
   * Obtiene el label en español del estado
   */
  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'CONFIRMADA': 'Confirmada',
      'EN_PROGRESO': 'En progreso',
      'ATENDIDA': 'Atendida',
      'CANCELADA': 'Cancelada',
      'NO_SHOW': 'No asistió'
    };
    return labels[estado.toUpperCase()] || estado;
  }

  /**
   * Obtiene la clase de color para el badge del estado
   */
  getEstadoColorClass(estado: string): string {
    const colors: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CONFIRMADA': 'bg-blue-100 text-blue-800 border-blue-200',
      'EN_PROGRESO': 'bg-purple-100 text-purple-800 border-purple-200',
      'ATENDIDA': 'bg-green-100 text-green-800 border-green-200',
      'CANCELADA': 'bg-red-100 text-red-800 border-red-200',
      'NO_SHOW': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[estado.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Formatea una fecha en español
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Formatea una fecha y hora en español
   */
  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Convierte hora en formato HH:mm a TimeSpan para el backend
   */
  convertTimeToTimeSpan(timeStr: string): string {
    // El backend espera formato HH:mm:ss
    return `${timeStr}:00`;
  }
}

// Exportar instancia singleton
export const doctorAppointmentsService = new DoctorAppointmentsService();
export default doctorAppointmentsService;
