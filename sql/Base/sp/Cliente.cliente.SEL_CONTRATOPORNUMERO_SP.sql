USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[SEL_CONTRATOPORNUMERO_SP]    Script Date: 13/02/2019 06:00:51 p. m. ******/
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
	EXEC [cliente].[SEL_CONTRATOPORNUMERO_SP]
		@numeroContrato = '2',
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
ALTER PROCEDURE [cliente].[SEL_CONTRATOPORNUMERO_SP]
	@numeroContrato			nvarchar(50),
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [cliente].[Contrato]
	WHERE numeroContrato = @numeroContrato
END
