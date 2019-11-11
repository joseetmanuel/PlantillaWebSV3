import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable()
export class ExcepcionService {
 url: string;
 headers: HttpHeaders;

 constructor(private http: HttpClient) {
  this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  this.url = environment.excepcionUrl;
 }

 postService(ruta: string, body?: any, headers?: HttpHeaders) {
  if (headers) { this.headers = headers; }
  return this.http.post(this.url + ruta, body, { headers: this.headers });
 }
}