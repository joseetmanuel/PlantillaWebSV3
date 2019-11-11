import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { TokenService } from './token.service';
import { SiscoV3Service } from './siscov3.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private fireStore: AngularFirestore, private tokenService: TokenService, private siscoService: SiscoV3Service) { }

  getChat(tokenSolicitud: string) {
    return this.fireStore.doc(`chat/${tokenSolicitud.trim()}`).collection(`mensaje`, ref => ref.orderBy('fecha', 'asc')).snapshotChanges();
  }

  createChat(tokenSolicitud: string, idSolicitud: number) {
    return this.fireStore.collection('chat').doc(tokenSolicitud.trim()).set({
      activo: true,
      fecha: new Date,
      lastUser: 0
    }).then((res) => {
      this.siscoService.postService(`notificacion/NotificacionChat`, { idSolicitud, mensaje: 'Nueva solicitud' })
    });
  }

  getUserList(userList: any) {
    const body = { idUsuarios: userList.map(usu => { return { usuario: { idUsuario: usu } } }) };
    return this.siscoService.postService('seguridad/selUsuarioXFiltro', body);
  }

  addMessage(tokenSolicitud: string, idSolicitud: number, mensaje: string) {
    const usuario = this.tokenService.getUserId();
    this.fireStore.collection('chat').doc(tokenSolicitud.trim()).set({ activo: true, fecha: new Date, lastUser: usuario.idUsuario }).then(() => {})
    this.fireStore.collection('chat').doc(tokenSolicitud.trim()).collection('mensaje').add({
      fecha: new Date,
      idUsuario: usuario.idUsuario,
      mensaje: mensaje,
      idAvatar: usuario.idAvatar
    }).then(() => {
      this.siscoService.postService(`notificacion/NotificacionChat`, { idSolicitud, mensaje }).toPromise().then(res => {
        return { status: true, mensaje: `Se guardo el mensaje correctamente` };
      }, error => {
        console.log(error);
        return { status: false, mensaje: JSON.stringify(error) };
      })
    }).catch(reason => {
      console.log(reason);
      return { status: false, mensaje: JSON.stringify(reason) };
    });
  }
}
