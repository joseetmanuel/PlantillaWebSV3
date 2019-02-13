USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[DEL_CLIENTE_SP]    Script Date: 12/02/2019 06:16:37 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Elimina un Cliente>
-- =============================================
/*
	Fecha:12/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[DEL_CLIENTE_SP]
		@idCliente = 5,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[DEL_CLIENTE_SP]
	@idCliente				int,
	@err					varchar(max) OUTPUT
AS

BEGIN	
	SET @err = '';
	DELETE FROM cliente.Cliente WHERE idCliente = @idCliente;
	SELECT 'Eliminado' as result
END
GO


