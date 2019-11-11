import { Component, OnInit, OnDestroy } from '@angular/core';
import {
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
  TiposdeFormato

} from '../../../interfaces';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExcepcionComponent } from '../../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../models/negocio.model';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { Subscription } from 'rxjs';
import { DeleteAlertComponent } from '../../../utilerias/delete-alert/delete-alert.component';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-upd-centro-costo',
  templateUrl: './upd-centro-costo.component.html',
  styleUrls: ['./upd-centro-costo.component.scss']
})
export class UpdCentroCostoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  modulo;
  claveModulo = 'app-upd-centro-costo';
  breadcrumb: any[];
  state;
  numero = 0;

  idCliente;
  rfcEmpresa;
  numeroContrato;
  idCentroCosto;
  subsNegocio: Subscription;
  centroCostoFolio: any;

  validaFecha = false;
  datosevent;

  gridOptions: IGridOptions;
  columns: IColumns[];
  columnsCCFolio: IColumns[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  solicitudes = [];
  toolbar: Toolbar[] = [];
  toolbarCCFolio: Toolbar[] = [];
  band = false;
  presupuestoFormatted;


  centroCostoForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    presupuesto: new FormControl('', [Validators.required]),
  });


  centroCostoFoliosForm = new FormGroup({
    folio: new FormControl('', [Validators.required]),
    presupuesto: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl('', [Validators.required]),
    fechaFin: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private currencyPipe: CurrencyPipe,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.state = state;
            this.idClase = state2.claseActual;
            this.getParamsValue(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  getParamsValue(state) {
    this.activatedRoute.params.subscribe(parametros => {
      // this.numero = 0;
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.idCentroCosto = parametros.idCentroCosto;
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }, { idCentroCosto: this.idCentroCosto }]);
      }
      this.table();
      this.getCentroCosto();
      this.getSolicitudes();

    });
  }

  getCentroCosto() {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/getCentroCostoPorId?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idCentroCosto=${this.idCentroCosto}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          const centroCosto = res.recordsets[0][0];
          if (res.recordsets.length > 0) {
            this.centroCostoFolio = res.recordsets[1];
          } else {
            this.centroCostoFolio = [];
          }
          this.fillData(centroCosto);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  fillData(centroCosto) {
    this.centroCostoForm.controls.nombre.setValue(centroCosto.nombre);
    this.centroCostoForm.controls.presupuesto.setValue(centroCosto.presupuesto);
  }

  getSolicitudes() {
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/getSolicitudCentroCosto?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idCentroCosto=${this.idCentroCosto}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.solicitudes = res.recordsets[0];
          this.numero = 1;
          this.band = true;
        }
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  updCentroCosto() {
    this.numero = 0;

    const data = {
      rfcEmpresa: this.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato,
      idCentroCosto: this.idCentroCosto,
      nombre: this.centroCostoForm.controls.nombre.value,
      presupuesto: this.centroCostoForm.controls.presupuesto.value
    };
    this.updateData(`contrato/putActualizaCentroCosto`, data);
  }

  InsCentroCostoFolio() {
    this.numero = 0;
    let fechaIn;
    let fechaTer;

    if (this.centroCostoFoliosForm.controls.fechaInicio.value) {
      fechaIn = moment(this.centroCostoFoliosForm.controls.fechaInicio.value).format(
        'YYYY-MM-DD'
      );
    } else {
      fechaIn = null;
    }
    if (this.centroCostoFoliosForm.controls.fechaFin.value) {
      fechaTer = moment(this.centroCostoFoliosForm.controls.fechaFin.value).format(
        'YYYY-MM-DD'
      );
    } else {
      fechaTer = null;
    }
    if (fechaIn > fechaTer) {
      this.numero = 1;
      this.validaFecha = true;
    } else {
      this.validaFecha = false;

      const data = {
        rfcEmpresa: this.rfcEmpresa,
        idCliente: this.idCliente,
        numeroContrato: this.numeroContrato,
        idCentroCosto: this.idCentroCosto,
        folio: this.centroCostoFoliosForm.controls.folio.value,
        presupuesto: this.centroCostoFoliosForm.controls.presupuesto.value,
        fechaInicio: fechaIn,
        fechaFin: fechaTer
      };

      this.siscoV3Service.postService(`contrato/PostInsCentroCostoFolio`, data).subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.error) {
            // this.excepciones(res.error, 4);
            this.snackBar.open(res.error, 'Ok');
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open('Folio guardado exitosamente.', 'Ok', {
              duration: 2000
            });
            this.centroCostoFoliosForm.reset();
            this.getCentroCosto();
          }
        }, (error: any) => {
          this.excepciones(error, 2);
        }
      );


    }

  }


  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessage($event) {
    if ($event === 'delete') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.Delete(senddata);
    } else if ($event === 'ver') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.Ver(senddata);
    }
  }

  Ver(data) {
    const solicitudes = [];
    this.datosevent.forEach((so: any) => {
      solicitudes.push({
        idSolicitud: so.idSolicitud,
        numeroOrden: so.numero,
        idLogoContrato: so.idLogoContrato,
        rfcEmpresa: so.rfcEmpresa,
        idCliente: so.idCliente,
        numeroContrato: so.numeroContrato,
        idObjeto: so.idObjeto,
        idTipoObjeto: so.idTipoObjeto,
        idTipoSolicitud: so.idTipoSolicitud
      });
    });

    this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: solicitudes }));
    this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: solicitudes[0] }));
    this.router.navigateByUrl('/sel-solicitud');


  }

  transformAmount() {
    this.presupuestoFormatted = this.currencyPipe.transform(this.centroCostoForm.controls.presupuesto.value, 'USD');
  }

  transformAmountClean() {
    this.presupuestoFormatted = this.centroCostoForm.controls.presupuesto.value;
  }


  Delete(data) {
    try {
      let borrar = '';
      let cont = 0;
      const that = this;
      data.data.forEach((element, index, array) => {
        // tslint:disable-next-line:max-line-length
        borrar += `<Ids><idCliente>${element.idCliente}</idCliente><numeroContrato>${element.numeroContrato}</numeroContrato><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa><idCentroCosto>${element.idCentroCosto}</idCentroCosto><folio>${element.folio}</folio></Ids>`;
        cont++;
        if (cont === array.length) {
          that.deleteData('contrato/DelCentroCostoFolio', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  deleteData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.getCentroCosto();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Obtenemos la data del componente 'grid-component'
   * @param $event Data del 'grid-component'
   * @returns Data en formato Json
   * @author Gerardo Zamudio González
   */
  datosMessage($event) {
    this.datosevent = $event.data;
  }

  table() {
    /*
    Columnas de la tabla
    */
    try {
      this.columnsCCFolio = [];
      this.columns = [
        {
          caption: 'Id solicitud',
          dataField: 'idSolicitud'
        },
        {
          caption: 'Tipo solicitud',
          dataField: 'idTipoSolicitud'
        },
        {
          caption: 'fechaCreacion',
          dataField: 'fechaCreacion',
          dataType: TiposdeDato.datetime,
          format: TiposdeFormato.dmy
        },
        {
          caption: 'Número',
          dataField: 'numero'
        },
        {
          caption: 'Comentarios',
          dataField: 'comentarios'
        }
      ];

      this.columnsCCFolio = [
        {
          caption: 'Id centro de costo',
          dataField: 'idCentroCosto'
        },
        {
          caption: 'Folio',
          dataField: 'folio'
        },
        {
          caption: 'Presupuesto',
          dataField: 'presupuesto',
          format: TiposdeFormato.moneda
        },
        {
          caption: 'Fecha inicio',
          dataField: 'fechaInicio',
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Fecha fin',
          dataField: 'fechaFin',
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Estatus',
          dataField: 'idEstatusCentroCostoFolio'
        }
      ];

      this.toolbar = [];
      this.toolbarCCFolio = [];


      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Ver',
            onClick: this.receiveMessage.bind(this, 'ver')
          }, visible: false,
          name: 'simple'
        });


      if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar')) {
        this.toolbarCCFolio.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              width: 90,
              text: 'Eliminar',
              onClick: this.receiveMessage.bind(this, 'delete')
            }, visible: false,
            name: 'simple',
            name2: 'multiple'
          });
      }

      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Lista de solicitudes' };
      // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
      this.columnHiding = { hide: true };
      // ******************PARAMETROS DE PARA CHECKBOX**************** */
      this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
      // ******************PARAMETROS DE PARA EDITAR GRID**************** */
      this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/
      // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
      this.Columnchooser = { columnchooser: true };

      /*
  Parametros de Search
  */
      this.searchPanel = {
        visible: true,
        width: 200,
        placeholder: 'Buscar...',
        filterRow: true
      };

      /*
  Parametros de Scroll
  */
      this.scroll = { mode: 'standard' };
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog update-alert
   * @param url La Url para editar un documento
   * @param datos Los datos que se van a editar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
  updateData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(UpdateAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        this.numero = 1;
        if (result === 1) {
          this.ngOnInit();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
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
          moduloExcepcion: 'upd-centro-costo.component',
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
