USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[DEL_CLIENTEENTIDAD_SP]    Script Date: 13/02/2019 06:29:04 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Elimina un ClienteEntidad>
-- =============================================
/*
	Fecha:12/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[DEL_CLIENTEENTIDAD_SP]
		@rfcClienteEntidad = '2',
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[DEL_CLIENTEENTIDAD_SP]
	@rfcClienteEntidad		nvarchar(13),
	@err					varchar(max) OUTPUT
AS

BEGIN	
	SET @err = '';
	DELETE FROM cliente.ClienteEntidad WHERE rfcClienteEntidad = @rfcClienteEntidad;
	SELECT 'Eliminado' as result
END
