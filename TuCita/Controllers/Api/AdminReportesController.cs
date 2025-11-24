using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Admin;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para generación y exportación de reportes administrativos
/// Proporciona endpoints para crear reportes detallados y exportarlos en varios formatos
/// Requiere autenticación con rol ADMIN
/// </summary>
[ApiController]
[Route("api/admin/reportes")]
[Authorize(Roles = "ADMIN")]
public class AdminReportesController : ControllerBase
{
    private readonly IAdminReportesService _reportesService;
    private readonly ILogger<AdminReportesController> _logger;

    /// <summary>
    /// Constructor del controlador de reportes
    /// </summary>
    public AdminReportesController(
        IAdminReportesService reportesService,
        ILogger<AdminReportesController> logger)
    {
        _reportesService = reportesService;
        _logger = logger;
    }

    /// <summary>
    /// Genera un reporte basado en los filtros proporcionados
    /// </summary>
    /// <param name="filtros">Filtros para la generación del reporte</param>
    /// <returns>Reporte generado con datos y gráficas</returns>
    /// <response code="200">Reporte generado exitosamente</response>
    /// <response code="400">Filtros inválidos</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Ejemplo de request:
    /// 
    ///     POST /api/admin/reportes/generar
    ///     {
    ///         "tipoReporte": 0,
    ///         "fechaInicio": "2024-01-01T00:00:00",
    ///         "fechaFin": "2024-01-31T23:59:59",
    ///         "medicoId": null,
    ///         "especialidadId": null,
    ///         "estado": null
    ///     }
    /// 
    /// Tipos de reporte disponibles:
    /// - 0: CitasPorPeriodo
    /// - 1: CitasPorDoctor
    /// - 2: CitasPorEspecialidad
    /// - 3: PacientesFrecuentes
    /// - 4: DoctoresRendimiento
    /// - 5: NoShowAnalisis
    /// </remarks>
    [HttpPost("generar")]
    [ProducesResponseType(typeof(ReporteGeneradoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GenerarReporte([FromBody] ReporteFilterDto filtros)
    {
        try
        {
            // Validar filtros
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (filtros.FechaInicio > filtros.FechaFin)
            {
                return BadRequest(new { message = "La fecha de inicio no puede ser mayor a la fecha de fin" });
            }

            var diasDiferencia = (filtros.FechaFin - filtros.FechaInicio).TotalDays;
            if (diasDiferencia > 365)
            {
                return BadRequest(new { message = "El rango de fechas no puede ser mayor a 365 días" });
            }

            _logger.LogInformation(
                "Generando reporte tipo {TipoReporte} desde {FechaInicio} hasta {FechaFin}",
                filtros.TipoReporte,
                filtros.FechaInicio,
                filtros.FechaFin);

            var reporte = await _reportesService.GenerarReporteAsync(filtros);

            return Ok(reporte);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos al generar reporte");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar reporte");
            return StatusCode(500, new { message = "Error interno al generar el reporte", error = ex.Message });
        }
    }

    /// <summary>
    /// Exporta un reporte a un archivo descargable
    /// </summary>
    /// <param name="filtros">Filtros para la generación del reporte</param>
    /// <returns>Archivo del reporte en el formato especificado</returns>
    /// <response code="200">Archivo generado exitosamente</response>
    /// <response code="400">Filtros inválidos</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Ejemplo de request:
    /// 
    ///     POST /api/admin/reportes/exportar
    ///     {
    ///         "tipoReporte": 0,
    ///         "fechaInicio": "2024-01-01T00:00:00",
    ///         "fechaFin": "2024-01-31T23:59:59",
    ///         "formato": 0
    ///     }
    /// 
    /// Formatos disponibles:
    /// - 0: PDF
    /// - 1: Excel
    /// - 2: CSV
    /// 
    /// La respuesta incluye el archivo en Base64 que puede ser descargado desde el frontend.
    /// </remarks>
    [HttpPost("exportar")]
    [ProducesResponseType(typeof(ReporteExportadoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportarReporte([FromBody] ReporteFilterDto filtros)
    {
        try
        {
            // Validar filtros
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!filtros.Formato.HasValue)
            {
                return BadRequest(new { message = "Debe especificar un formato de exportación" });
            }

            if (filtros.FechaInicio > filtros.FechaFin)
            {
                return BadRequest(new { message = "La fecha de inicio no puede ser mayor a la fecha de fin" });
            }

            _logger.LogInformation(
                "Exportando reporte tipo {TipoReporte} en formato {Formato}",
                filtros.TipoReporte,
                filtros.Formato);

            var archivoExportado = await _reportesService.ExportarReporteAsync(filtros);

            return Ok(archivoExportado);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos al exportar reporte");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al exportar reporte");
            return StatusCode(500, new { message = "Error interno al exportar el reporte", error = ex.Message });
        }
    }

    /// <summary>
    /// Descarga directa de un archivo de reporte (alternativa a exportar)
    /// </summary>
    /// <param name="filtros">Filtros para la generación del reporte</param>
    /// <returns>Archivo binario para descarga directa</returns>
    /// <response code="200">Archivo descargado exitosamente</response>
    /// <response code="400">Filtros inválidos</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("descargar")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DescargarReporte([FromBody] ReporteFilterDto filtros)
    {
        try
        {
            // Validar filtros
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!filtros.Formato.HasValue)
            {
                return BadRequest(new { message = "Debe especificar un formato de exportación" });
            }

            _logger.LogInformation(
                "Descargando reporte tipo {TipoReporte} en formato {Formato}",
                filtros.TipoReporte,
                filtros.Formato);

            var archivoExportado = await _reportesService.ExportarReporteAsync(filtros);

            // Convertir de Base64 a bytes
            var fileBytes = Convert.FromBase64String(archivoExportado.ArchivoBase64);

            return File(fileBytes, archivoExportado.ContentType, archivoExportado.NombreArchivo);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos al descargar reporte");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al descargar reporte");
            return StatusCode(500, new { message = "Error interno al descargar el reporte", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene los tipos de reportes disponibles
    /// </summary>
    /// <returns>Lista de tipos de reportes con descripciones</returns>
    /// <response code="200">Tipos de reportes obtenidos exitosamente</response>
    [HttpGet("tipos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetTiposReportes()
    {
        var tipos = new[]
        {
            new { id = 0, nombre = "Citas por Periodo", descripcion = "Reporte de citas agrupadas por día" },
            new { id = 1, nombre = "Citas por Doctor", descripcion = "Estadísticas de citas por cada doctor" },
            new { id = 2, nombre = "Citas por Especialidad", descripcion = "Análisis de citas por especialidad médica" },
            new { id = 3, nombre = "Pacientes Frecuentes", descripcion = "Top 50 pacientes con más citas" },
            new { id = 4, nombre = "Rendimiento de Doctores", descripcion = "Métricas de rendimiento y ocupación" },
            new { id = 5, nombre = "Análisis de NO_SHOW", descripcion = "Análisis detallado de inasistencias" }
        };

        return Ok(tipos);
    }

    /// <summary>
    /// Obtiene los formatos de exportación disponibles
    /// </summary>
    /// <returns>Lista de formatos de exportación</returns>
    /// <response code="200">Formatos obtenidos exitosamente</response>
    [HttpGet("formatos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetFormatosExportacion()
    {
        var formatos = new[]
        {
            new { id = 0, nombre = "PDF", extension = ".pdf", contentType = "application/pdf" },
            new { id = 1, nombre = "Excel", extension = ".xlsx", contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            new { id = 2, nombre = "CSV", extension = ".csv", contentType = "text/csv" }
        };

        return Ok(formatos);
    }
}
