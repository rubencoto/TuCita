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
    
    // Nuevos métodos para notificaciones de citas
    Task<bool> EnviarCitaCreadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad);
    Task<bool> EnviarCitaCanceladaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
    Task<bool> EnviarCitaReprogramadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad);
    Task<bool> EnviarRecordatorio24HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion);
    Task<bool> EnviarRecordatorio4HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly SmtpClient _smtpClient;
    private readonly string _remitenteDefault;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;

        var smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") ?? "smtp.gmail.com";
        var smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? "";
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "";
        _remitenteDefault = Environment.GetEnvironmentVariable("DEFAULT_SENDER") ?? "no-reply@tucitaonline.org";

        _smtpClient = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 30000
        };

        _logger.LogInformation("EmailService inicializado con servidor SMTP: {SmtpServer}:{SmtpPort}", smtpServer, smtpPort);
    }

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

            _logger.LogInformation("Correo enviado exitosamente a: {Destinatario}", destinatario);
            return true;
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "Error SMTP al enviar correo a {Destinatario}: {Message}", destinatario, ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error general al enviar correo a {Destinatario}: {Message}", destinatario, ex.Message);
            return false;
        }
    }

    public async Task<bool> EnviarCodigoSeguridadAsync(string emailDestino, string codigoSeguridad)
    {
        var asunto = "Código de seguridad - TuCitaOnline";
        var cuerpoHtml = $"<h2>Tu código de seguridad es: {codigoSeguridad}</h2><p>Este código expira en 10 minutos.</p>";
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> SendPasswordResetLinkAsync(string email, string token, string nombre)
    {
        var asunto = "Recuperación de Contraseña - TuCitaOnline";
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
        var resetUrl = $"{frontendUrl}/reset-password?token={token}";
        var cuerpoHtml = $"<h2>Hola {nombre}</h2><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href='{resetUrl}'>Restablecer contraseña</a>";
        return await EnviarEmailAsync(email, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarConfirmacionCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Confirmación de cita médica - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Cita Confirmada</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Tu cita médica ha sido confirmada:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
            </ul>";
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorioCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Recordatorio: Tu cita médica es mañana - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Recordatorio de Cita</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Te recordamos tu cita médica para mañana:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
            </ul>";
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaCreadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad)
    {
        var asunto = "Nueva Cita Médica Creada - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Cita Médica Creada</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Tu cita médica ha sido creada exitosamente:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
                <li><strong>Motivo:</strong> {motivo}</li>
            </ul>
            <p>Te enviaremos recordatorios antes de tu cita.</p>";
        
        _logger.LogInformation("Enviando notificación de cita creada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaCanceladaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Cita Médica Cancelada - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Cita Cancelada</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Tu cita médica ha sido cancelada:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha cancelada:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora cancelada:</strong> {fechaCita:HH:mm}</li>
            </ul>
            <p>Puedes agendar una nueva cita cuando lo desees.</p>";
        
        _logger.LogInformation("Enviando notificación de cita cancelada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaReprogramadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad)
    {
        var asunto = "Cita Médica Reprogramada - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Cita Reprogramada</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Tu cita médica ha sido reprogramada:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha anterior:</strong> <s>{fechaAnterior:dd/MM/yyyy HH:mm}</s></li>
                <li><strong>Nueva fecha:</strong> {fechaNueva:dd/MM/yyyy}</li>
                <li><strong>Nueva hora:</strong> {fechaNueva:HH:mm}</li>
            </ul>
            <p>Te enviaremos recordatorios antes de tu nueva cita.</p>";
        
        _logger.LogInformation("Enviando notificación de cita reprogramada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorio24HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var asunto = "Recordatorio: Cita Médica Mañana - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Recordatorio de Cita (24 horas)</h2>
            <p>Hola {nombrePaciente},</p>
            <p><strong>Tu cita médica es MAÑANA</strong></p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
                <li><strong>Ubicación:</strong> {direccion}</li>
            </ul>
            <p><strong>Recomendaciones:</strong></p>
            <ul>
                <li>Llega 10 minutos antes</li>
                <li>Trae tu identificación</li>
                <li>Si tienes estudios previos, llévalos contigo</li>
            </ul>";
        
        _logger.LogInformation("Enviando recordatorio 24h a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorio4HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var asunto = "URGENTE: Cita Médica en 4 Horas - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Recordatorio URGENTE (4 horas)</h2>
            <p>Hola {nombrePaciente},</p>
            <p><strong style='color: red;'>Tu cita médica es en 4 HORAS</strong></p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
                <li><strong>Ubicación:</strong> {direccion}</li>
            </ul>
            <p><strong>No olvides llevar:</strong></p>
            <ul>
                <li>Tu identificación</li>
                <li>Estudios médicos previos</li>
                <li>Lista de medicamentos actuales</li>
            </ul>
            <p style='color: red;'><strong>Si no puedes asistir, cancela tu cita cuanto antes.</strong></p>";
        
        _logger.LogInformation("Enviando recordatorio 4h a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public void Dispose()
    {
        _smtpClient?.Dispose();
    }
}
