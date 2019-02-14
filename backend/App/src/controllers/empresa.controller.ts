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
 * localhost:{{port}}/cliente/...
 */
@JsonController('/empresa')
export class EmpresaController {
    private repository: EmpresaRepository;

    constructor(repository: EmpresaRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************ 


    @Get('/getEmpresas')
    getEmpresas(@Req() req: Request) {
        return this.repository.getEmpresas(req.query)
    }

    @Get('/getEmpresaPorRfc')
    getEmpresaPorRfc(@Req() req: Request) {
        return this.repository.getEmpresaPorRfc(req.query)
    }

    // ************ Servicios POST ************
    @Post('/postInsertaEmpresa')
    postInsertaEmpresa(@Body() body: Request) {
        return this.repository.postInsertaEmpresa(body);
    }


    // ************ Servicios PUT ************ 

    @Put('/putActualizaEmpresa')
    putActualizaEmpresa(@Body() body: Request){
        console.log(body)
        return this.repository.putActualizaEmpresa(body);
    }

    // ************ Servicios DELETE ************
    @Delete('/deleteEmpresa')
    deleteEmpresa(@Body() body:Request){
        return this.repository.deleteEmpresa(body);
    }
}