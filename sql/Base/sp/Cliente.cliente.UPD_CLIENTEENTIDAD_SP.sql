USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[UPD_CLIENTEENTIDAD_SP]    Script Date: 12/02/2019 06:18:33 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <11/02/2019>
-- Description:	<Modifica un ClienteEntidad>
-- =============================================
/*
	Fecha:11/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[UPD_CLIENTEENTIDAD_SP]
		@idClienteEntidad = 1,
		@idCliente = 1,
		@rfc = '1234',
		@razonSocial = 'Test',
		@nombreComercial = 'Test Comercial',
		@idTipoPersona = 1,
		@idLogo	= 1,
		@personaContacto = 'Persona Contacto',
		@telefono = '12345',
		@email = 'ger@ger.com',
		@pais = 'Mexico',
		@estado	= 'Mexico',
		@ciudad	= 'Nezahualcoyotl',
		@delegacion	= 'Aurora',
		@colonia = 'Benito',
		@calle = 'Calle Test',
		@numInt	= '123',
		@numExt	= 'nan',
		@cp	= '65253',
		@activo	= True,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[UPD_CLIENTEENTIDAD_SP]
	@idClienteEntidad		int,
	@idCliente				int,
	@rfc					nvarchar(13),
	@razonSocial			nvarchar(250),
	@nombreComercial		nvarchar(250),
	@idTipoPersona			int,
	@idLogo					int,
	@personaContacto		nvarchar(300),
	@telefono				nvarchar(400),
	@email					nvarchar(400),
	@pais					nvarchar(300),
	@estado					nvarchar(300),
	@ciudad					nvarchar(300),
	@delegacion				nvarchar(300),
	@colonia				nvarchar(300),
	@calle					nvarchar(300),
	@numInt					nvarchar(300),
	@numExt					nvarchar(300),
	@cp						nvarchar(10),
	@activo					bit,
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	UPDATE cliente.ClienteEntidad 
	SET
		idCliente =				@idCliente,
		rfc =					@rfc,
		razonSocial =			@razonSocial,
		nombreComercial =		@nombreComercial,
		idTipoPersona =			@idTipoPersona,
		idLogo =				@idLogo,
		personaContacto =		@personaContacto,
		telefono =				@telefono,
		email =					@email,
		pais =					@pais,
		estado =				@estado,
		ciudad =				@ciudad,
		delegacion =			@delegacion,
		colonia =				@colonia,
		calle =					@calle,
		numInt =				@numInt,
		numExt =				@numExt,
		cp =					@cp,
		activo =				@activo,
		idUsuario =				@idUsuario
		WHERE idClienteEntidad = @idClienteEntidad
	
	SELECT * FROM cliente.ClienteEntidad WHERE idClienteEntidad = @idClienteEntidad
END
GO


