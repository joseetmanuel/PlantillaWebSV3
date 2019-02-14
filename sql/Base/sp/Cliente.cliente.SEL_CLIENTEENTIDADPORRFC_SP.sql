USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[SEL_CLIENTEENTIDADPORRFC_SP]    Script Date: 13/02/2019 06:26:10 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <11/02/2019>
-- Description:	<Obtener Cliente Entidad por rfcClienteEntidad >
-- =============================================
/*
	Fecha:31/01/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[SEL_CLIENTEENTIDADPORRFC_SP]
		@rfcClienteEntidad = '2',
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[SEL_CLIENTEENTIDADPORRFC_SP]
	@rfcClienteEntidad		nvarchar(13),
	@err					varchar(max) OUTPUT
AS

BEGIN
	 SET @err = '';

	SELECT * FROM [cliente].[ClienteEntidad] 
	WHERE rfcClienteEntidad = @rfcClienteEntidad;
END
