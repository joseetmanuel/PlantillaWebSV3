import { Service } from 'typedi';
import { default as config } from '../config';
import { Query } from '../data/queryCliente';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * 
 */

@Service()
export class ClienteRepository {

    // ************ Variables de clase ************
    private conf: any; // variabel para guardar la configuración
    query: any;

    constructor() {
        const env: string = process.env.NODE_ENV || 'development';
        this.conf = (config as any)[env]; // ejemplo de llamada al confg.js
        this.query = new Query();
    }

    // ************ Servicios GET ************

    async getDelay(query: any): Promise<{}> {
        let delayres = await this.delay(1000);
        return { ok: "ok" }
    }

    /**
      * Plantilla de ejemplo para un servicio GET
      * @summary Objetivo del metodo 
      * @param query { nombreVarible tipoVariable descripción }   
      * @returns { nombreVarible tipoVariable descripción }
      *  
      */
    getConsultaSinParametros(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[esquema].[SEL_TABLA_SINPARAMETROS_SP]")
    }

    /**
     * Plantilla de ejemplo para un servicio GET
     * @summary Objetivo del metodo 
     * @param query { nombreVarible tipoVariable descripción }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */

    getConsultaConParametros(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[esquema].[SEL_TABLA_CONPARAMETROS_SP]")
    }


    getClientes(query:any):PromiseLike<{}>{
        return this.query.spExecute(query,"[cliente].[SEL_CLIENTE_SP]")
    }

    getClientePorId(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[cliente].[SEL_CLIENTEPORID_SP]")
    }

    getContratos(query:any):PromiseLike<{}>{
        return this.query.spExecute(query, "[cliente].[SEL_CONTRATO_SP]")
    }
    getContratoPorNumero(query:any):PromiseLike<{}>{
        return this.query.spExecute(query, "[cliente].[SEL_CONTRATOPORNUMERO_SP]")
    }

    getClienteEntidad(query:any):PromiseLike<{}>{
        return this.query.spExecute(query, '[cliente].[SEL_CLIENTEENTIDAD_SP]')
    }
    getClienteEntidadPorRfc(query:any):PromiseLike<{}>{
        return this.query.spExecute(query, '[cliente].[SEL_CLIENTEENTIDADPORRFC_SP]')
    }

    getClienteEntidadPorIdCliente(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[cliente].[SEL_CLIENTEENTIDADPORIDCLIENTE_SP]")
    }

    getClienteEntidadConDireccion(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[cliente].[SEL_CLIENTEENTIDADCONDIRECCION_SP]")
    }

    getTipoDocumento(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[cliente].[SEL_TIPODOCUMENTO_SP]")
    }

    getClienteDocumentoPorIdCliente(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[cliente].[SEL_CLIENTEDOCUMENTOPORIDCLIENTE_SP]")
    }

    // ************ Servicios POST ************

    /**
     *  Plantilla de ejemplo para un servicio Post
     * @summary Objetivo del metodo 
     * @param body { nombreVarible tipoVariable descripción }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */
    postInserta(body: any): PromiseLike<{}> {
        return this.query.spExecute(body, "[Excepcion].[SEL_EXCEPCIONPORID_SP]")
    }


    postInsertaCliente(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, "[cliente].[INS_CLIENTE_SP]")
    }
    postInsertaContrato(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[INS_CONTRATO_SP]')
    }

    postInsertaClienteEntidad(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[INS_CLIENTEENTIDAD_SP]')
    }

    postInsClienteDocumento(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[INS_CLIENTEDOCUMENTO_SP]')
    }

    // ************ Servicios PUT ************

    putActualizaCliente(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[UPD_CLIENTE_SP]')
    }

    putActualizaContrato(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[UPD_CONTRATO_SP]')
    }

    putActualizaClienteEntidad(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[UPD_CLIENTEENTIDAD_SP]')
    }

    putActualizaDireccionClienteEntidad(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[UPD_DIRECCIONCLIENTEENTIDAD_SP]')
    }

    // ************ Servicios DELETE ************
    deleteCliente(query:any):PromiseLike<{}>{
        return this.query.spExecute(query, '[cliente].[DEL_CLIENTE_SP]')
    }

    deleteContrato(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[DEL_CONTRATO_SP]')
    }
    deleteClienteEntidad(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[DEL_CLIENTEENTIDAD_SP]')
    }
    deleteClienteDocumento(body:any):PromiseLike<{}>{
        return this.query.spExecute(body, '[cliente].[DEL_CLIENTEDOCUMENTO_SP]')
    }

    // ************ Metodos Privados ************

    /**
    * Plantilla de ejemplo para un servicio GET
    * @summary Metodo para esperar delayInms milisegundos
    * @param delayInms { nombreVarible tipoVariable descripción }   
    * @returns null
    *  
    */
    async delay(delayInms: number) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    }
}
