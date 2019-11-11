import { Component, OnInit } from '@angular/core';
import { SiscoV3Service } from '../../../../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../../models/negocio.model';

import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { environment } from 'src/environments/environment';
import { IViewer, IViewertipo, IViewersize, TipoAccionCargaMasiva } from 'src/app/interfaces';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';

@Component({
  selector: 'app-precios-venta-carga-masiva',
  templateUrl: './precios-venta-carga-masiva.component.html',
  styleUrls: ['./precios-venta-carga-masiva.component.scss']
})
export class PreciosVentaCargaMasivaComponent implements OnInit {

  breadcrumb: any[];
  state;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-precios-venta-carga-masiva';
  idClase = '';
  modulo: any = {};
  acciones = [TipoAccionCargaMasiva.ACTUALIZAR];

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  numero = 1;
  idCliente;
  rfcEmpresa;
  numeroContrato;
  idTipoObjeto;
  columnas = [];

  partidas;
  bant = false;
  urlApi = 'contrato/postInsCostosPartidaMasivo';
  sp = '[contrato].[INS_PRECIOSPARTIDA_SP]';
  parametrosSP;

  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.getStateNegocio.subscribe((stateN) => {
          if (stateN.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
          if (stateN && stateN.claseActual) {
            this.idClase = stateN.claseActual;
            this.state = state;
            this.loadData(this.state);
          }
        });
      }
    });
  }

  /*
    Se deja el multicontrato y el contrato como obligatorio ya que se desconoce si esta en seguridad
    Lo debe cambiar de acuerdo a la regla de negocio
  */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, true, true, false)
    ));
  }

  loadData(state) {
    // tslint:disable-next-line: deprecation
    this.activatedRoute.params.subscribe(parametros => {
      // this.numero = 0;
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.idTipoObjeto = parametros.idTipoObjeto;
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
      this.parametrosSP = {
        idCliente: this.idCliente,
        rfcEmpresa: this.rfcEmpresa,
        numeroContrato: this.numeroContrato,
        idTipoObjeto: this.idTipoObjeto,
        idClase: this.idClase
      };
      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }, { idTipoObjeto: this.idTipoObjeto }]);
      }
      this.LoadDataa();
    });
  }

  LoadDataa() {
    try {
      this.numero = 0;
      // tslint:disable-next-line:max-line-length
      this.siscoV3Service.getService(`contrato/getPartidaVenta?idClase=${this.idClase}&rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idTipoObjeto=${this.idTipoObjeto}`).subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.columnas = [];
            this.partidas = res.recordsets[0];
            this.fillTable(this.partidas);
          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  fillTable(partidas) {
    let conta = 0;
    Object.keys(partidas[0]).forEach((k, i, arr) => {
      // tslint:disable-next-line:max-line-length
      if (k !== 'noParte' && k !== 'partida' && k !== 'Descripción' && k !== 'foto' && k !== 'instructivo' && k !== 'rfcEmpresa' && k !== 'idCliente' && k !== 'numeroContrato' && k !== 'idClase' && k !== 'Resultado') {
        if (k === 'idPartida') {
          this.columnas.push({
            nombre: 'Id', tipo: 'number', obligatorio: true,
            descripcion: 'Id'
          });
        } else {
          this.columnas.push({
            nombre: k, tipo: 'number', obligatorio: false,
            descripcion: k
          });
        }
      }
      conta++;
      if (conta === arr.length) {
        this.bant = true;
      }
    });
  }

  reponse(res) {
    if (res.error) {
      this.excepciones(res.error, 3);
    } else {
      // tslint:disable-next-line:max-line-length
      this.router.navigateByUrl(`/upd-unidad-contrato/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${this.idTipoObjeto}`);
    }
  }


  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'upd-unidad-contrato.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        this.numero = 1;
      });
    } catch (error) {
      this.numero = 1;
      console.error(error);
    }
  }
}
