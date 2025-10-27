Rama: web/feature/ruben/epic-2-us-5-diagnosticos
 Resumen
Esta rama implementa el Módulo de Historial Médico completo para TuCita, incluyendo la integración frontend-backend para gestionar diagnósticos, notas clínicas, recetas y documentos médicos asociados a las citas atendidas.
---
✨ Características Implementadas
Backend (ASP.NET Core 8)
 DTOs Creados
•	DiagnosticoDto.cs - Estructura de diagnósticos con códigos ICD
•	NotaClinicaDto.cs - Notas clínicas con timestamps
•	RecetaDto.cs - Prescripciones médicas con medicamentos y dosis
•	DocumentoDto.cs - Documentos médicos con categorización
•	HistorialMedicoDto.cs - Vista consolidada del historial del paciente
🛠️ Servicios
•	MedicalHistoryService.cs - Lógica de negocio para gestión de historiales médicos
•	Obtener historial por paciente
•	Detalles de cita específica
•	CRUD de diagnósticos, notas, recetas y documentos
•	Control de permisos basado en roles
 API Controller
•	MedicalHistoryController.cs - Endpoints REST
•	GET /api/historial/paciente/{idPaciente} - Historial del paciente
•	GET /api/historial/cita/{idCita} - Detalle de cita
•	POST /api/historial/nota - Crear nota clínica
•	POST /api/historial/diagnostico - Crear diagnóstico
•	POST /api/historial/receta - Crear prescripción
•	POST /api/historial/documento - Subir documento
•	DELETE /api/historial/documento/{id} - Eliminar documento
Frontend (Next.js + TypeScript)
 Servicio de Integración
•	medicalHistoryService.ts - Capa de abstracción para API
•	Type-safe interfaces que coinciden con DTOs del backend
•	Manejo automático de tokens JWT
•	Métodos helper para formateo de datos
•	Gestión de errores centralizada
 Páginas Actualizadas
•	medical-history-page.tsx - Vista principal del historial médico
•	Carga de datos en tiempo real desde backend
•	Filtros por fecha, especialidad, estado y doctor
•	Estadísticas y contadores
•	Estados de carga y error
•	Badges informativos (diagnósticos, recetas, documentos)
•	appointment-detail-page.tsx - Vista detallada de cita
•	Navegación con breadcrumbs
•	Interfaz con tabs para cada tipo de registro médico
•	Visualización de diagnósticos, notas, recetas y documentos
•	Funcionalidad de impresión
•	Formateo de fechas y tamaños de archivo
---
 Seguridad y Autorización
Roles Implementados
PACIENTE:
•	 Ver su propio historial médico
•	 Ver detalles de sus citas
•	 No puede crear registros médicos
DOCTOR:
•	 Ver historial de cualquier paciente
•	 Crear diagnósticos, notas y recetas
•	 Subir documentos para sus propias citas
ADMIN:
•	 Acceso completo a todas las funcionalidades
Autenticación
•	JWT tokens con validación automática
•	Interceptor de axios para inyección de tokens
•	Manejo de expiración y redirección automática
•	Protección CSRF no requerida (JWT stateless)
---
📱 Características de UI/UX
•	 Diseño responsive (móvil, tablet, desktop)
•	 Estados de carga con spinners
•	 Mensajes de error amigables
•	 Estados vacíos informativos
•	 Accesibilidad (ARIA labels, navegación por teclado)
•	 Contraste de colores conforme a estándares
•	 Tooltips y ayudas contextuales

---

 Configuración Técnica
Backend
•	.NET 8
•	Entity Framework Core
•	SQL Server / Azure SQL Database
•	JWT Authentication
•	Inyección de dependencias
Frontend
•	Next.js 14+
•	TypeScript
•	Axios para HTTP requests
•	Tailwind CSS para estilos
•	Lucide React para iconos
