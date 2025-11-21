using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar el envío de correos electrónicos
/// Incluye endpoints de prueba y envío de códigos de seguridad
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailController> _logger;

    /// <summary>
    /// Constructor del controlador de emails
    /// </summary>
    /// <param name="emailService">Servicio de email inyectado por DI</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public EmailController(IEmailService emailService, ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Envía un código de seguridad de 6 dígitos por correo electrónico
    /// </summary>
    /// <param name="request">Email destino y código opcional (si no se proporciona, se genera automáticamente)</param>
    /// <returns>Confirmación de envío y código generado (solo en desarrollo)</returns>
    /// <response code="200">Código de seguridad enviado exitosamente</response>
    /// <response code="400">Datos de solicitud inválidos</response>
    /// <response code="500">Error al enviar el correo</response>
    /// <remarks>
    /// Endpoint de prueba para validar el servicio de correo.
    /// En producción, NO se debe retornar el código en la respuesta.
    /// </remarks>
    [HttpPost("send-security-code")]
    public async Task<IActionResult> SendSecurityCode([FromBody] SendSecurityCodeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Solicitud de envío de código de seguridad a: {Email}", request.Email);

            // Generar código de seguridad aleatorio de 6 dígitos
            var codigoSeguridad = request.Code ?? GenerarCodigoSeguridad();

            var resultado = await _emailService.EnviarCodigoSeguridadAsync(request.Email, codigoSeguridad);

            if (resultado)
            {
                return Ok(new 
                { 
                    success = true, 
                    message = "Código de seguridad enviado correctamente",
                    // Solo para desarrollo - NO incluir en producción
                    code = codigoSeguridad 
                });
            }
            else
            {
                return StatusCode(500, new 
                { 
                    success = false, 
                    message = "Error al enviar el código de seguridad" 
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar solicitud de código de seguridad");
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Error interno del servidor",
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Envía un correo electrónico personalizado con contenido HTML
    /// </summary>
    /// <param name="request">Datos del correo (destinatario, asunto, cuerpo HTML y remitente opcional)</param>
    /// <returns>Confirmación de envío</returns>
    /// <response code="200">Correo enviado exitosamente</response>
    /// <response code="400">Datos de solicitud inválidos</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error al enviar el correo</response>
    /// <remarks>
    /// Requiere autenticación para evitar spam.
    /// Permite personalizar completamente el contenido del correo.
    /// </remarks>
    [HttpPost("send-custom")]
    [Authorize] // Requiere autenticación para evitar spam
    public async Task<IActionResult> SendCustomEmail([FromBody] SendCustomEmailRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Solicitud de envío de correo personalizado a: {Email}", request.Email);

            var resultado = await _emailService.EnviarEmailAsync(
                request.Email, 
                request.Subject, 
                request.HtmlBody,
                request.Sender
            );

            if (resultado)
            {
                return Ok(new 
                { 
                    success = true, 
                    message = "Correo enviado correctamente" 
                });
            }
            else
            {
                return StatusCode(500, new 
                { 
                    success = false, 
                    message = "Error al enviar el correo" 
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar solicitud de correo personalizado");
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Error interno del servidor",
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Genera un código de seguridad aleatorio de 6 dígitos
    /// </summary>
    /// <returns>Código numérico de 6 dígitos como string</returns>
    private static string GenerarCodigoSeguridad()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}

/// <summary>
/// DTO para solicitud de envío de código de seguridad
/// </summary>
public class SendSecurityCodeRequest
{
    /// <summary>
    /// Email del destinatario
    /// </summary>
    public required string Email { get; set; }
    
    /// <summary>
    /// Código opcional para testing (si no se proporciona, se genera automáticamente)
    /// </summary>
    public string? Code { get; set; }
}

/// <summary>
/// DTO para solicitud de envío de correo personalizado
/// </summary>
public class SendCustomEmailRequest
{
    /// <summary>
    /// Email del destinatario
    /// </summary>
    public required string Email { get; set; }
    
    /// <summary>
    /// Asunto del correo
    /// </summary>
    public required string Subject { get; set; }
    
    /// <summary>
    /// Cuerpo del correo en formato HTML
    /// </summary>
    public required string HtmlBody { get; set; }
    
    /// <summary>
    /// Remitente opcional (si no se especifica, usa el configurado por defecto)
    /// </summary>
    public string? Sender { get; set; }
}
