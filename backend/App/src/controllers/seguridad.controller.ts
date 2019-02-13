import { Request } from 'express';
import * as sql from 'mssql';
import { Inject } from 'typedi';
import {
    JsonController,
    UploadedFile,
    Body,
    Get,
    Post,
    Req,
   
} from 'routing-controllers';
import {SeguridadRepository} from '../repository/seguridad.repository';
import * as mail from '../helpers/mail.helpler';


/**
 * @summary En este archivo van todos los metodos referentes a la seguridad (logins) 
 * localhost:{{port}}/seguridad/...
 */
@JsonController('/seguridad')
export class SeguridadController {
    private repository: SeguridadRepository;
    constructor( repository: SeguridadRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************
    // ************ Servicios POST ************
    // ************ Servicios PUT ************
    // ************ Servicios DELETE ************
}


// ********** Middleware Para conectar al servicio de seguridad

import {Middleware, ExpressMiddlewareInterface} from "routing-controllers";
import * as requestPost from 'request';
import { default as config } from '../config';

@Middleware({ type: "before" })
export class SeguridadMiddleware implements ExpressMiddlewareInterface {
    private conf: any;
    constructor() {
        const env: string = process.env.NODE_ENV || 'development';
        this.conf = (config as any)[env];
    }

    use(request: any, response: any, next: (err: any) => any): void {
        next(false);
        // if(request.headers != undefined && request.headers !=null &&
        //     request.headers.authorization != undefined && request.headers.authorization != null)
        // {
        //     let ruta = 'http://' + this.conf.host + ':' +this.conf.port + '/log/ValToken';
        //     requestPost.post({
        //         url:ruta,
        //         headers: {
        //             'Authorization': 'Bearer ' + request.headers.authorization
        //         }, 
        //         formData:{
        //             opcion: 'ASEDesflote',
        //             aplicacionesId: 2	
        //         }
        //     }, function (err: any,httpResponse : any,body : any){
        //         var respuesta = JSON.parse(body);
        //         if(!err && respuesta.code == 200){
        //             next(false);
        //         }else{
        //             next(
        //                 'Error login: ' + respuesta.error + ' ' +
        //                 'Descripción: ' + respuesta.error_description 
        //             );
        //         }
        //     });
        // } else{
        //     next(
        //         'Error login: no Token ' +
        //         'Descripción: ' + request.headers
        //     );
        // }
    }
}