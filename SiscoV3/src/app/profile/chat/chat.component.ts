import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ChatService } from '../../services/chat.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.sass']
})
export class ChatComponent implements OnInit, OnChanges {
  toggleMobileSidebar: any;
  @ViewChild('scrollChat') scrollChat: PerfectScrollbarComponent;
  @Input() idSolicitud: Observable<any>;
  @Input() tokenSolicitud: Observable<any>;
  userList: any[];
  mensaje: string;
  messageList = new BehaviorSubject([]);

  constructor(public chatService: ChatService) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    this.cargarDatos();
  }

  private cargarDatos(){
    if(this.tokenSolicitud) {
      this.chatService.getChat(this.tokenSolicitud.toString().trim()).subscribe(mensajes => {
        const mensList = mensajes.map(mens => {
          return {
            idUsuario: mens.payload.doc.data().idUsuario,
            mensaje: mens.payload.doc.data().mensaje,
            fecha: new Date(mens.payload.doc.data().fecha.seconds * 1000)
          }
        });
        const useList = mensList.map(us => {
          return us.idUsuario
        });
        this.chatService.getUserList(Array.from(new Set(useList))).subscribe(async (res:any) => {
          this.userList = res;
          this.messageList.next(this.setDataUser(this.userList, mensList));
        }, err => {
          console.log(err);
        });
      })
      this.scrollToBottom();
    }
  }

  private setDataUser(userList: any[], messageList: any[]): any[] {
    return messageList.map(mes => {
      let ul = userList.find(u => u.idUsuario === mes.idUsuario);
      return {
        ...mes,
        nombre: ul ? ul.nombre : '',
        ulrAvatar: ul ? ul.url : ''
      }
    });
  }

  onKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.EnviarMensaje();
      }
    } catch (error) {
      console.log('No atrapo al evento');
    }
  }

  public EnviarMensaje() {
    if (this.mensaje && this.mensaje !== '') {
      this.chatService.addMessage(this.tokenSolicitud.toString().trim(), Number.parseInt(this.idSolicitud.toString()), this.mensaje);
      this.mensaje = '';
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollChat) {
          this.scrollChat.directiveRef.scrollToBottom();
        }
      }, 500);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }
}
