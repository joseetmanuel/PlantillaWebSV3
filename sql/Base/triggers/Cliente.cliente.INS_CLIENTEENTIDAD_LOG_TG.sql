USE [Cliente]
GO
-- =============================================
-- Author: Gerardo Zamudio
-- Create date: 12/02/2019
-- Description: el objetivo es: Guardar el registro despues de ser Insertado de la tabla ClienteEntidad
-- ============== Versionamiento ================
/****** Object:  Trigger [cliente].[INS_CLIENTEENTIDAD_LOG_TG]    Script Date: 13/02/2019 06:08:42 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[INS_CLIENTEENTIDAD_LOG_TG]
   ON  [cliente].[ClienteEntidad]
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[ClienteEntidad]
		SELECT 
				[idCliente],
				[rfcClienteEntidad],
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
				1,
				getdate()
			FROM INSERTED;
END
