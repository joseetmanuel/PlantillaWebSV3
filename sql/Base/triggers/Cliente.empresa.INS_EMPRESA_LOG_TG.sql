USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 13/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla Empresa
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [empresa].[INS_EMPRESA_LOG_TG]
   ON  [empresa].[Empresa]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[empresa].[Empresa]
		SELECT 
				[rfcEmpresa],
				[razonSocial],
				[nombreComercial],
				[activo],
				[idBPRO],
				[idUsuario],
				1,
				getdate()
			FROM INSERTED;
END
