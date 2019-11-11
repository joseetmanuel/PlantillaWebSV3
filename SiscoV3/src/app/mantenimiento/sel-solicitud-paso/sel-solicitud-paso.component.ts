import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
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
  TiposdeFormato,
  IDetail
} from '../../interfaces';
import { ClientesComponent } from 'src/app/clientes/sel-clientes/sel-clientes.component';

@Component({
  selector: 'app-sel-solicitud-paso',
  templateUrl: './sel-solicitud-paso.component.html',
  styleUrls: ['./sel-solicitud-paso.component.scss'],
  providers: [SiscoV3Service]
})
export class SelSolicitudPasoComponent implements OnInit {


  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-solicitud-paso';
  idClase: string;
  modulo: any = {};
  datosevent;
  evento: string;
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  breadcrumb: any[];
  spinner = true;
  estados: any;
  numeroContrato: string;
  idUsuario: number;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[];
  subsNegocio: Subscription;
  idPaso: string;
  idZona: number;
  solicitudes = [];
  _contratosSeleccionados = [];
  _contratosPorClase = [];
  contratosSeleccionados = '';
  switchCosto = false;
  switchVenta = false;
  estatus: string;
  color: string;
  switch = '0';
  idTipoObjeto: any;
  idObjeto: any;
  idFase: any;
  token: any;


  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: Store<AppState>) {

    this.activatedRoute.params.subscribe(parametros => {
      const datos = JSON.parse(atob(parametros.token));
      this.token = parametros.token
      this.idPaso = datos.filtros.idPaso;
      this.idZona = datos.filtros.idZona;
      this.idTipoObjeto = datos.filtros.idTipoObjeto;
      this.idObjeto = datos.filtros.idObjeto;
      this.idFase = datos.filtros.idFase;
      this.estatus = datos.titulo;
      this.color = datos.color

    });

    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {

        if (
          (
            this._contratosPorClase.length !== stateNegocio.contratosPorClase.length &&
            this._contratosPorClase.every((v, i) => {
              return v !== stateNegocio[i];
            })
          )
          ||
          (
            this._contratosSeleccionados.length !== stateNegocio.contratosSeleccionados.length &&
            this._contratosSeleccionados.every((v, i) => {
              return v !== stateNegocio[i];
            })
          )

        ) {

          this._contratosPorClase = stateNegocio.contratosPorClase;
          this._contratosSeleccionados = stateNegocio.contratosSeleccionados;

          this.previewLoadData(stateAutenticacion.seguridad.user.id, stateNegocio.claseActual,
            stateAutenticacion.seguridad.permissions.modules, stateNegocio.contratoActual, this._contratosSeleccionados,
            this._contratosPorClase);
          this.Grid();
          this.LoadData();

        }
      });
    });
  }

  previewLoadData(idUser, claseActual, modulos, contratoActual, contratosSeleccionados, contratosPorClase) {
    this.idUsuario = idUser;
    this.idClase = claseActual;
    this.modulo = Negocio.GetModulo(this.claveModulo, modulos, this.idClase);

    if (this.modulo.breadcrumb) {
      this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ token: this.token }]);
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'switchCosto')) {
      this.switchCosto = true;
      this.switch = '1';
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'switchVenta')) {
      this.switchVenta = true;
      if(this.switch == '0'){
        this.switch = '2';
      }
    }


    if (!contratoActual && this.modulo.contratoObligatorio) {
      this.ConfigurarFooter(true);
    } else {
      this.ConfigurarFooter(false);
    }

    const contratos = [];

    if (contratosSeleccionados.length > 0) {
      contratosSeleccionados.forEach(element => {
        contratos.push({
          numeroContrato: element.numeroContrato, idCliente: element.idCliente
          , rfcEmpresa: element.rfcEmpresa
        });

      });

    } else {
      contratosPorClase.forEach(element => {
        contratos.push({
          numeroContrato: element.numeroContrato, idCliente: element.idCliente
          , rfcEmpresa: element.rfcEmpresa
        });

      });
    }
    this.contratosSeleccionados = '<contratos>';
    let cont = 0;
    const self = this;
    if (contratos.length > 0) {
      // tslint:disable-next-line: only-arrow-functions
      contratos.forEach(function (element, index, array) {
        self.contratosSeleccionados += '<contrato><numeroContrato>' + element.numeroContrato + '</numeroContrato>';
        self.contratosSeleccionados += '<idCliente>' + element.idCliente + '</idCliente>';
        self.contratosSeleccionados += '<rfcEmpresa>' + element.rfcEmpresa + '</rfcEmpresa></contrato>';
        cont++;
        if (cont === array.length) {
          self.contratosSeleccionados += '</contratos>';
        }
      });
    }
  }

  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, false)));
  }

  Grid() {
    this.fnWorkshopType(this.switch);


    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'pasos' };
    // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
    this.columnHiding = { hide: true };
    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false, mode: 'cell' }; // *cambiar a batch para editar varias celdas a la vez*/
    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };
    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };

    // ******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [];

    if (this.idPaso == 'ProvisionAprobada') {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 120,
          text: 'Prefactura',
          onClick: this.EventButtonDataGrid.bind(this, 'Prefactura')
        },
        visible: true
      });
    }


    this.toolbar.push(
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: 'Ver',
          onClick: this.EventButtonDataGrid.bind(this, 'ver')
        }, visible: false,
        name: 'simple'
      });

    if (this.idPaso === 'Provisionada') {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 160,
            text: 'Aprobar Provisión',
            onClick: this.EventButtonDataGrid.bind(this, 'AprobarProvision')
          }, visible: false,
          name: 'simple'
        });
    }

  }


  datosMessage($event) {
    this.datosevent = $event.data;
  }

  EventButtonDataGrid($event: string) {
    if ($event === 'ver') {
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

    } else if ($event === 'AprobarProvision') {
      this.apruebaProvision();
    } else if ($event === 'Prefactura') {
      this.router.navigateByUrl('ins-solicitud-prefactura');
    }


  }

  apruebaProvision() {
    this.spinner = true;

    let solicitudes = '<solicitudes>';
    this.datosevent.forEach((e, i, ar) => {
      solicitudes += '<solicitud><idSolicitud>' + e.idSolicitud + '</idSolicitud><idTipoSolicitud>' + e.idTipoSolicitud +
        '</idTipoSolicitud><rfcEmpresa>' + e.rfcEmpresa + '</rfcEmpresa><idCliente>' + e.idCliente + '</idCliente><numeroContrato>' +
        e.numeroContrato + '</numeroContrato><idClase>' + this.idClase + '</idClase></solicitud>'

      if (i + 1 === ar.length) {
        solicitudes += '</solicitudes>';
      }

    });

    this.siscoV3Service.putService('solicitud/PutUpdFacturaApruebaProvision', { solicitudes: solicitudes }).subscribe((res: any) => {
      if (res.err) {
        this.spinner = false;
        this.Excepciones(res.err, 4);
      } else if (res.excecion) {
        this.Excepciones(res.err, 3);
      } else {
        this.spinner = false;
        this.snackBar.open('Se han aprobado las provisiones correctamente.', 'Ok', {
          duration: 2000
        });
        this.LoadData();
      }
    }, (error: any) => {
      this.spinner = false;
      this.Excepciones(error, 2);
    });
  }

  fnWorkshopType(band) {
    this.columns = [];

    this.columns.push(
      {
        caption: 'Cliente',
        dataField: 'cliente'
      },
      {
        caption: 'Consecutivo',
        dataField: 'idSolicitud'
      },
      {
        caption: 'Número de la orden',
        dataField: 'numero'
      },
      {
        caption: 'Número económico',
        dataField: 'numeroEconomico'
      },
      {
        caption: 'Zona',
        dataField: 'zonaNombre'
      },
      {
        caption: 'Tipo de servicio',
        dataField: 'tipoSolicitud'
      },
      {
        caption: 'Tipo de solicitud',
        dataField: 'tipoSolPartida'
      },
      {
        caption: 'Comentarios adicionales',
        dataField: 'comentarios'
      },
      {
        caption: 'Estatus',
        dataField: 'pasoNombre'
      })

    if (band == '1') {
      this.columns.push({
        caption: 'Costo',
        dataField: 'costo',
        format: TiposdeFormato.moneda
      })
    } else {
      this.columns.push(
        {
          caption: 'Venta',
          dataField: 'venta',
          format: TiposdeFormato.moneda
        }
      )
    }

    this.columns.push(
      {
        caption: 'Taller',
        dataField: 'taller'
      },
      {
        caption: 'Fecha creación',
        dataField: 'fechaCita',
        dataType: TiposdeDato.datetime
      },
      {
        caption: 'Estatus provision',
        dataField: 'estatusProvision'
      },
      {
        caption: 'Agendó',
        dataField: 'agendo'
      },
      {
        caption: 'Tiempo transcurrido',
        dataField: 'tiempoA'
      }
    )
  }



  LoadData() {
    try {
      this.siscoV3Service.getService(`solicitud/GetSolicitudPaso?idFase=${this.idFase}&&idPaso=${this.idPaso}&&idClase=${this.idClase}&&contratos=${this.contratosSeleccionados}&&idZona=${this.idZona}&&idObjeto=${this.idObjeto}&&idTipoObjeto=${this.idTipoObjeto}`)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.solicitudes = res.recordsets[0];
            this.spinner = false;
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 11,
          moduloExcepcion: 'zonas.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
