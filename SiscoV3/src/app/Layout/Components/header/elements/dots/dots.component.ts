import { Component, OnInit, ViewChild } from '@angular/core';
import { SiscoV3Service } from '../../../../../services/siscov3.service';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SessionInitializer } from '../../../../../services/session-initializer';
import { MessagingService } from '../../../../../services/messaging.service';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-dots',
  templateUrl: './dots.component.html',
})
export class DotsComponent implements OnInit {
  public notificaciones = new BehaviorSubject([]);
  public tieneNotificaciones = false;
  @ViewChild('dotNotificacionDropDown') dotNotificacionDropDown: NgbDropdown;
  constructor(private siscoV3Service: SiscoV3Service, private router: Router, private sessionInitializer: SessionInitializer, private messagingService: MessagingService) { }

  ngOnInit() {
    this.getNotificaciones();
    const susNot = this.messagingService.recibirMensajes();
    susNot.subscribe((res: any) => {
      if(res){
        this.getNotificaciones();
      }
    })
  }

  private getNotificaciones(): void {
    if (this.sessionInitializer.state) {
      this.siscoV3Service.getService('notificacion/NotificacionesPendientes').subscribe((res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          if (res.recordsets[0].length > 0) {
            this.notificaciones.next(res.recordsets[0]);
            this.tieneNotificaciones = true;
          } else {
            this.tieneNotificaciones = false;
          }
        }
      }, () => {
        console.log('No tiene notificaciones');
      }
      );
    }
  }

  abrirNotificaciones() {
    this.dotNotificacionDropDown.close()
    this.router.navigate(['/user-profile/2']);
  }

  Excepciones(error: string, codigo: number) {
    console.log(codigo + ':' + error);
  }

  notificacionLeida($event) {
    if($event) {
      this.getNotificaciones();
    }
  }
}
