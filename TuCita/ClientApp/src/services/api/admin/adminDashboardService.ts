import apiClient from '@/services/api/axiosConfig';

/**
 * Interface para las métricas del dashboard
 */
export interface DashboardMetrics {
  citasHoy: number;
  cambioVsAyer: number;
  citasAtendidas: number;
  citasNoShow: number;
  porcentajeNoShow: number;
  doctoresActivos: number;
  doctoresConectados: number;
}

/**
 * Interface para datos semanales de gráficas
 */
export interface WeeklyChartData {
  dia: string;
  fecha: string;
  programada: number;
  atendida: number;
  cancelada: number;
  noShow: number;
}

/**
 * Interface para distribución de estados
 */
export interface StatusDistribution {
  estado: string;
  cantidad: number;
  color: string;
}

/**
 * Interface para próximas citas
 */
export interface UpcomingAppointment {
  citaId: number;
  hora: string;
  paciente: string;
  doctor: string;
  estado: string;
}

/**
 * Interface para alertas del sistema
 */
export interface SystemAlert {
  tipo: 'info' | 'warning' | 'error';
  mensaje: string;
  tiempoRelativo: string;
  fechaHora: string;
}

/**
 * Interface para el dashboard completo
 */
export interface AdminDashboard {
  metricas: DashboardMetrics;
  datosSemanales: WeeklyChartData[];
  distribucionEstados: StatusDistribution[];
  proximasCitas: UpcomingAppointment[];
  alertas: SystemAlert[];
}

/**
 * Servicio para consumir la API del dashboard de administración
 */
class AdminDashboardService {
  private baseUrl = '/api/admin/dashboard';

  /**
   * Obtiene todos los datos del dashboard
   */
  async getDashboardData(): Promise<AdminDashboard> {
    try {
      const response = await apiClient.get<AdminDashboard>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo las métricas
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<DashboardMetrics>(`${this.baseUrl}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos semanales para gráficas
   */
  async getWeeklyChartData(): Promise<WeeklyChartData[]> {
    try {
      const response = await apiClient.get<WeeklyChartData[]>(`${this.baseUrl}/weekly-chart`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos semanales:', error);
      throw error;
    }
  }

  /**
   * Obtiene distribución de estados
   */
  async getStatusDistribution(): Promise<StatusDistribution[]> {
    try {
      const response = await apiClient.get<StatusDistribution[]>(`${this.baseUrl}/status-distribution`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener distribución de estados:', error);
      throw error;
    }
  }

  /**
   * Obtiene próximas citas del día
   */
  async getUpcomingAppointments(limit: number = 5): Promise<UpcomingAppointment[]> {
    try {
      const response = await apiClient.get<UpcomingAppointment[]>(`${this.baseUrl}/upcoming-appointments`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener próximas citas:', error);
      throw error;
    }
  }

  /**
   * Obtiene alertas del sistema
   */
  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await apiClient.get<SystemAlert[]>(`${this.baseUrl}/alerts`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener alertas del sistema:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
