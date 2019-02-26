import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GLOBAL } from '../services/global';

@Injectable()
export class CommonService{
	public url:string;

	constructor(private _http:HttpClient){
		this.url = GLOBAL.common;
    }
    
    getTipoVialidad(){
        let headers = new HttpHeaders({'Content-Type':'application/json'});
		return this._http.get(this.url+'getTipoVialidad', {headers}).pipe(map(res=>res));
    }

    getTipoAsentamiento(){
        let headers = new HttpHeaders({'Content-Type':'application/json'});
		return this._http.get(this.url+'getTipoAsentamiento', {headers}).pipe(map(res=>res));
    }

	postCpAutocomplete(cp){
        let json = JSON.stringify(cp);
        let params = json;
		let headers = new HttpHeaders({'Content-Type':'application/json'});
		return this._http.post(this.url+'postCpAutocomplete',params, {headers}).pipe(map(res=>res));
	}
}