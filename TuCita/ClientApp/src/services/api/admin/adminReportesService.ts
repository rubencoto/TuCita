import apiClient from '@/services/api/apiConfig';

// ==================== TIPOS DE DATOS ====================

export enum TipoReporte {
  CitasPorPeriodo = 0,
  CitasPorDoctor = 1,
  CitasPorEspecialidad = 2,
  PacientesFrecuentes = 3,
  DoctoresRendimiento = 4,
  NoShowAnalisis = 5
}

export enum FormatoExportacion {
  PDF = 0,
  Excel = 1,
  CSV = 2
}

export interface ReporteFilter {
  tipoReporte: TipoReporte;
  fechaInicio: string; // ISO format
  fechaFin: string; // ISO format
  medicoId?: number;
  especialidadId?: number;
  estado?: string;
  formato?: FormatoExportacion;
}

export interface ResumenEjecutivo {
  totalCitas: number;
  citasAtendidas: number;
  citasCanceladas: number;
  citasNoShow: number;
  tasaAsistencia: number;
  tasaCancelacion: number;
  tasaNoShow: number;
  totalPacientes: number;
  totalDoctores: number;
}

export interface ReporteGenerado {
  tipoReporte: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaGeneracion: string;
  resumen: ResumenEjecutivo;
  datos: any[];
  datosGraficas: any[];
  filtrosAplicados: Record<string, string>;
}

export interface ReporteExportado {
  nombreArchivo: string;
  contentType: string;
  archivoBase64: string;
  tamanoBytes: number;
}

export interface TipoReporteInfo {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface FormatoInfo {
  id: number;
  nombre: string;
  extension: string;
  contentType: string;
}

// ==================== SERVICIO ====================

class AdminReportesService {
  private baseUrl = '/admin/reportes';

  /**
   * Genera un reporte basado en los filtros proporcionados
   */
  async generarReporte(filtros: ReporteFilter): Promise<ReporteGenerado> {
    try {
      const response = await apiClient.post<ReporteGenerado>(
        `${this.baseUrl}/generar`,
        filtros
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      throw error;
    }
  }

  /**
   * Exporta un reporte y obtiene el archivo en Base64
   */
  async exportarReporte(filtros: ReporteFilter): Promise<ReporteExportado> {
    try {
      const response = await apiClient.post<ReporteExportado>(
        `${this.baseUrl}/exportar`,
        filtros
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al exportar reporte:', error);
      throw error;
    }
  }

  /**
   * Descarga directamente un archivo de reporte
   */
  async descargarReporte(filtros: ReporteFilter): Promise<Blob> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/descargar`,
        filtros,
        {
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al descargar reporte:', error);
      throw error;
    }
  }

  /**
   * Obtiene los tipos de reportes disponibles
   */
  async getTiposReportes(): Promise<TipoReporteInfo[]> {
    try {
      const response = await apiClient.get<TipoReporteInfo[]>(`${this.baseUrl}/tipos`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener tipos de reportes:', error);
      throw error;
    }
  }

  /**
   * Obtiene los formatos de exportación disponibles
   */
  async getFormatos(): Promise<FormatoInfo[]> {
    try {
      const response = await apiClient.get<FormatoInfo[]>(`${this.baseUrl}/formatos`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener formatos:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo desde Base64
   */
  descargarDesdeBase64(archivoExportado: ReporteExportado): void {
    try {
      // Convertir base64 a blob
      const byteCharacters = atob(archivoExportado.archivoBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: archivoExportado.contentType });

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archivoExportado.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo desde Base64:', error);
      throw error;
    }
  }

  /**
   * Descarga un blob directamente
   */
  descargarBlob(blob: Blob, nombreArchivo: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar blob:', error);
      throw error;
    }
  }
}

const adminReportesService = new AdminReportesService();
export default adminReportesService;
