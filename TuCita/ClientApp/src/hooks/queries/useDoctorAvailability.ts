import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as availabilityService from '@/services/api/doctor/doctorAvailabilityService';
import type {
  DoctorSlot,
  CreateSlotRequest,
  UpdateSlotRequest,
  CreateWeeklyScheduleRequest,
  BulkCreateSlotsRequest,
  BulkCreateResult,
} from '@/services/api/doctor/doctorAvailabilityService';
import { toast } from 'sonner';

// ==========================================
// Query Keys
// ==========================================

export const availabilityKeys = {
  all: ['availability'] as const,
  slots: () => [...availabilityKeys.all, 'slots'] as const,
  slotsByDoctor: (doctorId: string) => [...availabilityKeys.slots(), doctorId] as const,
  slotDetail: (slotId: number) => [...availabilityKeys.slots(), 'detail', slotId] as const,
  weeklySchedule: () => [...availabilityKeys.all, 'weekly-schedule'] as const,
};

// ==========================================
// Query Hooks
// ==========================================

/**
 * Hook para obtener todos los slots de un doctor
 * ? staleTime: 1 minuto (disponibilidad cambia frecuentemente)
 * ?? Se actualiza automáticamente después de mutaciones
 */
export function useDoctorSlots(doctorId: string) {
  return useQuery({
    queryKey: availabilityKeys.slotsByDoctor(doctorId),
    queryFn: () => availabilityService.getSlots(doctorId),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!doctorId,
  });
}

/**
 * Hook para obtener el horario semanal de un doctor
 * ? staleTime: 10 minutos
 */
export function useDoctorWeeklySchedule(doctorId: string) {
  return useQuery({
    queryKey: [...availabilityKeys.weeklySchedule(), doctorId],
    queryFn: () => availabilityService.getWeeklySchedule(doctorId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
    enabled: !!doctorId,
  });
}

// ==========================================
// Mutation Hooks
// ==========================================

/**
 * Hook para crear un nuevo slot
 * ?? Invalida automáticamente el caché de slots
 */
export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSlotRequest) => availabilityService.createSlot(data),
    onSuccess: (newSlot, variables) => {
      // Invalidar caché de slots del doctor
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.slotsByDoctor(variables.doctorId),
      });
      toast.success('Horario creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el horario');
    },
  });
}

/**
 * Hook para crear nuevos slots en bulk
 * ?? Invalida automáticamente el caché de slots
 */
export function useBulkCreateSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateSlotsRequest) => availabilityService.bulkCreateSlots(data),
    onSuccess: (result, variables) => {
      // Invalidar caché de slots del doctor
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.slotsByDoctor(variables.doctorId),
      });
      toast.success('Horarios creados correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear los horarios');
    },
  });
}

/**
 * Hook para actualizar un slot existente
 * ?? Actualiza el caché optimistamente
 */
export function useUpdateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, data }: { slotId: number; data: UpdateSlotRequest }) =>
      availabilityService.updateSlot(slotId, data),
    onMutate: async ({ slotId, data }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: availabilityKeys.slots() });

      // Snapshot del estado anterior
      const previousSlots = queryClient.getQueryData(availabilityKeys.slots());

      // Actualización optimista
      queryClient.setQueriesData(
        { queryKey: availabilityKeys.slots() },
        (old: DoctorSlot[] | undefined) => {
          if (!old) return old;
          return old.map((slot) =>
            slot.idSlot === slotId ? { ...slot, ...data } : slot
          );
        }
      );

      return { previousSlots };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousSlots) {
        queryClient.setQueryData(availabilityKeys.slots(), context.previousSlots);
      }
      toast.error(error.message || 'Error al actualizar el horario');
    },
    onSuccess: () => {
      toast.success('Horario actualizado correctamente');
    },
    onSettled: () => {
      // Re-fetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: availabilityKeys.slots() });
    },
  });
}

/**
 * Hook para eliminar un slot
 * ?? Actualiza el caché optimistamente
 */
export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: number) => availabilityService.deleteSlot(slotId),
    onMutate: async (slotId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: availabilityKeys.slots() });

      // Snapshot del estado anterior
      const previousSlots = queryClient.getQueryData(availabilityKeys.slots());

      // Actualización optimista
      queryClient.setQueriesData(
        { queryKey: availabilityKeys.slots() },
        (old: DoctorSlot[] | undefined) => {
          if (!old) return old;
          return old.filter((slot) => slot.idSlot !== slotId);
        }
      );

      return { previousSlots };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousSlots) {
        queryClient.setQueryData(availabilityKeys.slots(), context.previousSlots);
      }
      toast.error(error.message || 'Error al eliminar el horario');
    },
    onSuccess: () => {
      toast.success('Horario eliminado correctamente');
    },
    onSettled: () => {
      // Re-fetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: availabilityKeys.slots() });
    },
  });
}

/**
 * Hook para crear/actualizar horario semanal
 * ?? Invalida el caché de slots y horarios semanales
 */
export function useUpdateWeeklySchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWeeklyScheduleRequest) =>
      availabilityService.createWeeklySchedule(data),
    onSuccess: (_, variables) => {
      // Invalidar caché de slots del doctor
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.slotsByDoctor(variables.doctorId),
      });
      // Invalidar caché de horarios semanales
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.weeklySchedule(),
      });
      toast.success('Horario semanal guardado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar el horario semanal');
    },
  });
}

/**
 * Hook para crear múltiples slots en lote (horario semanal)
 * ?? Invalida todas las queries de slots después de crear
 * ?? Útil para: Configuración de horario mensual
 */
export function useBulkCreateDoctorSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateSlotsRequest) =>
      availabilityService.bulkCreateSlots(data),
    onSuccess: (result: BulkCreateResult, variables) => {
      // Invalidar todas las queries de disponibilidad del doctor
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.slotsByDoctor(variables.doctorId),
      });
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.weeklySchedule(),
      });

      const { slotsCreados, errores } = result;

      if (errores.length > 0) {
        toast.warning('Horarios creados con advertencias', {
          description: `${slotsCreados} horarios creados. ${errores.length} advertencias.`,
        });
      } else {
        toast.success('Horarios creados exitosamente', {
          description: `${slotsCreados} horarios configurados para el período seleccionado.`,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear horarios en lote');
    },
  });
}

/**
 * Hook para bloquear un slot (cambiar estado a BLOQUEADO)
 * ?? Actualiza el caché optimistamente
 */
export function useBlockSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: number) =>
      availabilityService.updateSlot(slotId, { estado: 'BLOQUEADO' }),
    onMutate: async (slotId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: availabilityKeys.slots() });

      // Snapshot del estado anterior
      const previousSlots = queryClient.getQueryData(availabilityKeys.slots());

      // Actualización optimista
      queryClient.setQueriesData(
        { queryKey: availabilityKeys.slots() },
        (old: DoctorSlot[] | undefined) => {
          if (!old) return old;
          return old.map((slot) =>
            slot.idSlot === slotId ? { ...slot, estado: 'BLOQUEADO' as const } : slot
          );
        }
      );

      return { previousSlots };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousSlots) {
        queryClient.setQueryData(availabilityKeys.slots(), context.previousSlots);
      }
      toast.error('Error al bloquear el horario');
    },
    onSuccess: () => {
      toast.success('Horario bloqueado correctamente');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.slots() });
    },
  });
}

/**
 * Hook para desbloquear un slot (cambiar estado a DISPONIBLE)
 * ?? Actualiza el caché optimistamente
 */
export function useUnblockSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: number) =>
      availabilityService.updateSlot(slotId, { estado: 'DISPONIBLE' }),
    onMutate: async (slotId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: availabilityKeys.slots() });

      // Snapshot del estado anterior
      const previousSlots = queryClient.getQueryData(availabilityKeys.slots());

      // Actualización optimista
      queryClient.setQueriesData(
        { queryKey: availabilityKeys.slots() },
        (old: DoctorSlot[] | undefined) => {
          if (!old) return old;
          return old.map((slot) =>
            slot.idSlot === slotId ? { ...slot, estado: 'DISPONIBLE' as const } : slot
          );
        }
      );

      return { previousSlots };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousSlots) {
        queryClient.setQueryData(availabilityKeys.slots(), context.previousSlots);
      }
      toast.error('Error al desbloquear el horario');
    },
    onSuccess: () => {
      toast.success('Horario desbloqueado correctamente');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.slots() });
    },
  });
}

// ==========================================
// Helper Hooks
// ==========================================

/**
 * Hook para invalidar manualmente el caché de disponibilidad
 * Útil para forzar actualización después de acciones externas
 */
export function useInvalidateAvailability() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all }),
    invalidateSlots: (doctorId?: string) =>
      doctorId
        ? queryClient.invalidateQueries({
            queryKey: availabilityKeys.slotsByDoctor(doctorId),
          })
        : queryClient.invalidateQueries({ queryKey: availabilityKeys.slots() }),
    invalidateWeeklySchedule: () =>
      queryClient.invalidateQueries({ queryKey: availabilityKeys.weeklySchedule() }),
  };
}

/**
 * Hook para obtener estadísticas de disponibilidad
 * Calcula métricas sobre los slots del doctor
 */
export function useAvailabilityStats(doctorId: string) {
  const { data: slots, isLoading } = useDoctorSlots(doctorId);

  const stats = {
    total: slots?.length || 0,
    disponibles: slots?.filter((s) => s.estado === 'DISPONIBLE').length || 0,
    bloqueados: slots?.filter((s) => s.estado === 'BLOQUEADO').length || 0,
    ocupados: slots?.filter((s) => s.estado === 'OCUPADO').length || 0,
    presenciales:
      slots?.filter((s) => s.tipo === 'PRESENCIAL' && s.estado === 'DISPONIBLE')
        .length || 0,
    teleconsultas:
      slots?.filter((s) => s.tipo === 'TELECONSULTA' && s.estado === 'DISPONIBLE')
        .length || 0,
  };

  return {
    stats,
    isLoading,
    hasAvailability: stats.disponibles > 0,
  };
}
