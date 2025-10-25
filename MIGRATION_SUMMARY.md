# Database Migration Summary - Azure SQL Schema

## Overview
This document summarizes the changes made to migrate the TuCita application to use the new Azure SQL database schema.

## Key Schema Changes

### 1. Data Type Changes
- **All ID columns**: Changed from `BIGINT` (mapped to `ulong` in C#) to `long` in C#
- **Especialidad.Id**: Changed from `BIGINT` to `INT`
- **Text columns**: Changed from `TEXT` to `NVARCHAR(MAX)` for SQL Server compatibility

### 2. Removed Fields

#### Usuario table
- ? `token_recuperacion` (VARCHAR(255))
- ? `token_recuperacion_expira` (DATETIME2)

#### PerfilMedico table  
- ? `ciudad` (NVARCHAR(100))
- ? `provincia` (NVARCHAR(100))
- ? `pais` (NVARCHAR(100))
- ? `longitud` (DOUBLE)
- ? `latitud` (DOUBLE)

#### RolUsuario table
- ? `asignado_en` (DATETIME2)

#### Roles and Especialidades tables
- ? `creado_en` (DATETIME2)
- ? `actualizado_en` (DATETIME2)

### 3. NotasClinicas, Diagnosticos Changes
- ? Removed `medico_id` and `paciente_id` (get through `cita_id` relationship)

### 4. EstadoCita Enum Changes
- ? Removed: `REPROGRAMADA`, `NO_ASISTE`
- ? Added: `RECHAZADA`
- ? Kept: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `ATENDIDA`

### 5. New Tables Added

#### Azure Blob Storage Support
- ? `azure_almacen_config` - Blob storage configuration
- ? `documentos_clinicos` - Clinical document metadata
- ? `documento_etiquetas` - Document tags
- ? `documentos_descargas` - Download audit log

## Migration Steps

### Step 1: Update Models ?
- Changed all `ulong` to `long`
- Removed obsolete fields
- Added new Azure Blob Storage models

### Step 2: Update DbContext ?
- Added new DbSets for Azure tables
- Updated relationships and delete behaviors
- Added indexes and check constraints

### Step 3: Update DTOs ?
- Changed all ID types from `ulong` to `long`
- Removed references to deleted fields (Ciudad, Provincia, etc.)

### Step 4: Update Services (IN PROGRESS)
- Fix ID type comparisons (long vs ulong)
- Remove references to deleted fields
- Handle password reset without token fields (use external service)

### Step 5: Update Controllers (IN PROGRESS)
- Fix ID type issues
- Remove references to deleted fields

## Important Notes

### Password Reset Flow
Since `TokenRecuperacion` fields were removed from Usuario table:
- ?? Password reset must use external token storage (Redis, distributed cache, or separate table)
- Alternative: Create new `password_reset_tokens` table
- Recommendation: Use ASP.NET Core Data Protection for temporary tokens

### Location Data
Since Ciudad/Provincia/Pais fields were removed:
- ? Use `Direccion` field for full address
- ? Use `Location` property in DTOs (computed from Direccion)
- Consider: Implement geocoding service if location search is needed

### Appointment States
Update application logic for new states:
- Map `REPROGRAMADA` ? `PENDIENTE` (with note/reason)
- Map `NO_ASISTE` ? `CANCELADA` (with note)
- Use `RECHAZADA` for doctor-rejected appointments

## Database Connection String
```
Server=tcp:{server},1433;Initial Catalog={database};Persist Security Info=False;User ID={user};Password={password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## Next Steps
1. ? Apply SQL script to Azure SQL Database manually
2. ? Update Entity Framework models
3. ?? Fix all compilation errors in Services and Controllers
4. ? Test all endpoints
5. ? Update frontend to handle new data structure
6. ? Implement password reset with external token storage
7. ? Add migration guide for existing data (if any)

## Rollback Plan
If issues occur:
1. Keep backup of old database schema
2. Revert code changes via Git
3. Restore old connection string
4. Run old migrations

---
**Last Updated**: $(Get-Date)
**Migration Status**: Models & DTOs Complete, Services/Controllers In Progress
