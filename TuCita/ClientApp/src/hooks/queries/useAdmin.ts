import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminDashboardService, { AdminDashboard } from '@/services/api/admin/adminDashboardService';
import adminCitasService, {
  CitasPaginadas,
  CitasFilter,
  UpdateEstadoCitaRequest,
  CreateCitaAdminRequest,
  CitaCreada
} from '@/services/api/admin/adminCitasService';
import adminReportesService, {
  ReporteFilter,
  ReporteGenerado
} from '@/services/api/admin/adminReportesService';
import adminUsuariosService, {
  UsuarioDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  CambiarEstadoUsuarioDto,
  type UsuariosFilterParams // ? ARREGLAR: Era 'UsuariosFilter'
} from '@/services/api/admin/adminUsuariosService';
import adminEspecialidadesService, {
  EspecialidadDto,
  CrearEspecialidadDto, // ? ARREGLAR: Era 'CreateEspecialidadDto'
  ActualizarEspecialidadDto // ? ARREGLAR: Era 'UpdateEspecialidadDto'
} from '@/services/api/admin/adminEspecialidadesService';
import { toast } from 'sonner';

// ==========================================
// Query Keys
// ==========================================

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  citas: () => [...adminKeys.all, 'citas'] as const,
  citasList: (filters: CitasFilter) => [...adminKeys.citas(), 'list', filters] as const,
  citaDetail: (id: number) => [...adminKeys.citas(), 'detail', id] as const,
  reportes: () => [...adminKeys.all, 'reportes'] as const,
  reporteData: (filters: ReporteFilter) => [...adminKeys.reportes(), filters] as const,
  usuarios: () => [...adminKeys.all, 'usuarios'] as const,
  usuariosList: (filters: UsuariosFilterParams) => [...adminKeys.usuarios(), 'list', filters] as const, // ? ARREGLAR
  especialidades: () => [...adminKeys.all, 'especialidades'] as const,
};

// ==========================================
// Dashboard Hooks
// ==========================================

/**
 * Hook para obtener datos completos del dashboard administrativo
 * ? staleTime: 1 minuto (dashboard actualizable frecuentemente)
 * ?? refetchOnWindowFocus: true
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminDashboardService.getDashboardData(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Hook para obtener solo las métricas del dashboard
 * ? staleTime: 30 segundos (métricas cambian rápido)
 */
export function useAdminMetrics() {
  return useQuery({
    queryKey: [...adminKeys.dashboard(), 'metrics'],
    queryFn: () => adminDashboardService.getMetrics(),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos en caché
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// Citas Hooks
// ==========================================

/**
 * Hook para obtener lista paginada de citas con filtros
 * ? staleTime: 2 minutos
 */
export function useAdminCitas(filters: CitasFilter = {}) {
  return useQuery({
    queryKey: adminKeys.citasList(filters),
    queryFn: () => adminCitasService.getCitasPaginadas(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    enabled: true,
  });
}

/**
 * Hook para obtener detalle de una cita específica (admin)
 * ? staleTime: 5 minutos
 */
export function useAdminCitaDetail(citaId: number | null) {
  return useQuery({
    queryKey: adminKeys.citaDetail(citaId!),
    queryFn: () => adminCitasService.getCitaDetalle(citaId!),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos en caché
    enabled: citaId !== null && citaId > 0,
  });
}

/**
 * Hook para buscar pacientes
 * ? staleTime: 5 minutos (lista de pacientes relativamente estable)
 */
export function useSearchPacientes(searchTerm: string) {
  return useQuery({
    queryKey: [...adminKeys.all, 'pacientes', 'search', searchTerm],
    queryFn: () => adminCitasService.searchPacientes(searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    enabled: searchTerm.length >= 2, // Solo buscar si hay al menos 2 caracteres
  });
}

/**
 * Hook para obtener lista de doctores activos
 * ? staleTime: 10 minutos (lista de doctores cambia poco)
 */
export function useAdminDoctores() {
  return useQuery({
    queryKey: [...adminKeys.all, 'doctores'],
    queryFn: () => adminCitasService.getDoctores(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
  });
}

/**
 * Hook para obtener slots disponibles de un doctor
 * ? staleTime: 1 minuto (disponibilidad cambia frecuentemente)
 */
export function useAdminSlotsDisponibles(medicoId: number | null, fecha: string | null) {
  return useQuery({
    queryKey: [...adminKeys.all, 'slots', medicoId, fecha],
    queryFn: () => adminCitasService.getSlotsDisponibles(medicoId!, fecha!),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    enabled: medicoId !== null && fecha !== null,
  });
}

// ==========================================
// Reportes Hooks
// ==========================================

/**
 * Hook para generar un reporte con filtros
 * ? staleTime: 5 minutos
 */
export function useAdminReporte(filters: ReporteFilter) {
  return useQuery({
    queryKey: adminKeys.reporteData(filters),
    queryFn: () => adminReportesService.generarReporte(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos en caché
    enabled: false, // No ejecutar automáticamente, solo cuando el usuario lo solicite
  });
}

/**
 * Hook para obtener tipos de reportes disponibles
 * ? staleTime: 1 hora (no cambian frecuentemente)
 */
export function useAdminTiposReportes() {
  return useQuery({
    queryKey: [...adminKeys.reportes(), 'tipos'],
    queryFn: () => adminReportesService.getTiposReportes(),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 2 * 60 * 60 * 1000, // 2 horas en caché
  });
}

// ==========================================
// Usuarios Hooks
// ==========================================

/**
 * Hook para obtener lista paginada de usuarios
 * ? staleTime: 5 minutos
 */
export function useAdminUsuarios(filters: UsuariosFilterParams = {}) { // ? ARREGLAR
  return useQuery({
    queryKey: adminKeys.usuariosList(filters),
    queryFn: () => adminUsuariosService.getUsuarios(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos en caché
  });
}

/**
 * Hook para obtener especialidades disponibles
 * ? staleTime: 30 minutos (cambian poco)
 */
export function useAdminEspecialidades() {
  return useQuery({
    queryKey: adminKeys.especialidades(),
    queryFn: () => adminEspecialidadesService.getAllEspecialidades(),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora en caché
  });
}

/**
 * Hook para crear un nuevo usuario
 * ?? Invalida automáticamente el caché de usuarios
 */
export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioDto) => adminUsuariosService.createUsuario(data), // ? ARREGLAR
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
      toast.success('Usuario creado exitosamente', {
        description: 'Contraseña temporal asignada: TuCita2024!'
      });
    },
    onError: (error: Error) => {
      toast.error('Error al crear usuario', {
        description: error.message || 'Ocurrió un error al crear'
      });
    },
  });
}

/**
 * Hook para actualizar un usuario existente
 * ?? Invalida automáticamente el caché
 */
export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioDto }) => // ? ARREGLAR
      adminUsuariosService.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar usuario', {
        description: error.message || 'Ocurrió un error al guardar'
      });
    },
  });
}

/**
 * Hook para cambiar estado activo/inactivo de un usuario
 * ?? Invalida automáticamente el caché
 */
export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      adminUsuariosService.cambiarEstado(id, activo),
    onSuccess: (_, { activo }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
      toast.success(`Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`);
    },
    onError: (error: Error) => {
      toast.error('Error al cambiar estado', {
        description: error.message || 'Ocurrió un error'
      });
    },
  });
}

/**
 * Hook para eliminar un usuario
 * ?? Invalida automáticamente el caché
 */
export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminUsuariosService.deleteUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar usuario', {
        description: error.message || 'Ocurrió un error al eliminar'
      });
    },
  });
}

// ==========================================
// Especialidades Hooks
// ==========================================

/**
 * Hook para crear una nueva especialidad
 * ?? Invalida automáticamente el caché
 */
export function useCreateEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearEspecialidadDto) => adminEspecialidadesService.createEspecialidad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.especialidades() });
      toast.success('Especialidad creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear especialidad');
    },
  });
}

/**
 * Hook para actualizar una especialidad
 * ?? Invalida automáticamente el caché
 */
export function useUpdateEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarEspecialidadDto }) =>
      adminEspecialidadesService.updateEspecialidad(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.especialidades() });
      toast.success('Especialidad actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar especialidad');
    },
  });
}

/**
 * Hook para eliminar una especialidad
 * ?? Invalida automáticamente el caché
 */
export function useDeleteEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminEspecialidadesService.deleteEspecialidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.especialidades() });
      toast.success('Especialidad eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar especialidad');
    },
  });
}

// ==========================================
// Mutation Hooks (Citas)
// ==========================================

/**
 * Hook para crear una nueva cita desde el panel de administración
 * ?? Invalida automáticamente el caché de citas y dashboard
 */
export function useCreateCitaAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCitaAdminRequest) => adminCitasService.createCita(data),
    onSuccess: () => {
      // Invalidar caché de citas
      queryClient.invalidateQueries({ queryKey: adminKeys.citas() });
      // Invalidar dashboard para actualizar métricas
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      toast.success('Cita creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la cita');
    },
  });
}

/**
 * Hook para actualizar el estado de una cita (admin)
 * ?? Invalida automáticamente el caché
 */
export function useUpdateEstadoCitaAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ citaId, data }: { citaId: number; data: UpdateEstadoCitaRequest }) =>
      adminCitasService.updateEstadoCita(citaId, data),
    onSuccess: (_, { citaId }) => {
      // Invalidar detalle de la cita
      queryClient.invalidateQueries({ queryKey: adminKeys.citaDetail(citaId) });
      // Invalidar listas de citas
      queryClient.invalidateQueries({ queryKey: adminKeys.citas() });
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      toast.success('Estado de la cita actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el estado');
    },
  });
}

/**
 * Hook para cancelar/eliminar una cita
 * ?? Invalida automáticamente el caché
 */
export function useDeleteCitaAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (citaId: number) => adminCitasService.deleteCita(citaId),
    onSuccess: () => {
      // Invalidar todas las listas de citas
      queryClient.invalidateQueries({ queryKey: adminKeys.citas() });
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      toast.success('Cita cancelada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cancelar la cita');
    },
  });
}

// ==========================================
// Helper Hooks
// ==========================================

/**
 * Hook para invalidar manualmente el caché de admin
 * Útil para forzar actualización después de acciones externas
 */
export function useInvalidateAdmin() {
  const queryClient = useQueryClient();

  return {
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() }),
    invalidateCitas: () => queryClient.invalidateQueries({ queryKey: adminKeys.citas() }),
    invalidateReportes: () => queryClient.invalidateQueries({ queryKey: adminKeys.reportes() }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  };
}
