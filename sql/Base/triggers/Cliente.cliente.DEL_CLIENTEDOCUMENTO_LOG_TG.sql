USE [Cliente]
GO

/****** 
 =============================================
 Author: José Etmanuel
 Create date: 12/02/2019
 Description: el objetivo es: Guardar el registro antes de ser Eliminado de la tabla Cliente
 ============== Versionamiento ================
 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[DEL_CLIENTEDOCUMENTO_LOG_TG]
   ON  [cliente].[ClienteDocumento]
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[ClienteDocumento]
		SELECT TOP 1  
				[idClienteDocumento],
				[idCliente],
				[idTipoDocumento],
				[idDocumento],
				[idUsuario],
				2,
				getdate()
			FROM deleted;
END
