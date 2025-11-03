using TuCita.Shared.DTOs.Auth;
using TuCita.Shared.DTOs.Doctors;

namespace TuCita.Desktop.Services;

public class AuthService
{
    private readonly TuCitaApiClient _apiClient;

    public AuthService(TuCitaApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    /// <summary>
    /// Login específico para doctores
    /// </summary>
    public async Task<DoctorDto?> LoginAsDoctorAsync(string email, string password)
    {
        var authResponse = await _apiClient.LoginAsync(email, password);

        if (authResponse == null)
            return null;

        var doctorProfile = await _apiClient.GetDoctorProfileAsync();

        if (doctorProfile == null)
        {
            await _apiClient.LogoutAsync();
            throw new UnauthorizedAccessException("Solo médicos pueden acceder a esta aplicación");
        }

        // Map DoctorDetailDto to DoctorDto
        var doctorDto = new DoctorDto
        {
            Id = doctorProfile.Id,
            Nombre = doctorProfile.Nombre,
            Especialidades = doctorProfile.Especialidades,
            NumeroLicencia = doctorProfile.NumeroLicencia,
            Biografia = doctorProfile.Biografia,
            Direccion = doctorProfile.Direccion,
            Telefono = doctorProfile.Telefono,
            ImageUrl = doctorProfile.ImageUrl,
            ExperienceYears = doctorProfile.ExperienceYears,
            Rating = 0, // Default value, adjust as needed
            ReviewCount = 0, // Default value, adjust as needed
            Hospital = string.Empty, // Default value, adjust as needed
            Location = string.Empty, // Default value, adjust as needed
            AvailableSlots = 0, // Default value, adjust as needed
            NextAvailable = string.Empty // Default value, adjust as needed
        };

        return doctorDto;
    }

    /// <summary>
    /// Verificar sesión activa
    /// </summary>
    public async Task<DoctorDto?> GetCurrentDoctorAsync()
    {
        if (!await _apiClient.IsAuthenticatedAsync())
            return null;

        var doctorProfile = await _apiClient.GetDoctorProfileAsync();

        if (doctorProfile == null)
            return null;

        // Map DoctorDetailDto to DoctorDto
        return new DoctorDto
        {
            Id = doctorProfile.Id,
            Nombre = doctorProfile.Nombre,
            Especialidades = doctorProfile.Especialidades,
            NumeroLicencia = doctorProfile.NumeroLicencia,
            Biografia = doctorProfile.Biografia,
            Direccion = doctorProfile.Direccion,
            Telefono = doctorProfile.Telefono,
            ImageUrl = doctorProfile.ImageUrl,
            ExperienceYears = doctorProfile.ExperienceYears,
            Rating = 0, // Default value, adjust as needed
            ReviewCount = 0, // Default value, adjust as needed
            Hospital = string.Empty, // Default value, adjust as needed
            Location = string.Empty, // Default value, adjust as needed
            AvailableSlots = 0, // Default value, adjust as needed
            NextAvailable = string.Empty // Default value, adjust as needed
        };
    }

    /// <summary>
    /// Cerrar sesión
    /// </summary>
    public async Task LogoutAsync()
    {
        await _apiClient.LogoutAsync();
    }
}
