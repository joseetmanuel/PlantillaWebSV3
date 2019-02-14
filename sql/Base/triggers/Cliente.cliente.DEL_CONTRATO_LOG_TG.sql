USE [Cliente]
GO

/****** 
 =============================================
 Author: Gerardo Zamudio
 Create date: 12/02/2019
 Description: el objetivo es: Guardar el registro antes de ser Eliminado de la tabla Contrato
 ============== Versionamiento ================
 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[DEL_CONTRATO_LOG_TG]
   ON  [cliente].[Contrato]
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[Contrato]
		SELECT TOP 1  
				[idCliente],
				[numeroContrato],
				[descripcion],
				[fechaInicio],
				[fechaFin],
				[activo],
				[idUsuario],
				2,
				getdate()
			FROM deleted;
END
