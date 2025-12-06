# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2024-01-XX - Preparación para Producción

### ?? Agregado
- Configuración completa para despliegue en Heroku
- Dockerfile multi-stage optimizado para producción
- `heroku.yml` para configuración de contenedor
- `Procfile` para definir proceso web
- `.dockerignore` para optimizar builds
- `appsettings.Production.json` con configuración de producción
- Scripts de Windows para automatización:
  - `deploy-to-heroku.bat` - Setup inicial completo
  - `update-app.bat` - Actualización rápida
  - `verify-deployment.bat` - Verificación post-despliegue
- Documentación completa:
  - `GUIA-SIMPLE-HEROKU.md` - Guía para principiantes
  - `DEPLOYMENT.md` - Guía técnica completa
  - `DOMAIN-SETUP.md` - Configuración de dominio
  - `ROUTING.md` - Documentación de routing
  - `QUICK-COMMANDS.md` - Comandos útiles
  - `CHEATSHEET.md` - Referencia visual rápida
  - `ESTRUCTURA-PROYECTO.md` - Organización de archivos
  - `INDICE-DOCUMENTACION.md` - Índice maestro de documentación
  - `RESUMEN-LIMPIEZA.md` - Estado actual del proyecto
- `.env.example` con plantilla de variables de entorno
- Soporte para puerto dinámico de Heroku en `Program.cs`
- AllowedHosts configurado para `www.tucitaonline.org`

### ?? Modificado
- `Program.cs` actualizado para soportar:
  - Puerto dinámico de Heroku (`$PORT`)
  - Carga condicional de `.env` (solo en desarrollo)
  - Logging mejorado para producción
  - Desactivación de HTTPS redirect en producción (proxy de Heroku)
- Optimización de builds del frontend con Vite
- Configuración de SSL/HTTPS automático con Heroku ACM
- README actualizado con instrucciones simplificadas
- `.gitignore` limpiado de referencias a AWS Amplify

### ??? Removido
- `Procfile.buildpack` - No necesario con Docker
- `setup-heroku.sh` - Reemplazado por scripts de Windows
- `DOCKER-ALTERNATIVE.md` - Información redundante
- Archivos de AWS Amplify:
  - `TuCita/ClientApp/amplify.yml`
  - `TuCita/ClientApp/AWS_AMPLIFY_DEPLOY.md`
  - `TuCita/ClientApp/DEPLOY_AWS_AMPLIFY.md`
- Referencias a AWS Amplify en `.gitignore`

### ?? Seguridad
- Variables sensibles movidas a variables de entorno
- JWT con claves seguras de mínimo 32 caracteres
- Contraseñas hasheadas con BCrypt
- HTTPS forzado en producción
- CORS configurado correctamente
- TrustServerCertificate habilitado para AWS RDS

### ?? Documentación
- Guía completa de despliegue paso a paso
- Instrucciones de configuración DNS para diferentes proveedores
- Documentación de arquitectura de routing
- Troubleshooting para problemas comunes
- Checklist pre-despliegue
- Comandos útiles de Heroku

### ?? Frontend
- Sistema de routing optimizado para SPA
- Navegación entre roles (Paciente, Doctor, Admin)
- Protección de rutas por autenticación
- Diseño responsive con Tailwind CSS
- Componentes UI con Radix UI

### ?? Backend
- API RESTful con .NET 8
- Entity Framework Core con SQL Server
- Autenticación JWT
- Servicios para Pacientes, Doctores y Administradores
- Almacenamiento de archivos en AWS S3
- Email con SMTP

### ?? Infraestructura
- Hosting en Heroku con Docker
- Base de datos en AWS RDS (SQL Server)
- Almacenamiento en AWS S3
- Dominio personalizado: www.tucitaonline.org
- SSL/TLS automático con Let's Encrypt

## [0.9.0] - 2024-01-XX - Pre-Producción

### Agregado
- Panel de administración completo
- Dashboard de métricas para administradores
- Gestión de usuarios (CRUD)
- Gestión de especialidades médicas
- Reportes y estadísticas del sistema
- Configurador semanal de horarios para doctores
- Sistema de historial médico
- Carga de documentos a AWS S3
- Notificaciones por email

### Funcionalidades
- Registro y login de pacientes
- Registro y login de doctores
- Búsqueda de doctores por especialidad
- Agenda de citas para pacientes
- Gestión de citas para doctores
- Confirmación/rechazo de citas
- Cancelación y reagendado de citas
- Perfil de usuario editable
- Dashboard de doctor con estadísticas
- Gestión de disponibilidad de doctores

## [0.5.0] - 2024-01-XX - MVP

### Agregado
- Estructura base del proyecto
- Modelos de base de datos
- Autenticación básica con JWT
- CRUD de usuarios
- CRUD de citas
- Frontend básico con React
- Integración Frontend-Backend

---

## Tipos de Cambios

- `Agregado` para funcionalidades nuevas
- `Modificado` para cambios en funcionalidades existentes
- `Deprecado` para funcionalidades que se eliminarán pronto
- `Eliminado` para funcionalidades eliminadas
- `Corregido` para corrección de bugs
- `Seguridad` para vulnerabilidades corregidas

## Enlaces

- [Repositorio](https://github.com/rubencoto/TuCita)
- [Producción](https://www.tucitaonline.org)
- [Issues](https://github.com/rubencoto/TuCita/issues)
