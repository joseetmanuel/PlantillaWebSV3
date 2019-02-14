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


    
    @Get('/getClientes')
    getClientes(@Req() req:Request){
        return this.repository.getClientes(req.query)
    }

    @Get('/getClientePorId')
    getClientePorId(@Req() req: Request) {
        return this.repository.getClientePorId(req.query);
    }

    @Get('/getContratos')
    getContratos(@Req() req:Request){
        return this.repository.getContratos(req.query);
    }
    @Get('/getContratoPorNumero')
    getContratoPorNumero(@Req() req:Request){
        return this.repository.getContratoPorNumero(req.query)
    }

    @Get('/getClienteEntidad')
    getClienteEntidad(@Req() req:Request){
        return this.repository.getClienteEntidad(req.query)
    }
    @Get('/getClienteEntidadPorRfc')
    getClienteEntidadPorRfc(@Req() req:Request){
        return this.repository.getClienteEntidadPorRfc(req.query);
    }

    // ************ Servicios POST ************
    @Post('/postInserta')
    postInserta(@Body() body: Request) {
        return this.repository.postInserta(body);
    }


    @Post('/postInsertaCliente')
    postInsertaCliente(@Body() body:Request){
        return this.repository.postInsertaCliente(body);
    }
    @Post('/postInsertaContrato')
    postInsertaContrato(@Body() body:Request){
        return this.repository.postInsertaContrato(body);
    }
    @Post('/postInsertaClienteEntidad')
    postInsertaClienteEntidad(@Body() body:Request){
        return this.repository.postInsertaClienteEntidad(body);
    }

    // ************ Servicios PUT ************ 
    @Put('/putActualizaCliente')
    putActualizaCliente(@Body() body:Request){
        return this.repository.putActualizaCliente(body);
    }
    @Put('/putActualizaContrato')
    putActualizaContrato(@Body() body:Request){
        return this.repository.putActualizaContrato(body);
    }
    @Put('/putActualizaClienteEntidad')
    putActualizaClienteEntidad(@Body() body:Request){
        return this.repository.putActualizaClienteEntidad(body);
    }

    // ************ Servicios DELETE ************
    @Delete('/deleteCliente')
    deleteCliente(@Body() body:Request){
        return this.repository.deleteCliente(body);
    }
    @Delete('/deleteContrato')
    deleteContrato(@Body() body:Request){
        return this.repository.deleteContrato(body);
    }
    @Delete('/deleteClienteEntidad')
    deleteClienteEntidad(@Body() body:Request){
        return this.repository.deleteClienteEntidad(body);
    }
}