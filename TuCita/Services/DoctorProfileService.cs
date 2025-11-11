using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Profile;
using TuCita.Models;

namespace TuCita.Services;

public interface IDoctorProfileService
{
    Task<DoctorProfileResponseDto?> GetDoctorProfileAsync(long doctorId);
    Task<DoctorProfileResponseDto?> UpdateDoctorProfileAsync(long doctorId, UpdateDoctorProfileDto dto);
}

public class DoctorProfileService : IDoctorProfileService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<DoctorProfileService> _logger;

    public DoctorProfileService(TuCitaDbContext context, ILogger<DoctorProfileService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener el perfil completo del doctor por su ID
    /// </summary>
    public async Task<DoctorProfileResponseDto?> GetDoctorProfileAsync(long doctorId)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilMedico)
                    .ThenInclude(pm => pm!.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(u => u.Id == doctorId);

            if (usuario == null || usuario.PerfilMedico == null)
            {
                _logger.LogWarning("Doctor con ID {DoctorId} no encontrado", doctorId);
                return null;
            }

            var especialidades = usuario.PerfilMedico.EspecialidadesMedico
                .Select(me => me.Especialidad.Nombre)
                .ToList();

            return new DoctorProfileResponseDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Email = usuario.Email,
                Telefono = usuario.Telefono,
                Avatar = null, // TODO: Implementar sistema de avatares
                NumeroLicencia = usuario.PerfilMedico.NumeroLicencia,
                Biografia = usuario.PerfilMedico.Biografia,
                Direccion = usuario.PerfilMedico.Direccion,
                Especialidades = especialidades,
                CreadoEn = usuario.CreadoEn,
                ActualizadoEn = usuario.ActualizadoEn
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil del doctor {DoctorId}", doctorId);
            throw;
        }
    }

    /// <summary>
    /// Actualizar el perfil del doctor
    /// </summary>
    public async Task<DoctorProfileResponseDto?> UpdateDoctorProfileAsync(long doctorId, UpdateDoctorProfileDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilMedico)
                    .ThenInclude(pm => pm!.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(u => u.Id == doctorId);

            if (usuario == null || usuario.PerfilMedico == null)
            {
                _logger.LogWarning("Doctor con ID {DoctorId} no encontrado", doctorId);
                return null;
            }

            // Verificar si el email ya está en uso por otro usuario
            if (usuario.Email != dto.Email)
            {
                var emailNormalizado = dto.Email.ToUpperInvariant();
                var emailExists = await _context.Usuarios
                    .AnyAsync(u => u.Id != doctorId && u.EmailNormalizado == emailNormalizado);

                if (emailExists)
                {
                    throw new InvalidOperationException("El email ya está en uso por otro usuario");
                }

                usuario.Email = dto.Email;
                usuario.EmailNormalizado = emailNormalizado;
            }

            // Actualizar información básica
            usuario.Nombre = dto.Nombre;
            usuario.Apellido = dto.Apellido;
            usuario.Telefono = dto.Telefono;
            usuario.ActualizadoEn = DateTime.UtcNow;

            // Actualizar información del perfil médico
            usuario.PerfilMedico.NumeroLicencia = dto.NumeroLicencia;
            usuario.PerfilMedico.Biografia = dto.Biografia;
            usuario.PerfilMedico.Direccion = dto.Direccion;
            usuario.PerfilMedico.ActualizadoEn = DateTime.UtcNow;

            // Actualizar especialidades si se proporcionaron
            if (dto.EspecialidadIds != null && dto.EspecialidadIds.Any())
            {
                // Eliminar especialidades actuales
                var especialidadesActuales = await _context.Set<MedicoEspecialidad>()
                    .Where(me => me.MedicoId == doctorId)
                    .ToListAsync();

                _context.Set<MedicoEspecialidad>().RemoveRange(especialidadesActuales);

                // Agregar nuevas especialidades
                foreach (var especialidadId in dto.EspecialidadIds)
                {
                    // Verificar que la especialidad existe
                    var especialidadExists = await _context.Set<Especialidad>()
                        .AnyAsync(e => e.Id == especialidadId);

                    if (!especialidadExists)
                    {
                        _logger.LogWarning("Especialidad con ID {EspecialidadId} no encontrada", especialidadId);
                        continue;
                    }

                    _context.Set<MedicoEspecialidad>().Add(new MedicoEspecialidad
                    {
                        MedicoId = doctorId,
                        EspecialidadId = especialidadId
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Perfil del doctor {DoctorId} actualizado exitosamente", doctorId);

            // Recargar el perfil con las especialidades actualizadas
            return await GetDoctorProfileAsync(doctorId);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al actualizar perfil del doctor {DoctorId}", doctorId);
            throw;
        }
    }
}
