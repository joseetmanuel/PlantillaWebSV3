USE [Cliente]
GO

-- =============================================
-- Author: Jos� Etmanuel
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla ClienteDocumento
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[INS_CLIENTEDOCUMENTO_LOG_TG]
   ON  [cliente].[ClienteDocumento]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[ClienteDocumento]
		SELECT 
				[idClienteDocumento],
				[idCliente],
				[idTipoDocumento],
				[idDocumento],
				[idUsuario],
				1,
				getdate()
			FROM INSERTED;
END
