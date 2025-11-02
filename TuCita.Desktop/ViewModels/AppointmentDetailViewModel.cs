using System;
using System.Collections.ObjectModel;
using System.Reactive;
using System.Threading.Tasks;
using ReactiveUI;
using TuCita.Desktop.Services;
using TuCita.Shared.DTOs.MedicalHistory;

namespace TuCita.Desktop.ViewModels;

public class AppointmentDetailViewModel : ViewModelBase
{
    private readonly TuCitaApiClient _apiClient;
    private long _appointmentId;
    private CitaDetalleDto? _appointment;
    private bool _isLoading;
    private string _statusMessage = string.Empty;

    // Clinical Note fields
    private string _newNotaContenido = string.Empty;

    // Diagnosis fields
    private string _newDiagnosticoCodigo = string.Empty;
    private string _newDiagnosticoDescripcion = string.Empty;

    // Prescription fields
    private string _newRecetaIndicaciones = string.Empty;
    private ObservableCollection<RecetaItemViewModel> _medicamentos = new();

    public AppointmentDetailViewModel(TuCitaApiClient apiClient, long appointmentId)
    {
        _apiClient = apiClient;
        _appointmentId = appointmentId;

        // Initialize commands
        LoadDetailCommand = ReactiveCommand.CreateFromTask(LoadDetailAsync);
        AddNotaClinicaCommand = ReactiveCommand.CreateFromTask(AddNotaClinicaAsync);
        AddDiagnosticoCommand = ReactiveCommand.CreateFromTask(AddDiagnosticoAsync);
        AddRecetaCommand = ReactiveCommand.CreateFromTask(AddRecetaAsync);
        AddMedicamentoCommand = ReactiveCommand.Create(AddMedicamento);
        RemoveMedicamentoCommand = ReactiveCommand.Create<RecetaItemViewModel>(RemoveMedicamento);

        // Load data
        LoadDetailCommand.Execute().Subscribe();
    }

    // Properties
    public CitaDetalleDto? Appointment
    {
        get => _appointment;
        set => this.RaiseAndSetIfChanged(ref _appointment, value);
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

    public string NewNotaContenido
    {
        get => _newNotaContenido;
        set => this.RaiseAndSetIfChanged(ref _newNotaContenido, value);
    }

    public string NewDiagnosticoCodigo
    {
        get => _newDiagnosticoCodigo;
        set => this.RaiseAndSetIfChanged(ref _newDiagnosticoCodigo, value);
    }

    public string NewDiagnosticoDescripcion
    {
        get => _newDiagnosticoDescripcion;
        set => this.RaiseAndSetIfChanged(ref _newDiagnosticoDescripcion, value);
    }

    public string NewRecetaIndicaciones
    {
        get => _newRecetaIndicaciones;
        set => this.RaiseAndSetIfChanged(ref _newRecetaIndicaciones, value);
    }

    public ObservableCollection<RecetaItemViewModel> Medicamentos
    {
        get => _medicamentos;
        set => this.RaiseAndSetIfChanged(ref _medicamentos, value);
    }

    // Commands
    public ReactiveCommand<Unit, Unit> LoadDetailCommand { get; }
    public ReactiveCommand<Unit, Unit> AddNotaClinicaCommand { get; }
    public ReactiveCommand<Unit, Unit> AddDiagnosticoCommand { get; }
    public ReactiveCommand<Unit, Unit> AddRecetaCommand { get; }
    public ReactiveCommand<Unit, Unit> AddMedicamentoCommand { get; }
    public ReactiveCommand<RecetaItemViewModel, Unit> RemoveMedicamentoCommand { get; }

    // Methods
    private async Task LoadDetailAsync()
    {
        IsLoading = true;
        try
        {
            var detail = await _apiClient.GetAppointmentDetailAsync(_appointmentId);
            Appointment = detail;
            StatusMessage = "Detalles cargados";
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task AddNotaClinicaAsync()
    {
        if (string.IsNullOrWhiteSpace(NewNotaContenido))
        {
            StatusMessage = "Debe ingresar el contenido de la nota";
            return;
        }

        IsLoading = true;
        try
        {
            var request = new CreateNotaClinicaRequest
            {
                CitaId = _appointmentId,
                Contenido = NewNotaContenido
            };

            var nota = await _apiClient.CreateNotaClinicaAsync(request);
            if (nota != null)
            {
                NewNotaContenido = string.Empty;
                await LoadDetailAsync();
                StatusMessage = "Nota clínica agregada exitosamente";
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error al agregar nota: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task AddDiagnosticoAsync()
    {
        if (string.IsNullOrWhiteSpace(NewDiagnosticoDescripcion))
        {
            StatusMessage = "Debe ingresar la descripción del diagnóstico";
            return;
        }

        IsLoading = true;
        try
        {
            var request = new CreateDiagnosticoRequest
            {
                CitaId = _appointmentId,
                Codigo = string.IsNullOrWhiteSpace(NewDiagnosticoCodigo) ? null : NewDiagnosticoCodigo,
                Descripcion = NewDiagnosticoDescripcion
            };

            var diagnostico = await _apiClient.CreateDiagnosticoAsync(request);
            if (diagnostico != null)
            {
                NewDiagnosticoCodigo = string.Empty;
                NewDiagnosticoDescripcion = string.Empty;
                await LoadDetailAsync();
                StatusMessage = "Diagnóstico agregado exitosamente";
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error al agregar diagnóstico: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task AddRecetaAsync()
    {
        if (Medicamentos.Count == 0)
        {
            StatusMessage = "Debe agregar al menos un medicamento";
            return;
        }

        IsLoading = true;
        try
        {
            var medicamentosList = Medicamentos.Select(m => new CreateRecetaItemRequest
            {
                Medicamento = m.Medicamento,
                Dosis = string.IsNullOrWhiteSpace(m.Dosis) ? null : m.Dosis,
                Frecuencia = string.IsNullOrWhiteSpace(m.Frecuencia) ? null : m.Frecuencia,
                Duracion = string.IsNullOrWhiteSpace(m.Duracion) ? null : m.Duracion,
                Notas = string.IsNullOrWhiteSpace(m.Notas) ? null : m.Notas
            }).ToList();

            var request = new CreateRecetaRequest
            {
                CitaId = _appointmentId,
                Indicaciones = string.IsNullOrWhiteSpace(NewRecetaIndicaciones) ? null : NewRecetaIndicaciones,
                Medicamentos = medicamentosList
            };

            var receta = await _apiClient.CreateRecetaAsync(request);
            if (receta != null)
            {
                NewRecetaIndicaciones = string.Empty;
                Medicamentos.Clear();
                await LoadDetailAsync();
                StatusMessage = "Receta agregada exitosamente";
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error al agregar receta: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void AddMedicamento()
    {
        Medicamentos.Add(new RecetaItemViewModel());
    }

    private void RemoveMedicamento(RecetaItemViewModel medicamento)
    {
        Medicamentos.Remove(medicamento);
    }
}

public class RecetaItemViewModel : ViewModelBase
{
    private string _medicamento = string.Empty;
    private string _dosis = string.Empty;
    private string _frecuencia = string.Empty;
    private string _duracion = string.Empty;
    private string _notas = string.Empty;

    public string Medicamento
    {
        get => _medicamento;
        set => this.RaiseAndSetIfChanged(ref _medicamento, value);
    }

    public string Dosis
    {
        get => _dosis;
        set => this.RaiseAndSetIfChanged(ref _dosis, value);
    }

    public string Frecuencia
    {
        get => _frecuencia;
        set => this.RaiseAndSetIfChanged(ref _frecuencia, value);
    }

    public string Duracion
    {
        get => _duracion;
        set => this.RaiseAndSetIfChanged(ref _duracion, value);
    }

    public string Notas
    {
        get => _notas;
        set => this.RaiseAndSetIfChanged(ref _notas, value);
    }
}
