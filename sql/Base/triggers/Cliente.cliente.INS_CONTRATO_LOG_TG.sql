USE [Cliente]
GO
/****** Object:  Trigger [cliente].[INS_CONTRATO_LOG_TG]    Script Date: 13/02/2019 05:52:13 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[INS_CONTRATO_LOG_TG]
   ON  [cliente].[Contrato]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[Contrato]
		SELECT 
				[idCliente],
				[numeroContrato],
				[descripcion],
				[fechaInicio],
				[fechaFin],
				[activo],
				[idUsuario],
				1,
				getdate()
			FROM INSERTED;
END
