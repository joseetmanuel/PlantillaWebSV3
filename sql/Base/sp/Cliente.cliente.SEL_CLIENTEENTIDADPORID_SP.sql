USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[SEL_CLIENTEENTIDADPORID_SP]    Script Date: 12/02/2019 06:17:46 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <11/02/2019>
-- Description:	<Obtener Cliente Entidad por idClienteEntidad >
-- =============================================
/*
	Fecha:31/01/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[SEL_CLIENTEENTIDADPORID_SP]
		@idClienteEntidad = 1,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[SEL_CLIENTEENTIDADPORID_SP]
	@idClienteEntidad			int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [cliente].[ClienteEntidad] 
	WHERE idClienteEntidad = @idClienteEntidad;
END
GO


