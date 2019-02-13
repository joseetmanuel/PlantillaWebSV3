USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla EmpresaDocumento
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [empresa].[INS_EMPRESADOCUMENTO_LOG_TG]
   ON  [empresa].[EmpresaDocumento]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[empresa].[EmpresaDocumento]
		SELECT 
				[idEmpresaDocumento],
				[idEmpresa],
				[idTipoDocumento],
				[idDocumento],
				[idUsuario],
				1,
				getdate()
			FROM INSERTED;
END
