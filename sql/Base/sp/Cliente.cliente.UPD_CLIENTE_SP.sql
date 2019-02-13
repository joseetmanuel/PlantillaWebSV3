USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[UPD_CLIENTE_SP]    Script Date: 12/02/2019 06:18:22 p. m. ******/
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
		@idCliente = 5,
		@nombre = 'Actualizado',
		@activo = 1,
		@idEmpresa = 1,
		@idUsuario = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[UPD_CLIENTE_SP]
	@idCliente				int,
	@nombre					nvarchar(250),
	@activo					bit,
	@idEmpresa				int,
	@idUsuario				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	UPDATE cliente.Cliente
	SET
		nombre =		@nombre,
		activo =		@activo,
		idEmpresa =		@idEmpresa,
		idUsuario =		@idUsuario
		WHERE idCliente = @idCliente
	
	SELECT * FROM cliente.Cliente WHERE idCliente = @idCliente
END
GO


