namespace TuCita.DTOs.Doctors;

/// <summary>
/// DTO para la gestión de slots de disponibilidad del doctor
/// Compatible con el frontend doctor-availability-page.tsx
/// </summary>
public class DoctorSlotDto
{
    public long IdSlot { get; set; }
    public string DoctorId { get; set; } = string.Empty;
    public string Fecha { get; set; } = string.Empty; // YYYY-MM-DD
    public string HoraInicio { get; set; } = string.Empty; // HH:mm
    public string HoraFin { get; set; } = string.Empty; // HH:mm
    public SlotTipo Tipo { get; set; }
    public SlotEstado Estado { get; set; }
}

public enum SlotTipo
{
    PRESENCIAL,
    TELECONSULTA
}

public enum SlotEstado
{
    DISPONIBLE,
    BLOQUEADO,
    OCUPADO
}
