USE [Cliente]
GO
/****** Object:  Trigger [cliente].[DEL_CLIENTEENTIDAD_LOG_TG]    Script Date: 13/02/2019 06:14:45 p. m. ******/
/****** 
 =============================================
 Author: Gerardo Zamudio
 Create date: 12/02/2019
 Description: el objetivo es: Guardar el registro antes de ser Eliminado de la tabla ClienteEntidad
 ============== Versionamiento ================
 ******/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [cliente].[DEL_CLIENTEENTIDAD_LOG_TG]
   ON  [cliente].[ClienteEntidad]
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;

	INSERT INTO [ClienteLog].[cliente].[ClienteEntidad]
		SELECT TOP 1  
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
				2,
				getdate()
			FROM deleted;
END
