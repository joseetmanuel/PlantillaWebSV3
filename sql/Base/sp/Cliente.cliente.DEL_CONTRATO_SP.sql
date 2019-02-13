USE [Cliente]
GO

/****** Object:  StoredProcedure [cliente].[DEL_CONTRATO_SP]    Script Date: 12/02/2019 06:16:54 p. m. ******/
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
		@idContrato = 3,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [cliente].[DEL_CONTRATO_SP]
	@idContrato				int,
	@err					varchar(max) OUTPUT
AS

BEGIN	
	SET @err = '';
	DELETE FROM cliente.Contrato WHERE idContrato = @idContrato;
	SELECT 'Eliminado' as result
END
GO


