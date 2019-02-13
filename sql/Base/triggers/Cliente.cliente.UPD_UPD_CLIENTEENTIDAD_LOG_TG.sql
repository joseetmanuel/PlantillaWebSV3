USE [Cliente]
GO

-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro antes de ser Actualizado de la tabla ClienteEntidad
-- ============== Versionamiento ================

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[UPD_CLIENTEENTIDAD_LOG_TG]
   ON  [cliente].[ClienteEntidad]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[ClienteEntidad]
		SELECT TOP 1  
				[idClienteEntidad],
				[idCliente],
				[rfc],
				[razonSocial],
				[nombreComercial],
				[idTipoPersona],
				[idLogo],
				[personaContacto],
				[telefono],
				[email],
				[pais],
				[estado],
				[ciudad],
				[delegacion],
				[colonia],
				[calle],
				[numInt],
				[numExt],
				[cp],
				[activo],
				[idUsuario],
				3,
				getdate()
			FROM INSERTED;
END
