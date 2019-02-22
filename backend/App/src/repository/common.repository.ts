import { Service } from 'typedi';
import { default as config } from '../config';
import { Query } from '../data/queryCommon';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * 
 */

@Service()
export class CommonRepository {

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

    

    // ************ Servicios POST ************

    postSearchCp(body: any): PromiseLike<{}> {
        return this.query.spExecute(body, "[direccion].[SEL_GETCPBYKEYWORD_SP]")
    }

    // ************ Servicios PUT ************


    // ************ Servicios DELETE ************

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
