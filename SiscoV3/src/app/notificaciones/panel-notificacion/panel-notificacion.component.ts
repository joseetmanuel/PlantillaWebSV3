import { Component, OnInit } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash-es';


@Component({
  selector: 'app-panel-notificacion',
  templateUrl: './panel-notificacion.component.html',
  styleUrls: ['./panel-notificacion.component.sass'],
  providers: [SiscoV3Service]
})
export class PanelNotificacionComponent implements OnInit {
  notificaciones = new BehaviorSubject([]);
  getStateUser: Observable<any>;
  batch = 2;
  lastKey = 0;
  lastPage = 1;
  finished = false;
  sizeR = 20;

  constructor(private siscoV3Service: SiscoV3Service) { }

  ngOnInit() {
    this.getNotificaciones();
  }

  onScrollNotificacion() {
    this.getNotificaciones();
  }

  private getNotificaciones(key?) {
    if (this.finished) {
      return;
    }
    this.siscoV3Service.getService('notificacion/Notificaciones?Page=' + this.lastPage + '&PageSize=10').subscribe(
      (res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          const notificacionesNuevas = res.recordsets[0];
          this.lastKey = notificacionesNuevas.length > 0 ? notificacionesNuevas[(notificacionesNuevas.length - 1)].id : this.lastKey;
          const notificacionesActuales = this.notificaciones.getValue();
          if (this.lastKey === (notificacionesActuales.length > 0 ? notificacionesActuales[(notificacionesActuales.length - 1)].id : 0)) {
            this.finished = true;
          }
          this.lastPage++;
          this.notificaciones.next(_.concat(notificacionesActuales, notificacionesNuevas));
        }
      }, (error: any) => {
      }
    );
  }

  Excepciones(stack, tipoExcepcion: number) {
    console.log(tipoExcepcion);
    console.log(stack);
    // try {
    //   const dialogRef = this.dialog.open(ExcepcionComponent, {
    //     width: '60%',
    //     data: {
    //       idTipoExcepcion: tipoExcepcion,
    //       idUsuario: 1,
    //       idOperacion: 1,
    //       idAplicacion: 1,
    //       moduloExcepcion: 'add-cliente.component',
    //       mensajeExcepcion: '',
    //       stack
    //     }
    //   });

    //   dialogRef.afterClosed().subscribe((result: any) => {
    //   });

    // } catch (err) {
    // }
  }
}
