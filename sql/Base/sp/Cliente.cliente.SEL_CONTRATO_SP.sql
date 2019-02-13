USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[SEL_CONTRATO_SP]    Script Date: 12/02/2019 06:18:02 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Obtener todos los registros de Contrato >
-- =============================================
/*
	Fecha		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[SEL_CONTRATO_SP]
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[SEL_CONTRATO_SP]
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [cliente].[Contrato]
END
GO


