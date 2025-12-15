import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import doctorProfileService, {
  DoctorProfileResponse,
  UpdateDoctorProfileRequest,
  ChangeDoctorPasswordRequest,
  Especialidad,
} from '@/services/api/doctor/doctorProfileService';
import profileService, {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/services/api/patient/profileService';
import { toast } from 'sonner';

// ==========================================
// Query Keys
// ==========================================

export const profileKeys = {
  all: ['profile'] as const,
  doctor: () => [...profileKeys.all, 'doctor'] as const,
  patient: () => [...profileKeys.all, 'patient'] as const,
  admin: () => [...profileKeys.all, 'admin'] as const,
  especialidades: () => [...profileKeys.all, 'especialidades'] as const,
};

// ==========================================
// DOCTOR Hooks de Consulta (Queries)
// ==========================================

/**
 * Hook para obtener el perfil del doctor autenticado
 * ? staleTime: 10 minutos (perfil cambia poco)
 * ?? Útil para: Páginas de perfil, configuración, header
 */
export function useDoctorProfile() {
  return useQuery({
    queryKey: profileKeys.doctor(),
    queryFn: () => doctorProfileService.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
    retry: 2,
  });
}

/**
 * Hook para obtener la lista de especialidades médicas
 * ? staleTime: Infinity (especialidades raramente cambian)
 * ?? Útil para: Formularios de perfil, filtros
 */
export function useEspecialidades() {
  return useQuery({
    queryKey: profileKeys.especialidades(),
    queryFn: () => doctorProfileService.getEspecialidades(),
    staleTime: Infinity, // Datos muy estables
    gcTime: Infinity, // Mantener en caché indefinidamente
    retry: 1,
  });
}

// ==========================================
// PATIENT Hooks de Consulta (Queries)
// ==========================================

/**
 * Hook para obtener el perfil del paciente autenticado
 * ? staleTime: 5 minutos
 * ?? Útil para: Páginas de perfil, configuración
 */
export function usePatientProfile() {
  return useQuery({
    queryKey: profileKeys.patient(),
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos en caché
    retry: 2,
  });
}

// ==========================================
// DOCTOR Hooks de Mutación (Mutations)
// ==========================================

/**
 * Hook para actualizar el perfil del doctor
 * ?? Actualiza automáticamente el caché con actualización optimista
 */
export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDoctorProfileRequest) =>
      doctorProfileService.updateProfile(data),
    onMutate: async (newData) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: profileKeys.doctor() });

      // Snapshot del estado anterior (para rollback)
      const previousProfile = queryClient.getQueryData<DoctorProfileResponse>(
        profileKeys.doctor()
      );

      // Actualización optimista
      if (previousProfile) {
        queryClient.setQueryData<DoctorProfileResponse>(profileKeys.doctor(), {
          ...previousProfile,
          nombre: newData.nombre,
          apellido: newData.apellido,
          email: newData.email,
          telefono: newData.telefono,
          numeroLicencia: newData.numeroLicencia,
          biografia: newData.biografia,
          direccion: newData.direccion,
        });
      }

      return { previousProfile };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.doctor(), context.previousProfile);
      }
      toast.error(error.message || 'Error al actualizar el perfil');
    },
    onSuccess: (data) => {
      // Actualizar caché con datos del servidor
      queryClient.setQueryData(profileKeys.doctor(), data);
      toast.success('Perfil actualizado exitosamente');
    },
    onSettled: () => {
      // Asegurar sincronización
      queryClient.invalidateQueries({ queryKey: profileKeys.doctor() });
    },
  });
}

/**
 * Hook para cambiar la contraseña del doctor
 * ?? No actualiza caché (solo operación de seguridad)
 */
export function useChangeDoctorPassword() {
  return useMutation({
    mutationFn: (data: ChangeDoctorPasswordRequest) =>
      doctorProfileService.changePassword(data),
    onSuccess: () => {
      toast.success('Contraseña cambiada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cambiar la contraseña');
    },
  });
}

/**
 * Hook para subir avatar del doctor
 * ?? Invalida el caché del perfil para re-fetch
 */
export function useUploadDoctorAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => doctorProfileService.uploadAvatar(file),
    onSuccess: (avatarUrl) => {
      // Actualizar avatar en el caché
      queryClient.setQueryData<DoctorProfileResponse>(
        profileKeys.doctor(),
        (old) => {
          if (!old) return old;
          return { ...old, avatar: avatarUrl };
        }
      );
      toast.success('Foto de perfil actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir la foto de perfil');
    },
    onSettled: () => {
      // Re-fetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: profileKeys.doctor() });
    },
  });
}

// ==========================================
// PATIENT Hooks de Mutación (Mutations)
// ==========================================

/**
 * Hook para actualizar el perfil del paciente
 * ?? Actualiza automáticamente el caché con actualización optimista
 */
export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      profileService.updateProfile(data),
    onMutate: async (newData) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: profileKeys.patient() });

      // Snapshot del estado anterior (para rollback)
      const previousProfile = queryClient.getQueryData<ProfileResponse>(
        profileKeys.patient()
      );

      // Actualización optimista
      if (previousProfile) {
        queryClient.setQueryData<ProfileResponse>(profileKeys.patient(), {
          ...previousProfile,
          nombre: newData.nombre,
          apellido: newData.apellido,
          email: newData.email,
          telefono: newData.telefono,
          fechaNacimiento: newData.fechaNacimiento,
          identificacion: newData.identificacion,
          telefonoEmergencia: newData.telefonoEmergencia,
        });
      }

      return { previousProfile };
    },
    onError: (error: Error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.patient(), context.previousProfile);
      }
      toast.error(error.message || 'Error al actualizar el perfil');
    },
    onSuccess: (data) => {
      // Actualizar caché con datos del servidor
      queryClient.setQueryData(profileKeys.patient(), data);
      toast.success('Perfil actualizado exitosamente');
    },
    onSettled: () => {
      // Asegurar sincronización
      queryClient.invalidateQueries({ queryKey: profileKeys.patient() });
    },
  });
}

/**
 * Hook para cambiar la contraseña del paciente
 * ?? No actualiza caché (solo operación de seguridad)
 */
export function useChangePatientPassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      profileService.changePassword(data),
    onSuccess: () => {
      toast.success('Contraseña cambiada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cambiar la contraseña');
    },
  });
}

// ==========================================
// Helper Hooks
// ==========================================

/**
 * Hook para obtener datos derivados del perfil del doctor
 * Útil para mostrar información formateada sin re-calcular
 */
export function useDoctorProfileData() {
  const { data: profile, isLoading, isError } = useDoctorProfile();

  return {
    profile,
    isLoading,
    isError,
    fullName: profile ? doctorProfileService.getFullName(profile) : '',
    initials: profile ? doctorProfileService.getInitials(profile) : '',
    formattedDate: profile
      ? doctorProfileService.formatDate(profile.creadoEn)
      : '',
  };
}

/**
 * Hook para obtener datos derivados del perfil del paciente
 * Útil para mostrar información formateada sin re-calcular
 */
export function usePatientProfileData() {
  const { data: profile, isLoading, isError } = usePatientProfile();

  return {
    profile,
    isLoading,
    isError,
    fullName: profile ? `${profile.nombre} ${profile.apellido}` : '',
    initials: profile 
      ? `${profile.nombre[0] || ''}${profile.apellido[0] || ''}`.toUpperCase() 
      : '',
  };
}

/**
 * Hook para invalidar el caché del perfil
 * Útil después de operaciones que afectan el perfil
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();

  return {
    invalidateDoctor: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.doctor() }),
    invalidatePatient: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.patient() }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  };
}
