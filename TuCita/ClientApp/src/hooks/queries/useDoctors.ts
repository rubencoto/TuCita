import { useQuery, useQueryClient } from '@tanstack/react-query';
import doctorsService, { Doctor, SearchFilters, AgendaTurno } from '@/services/api/doctor/doctorsService';

// ==========================================
// Query Keys
// ==========================================

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: SearchFilters) => [...doctorKeys.lists(), filters] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: number) => [...doctorKeys.details(), id] as const,
  specialties: () => [...doctorKeys.all, 'specialties'] as const,
  slots: () => [...doctorKeys.all, 'slots'] as const,
  slotsByDoctor: (doctorId: number) => [...doctorKeys.slots(), doctorId] as const,
  slotsByDate: (doctorId: number, fecha: string) => [...doctorKeys.slotsByDoctor(doctorId), fecha] as const,
};

// ==========================================
// Query Hooks
// ==========================================

/**
 * Hook para buscar doctores con filtros
 * ? staleTime: 5 minutos (lista de doctores relativamente estable)
 * ?? Se puede filtrar por especialidad y ubicación
 */
export function useDoctors(filters?: SearchFilters) {
  return useQuery({
    queryKey: doctorKeys.list(filters || {}),
    queryFn: () => doctorsService.getDoctors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    retry: 2,
  });
}

/**
 * Hook para obtener detalles de un doctor específico
 * ? staleTime: 10 minutos (detalles del doctor cambian poco)
 */
export function useDoctorById(doctorId: number | null) {
  return useQuery({
    queryKey: doctorKeys.detail(doctorId!),
    queryFn: () => doctorsService.getDoctorById(doctorId!),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
    enabled: doctorId !== null && doctorId > 0,
  });
}

/**
 * Hook para obtener lista de especialidades disponibles
 * ? staleTime: 1 hora (especialidades cambian muy poco)
 */
export function useSpecialties() {
  return useQuery({
    queryKey: doctorKeys.specialties(),
    queryFn: () => doctorsService.getSpecialties(),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 2 * 60 * 60 * 1000, // 2 horas en caché
    retry: 2,
  });
}

/**
 * Hook para obtener slots disponibles de un doctor en una fecha específica
 * ? staleTime: 30 segundos (disponibilidad cambia frecuentemente)
 * ?? Se actualiza automáticamente cuando se reserva un turno
 */
export function useAvailableSlots(doctorId: number | null, fecha: Date | null) {
  const fechaStr = fecha?.toISOString().split('T')[0] || '';
  
  return useQuery({
    queryKey: doctorKeys.slotsByDate(doctorId!, fechaStr),
    queryFn: () => doctorsService.getAvailableSlots(doctorId!, fecha!),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos en caché
    enabled: doctorId !== null && doctorId > 0 && fecha !== null,
    refetchOnWindowFocus: true, // Re-fetch al volver a la ventana (importante para disponibilidad)
  });
}

/**
 * Hook para obtener slots disponibles de un doctor en un rango de fechas
 * ? staleTime: 1 minuto
 * Útil para mostrar calendario de disponibilidad
 */
export function useAvailableSlotsRange(
  doctorId: number | null, 
  startDate: Date | null, 
  endDate: Date | null
) {
  const startStr = startDate?.toISOString().split('T')[0] || '';
  const endStr = endDate?.toISOString().split('T')[0] || '';
  
  return useQuery({
    queryKey: [...doctorKeys.slotsByDoctor(doctorId!), 'range', startStr, endStr],
    queryFn: () => doctorsService.getAvailableSlotsRange(doctorId!, startDate!, endDate!),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    enabled: doctorId !== null && doctorId > 0 && startDate !== null && endDate !== null,
  });
}

// ==========================================
// Helper Hooks
// ==========================================

/**
 * Hook para pre-cargar detalles de un doctor (prefetch)
 * Útil para mejorar la UX al hacer hover sobre un doctor en la lista
 */
export function usePrefetchDoctorDetails() {
  const queryClient = useQueryClient();
  
  return (doctorId: number) => {
    queryClient.prefetchQuery({
      queryKey: doctorKeys.detail(doctorId),
      queryFn: () => doctorsService.getDoctorById(doctorId),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Hook para pre-cargar slots de un doctor (prefetch)
 * Útil cuando el usuario está navegando el calendario
 */
export function usePrefetchDoctorSlots() {
  const queryClient = useQueryClient();
  
  return (doctorId: number, fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    queryClient.prefetchQuery({
      queryKey: doctorKeys.slotsByDate(doctorId, fechaStr),
      queryFn: () => doctorsService.getAvailableSlots(doctorId, fecha),
      staleTime: 30 * 1000,
    });
  };
}

/**
 * Hook para invalidar manualmente el caché de doctores
 * Útil para forzar actualización después de cambios
 */
export function useInvalidateDoctors() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: doctorKeys.lists() }),
    invalidateDetail: (doctorId: number) => 
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(doctorId) }),
    invalidateSlots: (doctorId: number) => 
      queryClient.invalidateQueries({ queryKey: doctorKeys.slotsByDoctor(doctorId) }),
  };
}
