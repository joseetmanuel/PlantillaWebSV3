-- =============================================
-- Author:		<Alan Rosales Chavez>
-- Create date: <25/01/2019 12:38>
-- Description:	<SP de consulta sin parametros>
-- Test: 
/*
    DECLARE @err nvarchar(500)
    exec [esquema].[SEL_TABLA_SINPARAMETROS_SP]
        @err = @err output
*/
-- ============== Versionamiento ================
/*
	Fecha			Autor			Descripción
	
*/
-- =============================================
ALTER PROCEDURE [esquema].[SEL_TABLA_SINPARAMETROS_SP]
    -- Add the parameters for the stored procedure here
    @err				VARCHAR(500)	OUT
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.

    SET  @err = ''
    --*********************************************************************************
    --************************************VALIDACIONES*********************************
    --*********************************************************************************
    IF (1=1) --validacion 1
		BEGIN
        SELECT
            idObjeto    AS  'idObjeto',
            descripcion AS  'descripcion',
            fechaAlta   AS  'fechaAlta',
            estatus     AS  'estatus'
        FROM esquema.tabla
    END
		ELSE
		BEGIN
        SET  @err = 'Esepcifiacion del error de la validación'
    END
    PRINT 'OUT = ' +  @err
    RETURN
END
