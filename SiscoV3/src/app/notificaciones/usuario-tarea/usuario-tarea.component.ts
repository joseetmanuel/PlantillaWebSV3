import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IViewer, IViewersize, IViewertipo } from '../../interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-usuario-tarea',
  templateUrl: './usuario-tarea.component.html',
  styleUrls: ['./usuario-tarea.component.sass']
})
export class UsuarioTareaComponent implements OnInit {
  @Input() usuario: any;
  @Output('usuarioTarea') usuarioTarea: EventEmitter<any> = new EventEmitter<any>();
  avatar: Array<IViewer>;
  constructor() {
  }

  ngOnInit() {
    this.usuario.urlImagen = `${environment.fileServerUrl}${this.usuario.Foto}`
  }

  RemoverUsuario() {
    this.usuarioTarea.emit(this.usuario);
  }
}
