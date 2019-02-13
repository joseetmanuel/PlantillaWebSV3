import { Service} from 'typedi';
import * as Q from 'q';
import * as sql from 'mssql';
import { default as confDB } from '../data/config';
import * as http from 'http';
import { default as config } from '../config';
import { Query } from '../data/query';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * 
 */

@Service()
export class ObjetoRepository {
    
    // ************ Variables de clase ************
    private conf: any; // variabel para guardar la configuración
    query : any;

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

   // ************ Servicios POST ************

    /**
     *  Plantilla de ejemplo para un servicio Post
     * @summary Objetivo del metodo 
     * @param body { nombreVarible tipoVariable descripción }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */
    postServicio(body: any): PromiseLike<{}> {
        return this.query.spExecute(body, "[Excepcion].[SEL_EXCEPCIONPORID_SP]")
    }

    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************

    // ************ Metodos Privados ************
}
