import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import doctorAppointmentsService, { 
  DoctorAppointment, 
  DashboardStats,
  CreateDoctorAppointmentRequest,
  UpdateAppointmentStatusRequest 
} from '@/services/api/doctor/doctorAppointmentsService';
import appointmentsService, {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  RescheduleAppointmentRequest
} from '@/services/api/patient/appointmentsService';
import { toast } from 'sonner';

// ==========================================
// Query Keys
// ==========================================

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
  today: () => [...appointmentKeys.all, 'today'] as const,
  patients: () => [...appointmentKeys.all, 'patients'] as const,
  // Patient-specific keys
  myAppointments: () => [...appointmentKeys.all, 'my'] as const,
};

// ==========================================
// DOCTOR Hooks de Consulta (Queries)
// ==========================================

/**
 * Hook para obtener las citas del día actual del doctor
 * ? staleTime: 1 minuto (datos que cambian frecuentemente)
 * ?? Se actualiza automáticamente después de mutaciones
 */
export function useTodayAppointments() {
  return useQuery({
    queryKey: appointmentKeys.today(),
    queryFn: async () => {
      const appointments = await doctorAppointmentsService.getTodayAppointments();
      const stats = doctorAppointmentsService.calculateDashboardStats(appointments);
      return { appointments, stats };
    },
    staleTime: 1 * 60 * 1000, // 1 minuto - datos del dashboard
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    refetchOnWindowFocus: true, // Re-fetch al volver a la ventana (importante para dashboard)
    retry: 2,
  });
}

/**
 * Hook para obtener todas las citas del doctor con filtros opcionales
 * ? staleTime: 2 minutos
 */
export function useDoctorAppointments(
  fechaInicio?: string,
  fechaFin?: string,
  estado?: string
) {
  const filters = JSON.stringify({ fechaInicio, fechaFin, estado });
  
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => doctorAppointmentsService.getDoctorAppointments(fechaInicio, fechaFin, estado),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    enabled: true, // Siempre habilitado, no depende de parámetros
  });
}

/**
 * Hook para obtener el detalle completo de una cita
 * ? staleTime: 5 minutos (detalles cambian menos frecuentemente)
 */
export function useAppointmentDetail(citaId: number | null) {
  return useQuery({
    queryKey: appointmentKeys.detail(citaId!),
    queryFn: () => doctorAppointmentsService.getAppointmentDetail(citaId!),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos en caché
    enabled: citaId !== null && citaId > 0, // Solo ejecutar si hay ID válido
  });
}

/**
 * Hook para obtener la lista de pacientes del doctor
 * ? staleTime: 10 minutos (datos relativamente estables)
 */
export function useDoctorPatients() {
  return useQuery({
    queryKey: appointmentKeys.patients(),
    queryFn: () => doctorAppointmentsService.getDoctorPatients(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
  });
}

// ==========================================
// PATIENT Hooks de Consulta (Queries)
// ==========================================

/**
 * Hook para obtener las citas del usuario autenticado (paciente)
 * ? staleTime: 1 minuto
 * ?? Se actualiza automáticamente después de mutaciones
 */
export function useMyAppointments() {
  return useQuery({
    queryKey: appointmentKeys.myAppointments(),
    queryFn: () => appointmentsService.getMyAppointments(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Hook para obtener una cita específica por ID (paciente)
 * ? staleTime: 3 minutos
 */
export function usePatientAppointmentById(appointmentId: number | null) {
  return useQuery({
    queryKey: [...appointmentKeys.myAppointments(), appointmentId],
    queryFn: () => appointmentsService.getAppointmentById(appointmentId!),
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    enabled: appointmentId !== null && appointmentId > 0,
  });
}

// ==========================================
// DOCTOR Hooks de Mutación (Mutations)
// ==========================================

/**
 * Hook para crear una nueva cita manualmente
 * ?? Invalida automáticamente el caché de citas del día y lista general
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDoctorAppointmentRequest) => 
      doctorAppointmentsService.createDoctorAppointment(data),
    onSuccess: () => {
      // Invalidar caché de citas del día
      queryClient.invalidateQueries({ queryKey: appointmentKeys.today() });
      // Invalidar caché de todas las listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success('Cita creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la cita');
    },
  });
}

/**
 * Hook para actualizar el estado de una cita
 * ?? Invalida automáticamente el caché y actualiza la UI
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ citaId, data }: { citaId: number; data: UpdateAppointmentStatusRequest }) => 
      doctorAppointmentsService.updateAppointmentStatus(citaId, data),
    onMutate: async ({ citaId, data }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: appointmentKeys.today() });
      
      // Snapshot del estado anterior (para rollback)
      const previousData = queryClient.getQueryData(appointmentKeys.today());
      
      // Actualización optimista
      queryClient.setQueryData(
        appointmentKeys.today(),
        (old: { appointments: DoctorAppointment[]; stats: DashboardStats } | undefined) => {
          if (!old) return old;
          
          const updatedAppointments = old.appointments.map(apt =>
            apt.id === citaId ? { ...apt, estado: data.estado, observaciones: data.observaciones } : apt
          );
          
          const updatedStats = doctorAppointmentsService.calculateDashboardStats(updatedAppointments);
          
          return {
            appointments: updatedAppointments,
            stats: updatedStats,
          };
        }
      );
      
      return { previousData };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(appointmentKeys.today(), context.previousData);
      }
      toast.error(error.message || 'Error al actualizar el estado de la cita');
    },
    onSuccess: (_, { citaId }) => {
      // Invalidar detalle de la cita
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(citaId) });
      // Invalidar listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success('Estado actualizado correctamente');
    },
    onSettled: () => {
      // Re-fetch de citas del día para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: appointmentKeys.today() });
    },
  });
}

// ==========================================
// PATIENT Hooks de Mutación (Mutations)
// ==========================================

/**
 * Hook para crear una cita como paciente
 * ?? Invalida automáticamente el caché de citas del paciente
 */
export function useCreatePatientAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => 
      appointmentsService.createAppointment(data),
    onSuccess: () => {
      // Invalidar caché de citas del paciente
      queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() });
      toast.success('Cita agendada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agendar la cita');
    },
  });
}

/**
 * Hook para actualizar una cita como paciente
 * ?? Invalida automáticamente el caché
 */
export function useUpdatePatientAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentRequest }) =>
      appointmentsService.updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar detalle de la cita
      queryClient.invalidateQueries({ queryKey: [...appointmentKeys.myAppointments(), id] });
      // Invalidar lista de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() });
      toast.success('Cita actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar la cita');
    },
  });
}

/**
 * Hook para cancelar una cita como paciente
 * ?? Invalida automáticamente el caché
 */
export function useCancelPatientAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentId: number) => 
      appointmentsService.cancelAppointment(appointmentId),
    onMutate: async (appointmentId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: appointmentKeys.myAppointments() });
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(appointmentKeys.myAppointments());
      
      // Actualización optimista
      queryClient.setQueryData(
        appointmentKeys.myAppointments(),
        (old: Appointment[] | undefined) => {
          if (!old) return old;
          return old.map(apt =>
            apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
          );
        }
      );
      
      return { previousData };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(appointmentKeys.myAppointments(), context.previousData);
      }
      toast.error('Error al cancelar la cita');
    },
    onSuccess: () => {
      toast.success('Cita cancelada exitosamente');
    },
    onSettled: () => {
      // Re-fetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() });
    },
  });
}

/**
 * Hook para reprogramar una cita como paciente (cambiar a nuevo turno)
 * ?? Invalida automáticamente el caché
 */
export function useReschedulePatientAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, newTurnoId }: { appointmentId: number; newTurnoId: number }) =>
      appointmentsService.rescheduleAppointmentToNewSlot(appointmentId, newTurnoId),
    onSuccess: (_, { appointmentId }) => {
      // Invalidar detalle de la cita
      queryClient.invalidateQueries({ queryKey: [...appointmentKeys.myAppointments(), appointmentId] });
      // Invalidar lista de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() });
      toast.success('Cita reagendada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al reagendar la cita');
    },
  });
}

// ==========================================
// Helper Hooks
// ==========================================

/**
 * Hook para pre-cargar el detalle de una cita (prefetch)
 * Útil para mejorar la UX al hacer hover sobre una cita
 */
export function usePrefetchAppointmentDetail() {
  const queryClient = useQueryClient();
  
  return (citaId: number) => {
    queryClient.prefetchQuery({
      queryKey: appointmentKeys.detail(citaId),
      queryFn: () => doctorAppointmentsService.getAppointmentDetail(citaId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar manualmente el caché de citas
 * Útil para forzar actualización después de acciones externas
 */
export function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateToday: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.today() }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
    invalidateMyAppointments: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() }),
    invalidateDetail: (citaId: number) => 
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(citaId) }),
  };
}
