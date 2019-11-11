import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppState, selectAuthState } from '../../store/app.states';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.sass']
})
export class ChatBoxComponent implements OnInit {
  @Output() actualizar: EventEmitter<string>;
  @Input() chat: any;
  getStateUser: Observable<any>;

  constructor(private store: Store<AppState>, private tokenService: TokenService) {
    this.getStateUser = this.store.select(selectAuthState);
  }

  ngOnInit() {
    const usuario = this.tokenService.getUserId();
    this.chat.fecha = this.getDateFormatted(this.chat.fecha);
    this.chat.propio = this.chat.idUsuario === usuario.idUsuario ? false: true;
  }

  private getDateFormatted(fecha: Date): string {
    return `${this.getZeroLeft(fecha.getDate())} - ${this.getZeroLeft(fecha.getMonth())} - ${fecha.getFullYear().toString()} ${this.getZeroLeft(fecha.getHours())} : ${this.getZeroLeft(fecha.getMinutes())} : ${this.getZeroLeft(fecha.getSeconds())}`;
  }

  private getZeroLeft(cadena: number): string {
    return cadena.toString().length === 2 ? cadena.toString() : `0${cadena}`;
  }
}
