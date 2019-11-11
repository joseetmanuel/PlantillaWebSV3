import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public authS: AuthService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authS.GetTokenStr();
        if (token !== '') {
            request = request.clone({
                setHeaders: {
                    Authorization: `${token}`
                }
            });
        }
        return next.handle(request);
    }
}
