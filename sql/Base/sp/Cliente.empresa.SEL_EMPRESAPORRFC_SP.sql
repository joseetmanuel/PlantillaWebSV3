USE [Cliente]
GO
/****** Object:  StoredProcedure [empresa].[SEL_EMPRESAPORRFC_SP]    Script Date: 13/02/2019 04:25:42 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Obtener todos los registros de la Empresa por rfcEmpresa >
-- =============================================
/*
	Fecha		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [empresa].[SEL_EMPRESAPORRFC_SP]
		@rfcEmpresa = '457',
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [empresa].[SEL_EMPRESAPORRFC_SP]
	@rfcEmpresa				nvarchar(13),
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [empresa].[Empresa]
	WHERE rfcEmpresa = @rfcEmpresa
END
