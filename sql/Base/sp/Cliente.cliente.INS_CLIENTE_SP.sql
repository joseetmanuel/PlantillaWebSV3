USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[INS_CLIENTE_SP]    Script Date: 13/02/2019 05:10:10 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Inserta un nuevo Cliente>
-- =============================================
/*
	Fecha:11/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[INS_CLIENTE_SP]
		@nombre = 'getr',
		@activo = 1,
		@rfcEmpresa = '457',
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[INS_CLIENTE_SP]
	@nombre					nvarchar(250),
	@activo					bit,
	@rfcEmpresa				nvarchar(13),
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	INSERT INTO cliente.Cliente
	(
		[nombre],
		[activo],
		[rfcEmpresa],
		[idUsuario]
	)
	values (
		@nombre,
		@activo,
		@rfcEmpresa,
		@idUsuario
	)
	SELECT 'Insertado' as result
END
