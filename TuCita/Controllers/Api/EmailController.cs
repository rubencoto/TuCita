using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailController> _logger;

    public EmailController(IEmailService emailService, ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Endpoint de prueba para enviar código de seguridad
    /// </summary>
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
    /// Endpoint de prueba para enviar correo personalizado
    /// </summary>
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
    private static string GenerarCodigoSeguridad()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}

// DTOs
public class SendSecurityCodeRequest
{
    public required string Email { get; set; }
    public string? Code { get; set; } // Opcional para testing
}

public class SendCustomEmailRequest
{
    public required string Email { get; set; }
    public required string Subject { get; set; }
    public required string HtmlBody { get; set; }
    public string? Sender { get; set; }
}
