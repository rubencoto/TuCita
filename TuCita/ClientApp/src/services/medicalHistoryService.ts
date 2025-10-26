import api from './axiosConfig';

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
  blobNombre: string;
  blobCarpeta?: string;
  blobContainer: string;
  notas?: string;
  etiquetas?: string[];
}

// ==========================================
// Medical History Service
// ==========================================

const API_BASE = '/api/historial';

class MedicalHistoryService {
  /**
   * Obtener el historial m�dico completo de un paciente
   * Solo retorna citas ATENDIDAS
   * @param patientId ID del paciente
   * @returns Lista de citas con informaci�n m�dica completa
   */
  async getPatientMedicalHistory(patientId: number): Promise<HistorialMedicoDto[]> {
    try {
      const response = await api.get<HistorialMedicoDto[]>(
        `${API_BASE}/paciente/${patientId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial m�dico:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener historial m�dico'
      );
    }
  }

  /**
   * Obtener los detalles completos de una cita espec�fica
   * Incluye informaci�n del paciente, m�dico y todos los registros m�dicos
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
   * Crear una nueva nota cl�nica (solo m�dicos)
   * @param request Datos de la nota cl�nica
   * @returns Nota cl�nica creada
   */
  async createNotaClinica(request: CreateNotaClinicaRequest): Promise<NotaClinicaDto> {
    try {
      const response = await api.post<NotaClinicaDto>(
        `${API_BASE}/nota`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al crear nota cl�nica:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear nota cl�nica'
      );
    }
  }

  /**
   * Crear un nuevo diagn�stico (solo m�dicos)
   * @param request Datos del diagn�stico
   * @returns Diagn�stico creado
   */
  async createDiagnostico(request: CreateDiagnosticoRequest): Promise<DiagnosticoDto> {
    try {
      const response = await api.post<DiagnosticoDto>(
        `${API_BASE}/diagnostico`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al crear diagn�stico:', error);
      throw new Error(
        error.response?.data?.message || 'Error al crear diagn�stico'
      );
    }
  }

  /**
   * Crear una nueva receta con medicamentos (solo m�dicos)
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
   * Subir un documento cl�nico (solo m�dicos)
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
   * Eliminar un documento cl�nico
   * Permisos: M�dico que lo cre�, paciente de la cita, o admin
   * @param documentId ID del documento
   * @returns True si se elimin� correctamente
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

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Obtener el historial m�dico del usuario actual
   * Asume que el ID del usuario est� en localStorage
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
   * Obtener el nombre de la categor�a de documento en espa�ol
   * @param categoria Categor�a del documento
   * @returns Nombre en espa�ol
   */
  getCategoryLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'LAB': 'Laboratorio',
      'IMAGEN': 'Imagen M�dica',
      'REFERENCIA': 'Referencia',
      'CONSTANCIA': 'Constancia',
      'OTRO': 'Otro'
    };
    return labels[categoria] || categoria;
  }

  /**
   * Formatear el tama�o del archivo
   * @param bytes Tama�o en bytes
   * @returns Tama�o formateado (KB, MB)
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Validar si el usuario puede editar informaci�n m�dica
   * Verificar si tiene rol de DOCTOR o ADMIN
   */
  canEditMedicalInfo(): boolean {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      
      const user = JSON.parse(userStr);
      // Aqu� deber�as verificar el rol del usuario
      // Esto depende de c�mo est� estructurado tu objeto user
      return user.role === 'DOCTOR' || user.role === 'ADMIN';
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const medicalHistoryService = new MedicalHistoryService();
export default medicalHistoryService;
