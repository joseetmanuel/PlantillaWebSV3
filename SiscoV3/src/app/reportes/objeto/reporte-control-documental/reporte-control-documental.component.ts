import { Component, OnInit, OnDestroy, ViewChild, SimpleChange } from '@angular/core';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';
import { AppState, selectContratoState } from 'src/app/store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Negocio } from 'src/app/models/negocio.model';
import { SessionInitializer } from '../../../services/session-initializer';
import { BaseService } from '../../../services/base.service';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';


@Component({
  selector: 'app-reporte-control-documental',
  templateUrl: './reporte-control-documental.component.html',
  styleUrls: ['./reporte-control-documental.component.sass']
})
export class ReporteControlDocumentalComponent implements OnInit, OnDestroy {

  /** Variables de seguridad. */
  claveModulo = 'app-reporte-control-documental';
  idClase: string;
  modulo: any = {};
  breadcrumb: any;

  /**Variables de módulo */
  spinner: boolean = false;
  contratoActual: any;

  /**Variales redux */
  subsNegocio: Subscription;
  stateNegocio: Observable<any>;

  constructor(
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private store: Store<AppState>,
    private sessionInitializer: SessionInitializer,
    private baseService: BaseService
  ) {
    this.spinner = true;
    this.stateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.subsNegocio = this.stateNegocio.subscribe((stateNegocio) => {
      if (stateNegocio) {
        const usuario = this.baseService.getUserData();
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }
        if (this.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(false);
        } else {
          this.ConfigurarFooter(true);
        }
        this.spinner = false;
      }
    });
  }

  ngOnDestroy() {

  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

}
