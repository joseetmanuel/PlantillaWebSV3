USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[INS_CONTRATO_SP]    Script Date: 12/02/2019 06:17:23 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Inserta un nuevo Contrato>
-- =============================================
/*
	Fecha:11/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[INS_CONTRATO_SP]
		@idCliente = 2,
		@numero = '23',
		@descripcion = 'test',
		@fechaInicio = '2019-02-12',
		@fechaFin = '2019-03-12',
		@activo = 0,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[INS_CONTRATO_SP]
	@idCliente				int,
	@numero					nvarchar(50),
	@descripcion			nvarchar(500),
	@fechaInicio			datetime,
	@fechaFin				datetime,
	@activo					bit,
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	INSERT INTO cliente.Contrato
	(
		[idCliente],
		[numero],
		[descripcion],
		[fechaInicio],
		[fechaFin],
		[activo],
		[idUsuario]
	)
	values (
		@idCliente,
		@numero,
		@descripcion,
		@fechaInicio,
		@fechaFin,
		@activo,
		@idUsuario
	)
	SELECT 'Insertado' as result
END
GO


