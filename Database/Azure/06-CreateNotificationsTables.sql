-- =============================================
-- Script: Crear Tablas de Sistema de Notificaciones
-- Fecha: 2024
-- Descripción: Crea las tablas necesarias para el sistema de notificaciones
-- =============================================

USE TuCitaDB;
GO

-- =============================================
-- Tabla: notificaciones
-- Descripción: Almacena todas las notificaciones enviadas y pendientes
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notificaciones')
BEGIN
    CREATE TABLE notificaciones (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        usuario_id BIGINT NOT NULL,
        cita_id BIGINT NULL,
        tipo NVARCHAR(30) NOT NULL,
        canal NVARCHAR(20) NOT NULL,
        asunto NVARCHAR(200) NOT NULL,
        mensaje NVARCHAR(MAX) NOT NULL,
        estado NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        fecha_programada DATETIME2 NULL,
        fecha_enviada DATETIME2 NULL,
        intentos INT NOT NULL DEFAULT 0,
        mensaje_error NVARCHAR(500) NULL,
        creado_en DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        actualizado_en DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Claves foráneas
        CONSTRAINT FK_notificaciones_usuario FOREIGN KEY (usuario_id) 
            REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT FK_notificaciones_cita FOREIGN KEY (cita_id) 
            REFERENCES citas(id) ON DELETE CASCADE,
        
        -- Constraints
        CONSTRAINT CK_notificaciones_tipo CHECK (tipo IN (
            'CITA_CREADA', 
            'CITA_CONFIRMADA', 
            'CITA_CANCELADA', 
            'CITA_REPROGRAMADA', 
            'RECORDATORIO_24H', 
            'RECORDATORIO_4H', 
            'CITA_PROXIMA'
        )),
        CONSTRAINT CK_notificaciones_canal CHECK (canal IN ('EMAIL', 'SMS', 'PUSH')),
        CONSTRAINT CK_notificaciones_estado CHECK (estado IN (
            'PENDIENTE', 
            'ENVIADA', 
            'FALLIDA', 
            'CANCELADA'
        ))
    );

    -- Índices para optimizar consultas
    CREATE NONCLUSTERED INDEX IX_notificaciones_usuario_id 
        ON notificaciones(usuario_id);
    
    CREATE NONCLUSTERED INDEX IX_notificaciones_cita_id 
        ON notificaciones(cita_id) WHERE cita_id IS NOT NULL;
    
    CREATE NONCLUSTERED INDEX IX_notificaciones_estado_fecha 
        ON notificaciones(estado, fecha_programada) 
        WHERE estado = 'PENDIENTE' AND fecha_programada IS NOT NULL;
    
    CREATE NONCLUSTERED INDEX IX_notificaciones_tipo_estado 
        ON notificaciones(tipo, estado);

    PRINT '? Tabla notificaciones creada exitosamente';
END
ELSE
BEGIN
    PRINT '?? La tabla notificaciones ya existe';
END
GO

-- =============================================
-- Tabla: preferencias_notificacion
-- Descripción: Almacena las preferencias de notificación de cada usuario
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'preferencias_notificacion')
BEGIN
    CREATE TABLE preferencias_notificacion (
        usuario_id BIGINT PRIMARY KEY,
        email_citas_nuevas BIT NOT NULL DEFAULT 1,
        email_confirmaciones BIT NOT NULL DEFAULT 1,
        email_cancelaciones BIT NOT NULL DEFAULT 1,
        email_recordatorios BIT NOT NULL DEFAULT 1,
        sms_recordatorios BIT NOT NULL DEFAULT 0,
        recordatorio_24h BIT NOT NULL DEFAULT 1,
        recordatorio_4h BIT NOT NULL DEFAULT 1,
        creado_en DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        actualizado_en DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Clave foránea
        CONSTRAINT FK_preferencias_notificacion_usuario FOREIGN KEY (usuario_id) 
            REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- Índice para búsquedas rápidas
    CREATE NONCLUSTERED INDEX IX_preferencias_notificacion_usuario_id 
        ON preferencias_notificacion(usuario_id);

    PRINT '? Tabla preferencias_notificacion creada exitosamente';
END
ELSE
BEGIN
    PRINT '?? La tabla preferencias_notificacion ya existe';
END
GO

-- =============================================
-- Trigger: Actualizar actualizado_en en notificaciones
-- =============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_notificaciones_update_timestamp')
BEGIN
    DROP TRIGGER TR_notificaciones_update_timestamp;
END
GO

CREATE TRIGGER TR_notificaciones_update_timestamp
ON notificaciones
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE notificaciones
    SET actualizado_en = GETUTCDATE()
    FROM notificaciones n
    INNER JOIN inserted i ON n.id = i.id;
END
GO
PRINT '? Trigger TR_notificaciones_update_timestamp creado';

-- =============================================
-- Trigger: Actualizar actualizado_en en preferencias_notificacion
-- =============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_preferencias_notificacion_update_timestamp')
BEGIN
    DROP TRIGGER TR_preferencias_notificacion_update_timestamp;
END
GO

CREATE TRIGGER TR_preferencias_notificacion_update_timestamp
ON preferencias_notificacion
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE preferencias_notificacion
    SET actualizado_en = GETUTCDATE()
    FROM preferencias_notificacion p
    INNER JOIN inserted i ON p.usuario_id = i.usuario_id;
END
GO
PRINT '? Trigger TR_preferencias_notificacion_update_timestamp creado';

-- =============================================
-- Crear preferencias por defecto para usuarios existentes
-- =============================================
INSERT INTO preferencias_notificacion (usuario_id)
SELECT u.id
FROM usuarios u
LEFT JOIN preferencias_notificacion p ON u.id = p.usuario_id
WHERE p.usuario_id IS NULL;

PRINT '? Preferencias creadas para ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' usuarios existentes';

-- =============================================
-- Vista: Estadísticas de Notificaciones
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_estadisticas_notificaciones')
BEGIN
    DROP VIEW vw_estadisticas_notificaciones;
END
GO

CREATE VIEW vw_estadisticas_notificaciones
AS
SELECT 
    tipo,
    estado,
    canal,
    COUNT(*) as cantidad,
    AVG(intentos) as promedio_intentos,
    MIN(creado_en) as primera_notificacion,
    MAX(creado_en) as ultima_notificacion
FROM notificaciones
GROUP BY tipo, estado, canal;
GO
PRINT '? Vista vw_estadisticas_notificaciones creada';

-- =============================================
-- Stored Procedure: Obtener Notificaciones Pendientes
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_obtener_notificaciones_pendientes')
BEGIN
    DROP PROCEDURE sp_obtener_notificaciones_pendientes;
END
GO

CREATE PROCEDURE sp_obtener_notificaciones_pendientes
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        n.*,
        u.email,
        u.nombre,
        u.apellido,
        c.inicio as fecha_cita,
        c.motivo as motivo_cita
    FROM notificaciones n
    INNER JOIN usuarios u ON n.usuario_id = u.id
    LEFT JOIN citas c ON n.cita_id = c.id
    WHERE n.estado = 'PENDIENTE'
        AND n.intentos < 3
        AND (n.fecha_programada IS NULL OR n.fecha_programada <= GETUTCDATE())
    ORDER BY n.fecha_programada ASC, n.creado_en ASC;
END
GO
PRINT '? Stored Procedure sp_obtener_notificaciones_pendientes creado';

-- =============================================
-- Stored Procedure: Limpiar Notificaciones Antiguas
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_limpiar_notificaciones_antiguas')
BEGIN
    DROP PROCEDURE sp_limpiar_notificaciones_antiguas;
END
GO

CREATE PROCEDURE sp_limpiar_notificaciones_antiguas
    @dias_antiguedad INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @fecha_limite DATETIME2 = DATEADD(DAY, -@dias_antiguedad, GETUTCDATE());
    
    DELETE FROM notificaciones
    WHERE creado_en < @fecha_limite
        AND estado IN ('ENVIADA', 'CANCELADA');
    
    PRINT '? Se eliminaron ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' notificaciones antiguas';
END
GO
PRINT '? Stored Procedure sp_limpiar_notificaciones_antiguas creado';

-- =============================================
-- Consultas de Verificación
-- =============================================
PRINT '';
PRINT '?? VERIFICACIÓN DE TABLAS CREADAS:';
PRINT '';

-- Verificar tablas
SELECT 
    t.name AS tabla,
    CASE WHEN t.name IN (
        SELECT name FROM sys.tables 
        WHERE name IN ('notificaciones', 'preferencias_notificacion')
    ) THEN '? Existe' ELSE '? No existe' END AS estado
FROM (
    SELECT 'notificaciones' AS name
    UNION ALL
    SELECT 'preferencias_notificacion'
) t;

-- Contar registros
PRINT '';
PRINT '?? CONTEO DE REGISTROS:';
PRINT '';

SELECT 
    'notificaciones' AS tabla,
    COUNT(*) AS registros
FROM notificaciones
UNION ALL
SELECT 
    'preferencias_notificacion',
    COUNT(*)
FROM preferencias_notificacion;

PRINT '';
PRINT '? Script de creación de tablas de notificaciones completado exitosamente';
PRINT '';
GO
