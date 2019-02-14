USE [Cliente]
GO
/****** Object:  StoredProcedure [empresa].[DEL_EMPRESA_SP]    Script Date: 13/02/2019 04:00:37 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Gerardo Zamudio>
-- Create date: <12/02/2019>
-- Description:	<Elimina una Empresa>
-- =============================================
/*
	Fecha:12/02/2019		Autor	Descripción 
	--2019

	*- Testing...
	DECLARE @salida varchar(max) ;
	EXEC [empresa].[DEL_EMPRESA_SP]
		@rfcEmpresa = '4567',
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [empresa].[DEL_EMPRESA_SP]
	@rfcEmpresa				nvarchar(13),
	@err					varchar(max) OUTPUT
AS

BEGIN	
	SET @err = '';
	DELETE FROM empresa.Empresa WHERE rfcEmpresa = @rfcEmpresa;
	SELECT 'Eliminado' as result
END
