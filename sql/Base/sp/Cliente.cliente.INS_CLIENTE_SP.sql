USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[INS_CLIENTE_SP]    Script Date: 12/02/2019 06:17:03 p. m. ******/
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
		@idEmpresa = 1,
		@idUsuario = 1;
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[INS_CLIENTE_SP]
	@nombre					nvarchar(250),
	@activo					bit,
	@idEmpresa				int,
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	INSERT INTO cliente.Cliente
	(
		[nombre],
		[activo],
		[idEmpresa],
		[idUsuario]
	)
	values (
		@nombre,
		@activo,
		@idEmpresa,
		@idUsuario
	)
	SELECT 'Insertado' as result
END
GO


