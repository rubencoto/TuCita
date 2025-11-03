using System.Net.Http;
using System.Net.Http.Json;
using TuCita.Shared.DTOs.Appointments;
using TuCita.Shared.DTOs.Doctors;
using TuCita.Shared.DTOs.Auth;
using TuCita.Shared.DTOs.MedicalHistory;

namespace TuCita.Desktop.Services;

/// <summary>
/// Cliente HTTP para consumir la API de TuCita desde la aplicación de escritorio
/// </summary>
public class TuCitaApiClient
{
    private readonly HttpClient _httpClient;
    private readonly TokenStorageService _tokenStorage;

    public TuCitaApiClient(HttpClient httpClient, TokenStorageService tokenStorage)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;
    }

    // ==========================================
    // INICIALIZACIÓN Y AUTENTICACIÓN AUTOMÁTICA
    // ==========================================

    /// <summary>
    /// Inicializa el cliente cargando token guardado si existe
    /// </summary>
    public async Task InitializeAsync()
    {
        var savedToken = await _tokenStorage.GetTokenAsync();
        if (!string.IsNullOrEmpty(savedToken))
        {
            SetAuthToken(savedToken);
        }
    }

    /// <summary>
    /// Verifica si hay una sesión activa válida
    /// </summary>
    public async Task<bool> IsAuthenticatedAsync()
    {
        var token = await _tokenStorage.GetTokenAsync();
        return !string.IsNullOrEmpty(token);
    }

    /// <summary>
    /// Iniciar sesión en la aplicación
    /// </summary>
    public async Task<AuthResponseDto?> LoginAsync(string email, string password)
    {
        try
        {
            var request = new LoginRequestDto { Email = email, Password = password };
            var response = await _httpClient.PostAsJsonAsync("/api/auth/login", request);
            
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Error de login: {response.StatusCode}");
                return null;
            }

            var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
            
            if (authResponse != null && !string.IsNullOrEmpty(authResponse.Token))
            {
                // Guardar token con expiración (asumimos 24 horas si no se especifica)
                var expiresAt = DateTime.UtcNow.AddHours(24);
                await _tokenStorage.SaveTokenAsync(authResponse.Token, expiresAt);
                
                SetAuthToken(authResponse.Token);
            }

            return authResponse;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en LoginAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Establecer el token de autenticación en las cabeceras
    /// </summary>
    public void SetAuthToken(string token)
    {
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    /// <summary>
    /// Cerrar sesión (limpiar token)
    /// </summary>
    public async Task LogoutAsync()
    {
        _httpClient.DefaultRequestHeaders.Authorization = null;
        await _tokenStorage.ClearTokenAsync();
    }

    // ==========================================
    // CITAS
    // ==========================================

    /// <summary>
    /// Obtener todas las citas del usuario autenticado
    /// </summary>
    public async Task<List<CitaDto>> GetMyAppointmentsAsync()
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<List<CitaDto>>("/api/appointments")
                ?? new List<CitaDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetMyAppointmentsAsync: {ex.Message}");
            return new List<CitaDto>();
        }
    }

    /// <summary>
    /// Crear una nueva cita médica
    /// </summary>
    public async Task<CitaDto?> CreateAppointmentAsync(CreateAppointmentRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/appointments", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<CitaDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateAppointmentAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Cancelar una cita existente
    /// </summary>
    public async Task<bool> CancelAppointmentAsync(long appointmentId)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"/api/appointments/{appointmentId}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CancelAppointmentAsync: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Reagendar una cita (cambiar a un nuevo turno)
    /// </summary>
    public async Task<CitaDto?> RescheduleAppointmentAsync(long appointmentId, long newTurnoId)
    {
        try
        {
            var request = new RescheduleAppointmentRequest { NewTurnoId = newTurnoId };
            var response = await _httpClient.PostAsJsonAsync(
                $"/api/appointments/{appointmentId}/reschedule", 
                request);
            
            return response.IsSuccessStatusCode 
                ? await response.Content.ReadFromJsonAsync<CitaDto>()
                : null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en RescheduleAppointmentAsync: {ex.Message}");
            return null;
        }
    }

    // ==========================================
    // DOCTORES
    // ==========================================

    /// <summary>
    /// Obtener lista de doctores disponibles
    /// </summary>
    public async Task<List<DoctorDto>> GetDoctorsAsync(string? especialidad = null)
    {
        try
        {
            var url = string.IsNullOrEmpty(especialidad) 
                ? "/api/doctors" 
                : $"/api/doctors?especialidad={especialidad}";
            
            return await _httpClient.GetFromJsonAsync<List<DoctorDto>>(url)
                ?? new List<DoctorDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorsAsync: {ex.Message}");
            return new List<DoctorDto>();
        }
    }

    /// <summary>
    /// Obtener detalles de un doctor específico
    /// </summary>
    public async Task<DoctorDetailDto?> GetDoctorByIdAsync(long id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<DoctorDetailDto>($"/api/doctors/{id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorByIdAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Obtener turnos disponibles de un doctor en un rango de fechas
    /// </summary>
    public async Task<List<AgendaTurnoDto>> GetDoctorAvailableSlotsAsync(
        long doctorId, 
        DateTime startDate, 
        DateTime endDate)
    {
        try
        {
            var url = $"/api/doctors/{doctorId}/available-slots" +
                     $"?startDate={startDate:yyyy-MM-dd}" +
                     $"&endDate={endDate:yyyy-MM-dd}";
            
            return await _httpClient.GetFromJsonAsync<List<AgendaTurnoDto>>(url)
                ?? new List<AgendaTurnoDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorAvailableSlotsAsync: {ex.Message}");
            return new List<AgendaTurnoDto>();
        }
    }

    /// <summary>
    /// Obtener perfil del usuario autenticado y validar que sea doctor
    /// </summary>
    public async Task<DoctorDetailDto?> GetDoctorProfileAsync()
    {
        try
        {
            // Opción 1A: Intentar obtener directamente como doctor por ID del token
            var response = await _httpClient.GetAsync("/api/auth/me");
            if (!response.IsSuccessStatusCode)
                return null;

            var userProfile = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
            if (userProfile == null)
                return null;

            // Intentar obtener datos como doctor usando el ID del usuario
            var doctorProfile = await GetDoctorByIdAsync(userProfile.Id);

            if (doctorProfile == null)
            {
                Console.WriteLine($"Usuario {userProfile.Email} no es un doctor registrado");
                return null;
            }

            return doctorProfile; 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorProfileAsync: {ex.Message}");
            return null;
        }
    }

    // ==========================================
    // HISTORIAL MÉDICO
    // ==========================================

    /// <summary>
    /// Obtener el historial médico completo de un paciente
    /// Solo retorna citas ATENDIDAS
    /// </summary>
    public async Task<List<HistorialMedicoDto>> GetPatientMedicalHistoryAsync(long patientId)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<List<HistorialMedicoDto>>(
                $"/api/historial/paciente/{patientId}")
                ?? new List<HistorialMedicoDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetPatientMedicalHistoryAsync: {ex.Message}");
            return new List<HistorialMedicoDto>();
        }
    }

    /// <summary>
    /// Obtener los detalles completos de una cita específica
    /// </summary>
    public async Task<CitaDetalleDto?> GetAppointmentDetailAsync(long appointmentId)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<CitaDetalleDto>(
                $"/api/historial/cita/{appointmentId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetAppointmentDetailAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Crear una nueva nota clínica (solo médicos)
    /// </summary>
    public async Task<NotaClinicaDto?> CreateNotaClinicaAsync(CreateNotaClinicaRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/historial/nota", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<NotaClinicaDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateNotaClinicaAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Crear un nuevo diagnóstico (solo médicos)
    /// </summary>
    public async Task<DiagnosticoDto?> CreateDiagnosticoAsync(CreateDiagnosticoRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/historial/diagnostico", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<DiagnosticoDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateDiagnosticoAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Crear una nueva receta con medicamentos (solo médicos)
    /// </summary>
    public async Task<RecetaDto?> CreateRecetaAsync(CreateRecetaRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/historial/receta", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<RecetaDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateRecetaAsync: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Obtener todas las citas de un médico
    /// </summary>
    public async Task<List<CitaDto>> GetDoctorAppointmentsAsync(long doctorId)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<List<CitaDto>>(
                $"/api/appointments/doctor/{doctorId}")
                ?? new List<CitaDto>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorAppointmentsAsync: {ex.Message}");
            return new List<CitaDto>();
        }
    }
}
