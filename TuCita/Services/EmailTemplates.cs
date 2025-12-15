using System.Text;

namespace TuCita.Services;

/// <summary>
/// Plantillas HTML profesionales para correos electrónicos
/// Diseño moderno con colores de TuCitaOnline y soporte UTF-8
/// </summary>
public static class EmailTemplates
{
    // Colores de TuCitaOnline
    private const string PrimaryBlue = "#2E8BC0";
    private const string TealGreen = "#14B8A6";
    private const string DarkBlue = "#1a5a7f";
    private const string LightBg = "#f0f4f8";
    private const string CardBg = "#f8f9fa";
    private const string TextDark = "#1f2937";
    private const string TextLight = "#6b7280";

    /// <summary>
    /// Template base con estructura común para todos los correos
    /// </summary>
    private static string GetBaseTemplate(string title, string content, string footerNote = "")
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"">
    <title>{title}</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: {LightBg};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }}
        .email-wrapper {{
            width: 100%;
            background-color: {LightBg};
            padding: 40px 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, {PrimaryBlue} 0%, {DarkBlue} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header-icon {{
            font-size: 48px;
            margin-bottom: 10px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }}
        .content {{
            padding: 40px 30px;
            color: {TextDark};
        }}
        .greeting {{
            font-size: 18px;
            margin-bottom: 20px;
            color: {TextDark};
        }}
        .info-card {{
            background-color: {CardBg};
            border-left: 4px solid {PrimaryBlue};
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
        }}
        .info-row {{
            margin: 14px 0;
            display: flex;
            align-items: flex-start;
        }}
        .info-icon {{
            font-size: 20px;
            margin-right: 12px;
            flex-shrink: 0;
        }}
        .info-label {{
            font-weight: 600;
            color: {PrimaryBlue};
            margin-right: 8px;
            min-width: 100px;
        }}
        .info-value {{
            color: {TextDark};
            flex: 1;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, {PrimaryBlue} 0%, {TealGreen} 100%);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            text-align: center;
            transition: transform 0.2s;
            box-shadow: 0 4px 6px rgba(46, 139, 192, 0.3);
        }}
        .button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(46, 139, 192, 0.4);
        }}
        .note {{
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
            color: #92400e;
            font-size: 14px;
        }}
        .tips {{
            background-color: #dbeafe;
            border-left: 4px solid {PrimaryBlue};
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
        }}
        .tips-title {{
            font-weight: 600;
            color: {PrimaryBlue};
            margin-bottom: 12px;
            font-size: 16px;
        }}
        .tips ul {{
            margin: 8px 0;
            padding-left: 20px;
            color: {TextDark};
        }}
        .tips li {{
            margin: 6px 0;
            font-size: 14px;
        }}
        .footer {{
            background-color: {CardBg};
            padding: 30px;
            text-align: center;
            color: {TextLight};
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }}
        .footer-logo {{
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, {PrimaryBlue} 0%, {TealGreen} 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
        }}
        .footer p {{
            margin: 8px 0;
        }}
        .footer-note {{
            font-size: 12px;
            color: #9ca3af;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
        }}
        @media only screen and (max-width: 600px) {{
            .email-wrapper {{
                padding: 20px 10px;
            }}
            .header {{
                padding: 30px 20px;
            }}
            .header h1 {{
                font-size: 24px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .info-card {{
                padding: 20px;
            }}
            .button {{
                padding: 14px 32px;
                font-size: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class=""email-wrapper"">
        <div class=""email-container"">
            {content}
            <div class=""footer"">
                <div class=""footer-logo"">TuCitaOnline</div>
                <p><strong>Sistema de Gestión de Citas Médicas</strong></p>
                <p>Simplificando el acceso a la salud</p>
                {(string.IsNullOrEmpty(footerNote) ? "" : $@"<div class=""footer-note"">{footerNote}</div>")}
                <div class=""footer-note"">
                    Este es un correo automático. Por favor, no respondas a este mensaje.<br>
                    Si tienes alguna consulta, accede a tu cuenta en TuCitaOnline.
                </div>
            </div>
        </div>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Template para notificación de cita creada
    /// </summary>
    public static string CitaCreada(string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">??</div>
                <h1>Nueva Cita Médica Creada</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p>Tu cita médica ha sido creada exitosamente. A continuación, los detalles de tu consulta:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-icon"">?????</span>
                        <span class=""info-label"">Médico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Fecha:</span>
                        <span class=""info-value"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Hora:</span>
                        <span class=""info-value"">{fechaCita:HH:mm}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Motivo:</span>
                        <span class=""info-value"">{motivo}</span>
                    </div>
                </div>

                <div class=""tips"">
                    <div class=""tips-title"">?? Recordatorios importantes</div>
                    <ul>
                        <li>Te enviaremos recordatorios 24 horas y 4 horas antes de tu cita</li>
                        <li>Llega 10 minutos antes de tu cita</li>
                        <li>Trae tu identificación y estudios médicos previos</li>
                    </ul>
                </div>

                <center>
                    <a href=""https://tucitaonline.com/appointments"" class=""button"">
                        Ver Mis Citas ?
                    </a>
                </center>

                <div class=""note"">
                    ?? Si necesitas cancelar o reprogramar tu cita, puedes hacerlo desde tu panel de citas.
                </div>
            </div>
        ";

        return GetBaseTemplate("Nueva Cita Médica - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para notificación de cita cancelada
    /// </summary>
    public static string CitaCancelada(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">?</div>
                <h1>Cita Médica Cancelada</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p>Tu cita médica ha sido cancelada. A continuación, los detalles de la cita cancelada:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-icon"">?????</span>
                        <span class=""info-label"">Médico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Fecha cancelada:</span>
                        <span class=""info-value"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Hora cancelada:</span>
                        <span class=""info-value"">{fechaCita:HH:mm}</span>
                    </div>
                </div>

                <center>
                    <a href=""https://tucitaonline.com/search"" class=""button"">
                        Agendar Nueva Cita ?
                    </a>
                </center>

                <p style=""color: {TextLight}; font-size: 14px; margin-top: 30px; text-align: center;"">
                    Puedes agendar una nueva cita cuando lo desees.
                </p>
            </div>
        ";

        return GetBaseTemplate("Cita Cancelada - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para notificación de cita reprogramada
    /// </summary>
    public static string CitaReprogramada(string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">??</div>
                <h1>Cita Médica Reprogramada</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p>Tu cita médica ha sido reprogramada exitosamente. A continuación, los detalles actualizados:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-icon"">?????</span>
                        <span class=""info-label"">Médico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                </div>

                <div class=""info-card"" style=""border-left-color: #ef4444; background-color: #fef2f2;"">
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Fecha anterior:</span>
                        <span class=""info-value"" style=""text-decoration: line-through; color: {TextLight};"">{fechaAnterior:dddd, dd 'de' MMMM 'de' yyyy} - {fechaAnterior:HH:mm}</span>
                    </div>
                </div>

                <div class=""info-card"" style=""border-left-color: {TealGreen}; background-color: #f0fdf4;"">
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Nueva fecha:</span>
                        <span class=""info-value"" style=""color: #166534; font-weight: 600;"">{fechaNueva:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Nueva hora:</span>
                        <span class=""info-value"" style=""color: #166534; font-weight: 600;"">{fechaNueva:HH:mm}</span>
                    </div>
                </div>

                <div class=""tips"">
                    <div class=""tips-title"">?? Información importante</div>
                    <ul>
                        <li>Te enviaremos nuevos recordatorios antes de tu cita</li>
                        <li>Asegúrate de marcar la nueva fecha en tu calendario</li>
                    </ul>
                </div>

                <center>
                    <a href=""https://tucitaonline.com/appointments"" class=""button"">
                        Ver Mis Citas ?
                    </a>
                </center>
            </div>
        ";

        return GetBaseTemplate("Cita Reprogramada - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para recordatorio 24 horas antes
    /// </summary>
    public static string Recordatorio24Horas(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">?</div>
                <h1>Recordatorio: Cita Mañana</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p><strong>Tu cita médica es MAÑANA</strong>. Te recordamos los detalles:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-icon"">?????</span>
                        <span class=""info-label"">Médico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Fecha:</span>
                        <span class=""info-value"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Hora:</span>
                        <span class=""info-value"">{fechaCita:HH:mm}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Ubicación:</span>
                        <span class=""info-value"">{direccion}</span>
                    </div>
                </div>

                <div class=""tips"">
                    <div class=""tips-title"">?? Recomendaciones</div>
                    <ul>
                        <li>Llega 10 minutos antes de tu cita</li>
                        <li>Trae tu identificación oficial</li>
                        <li>Si tienes estudios médicos previos, llévalos contigo</li>
                        <li>Anota cualquier duda o síntoma que quieras comentar</li>
                    </ul>
                </div>

                <center>
                    <a href=""https://tucitaonline.com/appointments"" class=""button"">
                        Ver Detalles de la Cita ?
                    </a>
                </center>

                <div class=""note"">
                    ?? Si no puedes asistir, cancela tu cita con anticipación para que otros pacientes puedan aprovechar el horario.
                </div>
            </div>
        ";

        return GetBaseTemplate("Recordatorio de Cita - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para recordatorio urgente 4 horas antes
    /// </summary>
    public static string Recordatorio4Horas(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var content = $@"
            <div class=""header"" style=""background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"">
                <div class=""header-icon"">??</div>
                <h1>URGENTE: Cita en 4 Horas</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p><strong style=""color: #dc2626; font-size: 18px;"">Tu cita médica es en 4 HORAS</strong></p>
                <p>Por favor, prepárate para asistir a tu consulta:</p>
                
                <div class=""info-card"" style=""border-left-color: #ef4444; background-color: #fef2f2;"">
                    <div class=""info-row"">
                        <span class=""info-icon"">?????</span>
                        <span class=""info-label"">Médico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Fecha:</span>
                        <span class=""info-value"" style=""font-weight: 600;"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Hora:</span>
                        <span class=""info-value"" style=""font-weight: 600; font-size: 20px; color: #dc2626;"">{fechaCita:HH:mm}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-icon"">??</span>
                        <span class=""info-label"">Ubicación:</span>
                        <span class=""info-value"">{direccion}</span>
                    </div>
                </div>

                <div class=""tips"" style=""background-color: #fef2f2; border-left-color: #ef4444;"">
                    <div class=""tips-title"" style=""color: #dc2626;"">?? No olvides llevar:</div>
                    <ul style=""color: #991b1b;"">
                        <li><strong>Tu identificación oficial</strong></li>
                        <li><strong>Estudios médicos previos</strong> (si tienes)</li>
                        <li><strong>Lista de medicamentos actuales</strong></li>
                        <li><strong>Forma de pago</strong> (si aplica)</li>
                    </ul>
                </div>

                <center>
                    <a href=""https://tucitaonline.com/appointments"" class=""button"" style=""background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"">
                        Ver Detalles de la Cita ?
                    </a>
                </center>

                <div class=""note"" style=""background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;"">
                    ?? <strong>Si no puedes asistir, cancela tu cita AHORA</strong> para que otros pacientes puedan aprovechar el horario.
                </div>
            </div>
        ";

        return GetBaseTemplate("Recordatorio Urgente - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para recuperación de contraseña
    /// </summary>
    public static string RecuperacionPassword(string nombre, string resetUrl)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">??</div>
                <h1>Recuperación de Contraseña</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombre}</strong>,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en TuCitaOnline.</p>
                
                <div class=""note"">
                    ?? Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.
                </div>

                <center>
                    <a href=""{resetUrl}"" class=""button"">
                        Restablecer Contraseña ?
                    </a>
                </center>

                <div class=""tips"">
                    <div class=""tips-title"">?? Consejos de seguridad</div>
                    <ul>
                        <li>Este enlace es válido por 1 hora</li>
                        <li>Usa una contraseña fuerte y única</li>
                        <li>No compartas tu contraseña con nadie</li>
                        <li>Si no solicitaste este cambio, ignora este correo</li>
                    </ul>
                </div>

                <p style=""color: {TextLight}; font-size: 13px; margin-top: 30px;"">
                    <strong>Nota:</strong> Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <span style=""word-break: break-all; color: {PrimaryBlue};"">{resetUrl}</span>
                </p>
            </div>
        ";

        return GetBaseTemplate("Recuperación de Contraseña - TuCitaOnline", content);
    }
}
