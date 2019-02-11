import { Request } from 'express';
import {
    JsonController,
    UploadedFile,
    Body,
    Get,
    Post,
    Req,
   
} from 'routing-controllers';
import { ObjetoRepository } from '../repository/objeto.repository';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * localhost:{{port}}/objeto/...
 */

@JsonController('/objeto')
export class ObjetoController {
    private repository: ObjetoRepository;

    constructor(repository: ObjetoRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************
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
    @Post('/postServicio')
    postServicio(@Body() body: Request) {
        return this.repository.postServicio(body);
    }
    
    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************
    
}