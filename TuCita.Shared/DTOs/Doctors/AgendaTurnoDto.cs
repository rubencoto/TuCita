namespace TuCita.Shared.DTOs.Doctors;

public class AgendaTurnoDto
{
    public long Id { get; set; }
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string InicioFormatted => Inicio.ToString("HH:mm");
    public string FinFormatted => Fin.ToString("HH:mm");
    public string TimeSlot => $"{InicioFormatted} - {FinFormatted}";
}
