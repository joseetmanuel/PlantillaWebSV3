import { Service} from 'typedi';
import * as Q from 'q';
import * as sql from 'mssql';
import { default as confDB } from '../data/config';
import * as http from 'http';
import { default as config } from '../config';

/**
 * @summary En este archivo van todos los metodos referentes a la seguridad (logins) de SISCO
 * 
 */


@Service()
export class SeguridadRepository {
    
    // ************ Variables de clase ************
    private conf: any;

    constructor() {
        const env: string = process.env.NODE_ENV || 'development';
        this.conf = (config as any)[env]; // ejemplo de llamada al confg.js

    }

    // ************ Servicios GET ************
    // ************ Servicios POST ***********
    // ************ Servicios PUT ************
    // ************ Servicios DELETE *********
    // ************ Metodos Privados *********

    /**
     * @summary Función generica para conectarse a base de datos
     * @param callback Función de retorno
     * @returns Retorna la promesa, la ejecución del servicio, manda a llamar la calback
    */
    private dbConnect(callback: Function): Q.IPromise<{}> {
        const env: string = process.env.NODE_ENV || 'development';
        var deferred = Q.defer();
        var dbConn = new sql.ConnectionPool((confDB as any)[env]);
        dbConn.connect()
            .then(() => callback(dbConn, deferred))
            .catch(deferred.reject);

        return deferred.promise;
    }
}
