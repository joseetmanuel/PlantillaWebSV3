import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GLOBAL } from '../services/global';

@Injectable()
export class EmpresaService{
	public url:string;

	constructor(private _http:HttpClient){
		this.url = GLOBAL.empresa;
	}
	getEmpresas(){
		let headers = new HttpHeaders({'Content-Type':'application/json'});
		return this._http.get(this.url+'getEmpresas', {headers}).pipe(map(res=>res));
	}
}