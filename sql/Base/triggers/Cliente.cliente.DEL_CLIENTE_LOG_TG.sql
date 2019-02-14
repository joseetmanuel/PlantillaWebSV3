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
CREATE TRIGGER [cliente].[DEL_CLIENTE_LOG_TG]
   ON  [cliente].[Cliente]
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[Cliente]
		SELECT TOP 1  [idCliente]
				,[nombre]
				,[activo]
				,[rfcEmpresa]
				,[idUsuario]
				,2
				,getdate()
			FROM deleted;
END
