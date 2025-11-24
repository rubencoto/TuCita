using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Admin;
using TuCita.Models;
using BCrypt.Net;

namespace TuCita.Services;

/// <summary>
/// Interface para el servicio de administración de usuarios
/// </summary>
public interface IAdminUsuariosService
{
    /// <summary>
    /// Obtiene todos los usuarios del sistema con paginación y filtros
    /// </summary>
    Task<UsuariosPaginadosDto> GetUsuariosAsync(FiltrosUsuariosDto filtros);

    /// <summary>
    /// Obtiene un usuario específico por ID
    /// </summary>
    Task<UsuarioDto?> GetUsuarioByIdAsync(long id);

    /// <summary>
    /// Crea un nuevo usuario en el sistema
    /// </summary>
    Task<UsuarioDto> CreateUsuarioAsync(CrearUsuarioDto dto);

    /// <summary>
    /// Actualiza un usuario existente
    /// </summary>
    Task<UsuarioDto> UpdateUsuarioAsync(long id, ActualizarUsuarioDto dto);

    /// <summary>
    /// Cambia el estado de un usuario (activo/inactivo)
    /// </summary>
    Task<bool> CambiarEstadoUsuarioAsync(long id, bool activo);

    /// <summary>
    /// Cambia la contraseña de un usuario
    /// </summary>
    Task<bool> CambiarPasswordAsync(long id, string nuevaPassword);

    /// <summary>
    /// Elimina un usuario del sistema
    /// </summary>
    Task<bool> DeleteUsuarioAsync(long id);

    /// <summary>
    /// Verifica si existe un usuario con el email especificado
    /// </summary>
    Task<bool> ExisteEmailAsync(string email, long? excludeId = null);
}

/// <summary>
/// Servicio para gestionar usuarios desde el panel de administración
/// </summary>
public class AdminUsuariosService : IAdminUsuariosService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<AdminUsuariosService> _logger;

    public AdminUsuariosService(
        TuCitaDbContext context,
        ILogger<AdminUsuariosService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene usuarios con filtros y paginación
    /// </summary>
    public async Task<UsuariosPaginadosDto> GetUsuariosAsync(FiltrosUsuariosDto filtros)
    {
        try
        {
            var query = _context.Usuarios
                .Include(u => u.RolesUsuarios)
                    .ThenInclude(ru => ru.Rol)
                .Include(u => u.PerfilMedico)
                    .ThenInclude(pm => pm!.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .Include(u => u.PerfilPaciente)
                .AsQueryable();

            // Filtro por búsqueda (nombre, apellido o email)
            if (!string.IsNullOrWhiteSpace(filtros.Busqueda))
            {
                var busqueda = filtros.Busqueda.ToLower();
                query = query.Where(u =>
                    u.Nombre.ToLower().Contains(busqueda) ||
                    u.Apellido.ToLower().Contains(busqueda) ||
                    u.Email.ToLower().Contains(busqueda));
            }

            // Filtro por rol
            if (!string.IsNullOrWhiteSpace(filtros.Rol))
            {
                query = query.Where(u => u.RolesUsuarios.Any(ru => ru.Rol.Nombre == filtros.Rol));
            }

            // Filtro por estado activo
            if (filtros.Activo.HasValue)
            {
                query = query.Where(u => u.Activo == filtros.Activo.Value);
            }

            // Contar total antes de paginar
            var total = await query.CountAsync();

            // Aplicar paginación
            var usuarios = await query
                .OrderBy(u => u.Apellido)
                .ThenBy(u => u.Nombre)
                .Skip((filtros.Pagina - 1) * filtros.TamanoPagina)
                .Take(filtros.TamanoPagina)
                .Select(u => new UsuarioDto
                {
                    Id = u.Id,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido,
                    Email = u.Email,
                    Telefono = u.Telefono,
                    Activo = u.Activo,
                    CreadoEn = u.CreadoEn,
                    ActualizadoEn = u.ActualizadoEn,
                    Roles = u.RolesUsuarios.Select(ru => ru.Rol.Nombre).ToList(),
                    NumeroLicencia = u.PerfilMedico != null ? u.PerfilMedico.NumeroLicencia : null,
                    Especialidades = u.PerfilMedico != null
                        ? u.PerfilMedico.EspecialidadesMedico.Select(me => me.Especialidad.Nombre).ToList()
                        : new List<string>(),
                    Identificacion = u.PerfilPaciente != null ? u.PerfilPaciente.Identificacion : null,
                    FechaNacimiento = u.PerfilPaciente != null ? u.PerfilPaciente.FechaNacimiento : null
                })
                .ToListAsync();

            return new UsuariosPaginadosDto
            {
                Usuarios = usuarios,
                Total = total,
                Pagina = filtros.Pagina,
                TamanoPagina = filtros.TamanoPagina
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener lista de usuarios");
            throw;
        }
    }

    /// <summary>
    /// Obtiene un usuario específico por ID
    /// </summary>
    public async Task<UsuarioDto?> GetUsuarioByIdAsync(long id)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.RolesUsuarios)
                    .ThenInclude(ru => ru.Rol)
                .Include(u => u.PerfilMedico)
                    .ThenInclude(pm => pm!.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .Include(u => u.PerfilPaciente)
                .Where(u => u.Id == id)
                .Select(u => new UsuarioDto
                {
                    Id = u.Id,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido,
                    Email = u.Email,
                    Telefono = u.Telefono,
                    Activo = u.Activo,
                    CreadoEn = u.CreadoEn,
                    ActualizadoEn = u.ActualizadoEn,
                    Roles = u.RolesUsuarios.Select(ru => ru.Rol.Nombre).ToList(),
                    NumeroLicencia = u.PerfilMedico != null ? u.PerfilMedico.NumeroLicencia : null,
                    Especialidades = u.PerfilMedico != null
                        ? u.PerfilMedico.EspecialidadesMedico.Select(me => me.Especialidad.Nombre).ToList()
                        : new List<string>(),
                    Identificacion = u.PerfilPaciente != null ? u.PerfilPaciente.Identificacion : null,
                    FechaNacimiento = u.PerfilPaciente != null ? u.PerfilPaciente.FechaNacimiento : null
                })
                .FirstOrDefaultAsync();

            return usuario;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuario con ID {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Crea un nuevo usuario en el sistema
    /// </summary>
    public async Task<UsuarioDto> CreateUsuarioAsync(CrearUsuarioDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Validar que no exista email duplicado
            if (await ExisteEmailAsync(dto.Email))
            {
                throw new InvalidOperationException("Ya existe un usuario con ese email");
            }

            // Validar que existan los roles
            if (dto.Roles == null || !dto.Roles.Any())
            {
                throw new InvalidOperationException("Debe asignar al menos un rol al usuario");
            }

            // Crear usuario
            var usuario = new Usuario
            {
                Nombre = dto.Nombre.Trim(),
                Apellido = dto.Apellido.Trim(),
                Email = dto.Email.Trim().ToLower(),
                EmailNormalizado = dto.Email.Trim().ToUpper(),
                Telefono = dto.Telefono?.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("TuCita2024!"), // Password temporal
                Activo = true,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Asignar roles
            foreach (var rolNombre in dto.Roles)
            {
                var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == rolNombre);
                if (rol == null)
                {
                    throw new InvalidOperationException($"El rol {rolNombre} no existe");
                }

                _context.RolesUsuarios.Add(new RolUsuario
                {
                    UsuarioId = usuario.Id,
                    RolId = rol.Id
                });
            }

            await _context.SaveChangesAsync();

            // Crear perfil de médico si tiene rol DOCTOR
            if (dto.Roles.Contains("DOCTOR"))
            {
                var perfilMedico = new PerfilMedico
                {
                    UsuarioId = usuario.Id,
                    NumeroLicencia = dto.NumeroLicencia?.Trim(),
                    Biografia = dto.Biografia?.Trim(),
                    Direccion = dto.Direccion?.Trim(),
                    CreadoEn = DateTime.UtcNow,
                    ActualizadoEn = DateTime.UtcNow
                };

                _context.PerfilesMedicos.Add(perfilMedico);
                await _context.SaveChangesAsync();

                // Asignar especialidades
                if (dto.EspecialidadesIds != null && dto.EspecialidadesIds.Any())
                {
                    foreach (var especialidadId in dto.EspecialidadesIds)
                    {
                        _context.MedicosEspecialidades.Add(new MedicoEspecialidad
                        {
                            MedicoId = usuario.Id,
                            EspecialidadId = especialidadId
                        });
                    }
                    await _context.SaveChangesAsync();
                }
            }

            // Crear perfil de paciente si tiene rol PACIENTE
            if (dto.Roles.Contains("PACIENTE"))
            {
                var perfilPaciente = new PerfilPaciente
                {
                    UsuarioId = usuario.Id,
                    Identificacion = dto.Identificacion?.Trim(),
                    FechaNacimiento = dto.FechaNacimiento,
                    TelefonoEmergencia = dto.TelefonoEmergencia?.Trim(),
                    CreadoEn = DateTime.UtcNow,
                    ActualizadoEn = DateTime.UtcNow
                };

                _context.PerfilesPacientes.Add(perfilPaciente);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            _logger.LogInformation("Usuario creado: {Email} (ID: {Id})", usuario.Email, usuario.Id);

            // Retornar el usuario creado
            return (await GetUsuarioByIdAsync(usuario.Id))!;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al crear usuario");
            throw;
        }
    }

    /// <summary>
    /// Actualiza un usuario existente
    /// </summary>
    public async Task<UsuarioDto> UpdateUsuarioAsync(long id, ActualizarUsuarioDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.RolesUsuarios)
                .Include(u => u.PerfilMedico)
                    .ThenInclude(pm => pm!.EspecialidadesMedico)
                .Include(u => u.PerfilPaciente)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                throw new InvalidOperationException("Usuario no encontrado");
            }

            // Validar email duplicado
            if (await ExisteEmailAsync(dto.Email, id))
            {
                throw new InvalidOperationException("Ya existe otro usuario con ese email");
            }

            // Actualizar datos básicos
            usuario.Nombre = dto.Nombre.Trim();
            usuario.Apellido = dto.Apellido.Trim();
            usuario.Email = dto.Email.Trim().ToLower();
            usuario.EmailNormalizado = dto.Email.Trim().ToUpper();
            usuario.Telefono = dto.Telefono?.Trim();
            usuario.Activo = dto.Activo;
            usuario.ActualizadoEn = DateTime.UtcNow;

            // Actualizar roles
            _context.RolesUsuarios.RemoveRange(usuario.RolesUsuarios);
            await _context.SaveChangesAsync();

            foreach (var rolNombre in dto.Roles)
            {
                var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == rolNombre);
                if (rol == null)
                {
                    throw new InvalidOperationException($"El rol {rolNombre} no existe");
                }

                _context.RolesUsuarios.Add(new RolUsuario
                {
                    UsuarioId = usuario.Id,
                    RolId = rol.Id
                });
            }

            await _context.SaveChangesAsync();

            // Gestionar perfil de médico
            if (dto.Roles.Contains("DOCTOR"))
            {
                if (usuario.PerfilMedico == null)
                {
                    // Crear perfil si no existe
                    var perfilMedico = new PerfilMedico
                    {
                        UsuarioId = usuario.Id,
                        NumeroLicencia = dto.NumeroLicencia?.Trim(),
                        Biografia = dto.Biografia?.Trim(),
                        Direccion = dto.Direccion?.Trim(),
                        CreadoEn = DateTime.UtcNow,
                        ActualizadoEn = DateTime.UtcNow
                    };
                    _context.PerfilesMedicos.Add(perfilMedico);
                }
                else
                {
                    // Actualizar perfil existente
                    usuario.PerfilMedico.NumeroLicencia = dto.NumeroLicencia?.Trim();
                    usuario.PerfilMedico.Biografia = dto.Biografia?.Trim();
                    usuario.PerfilMedico.Direccion = dto.Direccion?.Trim();
                    usuario.PerfilMedico.ActualizadoEn = DateTime.UtcNow;

                    // Actualizar especialidades
                    _context.MedicosEspecialidades.RemoveRange(usuario.PerfilMedico.EspecialidadesMedico);
                }

                await _context.SaveChangesAsync();

                // Agregar especialidades
                if (dto.EspecialidadesIds != null && dto.EspecialidadesIds.Any())
                {
                    foreach (var especialidadId in dto.EspecialidadesIds)
                    {
                        _context.MedicosEspecialidades.Add(new MedicoEspecialidad
                        {
                            MedicoId = usuario.Id,
                            EspecialidadId = especialidadId
                        });
                    }
                }
            }
            else if (usuario.PerfilMedico != null)
            {
                // Eliminar perfil médico si ya no tiene el rol
                _context.MedicosEspecialidades.RemoveRange(usuario.PerfilMedico.EspecialidadesMedico);
                _context.PerfilesMedicos.Remove(usuario.PerfilMedico);
            }

            // Gestionar perfil de paciente
            if (dto.Roles.Contains("PACIENTE"))
            {
                if (usuario.PerfilPaciente == null)
                {
                    // Crear perfil si no existe
                    var perfilPaciente = new PerfilPaciente
                    {
                        UsuarioId = usuario.Id,
                        Identificacion = dto.Identificacion?.Trim(),
                        FechaNacimiento = dto.FechaNacimiento,
                        TelefonoEmergencia = dto.TelefonoEmergencia?.Trim(),
                        CreadoEn = DateTime.UtcNow,
                        ActualizadoEn = DateTime.UtcNow
                    };
                    _context.PerfilesPacientes.Add(perfilPaciente);
                }
                else
                {
                    // Actualizar perfil existente
                    usuario.PerfilPaciente.Identificacion = dto.Identificacion?.Trim();
                    usuario.PerfilPaciente.FechaNacimiento = dto.FechaNacimiento;
                    usuario.PerfilPaciente.TelefonoEmergencia = dto.TelefonoEmergencia?.Trim();
                    usuario.PerfilPaciente.ActualizadoEn = DateTime.UtcNow;
                }
            }
            else if (usuario.PerfilPaciente != null)
            {
                // Eliminar perfil de paciente si ya no tiene el rol
                _context.PerfilesPacientes.Remove(usuario.PerfilPaciente);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Usuario actualizado: {Id} - {Email}", id, usuario.Email);

            return (await GetUsuarioByIdAsync(id))!;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al actualizar usuario {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Cambia el estado activo/inactivo de un usuario
    /// </summary>
    public async Task<bool> CambiarEstadoUsuarioAsync(long id, bool activo)
    {
        try
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                throw new InvalidOperationException("Usuario no encontrado");
            }

            usuario.Activo = activo;
            usuario.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Estado de usuario {Id} cambiado a {Estado}", id, activo ? "activo" : "inactivo");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar estado del usuario {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Cambia la contraseña de un usuario
    /// </summary>
    public async Task<bool> CambiarPasswordAsync(long id, string nuevaPassword)
    {
        try
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                throw new InvalidOperationException("Usuario no encontrado");
            }

            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(nuevaPassword);
            usuario.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Contraseña cambiada para usuario {Id}", id);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar contraseña del usuario {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Elimina un usuario del sistema
    /// </summary>
    public async Task<bool> DeleteUsuarioAsync(long id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.RolesUsuarios)
                .Include(u => u.PerfilMedico)
                    .ThenInclude(pm => pm!.EspecialidadesMedico)
                .Include(u => u.PerfilPaciente)
                    .ThenInclude(pp => pp!.Citas)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                throw new InvalidOperationException("Usuario no encontrado");
            }

            // Verificar si tiene citas asociadas
            if (usuario.PerfilPaciente?.Citas.Any() == true)
            {
                throw new InvalidOperationException(
                    $"No se puede eliminar el usuario porque tiene {usuario.PerfilPaciente.Citas.Count} cita(s) asociada(s)");
            }

            // Eliminar perfiles y relaciones
            if (usuario.PerfilMedico != null)
            {
                _context.MedicosEspecialidades.RemoveRange(usuario.PerfilMedico.EspecialidadesMedico);
                _context.PerfilesMedicos.Remove(usuario.PerfilMedico);
            }

            if (usuario.PerfilPaciente != null)
            {
                _context.PerfilesPacientes.Remove(usuario.PerfilPaciente);
            }

            _context.RolesUsuarios.RemoveRange(usuario.RolesUsuarios);
            _context.Usuarios.Remove(usuario);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Usuario eliminado: {Id} - {Email}", id, usuario.Email);

            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al eliminar usuario {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Verifica si existe un usuario con el email especificado
    /// </summary>
    public async Task<bool> ExisteEmailAsync(string email, long? excludeId = null)
    {
        try
        {
            var emailNormalizado = email.ToUpper().Trim();
            var query = _context.Usuarios
                .Where(u => u.EmailNormalizado == emailNormalizado);

            if (excludeId.HasValue)
            {
                query = query.Where(u => u.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar existencia de email");
            throw;
        }
    }
}
