USE [Cliente]
GO

/****** Object:  StoredProcedure [empresa].[SEL_EMPRESAPORID_SP]    Script Date: 12/02/2019 06:19:18 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Obtener todos los registros de la Empresa por idEmpresa >
-- =============================================
/*
	Fecha		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [empresa].[SEL_EMPRESAPORID_SP]
		@idEmpresa = 4,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [empresa].[SEL_EMPRESAPORID_SP]
	@idEmpresa				int,
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [empresa].[Empresa]
	WHERE idEmpresa = @idEmpresa
END
GO


