USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro antes de ser Actualizado de la tabla TipoPersona
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[UPD_TIPOPERSONA_LOG_TG]
   ON  [cliente].[TipoPersona]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[TipoPersona]
		SELECT TOP 1  
				[idTipoPersona],
				[tipo],
				[descripcion],
				[activo],
				[idUsuario],
				3,
				getdate()
			FROM INSERTED;
END