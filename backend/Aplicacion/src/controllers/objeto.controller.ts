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
import * as mail from '../helpers/mail.helpler';

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
    @Get('/getServicio')
    getServicio(@Req() req: Request) {
        
        return this.repository.getServicio(req.query);
    }

    // ************ Servicios POST ************
    @Post('/postServicio')
    postServicio(@Body() body: Request) {
        return this.repository.postServicio(body);
    }
    
    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************
    
}