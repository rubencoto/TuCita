using System.Net;
using System.Net.Mail;
using System.Text;

namespace TuCita.Services;

public interface IEmailService
{
    Task<bool> EnviarEmailAsync(string destinatario, string asunto, string cuerpoHtml, string? remitente = null);
    Task<bool> EnviarCodigoSeguridadAsync(string emailDestino, string codigoSeguridad);
    Task<bool> SendPasswordResetLinkAsync(string email, string token, string nombre);
    Task<bool> EnviarConfirmacionCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
    Task<bool> EnviarRecordatorioCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly SmtpClient _smtpClient;
    private readonly string _remitenteDefault;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;

        // ? Leer configuración SMTP desde variables de entorno (.env)
        var smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") 
            ?? throw new InvalidOperationException("SMTP_SERVER no configurada en .env");
        
        var smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        
        var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") 
            ?? throw new InvalidOperationException("SMTP_USERNAME no configurada en .env");
        
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") 
            ?? throw new InvalidOperationException("SMTP_PASSWORD no configurada en .env");
        
        _remitenteDefault = Environment.GetEnvironmentVariable("DEFAULT_SENDER") 
            ?? "no-reply@tucitaonline.org";

        _smtpClient = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 30000 // 30 segundos
        };

        _logger.LogInformation("? EmailService inicializado con servidor SMTP: {SmtpServer}:{SmtpPort}", smtpServer, smtpPort);
    }

    /// <summary>
    /// Envía un correo electrónico usando Amazon SES SMTP
    /// </summary>
    /// <param name="destinatario">Dirección de email del destinatario</param>
    /// <param name="asunto">Asunto del correo</param>
    /// <param name="cuerpoHtml">Contenido HTML del correo</param>
    /// <param name="remitente">Dirección del remitente (opcional, usa el default si no se especifica)</param>
    /// <returns>True si el correo se envió correctamente, False en caso contrario</returns>
    public async Task<bool> EnviarEmailAsync(string destinatario, string asunto, string cuerpoHtml, string? remitente = null)
    {
        try
        {
            _logger.LogInformation("Preparando envío de correo a: {Destinatario}, Asunto: {Asunto}", destinatario, asunto);

            var mensaje = new MailMessage
            {
                From = new MailAddress(remitente ?? _remitenteDefault, "TuCitaOnline"),
                Subject = asunto,
                Body = cuerpoHtml,
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8
            };

            mensaje.To.Add(destinatario);

            await _smtpClient.SendMailAsync(mensaje);

            _logger.LogInformation("? Correo enviado exitosamente a: {Destinatario}", destinatario);
            return true;
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "? Error SMTP al enviar correo a {Destinatario}: {Message}", destinatario, ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error general al enviar correo a {Destinatario}: {Message}", destinatario, ex.Message);
            return false;
        }
    }

    /// <summary>
    /// Envía un correo con un código de seguridad para recuperación/cambio de contraseña
    /// </summary>
    /// <param name="emailDestino">Dirección de email del destinatario</param>
    /// <param name="codigoSeguridad">Código de seguridad de 6 dígitos</param>
    /// <returns>True si el correo se envió correctamente, False en caso contrario</returns>
    public async Task<bool> EnviarCodigoSeguridadAsync(string emailDestino, string codigoSeguridad)
    {
        var asunto = "Código de seguridad - TuCitaOnline";
        var cuerpoHtml = GenerarPlantillaCodigoSeguridad(codigoSeguridad);

        _logger.LogInformation("Enviando código de seguridad a: {Email}", emailDestino);
        
        // Usar remitente específico para seguridad
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml, "security@tucitaonline.org");
    }

    /// <summary>
    /// Envía un correo con código de recuperación de contraseña
    /// </summary>
    public async Task<bool> SendPasswordResetCodeAsync(string email, string codigo, string nombre)
    {
        var asunto = "Recuperación de Contraseña - TuCitaOnline";
        var cuerpoHtml = GenerarPlantillaRecuperacionPassword(codigo, nombre);

        _logger.LogInformation("Enviando código de recuperación de contraseña a: {Email}", email);
        
        return await EnviarEmailAsync(email, asunto, cuerpoHtml, "security@tucitaonline.org");
    }

    /// <summary>
    /// Envía un correo con enlace de recuperación de contraseña
    /// </summary>
    public async Task<bool> SendPasswordResetLinkAsync(string email, string token, string nombre)
    {
        var asunto = "Recuperación de Contraseña - TuCitaOnline";
        
        // Obtener la URL base desde variables de entorno
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
        var resetUrl = $"{frontendUrl}/reset-password?token={token}";
        
        var cuerpoHtml = GenerarPlantillaRecuperacionPasswordLink(resetUrl, nombre);

        _logger.LogInformation("Enviando enlace de recuperación de contraseña a: {Email}", email);
        
        return await EnviarEmailAsync(email, asunto, cuerpoHtml, "security@tucitaonline.org");
    }

    /// <summary>
    /// Envía un correo de confirmación de cita médica
    /// </summary>
    public async Task<bool> EnviarConfirmacionCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Confirmación de cita médica - TuCitaOnline";
        var cuerpoHtml = GenerarPlantillaConfirmacionCita(nombrePaciente, nombreMedico, fechaCita, especialidad);

        _logger.LogInformation("Enviando confirmación de cita a: {Email}", emailDestino);
        
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml, "appointments@tucitaonline.org");
    }

    /// <summary>
    /// Envía un recordatorio de cita médica
    /// </summary>
    public async Task<bool> EnviarRecordatorioCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Recordatorio: Tu cita médica es mañana - TuCitaOnline";
        var cuerpoHtml = GenerarPlantillaRecordatorioCita(nombrePaciente, nombreMedico, fechaCita, especialidad);

        _logger.LogInformation("Enviando recordatorio de cita a: {Email}", emailDestino);
        
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml, "notifications@tucitaonline.org");
    }

    /// <summary>
    /// Genera la plantilla HTML para el correo de código de seguridad
    /// </summary>
    private string GenerarPlantillaCodigoSeguridad(string codigoSeguridad)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Código de Seguridad - TuCitaOnline</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 28px;"">?? TuCitaOnline</h1>
    </div>
    
    <div style=""background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;"">
        <h2 style=""color: #667eea; margin-top: 0;"">Recuperación de Contraseña</h2>
        
        <p style=""font-size: 16px; color: #555;"">
            Has solicitado recuperar o cambiar tu contraseña en TuCitaOnline.
        </p>
        
        <p style=""font-size: 16px; color: #555;"">
            Tu código de seguridad es:
        </p>
        
        <div style=""background-color: #f7f9fc; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;"">
            <h2 style=""color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;"">
                {codigoSeguridad}
            </h2>
        </div>
        
        <p style=""font-size: 14px; color: #777; margin-top: 30px;"">
            <strong>? Este código expirará en 15 minutos.</strong>
        </p>
        
        <p style=""font-size: 14px; color: #777;"">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
        </p>
        
        <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
        
        <p style=""font-size: 12px; color: #999; text-align: center;"">
            Este es un correo automático, por favor no respondas a este mensaje.<br>
            © 2024 TuCitaOnline - Sistema de gestión de citas médicas
        </p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Genera la plantilla HTML para recuperación de contraseña
    /// </summary>
    private string GenerarPlantillaRecuperacionPassword(string codigo, string nombre)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Recuperación de Contraseña - TuCitaOnline</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 28px;"">?? TuCitaOnline</h1>
    </div>
    
    <div style=""background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;"">
        <h2 style=""color: #667eea; margin-top: 0;"">?? Recuperación de Contraseña</h2>
        
        <p style=""font-size: 16px; color: #555;"">
            Hola <strong>{nombre}</strong>,
        </p>
        
        <p style=""font-size: 16px; color: #555;"">
            Has solicitado recuperar tu contraseña en TuCitaOnline. Utiliza el siguiente código para restablecer tu contraseña:
        </p>
        
        <div style=""background-color: #f7f9fc; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;"">
            <h2 style=""color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;"">
                {codigo}
            </h2>
        </div>
        
        <p style=""font-size: 14px; color: #777; margin-top: 30px;"">
            <strong>? Este código expirará en 15 minutos.</strong>
        </p>
        
        <p style=""font-size: 14px; color: #777;"">
            Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios y tu cuenta estará segura.
        </p>
        
        <div style=""background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;"">
            <p style=""font-size: 13px; color: #856404; margin: 0;"">
                <strong>?? Nota de seguridad:</strong> Nunca compartas este código con nadie. El equipo de TuCitaOnline nunca te pedirá este código por teléfono o correo.
            </p>
        </div>
        
        <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
        
        <p style=""font-size: 12px; color: #999; text-align: center;"">
            Este es un correo automático, por favor no respondas a este mensaje.<br>
            © 2024 TuCitaOnline - Sistema de gestión de citas médicas
        </p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Genera la plantilla HTML para recuperación de contraseña con enlace
    /// </summary>
    private string GenerarPlantillaRecuperacionPasswordLink(string resetUrl, string nombre)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Recuperación de Contraseña - TuCitaOnline</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 28px;"">?? TuCitaOnline</h1>
    </div>
    
    <div style=""background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;"">
        <h2 style=""color: #667eea; margin-top: 0;"">?? Recuperación de Contraseña</h2>
        
        <p style=""font-size: 16px; color: #555;"">
            Hola <strong>{nombre}</strong>,
        </p>
        
        <p style=""font-size: 16px; color: #555;"">
            Has solicitado recuperar tu contraseña en TuCitaOnline. Haz clic en el botón de abajo para restablecer tu contraseña:
        </p>
        
        <div style=""text-align: center; margin: 30px 0;"">
            <a href=""{resetUrl}"" style=""display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;"">
                Restablecer Contraseña
            </a>
        </div>
        
        <p style=""font-size: 14px; color: #777; margin-top: 30px;"">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
        </p>
        
        <div style=""background-color: #f7f9fc; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 20px 0; word-break: break-all;"">
            <p style=""font-size: 13px; color: #667eea; margin: 0;"">
                {resetUrl}
            </p>
        </div>
        
        <p style=""font-size: 14px; color: #777; margin-top: 30px;"">
            <strong>? Este enlace expirará en 10 minutos.</strong>
        </p>
        
        <p style=""font-size: 14px; color: #777;"">
            Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios y tu cuenta estará segura.
        </p>
        
        <div style=""background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;"">
            <p style=""font-size: 13px; color: #856404; margin: 0;"">
                <strong>?? Nota de seguridad:</strong> Nunca compartas este enlace con nadie. El equipo de TuCitaOnline nunca te pedirá este enlace por teléfono o correo.
            </p>
        </div>
        
        <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
        
        <p style=""font-size: 12px; color: #999; text-align: center;"">
            Este es un correo automático, por favor no respondas a este mensaje.<br>
            © 2024 TuCitaOnline - Sistema de gestión de citas médicas
        </p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Genera la plantilla HTML para confirmación de cita
    /// </summary>
    private string GenerarPlantillaConfirmacionCita(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Confirmación de Cita - TuCitaOnline</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 28px;"">?? TuCitaOnline</h1>
    </div>
    
    <div style=""background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;"">
        <h2 style=""color: #667eea; margin-top: 0;"">? Cita Confirmada</h2>
        
        <p style=""font-size: 16px; color: #555;"">
            Hola <strong>{nombrePaciente}</strong>,
        </p>
        
        <p style=""font-size: 16px; color: #555;"">
            Tu cita médica ha sido confirmada exitosamente.
        </p>
        
        <div style=""background-color: #f7f9fc; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;"">
            <p style=""margin: 10px 0;""><strong>????? Médico:</strong> Dr(a). {nombreMedico}</p>
            <p style=""margin: 10px 0;""><strong>?? Especialidad:</strong> {especialidad}</p>
            <p style=""margin: 10px 0;""><strong>?? Fecha:</strong> {fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</p>
            <p style=""margin: 10px 0;""><strong>?? Hora:</strong> {fechaCita:HH:mm}</p>
        </div>
        
        <p style=""font-size: 14px; color: #777; margin-top: 30px;"">
            <strong>?? Recordatorios importantes:</strong>
        </p>
        <ul style=""font-size: 14px; color: #777;"">
            <li>Llega 10 minutos antes de tu cita</li>
            <li>Trae tu documento de identidad</li>
            <li>Si no puedes asistir, cancela con anticipación</li>
        </ul>
        
        <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
        
        <p style=""font-size: 12px; color: #999; text-align: center;"">
            © 2024 TuCitaOnline - Sistema de gestión de citas médicas
        </p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Genera la plantilla HTML para recordatorio de cita
    /// </summary>
    private string GenerarPlantillaRecordatorioCita(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Recordatorio de Cita - TuCitaOnline</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 28px;"">?? TuCitaOnline</h1>
    </div>
    
    <div style=""background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;"">
        <h2 style=""color: #667eea; margin-top: 0;"">? Recordatorio de Cita</h2>
        
        <p style=""font-size: 16px; color: #555;"">
            Hola <strong>{nombrePaciente}</strong>,
        </p>
        
        <p style=""font-size: 16px; color: #555;"">
            Este es un recordatorio de tu cita médica programada para <strong>mañana</strong>.
        </p>
        
        <div style=""background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;"">
            <p style=""margin: 10px 0;""><strong>????? Médico:</strong> Dr(a). {nombreMedico}</p>
            <p style=""margin: 10px 0;""><strong>?? Especialidad:</strong> {especialidad}</p>
            <p style=""margin: 10px 0;""><strong>?? Fecha:</strong> {fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</p>
            <p style=""margin: 10px 0;""><strong>?? Hora:</strong> {fechaCita:HH:mm}</p>
        </div>
        
        <p style=""font-size: 14px; color: #777; margin-top: 30px;"">
            <strong>?? No olvides:</strong>
        </p>
        <ul style=""font-size: 14px; color: #777;"">
            <li>Llegar 10 minutos antes</li>
            <li>Traer documento de identidad</li>
            <li>Traer estudios médicos previos (si aplica)</li>
        </ul>
        
        <p style=""font-size: 14px; color: #777;"">
            Si necesitas cancelar o reprogramar, hazlo lo antes posible desde tu cuenta.
        </p>
        
        <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
        
        <p style=""font-size: 12px; color: #999; text-align: center;"">
            © 2024 TuCitaOnline - Sistema de gestión de citas médicas
        </p>
    </div>
</body>
</html>";
    }

    // Método para liberar recursos cuando el servicio se destruya
    public void Dispose()
    {
        _smtpClient?.Dispose();
    }
}
