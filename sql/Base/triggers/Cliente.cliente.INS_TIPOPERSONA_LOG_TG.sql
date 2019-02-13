USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla TipoPersona
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[INS_TIPOPERSONA_LOG_TG]
   ON  [cliente].[TipoPersona]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[TipoPersona]
		SELECT 
				[idTipoPersona],
				[tipo],
				[descripcion],
				[activo],
				[idUsuario],
				1,
				getdate()
			FROM INSERTED;
END
