import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GLOBAL } from '../services/global';

@Injectable()
export class ClienteService{
	public url:string;

	constructor(private _http:HttpClient){
		this.url = GLOBAL.cliente;
	}
	postInsertaCliente(cliente){
        let json = JSON.stringify(cliente);
        let params = json;
		let headers = new HttpHeaders({'Content-Type':'application/json'});
		return this._http.post(this.url+'postInsertaCliente',params, {headers}).pipe(map(res=>res));
	}
}