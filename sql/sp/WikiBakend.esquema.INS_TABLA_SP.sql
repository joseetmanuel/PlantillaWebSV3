-- =============================================
-- Author:		<Alan Rosales Chavez>
-- Create date: <25/01/2019 12:38>
-- Description:	<SP de inserción>
-- Test: 
/*
    DECLARE @err nvarchar(500)
    exec [esquema].[INS_TABLA_SP]
        @descripcion = 'objeto 6',
        @err = @err output
*/
-- ============== Versionamiento ================
/*
	Fecha			Autor			Descripción
	
*/
-- =============================================
ALTER PROCEDURE [esquema].[INS_TABLA_SP]
    -- Add the parameters for the stored procedure here
    @descripcion        NVARCHAR(500),
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
        INSERT INTO esquema.tabla values(
            @descripcion,
            GETDATE(),
            1
        )
    END
		ELSE
		BEGIN
        SET  @err = 'Esepcifiacion del error de la validación'
    END
    PRINT 'OUT = ' +  @err
    RETURN
END
