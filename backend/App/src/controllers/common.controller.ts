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
import { CommonRepository } from '../repository/common.repository';

/**
 * @summary En este archivo van todos los metodos referentes a los clientes de SISCO
 * localhost:{{port}}/cliente/...
 */
@JsonController('/common')
export class CommonController {
    private repository: CommonRepository;

    constructor(repository: CommonRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************ 
    @Get('/getTipoVialidad')
    // #region documentación
    /*
    Nombre:         getTipoVialidad
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Ontiene todos los TipoVialidad
    SP:             [direccion].[SEL_TIPOVIALIDAD_SP]
    Url:            http://localhost:1000/empresa/getTipoVialidad
    Wiki:           ...
    */
    // #endregion
    getTipoVialidad(@Req() req:Request){
        return this.repository.getTipoVialidad(req.query);
    }


    // ************ Servicios POST ************
    @Post('/postCpAutocomplete')
    // #region documentación
    /*
    Nombre:         postCpAutocomplete
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtiene el Estado y el Municipio por CP
    SP:             [direccion].[SEL_CPAUTOCIMPLETE_SP]
    Url:            http://localhost:1000/comnon/postCpAutocomplete
    Wiki:           ...
    */
    // #endregion
    postCpAutocomplete(@Body() body: Request) {
        return this.repository.postCpAutocomplete(body);
    }


    // ************ Servicios PUT ************ 

    

    // ************ Servicios DELETE ************
    
}