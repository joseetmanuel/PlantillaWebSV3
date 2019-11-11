
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  headers: HttpHeaders;
  url: string;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging,
    private http: HttpClient) {
    this.angularFireMessaging.messaging.subscribe(
      (messaging) => {
        messaging.onMessage = messaging.onMessage.bind(messaging);
        messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
      }
    );
    this.headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.url = environment.messagingUrl;
  }

  /**
   * actualizar token de firebase
   * @param userId el userId que viene de seguridad
   * @param tokenUser el valor del token a notificar
   */
  updateToken(userId, tokenUser) {
    this.angularFireAuth.authState.pipe(take(1)).subscribe(
      () => {
        const data = {};
        data[userId] = tokenUser;
        this.postService('notificacion/postUsuarioToken', {idUsers: userId, token: tokenUser}).subscribe((resolve) => {}, error => {});
      });
  }

  /**
   * Solicitar permiso para la notificación de mensajería en la nube de Firebase
   * @param userId userId
   */
  requestPermission(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
         this.updateToken(userId, token);
      },
      (err) => {
        console.error('No se puede obtener permiso para notificar.', err);
      }
    );
  }

  /**
   * Metodo para recibir una nueva notificación
   */
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        this.currentMessage.next(payload);
      }, error => {
        console.log(error);
      });
  }

  recibirMensajes() {
    return this.angularFireMessaging.messages;
  }

  private postService(ruta: string, body?: any, headers?: HttpHeaders) {
    if (headers) { this.headers = headers; }
    return this.http.post(this.url + ruta, body, { headers: this.headers});
  }
}
