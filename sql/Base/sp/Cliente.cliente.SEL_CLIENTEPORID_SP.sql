USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[SEL_CLIENTEPORID_SP]    Script Date: 12/02/2019 06:17:54 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Obtener Cliente por idCliente >
-- =============================================
/*
	Fecha	Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[SEL_CLIENTEPORID_SP]
		@idCliente = 5,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[SEL_CLIENTEPORID_SP]
	@idCliente				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [cliente].[Cliente] 
	WHERE idCliente = @idCliente;
END
GO


