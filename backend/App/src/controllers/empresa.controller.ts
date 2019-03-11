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
import { EmpresaRepository } from '../repository/empresa.respository';

/**
 * @summary En este archivo van todos los metodos referentes a los clientes de SISCO
 * {server}:{{port}}/cliente/...
 */
@JsonController('/empresa')
export class EmpresaController {
    private repository: EmpresaRepository;

    constructor(repository: EmpresaRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************ 


    @Get('/getEmpresas')
    // #region documentación
    /*
    Nombre:         getEmpresas
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener todas las empresas
    SP:             [empresa].[SEL_EMPRESA_SP]
    Url:            http://{server}:{port}/empresa/getEmpresas
    Wiki:           ...
    */
    // #endregion
    getEmpresas(@Req() req: Request) {
        return this.repository.getEmpresas(req.query)
    }


    @Get('/getEmpresaPorRfc')
    // #region documentación
    /*
    Nombre:         getEmpresaPorRfc
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener a una empresa por Rfc
    SP:             [empresa].[SEL_EMPRESAPORRFC_SP]
    Url:            http://{server}:{port}/empresa/getEmpresaPorRfc?rfcEmpresa=1
    Wiki:           ...
    */
    // #endregion
    getEmpresaPorRfc(@Req() req: Request) {
        return this.repository.getEmpresaPorRfc(req.query)
    }


    // ************ Servicios POST ************
    @Post('/postInsertaEmpresa')
    // #region documentación
    /*
    Nombre:         postInsertaEmpresa
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Insertar una Empresa
    SP:             [empresa].[INS_EMPRESA_SP]
    Url:            http://{server}:{port}/empresa/postInsertaEmpresa
    Wiki:           ...
    */
    // #endregion
    postInsertaEmpresa(@Body() body: Request) {
        return this.repository.postInsertaEmpresa(body);
    }


    // ************ Servicios PUT ************ 

    @Put('/putActualizaEmpresa')
    // #region documentación
    /*
    Nombre:         putActualizaEmpresa
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Actualiza la Empresa
    SP:             [empresa].[UPD_EMPRESA_SP]
    Url:            http://{server}:{port}/empresa/putActualizaEmpresa
    Wiki:           https://github.com/joseetmanuel/PlantillaWeb/wiki/Empresa
    */
    // #endregion
    putActualizaEmpresa(@Body() body: Request){
        return this.repository.putActualizaEmpresa(body);
    }

    // ************ Servicios DELETE ************
    @Delete('/deleteEmpresa')
    // #region documentación
    /*
    Nombre:         deleteEmpresa
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Elimina una Empresa
    SP:             [empresa].[DEL_EMPRESA_SP]
    Url:            http://{server}:{port}/empresa/deleteEmpresa
    Wiki:           ...
    */
    // #endregion
    deleteEmpresa(@Body() body:Request){
        return this.repository.deleteEmpresa(body);
    }
}