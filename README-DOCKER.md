# ?? TuCita - Dockerizado

Este proyecto ahora incluye soporte completo para Docker, permitiendo ejecutar toda la aplicación (Backend .NET 8 + Frontend React + SQL Server) en contenedores.

## ?? Contenido

- **Backend**: ASP.NET Core 8 API
- **Frontend**: React 18 + Vite + TypeScript
- **Base de Datos**: SQL Server 2022
- **Contenedorización**: Docker + Docker Compose

## ?? Inicio Rápido

### Opción 1: Scripts de Ayuda (Recomendado)

**Windows (PowerShell)**:
```powershell
.\docker-helper.ps1
```

**Linux/Mac**:
```bash
chmod +x docker-helper.sh
./docker-helper.sh
```

### Opción 2: Comandos Manuales

1. **Copiar variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env con tus valores
   ```

2. **Construir y ejecutar**:
   ```bash
   docker-compose up -d
   ```

3. **Acceder a la aplicación**:
   - Web: http://localhost:5000
   - SQL Server: localhost:1433

## ?? Estructura de Archivos Docker

```
TuCita/
??? Dockerfile                    # Imagen de producción (multi-stage)
??? Dockerfile.dev                # Imagen de desarrollo (hot reload)
??? docker-compose.yml            # Configuración de producción
??? docker-compose.dev.yml        # Configuración de desarrollo
??? .dockerignore                 # Archivos excluidos del build
??? .env.example                  # Plantilla de variables de entorno
??? DOCKER.md                     # Guía completa de Docker
??? docker-helper.ps1             # Script de ayuda (Windows)
??? docker-helper.sh              # Script de ayuda (Linux/Mac)
```

## ?? Variables de Entorno Importantes

Edita el archivo `.env` con estos valores:

```env
# Base de Datos
SQL_PASSWORD=TuCita@2025!Secure
DB_NAME=TuCitaDb

# JWT (Seguridad)
JWT_KEY=tu-clave-secreta-minimo-32-caracteres
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaApp

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-16-chars
```

## ?? Comandos Útiles

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f tucita-app

# Detener
docker-compose down

# Reiniciar un servicio
docker-compose restart tucita-app

# Limpiar todo (¡CUIDADO!)
docker-compose down -v
```

## ?? Migraciones de Entity Framework

```bash
# Aplicar migraciones
docker-compose exec tucita-app dotnet ef database update

# Crear nueva migración (desde el host)
cd TuCita
dotnet ef migrations add NombreMigracion
```

## ??? Backup de Base de Datos

```bash
# Crear backup
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword!" \
  -Q "BACKUP DATABASE TuCitaDb TO DISK = '/var/opt/mssql/backup/TuCitaDb.bak'"

# Copiar al host
docker cp tucita-sqlserver:/var/opt/mssql/backup/TuCitaDb.bak ./backups/
```

## ?? Seguridad

### ?? IMPORTANTE: Nunca subas estos archivos a Git

- `.env` - Variables de entorno con credenciales
- `backups/*.bak` - Backups de la base de datos
- `backups/*.sql` - Scripts SQL con datos

### Generar JWT_KEY Segura

**Linux/Mac**:
```bash
openssl rand -base64 32
```

**Windows (PowerShell)**:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## ?? Despliegue en Producción

### Azure Container Registry

```bash
# Login
az acr login --name <tu-registro>

# Build y push
docker build -t <tu-registro>.azurecr.io/tucita-app:latest .
docker push <tu-registro>.azurecr.io/tucita-app:latest
```

### Docker Hub

```bash
# Login
docker login

# Build y push
docker build -t <tu-usuario>/tucita-app:latest .
docker push <tu-usuario>/tucita-app:latest
```

## ?? Solución de Problemas

### Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### SQL Server no inicia

Verificar que la contraseña cumpla los requisitos:
- Mínimo 8 caracteres
- Mayúsculas y minúsculas
- Números y caracteres especiales

```bash
docker-compose logs sqlserver
```

### No se conecta a la BD

```bash
# Verificar health check
docker-compose ps

# Probar conexión manualmente
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword!" -Q "SELECT 1"
```

## ?? Documentación Adicional

- [DOCKER.md](./DOCKER.md) - Guía completa de Docker
- [README.md](./README.md) - Documentación principal del proyecto

## ?? Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Consulta [DOCKER.md](./DOCKER.md)
3. Abre un issue en GitHub

---

**Desarrollado con ?? usando Docker** ??
