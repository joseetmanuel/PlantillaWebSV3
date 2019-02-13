USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[UPD_CONTRATO_SP]    Script Date: 12/02/2019 06:18:44 p. m. ******/
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
		@idContrato = 3,
		@idCliente = 2,
		@numero = '23',
		@descripcion = 'test prueba',
		@fechaInicio = '2019-02-12',
		@fechaFin = '2019-03-12',
		@activo = 1,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[UPD_CONTRATO_SP]
	@idContrato				int,
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

	UPDATE cliente.Contrato
	SET
		[idCliente] =		@idCliente,
		[numero] =			@numero,
		[descripcion] =		@descripcion,
		[fechaInicio] =		@fechaInicio,
		[fechaFin] =		@fechaFin,
		[activo] =			@activo,
		[idUsuario] =		@idUsuario
		WHERE idContrato =  @idContrato
	
	SELECT * FROM cliente.Contrato WHERE idContrato = @idContrato
END
GO


