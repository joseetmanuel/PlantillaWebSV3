USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro antes de ser Actualizado de la tabla TipoDocumento
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[UPD_TIPODOCUMENTO_LOG_TG]
   ON  [cliente].[TipoDocumento]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[TipoDocumento]
		SELECT TOP 1  
				[idTipoDocumento],
				[tipo],
				[descripcion],
				[activo],
				[idUsuario],
				3,
				getdate()
			FROM INSERTED;
END