# TuCita - Sistema de Gesti�n de Citas M�dicas

**Rama:** `web/feature/ruben/epic-2-us-5-diagnosticos`

## ?? Resumen

Esta rama implementa el **M�dulo de Historial M�dico** completo para TuCita, incluyendo la integraci�n frontend-backend para gestionar diagn�sticos, notas cl�nicas, recetas y documentos m�dicos asociados a las citas atendidas.

---

## ? Caracter�sticas Implementadas

### Backend (ASP.NET Core 8)

#### ? DTOs Creados
- **DiagnosticoDto.cs** - Estructura de diagn�sticos con c�digos ICD
- **NotaClinicaDto.cs** - Notas cl�nicas con timestamps
- **RecetaDto.cs** - Prescripciones m�dicas con medicamentos y dosis
- **DocumentoDto.cs** - Documentos m�dicos con categorizaci�n
- **HistorialMedicoDto.cs** - Vista consolidada del historial del paciente

#### ? Servicios
- **MedicalHistoryService.cs** - L�gica de negocio para gesti�n de historiales m�dicos
  - Obtener historial por paciente
  - Detalles de cita espec�fica
  - CRUD de diagn�sticos, notas, recetas y documentos
  - Control de permisos basado en roles

#### ? API Controller
- **MedicalHistoryController.cs** - Endpoints REST
  - `GET /api/historial/paciente/{idPaciente}` - Historial del paciente
  - `GET /api/historial/cita/{idCita}` - Detalle de cita
  - `POST /api/historial/nota` - Crear nota cl�nica
  - `POST /api/historial/diagnostico` - Crear diagn�stico
  - `POST /api/historial/receta` - Crear prescripci�n
  - `POST /api/historial/documento` - Subir documento
  - `DELETE /api/historial/documento/{id}` - Eliminar documento

---

### Frontend (Next.js + TypeScript)

#### ? Servicio de Integraci�n
- **medicalHistoryService.ts** - Capa de abstracci�n para API
  - Type-safe interfaces que coinciden con DTOs del backend
  - Manejo autom�tico de tokens JWT
  - M�todos helper para formateo de datos
  - Gesti�n de errores centralizada

#### ? P�ginas Actualizadas
- **medical-history-page.tsx** - Vista principal del historial m�dico
  - Carga de datos en tiempo real desde backend
  - Filtros por fecha, especialidad, estado y doctor
  - Estad�sticas y contadores
  - Estados de carga y error
  - Badges informativos (diagn�sticos, recetas, documentos)

- **appointment-detail-page.tsx** - Vista detallada de cita
  - Navegaci�n con breadcrumbs
  - Interfaz con tabs para cada tipo de registro m�dico
  - Visualizaci�n de diagn�sticos, notas, recetas y documentos
  - Funcionalidad de impresi�n
  - Formateo de fechas y tama�os de archivo

---

## ?? Seguridad y Autorizaci�n

### Roles Implementados

#### PACIENTE
- ? Ver su propio historial m�dico
- ? Ver detalles de sus citas
- ? No puede crear registros m�dicos

#### DOCTOR
- ? Ver historial de cualquier paciente
- ? Crear diagn�sticos, notas y recetas
- ? Subir documentos para sus propias citas

#### ADMIN
- ? Acceso completo a todas las funcionalidades

### Autenticaci�n
- JWT tokens con validaci�n autom�tica
- Interceptor de axios para inyecci�n de tokens
- Manejo de expiraci�n y redirecci�n autom�tica
- Protecci�n CSRF no requerida (JWT stateless)

---

## ?? Caracter�sticas de UI/UX

- ? Dise�o responsive (m�vil, tablet, desktop)
- ? Estados de carga con spinners
- ? Mensajes de error amigables
- ? Estados vac�os informativos
- ? Accesibilidad (ARIA labels, navegaci�n por teclado)
- ? Contraste de colores conforme a est�ndares
- ? Tooltips y ayudas contextuales

---

## ??? Configuraci�n T�cnica

### Backend
- .NET 8
- Entity Framework Core
- SQL Server / Azure SQL Database
- JWT Authentication
- Inyecci�n de dependencias

### Frontend
- Next.js 14+
- TypeScript
- Axios para HTTP requests
- Tailwind CSS para estilos
- Lucide React para iconos

---

## ?? Inicio R�pido

### Prerrequisitos
- .NET 8 SDK
- Node.js 18+
- SQL Server o Azure SQL Database

### Configuraci�n del Backend

1. **Navegar al directorio del proyecto:**
   ```bash
   cd TuCita
   ```

2. **Configurar la cadena de conexi�n:**
   
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

### Configuraci�n del Frontend

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

## ?? Documentaci�n Adicional

- [Documentaci�n Completa del M�dulo](MEDICAL_HISTORY_MODULE_DOCUMENTATION.md)
- [Referencia R�pida de la API](MEDICAL_HISTORY_API_QUICK_REFERENCE.md)
- [Gu�a de Integraci�n Frontend-Backend](FRONTEND_BACKEND_INTEGRATION_GUIDE.md)
- [Lista de Verificaci�n de Pruebas](TESTING_CHECKLIST_MEDICAL_HISTORY.md)
- [Gu�a de Inicio R�pido](QUICK_START_GUIDE.md)

---

## ?? Pruebas

### Probar Historial M�dico

1. **Iniciar sesi�n como paciente**
2. **Navegar a "Historial M�dico"**
3. **Verificar que los datos se cargan correctamente**
4. **Probar filtros (fecha, especialidad, estado)**
5. **Hacer clic en "Ver Detalles" de una cita**
6. **Verificar que todos los tabs muestran informaci�n correcta**

### Probar Creaci�n de Registros M�dicos (Doctores)

1. **Iniciar sesi�n como doctor**
2. **Acceder a una cita atendida**
3. **Crear un diagn�stico**
4. **Agregar una nota cl�nica**
5. **Crear una receta**
6. **Subir un documento**

---

## ?? Soluci�n de Problemas

### Error: "Usuario no autenticado"
- Verificar que el token existe en localStorage
- Verificar que el token no ha expirado (60 minutos por defecto)

### Error: "Error al cargar historial m�dico"
- Verificar que el backend est� ejecut�ndose
- Verificar la configuraci�n de CORS

### Historial m�dico vac�o
- Solo se muestran citas con estado "ATENDIDA"
- Verificar que existen datos de prueba con citas completadas

### Error de permisos
- Verificar que el usuario tiene el rol correcto
- Verificar que el JWT token incluye los claims de rol

---

## ?? Estado de Implementaci�n

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

#### Historial M�dico
- [x] Visualizaci�n de historial m�dico
- [x] Registro de diagn�sticos
- [x] Creaci�n de notas cl�nicas
- [x] Emisi�n de recetas m�dicas
- [x] Gesti�n de documentos m�dicos
- [x] Seguridad y control de acceso por roles

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
