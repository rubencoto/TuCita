-- ===================================================
-- Script Rápido: Crear Tablas de Notificaciones
-- ===================================================

USE TuCitaDB;
GO

PRINT '?? Creando tablas de notificaciones...';

-- Tabla: notificaciones
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
        
        CONSTRAINT FK_notificaciones_usuario FOREIGN KEY (usuario_id) 
            REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT FK_notificaciones_cita FOREIGN KEY (cita_id) 
            REFERENCES citas(id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_notificaciones_usuario_id ON notificaciones(usuario_id);
    CREATE NONCLUSTERED INDEX IX_notificaciones_cita_id ON notificaciones(cita_id) WHERE cita_id IS NOT NULL;
    CREATE NONCLUSTERED INDEX IX_notificaciones_estado_fecha ON notificaciones(estado, fecha_programada) WHERE estado = 'PENDIENTE';

    PRINT '? Tabla notificaciones creada';
END
ELSE
BEGIN
    PRINT '?? Tabla notificaciones ya existe';
END
GO

-- Tabla: preferencias_notificacion
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
        
        CONSTRAINT FK_preferencias_notificacion_usuario FOREIGN KEY (usuario_id) 
            REFERENCES usuarios(id) ON DELETE CASCADE
    );

    PRINT '? Tabla preferencias_notificacion creada';
END
ELSE
BEGIN
    PRINT '?? Tabla preferencias_notificacion ya existe';
END
GO

-- Crear preferencias para usuarios existentes
INSERT INTO preferencias_notificacion (usuario_id)
SELECT u.id
FROM usuarios u
LEFT JOIN preferencias_notificacion p ON u.id = p.usuario_id
WHERE p.usuario_id IS NULL;

PRINT '? Preferencias creadas para ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' usuarios';
PRINT '';
PRINT '?? ¡Tablas de notificaciones creadas exitosamente!';
GO
