# ?? TuCita - Dockerización Completada

## ? Archivos Creados

Se han creado exitosamente todos los archivos necesarios para dockerizar tu aplicación TuCita:

### Archivos Docker
- ? `Dockerfile` - Imagen de producción (multi-stage build)
- ? `Dockerfile.dev` - Imagen de desarrollo con hot reload
- ? `docker-compose.yml` - Orquestación para producción
- ? `docker-compose.dev.yml` - Orquestación para desarrollo
- ? `.dockerignore` - Archivos excluidos del contexto Docker

### Archivos de Configuración
- ? `.env.example` - Plantilla de variables de entorno
- ? `.gitignore` (actualizado) - Protección de archivos sensibles

### Documentación
- ? `DOCKER.md` - Guía completa de Docker
- ? `README-DOCKER.md` - Resumen ejecutivo de Docker
- ? `EMAIL-SETUP.md` - Guía para configurar Gmail SMTP

### Scripts de Utilidad
- ? `docker-helper.ps1` - Script interactivo para Windows
- ? `docker-helper.sh` - Script interactivo para Linux/Mac

## ?? Pasos Siguientes

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores
# Windows: notepad .env
# Linux/Mac: nano .env
```

**Variables críticas a configurar:**

```env
# Base de Datos
SQL_PASSWORD=TuCita@2025!Secure  # Cambiar a una contraseña segura

# JWT (Seguridad)
JWT_KEY=<generar-clave-segura-32-caracteres>

# Email (Gmail)
EMAIL_USERNAME=tu-email@gmail.com
EMAIL_PASSWORD=<app-password-16-caracteres>
```

### 2. Generar JWT Key Segura

**Windows (PowerShell)**:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Linux/Mac**:
```bash
openssl rand -base64 32
```

### 3. Configurar Gmail (Opcional pero recomendado)

Sigue la guía en `EMAIL-SETUP.md` para configurar el servicio de email:
1. Habilitar verificación en 2 pasos en Gmail
2. Crear App Password
3. Configurar variables de email en `.env`

### 4. Ejecutar la Aplicación

**Opción A: Scripts de Ayuda (Recomendado)**

**Windows**:
```powershell
.\docker-helper.ps1
```

**Linux/Mac**:
```bash
chmod +x docker-helper.sh
./docker-helper.sh
```

**Opción B: Comandos Manuales**

```bash
# Construir las imágenes
docker-compose build

# Iniciar la aplicación
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### 5. Acceder a la Aplicación

Una vez iniciada, la aplicación estará disponible en:
- **Web**: http://localhost:5000
- **SQL Server**: localhost:1433

## ?? Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f tucita-app

# Reiniciar un servicio
docker-compose restart tucita-app

# Acceder al contenedor
docker-compose exec tucita-app bash

# Aplicar migraciones
docker-compose exec tucita-app dotnet ef database update
```

## ?? Seguridad

### ?? IMPORTANTE: Nunca subas estos archivos a Git

- `.env` - Variables de entorno
- `backups/*.bak` - Backups de la base de datos

### ? Archivos que SÍ debes subir

- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `.dockerignore`
- `.env.example` (sin valores reales)
- Todos los archivos de documentación

## ??? Estructura del Proyecto

```
TuCita/
??? TuCita/                       # Backend ASP.NET Core
?   ??? ClientApp/                # Frontend React + Vite
?   ??? Controllers/              # API Controllers
?   ??? Services/                 # Business Logic
?   ??? ...
??? TuCita.Shared/                # DTOs compartidos
??? TuCita.Desktop/               # Aplicación Desktop WPF
??? Dockerfile                    # Imagen de producción
??? Dockerfile.dev                # Imagen de desarrollo
??? docker-compose.yml            # Orquestación producción
??? docker-compose.dev.yml        # Orquestación desarrollo
??? .dockerignore                 # Exclusiones Docker
??? .env.example                  # Plantilla de configuración
??? DOCKER.md                     # Guía completa
??? README-DOCKER.md              # Resumen ejecutivo
??? EMAIL-SETUP.md                # Guía de email
??? docker-helper.ps1             # Script Windows
??? docker-helper.sh              # Script Linux/Mac
```

## ?? Flujo de Trabajo Recomendado

### Desarrollo Local
1. Usa `docker-compose.dev.yml` para hot reload
2. Edita código en tu IDE favorito
3. Los cambios se reflejan automáticamente

### Producción
1. Configura variables de entorno en `.env`
2. Usa `docker-compose.yml` para deploy
3. Configura backup automático de la BD

## ?? Documentación

- [DOCKER.md](./DOCKER.md) - Guía completa con troubleshooting
- [README-DOCKER.md](./README-DOCKER.md) - Resumen ejecutivo
- [EMAIL-SETUP.md](./EMAIL-SETUP.md) - Configuración de email

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
```bash
# Ver logs
docker-compose logs sqlserver

# Verificar password cumple requisitos (8+ chars, mayús, minús, números, especiales)
```

### No se conecta a la BD
```bash
# Verificar health check
docker-compose ps

# Probar conexión
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "TuPassword!" -Q "SELECT 1"
```

## ?? Soporte

Si encuentras problemas:

1. Revisa [DOCKER.md](./DOCKER.md) para troubleshooting detallado
2. Verifica los logs: `docker-compose logs -f`
3. Consulta la documentación de Docker
4. Abre un issue en GitHub

## ?? Recursos de Aprendizaje

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [ASP.NET Core Docker](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)
- [SQL Server on Docker](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker)

## ? Próximos Pasos

1. **Desarrollo**: Prueba la aplicación localmente con Docker
2. **Producción**: Configura CI/CD para deploy automático
3. **Monitoreo**: Agrega logs y métricas con herramientas como Prometheus
4. **Escalabilidad**: Considera Kubernetes para producción

---

## ?? Checklist de Implementación

- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar variables de entorno
- [ ] Generar JWT_KEY segura
- [ ] Configurar Gmail App Password (opcional)
- [ ] Ejecutar `docker-compose build`
- [ ] Ejecutar `docker-compose up -d`
- [ ] Verificar http://localhost:5000
- [ ] Aplicar migraciones de BD
- [ ] Probar funcionalidad de email
- [ ] Configurar backup automático
- [ ] Documentar configuraciones específicas de tu entorno

---

**¡Tu aplicación TuCita ahora está completamente dockerizada!** ??

Para cualquier pregunta o problema, consulta la documentación o abre un issue en GitHub.

---

*Desarrollado con ?? por el equipo de TuCita*
