# Guía de Desarrollo - TuCita Desktop

## Inicio Rápido

### 1. Restaurar Dependencias

```bash
cd TuCita.Desktop
dotnet restore
```

### 2. Ejecutar en Modo Desarrollo

```bash
dotnet run
```

### 3. Compilar

```bash
dotnet build
```

## Agregar Nuevas Ventanas

### Paso 1: Crear ViewModel

```csharp
// ViewModels/MiNuevaViewModel.cs
using ReactiveUI;

namespace TuCita.Desktop.ViewModels;

public class MiNuevaViewModel : ViewModelBase
{
    private string _miPropiedad = string.Empty;

    public string MiPropiedad
    {
        get => _miPropiedad;
        set => this.RaiseAndSetIfChanged(ref _miPropiedad, value);
    }
}
```

### Paso 2: Crear Vista (AXAML)

```xml
<!-- Views/MiNuevaWindow.axaml -->
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="using:TuCita.Desktop.ViewModels"
        x:Class="TuCita.Desktop.Views.MiNuevaWindow"
        x:DataType="vm:MiNuevaViewModel"
        Title="Mi Nueva Ventana">
    <StackPanel>
        <TextBlock Text="{Binding MiPropiedad}"/>
    </StackPanel>
</Window>
```

### Paso 3: Code-Behind

```csharp
// Views/MiNuevaWindow.axaml.cs
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace TuCita.Desktop.Views;

public partial class MiNuevaWindow : Window
{
    public MiNuevaWindow()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}
```

### Paso 4: Registrar en DI

```csharp
// App.axaml.cs
private void ConfigureServices(IServiceCollection services)
{
    // ... código existente ...
    
    // ViewModels
    services.AddTransient<MiNuevaViewModel>();
    
    // Views
    services.AddTransient<MiNuevaWindow>();
}
```

## Estilos Personalizados

### Usar Estilos Predefinidos

```xml
<!-- Botón Primary -->
<Button Classes="primary" Content="Click Me"/>

<!-- Botón Secondary -->
<Button Classes="secondary" Content="Cancel"/>

<!-- TextBox Moderno -->
<TextBox Classes="modern" Watermark="Placeholder"/>

<!-- Card -->
<Border Classes="card">
    <TextBlock Text="Contenido del Card"/>
</Border>

<!-- Link -->
<TextBlock Classes="link" Text="Click aquí"/>
```

### Colores del Tema

```xml
<!-- Colores disponibles -->
#3B82F6  <!-- Primary -->
#2563EB  <!-- Primary Hover -->
#EFF6FF  <!-- Secondary Background -->
#F3F4F6  <!-- Muted Background -->
#1F2937  <!-- Text Primary -->
#6B7280  <!-- Text Secondary -->
#E5E7EB  <!-- Border -->
```

## Comandos Útiles

### Limpiar y Reconstruir

```bash
dotnet clean
dotnet build
```

### Ejecutar Tests

```bash
dotnet test
```

### Publicar para Windows

```bash
dotnet publish -c Release -r win-x64 --self-contained -p:PublishSingleFile=true
```

### Publicar para macOS

```bash
dotnet publish -c Release -r osx-x64 --self-contained -p:PublishSingleFile=true
```

### Publicar para Linux

```bash
dotnet publish -c Release -r linux-x64 --self-contained -p:PublishSingleFile=true
```

## Debugging

### Habilitar DevTools

En modo Debug, puedes abrir las DevTools presionando `F12` en cualquier ventana.

### Logs

Los logs se muestran en la consola. Para agregar logs:

```csharp
Console.WriteLine($"Mi mensaje de log: {variable}");
```

## Convenciones de Código

### Naming Conventions

- **ViewModels**: Sufijo `ViewModel` (ej: `LoginViewModel`)
- **Views**: Sufijo `Window` o `View` (ej: `LoginWindow`)
- **Services**: Sufijo `Service` o `Client` (ej: `TuCitaApiClient`)
- **Propiedades Privadas**: Prefijo `_` (ej: `_email`)
- **Propiedades Públicas**: PascalCase (ej: `Email`)

### Estructura de Archivos

```
TuCita.Desktop/
??? Assets/          # Recursos estáticos
??? Converters/      # Convertidores de binding
??? Models/          # Modelos de datos
??? Services/        # Servicios y lógica de negocio
??? ViewModels/      # ViewModels (MVVM)
??? Views/           # Vistas (XAML)
```

## Tips y Trucos

### 1. Binding con NotifyPropertyChanged

Siempre usa `this.RaiseAndSetIfChanged()` en tus setters:

```csharp
private string _nombre = string.Empty;
public string Nombre
{
    get => _nombre;
    set => this.RaiseAndSetIfChanged(ref _nombre, value);
}
```

### 2. Comandos con ReactiveCommand

```csharp
public ICommand MiComando { get; }

public MiViewModel()
{
    MiComando = ReactiveCommand.CreateFromTask(EjecutarMiComando);
}

private async Task EjecutarMiComando()
{
    // Tu lógica aquí
}
```

### 3. Navegación entre Ventanas

```csharp
var nuevaVentana = new MiNuevaWindow();
nuevaVentana.Show();
this.Close(); // Cerrar ventana actual
```

### 4. Mostrar Diálogos

```csharp
var dialog = new Window
{
    Title = "Confirmación",
    Content = new TextBlock { Text = "¿Estás seguro?" }
};
await dialog.ShowDialog(this);
```

## Troubleshooting

### Problema: La aplicación no inicia

**Solución**: Verifica que la API esté ejecutándose y que la URL en `appsettings.json` sea correcta.

### Problema: Errores de binding

**Solución**: Asegúrate de usar `x:DataType` en tu XAML y que las propiedades existan en el ViewModel.

### Problema: Estilos no se aplican

**Solución**: Verifica que hayas agregado `Classes="nombre-clase"` a tu control.

### Problema: DevTools no se abre

**Solución**: Asegúrate de tener el paquete `Avalonia.Diagnostics` instalado y estar en modo Debug.

## Recursos Adicionales

- [Documentación de Avalonia](https://docs.avaloniaui.net/)
- [Avalonia Samples](https://github.com/AvaloniaUI/Avalonia.Samples)
- [ReactiveUI Documentation](https://www.reactiveui.net/)
- [.NET 8 Documentation](https://docs.microsoft.com/en-us/dotnet/)

## Contacto

Para preguntas sobre desarrollo, contacta al equipo de desarrollo.
