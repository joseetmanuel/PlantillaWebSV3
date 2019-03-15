import { Request } from 'express';
import {
    JsonController,
    UploadedFile,
    Body,
    Get,
    Post,
    Req,
    Put,
    Delete,

} from 'routing-controllers';
import { ProveedorRepository } from '../repository/proveedor.repository';

/**
 * @summary En este archivo van todos los metodos referentes a los clientes de SISCO
 * localhost:{{port}}/cliente/...
 */
@JsonController('/proveedor')
export class ProveedorController {
    private repository: ProveedorRepository;

    constructor(repository: ProveedorRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************ 

    @Get('/getProveedores')
    // #region 
    /*
    Nombre:         getProveedores
    Autor:          Andres Farias
    Fecha:          08/03/2019
    Descripción:    Obtener todos los proveedores
    SP:             [proveedor].[SEL_PROVEEDORES_SP]
    Url:            http://{server}:{port}/proveedor/getProveedores
    Wiki:           
    */
    // #endregion
    getProveedores(@Req() req: Request) {
        return this.repository.getProveedores(req.query)
    }

    @Get('/getProveedorEntidadByRFC')
    // #region 
    /*
    Nombre:         getProveedorEntidadByRFC
    Autor:          Andres Farias
    Fecha:          08/03/2019
    Descripción:    Obtener todos los ProveedoresEntidad de un proveedor
    SP:             [proveedor].[SEL_PROVEEDORESENTIDAD_SP]
    Url:            http://{server}:{port}/proveedor/getProveedores
    Wiki:           
    */
    // #endregion
    getProovedorEntidad(@Req() req: Request) {
        return this.repository.getProveedoresEntidad(req.query)
    }

    // ************ Servicios POST ************
    
    @Post('/postInsProveedor')
    // #region documentación
    /*
    Nombre:         postInsProveedor
    Autor:          Andres Farias
    Fecha:          11/03/2019
    Descripción:    Insertar un Proveedor
    SP:             [proveedor].[INS_PROVEEDOR_SP]
    Url:            http://localhost:1000/proveedor/postInsProveedor
    Wiki:           ...
    */
    // #endregion
    postInsProveedor(@Body() body: Request) {
        return this.repository.postInsProveedor(body);
    }

    // ************ Servicios PUT ************ 

    @Put('/putActualizaProveedor')
    // #region documentación
    /*
    Nombre:         putActualizaProveedor
    Autor:          Andres Farias
    Fecha:          12/03/2019
    Descripción:    Actualiza un proveedor
    SP:             [proveedor].[UPD_PROVEEDOR_SP]
    Url:            http://localhost:1000/proveedor/putActualizaProveedor
    Wiki:           https://github.com/
    */
    // #endregion
    putActualizaEmpresa(@Body() body: Request){
        return this.repository.putActualizaProveedor(body);
    }

    // ************ Servicios DELETE ************ 

    @Delete('/delProveedor')
    // #region documentación
    /*
    Nombre:         delProveedor
    Autor:          Andres Farias
    Fecha:          12/03/2019
    Descripción:    elimina un proveedor
    SP:             [proveedor].[DEL_PROVEEDOR_SP]
    Url:            http://localhost:1000/proveedor/delProveedor
    Wiki:           https://github.com/
    */
    // #endregion
    delProveedor(@Req() req: Request){
        return this.repository.delProveedor(req.query);
    }
}