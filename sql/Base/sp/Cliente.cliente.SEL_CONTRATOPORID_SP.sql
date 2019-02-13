USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[SEL_CONTRATOPORID_SP]    Script Date: 12/02/2019 06:18:11 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Obtener todos los registros de Contrato por idContrato >
-- =============================================
/*
	Fecha		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[SEL_CONTRATOPORID_SP]
		@idContrato = 3,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[SEL_CONTRATOPORID_SP]
	@idContrato				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [cliente].[Contrato]
	WHERE idContrato = @idContrato
END
GO


