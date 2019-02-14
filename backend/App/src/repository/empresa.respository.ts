import { Service } from 'typedi';
import { default as config } from '../config';
import { Query } from '../data/queryCliente';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * 
 */

@Service()
export class EmpresaRepository {

    // ************ Variables de clase ************
    private conf: any; // variabel para guardar la configuración
    query: any;

    constructor() {
        const env: string = process.env.NODE_ENV || 'development';
        this.conf = (config as any)[env]; // ejemplo de llamada al confg.js
        this.query = new Query();
    }

    // ************ Servicios GET ************

    /**
      * Plantilla de ejemplo para un servicio GET
      * @summary Objetivo del metodo 
      * @param query { nombreVarible tipoVariable descripción }   
      * @returns { nombreVarible tipoVariable descripción }
      *  
      */


    getEmpresas(query:any):PromiseLike<{}>{
        return this.query.spExecute(query, "[empresa].SEL_EMPRESA_SP");
    }

    getEmpresaPorRfc(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[empresa].[SEL_EMPRESAPORRFC_SP]")
    }
    

    // ************ Servicios POST ************

    postInsertaEmpresa(body: any): PromiseLike<{}> {
        return this.query.spExecute(body, "[empresa].[INS_EMPRESA_SP]")
    }

    // ************ Servicios PUT ************
    putActualizaEmpresa(body: any): PromiseLike<{}> {
        return this.query.spExecute(body, "[empresa].[UPD_EMPRESA_SP]")
    }


    // ************ Servicios DELETE ************
    deleteEmpresa(del: any): PromiseLike<{}>{
        return this.query.spExecute(del, "[empresa].[DEL_EMPRESA_SP]")
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
