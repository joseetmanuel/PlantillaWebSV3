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
 * {server}:{{port}}/cliente/...
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
    // #region documentación
    /*
    Nombre:         getClientes
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          15/02/2019
    Descripción:    Obtener todos los Clientes
    SP:             [cliente].[SEL_CLIENTE_SP]
    Url:            http://{server}:{port}/cliente/getClientes
    Wiki:           https://github.com/joseetmanuel/PlantillaWeb/wiki/Cliente
    */
    // #endregion
    getClientes(@Req() req: Request) {
        return this.repository.getClientes(req.query)
    }


    @Get('/getClientePorId')
    // #region documentación
    /*
    Nombre:         getClientePorId
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener a un cliente por idCliente
    SP:             [cliente].[SEL_CLIENTEPORID_SP]
    Url:            http://{server}:{port}/cliente/getClientePorId?idCliente=1
    Wiki:           https://github.com/joseetmanuel/PlantillaWeb/wiki/Cliente
    */
    // #endregion
    getClientePorId(@Req() req: Request) {
        return this.repository.getClientePorId(req.query);
    }


    @Get('/getContratos')
    // #region documentación
    /*
    Nombre:         getContratos
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener todos los Contratos
    SP:             [cliente].[SEL_CONTRATO_SP]
    Url:            http://{server}:{port}/cliente/getContratos
    Wiki:           ...
    */
    // #endregion
    getContratos(@Req() req: Request) {
        return this.repository.getContratos(req.query);
    }


    @Get('/getContratoPorNumero')
    // #region documentación
    /*
    Nombre:         getContratoPorNumero
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener a un contrato por numeroContrato
    SP:             [cliente].[SEL_CONTRATOPORNUMERO_SP]
    Url:            http://{server}:{port}/cliente/getContratoPorNumero?numeroContrato=1
    Wiki:           ...
    */
    // #endregion
    getContratoPorNumero(@Req() req: Request) {
        return this.repository.getContratoPorNumero(req.query)
    }


    @Get('/getClienteEntidad')
    // #region documentación
    /*
    Nombre:         getClienteEntidad
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener todos los ClienteEntidad
    SP:             [cliente].[SEL_CLIENTEENTIDAD_SP]
    Url:            http://{server}:{port}/cliente/getClienteEntidad
    Wiki:           ...
    */
    // #endregion
    getClienteEntidad(@Req() req: Request) {
        return this.repository.getClienteEntidad(req.query)
    }


    @Get('/getClienteEntidadPorRfc')
    // #region documentación
    /*
    Nombre:         getClienteEntidadPorRfc
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Obtener a un cliente entidad por rfcClienteEntidad
    SP:             [cliente].[SEL_CLIENTEENTIDADPORRFC_SP]
    Url:            http://{server}:{port}/cliente/getClienteEntidadPorRfc?rfcClienteEntidad=1
    Wiki:           ...
    */
    // #endregion
    getClienteEntidadPorRfc(@Req() req: Request) {
        return this.repository.getClienteEntidadPorRfc(req.query);
    }

    @Get('/getClienteEntidadPorIdCliente')
    // #region documentación
    /*
    Nombre:         getClienteEntidadPorRfc
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          04/03/2019
    Descripción:    Obtener a un cliente entidad por idCliente
    SP:             [cliente].[SEL_CLIENTEENTIDADPORIDCLIENTE_SP]
    Url:            http://{server}:{port}/cliente/getClienteEntidadPorIdCliente?idCliente=35
    Wiki:           ...
    */
    // #endregion
    getClienteEntidadPorIdCliente(@Req() req: Request) {
        return this.repository.getClienteEntidadPorIdCliente(req.query);
    }

    @Get('/getClienteEntidadConDireccion')
    // #region documentación
    /*
    Nombre:         getClienteEntidadConDireccion
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          05/03/2019
    Descripción:    Obtener a un cliente entidad con su direccion
    SP:             [cliente].[SEL_CLIENTEENTIDADCONDIRECCION_SP]
    Url:            http://{server}:{port}/cliente/getClienteEntidadConDireccion?rfcClienteEntidad = rfc
    Wiki:           ...
    */
    // #endregion
    getClienteEntidadConDireccion(@Req() req: Request) {
        return this.repository.getClienteEntidadConDireccion(req.query);
    }

    
    // ************ Servicios POST ************
    
    @Post('/postInserta')
    postInserta(@Body() body: Request) {
        return this.repository.postInserta(body);
    }


    @Post('/postInsertaCliente')
    // #region documentación
    /*
    Nombre:         postInsertaCliente
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Insertar un Cliente
    SP:             [cliente].[INS_CLIENTE_SP]
    Url:            http://{server}:{port}/cliente/postInsertaCliente
    Wiki:           ...
    */
    // #endregion
    postInsertaCliente(@Body() body: Request) {
        return this.repository.postInsertaCliente(body);
    }


    @Post('/postInsertaContrato')
    // #region documentación
    /*
    Nombre:         postInsertaContrato
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Insertar un Contrato
    SP:             [cliente].[INS_CONTRATO_SP]
    Url:            http://{server}:{port}/cliente/postInsertaContrato
    Wiki:           ...
    */
    // #endregion
    postInsertaContrato(@Body() body: Request) {
        return this.repository.postInsertaContrato(body);
    }


    @Post('/postInsertaClienteEntidad')
    // #region documentación
    /*
    Nombre:         postInsertaClienteEntidad
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Insertar un Cliente Entidad
    SP:             [cliente].[INS_CLIENTEENTIDAD_SP]
    Url:            http://{server}:{port}/cliente/postInsertaClienteEntidad
    Wiki:           ...
    */
    // #endregion
    postInsertaClienteEntidad(@Body() body: Request) {
        return this.repository.postInsertaClienteEntidad(body);
    }

    // ************ Servicios PUT ************ 
    @Put('/putActualizaCliente')
    // #region documentación
    /*
    Nombre:         putActualizaCliente
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Actualiza un Cliente
    SP:             [cliente].[UPD_CLIENTE_SP]
    Url:            http://{server}:{port}/cliente/putActualizaCliente
    Wiki:           ...
    */
    // #endregion
    putActualizaCliente(@Body() body: Request) {
        return this.repository.putActualizaCliente(body);
    }


    @Put('/putActualizaContrato')
    // #region documentación
    /*
    Nombre:         putActualizaContrato
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Actualiza un Contrato
    SP:             [cliente].[UPD_CONTRATO_SP]
    Url:            http://{server}:{port}/cliente/putActualizaContrato
    Wiki:           ...
    */
    // #endregion
    putActualizaContrato(@Body() body: Request) {
        return this.repository.putActualizaContrato(body);
    }


    @Put('/putActualizaClienteEntidad')
    // #region documentación
    /*
    Nombre:         putActualizaClienteEntidad
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Actualiza un ClienteEntidad
    SP:             [cliente].[UPD_CLIENTEENTIDAD_SP]
    Url:            http://{server}:{port}/cliente/putActualizaClienteEntidad
    Wiki:           ...
    */
    // #endregion
    putActualizaClienteEntidad(@Body() body: Request) {
        return this.repository.putActualizaClienteEntidad(body);
    }

    @Put('/putActualizaDireccionClienteEntidad')
    // #region documentación
    /*
    Nombre:         putActualizaDireccionClienteEntidad
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          06/03/2019
    Descripción:    Actualiza un ClienteEntidad con Direccion
    SP:             [cliente].[UPD_DIRECCIONCLIENTEENTIDAD_SP]
    Url:            http://{server}:{port}/cliente/putActualizaDireccionClienteEntidad
    Wiki:           ...
    */
    // #endregion
    putActualizaDireccionClienteEntidad(@Body() body: Request) {
        return this.repository.putActualizaDireccionClienteEntidad(body);
    }

    // ************ Servicios DELETE ************
    @Delete('/deleteCliente')
    // #region documentación
    /*
    Nombre:         deleteCliente
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Elimina un Cliente
    SP:             [cliente].[DEL_CLIENTE_SP]
    Url:            http://{server}:{port}/cliente/deleteCliente
    Wiki:           ...
    */
    // #endregion
    deleteCliente(@Req() req: Request) {
        return this.repository.deleteCliente(req.query);
    }


    @Delete('/deleteContrato')
     // #region documentación
    /*
    Nombre:         deleteContrato
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Elimina un Contrato
    SP:             [cliente].[DEL_CONTRATO_SP]
    Url:            http://{server}:{port}/cliente/deleteContrato
    Wiki:           ...
    */
    // #endregion
    deleteContrato(@Body() body: Request) {
        return this.repository.deleteContrato(body);
    }


    @Delete('/deleteClienteEntidad')
    // #region documentación
    /*
    Nombre:         deleteClienteEntidad
    Autor:          Gerardo Zamudio Gonzalez
    Fecha:          18/02/2019
    Descripción:    Elimina un ClienteEntidad
    SP:             [cliente].[DEL_CLIENTEENTIDAD_SP]
    Url:            http://{server}:{port}/cliente/deleteClienteEntidad
    Wiki:           ...
    */
    // #endregion
    deleteClienteEntidad(@Req() req: Request) {
        return this.repository.deleteClienteEntidad(req.query);
    }
}