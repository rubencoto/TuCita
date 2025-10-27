# TuCita - Sistema de Gestión de Citas Médicas

**Rama:** `web/feature/ruben/epic-2-us-5-diagnosticos`

## ?? Resumen

Esta rama implementa el **Módulo de Historial Médico** completo para TuCita, incluyendo la integración frontend-backend para gestionar diagnósticos, notas clínicas, recetas y documentos médicos asociados a las citas atendidas.

---

## ? Características Implementadas

### Backend (ASP.NET Core 8)

#### ? DTOs Creados
- **DiagnosticoDto.cs** - Estructura de diagnósticos con códigos ICD
- **NotaClinicaDto.cs** - Notas clínicas con timestamps
- **RecetaDto.cs** - Prescripciones médicas con medicamentos y dosis
- **DocumentoDto.cs** - Documentos médicos con categorización
- **HistorialMedicoDto.cs** - Vista consolidada del historial del paciente

#### ? Servicios
- **MedicalHistoryService.cs** - Lógica de negocio para gestión de historiales médicos
  - Obtener historial por paciente
  - Detalles de cita específica
  - CRUD de diagnósticos, notas, recetas y documentos
  - Control de permisos basado en roles

#### ? API Controller
- **MedicalHistoryController.cs** - Endpoints REST
  - `GET /api/historial/paciente/{idPaciente}` - Historial del paciente
  - `GET /api/historial/cita/{idCita}` - Detalle de cita
  - `POST /api/historial/nota` - Crear nota clínica
  - `POST /api/historial/diagnostico` - Crear diagnóstico
  - `POST /api/historial/receta` - Crear prescripción
  - `POST /api/historial/documento` - Subir documento
  - `DELETE /api/historial/documento/{id}` - Eliminar documento

---

### Frontend (Next.js + TypeScript)

#### ? Servicio de Integración
- **medicalHistoryService.ts** - Capa de abstracción para API
  - Type-safe interfaces que coinciden con DTOs del backend
  - Manejo automático de tokens JWT
  - Métodos helper para formateo de datos
  - Gestión de errores centralizada

#### ? Páginas Actualizadas
- **medical-history-page.tsx** - Vista principal del historial médico
  - Carga de datos en tiempo real desde backend
  - Filtros por fecha, especialidad, estado y doctor
  - Estadísticas y contadores
  - Estados de carga y error
  - Badges informativos (diagnósticos, recetas, documentos)

- **appointment-detail-page.tsx** - Vista detallada de cita
  - Navegación con breadcrumbs
  - Interfaz con tabs para cada tipo de registro médico
  - Visualización de diagnósticos, notas, recetas y documentos
  - Funcionalidad de impresión
  - Formateo de fechas y tamaños de archivo

---

## ?? Seguridad y Autorización

### Roles Implementados

#### PACIENTE
- ? Ver su propio historial médico
- ? Ver detalles de sus citas
- ? No puede crear registros médicos

#### DOCTOR
- ? Ver historial de cualquier paciente
- ? Crear diagnósticos, notas y recetas
- ? Subir documentos para sus propias citas

#### ADMIN
- ? Acceso completo a todas las funcionalidades

### Autenticación
- JWT tokens con validación automática
- Interceptor de axios para inyección de tokens
- Manejo de expiración y redirección automática
- Protección CSRF no requerida (JWT stateless)

---

## ?? Características de UI/UX

- ? Diseño responsive (móvil, tablet, desktop)
- ? Estados de carga con spinners
- ? Mensajes de error amigables
- ? Estados vacíos informativos
- ? Accesibilidad (ARIA labels, navegación por teclado)
- ? Contraste de colores conforme a estándares
- ? Tooltips y ayudas contextuales

---

## ??? Configuración Técnica

### Backend
- .NET 8
- Entity Framework Core
- SQL Server / Azure SQL Database
- JWT Authentication
- Inyección de dependencias

### Frontend
- Next.js 14+
- TypeScript
- Axios para HTTP requests
- Tailwind CSS para estilos
- Lucide React para iconos

---

## ?? Inicio Rápido

### Prerrequisitos
- .NET 8 SDK
- Node.js 18+
- SQL Server o Azure SQL Database

### Configuración del Backend

1. **Navegar al directorio del proyecto:**
   ```bash
   cd TuCita
   ```

2. **Configurar la cadena de conexión:**
   
   Editar el archivo `.env` o `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "tu-cadena-de-conexion"
     }
   }
   ```

3. **Ejecutar migraciones:**
   ```bash
   dotnet ef database update
   ```

4. **Iniciar el servidor:**
   ```bash
   dotnet run
   ```

### Configuración del Frontend

1. **Navegar al directorio del cliente:**
   ```bash
   cd TuCita/ClientApp
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

---

## ?? Documentación Adicional

- [Documentación Completa del Módulo](MEDICAL_HISTORY_MODULE_DOCUMENTATION.md)
- [Referencia Rápida de la API](MEDICAL_HISTORY_API_QUICK_REFERENCE.md)
- [Guía de Integración Frontend-Backend](FRONTEND_BACKEND_INTEGRATION_GUIDE.md)
- [Lista de Verificación de Pruebas](TESTING_CHECKLIST_MEDICAL_HISTORY.md)
- [Guía de Inicio Rápido](QUICK_START_GUIDE.md)

---

## ?? Pruebas

### Probar Historial Médico

1. **Iniciar sesión como paciente**
2. **Navegar a "Historial Médico"**
3. **Verificar que los datos se cargan correctamente**
4. **Probar filtros (fecha, especialidad, estado)**
5. **Hacer clic en "Ver Detalles" de una cita**
6. **Verificar que todos los tabs muestran información correcta**

### Probar Creación de Registros Médicos (Doctores)

1. **Iniciar sesión como doctor**
2. **Acceder a una cita atendida**
3. **Crear un diagnóstico**
4. **Agregar una nota clínica**
5. **Crear una receta**
6. **Subir un documento**

---

## ?? Solución de Problemas

### Error: "Usuario no autenticado"
- Verificar que el token existe en localStorage
- Verificar que el token no ha expirado (60 minutos por defecto)

### Error: "Error al cargar historial médico"
- Verificar que el backend está ejecutándose
- Verificar la configuración de CORS

### Historial médico vacío
- Solo se muestran citas con estado "ATENDIDA"
- Verificar que existen datos de prueba con citas completadas

### Error de permisos
- Verificar que el usuario tiene el rol correcto
- Verificar que el JWT token incluye los claims de rol

---

## ?? Estado de Implementación

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

#### Historial Médico
- [x] Visualización de historial médico
- [x] Registro de diagnósticos
- [x] Creación de notas clínicas
- [x] Emisión de recetas médicas
- [x] Gestión de documentos médicos
- [x] Seguridad y control de acceso por roles

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
