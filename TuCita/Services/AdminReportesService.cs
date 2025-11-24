using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Admin;
using TuCita.Models;
using System.Text;

namespace TuCita.Services;

/// <summary>
/// Interface para el servicio de reportes de administración
/// </summary>
public interface IAdminReportesService
{
    /// <summary>
    /// Genera un reporte basado en los filtros proporcionados
    /// </summary>
    Task<ReporteGeneradoDto> GenerarReporteAsync(ReporteFilterDto filtros);

    /// <summary>
    /// Exporta un reporte a un archivo en el formato especificado
    /// </summary>
    Task<ReporteExportadoDto> ExportarReporteAsync(ReporteFilterDto filtros);
}

/// <summary>
/// Servicio para generación y exportación de reportes administrativos
/// </summary>
public class AdminReportesService : IAdminReportesService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<AdminReportesService> _logger;

    public AdminReportesService(
        TuCitaDbContext context,
        ILogger<AdminReportesService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Genera un reporte completo basado en el tipo y filtros especificados
    /// </summary>
    public async Task<ReporteGeneradoDto> GenerarReporteAsync(ReporteFilterDto filtros)
    {
        try
        {
            _logger.LogInformation("Generando reporte tipo {TipoReporte} desde {FechaInicio} hasta {FechaFin}",
                filtros.TipoReporte, filtros.FechaInicio, filtros.FechaFin);

            var reporte = filtros.TipoReporte switch
            {
                TipoReporte.CitasPorPeriodo => await GenerarReporteCitasPorPeriodoAsync(filtros),
                TipoReporte.CitasPorDoctor => await GenerarReporteCitasPorDoctorAsync(filtros),
                TipoReporte.CitasPorEspecialidad => await GenerarReporteCitasPorEspecialidadAsync(filtros),
                TipoReporte.PacientesFrecuentes => await GenerarReportePacientesFrecuentesAsync(filtros),
                TipoReporte.DoctoresRendimiento => await GenerarReporteDoctoresRendimientoAsync(filtros),
                TipoReporte.NoShowAnalisis => await GenerarReporteNoShowAnalisisAsync(filtros),
                _ => throw new ArgumentException($"Tipo de reporte no soportado: {filtros.TipoReporte}")
            };

            return reporte;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar reporte tipo {TipoReporte}", filtros.TipoReporte);
            throw;
        }
    }

    /// <summary>
    /// Exporta un reporte a archivo (CSV, Excel o PDF)
    /// </summary>
    public async Task<ReporteExportadoDto> ExportarReporteAsync(ReporteFilterDto filtros)
    {
        try
        {
            // Generar el reporte primero
            var reporte = await GenerarReporteAsync(filtros);

            // Exportar según el formato solicitado
            var formato = filtros.Formato ?? FormatoExportacion.CSV;

            return formato switch
            {
                FormatoExportacion.CSV => ExportarCSV(reporte, filtros),
                FormatoExportacion.Excel => ExportarExcel(reporte, filtros),
                FormatoExportacion.PDF => ExportarPDF(reporte, filtros),
                _ => throw new ArgumentException($"Formato de exportación no soportado: {formato}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al exportar reporte");
            throw;
        }
    }

    #region Generadores de Reportes

    /// <summary>
    /// Genera reporte de citas agrupadas por periodo
    /// </summary>
    private async Task<ReporteGeneradoDto> GenerarReporteCitasPorPeriodoAsync(ReporteFilterDto filtros)
    {
        var query = _context.Citas
            .Where(c => c.Inicio >= filtros.FechaInicio && c.Inicio <= filtros.FechaFin);

        if (filtros.MedicoId.HasValue)
            query = query.Where(c => c.MedicoId == filtros.MedicoId.Value);

        if (!string.IsNullOrEmpty(filtros.Estado))
            query = query.Where(c => c.Estado.ToString() == filtros.Estado);

        var citas = await query.ToListAsync();

        // Agrupar por día
        var citasPorDia = citas
            .GroupBy(c => c.Inicio.Date)
            .Select(g => new CitasPorPeriodoDto
            {
                Periodo = g.Key.ToString("dd/MM/yyyy"),
                Fecha = g.Key,
                Total = g.Count(),
                Programadas = g.Count(c => c.Estado == EstadoCita.PENDIENTE || c.Estado == EstadoCita.CONFIRMADA),
                Atendidas = g.Count(c => c.Estado == EstadoCita.ATENDIDA),
                Canceladas = g.Count(c => c.Estado == EstadoCita.CANCELADA || c.Estado == EstadoCita.RECHAZADA),
                NoShow = g.Count(c => c.Estado == EstadoCita.NO_ATENDIDA)
            })
            .OrderBy(x => x.Fecha)
            .ToList();

        var resumen = GenerarResumenEjecutivo(citas);

        return new ReporteGeneradoDto
        {
            TipoReporte = "Citas por Periodo",
            Titulo = $"Reporte de Citas por Periodo - {filtros.FechaInicio:dd/MM/yyyy} a {filtros.FechaFin:dd/MM/yyyy}",
            FechaInicio = filtros.FechaInicio,
            FechaFin = filtros.FechaFin,
            Resumen = resumen,
            Datos = citasPorDia.Cast<object>().ToList(),
            DatosGraficas = citasPorDia.Cast<object>().ToList(),
            FiltrosAplicados = GenerarDiccionarioFiltros(filtros)
        };
    }

    /// <summary>
    /// Genera reporte de citas agrupadas por doctor
    /// </summary>
    private async Task<ReporteGeneradoDto> GenerarReporteCitasPorDoctorAsync(ReporteFilterDto filtros)
    {
        var query = _context.Citas
            .Include(c => c.Medico)
                .ThenInclude(m => m.Usuario)
            .Include(c => c.Medico)
                .ThenInclude(m => m.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
            .Where(c => c.Inicio >= filtros.FechaInicio && c.Inicio <= filtros.FechaFin);

        if (filtros.MedicoId.HasValue)
            query = query.Where(c => c.MedicoId == filtros.MedicoId.Value);

        if (filtros.EspecialidadId.HasValue)
            query = query.Where(c => c.Medico.EspecialidadesMedico.Any(me => me.EspecialidadId == filtros.EspecialidadId.Value));

        var citas = await query.ToListAsync();

        var citasPorDoctor = citas
            .GroupBy(c => new
            {
                c.MedicoId,
                NombreDoctor = c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido,
                Especialidad = c.Medico.EspecialidadesMedico.FirstOrDefault()?.Especialidad.Nombre ?? "Sin especialidad"
            })
            .Select(g =>
            {
                var total = g.Count();
                var atendidas = g.Count(c => c.Estado == EstadoCita.ATENDIDA);
                return new CitasPorDoctorDto
                {
                    DoctorId = g.Key.MedicoId,
                    NombreDoctor = g.Key.NombreDoctor,
                    Especialidad = g.Key.Especialidad,
                    TotalCitas = total,
                    CitasAtendidas = atendidas,
                    CitasCanceladas = g.Count(c => c.Estado == EstadoCita.CANCELADA || c.Estado == EstadoCita.RECHAZADA),
                    CitasNoShow = g.Count(c => c.Estado == EstadoCita.NO_ATENDIDA),
                    TasaAsistencia = total > 0 ? Math.Round((decimal)atendidas / total * 100, 2) : 0,
                    PromedioCalificacion = 0 // Implementar si existe sistema de calificaciones
                };
            })
            .OrderByDescending(x => x.TotalCitas)
            .ToList();

        var resumen = GenerarResumenEjecutivo(citas);

        return new ReporteGeneradoDto
        {
            TipoReporte = "Citas por Doctor",
            Titulo = $"Reporte de Citas por Doctor - {filtros.FechaInicio:dd/MM/yyyy} a {filtros.FechaFin:dd/MM/yyyy}",
            FechaInicio = filtros.FechaInicio,
            FechaFin = filtros.FechaFin,
            Resumen = resumen,
            Datos = citasPorDoctor.Cast<object>().ToList(),
            DatosGraficas = citasPorDoctor.Cast<object>().ToList(),
            FiltrosAplicados = GenerarDiccionarioFiltros(filtros)
        };
    }

    /// <summary>
    /// Genera reporte de citas agrupadas por especialidad
    /// </summary>
    private async Task<ReporteGeneradoDto> GenerarReporteCitasPorEspecialidadAsync(ReporteFilterDto filtros)
    {
        var query = _context.Citas
            .Include(c => c.Medico)
                .ThenInclude(m => m.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
            .Where(c => c.Inicio >= filtros.FechaInicio && c.Inicio <= filtros.FechaFin);

        if (filtros.EspecialidadId.HasValue)
            query = query.Where(c => c.Medico.EspecialidadesMedico.Any(me => me.EspecialidadId == filtros.EspecialidadId.Value));

        var citas = await query.ToListAsync();

        var citasPorEspecialidad = citas
            .Where(c => c.Medico.EspecialidadesMedico.Any())
            .GroupBy(c => new
            {
                EspecialidadId = c.Medico.EspecialidadesMedico.First().EspecialidadId,
                NombreEspecialidad = c.Medico.EspecialidadesMedico.First().Especialidad.Nombre
            })
            .Select(g =>
            {
                var total = g.Count();
                var atendidas = g.Count(c => c.Estado == EstadoCita.ATENDIDA);
                var doctoresUnicos = g.Select(c => c.MedicoId).Distinct().Count();
                return new CitasPorEspecialidadDto
                {
                    EspecialidadId = g.Key.EspecialidadId,
                    NombreEspecialidad = g.Key.NombreEspecialidad,
                    TotalCitas = total,
                    NumDoctores = doctoresUnicos,
                    PromedioCtasPorDoctor = doctoresUnicos > 0 ? Math.Round((decimal)total / doctoresUnicos, 2) : 0,
                    TasaAsistencia = total > 0 ? Math.Round((decimal)atendidas / total * 100, 2) : 0
                };
            })
            .OrderByDescending(x => x.TotalCitas)
            .ToList();

        var resumen = GenerarResumenEjecutivo(citas);

        return new ReporteGeneradoDto
        {
            TipoReporte = "Citas por Especialidad",
            Titulo = $"Reporte de Citas por Especialidad - {filtros.FechaInicio:dd/MM/yyyy} a {filtros.FechaFin:dd/MM/yyyy}",
            FechaInicio = filtros.FechaInicio,
            FechaFin = filtros.FechaFin,
            Resumen = resumen,
            Datos = citasPorEspecialidad.Cast<object>().ToList(),
            DatosGraficas = citasPorEspecialidad.Cast<object>().ToList(),
            FiltrosAplicados = GenerarDiccionarioFiltros(filtros)
        };
    }

    /// <summary>
    /// Genera reporte de pacientes más frecuentes
    /// </summary>
    private async Task<ReporteGeneradoDto> GenerarReportePacientesFrecuentesAsync(ReporteFilterDto filtros)
    {
        var query = _context.Citas
            .Include(c => c.Paciente)
                .ThenInclude(p => p.Usuario)
            .Where(c => c.Inicio >= filtros.FechaInicio && c.Inicio <= filtros.FechaFin);

        var citas = await query.ToListAsync();

        var pacientesFrecuentes = citas
            .GroupBy(c => new
            {
                c.PacienteId,
                NombrePaciente = c.Paciente.Usuario.Nombre + " " + c.Paciente.Usuario.Apellido,
                Email = c.Paciente.Usuario.Email,
                Telefono = c.Paciente.Usuario.Telefono ?? ""
            })
            .Select(g => new PacienteFrecuenteDto
            {
                PacienteId = g.Key.PacienteId,
                NombrePaciente = g.Key.NombrePaciente,
                Email = g.Key.Email,
                Telefono = g.Key.Telefono,
                TotalCitas = g.Count(),
                CitasAtendidas = g.Count(c => c.Estado == EstadoCita.ATENDIDA),
                CitasCanceladas = g.Count(c => c.Estado == EstadoCita.CANCELADA || c.Estado == EstadoCita.RECHAZADA),
                CitasNoShow = g.Count(c => c.Estado == EstadoCita.NO_ATENDIDA),
                UltimaCita = g.Max(c => c.Inicio)
            })
            .OrderByDescending(x => x.TotalCitas)
            .Take(50) // Top 50 pacientes más frecuentes
            .ToList();

        var resumen = GenerarResumenEjecutivo(citas);

        return new ReporteGeneradoDto
        {
            TipoReporte = "Pacientes Frecuentes",
            Titulo = $"Reporte de Pacientes Frecuentes - {filtros.FechaInicio:dd/MM/yyyy} a {filtros.FechaFin:dd/MM/yyyy}",
            FechaInicio = filtros.FechaInicio,
            FechaFin = filtros.FechaFin,
            Resumen = resumen,
            Datos = pacientesFrecuentes.Cast<object>().ToList(),
            FiltrosAplicados = GenerarDiccionarioFiltros(filtros)
        };
    }

    /// <summary>
    /// Genera reporte de rendimiento de doctores
    /// </summary>
    private async Task<ReporteGeneradoDto> GenerarReporteDoctoresRendimientoAsync(ReporteFilterDto filtros)
    {
        var query = _context.Citas
            .Include(c => c.Medico)
                .ThenInclude(m => m.Usuario)
            .Include(c => c.Medico)
                .ThenInclude(m => m.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
            .Where(c => c.Inicio >= filtros.FechaInicio && c.Inicio <= filtros.FechaFin);

        if (filtros.MedicoId.HasValue)
            query = query.Where(c => c.MedicoId == filtros.MedicoId.Value);

        var citas = await query.ToListAsync();

        // Obtener turnos en el periodo
        var turnos = await _context.AgendaTurnos
            .Where(t => t.Inicio >= filtros.FechaInicio && t.Inicio <= filtros.FechaFin)
            .ToListAsync();

        var rendimiento = citas
            .GroupBy(c => new
            {
                c.MedicoId,
                NombreDoctor = c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido,
                Especialidad = c.Medico.EspecialidadesMedico.FirstOrDefault()?.Especialidad.Nombre ?? "Sin especialidad"
            })
            .Select(g =>
            {
                var total = g.Count();
                var atendidas = g.Count(c => c.Estado == EstadoCita.ATENDIDA);
                var turnosDoctor = turnos.Where(t => t.MedicoId == g.Key.MedicoId).ToList();
                var slotsDisponibles = turnosDoctor.Count;
                var slotsOcupados = g.Count();

                return new DoctorRendimientoDto
                {
                    DoctorId = g.Key.MedicoId,
                    NombreDoctor = g.Key.NombreDoctor,
                    Especialidad = g.Key.Especialidad,
                    TotalCitas = total,
                    CitasAtendidas = atendidas,
                    TasaAsistencia = total > 0 ? Math.Round((decimal)atendidas / total * 100, 2) : 0,
                    TiempoPromedioAtencion = 30, // Placeholder - calcular si hay datos de duración
                    PacientesUnicos = g.Select(c => c.PacienteId).Distinct().Count(),
                    CalificacionPromedio = 0, // Implementar si existe sistema de calificaciones
                    SlotsDisponibles = slotsDisponibles,
                    SlotsOcupados = slotsOcupados,
                    TasaOcupacion = slotsDisponibles > 0 ? Math.Round((decimal)slotsOcupados / slotsDisponibles * 100, 2) : 0
                };
            })
            .OrderByDescending(x => x.TotalCitas)
            .ToList();

        var resumen = GenerarResumenEjecutivo(citas);

        return new ReporteGeneradoDto
        {
            TipoReporte = "Rendimiento de Doctores",
            Titulo = $"Reporte de Rendimiento de Doctores - {filtros.FechaInicio:dd/MM/yyyy} a {filtros.FechaFin:dd/MM/yyyy}",
            FechaInicio = filtros.FechaInicio,
            FechaFin = filtros.FechaFin,
            Resumen = resumen,
            Datos = rendimiento.Cast<object>().ToList(),
            DatosGraficas = rendimiento.Cast<object>().ToList(),
            FiltrosAplicados = GenerarDiccionarioFiltros(filtros)
        };
    }

    /// <summary>
    /// Genera análisis detallado de NO_SHOW
    /// </summary>
    private async Task<ReporteGeneradoDto> GenerarReporteNoShowAnalisisAsync(ReporteFilterDto filtros)
    {
        var query = _context.Citas
            .Include(c => c.Medico)
                .ThenInclude(m => m.Usuario)
            .Include(c => c.Medico)
                .ThenInclude(m => m.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
            .Where(c => c.Inicio >= filtros.FechaInicio && c.Inicio <= filtros.FechaFin);

        var todasCitas = await query.ToListAsync();
        var citasNoShow = todasCitas.Where(c => c.Estado == EstadoCita.NO_ATENDIDA).ToList();

        var totalCitas = todasCitas.Count;
        var totalNoShow = citasNoShow.Count;

        var noShowPorDoctor = citasNoShow
            .GroupBy(c => new
            {
                c.MedicoId,
                NombreDoctor = c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido
            })
            .Select(g => new NoShowPorDoctorDto
            {
                DoctorId = g.Key.MedicoId,
                NombreDoctor = g.Key.NombreDoctor,
                NoShowCount = g.Count(),
                Porcentaje = totalNoShow > 0 ? Math.Round((decimal)g.Count() / totalNoShow * 100, 2) : 0
            })
            .OrderByDescending(x => x.NoShowCount)
            .ToList();

        var noShowPorEspecialidad = citasNoShow
            .Where(c => c.Medico.EspecialidadesMedico.Any())
            .GroupBy(c => c.Medico.EspecialidadesMedico.First().Especialidad.Nombre)
            .Select(g => new NoShowPorEspecialidadDto
            {
                Especialidad = g.Key,
                NoShowCount = g.Count(),
                Porcentaje = totalNoShow > 0 ? Math.Round((decimal)g.Count() / totalNoShow * 100, 2) : 0
            })
            .OrderByDescending(x => x.NoShowCount)
            .ToList();

        var analisis = new NoShowAnalisisDto
        {
            Periodo = $"{filtros.FechaInicio:dd/MM/yyyy} - {filtros.FechaFin:dd/MM/yyyy}",
            TotalNoShow = totalNoShow,
            TotalCitas = totalCitas,
            Porcentaje = totalCitas > 0 ? Math.Round((decimal)totalNoShow / totalCitas * 100, 2) : 0,
            PorDoctor = noShowPorDoctor,
            PorEspecialidad = noShowPorEspecialidad
        };

        var resumen = GenerarResumenEjecutivo(todasCitas);

        return new ReporteGeneradoDto
        {
            TipoReporte = "Análisis de NO_SHOW",
            Titulo = $"Análisis de NO_SHOW - {filtros.FechaInicio:dd/MM/yyyy} a {filtros.FechaFin:dd/MM/yyyy}",
            FechaInicio = filtros.FechaInicio,
            FechaFin = filtros.FechaFin,
            Resumen = resumen,
            Datos = new List<object> { analisis },
            DatosGraficas = noShowPorDoctor.Cast<object>().ToList(),
            FiltrosAplicados = GenerarDiccionarioFiltros(filtros)
        };
    }

    #endregion

    #region Métodos Auxiliares

    /// <summary>
    /// Genera el resumen ejecutivo a partir de una lista de citas
    /// </summary>
    private ResumenEjecutivoDto GenerarResumenEjecutivo(List<Cita> citas)
    {
        var total = citas.Count;
        var atendidas = citas.Count(c => c.Estado == EstadoCita.ATENDIDA);
        var canceladas = citas.Count(c => c.Estado == EstadoCita.CANCELADA || c.Estado == EstadoCita.RECHAZADA);
        var noShow = citas.Count(c => c.Estado == EstadoCita.NO_ATENDIDA);

        return new ResumenEjecutivoDto
        {
            TotalCitas = total,
            CitasAtendidas = atendidas,
            CitasCanceladas = canceladas,
            CitasNoShow = noShow,
            TasaAsistencia = total > 0 ? Math.Round((decimal)atendidas / total * 100, 2) : 0,
            TasaCancelacion = total > 0 ? Math.Round((decimal)canceladas / total * 100, 2) : 0,
            TasaNoShow = total > 0 ? Math.Round((decimal)noShow / total * 100, 2) : 0,
            TotalPacientes = citas.Select(c => c.PacienteId).Distinct().Count(),
            TotalDoctores = citas.Select(c => c.MedicoId).Distinct().Count()
        };
    }

    /// <summary>
    /// Genera el diccionario de filtros aplicados
    /// </summary>
    private Dictionary<string, string> GenerarDiccionarioFiltros(ReporteFilterDto filtros)
    {
        var dict = new Dictionary<string, string>
        {
            { "FechaInicio", filtros.FechaInicio.ToString("dd/MM/yyyy") },
            { "FechaFin", filtros.FechaFin.ToString("dd/MM/yyyy") }
        };

        if (filtros.MedicoId.HasValue)
            dict["MedicoId"] = filtros.MedicoId.Value.ToString();

        if (filtros.EspecialidadId.HasValue)
            dict["EspecialidadId"] = filtros.EspecialidadId.Value.ToString();

        if (!string.IsNullOrEmpty(filtros.Estado))
            dict["Estado"] = filtros.Estado;

        return dict;
    }

    #endregion

    #region Exportadores

    /// <summary>
    /// Exporta el reporte a formato CSV
    /// </summary>
    private ReporteExportadoDto ExportarCSV(ReporteGeneradoDto reporte, ReporteFilterDto filtros)
    {
        var csv = new StringBuilder();
        
        // Encabezado
        csv.AppendLine($"# {reporte.Titulo}");
        csv.AppendLine($"# Generado: {reporte.FechaGeneracion:dd/MM/yyyy HH:mm}");
        csv.AppendLine();
        
        // Resumen
        csv.AppendLine("RESUMEN EJECUTIVO");
        csv.AppendLine($"Total Citas,{reporte.Resumen.TotalCitas}");
        csv.AppendLine($"Citas Atendidas,{reporte.Resumen.CitasAtendidas}");
        csv.AppendLine($"Citas Canceladas,{reporte.Resumen.CitasCanceladas}");
        csv.AppendLine($"Citas NO_SHOW,{reporte.Resumen.CitasNoShow}");
        csv.AppendLine($"Tasa Asistencia,{reporte.Resumen.TasaAsistencia}%");
        csv.AppendLine($"Tasa Cancelación,{reporte.Resumen.TasaCancelacion}%");
        csv.AppendLine($"Tasa NO_SHOW,{reporte.Resumen.TasaNoShow}%");
        csv.AppendLine();

        // Datos detallados (simplificado - adaptar según tipo de reporte)
        csv.AppendLine("DATOS DETALLADOS");
        // Aquí se añadirían las columnas específicas según el tipo de reporte
        // Por ahora, formato genérico
        csv.AppendLine(System.Text.Json.JsonSerializer.Serialize(reporte.Datos));

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        var base64 = Convert.ToBase64String(bytes);

        return new ReporteExportadoDto
        {
            NombreArchivo = $"reporte_{filtros.TipoReporte}_{DateTime.Now:yyyyMMdd_HHmmss}.csv",
            ContentType = "text/csv",
            ArchivoBase64 = base64,
            TamanoBytes = bytes.Length
        };
    }

    /// <summary>
    /// Exporta el reporte a formato Excel (simplificado - usar EPPlus o ClosedXML en producción)
    /// </summary>
    private ReporteExportadoDto ExportarExcel(ReporteGeneradoDto reporte, ReporteFilterDto filtros)
    {
        // Por ahora retorna CSV con extensión xlsx
        // En producción, usar una librería como EPPlus o ClosedXML
        var csvExport = ExportarCSV(reporte, filtros);
        csvExport.NombreArchivo = csvExport.NombreArchivo.Replace(".csv", ".xlsx");
        csvExport.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        
        return csvExport;
    }

    /// <summary>
    /// Exporta el reporte a formato PDF (simplificado - usar iTextSharp o QuestPDF en producción)
    /// </summary>
    private ReporteExportadoDto ExportarPDF(ReporteGeneradoDto reporte, ReporteFilterDto filtros)
    {
        // Por ahora retorna texto plano con extensión pdf
        // En producción, usar una librería como QuestPDF o iTextSharp
        var csvExport = ExportarCSV(reporte, filtros);
        csvExport.NombreArchivo = csvExport.NombreArchivo.Replace(".csv", ".pdf");
        csvExport.ContentType = "application/pdf";
        
        return csvExport;
    }

    #endregion
}
