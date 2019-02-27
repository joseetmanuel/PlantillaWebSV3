import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GLOBAL } from './config';

@Injectable()
export class CommonService {
  public url: string;
  public headers: HttpHeaders;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.serviceUrul;
    this.headers = new HttpHeaders({'Content-Type': 'application/json'});
  }
  getTipoVialidad() {
    return this._http.get(this.url + 'getTipoVialidad', { headers: this.headers}).pipe(map(res => res));
  }

    getTipoAsentamiento(){
       
		return this._http.get(this.url+'getTipoAsentamiento', {headers}).pipe(map(res=>res));
    }

	postCpAutocomplete(cp){
        let json = JSON.stringify(cp);
        let params = json;
	
		return this._http.post(this.url+'postCpAutocomplete',params, {headers}).pipe(map(res=>res));
	}
}