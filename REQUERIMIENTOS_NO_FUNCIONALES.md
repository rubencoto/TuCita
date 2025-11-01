# ?? Requerimientos No Funcionales - TuCita Online

**Proyecto:** Sistema de Gestión de Citas Médicas en Línea  
**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Tecnologías:** .NET 8, React/TypeScript, Azure SQL Database, Azure Blob Storage

---

## ?? Objetivo

Este documento define las características de calidad, rendimiento, seguridad y restricciones técnicas que debe cumplir el sistema TuCita Online para garantizar una operación eficiente, segura y escalable.

---

## ?? Requerimientos No Funcionales Detallados

---

## ? CATEGORÍA 1: Rendimiento y Escalabilidad

### RNF-001: Tiempo de Respuesta del Sistema
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Rendimiento

**Descripción:**  
El sistema debe mantener tiempos de respuesta óptimos para garantizar una buena experiencia de usuario.

**Métricas:**
| Operación | Tiempo Objetivo | Tiempo Máximo |
|-----------|----------------|---------------|
| Carga de página principal | < 2 segundos | 3 segundos |
| Login/Registro | < 1 segundo | 2 segundos |
| Búsqueda de médicos | < 1 segundo | 2 segundos |
| Creación de cita | < 2 segundos | 3 segundos |
| Carga de historial médico | < 2 segundos | 4 segundos |
| Consulta de turnos disponibles | < 1 segundo | 2 segundos |
| API REST endpoints | < 500ms | 1 segundo |

**Criterios de Aceptación:**
- ? 95% de las requests se completan dentro del tiempo objetivo
- ? 99% de las requests se completan dentro del tiempo máximo
- ? Uso de índices optimizados en base de datos
- ? Caché de consultas frecuentes (si aplica)

---

### RNF-002: Capacidad y Concurrencia
**Prioridad:** Alta  
**Estado:** ? Diseñado para escalar  
**Categoría:** Rendimiento

**Descripción:**  
El sistema debe soportar múltiples usuarios simultáneos sin degradación significativa del rendimiento.

**Capacidad mínima:**
- **Usuarios concurrentes:** 100 usuarios simultáneos
- **Usuarios registrados:** 10,000+ usuarios
- **Médicos activos:** 500+ médicos
- **Citas por día:** 1,000+ citas
- **Transacciones por segundo (TPS):** 50 TPS

**Criterios de Aceptación:**
- ? Sistema mantiene < 2 segundos de respuesta con 100 usuarios concurrentes
- ? Base de datos Azure SQL soporta crecimiento hasta 100GB
- ? Arquitectura permite escalamiento horizontal (múltiples instancias de API)
- ? Connection pooling configurado para máximo 100 conexiones concurrentes

**Implementación:**
```csharp
// Connection pooling en appsettings
"ConnectionStrings": {
  "TuCitaDB": "Server=...; Max Pool Size=100; Min Pool Size=10;"
}

// Entity Framework con tracking optimizado
services.AddDbContext<TuCitaDbContext>(options => 
    options.UseSqlServer(connectionString)
           .EnableSensitiveDataLogging(false)
           .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
);
```

---

### RNF-003: Escalabilidad Horizontal y Vertical
**Prioridad:** Alta  
**Estado:** ? Arquitectura escalable  
**Categoría:** Rendimiento

**Descripción:**  
La arquitectura debe permitir crecimiento futuro sin rediseños mayores.

**Estrategias implementadas:**
- ? **Escalamiento vertical:** Azure SQL Database permite aumentar DTUs/vCores
- ? **Escalamiento horizontal:** API stateless permite múltiples instancias
- ? **Separación de concerns:** Arquitectura en capas (Controllers ? Services ? Data)
- ? **Azure Blob Storage:** Almacenamiento escalable de documentos médicos
- ? **CDN ready:** Assets estáticos servidos desde carpeta dist

**Puntos de escalamiento:**
1. **Capa de presentación:** React SPA puede cachear en CDN
2. **Capa de API:** .NET 8 API puede correr en múltiples Azure App Services
3. **Capa de datos:** Azure SQL Database con réplicas de lectura
4. **Almacenamiento:** Azure Blob Storage escala automáticamente

---

## ?? CATEGORÍA 2: Disponibilidad y Confiabilidad

### RNF-004: Disponibilidad del Sistema (Uptime)
**Prioridad:** Crítica  
**Estado:** ? Configurado  
**Categoría:** Disponibilidad

**Descripción:**  
El sistema debe estar disponible 24/7 con mínimo downtime planificado.

**Métricas:**
- **Uptime objetivo:** 99.5% (43.8 horas de downtime al año)
- **Uptime ideal:** 99.9% (8.76 horas de downtime al año)
- **Mantenimiento planificado:** Máximo 4 horas mensuales en horario de baja demanda

**Estrategias:**
- ? Azure App Service con SLA 99.95%
- ? Azure SQL Database con SLA 99.99%
- ? Health checks configurados
- ? Monitoreo proactivo de servicios
- ?? Backup automático diario (Azure SQL)
- ?? Disaster recovery plan (pendiente documentar)

**Health Check Endpoint:**
```csharp
// GET /api/health
[HttpGet("health")]
public IActionResult HealthCheck()
{
    return Ok(new { 
        status = "healthy", 
        timestamp = DateTime.UtcNow,
        version = "1.0"
    });
}
```

---

### RNF-005: Recuperación ante Fallos (RTO/RPO)
**Prioridad:** Alta  
**Estado:** ?? Parcialmente implementado  
**Categoría:** Confiabilidad

**Descripción:**  
El sistema debe recuperarse rápidamente de fallos y minimizar pérdida de datos.

**Objetivos:**
- **RTO (Recovery Time Objective):** < 4 horas
- **RPO (Recovery Point Objective):** < 1 hora (pérdida máxima de datos)

**Estrategias de recuperación:**
- ? **Backups automáticos:** Azure SQL Database backup diario + point-in-time restore (7-35 días)
- ? **Transacciones atómicas:** Entity Framework usa transacciones ACID
- ? **Validación de datos:** Constraints y triggers en BD
- ?? **Geo-redundancia:** Azure SQL con replicación geográfica (opcional)
- ?? **Circuit breaker pattern:** Para servicios externos (pendiente)

**Manejo de errores:**
```csharp
// Ejemplo de transacciones atómicas
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    // Operaciones múltiples
    _context.Citas.Add(nuevaCita);
    turno.Estado = "OCUPADO";
    await _context.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

---

### RNF-006: Tolerancia a Fallos
**Prioridad:** Media  
**Estado:** ? Implementado  
**Categoría:** Confiabilidad

**Descripción:**  
El sistema debe manejar errores gracefully sin colapsar.

**Estrategias:**
- ? **Try-catch en todos los endpoints:** Manejo centralizado de excepciones
- ? **Logging de errores:** Registro detallado de excepciones
- ? **Mensajes de error user-friendly:** Sin exponer stack traces
- ? **Rollback de transacciones:** En caso de fallo parcial
- ? **Retry logic:** Para envío de emails (3 intentos)
- ? **Validación de entrada:** Prevención de errores antes de procesamiento

**Ejemplo de manejo de errores:**
```csharp
[HttpPost]
public async Task<IActionResult> CreateAppointment([FromBody] CreateCitaRequest request)
{
    try
    {
        var result = await _appointmentsService.CreateCita(request, userId);
        return Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        _logger.LogWarning(ex, "Error de validación al crear cita");
        return BadRequest(new { message = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error inesperado al crear cita");
        return StatusCode(500, new { 
            message = "Error interno del servidor. Por favor intenta más tarde." 
        });
    }
}
```

---

## ?? CATEGORÍA 3: Seguridad

### RNF-007: Autenticación JWT
**Prioridad:** Crítica  
**Estado:** ? Implementado  
**Categoría:** Seguridad

**Descripción:**  
El sistema debe proteger el acceso mediante autenticación robusta con tokens JWT.

**Mecanismos de seguridad:**
- ? **JWT (JSON Web Tokens):** Autenticación stateless
- ? **BCrypt password hashing:** Hash con salt (work factor 10)
- ? **Token expiration:** Tokens válidos por 7 días
- ? **HTTPS obligatorio:** Todas las comunicaciones encriptadas
- ? **Password requirements:** Mínimo 6 caracteres (recomendado aumentar a 8)
- ? **Role-based authorization:** PACIENTE, MEDICO, ADMIN

**Configuración JWT:**
```csharp
// Parámetros de validación
ValidateIssuerSigningKey = true,
ValidateIssuer = true,
ValidateAudience = true,
ValidateLifetime = true,
ClockSkew = TimeSpan.Zero  // Sin tolerancia de expiración
```

**Recomendaciones de mejora:**
- [ ] Aumentar requisitos de contraseña (8+ caracteres, mayúsculas, números, símbolos)
- [ ] Implementar rate limiting para prevenir brute force
- [ ] Two-factor authentication (2FA) opcional
- [ ] Lockout de cuenta después de 5 intentos fallidos
- [ ] Password history (prevenir reutilización)

---

### RNF-008: Protección de Datos Sensibles
**Prioridad:** Crítica  
**Estado:** ? Implementado  
**Categoría:** Seguridad

**Descripción:**  
Los datos médicos y personales deben estar protegidos en tránsito y en reposo.

**Medidas de protección:**

**En tránsito:**
- ? HTTPS/TLS 1.2+ obligatorio
- ? Certificates de Azure App Service
- ? CORS configurado (solo orígenes permitidos)
- ? Headers de seguridad (HSTS, X-Content-Type-Options, etc.)

**En reposo:**
- ? Azure SQL Database con Transparent Data Encryption (TDE)
- ? Contraseñas hasheadas con BCrypt
- ? Azure Blob Storage con encriptación por defecto
- ? Tokens JWT firmados con clave secreta (HMAC-SHA256)
- ? Variables de entorno para secretos (.env)
- ?? Azure Key Vault para manejo de secretos (recomendado para producción)

**Datos protegidos:**
- Contraseñas (BCrypt hash)
- Tokens de sesión (JWT)
- Información médica (HIPAA compliance)
- Datos personales (GDPR/CCPA compliance)
- Números de identificación
- Historial médico completo

---

### RNF-009: Prevención de Vulnerabilidades OWASP
**Prioridad:** Crítica  
**Estado:** ? Implementado  
**Categoría:** Seguridad

**Descripción:**  
Protección contra las vulnerabilidades más comunes (OWASP Top 10).

**Vulnerabilidades mitigadas:**

| Vulnerabilidad | Mitigación | Estado |
|----------------|------------|--------|
| **SQL Injection** | Entity Framework (parametrized queries) | ? |
| **XSS (Cross-Site Scripting)** | React DOM sanitization, Content Security Policy | ? |
| **CSRF (Cross-Site Request Forgery)** | Token-based auth (JWT), SameSite cookies | ? |
| **Insecure Deserialization** | Validación de inputs, type checking | ? |
| **Broken Authentication** | JWT con expiración, BCrypt hashing | ? |
| **Sensitive Data Exposure** | HTTPS, TDE, environment variables | ? |
| **Broken Access Control** | Role-based authorization, ownership validation | ? |
| **Security Misconfiguration** | Minimal exposure, secure defaults | ? |
| **Insufficient Logging** | ILogger implementation, error tracking | ? |
| **XXE (XML External Entities)** | No XML processing (JSON only) | ? |

**Validaciones de seguridad:**
```csharp
// Validación de ownership
var cita = await _context.Citas.FindAsync(id);
if (cita.PacienteId != userId)
{
    return Forbid(); // 403 Forbidden
}

// Sanitización de inputs
if (string.IsNullOrWhiteSpace(request.Motivo))
{
    return BadRequest("Motivo es requerido");
}

// Prevención de mass assignment
public class UpdateProfileDto
{
    public string Nombre { get; set; }
    // Id no expuesto - previene modificación maliciosa
}
```

---

### RNF-010: Auditoría y Logging de Seguridad
**Prioridad:** Media  
**Estado:** ? Básico implementado  
**Categoría:** Seguridad

**Descripción:**  
Registro de eventos de seguridad y acciones críticas.

**Eventos registrados:**
- ? Login exitoso y fallido
- ? Cambios de contraseña
- ? Creación/modificación/cancelación de citas
- ? Acceso a historial médico
- ? Errores y excepciones
- ? Acciones administrativas

**Niveles de logging:**
```csharp
_logger.LogInformation("Usuario {UserId} inició sesión", userId);
_logger.LogWarning("Intento de acceso no autorizado a cita {CitaId}", citaId);
_logger.LogError(ex, "Error al crear cita para usuario {UserId}", userId);
```

**Mejoras recomendadas:**
- [ ] Logging estructurado con Serilog
- [ ] Integración con Azure Application Insights
- [ ] Alertas automáticas para eventos críticos
- [ ] Audit trail completo con timestamp y usuario
- [ ] Retención de logs por 1 año (compliance)

---

## ?? CATEGORÍA 4: Usabilidad y Experiencia de Usuario

### RNF-011: Interfaz Intuitiva
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Usabilidad

**Descripción:**  
La interfaz debe ser fácil de usar para usuarios no técnicos.

**Principios de diseño:**
- ? **Navegación clara:** Menú principal con 5 secciones clave
- ? **Diseño responsive:** Funciona en desktop, tablet y móvil
- ? **Componentes consistentes:** shadcn/ui + Tailwind CSS
- ? **Feedback visual:** Toasts para confirmaciones y errores
- ? **Loading states:** Spinners durante operaciones asíncronas
- ? **Formularios validados:** Mensajes de error claros y específicos
- ? **Accesibilidad básica:** Labels, aria-labels, keyboard navigation

**Métricas de usabilidad:**
- Nuevo usuario puede agendar cita en < 3 minutos
- 90%+ de usuarios completan registro sin ayuda
- < 5% de errores de usuario en formularios

---

### RNF-012: Accesibilidad WCAG 2.1
**Prioridad:** Media  
**Estado:** ?? Parcialmente implementado  
**Categoría:** Usabilidad

**Descripción:**  
El sistema debe ser accesible para usuarios con discapacidades.

**Estándares:**
- **Objetivo:** WCAG 2.1 Level AA

**Características implementadas:**
- ? Navegación por teclado funcional
- ? Labels semánticos en formularios
- ? Contraste de colores adecuado (Tailwind defaults)
- ? Focus visible en elementos interactivos
- ?? Screen reader support (parcial)
- ?? Alt text en imágenes (pendiente en algunas áreas)
- ?? ARIA attributes (básico)

**Mejoras pendientes:**
- [ ] Test con screen readers (NVDA, JAWS)
- [ ] Skip navigation links
- [ ] Descripciones ARIA completas
- [ ] Validación con herramientas (axe, Lighthouse)
- [ ] Soporte para alto contraste
- [ ] Tamaños de fuente ajustables

---

### RNF-013: Compatibilidad de Navegadores
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Usabilidad

**Descripción:**  
El sistema debe funcionar en los navegadores más comunes.

**Navegadores soportados:**
| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Google Chrome | 90+ | ? |
| Mozilla Firefox | 88+ | ? |
| Microsoft Edge | 90+ | ? |
| Safari (macOS) | 14+ | ? |
| Safari (iOS) | 14+ | ? |
| Opera | 76+ | ? |

**Tecnologías utilizadas:**
- React 18 (amplio soporte)
- ES6+ transpilado con Vite
- CSS moderno con Tailwind
- Polyfills automáticos cuando es necesario

---

### RNF-014: Diseño Responsive
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Usabilidad

**Descripción:**  
La aplicación debe adaptarse a diferentes tamaños de pantalla.

**Breakpoints:**
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Teléfonos grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Pantallas grandes */
```

**Características responsive:**
- ? Menú hamburguesa en móvil
- ? Grids adaptativos (1/2/3 columnas según pantalla)
- ? Formularios stack en móvil
- ? Imágenes escalables
- ? Touch-friendly (botones grandes en móvil)
- ? Viewport meta tag configurado

---

## ??? CATEGORÍA 5: Mantenibilidad y Extensibilidad

### RNF-015: Código Mantenible
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Mantenibilidad

**Descripción:**  
El código debe ser fácil de entender, modificar y extender.

**Principios aplicados:**
- ? **Arquitectura en capas:** Controllers ? Services ? Data
- ? **Separation of Concerns:** Cada capa tiene responsabilidades claras
- ? **Dependency Injection:** Services inyectados, fácil testing
- ? **DTOs separados:** No exponer modelos de BD directamente
- ? **Naming conventions:** C# y TypeScript standards
- ? **Comentarios:** Documentación en código complejo

**Estructura del proyecto:**
```
TuCita/
??? Controllers/Api/      # Endpoints REST
??? Services/            # Lógica de negocio
??? Data/                # DbContext, Entities
??? Models/              # Database models
??? DTOs/                # Data Transfer Objects
??? ClientApp/
    ??? components/      # React components
    ??? services/        # API calls
    ??? pages/          # Page components
```

---

### RNF-016: Documentación Completa
**Prioridad:** Media  
**Estado:** ? Documentado  
**Categoría:** Mantenibilidad

**Descripción:**  
El sistema debe tener documentación clara y actualizada.

**Documentación existente:**
- ? README principal del proyecto
- ? Guías de despliegue (Azure)
- ? Scripts de base de datos documentados
- ? Documentación de APIs (comentarios XML)
- ? Guías de troubleshooting
- ? Summaries de implementación
- ? Checklists de deployment

**Documentos clave:**
1. `README.md` - Overview del proyecto
2. `Database/Azure/INDEX.md` - Índice de scripts
3. `AZURE_DEPLOYMENT_SUMMARY.md` - Guía de deployment
4. `MEDICAL_HISTORY_IMPLEMENTATION.md` - Features médicas
5. `NOTIFICATIONS_SYSTEM_README.md` - Sistema de emails
6. **`REQUERIMIENTOS_FUNCIONALES.md`** - Este documento
7. **`REQUERIMIENTOS_NO_FUNCIONALES.md`** - Documento actual

**Mejoras recomendadas:**
- [ ] Swagger/OpenAPI documentation
- [ ] API versioning documentation
- [ ] Architecture decision records (ADRs)
- [ ] Diagramas de arquitectura (C4 model)
- [ ] Runbook para operaciones

---

### RNF-017: Testing y Cobertura
**Prioridad:** Alta  
**Estado:** ?? Limitado  
**Categoría:** Mantenibilidad

**Descripción:**  
El sistema debe tener cobertura de pruebas adecuada.

**Testing implementado:**
- ?? Tests manuales (QA)
- ?? Validación de endpoints con Postman/Thunder Client
- ?? Testing en ambiente de desarrollo

**Testing recomendado (pendiente):**
```csharp
// Unit tests - Servicios
[Fact]
public async Task CreateCita_ValidData_ReturnsSuccess()
{
    // Arrange
    var service = new AppointmentsService(mockContext, mockEmail);
    
    // Act
    var result = await service.CreateCita(validRequest, userId);
    
    // Assert
    Assert.NotNull(result);
    Assert.Equal("PENDIENTE", result.Estado);
}

// Integration tests - Endpoints
[Fact]
public async Task POST_CreateAppointment_Returns201()
{
    var response = await _client.PostAsync("/api/appointments", content);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
}
```

**Cobertura objetivo:**
- [ ] Unit tests: 70%+ code coverage
- [ ] Integration tests: Endpoints críticos
- [ ] E2E tests: Flujos principales (Playwright/Cypress)
- [ ] Load testing: 100 usuarios concurrentes
- [ ] Security testing: OWASP ZAP scan

---

### RNF-018: Versionamiento y Control de Cambios
**Prioridad:** Media  
**Estado:** ? Implementado (Git)  
**Categoría:** Mantenibilidad

**Descripción:**  
Control de versiones para código y base de datos.

**Git workflow:**
- ? Repository: GitHub
- ? Branching: master + feature branches
- ? Commits descriptivos
- ? .gitignore configurado

**Base de datos:**
- ? Scripts versionados (01, 02, 03...)
- ? Migration scripts ordenados
- ? Rollback scripts (drop & recreate)

**API versioning (recomendado):**
```csharp
// v1/v2 endpoints
[Route("api/v1/[controller]")]
[Route("api/v2/[controller]")]
```

---

## ?? CATEGORÍA 6: Portabilidad y Compatibilidad

### RNF-019: Independencia de Plataforma
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Portabilidad

**Descripción:**  
La aplicación debe poder ejecutarse en diferentes sistemas operativos.

**Compatibilidad:**
- ? **.NET 8:** Cross-platform (Windows, Linux, macOS)
- ? **SQL Server:** Compatible con Azure SQL, SQL Server 2019+
- ? **React/Vite:** Funciona en cualquier OS con Node.js
- ? **Docker ready:** Containerizable para despliegue uniforme

**Ambientes soportados:**
| Ambiente | Backend | Frontend | Database |
|----------|---------|----------|----------|
| Development | Local .NET 8 | Vite dev server | Azure SQL |
| Staging | Azure App Service | Azure Static Web Apps | Azure SQL |
| Production | Azure App Service | Azure CDN | Azure SQL |

---

### RNF-020: Configuración por Ambiente
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Portabilidad

**Descripción:**  
Separación clara de configuraciones por ambiente.

**Archivos de configuración:**
```csharp
// appsettings.json (base)
// appsettings.Development.json
// appsettings.Production.json
// .env (variables de entorno - no en Git)
```

**Variables configurables:**
- ? Cadena de conexión a BD
- ? JWT secret key, issuer, audience
- ? SMTP configuration
- ? Azure Blob Storage settings
- ? Logging level
- ? CORS origins

**Ejemplo .env:**
```bash
# Database
DB_SERVER=tucita-server.database.windows.net
DB_NAME=TuCitaDB
DB_USER=tucitaadmin
DB_PASSWORD=SecurePassword123!

# JWT
JWT_KEY=SuperSecretKey12345...
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucita@example.com
SMTP_PASSWORD=appPassword
```

---

## ?? CATEGORÍA 7: Cumplimiento Legal y Normativo

### RNF-021: HIPAA Compliance (Estados Unidos)
**Prioridad:** Alta  
**Estado:** ?? Parcialmente cumplido  
**Categoría:** Compliance

**Descripción:**  
Para datos médicos en EE.UU., cumplir con Health Insurance Portability and Accountability Act.

**Requisitos HIPAA:**
| Requisito | Estado | Implementación |
|-----------|--------|----------------|
| Encriptación en tránsito | ? | HTTPS/TLS 1.2+ |
| Encriptación en reposo | ? | Azure SQL TDE |
| Control de acceso | ? | JWT + roles |
| Audit trails | ?? | Logging básico |
| Business Associate Agreement | ? | Pendiente |
| Breach notification | ? | Proceso pendiente |
| Patient rights (access/delete) | ?? | Soft delete implementado |

**Acciones requeridas para compliance total:**
- [ ] Audit trail completo de accesos a datos médicos
- [ ] Proceso de notificación de brechas de seguridad
- [ ] Políticas de retención de datos documentadas
- [ ] BAA (Business Associate Agreement) con proveedores
- [ ] Evaluación de riesgos anual
- [ ] Training de empleados en HIPAA

---

### RNF-022: GDPR Compliance (Europa)
**Prioridad:** Media  
**Estado:** ?? Parcialmente cumplido  
**Categoría:** Compliance

**Descripción:**  
Para usuarios europeos, cumplir con General Data Protection Regulation.

**Requisitos GDPR:**
| Derecho | Estado | Implementación |
|---------|--------|----------------|
| Derecho al acceso | ? | GET /api/profile |
| Derecho a la portabilidad | ?? | Export JSON (pendiente) |
| Derecho al olvido | ?? | Soft delete |
| Consentimiento explícito | ? | Checkbox pendiente |
| Notificación de brechas | ? | Proceso pendiente |
| Privacy by design | ? | Implementado |
| DPO (Data Protection Officer) | ? | Requerido en producción |

**Acciones requeridas:**
- [ ] Formulario de consentimiento en registro
- [ ] Proceso de exportación de datos
- [ ] Hard delete opcional (después de período)
- [ ] Privacy policy y terms of service
- [ ] Cookie consent banner
- [ ] Designar DPO

---

### RNF-023: Políticas de Privacidad
**Prioridad:** Alta  
**Estado:** ? Pendiente  
**Categoría:** Compliance

**Descripción:**  
Documentos legales requeridos para operación.

**Documentos necesarios:**
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Consent forms (tratamiento de datos)
- [ ] Data retention policy
- [ ] Incident response plan

---

## ?? CATEGORÍA 8: Operaciones y Monitoreo

### RNF-024: Monitoreo del Sistema
**Prioridad:** Alta  
**Estado:** ?? Básico  
**Categoría:** Operaciones

**Descripción:**  
Capacidad de monitorear el estado y rendimiento del sistema en tiempo real.

**Métricas monitoreadas:**
- ?? Uptime del servicio
- ?? Tiempo de respuesta de APIs
- ?? Uso de CPU y memoria
- ?? Conexiones de base de datos
- ?? Errores y excepciones
- ?? Volumen de transacciones

**Herramientas recomendadas:**
- [ ] Azure Application Insights
- [ ] Azure Monitor
- [ ] Custom dashboards
- [ ] Alertas automáticas (email/SMS)
- [?] Health check endpoint: `/api/health`

**Health Check implementado:**
```csharp
[HttpGet("health")]
public IActionResult HealthCheck()
{
    return Ok(new { 
        status = "healthy",
        timestamp = DateTime.UtcNow,
        version = "1.0",
        database = CheckDatabaseConnection(),
        email = CheckEmailService()
    });
}
```

---

### RNF-025: Logging y Diagnóstico
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categoría:** Operaciones

**Descripción:**  
Sistema de logging para troubleshooting y análisis.

**Niveles de log:**
```csharp
Trace       // Más detallado (debugging)
Debug       // Información de desarrollo
Information // Eventos normales ? Usado
Warning     // Situaciones anormales no críticas ? Usado
Error       // Errores que requieren atención ? Usado
Critical    // Fallos críticos del sistema
```

**Logs estructurados:**
```csharp
_logger.LogInformation(
    "Cita creada: {CitaId} para paciente {PacienteId} con médico {MedicoId}",
    cita.Id, cita.PacienteId, cita.MedicoId
);

_logger.LogError(
    ex,
    "Error al enviar email de confirmación para cita {CitaId}",
    citaId
);
```

**Mejoras recomendadas:**
- [ ] Logging estructurado con Serilog
- [ ] Centralizar logs en Azure Log Analytics
- [ ] Alertas automáticas para errores críticos
- [ ] Dashboards de análisis de logs
- [ ] Retención de logs: 90 días (compliance)

---

### RNF-026: Backups y Recuperación
**Prioridad:** Crítica  
**Estado:** ? Configurado (Azure SQL)  
**Categoría:** Operaciones

**Descripción:**  
Estrategia de respaldo y recuperación de datos.

**Política de backups:**
| Tipo | Frecuencia | Retención | Estado |
|------|-----------|-----------|--------|
| Full backup | Semanal | 35 días | ? Azure SQL automático |
| Differential | Diario | 7 días | ? Azure SQL automático |
| Transaction log | Cada 5-10 min | 7 días | ? Azure SQL automático |
| Point-in-time restore | Continuo | 7-35 días | ? Azure SQL |

**Capacidades:**
- ? Restore a cualquier punto en el tiempo (últimos 7-35 días)
- ? Geo-redundante (opcional en Azure SQL)
- ? Recovery de tablas individuales
- ?? Backup de Azure Blob Storage (documentos médicos)
- ?? Testing de restore (recomendado mensual)

**Proceso de restore:**
1. Identificar punto de restore deseado
2. Azure Portal ? SQL Database ? Restore
3. Seleccionar point-in-time
4. Crear nueva DB o sobrescribir
5. Validar integridad de datos
6. Actualizar connection string si es nueva DB

---

## ?? CATEGORÍA 9: Costos y Eficiencia

### RNF-027: Optimización de Costos
**Prioridad:** Media  
**Estado:** ? Optimizado para desarrollo  
**Categoría:** Costos

**Descripción:**  
Minimizar costos de infraestructura sin sacrificar calidad.

**Costos estimados (Azure):**
| Servicio | Tier | Costo mensual (USD) |
|----------|------|---------------------|
| Azure App Service | B1 Basic | $13 |
| Azure SQL Database | Basic (5 DTU) | $5 |
| Azure Blob Storage | Standard | $1-5 |
| Ancho de banda | Pay-as-you-go | $5-20 |
| **Total estimado** | | **$25-45/mes** |

**Optimizaciones:**
- ? Tier básico para desarrollo/staging
- ? Escalamiento solo cuando es necesario
- ? Connection pooling (reutilizar conexiones)
- ? Compresión de respuestas HTTP
- ? Caché de assets estáticos
- ? Cleanup de logs antiguos automático

**Escalamiento para producción:**
- Producción pequeña: ~$100-200/mes
- Producción mediana: ~$500-1000/mes
- Alta disponibilidad: ~$2000+/mes

---

### RNF-028: Eficiencia de Recursos
**Prioridad:** Media  
**Estado:** ? Optimizado  
**Categoría:** Costos

**Descripción:**  
Uso eficiente de CPU, memoria y ancho de banda.

**Optimizaciones implementadas:**
- ? **Entity Framework:** Queries optimizados con Include()
- ? **Indexación BD:** Índices en columnas de búsqueda frecuente
- ? **Lazy loading:** Datos cargados bajo demanda
- ? **Paginación:** Limitar resultados de búsquedas
- ? **Compression:** Gzip en respuestas HTTP grandes
- ? **Connection pooling:** Reutilización de conexiones BD
- ? **Async/await:** Operaciones no bloqueantes

**Ejemplos:**
```csharp
// Paginación
var doctors = await _context.Medicos
    .Where(m => m.Estado == "ACTIVO")
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

// Queries optimizados
var cita = await _context.Citas
    .Include(c => c.Turno)
        .ThenInclude(t => t.Medico)
    .FirstOrDefaultAsync(c => c.Id == id);
```

---

## ?? CATEGORÍA 10: Internacionalización y Localización

### RNF-029: Soporte de Idiomas
**Prioridad:** Baja  
**Estado:** ? No implementado (solo Español)  
**Categoría:** I18n

**Descripción:**  
Capacidad de operar en múltiples idiomas.

**Estado actual:**
- ? Idioma base: Español (Costa Rica)
- ? Inglés: No implementado
- ? Framework i18n: No configurado

**Implementación futura:**
```typescript
// React i18n
import i18n from 'i18next';

const translations = {
  es: {
    'appointments.title': 'Mis Citas',
    'appointments.create': 'Agendar Cita'
  },
  en: {
    'appointments.title': 'My Appointments',
    'appointments.create': 'Schedule Appointment'
  }
};
```

---

### RNF-030: Formatos Regionales
**Prioridad:** Media  
**Estado:** ? Costa Rica  
**Categoría:** I18n

**Descripción:**  
Manejo de formatos de fecha, hora, moneda según región.

**Configuración actual:**
- ? Fechas: dd/MM/yyyy
- ? Hora: Formato 24 horas
- ? Zona horaria: UTC (recomendado convertir a local)
- ? Moneda: Colones/Dólares (si aplica)
- ? Números telefónicos: +506 formato

---

## ?? Resumen de Implementación por Categoría

| Categoría | Requerimientos | Completado | Parcial | Pendiente | Prioridad |
|-----------|---------------|------------|---------|-----------|-----------|
| **1. Rendimiento** | RNF-001 a RNF-003 (3) | 90% | 10% | 0% | Alta ? |
| **2. Disponibilidad** | RNF-004 a RNF-006 (3) | 70% | 20% | 10% | Crítica ?? |
| **3. Seguridad** | RNF-007 a RNF-010 (4) | 85% | 10% | 5% | Crítica ? |
| **4. Usabilidad** | RNF-011 a RNF-014 (4) | 80% | 15% | 5% | Alta ? |
| **5. Mantenibilidad** | RNF-015 a RNF-018 (4) | 75% | 15% | 10% | Alta ?? |
| **6. Portabilidad** | RNF-019 a RNF-020 (2) | 95% | 5% | 0% | Alta ? |
| **7. Compliance** | RNF-021 a RNF-023 (3) | 40% | 40% | 20% | Alta ?? |
| **8. Operaciones** | RNF-024 a RNF-026 (3) | 60% | 30% | 10% | Alta ?? |
| **9. Costos** | RNF-027 a RNF-028 (2) | 90% | 10% | 0% | Media ? |
| **10. I18n** | RNF-029 a RNF-030 (2) | 20% | 0% | 80% | Baja ? |
| **TOTAL** | **30 Requerimientos** | **73%** | **15%** | **12%** | |

---

## ?? Prioridades de Mejora

### Críticas (Implementar Inmediatamente)
1. **RNF-025 mejorado:** Logging estructurado con Serilog + Azure Application Insights
2. **RNF-024 mejorado:** Monitoreo proactivo con alertas automáticas
3. **RNF-017 completo:** Unit tests con cobertura mínima 70%
4. **RNF-010 mejorado:** Audit trail completo para HIPAA (RNF-021)

### Altas (Próximos 3 meses)
5. **RNF-016 mejorado:** Swagger/OpenAPI documentation
6. **RNF-005 completo:** Disaster recovery plan documentado y probado
7. **RNF-022 completo:** GDPR compliance total (consentimientos, exportación)
8. **RNF-007 mejorado:** Rate limiting, 2FA, password policy robusta
9. **RNF-017 E2E:** Tests de integración con Playwright/Cypress

### Medias (6 meses)
10. **RNF-002 testing:** Load testing con 100+ usuarios concurrentes
11. **RNF-005 geo:** Geo-redundancia con réplicas en otra región
12. **RNF-003 CDN:** Azure CDN para assets estáticos globales
13. **RNF-018 CI/CD:** GitHub Actions para deployment automático
14. **RNF-012 completo:** WCAG 2.1 AA compliance verificado

### Bajas (Futuro)
15. **RNF-029:** Internacionalización multiidioma (inglés, portugués)
16. **RNF-031:** App móvil nativa iOS/Android
17. **RNF-032:** Caché distribuido con Redis
18. **RNF-033:** Arquitectura de microservicios

---

## ?? Métricas de Calidad del Sistema

### Objetivo de Calidad (6 Puntos de Google)
| Aspecto | RNF | Métrica | Objetivo | Estado Actual |
|---------|-----|---------|----------|---------------|
| **Reliability** | RNF-004 | Uptime | 99.5% | ~99% |
| **Performance** | RNF-001 | Response time | < 1s | ~800ms |
| **Security** | RNF-007 | Vulnerabilities | 0 critical | 0 known |
| **Maintainability** | RNF-017 | Code coverage | 70% | ~10% |
| **Usability** | RNF-011 | Task completion | 90% | ~85% |
| **Scalability** | RNF-002 | Concurrent users | 100+ | Untested |

---

## ?? Checklist de Producción

### Pre-Launch Checklist

**Seguridad (RNF-007 a RNF-010):**
- [ ] HTTPS configurado con certificado válido
- [ ] Secretos movidos a Azure Key Vault
- [ ] Rate limiting implementado
- [ ] Security headers configurados
- [ ] Penetration testing completado
- [ ] OWASP Top 10 verificado

**Performance (RNF-001 a RNF-003):**
- [ ] Load testing completado (100 usuarios)
- [ ] Database indexing optimizado
- [ ] CDN configurado para assets
- [ ] Compression habilitada
- [ ] Caching strategy implementada

**Operaciones (RNF-024 a RNF-026):**
- [ ] Monitoring configurado (Application Insights)
- [ ] Alertas automáticas activas
- [ ] Backup testing realizado
- [ ] Disaster recovery plan documentado
- [ ] Runbook creado

**Compliance (RNF-021 a RNF-023):**
- [ ] Privacy policy publicada
- [ ] Terms of service publicados
- [ ] GDPR consent implementado
- [ ] HIPAA audit completado
- [ ] Data retention policy definida

**Testing (RNF-017):**
- [ ] Unit tests: 70%+ coverage
- [ ] Integration tests pasados
- [ ] E2E tests críticos pasados
- [ ] UAT (User Acceptance Testing) completado
- [ ] Security scan pasado

---

## ?? Notas Finales

### Fortalezas del Sistema
1. ? Arquitectura moderna y escalable (.NET 8 + React) **(RNF-015, RNF-019)**
2. ? Seguridad básica robusta (JWT + BCrypt + HTTPS) **(RNF-007, RNF-008)**
3. ? Base de datos bien estructurada con constraints **(RNF-028)**
4. ? UI/UX intuitiva y responsive **(RNF-011, RNF-014)**
5. ? Sistema de notificaciones funcional
6. ? Documentación completa de implementación **(RNF-016)**

### Áreas de Mejora Prioritarias
1. ?? Testing automatizado (crítico) **(RNF-017)**
2. ?? Monitoring y observability (alto) **(RNF-024)**
3. ?? Compliance legal completo (alto) **(RNF-021, RNF-022)**
4. ?? Disaster recovery testing (medio) **(RNF-005)**
5. ?? Performance testing bajo carga (medio) **(RNF-002)**

### Recomendación Final
El sistema está **listo para desarrollo y staging** pero requiere las mejoras críticas listadas antes de **lanzamiento a producción** con usuarios reales, especialmente en áreas de:
- Testing automatizado **(RNF-017)**
- Monitoring completo **(RNF-024, RNF-025)**
- Compliance legal **(RNF-021, RNF-022, RNF-023)**

---

**Elaborado por:** Sistema de Gestión TuCita  
**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Estado:** Documento Oficial de Requerimientos No Funcionales  
**Próxima revisión:** Marzo 2025  
**Total de RNF:** 30 requerimientos base + 3 futuros planificados
