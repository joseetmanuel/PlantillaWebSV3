USE [Cliente]
GO
/****** Object:  StoredProcedure [empresa].[UPD_EMPRESA_SP]    Script Date: 13/02/2019 03:53:22 p. m. ******/
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
		@rfcEmpresa = '4567',
		@razonSocial = 'Razon',
		@nombreComercial = 'xtrdtyfuyguih',
		@activo = 1,
		@idBPRO = 1,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [empresa].[UPD_EMPRESA_SP]
	@rfcEmpresa				nvarchar(13),
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
		[rfcEmpresa] =			@rfcEmpresa,
		[razonSocial] =			@razonSocial,
		[nombreComercial] =		@nombreComercial,
		[activo] =				@activo,
		[idBPRO] =				@idBPRO,
		[idUsuario] =			@idUsuario
		WHERE rfcEmpresa = @rfcEmpresa
	
	SELECT * FROM empresa.Empresa WHERE rfcEmpresa = @rfcEmpresa
END
