USE [Cliente]
GO

/****** Object:  StoredProcedure [empresa].[INS_EMPRESA_SP]    Script Date: 12/02/2019 06:19:03 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Inserta una nueva Empresa>
-- =============================================
/*
	Fecha:11/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [empresa].[INS_EMPRESA_SP]
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
CREATE PROCEDURE [empresa].[INS_EMPRESA_SP]
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

	INSERT INTO empresa.Empresa
	(
		[rfc],
		[razonSocial],
		[nombreComercial],
		[activo],
		[idBPRO],
		[idUsuario]
	)
	values (
		@rfc,
		@razonSocial,
		@nombreComercial,
		@activo,
		@idBPRO,
		@idUsuario
	)
	SELECT 'Insertado' as result
END
GO


