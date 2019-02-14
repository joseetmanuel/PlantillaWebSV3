USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[UPD_CLIENTE_SP]    Script Date: 13/02/2019 05:17:28 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Modifica un Cliente>
-- =============================================
/*
	Fecha:11/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[UPD_CLIENTE_SP]
		@idCliente = 1,
		@nombre = 'Actualizado otra',
		@activo = 1,
		@rfcEmpresa = '457',
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[UPD_CLIENTE_SP]
	@idCliente				int,
	@nombre					nvarchar(250),
	@activo					bit,
	@rfcEmpresa				nvarchar(13),
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	UPDATE cliente.Cliente
	SET
		nombre =		@nombre,
		activo =		@activo,
		rfcEmpresa =	@rfcEmpresa,
		idUsuario =		@idUsuario
		WHERE idCliente = @idCliente
	
	SELECT * FROM cliente.Cliente WHERE idCliente = @idCliente
END
