USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla TipoDocumento
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[INS_TIPODOCUMENTO_LOG_TG]
   ON  [cliente].[TipoDocumento]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[TipoDocumento]
		SELECT 
				[idTipoDocumento],
				[tipo],
				[descripcion],
				[activo],
				[idUsuario],
				1,
				getdate()
			FROM INSERTED;
END
