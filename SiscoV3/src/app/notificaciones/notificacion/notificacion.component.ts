import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.sass'],
  providers: [SiscoV3Service]
})
export class NotificacionComponent implements OnInit {
  @Output('notificacionLeida') notificacionLeida: EventEmitter<any> = new EventEmitter<any>();
  @Input() notificacion: any;
  @Input() token: string;
  constructor(private siscoV3Service: SiscoV3Service) { }

  ngOnInit() {
  }

  marcarLeido(notificacionLeida) {
    if (!notificacionLeida.leido) {
      const body = {
        IdCentroNotificacion: notificacionLeida.id
      };
      this.siscoV3Service.postService('notificacion/MarcarLeido', body).toPromise().then((res: any) => {
        if (res.recordsets[0]) {
          notificacionLeida.leido = true;
          this.notificacionLeida.emit(true);
        } else {
          this.notificacionLeida.emit(false);
        }
      }).catch(() => {
        this.notificacionLeida.emit(false);
      });
    }
  }
}
