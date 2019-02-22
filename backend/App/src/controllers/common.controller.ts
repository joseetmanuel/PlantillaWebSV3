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


    // ************ Servicios POST ************
    @Post('/postSearchCp')
    // #region documentación
    /*
    Nombre:         postSearchCp
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Insertar una Empresa
    SP:             [empresa].[INS_EMPRESA_SP]
    Url:            http://localhost:1000/empresa/postInsertaEmpresa
    Wiki:           ...
    */
    // #endregion
    postSearchCp(@Body() body: Request) {
        return this.repository.postSearchCp(body);
    }


    // ************ Servicios PUT ************ 

    

    // ************ Servicios DELETE ************
    
}