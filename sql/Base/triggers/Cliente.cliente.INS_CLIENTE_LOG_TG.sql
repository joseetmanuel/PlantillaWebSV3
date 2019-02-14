USE [Cliente]
GO

-- =============================================
-- Author: Jos� Etmanuel
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla Cliente
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[INS_CLIENTE_LOG_TG]
   ON  [cliente].[Cliente]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[Cliente]
		SELECT [idCliente]
				,[nombre]
				,[activo]
				,[rfcEmpresa]
				,[idUsuario]
				,1
				,getdate()
			FROM INSERTED;
END
