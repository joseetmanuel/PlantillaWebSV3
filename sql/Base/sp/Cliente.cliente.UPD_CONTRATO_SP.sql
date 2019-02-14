USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[UPD_CONTRATO_SP]    Script Date: 13/02/2019 05:55:35 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Modifica un Contrato>
-- =============================================
/*
	Fecha:12/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[UPD_CONTRATO_SP]
		@idCliente = 1,
		@numeroContrato = '2',
		@descripcion = 'test prueba Descripcion',
		@fechaInicio = '2019-02-12',
		@fechaFin = '2019-03-12',
		@activo = 1,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[UPD_CONTRATO_SP]
	@idCliente				int,
	@numeroContrato			nvarchar(50),
	@descripcion			nvarchar(500),
	@fechaInicio			datetime,
	@fechaFin				datetime,
	@activo					bit,
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	UPDATE cliente.Contrato
	SET
		[idCliente] =		@idCliente,
		[numeroContrato] =			@numeroContrato,
		[descripcion] =		@descripcion,
		[fechaInicio] =		@fechaInicio,
		[fechaFin] =		@fechaFin,
		[activo] =			@activo,
		[idUsuario] =		@idUsuario
		WHERE numeroContrato =  @numeroContrato
	
	SELECT * FROM cliente.Contrato WHERE numeroContrato = @numeroContrato
END
