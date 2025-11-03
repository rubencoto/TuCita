using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Threading.Tasks;
using ReactiveUI;
using TuCita.Desktop.Services;
using TuCita.Desktop.Views;
using TuCita.Shared.DTOs.Appointments;
using TuCita.Shared.DTOs.MedicalHistory;

namespace TuCita.Desktop.ViewModels;

public class DoctorDashboardViewModel : ViewModelBase
{
    private readonly TuCitaApiClient _apiClient;
    private long _doctorId;
    private string _doctorName = string.Empty;

    // Observable properties
    private ObservableCollection<CitaDto> _appointments = new();
    private ObservableCollection<CitaDto> _todayAppointments = new();
    private ObservableCollection<CitaDto> _pendingAppointments = new();
    private CitaDto? _selectedAppointment;
    private CitaDetalleDto? _appointmentDetail;
    private bool _isLoading;
    private string _statusMessage = string.Empty;
    private int _todayCount;
    private int _pendingCount;
    private int _completedCount;

    public DoctorDashboardViewModel(TuCitaApiClient apiClient, long doctorId, string doctorName)
    {
        _apiClient = apiClient;
        _doctorId = doctorId;
        _doctorName = doctorName;

        // Initialize commands
        var canExecute = this.WhenAnyValue(x => x.IsLoading)
            .ObserveOn(RxApp.MainThreadScheduler);
        LoadAppointmentsCommand = ReactiveCommand.CreateFromTask(LoadAppointmentsAsync, canExecute);
        SelectAppointmentCommand = ReactiveCommand.CreateFromTask<CitaDto>(SelectAppointmentAsync, canExecute);
        RefreshCommand = ReactiveCommand.CreateFromTask(LoadAppointmentsAsync, canExecute);
        OpenDetailWindowCommand = ReactiveCommand.Create(OpenDetailWindow, canExecute);

        // Load data on initialization
        LoadAppointmentsCommand.Execute().Subscribe();
    }

    // Properties
    public ObservableCollection<CitaDto> Appointments
    {
        get => _appointments;
        set => this.RaiseAndSetIfChanged(ref _appointments, value);
    }

    public ObservableCollection<CitaDto> TodayAppointments
    {
        get => _todayAppointments;
        set => this.RaiseAndSetIfChanged(ref _todayAppointments, value);
    }

    public ObservableCollection<CitaDto> PendingAppointments
    {
        get => _pendingAppointments;
        set => this.RaiseAndSetIfChanged(ref _pendingAppointments, value);
    }

    public CitaDto? SelectedAppointment
    {
        get => _selectedAppointment;
        set => this.RaiseAndSetIfChanged(ref _selectedAppointment, value);
    }

    public CitaDetalleDto? AppointmentDetail
    {
        get => _appointmentDetail;
        set => this.RaiseAndSetIfChanged(ref _appointmentDetail, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        set => this.RaiseAndSetIfChanged(ref _isLoading, value);
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set => this.RaiseAndSetIfChanged(ref _statusMessage, value);
    }

    public int TodayCount
    {
        get => _todayCount;
        set => this.RaiseAndSetIfChanged(ref _todayCount, value);
    }

    public int PendingCount
    {
        get => _pendingCount;
        set => this.RaiseAndSetIfChanged(ref _pendingCount, value);
    }

    public int CompletedCount
    {
        get => _completedCount;
        set => this.RaiseAndSetIfChanged(ref _completedCount, value);
    }

    public string DoctorName
    {
        get => _doctorName;
        set => this.RaiseAndSetIfChanged(ref _doctorName, value);
    }

    // Commands
    public ReactiveCommand<Unit, Unit> LoadAppointmentsCommand { get; }
    public ReactiveCommand<CitaDto, Unit> SelectAppointmentCommand { get; }
    public ReactiveCommand<Unit, Unit> RefreshCommand { get; }
    public ReactiveCommand<Unit, Unit> OpenDetailWindowCommand { get; }

    // Methods
    private async Task LoadAppointmentsAsync()
    {
        IsLoading = true;
        StatusMessage = "Cargando citas...";

        try
        {
            var appointments = await _apiClient.GetDoctorAppointmentsAsync(_doctorId);
            
            Appointments = new ObservableCollection<CitaDto>(appointments);
            
            // Filter today's appointments
            var today = DateTime.Today;
            TodayAppointments = new ObservableCollection<CitaDto>(
                appointments.Where(a => a.Inicio.Date == today).ToList()
            );

            // Filter pending appointments
            PendingAppointments = new ObservableCollection<CitaDto>(
                appointments.Where(a => a.Estado.Equals("AGENDADA", StringComparison.OrdinalIgnoreCase))
                           .OrderBy(a => a.Inicio)
                           .ToList()
            );

            // Update counts
            TodayCount = TodayAppointments.Count;
            PendingCount = PendingAppointments.Count;
            CompletedCount = appointments.Count(a => a.Estado.Equals("ATENDIDA", StringComparison.OrdinalIgnoreCase));

            StatusMessage = $"Se cargaron {appointments.Count} citas";
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error al cargar citas: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task SelectAppointmentAsync(CitaDto appointment)
    {
        try
        {
            SelectedAppointment = appointment;
            IsLoading = true;
            
            var detail = await _apiClient.GetAppointmentDetailAsync(appointment.Id);
            AppointmentDetail = detail;
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error al cargar detalles: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void OpenDetailWindow()
    {
        if (SelectedAppointment == null) return;

        var detailWindow = new AppointmentDetailWindow
        {
            DataContext = new AppointmentDetailViewModel(_apiClient, SelectedAppointment.Id)
        };
        
        detailWindow.Show();
    }
}
