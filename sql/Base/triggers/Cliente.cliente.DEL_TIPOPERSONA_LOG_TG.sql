USE [Cliente]
GO

/****** 
 =============================================
 Author: Gerardo Zamudio
 Create date: 12/02/2019
 Description: el objetivo es: Guardar el registro antes de ser Eliminado de la tabla TipoPersona
 ============== Versionamiento ================
 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[DEL_TIPOPERSONA_LOG_TG]
   ON  [cliente].[TipoPersona]
   AFTER DELETE
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
				2,
				getdate()
			FROM deleted;
END		