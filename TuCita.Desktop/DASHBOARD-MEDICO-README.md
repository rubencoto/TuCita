# Dashboard Médico - TuCita Desktop

## 📋 Descripción

El Dashboard Médico es una interfaz completa desarrollada con **Avalonia UI** que permite a los médicos gestionar sus citas y mantener el historial médico de sus pacientes directamente desde la aplicación de escritorio de TuCita.

## 🎯 Características Principales

### 1. Vista General del Dashboard
- **Estadísticas en tiempo real:**
  - Citas programadas para hoy
  - Citas pendientes
  - Total de citas atendidas
  
- **Lista de citas de hoy** con información detallada
- **Próximas citas** ordenadas cronológicamente
- **Vista de detalles** de cita seleccionada

### 2. Gestión de Información Médica

El médico puede agregar para cada cita:

#### 📝 Notas Clínicas
- Crear notas clínicas detalladas
- Ver historial de notas por cita
- Timestamp automático de cada nota

#### 🩺 Diagnósticos
- Agregar diagnósticos con código ICD-10 (opcional)
- Descripción completa del diagnóstico
- Registro de fecha y hora automático

#### 💊 Recetas Médicas
- Crear recetas con múltiples medicamentos
- Para cada medicamento:
  - Nombre del medicamento
  - Dosis
  - Frecuencia de administración
  - Duración del tratamiento
  - Notas adicionales
- Indicaciones generales de la receta

## 🏗️ Arquitectura

### Estructura de Archivos

```
TuCita.Desktop/
├── ViewModels/
│   ├── DoctorDashboardViewModel.cs      # ViewModel principal del dashboard
│   ├── AppointmentDetailViewModel.cs    # ViewModel para detalles y edición
│   └── ViewModelBase.cs                 # Clase base con ReactiveUI
├── Views/
│   ├── DoctorDashboardWindow.axaml      # Vista principal del dashboard
│   ├── DoctorDashboardWindow.axaml.cs   # Code-behind
│   ├── AppointmentDetailWindow.axaml    # Vista de detalles médicos
│   └── AppointmentDetailWindow.axaml.cs # Code-behind
├── Services/
│   └── TuCitaApiClient.cs               # Cliente HTTP extendido
└── Converters/
    └── BoolToEyeIconConverter.cs        # Converters adicionales

TuCita.Shared/
└── DTOs/
    └── MedicalHistory/
        ├── DiagnosticoDto.cs            # DTOs para diagnósticos
        ├── NotaClinicaDto.cs            # DTOs para notas clínicas
        ├── RecetaDto.cs                 # DTOs para recetas
        └── HistorialMedicoDto.cs        # DTOs para historial
```

### ViewModels

#### `DoctorDashboardViewModel`
Maneja la lógica principal del dashboard:
- Carga de citas del médico
- Filtrado de citas por fecha y estado
- Selección de citas
- Navegación a detalles

**Propiedades principales:**
```csharp
- ObservableCollection<CitaDto> Appointments
- ObservableCollection<CitaDto> TodayAppointments
- ObservableCollection<CitaDto> PendingAppointments
- CitaDto? SelectedAppointment
- int TodayCount, PendingCount, CompletedCount
```

**Comandos:**
```csharp
- LoadAppointmentsCommand
- SelectAppointmentCommand
- RefreshCommand
- OpenDetailWindowCommand
```

#### `AppointmentDetailViewModel`
Maneja la edición de información médica:
- Agregar notas clínicas
- Agregar diagnósticos
- Crear recetas con medicamentos
- Gestión de medicamentos en receta

**Comandos:**
```csharp
- AddNotaClinicaCommand
- AddDiagnosticoCommand
- AddRecetaCommand
- AddMedicamentoCommand
- RemoveMedicamentoCommand
```

### API Client Extensions

El `TuCitaApiClient` se extendió con métodos para historial médico:

```csharp
// Obtener historial médico
Task<List<HistorialMedicoDto>> GetPatientMedicalHistoryAsync(long patientId)
Task<CitaDetalleDto?> GetAppointmentDetailAsync(long appointmentId)

// Crear información médica
Task<NotaClinicaDto?> CreateNotaClinicaAsync(CreateNotaClinicaRequest request)
Task<DiagnosticoDto?> CreateDiagnosticoAsync(CreateDiagnosticoRequest request)
Task<RecetaDto?> CreateRecetaAsync(CreateRecetaRequest request)

// Obtener citas del médico
Task<List<CitaDto>> GetDoctorAppointmentsAsync(long doctorId)
```

## 🎨 Diseño UI

### Paleta de Colores

- **Primary Blue:** `#1976D2` - Headers y acciones principales
- **Success Green:** `#4CAF50` - Botones de confirmación
- **Warning Orange:** `#F57C00` - Estados pendientes
- **Background:** `#F5F5F5` - Fondo general
- **Cards:** `White` con bordes `#E0E0E0`

### Componentes Principales

#### Stats Cards
Tarjetas con estadísticas que muestran:
- Icono emoji representativo
- Número grande (métrica)
- Descripción
- Color temático

#### Appointment Cards
Tarjetas de cita con:
- Hora destacada
- Nombre del médico/paciente
- Badge de estado
- Información adicional (motivo, especialidad)

#### Tabs para Información Médica
- Notas Clínicas (azul)
- Diagnósticos (naranja)
- Recetas (morado)

## 🔐 Seguridad y Permisos

### Verificación de Rol
El sistema verifica el rol del usuario al hacer login:

```csharp
private bool IsDoctorRole(AuthResponseDto userData)
{
    // TODO: Implementar verificación real de rol
    // Por ejemplo: userData.Role?.Equals("DOCTOR", ...)
    return false;
}
```

### Acceso a Endpoints
- Solo médicos pueden crear notas clínicas, diagnósticos y recetas
- La verificación se realiza en el backend
- El token JWT debe contener los permisos necesarios

## 🚀 Uso

### 1. Login como Médico

```csharp
// En LoginWindow.axaml.cs
private void OnLoginSuccessful(object? sender, AuthResponseDto userData)
{
    if (IsDoctorRole(userData))
    {
        var dashboardWindow = new DoctorDashboardWindow
        {
            DataContext = new DoctorDashboardViewModel(
                _apiClient, 
                userData.Id, 
                userData.Name)
        };
        dashboardWindow.Show();
    }
}
```

### 2. Abrir Dashboard Manualmente

```csharp
var apiClient = new TuCitaApiClient(httpClient);
apiClient.SetAuthToken(token);

var dashboardWindow = new DoctorDashboardWindow
{
    DataContext = new DoctorDashboardViewModel(
        apiClient, 
        doctorId: 123, 
        doctorName: "Dr. Juan Pérez")
};
dashboardWindow.Show();
```

### 3. Agregar Nota Clínica

```csharp
var viewModel = new AppointmentDetailViewModel(apiClient, appointmentId);
viewModel.NewNotaContenido = "Paciente presenta...";
await viewModel.AddNotaClinicaCommand.Execute();
```

### 4. Crear Receta

```csharp
var viewModel = new AppointmentDetailViewModel(apiClient, appointmentId);

// Agregar medicamentos
viewModel.AddMedicamentoCommand.Execute();
viewModel.Medicamentos[0].Medicamento = "Ibuprofeno";
viewModel.Medicamentos[0].Dosis = "400mg";
viewModel.Medicamentos[0].Frecuencia = "Cada 8 horas";
viewModel.Medicamentos[0].Duracion = "7 días";

// Guardar receta
viewModel.NewRecetaIndicaciones = "Tomar con alimentos";
await viewModel.AddRecetaCommand.Execute();
```

## 📊 Flujo de Datos

```
┌─────────────────┐
│  Login Window   │
└────────┬────────┘
         │ (Si es médico)
         ▼
┌─────────────────────────┐
│ DoctorDashboardWindow   │
│  - Citas de hoy         │
│  - Estadísticas         │
│  - Próximas citas       │
└───────────┬─────────────┘
            │ (Seleccionar cita)
            ▼
┌──────────────────────────┐
│ AppointmentDetailWindow  │
│  - Información paciente  │
│  - Notas clínicas        │
│  - Diagnósticos          │
│  - Recetas               │
└──────────────────────────┘
```

## 🔧 Configuración

### App.axaml.cs (Dependency Injection)

Asegúrate de registrar los servicios necesarios:

```csharp
services.AddSingleton<TuCitaApiClient>();
services.AddTransient<LoginViewModel>();
services.AddTransient<DoctorDashboardViewModel>();
services.AddTransient<AppointmentDetailViewModel>();
```

### appsettings.json

```json
{
  "ApiSettings": {
    "BaseUrl": "https://localhost:7138",
    "Timeout": 30
  }
}
```

## 📝 Notas de Desarrollo

### Validaciones Pendientes

1. **Verificación de Rol:**
   - Actualizar `IsDoctorRole()` en `LoginWindow.axaml.cs`
   - Implementar según estructura real de `AuthResponseDto`

2. **Permisos:**
   - Validar permisos antes de mostrar botones de edición
   - Deshabilitar acciones según rol del usuario

3. **Estados de Cita:**
   - Solo permitir editar citas en estado "ATENDIDA" o "AGENDADA"
   - Agregar validación en ViewModels

### Mejoras Futuras

- [ ] Búsqueda y filtros avanzados de citas
- [ ] Exportación de recetas a PDF
- [ ] Firma digital de documentos
- [ ] Historial de cambios en notas
- [ ] Notificaciones en tiempo real
- [ ] Soporte para múltiples idiomas
- [ ] Tema oscuro
- [ ] Gráficas y estadísticas avanzadas

## 🐛 Troubleshooting

### Error: "No se puede resolver la propiedad"
- Verificar que los DTOs tengan las propiedades correctas
- Revisar el namespace en los bindings XAML

### Error: "Unable to resolve ColumnSpacing"
- Avalonia no soporta `ColumnSpacing` directamente
- Usar `Margin` en los elementos hijos para espaciado

### La ventana no se abre
- Verificar que el `DataContext` esté correctamente asignado
- Revisar que el API Client tenga el token configurado

## 📚 Referencias

- [Avalonia UI Documentation](https://docs.avaloniaui.net/)
- [ReactiveUI Documentation](https://www.reactiveui.net/)
- [TuCita API Documentation](../TuCita/README.md)

## 🤝 Contribuciones

Para contribuir al Dashboard Médico:

1. Seguir los estándares de código del proyecto
2. Usar ReactiveUI para bindings y comandos
3. Mantener separación clara entre ViewModels y Views
4. Agregar comentarios XML para métodos públicos
5. Actualizar este README con cambios significativos

## 📄 Licencia

Este componente es parte del proyecto TuCita y está bajo la misma licencia del proyecto principal.
