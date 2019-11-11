import { OnInit, Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import {
  IObjeto,
  IFileUpload,
  IViewer,
  IViewertipo,
  IViewersize,
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  IColumnHiding,
  ICheckbox,
  IEditing,
  IColumnchooser,
  TiposdeDato,
  TiposdeFormato,
  AccionNotificacion,
  GerenciaNotificacion
} from '../../interfaces';
import * as moment from 'moment';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { environment } from 'src/environments/environment';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { HttpClient } from '@angular/common/http';
import { SessionInitializer } from 'src/app/services/session-initializer';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import { Subscription } from 'rxjs';
import { IPartida } from '../ins-solicitud-factura/ins-solicitud-factura.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ThemeOptions } from '../../theme-options';

@Component({
  selector: 'app-auth-partidas',
  templateUrl: './auth-partidas.component.html',
  styleUrls: ['../sel-solicitud/sel-solicitud.component.scss']
})
export class AuthPartidasComponent implements OnInit, OnDestroy {

  @ViewChild('tok') tok: ElementRef;
  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  subsNegocio: Subscription;
  idUsuario;
  idClase;

  colorcito = '#783021';

  spinner = false;
  solicitudActual: any;
  state: any;
  state2: any;
  contratoActual: any;
  idSolicitud: any;
  rfcEmpresa: any;
  idCliente: any;
  numeroContrato: any;
  idObjeto: any;
  idTipoObjeto: any;
  idTipoSolicitud: any;
  idLogo: any;
  claveModulo = 'app-auth-partidas';
  breadcrumb: any[];
  modulo: any;
  proveedores: any;
  partidasCotizaciones: any;
  cotizacionesTable: any[];
  ban: boolean;
  datosevent: any;
  idUsuarioToken = 0;
  tokens: any;
  idUsuarioActual;

  gridOptions: IGridOptions;
  columns: IColumns[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  tokenForm = new FormGroup({
    token: new FormControl('', [Validators.required, Validators.minLength(6),
    Validators.maxLength(6)]),
  });
  // reglas = [
  //   {
  //     ordenRegla: 1,
  //     partidas: [
  //       {
  //         idPartida: 31950,
  //         idTipoObjeto: 92,
  //         idClase: 'Automovil',
  //         cantidad: 1,
  //         costoInicial: 4200,
  //         ventaInicial: 2000,
  //         nombreEstatus: 'En espera'
  //       },
  //       {
  //         idPartida: 31952,
  //         idTipoObjeto: 92,
  //         idClase: 'Automovil',
  //         cantidad: 1,
  //         costoInicial: 4200,
  //         ventaInicial: 2000,
  //         nombreEstatus: 'En espera'
  //       }
  //     ],
  //     reglaMontoSolicitud: {
  //       minimo: 0,
  //       maximo: 8000
  //     },
  //     reglaMontoPartida: {
  //       minimo: 4200,
  //       maximo: 20000
  //     },
  //     aplicaReglaCantidadPartida: true,
  //     reglaCantidadPartida: 10,
  //     aplicaReglaMontoSolicitud: true,
  //     aplicaReglaMontoPartida: true
  //   }
  // ];
  reglas;
  sumaTotalSolicitud: any;
  bandCostoVenta: boolean;
  costos: any;
  idCotizacion: any;
  moduloCosto: boolean;
  moduloVenta: boolean;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private httpClient: HttpClient,
    private siscoV3Service: SiscoV3Service,
    private snackBar: MatSnackBar,
    private sessionInitializer: SessionInitializer,
    private store: Store<AppState>,
    public globals: ThemeOptions
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    globals.banderaFooterSol = true;
    // const Solicitudes = [{
    //   idCliente: 78,
    //   idLogoContrato: 17357,
    //   idObjeto: 82,
    //   idSolicitud: 99,
    //   idTipoObjeto: 92,
    //   idTipoSolicitud: 'Servicio',
    //   numeroContrato: '123PEMEX',
    //   numeroOrden: '03-1080-82',
    //   rfcEmpresa: 'DIC0503123MD3',
    // }];
    // this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: Solicitudes }));
    // this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: Solicitudes[0] }));
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuarioActual = state.seguridad.user.id
        // this.idUsuario = 6131;
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            if (this.solicitudActual !== state2.solicitudActual) {
              if (state2.solicitudActual) {
                this.idClase = state2.claseActual;
                this.state = state;
                this.state2 = state2;
                this.contratoActual = state2.contratoActual;
                this.loadData(this.state, state2.solicitudActual);
              } else {
                this.router.navigate(['home']);
              }
            }
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.globals.banderaFooterSol = false;
    this.subsNegocio.unsubscribe();
  }

  loadData(state: any, solicitudActual: any) {
    this.ban = false;
    this.bandCostoVenta = true;
    this.solicitudActual = solicitudActual;
    this.idSolicitud = this.solicitudActual.idSolicitud;
    this.rfcEmpresa = this.solicitudActual.rfcEmpresa;
    this.idCliente = this.solicitudActual.idCliente;
    this.numeroContrato = this.solicitudActual.numeroContrato;
    this.idObjeto = this.solicitudActual.idObjeto;
    this.idTipoObjeto = this.solicitudActual.idTipoObjeto;
    this.idTipoSolicitud = this.solicitudActual.idTipoSolicitud;
    this.idLogo = this.solicitudActual.idLogoContrato;
    this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
    if (this.modulo.breadcrumb) {
      // tslint:disable-next-line:max-line-length
      this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idSolicitud: this.idSolicitud }, { rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }, { idObjeto: this.idObjeto }]);
    }

    this.moduloCosto = true;
    this.moduloVenta = false;
    if (this.modulo.camposClase.find(x => x.nombre === 'VerVenta')) {
      this.moduloVenta = true;
    }
    this.spinner = true;
    this.idUsuario = this.idUsuarioActual;
    if (this.idUsuarioToken !== 0) {
      this.idUsuario = this.idUsuarioToken;
      this.idUsuarioToken = 0;
    }
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`autorizacion/GetReglaSolicitud?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idTipoSolicitud=${this.idTipoSolicitud}&idSolicitud=${this.idSolicitud}&idClase=${this.idClase}&idUsuario=${this.idUsuario}`).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          if (res.error) {
            this.snackBar.open(res.error, 'Ok', {
              duration: 2000
            });
          } else {
            this.reglas = res.partidasReglas[0];
            this.getProveedorCotizacion();
          }
        }
        // this.tempo = JSON.stringify(res[0]);
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  getProveedorCotizacion() {
    this.spinner = true;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`solicitud/GetProveedoresCotizacion?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idSolicitud=${this.idSolicitud}&idTipoObjeto=${this.idTipoObjeto}&idClase=${this.idClase}`).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          // this.prov = res.recordsets[0];
          this.proveedores = res.recordsets[1];
          const partidasCotizaciones = res.recordsets[2];
          this.costos = res.recordsets[4];
          this.sumaTotalSolicitud = res.recordsets[5][0];
          this.partidasCot(partidasCotizaciones);
        }
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  partidasCot(partidas) {
    this.partidasCotizaciones = [];
    let conta = 0;
    partidas.forEach((e, i, ar) => {
      e.costo = e.costoInicial * e.cantidad;
      this.partidasCotizaciones.push(e);
      conta++;
      if (conta === ar.length) {
        this.getTarget();
      }
    });
  }

  getTarget(val?) {
    if (val === undefined) {
      val = '1';
    }
    const regla = this.reglas;
    const newArr = [];
    let cont = 0;
    const that = this;
    let ot = [];
    let conti = 0;
    this.proveedores.forEach((e, i, ar) => {
      ot = [];
      conti = 0;
      this.partidasCotizaciones.forEach((ep, ip, arp) => {
        if (ep.fechaEstatus) {
          ep.fechaEstatus = moment(ep.fechaEstatus, 'YYYY-MM-DD').utc();
        }
        // tslint:disable-next-line:max-line-length
        if (e.rfcProveedor === ep.rfcProveedor && e.idProveedorEntidad === ep.idProveedorEntidad && e.numeroCotizacion === ep.numeroCotizacion) {
          // tslint:disable-next-line:ban-types
          let des;
          let color;
          if (regla.partidas.find(idPartida => idPartida.idPartida === ep.idPartida) && regla.partidas.find(idCotizacion => idCotizacion.idCotizacion === ep.idCotizacion)) {
            des = false;
            if (regla.aplicaReglaMontoPartida) {
              if (ep.costo < regla.reglaMontoPartida.minimo || ep.costo > regla.reglaMontoPartida.maximo) {
                des = true;
                color = '#D4D4D4';
              } else {
                des = false;
                if (ep.idEstatusCotizacionPartida === 'APROBADA' || ep.idEstatusCotizacionPartida === 'RECHAZADA') {
                  des = true;
                  color = '#D4D4D4';
                }
              }
            }
            if (ep.idEstatusCotizacionPartida === 'APROBADA' || ep.idEstatusCotizacionPartida === 'RECHAZADA') {
              des = true;
              color = '#D4D4D4';
            }
          } else {
            des = true;
            color = '#D4D4D4';
          }
          ep.disable = des;
          ep.backgroundcolor = color;
          if (that.idCotizacion) {
            if (that.idCotizacion !== ep.idCotizacion) {
              ep.disable = true;
              ep.backgroundcolor = '#D4D4D4';
            }
          }
          ot.push(ep);
        }
        conti++;
        if (conti === arp.length) {
          const columnas = [];
          columnas.push(
            {
              caption: 'Estatus',
              dataField: 'idEstatusCotizacionPartida'
            },
            {
              caption: 'Id',
              dataField: 'idPartida'
            },
            {
              caption: 'Foto',
              dataField: 'Foto',
              cellTemplate: 'foto'
            },
            {
              caption: 'Instructivo',
              dataField: 'Instructivo',
              cellTemplate: 'foto'
            },
            {
              caption: 'Partida',
              dataField: 'partida'
            },
            {
              caption: 'NoParte',
              dataField: 'noParte'
            },
            {
              caption: 'Descripción',
              dataField: 'Descripcion'
            },
            {
              caption: 'Cantidad',
              dataField: 'cantidad'
            })
          if (val === '1') {
            this.bandCostoVenta = true;
            columnas.push({
              caption: 'Costo unitario',
              dataField: 'costoInicial'
            },
              {
                caption: 'Costo',
                dataField: 'subTotalCosto'
              })
          } else {
            this.bandCostoVenta = false;
            columnas.push({
              caption: 'Venta unitaria',
              dataField: 'ventaInicial'
            },
              {
                caption: 'Venta',
                dataField: 'subTotalVenta'
              })
          }
          columnas.push({
            caption: 'Usuario aprobador',
            dataField: 'nombreCompleto'
          },
            {
              caption: 'Fecha',
              dataField: 'fechaEstatus',
              dataType: TiposdeDato.datetime,
              format: TiposdeFormato.dmy
            },
          );
          newArr.push({
            rfcProveedor: e.rfcProveedor,
            idProveedorEntidad: e.idProveedorEntidad,
            numeroCotizacion: e.numeroCotizacion,
            data: ot,
            columnas,
            toolbar: [
              {
                location: 'after',
                widget: 'dxButton',
                locateInMenu: 'auto',
                options: {
                  text: 'Aprobar',
                  onClick: this.receiveMessage.bind(this, 'aprobar')
                },
                visible: false,
                name: 'simple'
              },
              {
                location: 'after',
                widget: 'dxButton',
                locateInMenu: 'auto',
                options: {
                  text: 'Rechazar',
                  onClick: this.receiveMessage.bind(this, 'rechazar')
                },
                visible: false,
                name: 'simple'
              }
            ],
            exportExcel: { enabled: true, fileName: 'Listado de clientes' },
            columnHiding: { hide: true },
            Checkbox: { checkboxmode: 'multiple' },
            Editing: { allowupdate: false },
            Columnchooser: { columnchooser: true },
            searchPanel: {
              visible: true,
              width: 200,
              placeholder: 'Buscar...',
              filterRow: true
            },
            scroll: { mode: 'standard' }
          });
        }
      });
      cont++;
      if (cont === ar.length) {
        that.idCotizacion = undefined;
        that.cotizacionesTable = newArr;
        that.ban = true;
      }
    });
  }

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'aprobar') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.validaciones(senddata);
      } else if ($event === 'rechazar') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.validaciones(senddata);
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  validaciones(data) {
    const datos = data.data;
    const that = this;
    let aplicaReglaMonto;
    let aplicaReglaCantidad;
    let idCotizacion;
    let rfcProveedor = ``;
    let idProveedorEntidad = ``;
    let xml = `<partidas>`;
    let banderaAprobada = false;
    datos.forEach((e, i, ar) => {
      rfcProveedor = e.rfcProveedor;
      idProveedorEntidad = e.idProveedorEntidad;
      idCotizacion = e.idCotizacion;
      if (data.event === 'aprobar') {
        banderaAprobada = true;
        // tslint:disable-next-line:max-line-length
        xml += `<partida><idObjeto>${e.idObjeto}</idObjeto><idTipoObjeto>${e.idTipoObjeto}</idTipoObjeto><idPartida>${e.idPartida}</idPartida><autorizaRechaza>1</autorizaRechaza><cantidad>${e.cantidad}</cantidad></partida>`;
        aplicaReglaMonto = that.reglas.aplicaReglaMontoSolicitud;
        aplicaReglaCantidad = that.reglas.aplicaReglaCantidadPartida;
      } else if (data.event === 'rechazar') {
        // tslint:disable-next-line:max-line-length
        xml += `<partida><idObjeto>${e.idObjeto}</idObjeto><idTipoObjeto>${e.idTipoObjeto}</idTipoObjeto><idPartida>${e.idPartida}</idPartida><autorizaRechaza>0</autorizaRechaza><cantidad>${e.cantidad}</cantidad></partida>`;
        aplicaReglaMonto = false;
        aplicaReglaCantidad = false;
      }
      if (i + 1 === ar.length) {
        xml += `</partidas>`;
        const send = {
          idSolicitud: that.idSolicitud,
          idTipoSolicitud: that.idTipoSolicitud,
          idClase: that.idClase,
          rfcEmpresa: that.rfcEmpresa,
          idCliente: that.idCliente,
          numeroContrato: that.numeroContrato,
          xmlPartidas: xml,
          idUsuario: that.idUsuario,
          reglaMonstoSolicitudMin: that.reglas.reglaMontoSolicitud.minimo,
          reglaMonstoSolicitudMax: that.reglas.reglaMontoSolicitud.maximo,
          cantidadPartidas: that.reglas.reglaCantidadPartida,
          aplicaReglaMonto,
          aplicaReglaCantidad,
          rfcProveedor,
          idProveedorEntidad,
          idCotizacion
        };
        that.sendApruebaRechaza(send, banderaAprobada);
      }
    });
  }

  sendApruebaRechaza(data, bandera) {
    this.spinner = true;
    this.siscoV3Service.postService('autorizacion/postApruebaRechazaPartida', data).toPromise().then((res: any) => {
      console.log(res);
      this.spinner = false;
      if (res.error) {
        this.snackBar.open(res.error, 'Ok');
      } else if (res.excepcion) {
        this.excepciones(res.excepcion, 3);
      } else {
        if (bandera) {
          this.redirigePosteriorApruebaRechaza(res, data);
        } else {
          this.redirigePosteriorApruebaRechaza(res, data);
        }
      }
    }, (error: any) => {
      this.spinner = false;
      this.excepciones(error, 2);
    }
    );
  }

  private redirigePosteriorApruebaRechaza(res, data) {
    if (res.recordsets[0][0].error) {
      this.snackBar.open(res.recordsets[0][0].error, 'Ok');
    } else {
      if (res.recordsets.length > 0) {
        if (res.recordsets[1][0].cambiaPaso === 1) {
          this.router.navigate(['sel-solicitud']);
        }
      }
      this.tokenForm.reset();
      this.snackBar.open(res.recordsets[0][0].msj, 'Ok', {
        duration: 2000
      });
      this.loadData(this.state, this.solicitudActual);
      if (this.tokens.length > 0) {
        if (this.tokens.find(f => f.idCotizacion === data.idCotizacion)) {
          this.cancelaToken(data.idCotizacion);
        }
      }
    }
  }

  cancelaToken(idCotizacion) {
    const dato = this.tokens.filter(f => f.idCotizacion === idCotizacion);
    const data = {
      idSolicitud: this.idSolicitud,
      idCotizacion,
      token: dato[0].token
    };
    this.siscoV3Service.putService('solicitud/PutTokenCotizacion', data).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
        }
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  sendToken(idCotizacion) {
    this.spinner = true;
    const token = this.tokenForm.controls.token.value;
    this.tokens = [];
    this.idCotizacion = idCotizacion;
    const urlUPT = `solicitud/GetUsuarioPorTokenCotizacion?idSolicitud=${this.idSolicitud}&idCotizacion=${idCotizacion}&token=${token}&idPaso=EnEspera`;
    this.siscoV3Service.getService(urlUPT).toPromise().then((res: any) => {
      if (res.err) {
        this.tokenForm.reset();
        this.snackBar.open(res.error, 'Ok');
        this.spinner = false;
        this.excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.spinner = false;
        this.excepciones(res.excepcion, 3);
      } else {
        this.idUsuarioToken = res.recordsets[0][0].idUsuario;
        this.tokenForm.reset();
        this.tokens.push({ idCotizacion, idUsuarioToken: this.idUsuarioToken, token });
        this.snackBar.open('Token validado.', 'Ok', {
          duration: 2000
        });
        this.loadData(this.state, this.state2.solicitudActual);
      }
    }, (error: any) => {
      this.excepciones(error, 2);
    });
  }


  /**
   * @description Obtenemos la data del componente 'grid-component'
   * @param $event Data del 'grid-component'
   * @returns Data en formato Json
   * @author Gerardo Zamudio González
   */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'sel-centro-costos.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        this.spinner = false;
      });
    } catch (error) {
      this.spinner = false;
      console.error(error);
    }
  }

}
