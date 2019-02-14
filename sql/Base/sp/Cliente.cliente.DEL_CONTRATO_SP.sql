USE [Cliente]
GO
/****** Object:  StoredProcedure [cliente].[DEL_CONTRATO_SP]    Script Date: 13/02/2019 06:05:23 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Elimina un Contrato>
-- =============================================
/*
	Fecha:12/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [cliente].[DEL_CONTRATO_SP]
		@numeroContrato = '2',
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[DEL_CONTRATO_SP]
	@numeroContrato			nvarchar(50),
	@err					varchar(max) OUTPUT
AS

BEGIN	
	SET @err = '';
	DELETE FROM cliente.Contrato WHERE numeroContrato = @numeroContrato;
	SELECT 'Eliminado' as result
END
