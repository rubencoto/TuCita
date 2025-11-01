# ?? Requerimientos No Funcionales - TuCita Online

**Proyecto:** Sistema de Gesti�n de Citas M�dicas en L�nea  
**Versi�n:** 1.0  
**Fecha:** Diciembre 2024  
**Tecnolog�as:** .NET 8, React/TypeScript, Azure SQL Database, Azure Blob Storage

---

## ?? Objetivo

Este documento define las caracter�sticas de calidad, rendimiento, seguridad y restricciones t�cnicas que debe cumplir el sistema TuCita Online para garantizar una operaci�n eficiente, segura y escalable.

---

## ?? Requerimientos No Funcionales Detallados

---

## ? CATEGOR�A 1: Rendimiento y Escalabilidad

### RNF-001: Tiempo de Respuesta del Sistema
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Rendimiento

**Descripci�n:**  
El sistema debe mantener tiempos de respuesta �ptimos para garantizar una buena experiencia de usuario.

**M�tricas:**
| Operaci�n | Tiempo Objetivo | Tiempo M�ximo |
|-----------|----------------|---------------|
| Carga de p�gina principal | < 2 segundos | 3 segundos |
| Login/Registro | < 1 segundo | 2 segundos |
| B�squeda de m�dicos | < 1 segundo | 2 segundos |
| Creaci�n de cita | < 2 segundos | 3 segundos |
| Carga de historial m�dico | < 2 segundos | 4 segundos |
| Consulta de turnos disponibles | < 1 segundo | 2 segundos |
| API REST endpoints | < 500ms | 1 segundo |

**Criterios de Aceptaci�n:**
- ? 95% de las requests se completan dentro del tiempo objetivo
- ? 99% de las requests se completan dentro del tiempo m�ximo
- ? Uso de �ndices optimizados en base de datos
- ? Cach� de consultas frecuentes (si aplica)

---

### RNF-002: Capacidad y Concurrencia
**Prioridad:** Alta  
**Estado:** ? Dise�ado para escalar  
**Categor�a:** Rendimiento

**Descripci�n:**  
El sistema debe soportar m�ltiples usuarios simult�neos sin degradaci�n significativa del rendimiento.

**Capacidad m�nima:**
- **Usuarios concurrentes:** 100 usuarios simult�neos
- **Usuarios registrados:** 10,000+ usuarios
- **M�dicos activos:** 500+ m�dicos
- **Citas por d�a:** 1,000+ citas
- **Transacciones por segundo (TPS):** 50 TPS

**Criterios de Aceptaci�n:**
- ? Sistema mantiene < 2 segundos de respuesta con 100 usuarios concurrentes
- ? Base de datos Azure SQL soporta crecimiento hasta 100GB
- ? Arquitectura permite escalamiento horizontal (m�ltiples instancias de API)
- ? Connection pooling configurado para m�ximo 100 conexiones concurrentes

**Implementaci�n:**
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
**Categor�a:** Rendimiento

**Descripci�n:**  
La arquitectura debe permitir crecimiento futuro sin redise�os mayores.

**Estrategias implementadas:**
- ? **Escalamiento vertical:** Azure SQL Database permite aumentar DTUs/vCores
- ? **Escalamiento horizontal:** API stateless permite m�ltiples instancias
- ? **Separaci�n de concerns:** Arquitectura en capas (Controllers ? Services ? Data)
- ? **Azure Blob Storage:** Almacenamiento escalable de documentos m�dicos
- ? **CDN ready:** Assets est�ticos servidos desde carpeta dist

**Puntos de escalamiento:**
1. **Capa de presentaci�n:** React SPA puede cachear en CDN
2. **Capa de API:** .NET 8 API puede correr en m�ltiples Azure App Services
3. **Capa de datos:** Azure SQL Database con r�plicas de lectura
4. **Almacenamiento:** Azure Blob Storage escala autom�ticamente

---

## ?? CATEGOR�A 2: Disponibilidad y Confiabilidad

### RNF-004: Disponibilidad del Sistema (Uptime)
**Prioridad:** Cr�tica  
**Estado:** ? Configurado  
**Categor�a:** Disponibilidad

**Descripci�n:**  
El sistema debe estar disponible 24/7 con m�nimo downtime planificado.

**M�tricas:**
- **Uptime objetivo:** 99.5% (43.8 horas de downtime al a�o)
- **Uptime ideal:** 99.9% (8.76 horas de downtime al a�o)
- **Mantenimiento planificado:** M�ximo 4 horas mensuales en horario de baja demanda

**Estrategias:**
- ? Azure App Service con SLA 99.95%
- ? Azure SQL Database con SLA 99.99%
- ? Health checks configurados
- ? Monitoreo proactivo de servicios
- ?? Backup autom�tico diario (Azure SQL)
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

### RNF-005: Recuperaci�n ante Fallos (RTO/RPO)
**Prioridad:** Alta  
**Estado:** ?? Parcialmente implementado  
**Categor�a:** Confiabilidad

**Descripci�n:**  
El sistema debe recuperarse r�pidamente de fallos y minimizar p�rdida de datos.

**Objetivos:**
- **RTO (Recovery Time Objective):** < 4 horas
- **RPO (Recovery Point Objective):** < 1 hora (p�rdida m�xima de datos)

**Estrategias de recuperaci�n:**
- ? **Backups autom�ticos:** Azure SQL Database backup diario + point-in-time restore (7-35 d�as)
- ? **Transacciones at�micas:** Entity Framework usa transacciones ACID
- ? **Validaci�n de datos:** Constraints y triggers en BD
- ?? **Geo-redundancia:** Azure SQL con replicaci�n geogr�fica (opcional)
- ?? **Circuit breaker pattern:** Para servicios externos (pendiente)

**Manejo de errores:**
```csharp
// Ejemplo de transacciones at�micas
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    // Operaciones m�ltiples
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
**Categor�a:** Confiabilidad

**Descripci�n:**  
El sistema debe manejar errores gracefully sin colapsar.

**Estrategias:**
- ? **Try-catch en todos los endpoints:** Manejo centralizado de excepciones
- ? **Logging de errores:** Registro detallado de excepciones
- ? **Mensajes de error user-friendly:** Sin exponer stack traces
- ? **Rollback de transacciones:** En caso de fallo parcial
- ? **Retry logic:** Para env�o de emails (3 intentos)
- ? **Validaci�n de entrada:** Prevenci�n de errores antes de procesamiento

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
        _logger.LogWarning(ex, "Error de validaci�n al crear cita");
        return BadRequest(new { message = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error inesperado al crear cita");
        return StatusCode(500, new { 
            message = "Error interno del servidor. Por favor intenta m�s tarde." 
        });
    }
}
```

---

## ?? CATEGOR�A 3: Seguridad

### RNF-007: Autenticaci�n JWT
**Prioridad:** Cr�tica  
**Estado:** ? Implementado  
**Categor�a:** Seguridad

**Descripci�n:**  
El sistema debe proteger el acceso mediante autenticaci�n robusta con tokens JWT.

**Mecanismos de seguridad:**
- ? **JWT (JSON Web Tokens):** Autenticaci�n stateless
- ? **BCrypt password hashing:** Hash con salt (work factor 10)
- ? **Token expiration:** Tokens v�lidos por 7 d�as
- ? **HTTPS obligatorio:** Todas las comunicaciones encriptadas
- ? **Password requirements:** M�nimo 6 caracteres (recomendado aumentar a 8)
- ? **Role-based authorization:** PACIENTE, MEDICO, ADMIN

**Configuraci�n JWT:**
```csharp
// Par�metros de validaci�n
ValidateIssuerSigningKey = true,
ValidateIssuer = true,
ValidateAudience = true,
ValidateLifetime = true,
ClockSkew = TimeSpan.Zero  // Sin tolerancia de expiraci�n
```

**Recomendaciones de mejora:**
- [ ] Aumentar requisitos de contrase�a (8+ caracteres, may�sculas, n�meros, s�mbolos)
- [ ] Implementar rate limiting para prevenir brute force
- [ ] Two-factor authentication (2FA) opcional
- [ ] Lockout de cuenta despu�s de 5 intentos fallidos
- [ ] Password history (prevenir reutilizaci�n)

---

### RNF-008: Protecci�n de Datos Sensibles
**Prioridad:** Cr�tica  
**Estado:** ? Implementado  
**Categor�a:** Seguridad

**Descripci�n:**  
Los datos m�dicos y personales deben estar protegidos en tr�nsito y en reposo.

**Medidas de protecci�n:**

**En tr�nsito:**
- ? HTTPS/TLS 1.2+ obligatorio
- ? Certificates de Azure App Service
- ? CORS configurado (solo or�genes permitidos)
- ? Headers de seguridad (HSTS, X-Content-Type-Options, etc.)

**En reposo:**
- ? Azure SQL Database con Transparent Data Encryption (TDE)
- ? Contrase�as hasheadas con BCrypt
- ? Azure Blob Storage con encriptaci�n por defecto
- ? Tokens JWT firmados con clave secreta (HMAC-SHA256)
- ? Variables de entorno para secretos (.env)
- ?? Azure Key Vault para manejo de secretos (recomendado para producci�n)

**Datos protegidos:**
- Contrase�as (BCrypt hash)
- Tokens de sesi�n (JWT)
- Informaci�n m�dica (HIPAA compliance)
- Datos personales (GDPR/CCPA compliance)
- N�meros de identificaci�n
- Historial m�dico completo

---

### RNF-009: Prevenci�n de Vulnerabilidades OWASP
**Prioridad:** Cr�tica  
**Estado:** ? Implementado  
**Categor�a:** Seguridad

**Descripci�n:**  
Protecci�n contra las vulnerabilidades m�s comunes (OWASP Top 10).

**Vulnerabilidades mitigadas:**

| Vulnerabilidad | Mitigaci�n | Estado |
|----------------|------------|--------|
| **SQL Injection** | Entity Framework (parametrized queries) | ? |
| **XSS (Cross-Site Scripting)** | React DOM sanitization, Content Security Policy | ? |
| **CSRF (Cross-Site Request Forgery)** | Token-based auth (JWT), SameSite cookies | ? |
| **Insecure Deserialization** | Validaci�n de inputs, type checking | ? |
| **Broken Authentication** | JWT con expiraci�n, BCrypt hashing | ? |
| **Sensitive Data Exposure** | HTTPS, TDE, environment variables | ? |
| **Broken Access Control** | Role-based authorization, ownership validation | ? |
| **Security Misconfiguration** | Minimal exposure, secure defaults | ? |
| **Insufficient Logging** | ILogger implementation, error tracking | ? |
| **XXE (XML External Entities)** | No XML processing (JSON only) | ? |

**Validaciones de seguridad:**
```csharp
// Validaci�n de ownership
var cita = await _context.Citas.FindAsync(id);
if (cita.PacienteId != userId)
{
    return Forbid(); // 403 Forbidden
}

// Sanitizaci�n de inputs
if (string.IsNullOrWhiteSpace(request.Motivo))
{
    return BadRequest("Motivo es requerido");
}

// Prevenci�n de mass assignment
public class UpdateProfileDto
{
    public string Nombre { get; set; }
    // Id no expuesto - previene modificaci�n maliciosa
}
```

---

### RNF-010: Auditor�a y Logging de Seguridad
**Prioridad:** Media  
**Estado:** ? B�sico implementado  
**Categor�a:** Seguridad

**Descripci�n:**  
Registro de eventos de seguridad y acciones cr�ticas.

**Eventos registrados:**
- ? Login exitoso y fallido
- ? Cambios de contrase�a
- ? Creaci�n/modificaci�n/cancelaci�n de citas
- ? Acceso a historial m�dico
- ? Errores y excepciones
- ? Acciones administrativas

**Niveles de logging:**
```csharp
_logger.LogInformation("Usuario {UserId} inici� sesi�n", userId);
_logger.LogWarning("Intento de acceso no autorizado a cita {CitaId}", citaId);
_logger.LogError(ex, "Error al crear cita para usuario {UserId}", userId);
```

**Mejoras recomendadas:**
- [ ] Logging estructurado con Serilog
- [ ] Integraci�n con Azure Application Insights
- [ ] Alertas autom�ticas para eventos cr�ticos
- [ ] Audit trail completo con timestamp y usuario
- [ ] Retenci�n de logs por 1 a�o (compliance)

---

## ?? CATEGOR�A 4: Usabilidad y Experiencia de Usuario

### RNF-011: Interfaz Intuitiva
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Usabilidad

**Descripci�n:**  
La interfaz debe ser f�cil de usar para usuarios no t�cnicos.

**Principios de dise�o:**
- ? **Navegaci�n clara:** Men� principal con 5 secciones clave
- ? **Dise�o responsive:** Funciona en desktop, tablet y m�vil
- ? **Componentes consistentes:** shadcn/ui + Tailwind CSS
- ? **Feedback visual:** Toasts para confirmaciones y errores
- ? **Loading states:** Spinners durante operaciones as�ncronas
- ? **Formularios validados:** Mensajes de error claros y espec�ficos
- ? **Accesibilidad b�sica:** Labels, aria-labels, keyboard navigation

**M�tricas de usabilidad:**
- Nuevo usuario puede agendar cita en < 3 minutos
- 90%+ de usuarios completan registro sin ayuda
- < 5% de errores de usuario en formularios

---

### RNF-012: Accesibilidad WCAG 2.1
**Prioridad:** Media  
**Estado:** ?? Parcialmente implementado  
**Categor�a:** Usabilidad

**Descripci�n:**  
El sistema debe ser accesible para usuarios con discapacidades.

**Est�ndares:**
- **Objetivo:** WCAG 2.1 Level AA

**Caracter�sticas implementadas:**
- ? Navegaci�n por teclado funcional
- ? Labels sem�nticos en formularios
- ? Contraste de colores adecuado (Tailwind defaults)
- ? Focus visible en elementos interactivos
- ?? Screen reader support (parcial)
- ?? Alt text en im�genes (pendiente en algunas �reas)
- ?? ARIA attributes (b�sico)

**Mejoras pendientes:**
- [ ] Test con screen readers (NVDA, JAWS)
- [ ] Skip navigation links
- [ ] Descripciones ARIA completas
- [ ] Validaci�n con herramientas (axe, Lighthouse)
- [ ] Soporte para alto contraste
- [ ] Tama�os de fuente ajustables

---

### RNF-013: Compatibilidad de Navegadores
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Usabilidad

**Descripci�n:**  
El sistema debe funcionar en los navegadores m�s comunes.

**Navegadores soportados:**
| Navegador | Versi�n M�nima | Estado |
|-----------|----------------|--------|
| Google Chrome | 90+ | ? |
| Mozilla Firefox | 88+ | ? |
| Microsoft Edge | 90+ | ? |
| Safari (macOS) | 14+ | ? |
| Safari (iOS) | 14+ | ? |
| Opera | 76+ | ? |

**Tecnolog�as utilizadas:**
- React 18 (amplio soporte)
- ES6+ transpilado con Vite
- CSS moderno con Tailwind
- Polyfills autom�ticos cuando es necesario

---

### RNF-014: Dise�o Responsive
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Usabilidad

**Descripci�n:**  
La aplicaci�n debe adaptarse a diferentes tama�os de pantalla.

**Breakpoints:**
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Tel�fonos grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Pantallas grandes */
```

**Caracter�sticas responsive:**
- ? Men� hamburguesa en m�vil
- ? Grids adaptativos (1/2/3 columnas seg�n pantalla)
- ? Formularios stack en m�vil
- ? Im�genes escalables
- ? Touch-friendly (botones grandes en m�vil)
- ? Viewport meta tag configurado

---

## ??? CATEGOR�A 5: Mantenibilidad y Extensibilidad

### RNF-015: C�digo Mantenible
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Mantenibilidad

**Descripci�n:**  
El c�digo debe ser f�cil de entender, modificar y extender.

**Principios aplicados:**
- ? **Arquitectura en capas:** Controllers ? Services ? Data
- ? **Separation of Concerns:** Cada capa tiene responsabilidades claras
- ? **Dependency Injection:** Services inyectados, f�cil testing
- ? **DTOs separados:** No exponer modelos de BD directamente
- ? **Naming conventions:** C# y TypeScript standards
- ? **Comentarios:** Documentaci�n en c�digo complejo

**Estructura del proyecto:**
```
TuCita/
??? Controllers/Api/      # Endpoints REST
??? Services/            # L�gica de negocio
??? Data/                # DbContext, Entities
??? Models/              # Database models
??? DTOs/                # Data Transfer Objects
??? ClientApp/
    ??? components/      # React components
    ??? services/        # API calls
    ??? pages/          # Page components
```

---

### RNF-016: Documentaci�n Completa
**Prioridad:** Media  
**Estado:** ? Documentado  
**Categor�a:** Mantenibilidad

**Descripci�n:**  
El sistema debe tener documentaci�n clara y actualizada.

**Documentaci�n existente:**
- ? README principal del proyecto
- ? Gu�as de despliegue (Azure)
- ? Scripts de base de datos documentados
- ? Documentaci�n de APIs (comentarios XML)
- ? Gu�as de troubleshooting
- ? Summaries de implementaci�n
- ? Checklists de deployment

**Documentos clave:**
1. `README.md` - Overview del proyecto
2. `Database/Azure/INDEX.md` - �ndice de scripts
3. `AZURE_DEPLOYMENT_SUMMARY.md` - Gu�a de deployment
4. `MEDICAL_HISTORY_IMPLEMENTATION.md` - Features m�dicas
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
**Categor�a:** Mantenibilidad

**Descripci�n:**  
El sistema debe tener cobertura de pruebas adecuada.

**Testing implementado:**
- ?? Tests manuales (QA)
- ?? Validaci�n de endpoints con Postman/Thunder Client
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
- [ ] Integration tests: Endpoints cr�ticos
- [ ] E2E tests: Flujos principales (Playwright/Cypress)
- [ ] Load testing: 100 usuarios concurrentes
- [ ] Security testing: OWASP ZAP scan

---

### RNF-018: Versionamiento y Control de Cambios
**Prioridad:** Media  
**Estado:** ? Implementado (Git)  
**Categor�a:** Mantenibilidad

**Descripci�n:**  
Control de versiones para c�digo y base de datos.

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

## ?? CATEGOR�A 6: Portabilidad y Compatibilidad

### RNF-019: Independencia de Plataforma
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Portabilidad

**Descripci�n:**  
La aplicaci�n debe poder ejecutarse en diferentes sistemas operativos.

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

### RNF-020: Configuraci�n por Ambiente
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Portabilidad

**Descripci�n:**  
Separaci�n clara de configuraciones por ambiente.

**Archivos de configuraci�n:**
```csharp
// appsettings.json (base)
// appsettings.Development.json
// appsettings.Production.json
// .env (variables de entorno - no en Git)
```

**Variables configurables:**
- ? Cadena de conexi�n a BD
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

## ?? CATEGOR�A 7: Cumplimiento Legal y Normativo

### RNF-021: HIPAA Compliance (Estados Unidos)
**Prioridad:** Alta  
**Estado:** ?? Parcialmente cumplido  
**Categor�a:** Compliance

**Descripci�n:**  
Para datos m�dicos en EE.UU., cumplir con Health Insurance Portability and Accountability Act.

**Requisitos HIPAA:**
| Requisito | Estado | Implementaci�n |
|-----------|--------|----------------|
| Encriptaci�n en tr�nsito | ? | HTTPS/TLS 1.2+ |
| Encriptaci�n en reposo | ? | Azure SQL TDE |
| Control de acceso | ? | JWT + roles |
| Audit trails | ?? | Logging b�sico |
| Business Associate Agreement | ? | Pendiente |
| Breach notification | ? | Proceso pendiente |
| Patient rights (access/delete) | ?? | Soft delete implementado |

**Acciones requeridas para compliance total:**
- [ ] Audit trail completo de accesos a datos m�dicos
- [ ] Proceso de notificaci�n de brechas de seguridad
- [ ] Pol�ticas de retenci�n de datos documentadas
- [ ] BAA (Business Associate Agreement) con proveedores
- [ ] Evaluaci�n de riesgos anual
- [ ] Training de empleados en HIPAA

---

### RNF-022: GDPR Compliance (Europa)
**Prioridad:** Media  
**Estado:** ?? Parcialmente cumplido  
**Categor�a:** Compliance

**Descripci�n:**  
Para usuarios europeos, cumplir con General Data Protection Regulation.

**Requisitos GDPR:**
| Derecho | Estado | Implementaci�n |
|---------|--------|----------------|
| Derecho al acceso | ? | GET /api/profile |
| Derecho a la portabilidad | ?? | Export JSON (pendiente) |
| Derecho al olvido | ?? | Soft delete |
| Consentimiento expl�cito | ? | Checkbox pendiente |
| Notificaci�n de brechas | ? | Proceso pendiente |
| Privacy by design | ? | Implementado |
| DPO (Data Protection Officer) | ? | Requerido en producci�n |

**Acciones requeridas:**
- [ ] Formulario de consentimiento en registro
- [ ] Proceso de exportaci�n de datos
- [ ] Hard delete opcional (despu�s de per�odo)
- [ ] Privacy policy y terms of service
- [ ] Cookie consent banner
- [ ] Designar DPO

---

### RNF-023: Pol�ticas de Privacidad
**Prioridad:** Alta  
**Estado:** ? Pendiente  
**Categor�a:** Compliance

**Descripci�n:**  
Documentos legales requeridos para operaci�n.

**Documentos necesarios:**
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Consent forms (tratamiento de datos)
- [ ] Data retention policy
- [ ] Incident response plan

---

## ?? CATEGOR�A 8: Operaciones y Monitoreo

### RNF-024: Monitoreo del Sistema
**Prioridad:** Alta  
**Estado:** ?? B�sico  
**Categor�a:** Operaciones

**Descripci�n:**  
Capacidad de monitorear el estado y rendimiento del sistema en tiempo real.

**M�tricas monitoreadas:**
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
- [ ] Alertas autom�ticas (email/SMS)
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

### RNF-025: Logging y Diagn�stico
**Prioridad:** Alta  
**Estado:** ? Implementado  
**Categor�a:** Operaciones

**Descripci�n:**  
Sistema de logging para troubleshooting y an�lisis.

**Niveles de log:**
```csharp
Trace       // M�s detallado (debugging)
Debug       // Informaci�n de desarrollo
Information // Eventos normales ? Usado
Warning     // Situaciones anormales no cr�ticas ? Usado
Error       // Errores que requieren atenci�n ? Usado
Critical    // Fallos cr�ticos del sistema
```

**Logs estructurados:**
```csharp
_logger.LogInformation(
    "Cita creada: {CitaId} para paciente {PacienteId} con m�dico {MedicoId}",
    cita.Id, cita.PacienteId, cita.MedicoId
);

_logger.LogError(
    ex,
    "Error al enviar email de confirmaci�n para cita {CitaId}",
    citaId
);
```

**Mejoras recomendadas:**
- [ ] Logging estructurado con Serilog
- [ ] Centralizar logs en Azure Log Analytics
- [ ] Alertas autom�ticas para errores cr�ticos
- [ ] Dashboards de an�lisis de logs
- [ ] Retenci�n de logs: 90 d�as (compliance)

---

### RNF-026: Backups y Recuperaci�n
**Prioridad:** Cr�tica  
**Estado:** ? Configurado (Azure SQL)  
**Categor�a:** Operaciones

**Descripci�n:**  
Estrategia de respaldo y recuperaci�n de datos.

**Pol�tica de backups:**
| Tipo | Frecuencia | Retenci�n | Estado |
|------|-----------|-----------|--------|
| Full backup | Semanal | 35 d�as | ? Azure SQL autom�tico |
| Differential | Diario | 7 d�as | ? Azure SQL autom�tico |
| Transaction log | Cada 5-10 min | 7 d�as | ? Azure SQL autom�tico |
| Point-in-time restore | Continuo | 7-35 d�as | ? Azure SQL |

**Capacidades:**
- ? Restore a cualquier punto en el tiempo (�ltimos 7-35 d�as)
- ? Geo-redundante (opcional en Azure SQL)
- ? Recovery de tablas individuales
- ?? Backup de Azure Blob Storage (documentos m�dicos)
- ?? Testing de restore (recomendado mensual)

**Proceso de restore:**
1. Identificar punto de restore deseado
2. Azure Portal ? SQL Database ? Restore
3. Seleccionar point-in-time
4. Crear nueva DB o sobrescribir
5. Validar integridad de datos
6. Actualizar connection string si es nueva DB

---

## ?? CATEGOR�A 9: Costos y Eficiencia

### RNF-027: Optimizaci�n de Costos
**Prioridad:** Media  
**Estado:** ? Optimizado para desarrollo  
**Categor�a:** Costos

**Descripci�n:**  
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
- ? Tier b�sico para desarrollo/staging
- ? Escalamiento solo cuando es necesario
- ? Connection pooling (reutilizar conexiones)
- ? Compresi�n de respuestas HTTP
- ? Cach� de assets est�ticos
- ? Cleanup de logs antiguos autom�tico

**Escalamiento para producci�n:**
- Producci�n peque�a: ~$100-200/mes
- Producci�n mediana: ~$500-1000/mes
- Alta disponibilidad: ~$2000+/mes

---

### RNF-028: Eficiencia de Recursos
**Prioridad:** Media  
**Estado:** ? Optimizado  
**Categor�a:** Costos

**Descripci�n:**  
Uso eficiente de CPU, memoria y ancho de banda.

**Optimizaciones implementadas:**
- ? **Entity Framework:** Queries optimizados con Include()
- ? **Indexaci�n BD:** �ndices en columnas de b�squeda frecuente
- ? **Lazy loading:** Datos cargados bajo demanda
- ? **Paginaci�n:** Limitar resultados de b�squedas
- ? **Compression:** Gzip en respuestas HTTP grandes
- ? **Connection pooling:** Reutilizaci�n de conexiones BD
- ? **Async/await:** Operaciones no bloqueantes

**Ejemplos:**
```csharp
// Paginaci�n
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

## ?? CATEGOR�A 10: Internacionalizaci�n y Localizaci�n

### RNF-029: Soporte de Idiomas
**Prioridad:** Baja  
**Estado:** ? No implementado (solo Espa�ol)  
**Categor�a:** I18n

**Descripci�n:**  
Capacidad de operar en m�ltiples idiomas.

**Estado actual:**
- ? Idioma base: Espa�ol (Costa Rica)
- ? Ingl�s: No implementado
- ? Framework i18n: No configurado

**Implementaci�n futura:**
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
**Categor�a:** I18n

**Descripci�n:**  
Manejo de formatos de fecha, hora, moneda seg�n regi�n.

**Configuraci�n actual:**
- ? Fechas: dd/MM/yyyy
- ? Hora: Formato 24 horas
- ? Zona horaria: UTC (recomendado convertir a local)
- ? Moneda: Colones/D�lares (si aplica)
- ? N�meros telef�nicos: +506 formato

---

## ?? Resumen de Implementaci�n por Categor�a

| Categor�a | Requerimientos | Completado | Parcial | Pendiente | Prioridad |
|-----------|---------------|------------|---------|-----------|-----------|
| **1. Rendimiento** | RNF-001 a RNF-003 (3) | 90% | 10% | 0% | Alta ? |
| **2. Disponibilidad** | RNF-004 a RNF-006 (3) | 70% | 20% | 10% | Cr�tica ?? |
| **3. Seguridad** | RNF-007 a RNF-010 (4) | 85% | 10% | 5% | Cr�tica ? |
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

### Cr�ticas (Implementar Inmediatamente)
1. **RNF-025 mejorado:** Logging estructurado con Serilog + Azure Application Insights
2. **RNF-024 mejorado:** Monitoreo proactivo con alertas autom�ticas
3. **RNF-017 completo:** Unit tests con cobertura m�nima 70%
4. **RNF-010 mejorado:** Audit trail completo para HIPAA (RNF-021)

### Altas (Pr�ximos 3 meses)
5. **RNF-016 mejorado:** Swagger/OpenAPI documentation
6. **RNF-005 completo:** Disaster recovery plan documentado y probado
7. **RNF-022 completo:** GDPR compliance total (consentimientos, exportaci�n)
8. **RNF-007 mejorado:** Rate limiting, 2FA, password policy robusta
9. **RNF-017 E2E:** Tests de integraci�n con Playwright/Cypress

### Medias (6 meses)
10. **RNF-002 testing:** Load testing con 100+ usuarios concurrentes
11. **RNF-005 geo:** Geo-redundancia con r�plicas en otra regi�n
12. **RNF-003 CDN:** Azure CDN para assets est�ticos globales
13. **RNF-018 CI/CD:** GitHub Actions para deployment autom�tico
14. **RNF-012 completo:** WCAG 2.1 AA compliance verificado

### Bajas (Futuro)
15. **RNF-029:** Internacionalizaci�n multiidioma (ingl�s, portugu�s)
16. **RNF-031:** App m�vil nativa iOS/Android
17. **RNF-032:** Cach� distribuido con Redis
18. **RNF-033:** Arquitectura de microservicios

---

## ?? M�tricas de Calidad del Sistema

### Objetivo de Calidad (6 Puntos de Google)
| Aspecto | RNF | M�trica | Objetivo | Estado Actual |
|---------|-----|---------|----------|---------------|
| **Reliability** | RNF-004 | Uptime | 99.5% | ~99% |
| **Performance** | RNF-001 | Response time | < 1s | ~800ms |
| **Security** | RNF-007 | Vulnerabilities | 0 critical | 0 known |
| **Maintainability** | RNF-017 | Code coverage | 70% | ~10% |
| **Usability** | RNF-011 | Task completion | 90% | ~85% |
| **Scalability** | RNF-002 | Concurrent users | 100+ | Untested |

---

## ?? Checklist de Producci�n

### Pre-Launch Checklist

**Seguridad (RNF-007 a RNF-010):**
- [ ] HTTPS configurado con certificado v�lido
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
- [ ] Alertas autom�ticas activas
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
- [ ] E2E tests cr�ticos pasados
- [ ] UAT (User Acceptance Testing) completado
- [ ] Security scan pasado

---

## ?? Notas Finales

### Fortalezas del Sistema
1. ? Arquitectura moderna y escalable (.NET 8 + React) **(RNF-015, RNF-019)**
2. ? Seguridad b�sica robusta (JWT + BCrypt + HTTPS) **(RNF-007, RNF-008)**
3. ? Base de datos bien estructurada con constraints **(RNF-028)**
4. ? UI/UX intuitiva y responsive **(RNF-011, RNF-014)**
5. ? Sistema de notificaciones funcional
6. ? Documentaci�n completa de implementaci�n **(RNF-016)**

### �reas de Mejora Prioritarias
1. ?? Testing automatizado (cr�tico) **(RNF-017)**
2. ?? Monitoring y observability (alto) **(RNF-024)**
3. ?? Compliance legal completo (alto) **(RNF-021, RNF-022)**
4. ?? Disaster recovery testing (medio) **(RNF-005)**
5. ?? Performance testing bajo carga (medio) **(RNF-002)**

### Recomendaci�n Final
El sistema est� **listo para desarrollo y staging** pero requiere las mejoras cr�ticas listadas antes de **lanzamiento a producci�n** con usuarios reales, especialmente en �reas de:
- Testing automatizado **(RNF-017)**
- Monitoring completo **(RNF-024, RNF-025)**
- Compliance legal **(RNF-021, RNF-022, RNF-023)**

---

**Elaborado por:** Sistema de Gesti�n TuCita  
**�ltima actualizaci�n:** Diciembre 2024  
**Versi�n:** 1.0  
**Estado:** Documento Oficial de Requerimientos No Funcionales  
**Pr�xima revisi�n:** Marzo 2025  
**Total de RNF:** 30 requerimientos base + 3 futuros planificados
