# TuCita Desktop - Aplicación de Escritorio

## Descripción

Aplicación de escritorio desarrollada con **Avalonia UI** para médicos y administradores del sistema TuCitaOnline. Esta aplicación permite a los profesionales de la salud gestionar sus citas, pacientes y agendas de manera eficiente desde una aplicación nativa multiplataforma.

## Tecnologías Utilizadas

- **.NET 8.0**
- **Avalonia UI 11.0.10** - Framework UI multiplataforma
- **ReactiveUI** - MVVM framework
- **Microsoft.Extensions.DependencyInjection** - Inyección de dependencias
- **System.Net.Http.Json** - Cliente HTTP para consumir la API

## Características

### ? Pantalla de Login

- **Diseño Moderno**: Basado en los colores y estética de la aplicación web
- **Autenticación Segura**: Login con correo electrónico y contraseña
- **Validación de Roles**: Solo permite acceso a médicos y administradores
- **Feedback Visual**: Mensajes de error y estados de carga
- **Toggle de Contraseña**: Opción para mostrar/ocultar contraseña

### ?? Diseño

El diseño está basado en la aplicación web con los siguientes colores:

- **Primary**: `#3B82F6` (Azul vibrante)
- **Secondary**: `#EFF6FF` (Azul claro)
- **Background**: `#FFFFFF` (Blanco)
- **Muted**: `#F3F4F6` (Gris claro)
- **Text**: `#1F2937` (Gris oscuro)

## Estructura del Proyecto

```
TuCita.Desktop/
??? App.axaml                      # Estilos globales y recursos
??? App.axaml.cs                   # Configuración de la aplicación
??? Program.cs                     # Punto de entrada
??? appsettings.json              # Configuración de la API
??? Assets/                        # Recursos (iconos, imágenes)
?   ??? icon.svg                  
?   ??? README.md
??? Converters/                    # Convertidores de datos
?   ??? BoolToEyeIconConverter.cs
??? Services/                      # Servicios
?   ??? TuCitaApiClient.cs        # Cliente HTTP para la API
??? ViewModels/                    # View Models (MVVM)
?   ??? ViewModelBase.cs
?   ??? LoginViewModel.cs
?   ??? MainViewModel.cs
??? Views/                         # Vistas (UI)
    ??? LoginWindow.axaml
    ??? LoginWindow.axaml.cs
    ??? MainWindow.axaml
    ??? MainWindow.axaml.cs
```

## Configuración

### appsettings.json

Configura la URL base de la API en el archivo `appsettings.json`:

```json
{
  "TuCitaApi": {
    "BaseUrl": "https://localhost:7000",
    "Timeout": 30
  }
}
```

## Ejecución

### Requisitos Previos

- .NET 8.0 SDK instalado
- API de TuCita ejecutándose

### Ejecutar la Aplicación

```bash
cd TuCita.Desktop
dotnet run
```

### Compilar para Distribución

```bash
dotnet publish -c Release -r win-x64 --self-contained
```

Para otras plataformas:
- **Windows**: `-r win-x64`
- **macOS**: `-r osx-x64`
- **Linux**: `-r linux-x64`

## Capturas de Pantalla

### Pantalla de Login

La pantalla de login incluye:

- Logo de TuCitaOnline con ícono de corazón
- Campos de correo electrónico y contraseña
- Botón para mostrar/ocultar contraseña
- Mensaje de error en caso de credenciales incorrectas
- Indicador de carga durante el proceso de autenticación
- Información sobre el acceso restringido

### Características Visuales

- **Header con Gradiente**: Azul degradado (#3B82F6 a #2563EB)
- **Logo Circular**: Ícono de corazón en un círculo blanco
- **Campos de Entrada Modernos**: Con iconos y bordes redondeados
- **Botón Primary**: Azul con hover effects
- **Info Box**: Mensaje informativo con fondo azul claro
- **Footer**: Información de copyright y enlaces

## Arquitectura

La aplicación sigue el patrón **MVVM (Model-View-ViewModel)**:

### ViewModels

- **LoginViewModel**: Maneja la lógica de autenticación
  - Propiedades: Email, Password, IsLoading, ErrorMessage, ShowPassword
  - Comandos: LoginCommand, TogglePasswordVisibilityCommand
  - Evento: LoginSuccessful

- **MainViewModel**: Maneja la ventana principal
  - Propiedades: CurrentUser, WelcomeMessage

### Services

- **TuCitaApiClient**: Cliente HTTP para consumir la API REST
  - Métodos de autenticación
  - Métodos para gestionar citas
  - Métodos para consultar doctores

### Dependency Injection

La aplicación usa Microsoft.Extensions.DependencyInjection para:

- Registrar servicios HTTP
- Registrar ViewModels
- Registrar Views (Windows)

## Próximas Características

- [ ] Dashboard principal con estadísticas
- [ ] Gestión de agenda del médico
- [ ] Visualización de citas pendientes
- [ ] Historial de pacientes
- [ ] Gestión de horarios disponibles
- [ ] Notificaciones push
- [ ] Reportes y estadísticas
- [ ] Búsqueda de pacientes
- [ ] Gestión de perfil del médico

## Soporte

Para soporte técnico o reportar problemas, contacta a:
- Email: info@tucitaonline.com
- GitHub Issues: [TuCita Repository](https://github.com/rubencoto/TuCita)

## Licencia

© 2024 TuCitaOnline. Todos los derechos reservados.
