USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 13/02/2019
-- Description: el objetivo es: Guardar el registro antes de ser Actualizado de la tabla Empresa
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [empresa].[UPD_EMPRESA_LOG_TG]
   ON  [empresa].[Empresa]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[empresa].[Empresa]
		SELECT TOP 1  
				[rfcEmpresa],
				[razonSocial],
				[nombreComercial],
				[activo],
				[idBPRO],
				[idUsuario],				
				3,
				getdate()
			FROM INSERTED;
END


				