# TuCitaOnline ??

Sistema de gestión de citas médicas en línea desarrollado con .NET 8 y React + TypeScript.

[![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)

## ?? Descripción

TuCitaOnline es una plataforma web completa para la gestión de citas médicas que conecta pacientes con médicos, permitiendo agendar, gestionar y hacer seguimiento de consultas médicas de manera eficiente.

## ??? Arquitectura del Sistema

### Backend (.NET 8)
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0.10
- **Base de datos**: MySQL 8.0 (DigitalOcean Managed Database)
- **Autenticación**: JWT (JSON Web Tokens)
- **Patrón de arquitectura**: MVC + Repository Pattern con Services

### Frontend (React + TypeScript)
- **Framework**: React 18.3.1 con TypeScript 5.7.2
- **Build Tool**: Vite 6.3.5
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios 1.12.2
- **Routing**: React Router

## ?? Estructura de la Base de Datos

### Diagrama de Entidades

```
???????????????????????????????????????????????????????????????????
?                    SISTEMA DE IDENTIDAD Y SEGURIDAD             ?
???????????????????????????????????????????????????????????????????

    usuarios                roles               roles_usuarios
????????????????       ????????????         ????????????????
? id (PK)      ?       ? id (PK)  ?         ? usuario_id   ?
? email        ????????? nombre   ??????????? rol_id       ?
? password_hash?       ????????????         ? asignado_en  ?
? nombre       ?                             ????????????????
? apellido     ?
? telefono     ?
? activo       ?
? token_recuperacion      ?
? token_recuperacion_expira?
????????????????

???????????????????????????????????????????????????????????????????
?                         PERFILES DE USUARIO                     ?
???????????????????????????????????????????????????????????????????

   perfil_paciente                    perfil_medico
????????????????????              ????????????????????
? usuario_id (PK)  ?              ? usuario_id (PK)  ?
? fecha_nacimiento ?              ? numero_licencia  ?
? identificacion   ?              ? biografia        ?
? telefono_emergencia?            ? direccion        ?
????????????????????              ? ciudad           ?
                                  ? provincia        ?
                                  ? pais             ?
                                  ? latitud          ?
                                  ? longitud         ?
                                  ????????????????????

???????????????????????????????????????????????????????????????????
?                           CATÁLOGOS                             ?
???????????????????????????????????????????????????????????????????

    especialidades              medico_especialidad
????????????????              ????????????????????
? id (PK)      ?              ? medico_id        ?
? nombre       ???????????????? especialidad_id  ?
????????????????              ????????????????????

???????????????????????????????????????????????????????????????????
?                      GESTIÓN DE CITAS                           ?
???????????????????????????????????????????????????????????????????

    agenda_turnos                    citas
????????????????????           ????????????????????
? id (PK)          ?           ? id (PK)          ?
? medico_id (FK)   ????????????? turno_id (FK)    ?
? inicio           ?           ? medico_id (FK)   ?
? fin              ?           ? paciente_id (FK) ?
? estado           ?           ? estado           ?
?  - DISPONIBLE    ?           ?  - PENDIENTE     ?
?  - RESERVADO     ?           ?  - CONFIRMADA    ?
?  - BLOQUEADO     ?           ?  - CANCELADA     ?
????????????????????           ?  - REPROGRAMADA  ?
                               ?  - ATENDIDA      ?
                               ?  - NO_ASISTE     ?
                               ? motivo           ?
                               ? creado_por (FK)  ?
                               ????????????????????

???????????????????????????????????????????????????????????????????
?                    INFORMACIÓN CLÍNICA                          ?
???????????????????????????????????????????????????????????????????

   notas_clinicas              diagnosticos              recetas
????????????????           ????????????????        ????????????????
? id (PK)      ?           ? id (PK)      ?        ? id (PK)      ?
? cita_id (FK) ?           ? cita_id (FK) ?        ? cita_id (FK) ?
? medico_id    ?           ? codigo       ?        ? indicaciones ?
? paciente_id  ?           ? descripcion  ?        ????????????????
? nota         ?           ????????????????                ?
????????????????                                           ?
                                                    receta_items
                                                ????????????????????
                                                ? id (PK)          ?
                                                ? receta_id (FK)   ?
                                                ? medicamento      ?
                                                ? dosis            ?
                                                ? frecuencia       ?
                                                ? duracion         ?
                                                ? notas            ?
                                                ????????????????????

???????????????????????????????????????????????????????????????????
?                        NOTIFICACIONES                           ?
???????????????????????????????????????????????????????????????????

      notificaciones
??????????????????????
? id (PK)            ?
? usuario_id (FK)    ?
? cita_id (FK)       ?
? canal              ?
?  - CORREO          ?
?  - SMS             ?
?  - PUSH            ?
?  - WEBHOOK         ?
? tipo               ?
?  - CREADA          ?
?  - CONFIRMADA      ?
?  - CANCELADA       ?
?  - REPROGRAMADA    ?
? contenido (JSON)   ?
? enviada            ?
? error              ?
??????????????????????
```

### Tablas Principales

#### **Usuarios y Seguridad**
| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `usuarios` | Información básica de todos los usuarios del sistema | email, password_hash, nombre, apellido, token_recuperacion |
| `roles` | Catálogo de roles del sistema (Admin, Médico, Paciente) | nombre |
| `roles_usuarios` | Relación muchos a muchos entre usuarios y roles | usuario_id, rol_id |

#### **Perfiles**
| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `perfil_paciente` | Información adicional de pacientes | fecha_nacimiento, identificacion, telefono_emergencia |
| `perfil_medico` | Información adicional de médicos | numero_licencia, biografia, direccion, coordenadas GPS |
| `medico_especialidad` | Especialidades de cada médico | medico_id, especialidad_id |

#### **Gestión de Citas**
| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `especialidades` | Catálogo de especialidades médicas | nombre |
| `agenda_turnos` | Slots de tiempo disponibles por médico | medico_id, inicio, fin, estado |
| `citas` | Citas agendadas entre pacientes y médicos | turno_id, medico_id, paciente_id, estado, motivo |

#### **Información Clínica**
| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `notas_clinicas` | Notas médicas de cada consulta | cita_id, medico_id, nota |
| `diagnosticos` | Diagnósticos de cada cita | cita_id, codigo, descripcion |
| `recetas` | Recetas médicas emitidas | cita_id, indicaciones |
| `receta_items` | Medicamentos de cada receta | receta_id, medicamento, dosis, frecuencia |

#### **Notificaciones**
| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `notificaciones` | Registro de notificaciones enviadas | usuario_id, cita_id, canal, tipo, enviada |

## ?? Enumeraciones del Sistema

### EstadoTurno
- `DISPONIBLE` - Turno disponible para agendar
- `RESERVADO` - Turno ocupado con una cita
- `BLOQUEADO` - Turno no disponible (médico no disponible)

### EstadoCita
- `PENDIENTE` - Cita agendada pero no confirmada
- `CONFIRMADA` - Cita confirmada por ambas partes
- `CANCELADA` - Cita cancelada
- `REPROGRAMADA` - Cita reprogramada a otro horario
- `ATENDIDA` - Cita completada
- `NO_ASISTE` - Paciente no asistió a la cita

### CanalNotificacion
- `CORREO` - Notificación por email
- `SMS` - Notificación por mensaje de texto
- `PUSH` - Notificación push en la app
- `WEBHOOK` - Notificación vía webhook

### TipoNotificacion
- `CREADA` - Notificación de cita creada
- `CONFIRMADA` - Notificación de cita confirmada
- `CANCELADA` - Notificación de cita cancelada
- `REPROGRAMADA` - Notificación de cita reprogramada

## ?? API Endpoints

### ?? Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ? |
| POST | `/api/auth/login` | Iniciar sesión | ? |
| POST | `/api/auth/forgot-password` | Solicitar recuperación de contraseña | ? |
| POST | `/api/auth/reset-password` | Restablecer contraseña con código | ? |
| GET | `/api/auth/me` | Obtener información del usuario actual | ? |

### ????? Médicos (`/api/doctors`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| GET | `/api/doctors` | Listar todos los médicos | ? |
| GET | `/api/doctors/{id}` | Obtener detalle de un médico | ? |
| GET | `/api/doctors/{id}/turnos` | Obtener turnos disponibles de un médico | ? |
| GET | `/api/doctors/search` | Buscar médicos por especialidad, nombre, ubicación | ? |

### ?? Citas (`/api/appointments`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| GET | `/api/appointments` | Listar citas del usuario autenticado | ? |
| GET | `/api/appointments/{id}` | Obtener detalle de una cita | ? |
| POST | `/api/appointments` | Crear una nueva cita | ? |
| PUT | `/api/appointments/{id}` | Actualizar una cita | ? |
| DELETE | `/api/appointments/{id}` | Cancelar una cita | ? |
| PUT | `/api/appointments/{id}/confirm` | Confirmar una cita | ? |

### ?? Email (`/api/email`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/api/email/test` | Enviar email de prueba | ? (Admin) |

### ?? Health Check (`/api/health`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| GET | `/api/health` | Verificar estado de la aplicación y BD | ? |
| GET | `/api/health/database-info` | Información de la base de datos | ? |
| GET | `/api/health/test-connection` | Probar conexión a la base de datos | ? |

## ?? Estructura del Proyecto

```
TuCita/
??? Controllers/
?   ??? Api/
?       ??? AuthController.cs           # Autenticación y recuperación de contraseña
?       ??? DoctorsController.cs        # Gestión de médicos
?       ??? AppointmentsController.cs   # Gestión de citas
?       ??? EmailController.cs          # Envío de emails
?       ??? HealthController.cs         # Health checks
?
??? Services/
?   ??? AuthService.cs                  # Lógica de autenticación
?   ??? DoctorsService.cs               # Lógica de médicos
?   ??? AppointmentsService.cs          # Lógica de citas
?   ??? EmailService.cs                 # Servicio de envío de emails
?
??? Models/
?   ??? DatabaseModels.cs               # Modelos de base de datos (EF Core)
?   ??? ErrorViewModel.cs               # Modelo de errores
?
??? DTOs/
?   ??? Auth/
?   ?   ??? LoginRequestDto.cs
?   ?   ??? RegisterRequestDto.cs
?   ?   ??? AuthResponseDto.cs
?   ?   ??? PasswordRecoveryDtos.cs
?   ??? Doctors/
?   ?   ??? DoctorDto.cs
?   ?   ??? DoctorDetailDto.cs
?   ?   ??? AgendaTurnoDto.cs
?   ??? Appointments/
?       ??? CitaDto.cs
?       ??? CreateAppointmentRequest.cs
?       ??? UpdateAppointmentRequest.cs
?
??? Data/
?   ??? TuCitaDbContext.cs              # Contexto de Entity Framework
?   ??? DbInitializer.cs                # Inicializador de datos
?
??? Migrations/                         # Migraciones de Entity Framework
?
??? ClientApp/                          # Frontend React + TypeScript
?   ??? src/
?   ?   ??? components/
?   ?   ?   ??? pages/
?   ?   ?       ??? auth-page.tsx       # Página de login/registro
?   ?   ?       ??? forgot-password-page.tsx
?   ?   ?       ??? reset-password-page.tsx
?   ?   ?       ??? search-page.tsx     # Búsqueda de médicos
?   ?   ?       ??? appointments-page.tsx
?   ?   ??? services/
?   ?   ?   ??? authService.ts
?   ?   ?   ??? appointmentsService.ts
?   ?   ?   ??? axiosConfig.ts
?   ?   ??? main.tsx
?   ??? package.json
?   ??? tsconfig.json
?   ??? vite.config.ts
?
??? Program.cs                          # Configuración principal
??? appsettings.json                    # Configuración de la aplicación
??? .env                                # Variables de entorno
??? TuCita.csproj                       # Archivo del proyecto
```

## ??? Tecnologías y Paquetes

### Backend (.NET)
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.10" />
<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.2" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.1.2" />
<PackageReference Include="DotNetEnv" Version="3.1.1" />
<PackageReference Include="Microsoft.AspNetCore.SpaServices.Extensions" Version="8.0.10" />
```

### Frontend (React)
- **UI Framework**: Radix UI (componentes accesibles)
- **Styling**: Tailwind CSS + tailwindcss-animate
- **Forms**: React Hook Form
- **HTTP**: Axios
- **Icons**: Lucide React
- **Carousel**: Embla Carousel
- **Notifications**: Sonner
- **Themes**: next-themes
- **Charts**: Recharts

## ?? Configuración e Instalación

### Prerrequisitos
- .NET 8 SDK
- Node.js 18+
- MySQL 8.0
- Visual Studio 2022 o VS Code

### Variables de Entorno (.env)

Crear un archivo `.env` en la raíz del proyecto:

```env
# Database Configuration (DigitalOcean)
DB_SERVER=tu-servidor.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=tco_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña_segura

# JWT Configuration
JWT_KEY=tu_clave_secreta_muy_larga_y_segura_minimo_32_caracteres
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=tu_email@gmail.com
EMAIL_FROM_NAME=TuCitaOnline
```

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/rubencoto/TuCita.git
cd TuCita
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Instalar dependencias del backend**
```bash
dotnet restore
```

4. **Instalar dependencias del frontend**
```bash
cd ClientApp
npm install
cd ..
```

5. **Aplicar migraciones a la base de datos**
```bash
dotnet ef database update
```

6. **Ejecutar la aplicación**
```bash
dotnet run
```

La aplicación estará disponible en:
- Backend API: `https://localhost:7089`
- Frontend: `http://localhost:3000` (Vite dev server)

## ?? Estado del Proyecto

### ? Funcionalidades Implementadas

#### Autenticación y Seguridad
- [x] Registro de usuarios (pacientes)
- [x] Login con JWT
- [x] Recuperación de contraseña por email
- [x] Reset de contraseña con código de seguridad
- [x] Protección de rutas con JWT
- [x] Sistema de roles (Admin, Médico, Paciente)
- [x] Hash de contraseñas con BCrypt

#### Gestión de Médicos
- [x] Listado de médicos
- [x] Detalle de médico con especialidades
- [x] Búsqueda de médicos
- [x] Visualización de turnos disponibles
- [x] Perfiles de médico con ubicación GPS

#### Gestión de Citas
- [x] Creación de citas
- [x] Listado de citas del usuario
- [x] Actualización de citas
- [x] Cancelación de citas
- [x] Estados de citas (Pendiente, Confirmada, etc.)
- [x] Agenda de turnos

#### Sistema de Notificaciones
- [x] Servicio de email con SMTP
- [x] Plantillas HTML para emails
- [x] Email de recuperación de contraseña
- [x] Sistema de notificaciones (estructura BD)

#### Base de Datos
- [x] Modelo completo de datos
- [x] Migraciones de Entity Framework
- [x] Inicialización de datos (roles, especialidades)
- [x] Índices y restricciones
- [x] Relaciones entre entidades

#### Frontend
- [x] Interfaz de login/registro
- [x] Página de recuperación de contraseña
- [x] Página de búsqueda de médicos
- [x] Página de gestión de citas
- [x] Integración con API backend
- [x] Manejo de autenticación con tokens

### ?? En Desarrollo

#### Gestión Clínica
- [ ] Creación de notas clínicas
- [ ] Registro de diagnósticos
- [ ] Emisión de recetas médicas
- [ ] Historial médico del paciente

#### Notificaciones
- [ ] Envío automático de emails de confirmación
- [ ] Recordatorios de citas por email
- [ ] Notificaciones push
- [ ] Integración con SMS

#### Panel de Administración
- [ ] Dashboard administrativo
- [ ] Gestión de usuarios
- [ ] Gestión de médicos y especialidades
- [ ] Reportes y estadísticas

#### Mejoras Frontend
- [ ] Dashboard del paciente
- [ ] Dashboard del médico
- [ ] Calendario interactivo
- [ ] Chat en tiempo real (médico-paciente)
- [ ] Sistema de valoraciones y reseñas

### ?? Pendiente

#### Características Avanzadas
- [ ] Videoconsultas (integración WebRTC)
- [ ] Pagos en línea
- [ ] Historia clínica digital completa
- [ ] Integración con sistemas de salud
- [ ] App móvil (React Native)
- [ ] Sistema de recordatorios automáticos
- [ ] Exportación de informes médicos (PDF)
- [ ] Soporte multiidioma
- [ ] Tema oscuro/claro

#### Seguridad y Cumplimiento
- [ ] Autenticación de dos factores (2FA)
- [ ] Auditoría de accesos
- [ ] Cumplimiento HIPAA
- [ ] Encriptación de datos sensibles
- [ ] Backup automático

#### Optimizaciones
- [ ] Caché de datos frecuentes (Redis)
- [ ] Optimización de consultas a BD
- [ ] Lazy loading de componentes
- [ ] Progressive Web App (PWA)
- [ ] Tests unitarios y de integración

## ?? Migraciones de Base de Datos

### Migraciones Aplicadas

1. **InitialCreate** (2024-10-04)
   - Creación inicial de todas las tablas
   - Definición de relaciones y restricciones
   - Índices únicos en campos clave

2. **RemoveSedeReferences** (2024-10-06)
   - Eliminación de referencias a sedes médicas
   - Simplificación del modelo de ubicación

3. **AddPasswordResetToken** (2024-10-06)
   - Agregado de campos para recuperación de contraseña
   - `token_recuperacion` y `token_recuperacion_expira` en tabla usuarios

### Crear Nueva Migración

```bash
dotnet ef migrations add NombreDeLaMigracion
dotnet ef database update
```

### Revertir Migración

```bash
dotnet ef database update NombreMigracionAnterior
dotnet ef migrations remove
```

## ?? Testing

### Backend
```bash
dotnet test
```

### Frontend
```bash
cd ClientApp
npm run test
```

### TypeScript Type Check
```bash
cd ClientApp
npm run type-check
```

## ?? Configuración de Email

### Gmail SMTP
1. Habilitar autenticación de dos factores en tu cuenta de Gmail
2. Generar una contraseña de aplicación en: https://myaccount.google.com/apppasswords
3. Usar esa contraseña en `EMAIL_PASSWORD` en el archivo `.env`

## ?? Seguridad

- Contraseñas hasheadas con BCrypt (factor de trabajo: 11)
- Autenticación JWT con tokens de corta duración
- HTTPS requerido en producción
- Validación de datos en backend y frontend
- Protección contra SQL Injection (Entity Framework)
- Sanitización de inputs
- Tokens de recuperación con expiración (15 minutos)

## ?? Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ?? Licencia

Este proyecto es privado y de uso educativo.

## ?? Autor

- **Rubén Coto** - [@rubencoto](https://github.com/rubencoto)
- **Iann Calderon 
- ** Jesus Alvarado


---

? **Nota**: Este proyecto está en desarrollo activo. Las funcionalidades y la estructura pueden cambiar.
