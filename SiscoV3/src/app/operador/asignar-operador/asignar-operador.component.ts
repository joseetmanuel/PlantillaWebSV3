import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

import { IBuscador, TipoBusqueda, IViewer, IViewertipo, IViewersize } from './../../interfaces';
import { SiscoV3Service } from './../../services/siscov3.service';
import { IObjeto } from 'src/app/interfaces';
import { AppState, selectContratoState } from './../../store/app.states';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { ExcepcionComponent } from './../../utilerias/excepcion/excepcion.component';

import { InsOperadorComponent } from './../ins-operador/ins-operador.component';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-asignar-operador',
  templateUrl: './asignar-operador.component.html',
  styleUrls: ['./asignar-operador.component.scss']
})
export class AsignarOperadorComponent implements OnInit, OnDestroy {
  @ViewChild(InsOperadorComponent) operadorBusqueda: InsOperadorComponent;
  getStateNegocio: Observable<any>;
  claveModulo = 'app-asignar-operador';
  spinner = false;
  IObjeto: IObjeto[];
  idUsuario: number;
  idClase: string;
  idCliente: number;
  titleClase: string;
  logo: string;
  modulo: any = {};
  breadcrumb: any;
  subscripcionNegocio: Subscription;
  /*variables para el contrato activo*/
  contratos: any[];
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  rfcEmpresa: string;
  numero = 1;
  idObjeto: number;
  idTipoObjeto: number;
  /** variables para el buscador de usuario */
  operadorAsignado: any;
  operadorVigente: any;
  operador: number;
  buscador: IBuscador;
  IViewerUsu: IViewer[];
  operadores: any;
  /** variables para el form de usuario */
  operadorForm = new FormGroup({
    idOperador: new FormControl('', [Validators.required]),
    fechaAsignacion: new FormControl('', [Validators.required]),
    odometroAsignacion: new FormControl('', [Validators.required]),
    //estatus: new FormControl('', [Validators.required])
  });

  updOperadorForm = new FormGroup({
    idAsignacion: new FormControl('', [Validators.required]),
    fechaEntrega: new FormControl('', [Validators.required]),
    odometroEntrega: new FormControl('', [Validators.required])
  });


  constructor(private store: Store<AppState>,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private baseService: BaseService,
    private activatedRoute: ActivatedRoute) {
    this.getStateNegocio = this.store.select(selectContratoState);


    this.activatedRoute.params.subscribe(parametros => {
      this.idObjeto = parametros.idObjeto;
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
  }

  ngOnInit() {
    this.spinner = true;
    this.buscador = {
      isActive: true,
      tipoBusqueda: TipoBusqueda.operador,
      parametros: {
        buscarPorJerarquia: false,
        idUsuario: 0,
        busqueda: this.operadorForm.get('idOperador').value
      }
    };

    const usuario = this.baseService.getUserData();
    this.idUsuario = usuario.user.id;
    this.subscripcionNegocio = this.getStateNegocio.subscribe((stateN) => {

      if (stateN && stateN.claseActual) {
        this.contratoActual = stateN.contratoActual;
        this.idClase = stateN.claseActual;
        if (this.modulo.contratoObligatorio) {
          if (this.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;
          this.idCliente = this.contratoActual.idCliente;
          this.AllOperadores();
        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
        }
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
            [{ idObjeto: this.idObjeto }, { idTipoObjeto: this.idTipoObjeto }]);
        }
      }
    });

    this.IObjeto = [{
      idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente,
      numeroContrato: this.numeroContrato, rfcEmpresa: this.rfcEmpresa, idTipoObjeto: this.idTipoObjeto
    }];
  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  AllOperadores() {
    this.spinner = false;
    this.siscoV3Service.getService('operador/getOperadoresPorObj?idObjeto=' + this.idObjeto
      + '&idTipoObjeto=' + this.idTipoObjeto + '&idClase=' + this.idClase).subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.operadores = res.recordsets[0];
            this.operadores.forEach(element => {
              element.IViewer = [{
                idDocumento: element.Avatar,
                tipo: IViewertipo.avatar,
                descarga: false,
                size: IViewersize.xs
              }];
            });
          }
        },
        (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
          this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
            duration: 2000
          });
        }
      );
  }

  GenerarEntrega(idAsignacion: number) {
    this.operadorAsignado = null;
    this.operadores.forEach(element => {
      if (element.idAsignacion === idAsignacion) {
        const PrimerNombre = element.PrimerNombre != null ? element.PrimerNombre : '';
        const SegundoNombre = element.SegundoNombre != null ? element.SegundoNombre : '';
        const PrimerApellido = element.PrimerApellido != null ? element.PrimerApellido : '';
        const SegundoApellido = element.SegundoApellido != null ? element.SegundoApellido : '';

        this.operadorVigente = {
          id: element.idUsers,
          idAsignado: idAsignacion,
          fechaAsignacion: element.fechaAsignacion,
          odometroAsignacion: element.odometroAsignacion,
          fechaEntregaVigente: element.fechaEntrega,
          odometroEntregaVigente: element.odometroEntrega,
          iviewerVigente: [{
            idDocumento: element.Avatar,
            tipo: IViewertipo.avatar,
            descarga: false,
            size: IViewersize.md
          }],
          nombreOperadorVigente: PrimerNombre + ' ' + SegundoNombre + ' ' + PrimerApellido + ' ' + SegundoApellido
        };
        this.updOperadorForm.controls.idAsignacion.setValue(element.idAsignacion);
      }
    });
  }

  GuardarOperador() {
    this.spinner = true;
    const data = [];
    let fechaAsig;

    if (this.operadorForm.controls.fechaAsignacion.value) {
      fechaAsig = moment(
        this.operadorForm.controls.fechaAsignacion.value).format('YYYY-MM-DD');
    } else {
      fechaAsig = null;
    }

    data.push({
      idUsers: this.operadorForm.controls.idOperador.value,
      idTipoObjeto: this.idTipoObjeto,
      idObjeto: this.idObjeto,
      fechaAsignacion: fechaAsig,
      odometroAsignacion: this.operadorForm.controls.odometroAsignacion.value,
      idFileAsignacion: null,
      fechaEntrega: null,
      odometroEntrega: null,
      idFileEntrega: null
    });

    this.siscoV3Service.postService('operador/postInsAsignacionOp', data[0])
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha actualizado correctamente el tipo de objeto.', 'Ok', {
            duration: 2000
          });
          this.ngOnInit();
          this.operadorAsignado = null;

        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });
  }

  ActualizarOperador() {
    this.spinner = true;
    const data = [];
    let fechaEnt;
    if (this.updOperadorForm.controls.fechaEntrega.value) {
      fechaEnt = moment(this.updOperadorForm.controls.fechaEntrega.value).format('YYYY-MM-DD');
    } else {
      fechaEnt = null;
    }
    data.push({
      idAsignacion: this.updOperadorForm.controls.idAsignacion.value,
      fechaEntrega: fechaEnt,
      odometroEntrega: this.updOperadorForm.controls.odometroEntrega.value,
      idFileEntrega: null
    });
    this.siscoV3Service.postService('operador/postUpdAsignacionOp', data[0])
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha actualizado correctamente el operador.', 'Ok', {
            duration: 2000
          });
          this.ngOnInit();
          this.ResponseBuscador(null);
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });

  }

  ResponseBuscador($event) {
    if ($event !== null) {
      this.operador = $event.recordsets[0].Id;
      this.operadorForm.controls.idOperador.setValue(this.operador);
      this.operadorAsignado = $event.recordsets[0];
      /** validamos si el usuario ya esta seleccionado y ya no esta vigente */
      this.getUserActivo(this.operadorAsignado.Id);

      this.IViewerUsu = [{
        idDocumento: this.operadorAsignado.IdAvatar,
        tipo: IViewertipo.avatar,
        descarga: false,
        size: IViewersize.md
      }];

      let viewer: any = JSON.stringify(this.IViewerUsu);
      viewer = JSON.parse(viewer);
      viewer[0].idDocumento = $event.recordsets[0].IdAvatar;
      this.IViewerUsu = viewer;
    }
  }

  getUserActivo(idUsuario: number) {
    this.operadores.forEach(element => {
      if (element.idUsers === idUsuario && element.fechaEntrega === null && element.odometroEntrega === null) {
        this.GenerarEntrega(element.idAsignacion);
      }
    });
  }


  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de  la escepción ocurrida
   * @returns exception
   * @author Sandra Gil Rosales
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'objeto-documento.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.subscripcionNegocio.unsubscribe();
  }

}
