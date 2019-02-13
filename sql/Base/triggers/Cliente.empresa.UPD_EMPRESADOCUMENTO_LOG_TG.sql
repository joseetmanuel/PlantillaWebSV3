USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro antes de ser Actualizado de la tabla EmpresaDocumento
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [empresa].[UPD_EMPRESADOCUMENTO_LOG_TG]
   ON  [empresa].[EmpresaDocumento]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[empresa].[EmpresaDocumento]
		SELECT TOP 1  
				[idEmpresaDocumento],
				[idEmpresa],
				[idTipoDocumento],
				[idDocumento],
				[idUsuario],				
				3,
				getdate()
			FROM INSERTED;
END


				