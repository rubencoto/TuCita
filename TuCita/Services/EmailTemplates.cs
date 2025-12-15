using System.Text;

namespace TuCita.Services;

/// <summary>
/// Plantillas HTML profesionales para correos electrónicos (TuCitaOnline)
/// Enfocado en compatibilidad real con Gmail/Outlook (layout con tablas + estilos inline)
/// </summary>
public static class EmailTemplates
{
    // Colores de TuCitaOnline
    private const string PrimaryBlue = "#2E8BC0";
    private const string TealGreen = "#14B8A6";
    private const string DarkBlue = "#1a5a7f";
    private const string LightBg = "#f0f4f8";
    private const string TextDark = "#0f172a";
    private const string TextMuted = "#64748b";

    // URL base de la aplicación
    private const string BaseUrl = "https://tucitaonline.org";

    // ============================================================
    // BASE TEMPLATE (PRO + COMPATIBLE)
    // ============================================================
    private static string GetBaseTemplate(string title, string content, string footerNote = "")
    {
        var preheader = "Notificación de TuCitaOnline: revisa los detalles de tu cita.";

        return $@"
<!doctype html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8"">
  <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{title}</title>
</head>
<body style=""margin:0; padding:0; background-color:{LightBg};"">

  <!-- Preheader (hidden): aparece como preview en bandeja de entrada -->
  <div style=""display:none; font-size:1px; color:{LightBg}; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;"">
    {preheader}
  </div>

  <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color:{LightBg}; padding:24px 0;"">
    <tr>
      <td align=""center"" style=""padding:0 12px;"">

        <!-- Container -->
        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""width:600px; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;"">

          <!-- Brand Bar -->
          <tr>
            <td style=""padding:16px 22px; background-color:#ffffff; border-bottom:1px solid #eef2f7;"">
              <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:16px; font-weight:800; color:{PrimaryBlue}; letter-spacing:-0.2px;"">
                    TuCitaOnline
                  </td>
                  <td align=""right"" style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:#94a3b8;"">
                    {DateTime.UtcNow:dd/MM/yyyy}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style=""background-color:{DarkBlue}; padding:30px 26px; text-align:left;"">
              <div style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:22px; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.3px;"">
                {title}
              </div>
              <div style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:13px; color:rgba(255,255,255,0.85); margin-top:8px;"">
                Sistema de Gestión de Citas Médicas
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style=""padding:26px; font-family:Segoe UI, Roboto, Arial, sans-serif; color:{TextDark};"">
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background-color:#f8fafc; padding:22px 26px; border-top:1px solid #eef2f7;"">
              <div style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:{TextMuted}; line-height:18px;"">
                <strong>TuCitaOnline</strong> · Simplificando el acceso a la salud
              </div>

              {(string.IsNullOrEmpty(footerNote) ? "" : $@"<div style=""margin-top:10px; font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:#94a3b8; line-height:18px;"">{footerNote}</div>")}

              <div style=""margin-top:12px; font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:11px; color:#94a3b8; line-height:17px;"">
                Este es un correo automático. No respondas a este mensaje.<br>
                Para soporte, ingresá a tu cuenta en
                <a href=""{BaseUrl}"" style=""color:{PrimaryBlue}; text-decoration:none;"">{BaseUrl}</a>.
              </div>
            </td>
          </tr>

        </table>

        <div style=""height:18px;"">&nbsp;</div>

      </td>
    </tr>
  </table>

</body>
</html>";
    }

    // ============================================================
    // COMPONENTES REUTILIZABLES
    // ============================================================
    private static string Button(string text, string url, string bgColor = PrimaryBlue)
    {
        return $@"
<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:18px 0;"">
  <tr>
    <td style=""background-color:{bgColor}; border-radius:12px;"">
      <a href=""{url}"" style=""display:inline-block; padding:14px 18px; font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:15px; font-weight:800; color:#ffffff; text-decoration:none;"">
        {text} ?
      </a>
    </td>
  </tr>
</table>";
    }

    private static string Card(string innerHtml, string accentColor = "")
    {
        var border = string.IsNullOrEmpty(accentColor) ? "#e5e7eb" : accentColor;

        return $@"
<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""border:1px solid #e5e7eb; border-left:5px solid {border}; border-radius:14px; background-color:#ffffff; margin:16px 0;"">
  <tr>
    <td style=""padding:18px;"">
      {innerHtml}
    </td>
  </tr>
</table>";
    }

    private static string InfoRow(string label, string value)
    {
        return $@"
<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin:8px 0;"">
  <tr>
    <td style=""width:160px; font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:13px; color:{TextMuted}; padding:4px 0;"">
      <strong style=""color:{PrimaryBlue};"">{label}</strong>
    </td>
    <td style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:13px; color:{TextDark}; padding:4px 0;"">
      {value}
    </td>
  </tr>
</table>";
    }

    private static string Callout(string title, string body, string bg, string borderColor, string fg)
    {
        return $@"
<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background:{bg}; border:1px solid #e5e7eb; border-left:5px solid {borderColor}; border-radius:14px; margin:16px 0;"">
  <tr>
    <td style=""padding:16px;"">
      <div style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:13px; font-weight:900; color:{fg}; margin-bottom:6px;"">{title}</div>
      <div style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:13px; color:{fg}; line-height:20px;"">{body}</div>
    </td>
  </tr>
</table>";
    }

    private static string SmallMuted(string html)
    {
        return $@"<div style=""font-family:Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:{TextMuted}; line-height:18px; margin-top:10px;"">{html}</div>";
    }

    // ============================================================
    // TEMPLATES
    // ============================================================

    /// <summary>
    /// Notificación de cita creada
    /// </summary>
    public static string CitaCreada(string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad)
    {
        var details =
            InfoRow("Médico", $"Dr. {nombreMedico}") +
            InfoRow("Especialidad", especialidad) +
            InfoRow("Fecha", $"{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}") +
            InfoRow("Hora", $"{fechaCita:HH:mm}") +
            InfoRow("Motivo", motivo);

        var content = $@"
<div style=""font-size:16px; font-weight:900; margin-bottom:8px;"">Hola {nombrePaciente},</div>
<div style=""font-size:13px; color:{TextMuted}; line-height:20px;"">
  Tu cita fue creada exitosamente. A continuación, los detalles:
</div>

{Card(details, PrimaryBlue)}

{Callout(
    "Recordatorios",
    "Te enviaremos recordatorios 24 horas y 4 horas antes. Llega 10 minutos antes y trae tu identificación.",
    "#eff6ff",
    PrimaryBlue,
    "#0f172a"
)}

{Button("Ver mis citas", $"{BaseUrl}/appointments")}

{Callout(
    "¿Necesitás reprogramar o cancelar?",
    "Podés hacerlo desde tu panel de citas. Si no podés asistir, cancelá con anticipación para liberar el horario.",
    "#fff7ed",
    "#f59e0b",
    "#7c2d12"
)}";

        return GetBaseTemplate("Nueva cita médica", content);
    }

    /// <summary>
    /// Notificación de cita cancelada
    /// </summary>
    public static string CitaCancelada(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var details =
            InfoRow("Médico", $"Dr. {nombreMedico}") +
            InfoRow("Especialidad", especialidad) +
            InfoRow("Fecha cancelada", $"{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}") +
            InfoRow("Hora", $"{fechaCita:HH:mm}");

        var content = $@"
<div style=""font-size:16px; font-weight:900; margin-bottom:8px;"">Hola {nombrePaciente},</div>
<div style=""font-size:13px; color:{TextMuted}; line-height:20px;"">
  Tu cita médica fue cancelada. Estos eran los detalles:
</div>

{Card(details, "#ef4444")}

{Button("Agendar nueva cita", $"{BaseUrl}/search")}

{SmallMuted("Podés agendar una nueva cita cuando lo desees.")}";

        return GetBaseTemplate("Cita cancelada", content);
    }

    /// <summary>
    /// Notificación de cita reprogramada
    /// </summary>
    public static string CitaReprogramada(string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad)
    {
        var doctor =
            InfoRow("Médico", $"Dr. {nombreMedico}") +
            InfoRow("Especialidad", especialidad);

        var anterior =
            InfoRow("Fecha anterior", $"{fechaAnterior:dddd, dd 'de' MMMM 'de' yyyy}") +
            InfoRow("Hora anterior", $"{fechaAnterior:HH:mm}");

        var nueva =
            InfoRow("Nueva fecha", $"{fechaNueva:dddd, dd 'de' MMMM 'de' yyyy}") +
            InfoRow("Nueva hora", $"{fechaNueva:HH:mm}");

        var content = $@"
<div style=""font-size:16px; font-weight:900; margin-bottom:8px;"">Hola {nombrePaciente},</div>
<div style=""font-size:13px; color:{TextMuted}; line-height:20px;"">
  Tu cita fue reprogramada exitosamente. Revisá la información actualizada:
</div>

{Card(doctor, PrimaryBlue)}

{Card(anterior, "#ef4444")}

{Card(nueva, TealGreen)}

{Callout(
    "Importante",
    "Te enviaremos nuevos recordatorios antes de la cita. Asegurate de marcar la nueva fecha en tu calendario.",
    "#f0fdf4",
    TealGreen,
    "#14532d"
)}

{Button("Ver mis citas", $"{BaseUrl}/appointments")}";

        return GetBaseTemplate("Cita reprogramada", content);
    }

    /// <summary>
    /// Recordatorio 24 horas antes
    /// </summary>
    public static string Recordatorio24Horas(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var details =
            InfoRow("Médico", $"Dr. {nombreMedico}") +
            InfoRow("Especialidad", especialidad) +
            InfoRow("Fecha", $"{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}") +
            InfoRow("Hora", $"{fechaCita:HH:mm}") +
            InfoRow("Ubicación", direccion);

        var content = $@"
<div style=""font-size:16px; font-weight:900; margin-bottom:8px;"">Hola {nombrePaciente},</div>
<div style=""font-size:13px; color:{TextMuted}; line-height:20px;"">
  Te recordamos que tu cita es <strong>mañana</strong>. Estos son los detalles:
</div>

{Card(details, PrimaryBlue)}

{Callout(
    "Recomendaciones",
    "Llegá 10 minutos antes, llevá tu identificación oficial y cualquier estudio médico previo. Anotá dudas o síntomas para comentarlos.",
    "#eff6ff",
    PrimaryBlue,
    "#0f172a"
)}

{Button("Ver detalles de la cita", $"{BaseUrl}/appointments")}

{Callout(
    "Si no podés asistir",
    "Cancelá tu cita con anticipación para que otro paciente pueda aprovechar el horario.",
    "#fff7ed",
    "#f59e0b",
    "#7c2d12"
)}";

        return GetBaseTemplate("Recordatorio de cita (24 horas)", content);
    }

    /// <summary>
    /// Recordatorio urgente 4 horas antes
    /// </summary>
    public static string Recordatorio4Horas(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var details =
            InfoRow("Médico", $"Dr. {nombreMedico}") +
            InfoRow("Especialidad", especialidad) +
            InfoRow("Fecha", $"{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}") +
            InfoRow("Hora", $"<span style=\"font-size:16px; font-weight:900; color:#dc2626;\">{fechaCita:HH:mm}</span>") +
            InfoRow("Ubicación", direccion);

        var content = $@"
<div style=""font-size:16px; font-weight:900; margin-bottom:8px;"">Hola {nombrePaciente},</div>
<div style=""font-size:13px; color:{TextMuted}; line-height:20px;"">
  Tu cita es en <strong style=""color:#dc2626;"">4 horas</strong>. Prepará lo necesario:
</div>

{Card(details, "#ef4444")}

{Callout(
    "No olvidés llevar",
    "Tu identificación, estudios médicos previos (si tenés), lista de medicamentos actuales y forma de pago (si aplica).",
    "#fef2f2",
    "#ef4444",
    "#7f1d1d"
)}

{Button("Ver detalles de la cita", $"{BaseUrl}/appointments", "#dc2626")}

{Callout(
    "Si no podés asistir",
    "Cancelá tu cita ahora para liberar el horario.",
    "#fef2f2",
    "#ef4444",
    "#7f1d1d"
)}";

        return GetBaseTemplate("Recordatorio urgente (4 horas)", content);
    }

    /// <summary>
    /// Recuperación de contraseña
    /// </summary>
    public static string RecuperacionPassword(string nombre, string resetUrl)
    {
        var content = $@"
<div style=""font-size:16px; font-weight:900; margin-bottom:8px;"">Hola {nombre},</div>
<div style=""font-size:13px; color:{TextMuted}; line-height:20px;"">
  Recibimos una solicitud para restablecer la contraseña de tu cuenta en TuCitaOnline.
</div>

{Callout(
    "Si no fuiste vos",
    "Podés ignorar este correo. Tu contraseña actual seguirá siendo válida.",
    "#fff7ed",
    "#f59e0b",
    "#7c2d12"
)}

{Button("Restablecer contraseña", resetUrl)}

{Callout(
    "Consejos de seguridad",
    "Este enlace es válido por 1 hora. Usá una contraseña fuerte y única. No compartás tu contraseña con nadie.",
    "#eff6ff",
    PrimaryBlue,
    "#0f172a"
)}

{SmallMuted($@"<strong>Si el botón no funciona:</strong> copiá y pegá este enlace en tu navegador:<br>
<span style=""word-break:break-all; color:{PrimaryBlue};"">{resetUrl}</span>")}";

        return GetBaseTemplate("Recuperación de contraseña", content);
    }
}
