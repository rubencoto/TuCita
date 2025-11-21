using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Appointments;
using Microsoft.Extensions.Logging;

namespace TuCita.Services;

public interface IDoctorAppointmentsService
{
    Task<IEnumerable<DoctorAppointmentDto>> GetDoctorAppointmentsAsync(long medicoId, DateTime? fechaInicio = null, DateTime? fechaFin = null, string? estado = null);
    Task<AppointmentDetailDto?> GetAppointmentDetailAsync(long citaId, long medicoId);
    Task<DoctorAppointmentDto?> CreateDoctorAppointmentAsync(long medicoId, CreateDoctorAppointmentRequest request);
    Task<bool> UpdateAppointmentStatusAsync(long citaId, long medicoId, UpdateAppointmentStatusRequest request);
    Task<IEnumerable<DoctorPatientDto>> GetDoctorPatientsAsync(long medicoId);
}

public class DoctorAppointmentsService : IDoctorAppointmentsService
{
    private readonly TuCitaDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<DoctorAppointmentsService> _logger;

    public DoctorAppointmentsService(
        TuCitaDbContext context,
        IEmailService emailService,
        ILogger<DoctorAppointmentsService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<IEnumerable<DoctorAppointmentDto>> GetDoctorAppointmentsAsync(
        long medicoId,
        DateTime? fechaInicio = null,
        DateTime? fechaFin = null,
        string? estado = null)
    {
        try
        {
            var query = _context.Citas
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Where(c => c.MedicoId == medicoId);

            if (fechaInicio.HasValue)
            {
                query = query.Where(c => c.Inicio >= fechaInicio.Value);
            }

            if (fechaFin.HasValue)
            {
                query = query.Where(c => c.Inicio <= fechaFin.Value);
            }

            if (!string.IsNullOrEmpty(estado) && Enum.TryParse<EstadoCita>(estado.ToUpperInvariant(), out var estadoCita))
            {
                query = query.Where(c => c.Estado == estadoCita);
            }

            var citas = await query
                .OrderByDescending(c => c.Inicio)
                .ToListAsync();

            return citas.Select(c => new DoctorAppointmentDto
            {
                Id = c.Id,
                Paciente = new PacienteInfoDto
                {
                    Id = c.PacienteId,
                    Nombre = c.Paciente?.Usuario != null
                        ? $"{c.Paciente.Usuario.Nombre} {c.Paciente.Usuario.Apellido}"
                        : "Paciente no disponible",
                    Edad = c.Paciente?.FechaNacimiento != null
                        ? CalcularEdad(c.Paciente.FechaNacimiento.Value.ToDateTime(TimeOnly.MinValue))
                        : null,
                    Foto = null, // Usuario no tiene FotoPerfil en el modelo
                    Correo = c.Paciente?.Usuario?.Email,
                    Telefono = c.Paciente?.Usuario?.Telefono,
                    Identificacion = c.Paciente?.Identificacion
                },
                Fecha = c.Inicio,
                Hora = c.Inicio.ToString("HH:mm"),
                Estado = c.Estado.ToString(),
                Motivo = c.Motivo,
                Observaciones = null, // Cita no tiene campo Observaciones
                Inicio = c.Inicio,
                Fin = c.Fin
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener citas del doctor {MedicoId}", medicoId);
            throw;
        }
    }

    /// <summary>
    /// Obtiene el detalle completo de una cita específica
    /// </summary>
    public async Task<AppointmentDetailDto?> GetAppointmentDetailAsync(long citaId, long medicoId)
    {
        try
        {
            var cita = await _context.Citas
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                // Cargar historial médico de la cita
                .Include(c => c.Diagnosticos)
                .Include(c => c.NotasClinicas)
                .Include(c => c.Recetas)
                    .ThenInclude(r => r.Items)
                .Include(c => c.Documentos)
                    .ThenInclude(d => d.Storage)
                .FirstOrDefaultAsync(c => c.Id == citaId && c.MedicoId == medicoId);

            if (cita == null)
            {
                _logger.LogWarning("Cita no encontrada o no pertenece al médico: CitaId={CitaId}, MedicoId={MedicoId}", citaId, medicoId);
                return null;
            }

            return new AppointmentDetailDto
            {
                Id = cita.Id,
                Fecha = cita.Inicio,
                Hora = cita.Inicio.ToString("HH:mm"),
                Estado = cita.Estado.ToString(),
                Motivo = cita.Motivo,
                Observaciones = null, // El modelo Cita no tiene este campo
                Tipo = "PRESENCIAL", // Valor por defecto
                Ubicacion = cita.Medico?.Direccion,
                Paciente = new PatientDetailDto
                {
                    IdPaciente = cita.PacienteId,
                    Nombre = cita.Paciente?.Usuario != null
                        ? $"{cita.Paciente.Usuario.Nombre} {cita.Paciente.Usuario.Apellido}"
                        : "Paciente no disponible",
                    Correo = cita.Paciente?.Usuario?.Email ?? string.Empty,
                    Telefono = cita.Paciente?.Usuario?.Telefono,
                    FechaNacimiento = cita.Paciente?.FechaNacimiento?.ToString("yyyy-MM-dd"),
                    Edad = cita.Paciente?.FechaNacimiento != null
                        ? CalcularEdad(cita.Paciente.FechaNacimiento.Value.ToDateTime(TimeOnly.MinValue))
                        : null,
                    Foto = null // Usuario no tiene FotoPerfil
                },
                NombreMedico = cita.Medico?.Usuario != null
                    ? $"Dr. {cita.Medico.Usuario.Nombre} {cita.Medico.Usuario.Apellido}"
                    : "Médico no disponible",
                Especialidad = cita.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre,
                Inicio = cita.Inicio,
                Fin = cita.Fin,
                // Mapear historial médico
                Diagnosticos = cita.Diagnosticos.Select(d => new TuCita.DTOs.MedicalHistory.DiagnosticoDto
                {
                    Id = d.Id,
                    CitaId = d.CitaId,
                    Codigo = d.Codigo,
                    Descripcion = d.Descripcion,
                    Fecha = d.CreadoEn
                }).ToList(),
                NotasClinicas = cita.NotasClinicas.Select(n => new TuCita.DTOs.MedicalHistory.NotaClinicaDto
                {
                    Id = n.Id,
                    CitaId = n.CitaId,
                    Contenido = n.Nota,
                    Fecha = n.CreadoEn
                }).ToList(),
                Recetas = cita.Recetas.Select(r => new TuCita.DTOs.MedicalHistory.RecetaDto
                {
                    Id = r.Id,
                    CitaId = r.CitaId,
                    Indicaciones = r.Indicaciones,
                    Fecha = r.CreadoEn,
                    Medicamentos = r.Items.Select(ri => new TuCita.DTOs.MedicalHistory.RecetaItemDto
                    {
                        Id = ri.Id,
                        Medicamento = ri.Medicamento,
                        Dosis = ri.Dosis,
                        Frecuencia = ri.Frecuencia,
                        Duracion = ri.Duracion,
                        Notas = ri.Notas
                    }).ToList()
                }).ToList(),
                Documentos = cita.Documentos.Select(d => new TuCita.DTOs.MedicalHistory.DocumentoDto
                {
                    Id = d.Id,
                    CitaId = d.CitaId,
                    Categoria = d.Categoria.ToString(),
                    NombreArchivo = d.NombreArchivo,
                    MimeType = d.MimeType,
                    TamanoBytes = d.TamanoBytes,
                    Notas = d.Notas,
                    FechaSubida = d.CreadoEn,
                    Etiquetas = d.Etiquetas?.Select(e => e.Etiqueta).ToList() ?? new List<string>()
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener detalle de cita {CitaId}", citaId);
            throw;
        }
    }

    public async Task<DoctorAppointmentDto?> CreateDoctorAppointmentAsync(long medicoId, CreateDoctorAppointmentRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _logger.LogInformation("Creando cita manual para médico {MedicoId} y paciente {PacienteId}", medicoId, request.PacienteId);

            var medico = await _context.PerfilesMedicos
                .Include(m => m.Usuario)
                .Include(m => m.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(m => m.UsuarioId == medicoId);

            if (medico == null)
            {
                _logger.LogWarning("Médico no encontrado: {MedicoId}", medicoId);
                return null;
            }

            var paciente = await _context.PerfilesPacientes
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.UsuarioId == request.PacienteId);

            if (paciente == null)
            {
                _logger.LogWarning("Paciente no encontrado: {PacienteId}", request.PacienteId);
                return null;
            }

            // Parsear la hora desde string (HH:mm)
            if (!TimeSpan.TryParse(request.Hora, out var horaTurno))
            {
                _logger.LogWarning("Formato de hora inválido: {Hora}", request.Hora);
                return null;
            }

            var inicio = request.Fecha.Date + horaTurno;
            var fin = inicio.AddMinutes(30);

            var hayConflicto = await _context.Citas
                .AnyAsync(c => c.MedicoId == medicoId &&
                              c.Estado != EstadoCita.CANCELADA &&
                              ((c.Inicio < fin && c.Fin > inicio)));

            if (hayConflicto)
            {
                _logger.LogWarning("Conflicto de horario para médico {MedicoId} en {Inicio}", medicoId, inicio);
                return null;
            }

            if (!Enum.TryParse<EstadoCita>(request.Estado.ToUpperInvariant(), out var estadoCita))
            {
                estadoCita = EstadoCita.PENDIENTE;
            }

            // Crear un turno para la cita manual
            var turno = new AgendaTurno
            {
                MedicoId = medicoId,
                Inicio = inicio,
                Fin = fin,
                Estado = EstadoTurno.RESERVADO,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.AgendaTurnos.Add(turno);
            await _context.SaveChangesAsync(); // Guardar para obtener el ID del turno

            var cita = new Cita
            {
                TurnoId = turno.Id,
                MedicoId = medicoId,
                PacienteId = request.PacienteId,
                Estado = estadoCita,
                Motivo = request.Motivo,
                Inicio = inicio,
                Fin = fin,
                CreadoPor = medico.UsuarioId,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.Citas.Add(cita);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Cita manual creada exitosamente: CitaId={CitaId}", cita.Id);

            try
            {
                var especialidad = medico.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General";

                await _emailService.EnviarCitaCreadaAsync(
                    paciente.Usuario.Email,
                    $"{paciente.Usuario.Nombre} {paciente.Usuario.Apellido}",
                    $"{medico.Usuario.Nombre} {medico.Usuario.Apellido}",
                    cita.Inicio,
                    cita.Motivo ?? "Consulta general",
                    especialidad
                );
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Error al enviar email para CitaId={CitaId}", cita.Id);
            }

            return new DoctorAppointmentDto
            {
                Id = cita.Id,
                Paciente = new PacienteInfoDto
                {
                    Id = paciente.UsuarioId,
                    Nombre = $"{paciente.Usuario.Nombre} {paciente.Usuario.Apellido}",
                    Edad = paciente.FechaNacimiento != null ? CalcularEdad(paciente.FechaNacimiento.Value.ToDateTime(TimeOnly.MinValue)) : null,
                    Foto = null,
                    Correo = paciente.Usuario.Email,
                    Telefono = paciente.Usuario.Telefono,
                    Identificacion = paciente.Identificacion
                },
                Fecha = cita.Inicio,
                Hora = cita.Inicio.ToString("HH:mm"),
                Estado = cita.Estado.ToString(),
                Motivo = cita.Motivo,
                Observaciones = request.Observaciones,
                Inicio = cita.Inicio,
                Fin = cita.Fin
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al crear cita manual para médico {MedicoId}", medicoId);
            return null;
        }
    }

    public async Task<bool> UpdateAppointmentStatusAsync(long citaId, long medicoId, UpdateAppointmentStatusRequest request)
    {
        try
        {
            _logger.LogInformation("?? Iniciando actualización de estado de cita: CitaId={CitaId}, MedicoId={MedicoId}", citaId, medicoId);
            _logger.LogInformation("?? Request recibido: {@Request}", request);
            
            var cita = await _context.Citas
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(c => c.Id == citaId && c.MedicoId == medicoId);

            if (cita == null)
            {
                _logger.LogWarning("? Cita no encontrada o no pertenece al médico: CitaId={CitaId}, MedicoId={MedicoId}", citaId, medicoId);
                return false;
            }

            var estadoAnterior = cita.Estado;
            _logger.LogInformation("?? Estado anterior: {EstadoAnterior}", estadoAnterior);

            if (!string.IsNullOrEmpty(request.Estado) && Enum.TryParse<EstadoCita>(request.Estado.ToUpperInvariant(), out var nuevoEstado))
            {
                cita.Estado = nuevoEstado;
                _logger.LogInformation("?? Nuevo estado parseado: {NuevoEstado}", nuevoEstado);
            }
            else
            {
                _logger.LogWarning("?? No se pudo parsear el estado: {Estado}", request.Estado);
                return false;
            }

            cita.ActualizadoEn = DateTime.UtcNow;

            _logger.LogInformation("?? Guardando cambios en la base de datos...");
            
            // IMPORTANTE: Debido al trigger trg_citas_touch, usamos una estrategia diferente
            // El trigger puede estar actualizando automáticamente actualizado_en
            // Deshabilitamos el tracking para forzar el UPDATE
            _context.Entry(cita).State = EntityState.Modified;
            
            var changesCount = await _context.SaveChangesAsync();
            _logger.LogInformation("? Cambios guardados: {ChangesCount} registros afectados", changesCount);

            // IMPORTANTE: Debido al trigger en la tabla Citas, necesitamos recargar la entidad
            // para asegurarnos de que el estado se actualizó correctamente
            _context.Entry(cita).State = EntityState.Detached; // Detach primero
            
            cita = await _context.Citas
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == citaId);
                
            if (cita == null)
            {
                _logger.LogError("? ERROR: No se pudo recargar la cita después de guardar");
                return false;
            }
            
            _logger.LogInformation("?? Entidad recargada desde la base de datos");
            _logger.LogInformation("? Estado de cita actualizado: CitaId={CitaId}, EstadoAnterior={EstadoAnterior}, EstadoNuevo={EstadoNuevo}",
                citaId, estadoAnterior, cita.Estado);

            // Verificar que el estado realmente se guardó
            _logger.LogInformation("?? Verificación post-guardado - Estado en BD: {EstadoVerificado}", cita.Estado);

            // Si después de recargar el estado NO cambió, hay un problema con el trigger
            if (cita.Estado != nuevoEstado)
            {
                _logger.LogError("? ERROR CRÍTICO: El estado no se guardó correctamente. Esperado: {Esperado}, Actual: {Actual}", 
                    nuevoEstado, cita.Estado);
                _logger.LogError("?? POSIBLE CAUSA: El trigger trg_citas_touch está revirtiendo el cambio");
                return false;
            }

            try
            {
                // Recargar con navegación para el email
                var citaCompleta = await _context.Citas
                    .Include(c => c.Paciente).ThenInclude(p => p.Usuario)
                    .Include(c => c.Medico).ThenInclude(m => m.Usuario)
                    .Include(c => c.Medico).ThenInclude(m => m.EspecialidadesMedico).ThenInclude(me => me.Especialidad)
                    .FirstOrDefaultAsync(c => c.Id == citaId);

                if (citaCompleta == null) return true; // Ya guardamos, solo falta el email

                var paciente = citaCompleta.Paciente.Usuario;
                var medico = citaCompleta.Medico.Usuario;
                var especialidad = citaCompleta.Medico.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General";

                if (citaCompleta.Estado == EstadoCita.CONFIRMADA && estadoAnterior != EstadoCita.CONFIRMADA)
                {
                    _logger.LogInformation("?? Enviando email de confirmación...");
                    await _emailService.EnviarCitaCreadaAsync(
                        paciente.Email,
                        $"{paciente.Nombre} {paciente.Apellido}",
                        $"{medico.Nombre} {medico.Apellido}",
                        citaCompleta.Inicio,
                        citaCompleta.Motivo ?? "Consulta general",
                        especialidad
                    );
                }
                else if (citaCompleta.Estado == EstadoCita.CANCELADA && estadoAnterior != EstadoCita.CANCELADA)
                {
                    _logger.LogInformation("?? Enviando email de cancelación...");
                    await _emailService.EnviarCitaCanceladaAsync(
                        paciente.Email,
                        $"{paciente.Nombre} {paciente.Apellido}",
                        $"{medico.Nombre} {medico.Apellido}",
                        citaCompleta.Inicio,
                        especialidad
                    );
                }
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "? Error al enviar email para CitaId={CitaId}", citaId);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error al actualizar estado de cita: CitaId={CitaId}", citaId);
            return false;
        }
    }

    public async Task<IEnumerable<DoctorPatientDto>> GetDoctorPatientsAsync(long medicoId)
    {
        try
        {
            var pacientes = await _context.Citas
                .Where(c => c.MedicoId == medicoId)
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Select(c => c.Paciente)
                .Distinct()
                .OrderBy(p => p.Usuario.Nombre)
                .ThenBy(p => p.Usuario.Apellido)
                .ToListAsync();

            return pacientes.Select(p => new DoctorPatientDto
            {
                IdPaciente = p.UsuarioId,
                Nombre = $"{p.Usuario.Nombre} {p.Usuario.Apellido}",
                Correo = p.Usuario.Email,
                Telefono = p.Usuario.Telefono
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener pacientes del doctor {MedicoId}", medicoId);
            throw;
        }
    }

    private static int CalcularEdad(DateTime fechaNacimiento)
    {
        var hoy = DateTime.Today;
        var edad = hoy.Year - fechaNacimiento.Year;
        if (fechaNacimiento.Date > hoy.AddYears(-edad)) edad--;
        return edad;
    }
}
