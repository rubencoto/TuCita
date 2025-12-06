# ?? TuCita - Sistema de Gestión de Citas Médicas Online

Sistema completo de gestión de citas médicas que conecta pacientes con doctores, permitiendo agendar, confirmar y gestionar citas de manera eficiente.

## ?? URLs

- **Producción**: https://www.tucitaonline.org
- **Staging**: https://tucita-app.herokuapp.com
- **Desarrollo**: http://localhost:5000

## ?? Despliegue Rápido a Heroku

### ? Opción Super Rápida (Windows)

```batch
# 1. Ejecuta el script automático (primera vez)
deploy-to-heroku.bat

# 2. Cuando termine, despliega
git add .
git commit -m "Deploy inicial"
git push heroku master

# 3. Verifica el despliegue
verify-deployment.bat
```

### ?? Actualizar Aplicación (después del primer despliegue)

```batch
# Opción 1: Script automático
update-app.bat

# Opción 2: Manual
git add .
git commit -m "Descripción de cambios"
git push heroku master
```

**?? NO necesitas saber Docker.** Todo es automático.

---

### ?? Documentación Completa

**?? Ver índice completo:** [`INDICE-DOCUMENTACION.md`](INDICE-DOCUMENTACION.md)

#### Documentos Principales

| Documento | Descripción | Para Quién |
|-----------|-------------|------------|
| **[GUIA-SIMPLE-HEROKU.md](GUIA-SIMPLE-HEROKU.md)** | ?? Guía paso a paso | **EMPIEZA AQUÍ** |
| **[CHEATSHEET.md](CHEATSHEET.md)** | Comandos rápidos visuales | Referencia diaria |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guía técnica completa | Usuarios avanzados |
| **[DOMAIN-SETUP.md](DOMAIN-SETUP.md)** | Configurar dominio | Configuración DNS |
| **[ROUTING.md](ROUTING.md)** | Arquitectura de routing | Desarrolladores |
| **[QUICK-COMMANDS.md](QUICK-COMMANDS.md)** | Referencia de comandos | Troubleshooting |
| **[ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md)** | Organización de archivos | Todos |

**?? Ruta recomendada:** README ? GUIA-SIMPLE-HEROKU ? CHEATSHEET

---

## ?? Características Principales

### Para Pacientes
- ? Registro y autenticación segura
- ? Búsqueda de doctores por especialidad
- ? Agenda de citas en línea
- ? Gestión de citas (ver, cancelar, reagendar)
- ? Historial médico personal
- ? Notificaciones por email
- ? Perfil personalizable

### Para Doctores
- ? Dashboard con métricas de citas
- ? Gestión de disponibilidad (slots semanales)
- ? Configuración de horarios
- ? Gestión de citas de pacientes
- ? Acceso a historial médico de pacientes
- ? Confirmación/rechazo de citas
- ? Perfil profesional con especialidades

### Para Administradores
- ? Panel de administración completo
- ? Gestión de usuarios (pacientes, doctores, admins)
- ? Gestión de especialidades médicas
- ? Métricas y reportes del sistema
- ? Gestión de citas globales
- ? Dashboard con estadísticas en tiempo real

## ??? Tecnologías

### Backend
- **.NET 8** (ASP.NET Core Web API)
- **Entity Framework Core** (ORM)
- **SQL Server** (AWS RDS)
- **JWT** (Autenticación)
- **AWS S3** (Almacenamiento de archivos)
- **BCrypt** (Hash de contraseñas)

### Frontend
- **React 18** (TypeScript)
- **Vite** (Build tool)
- **Tailwind CSS** (Estilos)
- **Radix UI** (Componentes UI)
- **Axios** (HTTP client)
- **Recharts** (Gráficas)
- **Lucide React** (Iconos)

### DevOps
- **Heroku** (Hosting)
- **Docker** (Containerización)
- **GitHub** (Control de versiones)
- **GitHub Actions** (CI/CD - futuro)

## ?? Estructura del Proyecto

```
TuCita/
??? TuCita/                          # Backend (.NET)
?   ??? Controllers/                 # API Controllers
?   ?   ??? Api/
?   ??? Data/                        # DbContext y configuración de BD
?   ??? DTOs/                        # Data Transfer Objects
?   ??? Middleware/                  # Middleware personalizado
?   ??? Models/                      # Modelos de base de datos
?   ??? Services/                    # Lógica de negocio
?   ??? ClientApp/                   # Frontend (React)
?   ?   ??? src/
?   ?   ?   ??? components/         # Componentes React
?   ?   ?   ?   ??? layout/         # Layout (Navbar, Footer)
?   ?   ?   ?   ??? pages/          # Páginas principales
?   ?   ?   ?   ??? ui/             # Componentes UI reutilizables
?   ?   ?   ?   ??? doctor/         # Componentes específicos de doctores
?   ?   ?   ??? services/           # Servicios API (Axios)
?   ?   ?   ?   ??? api/
?   ?   ?   ??? lib/                # Utilidades
?   ?   ?   ??? App.tsx             # Componente principal
?   ?   ??? public/                 # Archivos estáticos
?   ?   ??? package.json
?   ?   ??? vite.config.ts
?   ??? appsettings.json
?   ??? appsettings.Production.json
?   ??? Program.cs
??? Dockerfile                       # Configuración Docker
??? heroku.yml                       # Configuración Heroku
??? Procfile                         # Proceso de Heroku
??? DEPLOYMENT.md                    # Guía de despliegue
??? DOMAIN-SETUP.md                  # Guía de configuración de dominio
??? ROUTING.md                       # Documentación de routing
??? setup-heroku.sh                  # Script de configuración
??? README.md                        # Este archivo
```

## ?? Inicio Rápido

### Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server) o AWS RDS
- [Git](https://git-scm.com/)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/rubencoto/TuCita.git
cd TuCita
```

2. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto TuCita
cp .env.example .env

# Editar .env con tus credenciales
# DB_SERVER=tu-servidor-sql
# DB_NAME=tco_db
# DB_USER=tu-usuario
# DB_PASSWORD=tu-contraseña
# JWT_KEY=tu-clave-secreta-minimo-32-caracteres
# AWS_ACCESS_KEY_ID=tu-aws-key
# AWS_SECRET_ACCESS_KEY=tu-aws-secret
```

3. **Instalar dependencias del frontend**
```bash
cd TuCita/ClientApp
npm install
cd ../..
```

4. **Ejecutar la aplicación**
```bash
cd TuCita
dotnet run
```

La aplicación estará disponible en:
- Backend: https://localhost:7164
- Frontend (proxy): http://localhost:3000

### Desarrollo

**Backend (ASP.NET Core)**
```bash
cd TuCita
dotnet watch run
```

**Frontend (Vite)**
```bash
cd TuCita/ClientApp
npm run dev
```

## ?? Despliegue en Heroku

Ver la guía completa en [DEPLOYMENT.md](DEPLOYMENT.md)

### Resumen Rápido

```bash
# 1. Ejecutar script de configuración
chmod +x setup-heroku.sh
./setup-heroku.sh tucita-app

# 2. Desplegar
git push heroku master

# 3. Verificar
heroku open -a tucita-app
heroku logs --tail -a tucita-app
```

## ?? Configuración de Dominio

Ver la guía completa en [DOMAIN-SETUP.md](DOMAIN-SETUP.md)

### Pasos Rápidos

1. Agregar dominio a Heroku:
```bash
heroku domains:add www.tucitaonline.org -a tucita-app
```

2. Configurar DNS CNAME:
```
Host: www
Value: [DNS target de Heroku]
```

3. Esperar propagación DNS (24-48 horas)
4. SSL se activará automáticamente

## ?? Documentación Adicional

- [?? Guía de Despliegue](DEPLOYMENT.md)
- [?? Configuración de Dominio](DOMAIN-SETUP.md)
- [?? Routing y Navegación](ROUTING.md)
- [????? Documentación del Backend](TuCita/ClientApp/src/components/doctor/BACKEND_STATUS.md)
- [?? Guía de Testing](TuCita/ClientApp/src/components/doctor/TESTING_GUIDE.md)

## ?? Seguridad

- ? Autenticación JWT
- ? Contraseñas hasheadas con BCrypt
- ? HTTPS forzado en producción
- ? Validación de datos en backend y frontend
- ? Protección contra SQL Injection (EF Core)
- ? CORS configurado
- ? Variables sensibles en entorno

## ?? Base de Datos

### Entidades Principales

- **Usuario**: Usuarios del sistema (base)
- **PerfilPaciente**: Perfil de pacientes
- **PerfilMedico**: Perfil de doctores
- **Especialidad**: Especialidades médicas
- **Cita**: Citas médicas
- **Turno**: Slots de disponibilidad de doctores
- **HistorialMedico**: Historial médico de pacientes
- **Documento**: Documentos adjuntos

### Diagrama ER

```
Usuario (1) ??? (0,1) PerfilPaciente
Usuario (1) ??? (0,1) PerfilMedico
PerfilMedico (*) ??? (*) Especialidad
PerfilPaciente (1) ??? (*) Cita
PerfilMedico (1) ??? (*) Cita
PerfilMedico (1) ??? (*) Turno
Cita (1) ??? (*) HistorialMedico
HistorialMedico (1) ??? (*) Documento
```

## ?? Testing

```bash
# Backend tests (futuro)
cd TuCita
dotnet test

# Frontend tests (futuro)
cd TuCita/ClientApp
npm test
```

## ?? Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ?? Licencia

Este proyecto es privado y propiedad de sus creadores.

## ?? Equipo

- **Desarrollo Backend**: .NET Team
- **Desarrollo Frontend**: React Team
- **DevOps**: Infrastructure Team

## ?? Soporte

Para problemas o preguntas:
- ?? Email: soporte@tucitaonline.org
- ?? Issues: [GitHub Issues](https://github.com/rubencoto/TuCita/issues)

## ?? Actualizaciones

Ver [CHANGELOG.md](CHANGELOG.md) para el historial de cambios (futuro).

## ?? Roadmap

- [ ] Implementar notificaciones push
- [ ] Sistema de valoraciones de doctores
- [ ] Chat en tiempo real (SignalR)
- [ ] App móvil (React Native)
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Pagos en línea
- [ ] Videollamadas para consultas virtuales
- [ ] Sistema de recordatorios SMS

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Estado**: En producción ??
