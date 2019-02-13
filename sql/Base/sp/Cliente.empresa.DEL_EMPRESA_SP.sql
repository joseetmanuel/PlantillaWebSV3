USE [Cliente]
GO

/****** Object:  StoredProcedure [empresa].[DEL_EMPRESA_SP]    Script Date: 12/02/2019 06:18:53 p. m. ******/
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
		@idEmpresa = 4,
		@err = @salida OUTPUT;
	SELECT @salida AS salida;
*/
-- =============================================
CREATE PROCEDURE [empresa].[DEL_EMPRESA_SP]
	@idEmpresa				int,
	@err					varchar(max) OUTPUT
AS

BEGIN	
	SET @err = '';
	DELETE FROM empresa.Empresa WHERE idEmpresa = @idEmpresa;
	SELECT 'Eliminado' as result
END
GO


