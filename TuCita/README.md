# TuCita - Sistema de Gestión de Citas Médicas

Aplicación web fullstack para gestión de citas médicas construida con ASP.NET Core 8 y React + Vite.

## ?? Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- SQL Server o Azure SQL Database
- Cuenta de AWS SES (para envío de emails)

## ?? Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/rubencoto/TuCita.git
cd TuCita
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el template de variables de entorno
cp TuCita/.env.example TuCita/.env

# Editar .env con tus credenciales reales
# IMPORTANTE: Nunca subir el archivo .env a Git
```

### 3. Configurar Base de Datos

#### Azure SQL Database
1. Crear una base de datos en Azure Portal
2. Configurar reglas de firewall para permitir tu IP
3. Actualizar las credenciales en `.env`:
```
DB_SERVER=tu_servidor.database.windows.net
DB_NAME=tu_base_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 4. Configurar AWS SES para Emails
1. Verificar tu dominio o email en AWS SES
2. Generar credenciales SMTP en IAM
3. Actualizar en `.env`:
```
SMTP_USERNAME=tu_usuario_smtp
SMTP_PASSWORD=tu_password_smtp
DEFAULT_SENDER=tu_email_verificado@dominio.com
```

### 5. Instalar Dependencias

#### Backend (.NET)
```bash
cd TuCita
dotnet restore
```

#### Frontend (React + Vite)
```bash
cd ClientApp
npm install
```

## ?? Ejecutar la Aplicación

### Modo Desarrollo

#### Opción 1: Ejecución Automática (Recomendado)
```bash
cd TuCita
dotnet run
```
Esto iniciará automáticamente:
- Backend en `https://localhost:7063`
- Frontend Vite en `http://localhost:3000`

#### Opción 2: Ejecución Manual
Terminal 1 - Backend:
```bash
cd TuCita
dotnet run
```

Terminal 2 - Frontend:
```bash
cd ClientApp
npm run dev
```

### Modo Producción
```bash
cd ClientApp
npm run build

cd ..
dotnet publish -c Release
```

## ?? Estructura del Proyecto

```
TuCita/
??? TuCita/                      # Backend ASP.NET Core
?   ??? Controllers/             # API Controllers
?   ??? Services/                # Business Logic
?   ??? Data/                    # Entity Framework Context
?   ??? Models/                  # Data Models
?   ??? .env                     # Variables de entorno (NO SUBIR A GIT)
?   ??? Program.cs               # Configuración principal
?
??? ClientApp/                   # Frontend React + Vite
?   ??? src/
?   ?   ??? components/          # Componentes React
?   ?   ??? pages/               # Páginas de la aplicación
?   ?   ??? services/            # API Services
?   ?   ??? App.jsx              # Componente raíz
?   ??? package.json
?   ??? vite.config.js
?
??? README.md
```

## ?? Seguridad

- ? El archivo `.env` está en `.gitignore` - **nunca debe subirse a Git**
- ? Usa variables de entorno para todas las credenciales sensibles
- ? Autenticación JWT para proteger las APIs
- ? Conexión encriptada a Azure SQL Database
- ? CORS configurado correctamente

### ?? Rotar Credenciales

Si accidentalmente expones credenciales:

1. **AWS SES**: Eliminar y regenerar Access Keys en IAM
2. **Azure SQL**: Cambiar contraseña en Azure Portal
3. **JWT**: Generar nueva clave secreta (PowerShell):
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## ?? Migraciones de Base de Datos

```bash
# Crear una nueva migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones pendientes
dotnet ef database update

# Revertir última migración
dotnet ef migrations remove
```

## ?? Funcionalidades Principales

- ? Autenticación y autorización con JWT
- ? Gestión de usuarios (Pacientes, Doctores, Administradores)
- ? Sistema de citas médicas
- ? Historial médico de pacientes
- ? Notificaciones por email (AWS SES)
- ? Panel de administración
- ? Interfaz responsive con React

## ??? Tecnologías Utilizadas

### Backend
- ASP.NET Core 8
- Entity Framework Core (SQL Server)
- JWT Authentication
- AWS SES (SMTP)

### Frontend
- React 18
- Vite
- React Router
- Axios
- Bootstrap / Tailwind (según configuración)

## ?? Licencia

[Especificar licencia]

## ?? Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## ?? Contacto

Rubén Coto - [GitHub](https://github.com/rubencoto)

---

?? **Recordatorio**: Nunca subas archivos `.env` con credenciales reales a repositorios públicos.
