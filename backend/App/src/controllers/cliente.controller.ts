import { Request } from 'express';
import {
    JsonController,
    UploadedFile,
    Body,
    Get,
    Post,
    Req,
   
} from 'routing-controllers';
import { ClienteRepository } from '../repository/cliente.repository';

/**
 * @summary En este archivo van todos los metodos referentes a los clientes de SISCO
 * localhost:{{port}}/cliente/...
 */
@JsonController('/cliente')
export class ClienteController {
    private repository: ClienteRepository;

    constructor(repository: ClienteRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************
    @Get('/getDelay')
    getDelay(@Req() req: Request) {        
        return this.repository.getDelay(req.query);
    }


    @Get('/ConsultaSinParametros')
    getServicioSinParametros(@Req() req: Request) {        
        return this.repository.getConsultaSinParametros(req.query);
    }

    @Get('/ConsultaConParametros')
    getServicioConParametros(@Req() req: Request) {     
        return this.repository.getConsultaConParametros(req.query);
    }

    @Get('/ConsultaConParametros2/:idObjeto')
    getServicioConParametros2(@Req() req: Request) {     
        return this.repository.getConsultaConParametros(req.query);
    }

    // ************ Servicios POST ************
    @Post('/postInserta')
    postInserta(@Body() body: Request) {
        return this.repository.postInserta(body);
    }
    
    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************
    
}