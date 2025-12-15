/**
 * ?? Barrel Export - React Query Hooks
 * 
 * Exporta todos los hooks de React Query de manera centralizada
 * para facilitar la importación en componentes.
 * 
 * Ejemplo de uso:
 * ```tsx
 * import { useTodayAppointments, useDoctors, useDoctorProfile, useAdminDashboard } from '@/hooks/queries';
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

// ==========================================
// Appointments Hooks
// ==========================================
export {
  // Query Hooks
  useTodayAppointments,
  useDoctorAppointments,
  useAppointmentDetail,
  useDoctorPatients,
  
  // Mutation Hooks
  useCreateAppointment,
  useUpdateAppointmentStatus,
  
  // Helper Hooks
  usePrefetchAppointmentDetail,
  useInvalidateAppointments,
  
  // Query Keys
  appointmentKeys,
} from './useAppointments';

// ==========================================
// Doctors Hooks
// ==========================================
export {
  // Query Hooks
  useDoctors,
  useDoctorById,
  useSpecialties,
  useAvailableSlots,
  useAvailableSlotsRange,
  
  // Helper Hooks
  usePrefetchDoctorDetails,
  usePrefetchDoctorSlots,
  useInvalidateDoctors,
  
  // Query Keys
  doctorKeys,
} from './useDoctors';

// ==========================================
// Profile Hooks
// ==========================================
export {
  // Query Hooks
  useDoctorProfile,
  useEspecialidades,
  
  // Mutation Hooks
  useUpdateDoctorProfile,
  useChangeDoctorPassword,
  useUploadDoctorAvatar,
  
  // Helper Hooks
  useDoctorProfileData,
  useInvalidateProfile,
  
  // Query Keys
  profileKeys,
} from './useProfile';

// Patient Profile
export { usePatientProfile, useUpdatePatientProfile } from './useProfile';

// ==========================================
// Password Management Hook
// ==========================================
export const useChangePassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const profileService = await import('@/services/api/patient/profileService');
      return profileService.default.changePassword(data);
    },
    onSuccess: () => {
      // Optional: invalidate user session or profile if needed
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
    },
  });
};

// ==========================================
// Admin Hooks
// ==========================================
export {
  // Dashboard Query Hooks
  useAdminDashboard,
  useAdminMetrics,
  
  // Citas Query Hooks
  useAdminCitas,
  useAdminCitaDetail,
  useSearchPacientes,
  useAdminDoctores,
  useAdminSlotsDisponibles,
  
  // Reportes Query Hooks
  useAdminReporte,
  useAdminTiposReportes,
  
  // Mutation Hooks
  useCreateCitaAdmin,
  useUpdateEstadoCitaAdmin,
  useDeleteCitaAdmin,
  
  // Helper Hooks
  useInvalidateAdmin,
  
  // Query Keys
  adminKeys,
} from './useAdmin';

// ==========================================
// React Query Custom Hooks
// ==========================================

// Admin hooks
export * from './useAdmin';

// Appointment hooks (Doctor & Patient)
export * from './useAppointments';

// Doctor hooks
export * from './useDoctors';

// Profile hooks (Doctor & Patient)
export * from './useProfile';

// Doctor Availability hooks
export * from './useDoctorAvailability';

// ==========================================
// Usage Examples:
// 
// // In a component:
// import { useTodayAppointments, useMyAppointments, useDoctors } from '@/hooks/queries';
// 
// function MyComponent() {
//   const { data: todayAppointments, isLoading } = useTodayAppointments();
//   const { data: myAppointments } = useMyAppointments();
//   const { data: doctors } = useDoctors({ especialidad: 'Cardiología' });
//   
//   // ...rest of component
// }
// ==========================================
