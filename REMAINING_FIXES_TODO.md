# Remaining Compilation Fixes - Azure SQL Schema Migration

## Status: ?? IN PROGRESS

### ? Completed
- [x] Models updated (DatabaseModels.cs)
- [x] DbContext updated (TuCitaDbContext.cs)
- [x] DbInitializer updated
- [x] All DTOs updated (Auth, Appointments, Doctors, Profile)
- [x] AuthService.cs fixed (ID types + removed TokenRecuperacion)
- [x] ProfileService.cs fixed (ID types)
- [x] Migration summary document created

### ?? In Progress / Remaining

#### Services to Fix

1. **DoctorsService.cs** - Multiple issues:
   - Change `ulong` to `long` for ID comparisons
   - Remove references to: `Ciudad`, `Provincia`, `Pais` from PerfilMedico
   - Update Location logic to use only `Direccion` field
   - Lines to fix: 46, 64-66, 93, 110-112, 158, 186-193

2. **AppointmentsService.cs** - Multiple issues:
   - Change `ulong` to `long` for ID comparisons and types
   - Remove `CiudadMedico` references from CitaDto
   - Lines to fix: 35, 47, 88, 93, 115, 139, 174

#### Controllers to Fix

3. **AppointmentsController.cs**:
   - Remove `CiudadMedico` property references
   - Lines to fix: 43, 45, 92, 94

4. **DoctorsController.cs**:
   - Remove `Ciudad`, `Provincia`, `Pais` property references
   - Lines to fix: 46-48, 92-94

#### Detailed Fix Instructions

### DoctorsService.cs Fixes

```csharp
// Line 46, 64-66: Remove Ciudad/Provincia/Pais filtering
// OLD:
if (!string.IsNullOrEmpty(ciudad))
{
    query = query.Where(m => m.Ciudad != null && m.Ciudad.Contains(ciudad));
}
// ... similar for Provincia, Pais

// NEW: Use Direccion for location filtering
if (!string.IsNullOrEmpty(ciudad))
{
    query = query.Where(m => m.Direccion != null && m.Direccion.Contains(ciudad));
}

// Lines 110-112: Remove from DTO mapping
// REMOVE these lines:
Ciudad = medico.Ciudad,
Provincia = medico.Provincia,
Pais = medico.Pais,

// Lines 186-193: Update location filtering
// Replace Ciudad/Provincia/Pais checks with Direccion check
if (!string.IsNullOrEmpty(ciudadQuery))
{
    filtered = filtered.Where(m => m.Direccion != null && 
        m.Direccion.Contains(ciudadQuery, StringComparison.OrdinalIgnoreCase));
}
```

### AppointmentsService.cs Fixes

```csharp
// Line 35, 139, 174: Fix ID comparison
// OLD:
.FirstOrDefaultAsync(c => c.Id == citaId && c.PacienteId == userId);

// NEW (cast to long or change parameter types):
.FirstOrDefaultAsync(c => c.Id == citaId && c.PacienteId == userId);

// Line 47, 115: Remove CiudadMedico
// REMOVE:
CiudadMedico = cita.Medico.Ciudad,

// Lines 88, 93: Fix turno/medico ID types
// Change method signatures to use long instead of ulong if needed
```

### Controllers Fixes

```csharp
// AppointmentsController.cs lines 43, 45, 92, 94
// DoctorsController.cs lines 46-48, 92-94

// Simply remove the assignments for deleted properties:
// REMOVE:
Ciudad = doctor.Ciudad,
Provincia = doctor.Provincia,
Pais = doctor.Pais,
CiudadMedico = appointment.Medico.Ciudad,
```

## Quick Fix Commands

### For ID Type Issues
Find and replace in Services:
- `ulong userId` ? `long userId`
- `ulong citaId` ? `long citaId`
- `ulong medicoId` ? `long medicoId`
- `ulong turnoId` ? `long turnoId`

### For Removed Fields
Find and remove in Services/Controllers:
- `Ciudad`, `Provincia`, `Pais` from PerfilMedico
- `CiudadMedico` from CitaDto mappings
- `TokenRecuperacion`, `TokenRecuperacionExpira` from Usuario
- `AsignadoEn` from RolUsuario

## Testing Checklist

After fixes:
- [ ] Build succeeds with no errors
- [ ] Test user registration
- [ ] Test user login
- [ ] Test doctor listing
- [ ] Test appointment creation
- [ ] Test profile update
- [ ] Verify JWT token generation
- [ ] Test database connections

## Password Reset Implementation Options

Since `TokenRecuperacion` was removed, implement one of:

### Option 1: Redis/Distributed Cache (Recommended)
```csharp
// In Startup/Program.cs:
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = Environment.GetEnvironmentVariable("REDIS_CONNECTION");
});

// In AuthService:
private readonly IDistributedCache _cache;

await _cache.SetStringAsync($"reset:{token}", userId.ToString(), 
    new DistributedCacheEntryOptions { 
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) 
    });
```

### Option 2: Separate Table
```sql
CREATE TABLE dbo.password_reset_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token NVARCHAR(128) NOT NULL,
    expira_en DATETIME2(6) NOT NULL,
    usado BIT DEFAULT 0,
    creado_en DATETIME2(6) DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id) ON DELETE CASCADE
);
CREATE INDEX IX_reset_tokens_token ON dbo.password_reset_tokens(token) WHERE usado = 0;
```

### Option 3: Memory Cache (Development Only)
```csharp
builder.Services.AddMemoryCache();
// Use IMemoryCache in AuthService
```

## Environment Variables Required

Ensure `.env` file has:
```
DB_SERVER=your-server.database.windows.net
DB_PORT=1433
DB_NAME=tco_db
DB_USER=your-admin-user
DB_PASSWORD=your-secure-password

JWT_KEY=your-super-secret-jwt-key-min-32-chars
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers
JWT_EXPIRY_MINUTES=60

# Optional for password reset:
REDIS_CONNECTION=localhost:6379
```

## Priority Order

1. **HIGH**: Fix all ID type mismatches (Services + Controllers)
2. **HIGH**: Remove all references to deleted fields
3. **MEDIUM**: Implement password reset with cache/table
4. **LOW**: Add unit tests for new schema
5. **LOW**: Update API documentation

---
**Last Updated**: Current Session
**Estimated Time to Complete**: 30-45 minutes for remaining fixes
