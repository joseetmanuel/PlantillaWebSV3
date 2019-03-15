import { Service } from 'typedi';
import { default as config } from '../config';
import { Query } from '../data/queryProveedor';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * 
 */

@Service()
export class ProveedorRepository {

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
     * Proveedores
     * @summary Ejecuta el sp para obtener todos los proveedores 
     * @param query { }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */

    getProveedores(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[proveedor].[SEL_PROVEEDORES_SP]")
    }

    /**
     * Proveedores
     * @summary Ejecuta el sp para obtener todos los proveedoresEntidad de un proveedor 
     * @param query { rfcProveedor }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */

    getProveedoresEntidad(query: any): PromiseLike<{}> {
        return this.query.spExecute(query, "[proveedor].[SEL_PROVEEDORENTIDADBYRFC_DINAMICO_SP]")
    }
    


    // ************ Servicios POST ************
    postInsProveedor(body: any): PromiseLike<{}>{
        return this.query.spExecute(body, "[proveedor].[INS_PROVEEDOR_SP]")
    }


    // ************ Servicios PUT ************


    putActualizaProveedor(body: any): PromiseLike<{}>{
        return this.query.spExecute(body, "[proveedor].[UPD_PROVEEDOR_SP]")
    }

    // ************ Servicios DELETE ************

    
    delProveedor(body: any): PromiseLike<{}>{
        return this.query.spExecute(body, "[proveedor].[DEL_PROVEEDOR_SP]")
    }

}
