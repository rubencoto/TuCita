using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Doctors;
using TuCita.Models;

namespace TuCita.Services;

/// <summary>
/// Servicio para gestionar la disponibilidad de horarios de los doctores
/// Consulta y manipula la tabla agenda_turnos en la base de datos
/// </summary>
public class DoctorAvailabilityService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<DoctorAvailabilityService> _logger;

    public DoctorAvailabilityService(TuCitaDbContext context, ILogger<DoctorAvailabilityService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los slots de disponibilidad de un doctor
    /// Opcionalmente filtrados por fecha
    /// </summary>
    public async Task<List<DoctorSlotDto>> GetDoctorSlotsAsync(string doctorId, string? fecha = null)
    {
        try
        {
            if (!long.TryParse(doctorId, out var medicoId))
            {
                _logger.LogWarning("DoctorId inválido: {DoctorId}", doctorId);
                return new List<DoctorSlotDto>();
            }

            var query = _context.AgendaTurnos
                .Where(t => t.MedicoId == medicoId)
                .AsQueryable();

            // Filtrar por fecha si se proporciona
            if (!string.IsNullOrEmpty(fecha))
            {
                if (DateOnly.TryParseExact(fecha, "yyyy-MM-dd", out var targetDate))
                {
                    query = query.Where(t => DateOnly.FromDateTime(t.Inicio) == targetDate);
                }
                else
                {
                    _logger.LogWarning("Formato de fecha inválido: {Fecha}", fecha);
                    return new List<DoctorSlotDto>();
                }
            }

            var turnos = await query
                .OrderBy(t => t.Inicio)
                .ToListAsync();

            var slots = turnos.Select(MapToSlotDto).ToList();

            _logger.LogInformation("Obtenidos {Count} slots para doctor {DoctorId}, fecha={Fecha}",
                slots.Count, doctorId, fecha ?? "todas");

            return slots;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slots para doctor {DoctorId}", doctorId);
            throw;
        }
    }

    /// <summary>
    /// Obtiene un slot específico por ID
    /// </summary>
    public async Task<DoctorSlotDto?> GetSlotByIdAsync(long slotId)
    {
        try
        {
            var turno = await _context.AgendaTurnos
                .FirstOrDefaultAsync(t => t.Id == slotId);

            if (turno == null)
            {
                _logger.LogWarning("Slot no encontrado: {SlotId}", slotId);
                return null;
            }

            return MapToSlotDto(turno);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slot {SlotId}", slotId);
            throw;
        }
    }

    /// <summary>
    /// Crea un nuevo slot de disponibilidad
    /// </summary>
    public async Task<DoctorSlotDto> CreateSlotAsync(string doctorId, string fecha, string horaInicio, 
        string horaFin, SlotTipo tipo, SlotEstado estado)
    {
        try
        {
            if (!long.TryParse(doctorId, out var medicoId))
            {
                throw new ArgumentException($"DoctorId inválido: {doctorId}");
            }

            // Parsear fecha y horas
            var fechaDate = DateOnly.ParseExact(fecha, "yyyy-MM-dd");
            var inicio = TimeOnly.ParseExact(horaInicio, "HH:mm");
            var fin = TimeOnly.ParseExact(horaFin, "HH:mm");

            // Crear DateTime combinando fecha y hora
            var inicioDateTime = fechaDate.ToDateTime(inicio);
            var finDateTime = fechaDate.ToDateTime(fin);

            // Validar que no exista solapamiento
            var hasOverlap = await _context.AgendaTurnos
                .AnyAsync(t => t.MedicoId == medicoId &&
                              t.Inicio < finDateTime &&
                              t.Fin > inicioDateTime);

            if (hasOverlap)
            {
                throw new InvalidOperationException("El horario se solapa con un turno existente");
            }

            // Crear nuevo turno
            var nuevoTurno = new AgendaTurno
            {
                MedicoId = medicoId,
                Inicio = inicioDateTime,
                Fin = finDateTime,
                Estado = MapToEstadoTurno(estado),
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.AgendaTurnos.Add(nuevoTurno);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Slot creado: ID={SlotId}, Doctor={DoctorId}, Fecha={Fecha}, Hora={HoraInicio}-{HoraFin}",
                nuevoTurno.Id, doctorId, fecha, horaInicio, horaFin);

            return MapToSlotDto(nuevoTurno);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear slot para doctor {DoctorId}", doctorId);
            throw;
        }
    }

    /// <summary>
    /// Actualiza un slot existente
    /// </summary>
    public async Task<DoctorSlotDto?> UpdateSlotAsync(long slotId, string? horaInicio = null, 
        string? horaFin = null, SlotTipo? tipo = null, SlotEstado? estado = null)
    {
        try
        {
            var turno = await _context.AgendaTurnos.FindAsync(slotId);
            if (turno == null)
            {
                _logger.LogWarning("Slot no encontrado para actualizar: {SlotId}", slotId);
                return null;
            }

            // No permitir modificar turnos ocupados/reservados
            if (turno.Estado == EstadoTurno.RESERVADO)
            {
                throw new InvalidOperationException("No se pueden modificar turnos reservados");
            }

            var fechaTurno = DateOnly.FromDateTime(turno.Inicio);
            var horaInicioActual = TimeOnly.FromDateTime(turno.Inicio);
            var horaFinActual = TimeOnly.FromDateTime(turno.Fin);

            // Actualizar horas si se proporcionan
            if (!string.IsNullOrEmpty(horaInicio))
            {
                horaInicioActual = TimeOnly.ParseExact(horaInicio, "HH:mm");
            }

            if (!string.IsNullOrEmpty(horaFin))
            {
                horaFinActual = TimeOnly.ParseExact(horaFin, "HH:mm");
            }

            var nuevoInicio = fechaTurno.ToDateTime(horaInicioActual);
            var nuevoFin = fechaTurno.ToDateTime(horaFinActual);

            // Validar que no haya solapamiento (excluyendo el turno actual)
            var hasOverlap = await _context.AgendaTurnos
                .AnyAsync(t => t.Id != slotId &&
                              t.MedicoId == turno.MedicoId &&
                              t.Inicio < nuevoFin &&
                              t.Fin > nuevoInicio);

            if (hasOverlap)
            {
                throw new InvalidOperationException("El horario se solapa con otro turno existente");
            }

            // Aplicar cambios
            turno.Inicio = nuevoInicio;
            turno.Fin = nuevoFin;

            if (estado.HasValue)
            {
                turno.Estado = MapToEstadoTurno(estado.Value);
            }

            turno.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Slot actualizado: {SlotId}", slotId);

            return MapToSlotDto(turno);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar slot {SlotId}", slotId);
            throw;
        }
    }

    /// <summary>
    /// Elimina un slot
    /// </summary>
    public async Task<bool> DeleteSlotAsync(long slotId)
    {
        try
        {
            var turno = await _context.AgendaTurnos.FindAsync(slotId);
            if (turno == null)
            {
                _logger.LogWarning("Slot no encontrado para eliminar: {SlotId}", slotId);
                return false;
            }

            // No permitir eliminar turnos reservados
            if (turno.Estado == EstadoTurno.RESERVADO)
            {
                throw new InvalidOperationException("No se pueden eliminar turnos reservados");
            }

            _context.AgendaTurnos.Remove(turno);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Slot eliminado: {SlotId}", slotId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar slot {SlotId}", slotId);
            throw;
        }
    }

    /// <summary>
    /// Crea múltiples slots en lote basados en un horario semanal
    /// </summary>
    public async Task<(int Created, List<DoctorSlotDto> Slots, List<string> Errors)> BulkCreateSlotsAsync(
        string doctorId, string fechaInicio, string fechaFin, Dictionary<int, List<WeeklyTimeSlot>> horarioSemanal)
    {
        try
        {
            if (!long.TryParse(doctorId, out var medicoId))
            {
                throw new ArgumentException($"DoctorId inválido: {doctorId}");
            }

            var inicio = DateOnly.ParseExact(fechaInicio, "yyyy-MM-dd");
            var fin = DateOnly.ParseExact(fechaFin, "yyyy-MM-dd");

            var slotsCreados = new List<DoctorSlotDto>();
            var errores = new List<string>();

            // Iterar sobre cada día en el rango
            for (var fecha = inicio; fecha <= fin; fecha = fecha.AddDays(1))
            {
                var diaSemana = (int)fecha.DayOfWeek;

                // Verificar si hay horarios configurados para este día
                if (!horarioSemanal.ContainsKey(diaSemana) || horarioSemanal[diaSemana].Count == 0)
                    continue;

                foreach (var timeSlot in horarioSemanal[diaSemana])
                {
                    try
                    {
                        var slot = await CreateSlotAsync(
                            doctorId,
                            fecha.ToString("yyyy-MM-dd"),
                            timeSlot.HoraInicio,
                            timeSlot.HoraFin,
                            timeSlot.Tipo,
                            SlotEstado.DISPONIBLE
                        );

                        slotsCreados.Add(slot);
                    }
                    catch (Exception ex)
                    {
                        var error = $"{fecha:yyyy-MM-dd} {timeSlot.HoraInicio}-{timeSlot.HoraFin}: {ex.Message}";
                        errores.Add(error);
                        _logger.LogWarning("Error al crear slot en lote: {Error}", error);
                    }
                }
            }

            _logger.LogInformation("Creación masiva completada. Doctor={DoctorId}, Creados={Created}, Errores={Errors}",
                doctorId, slotsCreados.Count, errores.Count);

            return (slotsCreados.Count, slotsCreados, errores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en creación masiva de slots para doctor {DoctorId}", doctorId);
            throw;
        }
    }

    #region Helper Methods

    /// <summary>
    /// Mapea un AgendaTurno a DoctorSlotDto
    /// </summary>
    private DoctorSlotDto MapToSlotDto(AgendaTurno turno)
    {
        return new DoctorSlotDto
        {
            IdSlot = turno.Id,
            DoctorId = turno.MedicoId.ToString(),
            Fecha = DateOnly.FromDateTime(turno.Inicio).ToString("yyyy-MM-dd"),
            HoraInicio = TimeOnly.FromDateTime(turno.Inicio).ToString("HH:mm"),
            HoraFin = TimeOnly.FromDateTime(turno.Fin).ToString("HH:mm"),
            Tipo = SlotTipo.PRESENCIAL, // Puedes agregar un campo TipoConsulta a AgendaTurno si necesitas distinguir
            Estado = MapFromEstadoTurno(turno.Estado)
        };
    }

    /// <summary>
    /// Mapea SlotEstado a EstadoTurno (base de datos)
    /// </summary>
    private EstadoTurno MapToEstadoTurno(SlotEstado estado)
    {
        return estado switch
        {
            SlotEstado.DISPONIBLE => EstadoTurno.DISPONIBLE,
            SlotEstado.OCUPADO => EstadoTurno.RESERVADO,
            SlotEstado.BLOQUEADO => EstadoTurno.BLOQUEADO,
            _ => EstadoTurno.DISPONIBLE
        };
    }

    /// <summary>
    /// Mapea EstadoTurno (base de datos) a SlotEstado
    /// </summary>
    private SlotEstado MapFromEstadoTurno(EstadoTurno estado)
    {
        return estado switch
        {
            EstadoTurno.DISPONIBLE => SlotEstado.DISPONIBLE,
            EstadoTurno.RESERVADO => SlotEstado.OCUPADO,
            EstadoTurno.BLOQUEADO => SlotEstado.BLOQUEADO,
            _ => SlotEstado.DISPONIBLE
        };
    }

    #endregion
}

/// <summary>
/// Clase auxiliar para slots semanales en creación en lote
/// </summary>
public class WeeklyTimeSlot
{
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
    public SlotTipo Tipo { get; set; }
}
