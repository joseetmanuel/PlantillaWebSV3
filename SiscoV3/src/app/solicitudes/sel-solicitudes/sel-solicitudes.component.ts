import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeleccionarSolicitudActual, SeleccionarSolicitudes } from 'src/app/store/actions/contrato.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.states';
import { SessionInitializer } from '../../services/session-initializer';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sel-solicitudes',
  templateUrl: './sel-solicitudes.component.html',
  styleUrls: ['./sel-solicitudes.component.sass']
})
export class SelSolicitudesComponent implements OnInit {
  subsParams: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private siscoService: SiscoV3Service,
    private sessionInitializer: SessionInitializer) {
  }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      let data;
      this.subsParams = this.activatedRoute.params.subscribe(parametros => {
        try {
          data = {
            idSolicitud: parametros.idSolicitud,
            idTipoSolicitud: parametros.idTipoSolicitud,
            idClase: parametros.idClase,
            rfcEmpresa: parametros.rfcEmpresa,
            idCliente: parametros.idCliente,
            numeroContrato: parametros.numeroContrato
          };
        } catch(err) {
          this.router.navigate(['login']);
        }
      });
      let ruta = `solicitud/GetSolicitudRedireccion?idSolicitud=${data.idSolicitud}&idTipoSolicitud=${data.idTipoSolicitud}&idClase=${data.idClase}&rfcEmpresa=${data.rfcEmpresa}&idCliente=${data.idCliente}&numeroContrato=${data.numeroContrato}`
      this.siscoService.getService(ruta).toPromise().then((res:any) => {
        if(res.error) {
          console.log('Error con el request')
          this.router.navigate(['login']);
        } else if(res.recordsets && res.recordsets.length > 0) {
          const solicitud = res.recordsets[0][0];
          this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: [solicitud] }));
          this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: solicitud }));
          this.router.navigateByUrl('/sel-solicitud');
        }
      }).catch((reason:any) => {
        console.log(reason);
      });
    }
  }

  ngOnDestroy() {
    this.subsParams.unsubscribe();
  }

}
