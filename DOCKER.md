# ==================================================
# TuCita - Guía Rápida de Docker
# ==================================================

## ?? Requisitos Previos

1. **Instalar Docker Desktop**
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: https://docs.docker.com/engine/install/

2. **Verificar instalación**
   ```bash
   docker --version
   docker-compose --version
   ```

## ?? Inicio Rápido - Producción

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y edita los valores:

```bash
cp .env.example .env
```

**Importante**: Cambia estos valores en `.env`:
- `SQL_PASSWORD`: Contraseña segura para SQL Server
- `JWT_KEY`: Clave secreta para JWT (mínimo 32 caracteres)
- `EMAIL_USERNAME` y `EMAIL_PASSWORD`: Credenciales de email

### 2. Construir y Ejecutar

```bash
# Construir las imágenes
docker-compose build

# Iniciar los contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f tucita-app
```

### 3. Acceder a la Aplicación

- **Aplicación Web**: http://localhost:5000
- **SQL Server**: localhost:1433

### 4. Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart tucita-app

# Ejecutar comando en el contenedor
docker-compose exec tucita-app bash
```

## ?? Desarrollo Local

### 1. Usar Docker Compose para Desarrollo

```bash
# Iniciar en modo desarrollo (con hot reload)
docker-compose -f docker-compose.dev.yml up

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 2. Desarrollo Híbrido (Docker solo para BD)

Si prefieres ejecutar la app localmente pero usar Docker solo para SQL Server:

```bash
# Iniciar solo SQL Server
docker-compose up sqlserver -d

# Ejecutar la app con .NET CLI
cd TuCita
dotnet run
```

## ?? Aplicar Migraciones

### Opción 1: Desde el Host (Requiere .NET SDK)

```bash
cd TuCita
dotnet ef database update
```

### Opción 2: Desde el Contenedor

```bash
docker-compose exec tucita-app dotnet ef database update --project /app/TuCita.csproj
```

## ?? Seguridad en Producción

### 1. Variables de Entorno Sensibles

**NUNCA** subas el archivo `.env` a Git. Usa Docker Secrets o variables de entorno del servidor.

### 2. Generar JWT_KEY Segura

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell (Windows)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Contraseña de SQL Server

Debe cumplir con los requisitos de SQL Server:
- Mínimo 8 caracteres
- Mayúsculas y minúsculas
- Números
- Caracteres especiales

## ?? Configuración de Email (Gmail)

### 1. Crear App Password en Gmail

1. Ir a https://myaccount.google.com/apppasswords
2. Crear nueva contraseña de aplicación
3. Copiar el código de 16 caracteres
4. Usar en `EMAIL_PASSWORD` del archivo `.env`

### 2. Variables de Email

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=tu-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16 caracteres
EMAIL_FROM=noreply@tucita.com
EMAIL_FROM_NAME=TuCita Sistema de Citas
```

## ??? Backup y Restauración

### Backup de la Base de Datos

```bash
# Crear directorio para backups
mkdir -p ./backups

# Hacer backup
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword123!" \
  -Q "BACKUP DATABASE TuCitaDb TO DISK = '/var/opt/mssql/backup/TuCitaDb.bak'"

# Copiar backup al host
docker cp tucita-sqlserver:/var/opt/mssql/backup/TuCitaDb.bak ./backups/
```

### Restaurar Base de Datos

```bash
# Copiar backup al contenedor
docker cp ./backups/TuCitaDb.bak tucita-sqlserver:/var/opt/mssql/backup/

# Restaurar
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword123!" \
  -Q "RESTORE DATABASE TuCitaDb FROM DISK = '/var/opt/mssql/backup/TuCitaDb.bak' WITH REPLACE"
```

## ?? Solución de Problemas

### Error: Puerto 1433 o 5000 ya en uso

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Error: SQL Server no inicia

Verifica que la contraseña cumpla los requisitos:

```bash
docker-compose logs sqlserver
```

### Error: Frontend no compila

```bash
# Limpiar node_modules y reinstalar
cd TuCita/ClientApp
rm -rf node_modules package-lock.json
npm install
```

### Error: No se conecta a la BD

1. Verificar que SQL Server esté running:
   ```bash
   docker-compose ps
   ```

2. Verificar health check:
   ```bash
   docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P "TuPassword123!" \
     -Q "SELECT 1"
   ```

3. Verificar variables de entorno:
   ```bash
   docker-compose exec tucita-app env | grep DB_
   ```

## ?? Despliegue en Producción

### Azure Container Registry (ACR)

```bash
# Login a Azure
az login
az acr login --name <tu-registro>

# Tag y push
docker tag tucita-app:latest <tu-registro>.azurecr.io/tucita-app:latest
docker push <tu-registro>.azurecr.io/tucita-app:latest
```

### Docker Hub

```bash
# Login
docker login

# Tag y push
docker tag tucita-app:latest <tu-usuario>/tucita-app:latest
docker push <tu-usuario>/tucita-app:latest
```

## ?? Referencias

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [SQL Server on Docker](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker)
- [ASP.NET Core Docker](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)

## ?? Obtener Ayuda

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el health check: `docker-compose ps`
3. Consulta esta guía
4. Abre un issue en el repositorio

---

**¡Listo para producción!** ??
