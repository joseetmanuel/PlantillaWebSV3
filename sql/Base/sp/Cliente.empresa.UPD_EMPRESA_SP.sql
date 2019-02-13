USE [Cliente]
GO

/****** Object:  StoredProcedure [empresa].[UPD_EMPRESA_SP]    Script Date: 12/02/2019 06:19:29 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Modifica una Empresa>
-- =============================================
/*
	Fecha:11/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [empresa].[UPD_EMPRESA_SP]
		@idEmpresa = 4,
		@rfc = '4567',
		@razonSocial = 'xfgtfgyuhij',
		@nombreComercial = 'xtrdtyfuyguih',
		@activo = 1,
		@idBPRO = 1,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [empresa].[UPD_EMPRESA_SP]
	@idEmpresa				int,
	@rfc					nvarchar(13),
	@razonSocial			nvarchar(250),
	@nombreComercial		nvarchar(250),
	@activo					bit,
	@idBPRO					int,
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	UPDATE empresa.Empresa
	SET
		[rfc] =					@rfc,
		[razonSocial] =			@razonSocial,
		[nombreComercial] =		@nombreComercial,
		[activo] =				@activo,
		[idBPRO] =				@idBPRO,
		[idUsuario] =			@idUsuario
		WHERE idEmpresa = @idEmpresa
	
	SELECT * FROM empresa.Empresa WHERE idEmpresa = @idEmpresa
END
GO


