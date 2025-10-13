# TuCitaOnline ??

Sistema de gesti�n de citas m�dicas en l�nea desarrollado con .NET 8 y React + TypeScript.

[![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)

## ?? Descripci�n

TuCitaOnline es una plataforma web completa para la gesti�n de citas m�dicas que conecta pacientes con m�dicos, permitiendo agendar, gestionar y hacer seguimiento de consultas m�dicas de manera eficiente.

## ??? Arquitectura del Sistema

### Backend (.NET 8)
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0.10
- **Base de datos**: MySQL 8.0 (DigitalOcean Managed Database)
- **Autenticaci�n**: JWT (JSON Web Tokens)
- **Patr�n de arquitectura**: MVC + Repository Pattern con Services

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
?                           CAT�LOGOS                             ?
???????????????????????????????????????????????????????????????????

    especialidades              medico_especialidad
????????????????              ????????????????????
? id (PK)      ?              ? medico_id        ?
? nombre       ???????????????? especialidad_id  ?
????????????????              ????????????????????

???????????????????????????????????????????????????????????????????
?                      GESTI�N DE CITAS                           ?
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
?                    INFORMACI�N CL�NICA                          ?
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
| Tabla | Descripci�n | Campos Principales |
|-------|-------------|-------------------|
| `usuarios` | Informaci�n b�sica de todos los usuarios del sistema | email, password_hash, nombre, apellido, token_recuperacion |
| `roles` | Cat�logo de roles del sistema (Admin, M�dico, Paciente) | nombre |
| `roles_usuarios` | Relaci�n muchos a muchos entre usuarios y roles | usuario_id, rol_id |

#### **Perfiles**
| Tabla | Descripci�n | Campos Principales |
|-------|-------------|-------------------|
| `perfil_paciente` | Informaci�n adicional de pacientes | fecha_nacimiento, identificacion, telefono_emergencia |
| `perfil_medico` | Informaci�n adicional de m�dicos | numero_licencia, biografia, direccion, coordenadas GPS |
| `medico_especialidad` | Especialidades de cada m�dico | medico_id, especialidad_id |

#### **Gesti�n de Citas**
| Tabla | Descripci�n | Campos Principales |
|-------|-------------|-------------------|
| `especialidades` | Cat�logo de especialidades m�dicas | nombre |
| `agenda_turnos` | Slots de tiempo disponibles por m�dico | medico_id, inicio, fin, estado |
| `citas` | Citas agendadas entre pacientes y m�dicos | turno_id, medico_id, paciente_id, estado, motivo |

#### **Informaci�n Cl�nica**
| Tabla | Descripci�n | Campos Principales |
|-------|-------------|-------------------|
| `notas_clinicas` | Notas m�dicas de cada consulta | cita_id, medico_id, nota |
| `diagnosticos` | Diagn�sticos de cada cita | cita_id, codigo, descripcion |
| `recetas` | Recetas m�dicas emitidas | cita_id, indicaciones |
| `receta_items` | Medicamentos de cada receta | receta_id, medicamento, dosis, frecuencia |

#### **Notificaciones**
| Tabla | Descripci�n | Campos Principales |
|-------|-------------|-------------------|
| `notificaciones` | Registro de notificaciones enviadas | usuario_id, cita_id, canal, tipo, enviada |

## ?? Enumeraciones del Sistema

### EstadoTurno
- `DISPONIBLE` - Turno disponible para agendar
- `RESERVADO` - Turno ocupado con una cita
- `BLOQUEADO` - Turno no disponible (m�dico no disponible)

### EstadoCita
- `PENDIENTE` - Cita agendada pero no confirmada
- `CONFIRMADA` - Cita confirmada por ambas partes
- `CANCELADA` - Cita cancelada
- `REPROGRAMADA` - Cita reprogramada a otro horario
- `ATENDIDA` - Cita completada
- `NO_ASISTE` - Paciente no asisti� a la cita

### CanalNotificacion
- `CORREO` - Notificaci�n por email
- `SMS` - Notificaci�n por mensaje de texto
- `PUSH` - Notificaci�n push en la app
- `WEBHOOK` - Notificaci�n v�a webhook

### TipoNotificacion
- `CREADA` - Notificaci�n de cita creada
- `CONFIRMADA` - Notificaci�n de cita confirmada
- `CANCELADA` - Notificaci�n de cita cancelada
- `REPROGRAMADA` - Notificaci�n de cita reprogramada

## ?? API Endpoints

### ?? Autenticaci�n (`/api/auth`)

| M�todo | Endpoint | Descripci�n | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ? |
| POST | `/api/auth/login` | Iniciar sesi�n | ? |
| POST | `/api/auth/forgot-password` | Solicitar recuperaci�n de contrase�a | ? |
| POST | `/api/auth/reset-password` | Restablecer contrase�a con c�digo | ? |
| GET | `/api/auth/me` | Obtener informaci�n del usuario actual | ? |

### ????? M�dicos (`/api/doctors`)

| M�todo | Endpoint | Descripci�n | Auth Requerida |
|--------|----------|-------------|----------------|
| GET | `/api/doctors` | Listar todos los m�dicos | ? |
| GET | `/api/doctors/{id}` | Obtener detalle de un m�dico | ? |
| GET | `/api/doctors/{id}/turnos` | Obtener turnos disponibles de un m�dico | ? |
| GET | `/api/doctors/search` | Buscar m�dicos por especialidad, nombre, ubicaci�n | ? |

### ?? Citas (`/api/appointments`)

| M�todo | Endpoint | Descripci�n | Auth Requerida |
|--------|----------|-------------|----------------|
| GET | `/api/appointments` | Listar citas del usuario autenticado | ? |
| GET | `/api/appointments/{id}` | Obtener detalle de una cita | ? |
| POST | `/api/appointments` | Crear una nueva cita | ? |
| PUT | `/api/appointments/{id}` | Actualizar una cita | ? |
| DELETE | `/api/appointments/{id}` | Cancelar una cita | ? |
| PUT | `/api/appointments/{id}/confirm` | Confirmar una cita | ? |

### ?? Email (`/api/email`)

| M�todo | Endpoint | Descripci�n | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/api/email/test` | Enviar email de prueba | ? (Admin) |

### ?? Health Check (`/api/health`)

| M�todo | Endpoint | Descripci�n | Auth Requerida |
|--------|----------|-------------|----------------|
| GET | `/api/health` | Verificar estado de la aplicaci�n y BD | ? |
| GET | `/api/health/database-info` | Informaci�n de la base de datos | ? |
| GET | `/api/health/test-connection` | Probar conexi�n a la base de datos | ? |

## ?? Estructura del Proyecto

```
TuCita/
??? Controllers/
?   ??? Api/
?       ??? AuthController.cs           # Autenticaci�n y recuperaci�n de contrase�a
?       ??? DoctorsController.cs        # Gesti�n de m�dicos
?       ??? AppointmentsController.cs   # Gesti�n de citas
?       ??? EmailController.cs          # Env�o de emails
?       ??? HealthController.cs         # Health checks
?
??? Services/
?   ??? AuthService.cs                  # L�gica de autenticaci�n
?   ??? DoctorsService.cs               # L�gica de m�dicos
?   ??? AppointmentsService.cs          # L�gica de citas
?   ??? EmailService.cs                 # Servicio de env�o de emails
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
?   ?   ?       ??? auth-page.tsx       # P�gina de login/registro
?   ?   ?       ??? forgot-password-page.tsx
?   ?   ?       ??? reset-password-page.tsx
?   ?   ?       ??? search-page.tsx     # B�squeda de m�dicos
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
??? Program.cs                          # Configuraci�n principal
??? appsettings.json                    # Configuraci�n de la aplicaci�n
??? .env                                # Variables de entorno
??? TuCita.csproj                       # Archivo del proyecto
```

## ??? Tecnolog�as y Paquetes

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

## ?? Configuraci�n e Instalaci�n

### Prerrequisitos
- .NET 8 SDK
- Node.js 18+
- MySQL 8.0
- Visual Studio 2022 o VS Code

### Variables de Entorno (.env)

Crear un archivo `.env` en la ra�z del proyecto:

```env
# Database Configuration (DigitalOcean)
DB_SERVER=tu-servidor.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=tco_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contrase�a_segura

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

### Instalaci�n

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

6. **Ejecutar la aplicaci�n**
```bash
dotnet run
```

La aplicaci�n estar� disponible en:
- Backend API: `https://localhost:7089`
- Frontend: `http://localhost:3000` (Vite dev server)

## ?? Estado del Proyecto

### ? Funcionalidades Implementadas

#### Autenticaci�n y Seguridad
- [x] Registro de usuarios (pacientes)
- [x] Login con JWT
- [x] Recuperaci�n de contrase�a por email
- [x] Reset de contrase�a con c�digo de seguridad
- [x] Protecci�n de rutas con JWT
- [x] Sistema de roles (Admin, M�dico, Paciente)
- [x] Hash de contrase�as con BCrypt

#### Gesti�n de M�dicos
- [x] Listado de m�dicos
- [x] Detalle de m�dico con especialidades
- [x] B�squeda de m�dicos
- [x] Visualizaci�n de turnos disponibles
- [x] Perfiles de m�dico con ubicaci�n GPS

#### Gesti�n de Citas
- [x] Creaci�n de citas
- [x] Listado de citas del usuario
- [x] Actualizaci�n de citas
- [x] Cancelaci�n de citas
- [x] Estados de citas (Pendiente, Confirmada, etc.)
- [x] Agenda de turnos

#### Sistema de Notificaciones
- [x] Servicio de email con SMTP
- [x] Plantillas HTML para emails
- [x] Email de recuperaci�n de contrase�a
- [x] Sistema de notificaciones (estructura BD)

#### Base de Datos
- [x] Modelo completo de datos
- [x] Migraciones de Entity Framework
- [x] Inicializaci�n de datos (roles, especialidades)
- [x] �ndices y restricciones
- [x] Relaciones entre entidades

#### Frontend
- [x] Interfaz de login/registro
- [x] P�gina de recuperaci�n de contrase�a
- [x] P�gina de b�squeda de m�dicos
- [x] P�gina de gesti�n de citas
- [x] Integraci�n con API backend
- [x] Manejo de autenticaci�n con tokens

### ?? En Desarrollo

#### Gesti�n Cl�nica
- [ ] Creaci�n de notas cl�nicas
- [ ] Registro de diagn�sticos
- [ ] Emisi�n de recetas m�dicas
- [ ] Historial m�dico del paciente

#### Notificaciones
- [ ] Env�o autom�tico de emails de confirmaci�n
- [ ] Recordatorios de citas por email
- [ ] Notificaciones push
- [ ] Integraci�n con SMS

#### Panel de Administraci�n
- [ ] Dashboard administrativo
- [ ] Gesti�n de usuarios
- [ ] Gesti�n de m�dicos y especialidades
- [ ] Reportes y estad�sticas

#### Mejoras Frontend
- [ ] Dashboard del paciente
- [ ] Dashboard del m�dico
- [ ] Calendario interactivo
- [ ] Chat en tiempo real (m�dico-paciente)
- [ ] Sistema de valoraciones y rese�as

### ?? Pendiente

#### Caracter�sticas Avanzadas
- [ ] Videoconsultas (integraci�n WebRTC)
- [ ] Pagos en l�nea
- [ ] Historia cl�nica digital completa
- [ ] Integraci�n con sistemas de salud
- [ ] App m�vil (React Native)
- [ ] Sistema de recordatorios autom�ticos
- [ ] Exportaci�n de informes m�dicos (PDF)
- [ ] Soporte multiidioma
- [ ] Tema oscuro/claro

#### Seguridad y Cumplimiento
- [ ] Autenticaci�n de dos factores (2FA)
- [ ] Auditor�a de accesos
- [ ] Cumplimiento HIPAA
- [ ] Encriptaci�n de datos sensibles
- [ ] Backup autom�tico

#### Optimizaciones
- [ ] Cach� de datos frecuentes (Redis)
- [ ] Optimizaci�n de consultas a BD
- [ ] Lazy loading de componentes
- [ ] Progressive Web App (PWA)
- [ ] Tests unitarios y de integraci�n

## ?? Migraciones de Base de Datos

### Migraciones Aplicadas

1. **InitialCreate** (2024-10-04)
   - Creaci�n inicial de todas las tablas
   - Definici�n de relaciones y restricciones
   - �ndices �nicos en campos clave

2. **RemoveSedeReferences** (2024-10-06)
   - Eliminaci�n de referencias a sedes m�dicas
   - Simplificaci�n del modelo de ubicaci�n

3. **AddPasswordResetToken** (2024-10-06)
   - Agregado de campos para recuperaci�n de contrase�a
   - `token_recuperacion` y `token_recuperacion_expira` en tabla usuarios

### Crear Nueva Migraci�n

```bash
dotnet ef migrations add NombreDeLaMigracion
dotnet ef database update
```

### Revertir Migraci�n

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

## ?? Configuraci�n de Email

### Gmail SMTP
1. Habilitar autenticaci�n de dos factores en tu cuenta de Gmail
2. Generar una contrase�a de aplicaci�n en: https://myaccount.google.com/apppasswords
3. Usar esa contrase�a en `EMAIL_PASSWORD` en el archivo `.env`

## ?? Seguridad

- Contrase�as hasheadas con BCrypt (factor de trabajo: 11)
- Autenticaci�n JWT con tokens de corta duraci�n
- HTTPS requerido en producci�n
- Validaci�n de datos en backend y frontend
- Protecci�n contra SQL Injection (Entity Framework)
- Sanitizaci�n de inputs
- Tokens de recuperaci�n con expiraci�n (15 minutos)

## ?? Contribuci�n

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ?? Licencia

Este proyecto es privado y de uso educativo.

## ?? Autor

- **Rub�n Coto** - [@rubencoto](https://github.com/rubencoto)
- **Iann Calderon 
- ** Jesus Alvarado


---

? **Nota**: Este proyecto est� en desarrollo activo. Las funcionalidades y la estructura pueden cambiar.
