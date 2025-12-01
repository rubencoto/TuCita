import api from '../axiosConfig';

// ==========================================
// Types & Interfaces
// ==========================================

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

export interface HistorialMedicoDto {
  citaId: number;
  fechaCita: string;
  nombreMedico: string;
  especialidad?: string;
  estadoCita: string;
  motivo?: string;
  diagnosticos: DiagnosticoDto[];
  notasClinicas: NotaClinicaDto[];
  recetas: RecetaDto[];
  documentos: DocumentoDto[];
}

export interface HistorialMedicoExtendidoDto {
  citaId: number;
  fechaCita: string;
  nombreMedico: string;
  especialidad?: string;
  estadoCita: string;
  motivo?: string;
  // Información del paciente
  pacienteId: number;
  nombrePaciente: string;
  edadPaciente?: number;
  fotoPaciente?: string;
  diagnosticos: DiagnosticoDto[];
  notasClinicas: NotaClinicaDto[];
  recetas: RecetaDto[];
  documentos: DocumentoDto[];
}

export interface CitaDetalleDto {
  id: number;
  inicio: string;
  fin: string;
  estado: string;
  motivo?: string;
  nombreMedico: string;
  especialidad?: string;
  direccionMedico?: string;
  nombrePaciente: string;
  identificacion?: string;
  diagnosticos: DiagnosticoDto[];
  notasClinicas: NotaClinicaDto[];
  recetas: RecetaDto[];
  documentos: DocumentoDto[];
}

// ==========================================
// Request Types
// ==========================================

export interface CreateNotaClinicaRequest {
  citaId: number;
  contenido: string;
}

export interface CreateDiagnosticoRequest {
  citaId: number;
  codigo?: string;
  descripcion: string;
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
  // AWS S3 fields (replacing Azure Blob fields)
  s3ObjectKey: string;
  s3VersionId?: string;
  s3ETag?: string;
  notas?: string;
  etiquetas?: string[];
}

// ==========================================
// Medical History Service
// ==========================================

const API_BASE = '/historial';

class MedicalHistoryService {
  /**
   * Obtener el historial médico completo de un paciente
   * Solo retorna citas ATENDIDAS
   * @param patientId ID del paciente
   * @returns Lista de citas con información médica completa
   */
  async getPatientMedicalHistory(patientId: number): Promise<HistorialMedicoDto[]> {
    try {
      const response = await api.get<HistorialMedicoDto[]>(
        `${API_BASE}/paciente/${patientId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial médico:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener historial médico'
      );
    }
  }

  /**
   * Obtener el historial médico de un paciente específico para el doctor actual
   * Solo retorna citas ATENDIDAS del doctor con ese paciente
   * @param patientId ID del paciente
   * @returns Lista de citas con información médica completa incluyendo datos del paciente
   */
  async getDoctorPatientHistory(patientId: number): Promise<HistorialMedicoExtendidoDto[]> {
    try {
      const response = await api.get<HistorialMedicoExtendidoDto[]>(
        `${API_BASE}/doctor/paciente/${patientId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial médico del paciente:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener historial médico del paciente'
      );
    }
  }

  /**
   * Obtener el historial médico completo de todos los pacientes del doctor actual
   * Solo retorna citas ATENDIDAS del doctor
   * @returns Lista de citas con información médica completa de todos los pacientes
   */
  async getDoctorAllPatientsHistory(): Promise<HistorialMedicoExtendidoDto[]> {
    try {
      const response = await api.get<HistorialMedicoExtendidoDto[]>(
        `${API_BASE}/doctor/todos-pacientes`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial médico de todos los pacientes:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener historial médico de todos los pacientes'
      );
    }
  }

  /**
   * Obtener los detalles completos de una cita específica
   * Incluye información del paciente, médico y todos los registros médicos
   * @param appointmentId ID de la cita
   * @returns Detalles completos de la cita
   */
  async getAppointmentDetail(appointmentId: number): Promise<CitaDetalleDto> {
    try {
      const response = await api.get<CitaDetalleDto>(
        `${API_BASE}/cita/${appointmentId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener detalle de cita:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener detalle de cita'
      );
    }
  }

  /**
   * Crear una nueva nota clínica (solo médicos)
   * @param request Datos de la nota clínica
   * @returns Nota clínica creada
   */
  async createNotaClinica(request: CreateNotaClinicaRequest): Promise<NotaClinicaDto> {
    try {
      const response = await api.post<NotaClinicaDto>(
        `${API_BASE}/nota`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al crear nota clínica:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear nota clínica'
      );
    }
  }

  /**
   * Crear un nuevo diagnóstico (solo médicos)
   * @param request Datos del diagnóstico
   * @returns Diagnóstico creado
   */
  async createDiagnostico(request: CreateDiagnosticoRequest): Promise<DiagnosticoDto> {
    try {
      const response = await api.post<DiagnosticoDto>(
        `${API_BASE}/diagnostico`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al crear diagnóstico:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear diagnóstico'
      );
    }
  }

  /**
   * Crear una nueva receta con medicamentos (solo médicos)
   * @param request Datos de la receta y medicamentos
   * @returns Receta creada
   */
  async createReceta(request: CreateRecetaRequest): Promise<RecetaDto> {
    try {
      const response = await api.post<RecetaDto>(
        `${API_BASE}/receta`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al crear receta:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear receta'
      );
    }
  }

  /**
   * Subir un documento clínico (solo médicos)
   * @param request Metadatos del documento
   * @returns Documento creado
   */
  async uploadDocument(request: CreateDocumentoRequest): Promise<DocumentoDto> {
    try {
      const response = await api.post<DocumentoDto>(
        `${API_BASE}/documento`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al subir documento:', error);
      throw new Error(
        error.response?.data?.message || 'Error al subir documento'
      );
    }
  }

  /**
   * Eliminar un documento clínico
   * Permisos: Médico que lo creó, paciente de la cita, o admin
   * @param documentId ID del documento
   * @returns True si se eliminó correctamente
   */
  async deleteDocument(documentId: number): Promise<boolean> {
    try {
      const response = await api.delete(
        `${API_BASE}/documento/${documentId}`
      );
      return response.status === 200;
    } catch (error: any) {
      console.error('Error al eliminar documento:', error);
      throw new Error(
        error.response?.data?.message || 'Error al eliminar documento'
      );
    }
  }

  /**
   * Obtener URL de descarga de un documento
   * @param documentId ID del documento
   * @returns URL de descarga temporal
   */
  async getDocumentDownloadUrl(documentId: number): Promise<string> {
    try {
      const response = await api.get<{ url: string }>(
        `${API_BASE}/documento/${documentId}/download`
      );
      return response.data.url;
    } catch (error: any) {
      console.error('Error al obtener URL de descarga:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener URL de descarga'
      );
    }
  }

  /**
   * Descargar un documento
   * @param documentId ID del documento
   * @param nombreArchivo Nombre del archivo para descarga
   */
  async downloadDocument(documentId: number, nombreArchivo: string): Promise<void> {
    try {
      const url = await this.getDocumentDownloadUrl(documentId);
      
      // Crear un link temporal y hacer click en él para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Error al descargar documento:', error);
      throw error;
    }
  }

  /**
   * Ver un documento en una nueva pestaña
   * @param documentId ID del documento
   */
  async viewDocument(documentId: number): Promise<void> {
    try {
      const url = await this.getDocumentDownloadUrl(documentId);
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Error al ver documento:', error);
      throw error;
    }
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Obtener el historial médico del usuario actual
   * Asume que el ID del usuario está en localStorage
   */
  async getCurrentUserMedicalHistory(): Promise<HistorialMedicoDto[]> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Usuario no autenticado');
      }
      
      const user = JSON.parse(userStr);
      return await this.getPatientMedicalHistory(user.id);
    } catch (error: any) {
      console.error('Error al obtener historial del usuario actual:', error);
      throw error;
    }
  }

  /**
   * Formatear fecha para mostrar en la UI
   * @param dateString Fecha en formato ISO
   * @returns Fecha formateada (dd/mm/yyyy)
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatear fecha y hora para mostrar en la UI
   * @param dateString Fecha en formato ISO
   * @returns Fecha y hora formateada (dd/mm/yyyy HH:mm)
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener el nombre de la categoría de documento en español
   * @param categoria Categoría del documento
   * @returns Nombre en español
   */
  getCategoryLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'LAB': 'Laboratorio',
      'IMAGEN': 'Imagen Médica',
      'REFERENCIA': 'Referencia',
      'CONSTANCIA': 'Constancia',
      'OTRO': 'Otro'
    };
    return labels[categoria] || categoria;
  }

  /**
   * Format the file size
   * @param bytes Size in bytes
   * @returns Formatted size (KB, MB)
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Validate if the user can edit medical information
   * Verify if they have DOCTOR or ADMIN role
   */
  canEditMedicalInfo(): boolean {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      
      const user = JSON.parse(userStr);
      // Aquí deberías verificar el rol del usuario
      // Esto depende de cómo esté estructurado tu objeto user
      return user.role === 'DOCTOR' || user.role === 'ADMIN';
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const medicalHistoryService = new MedicalHistoryService();
export default medicalHistoryService;
