import { Component, OnInit, ViewChild, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { SiscoV3Service } from '../../services/siscov3.service';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  ICheckbox,
  IColumnHiding,
  IEditing,
  IColumnchooser,
  Template,
  AccionNotificacion,
  GerenciaNotificacion
} from '../../interfaces';

import { DxTreeViewComponent } from 'devextreme-angular';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { AppState, selectContratoState, selectAuthState } from 'src/app/store/app.states';
import { IFileUpload, IObjeto } from 'src/app/interfaces';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BUTTONS_TOOLBAR } from 'src/app/proveedor/enums';
import { environment } from '../../../environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import { IProveedor } from 'src/app/proveedor/interfaces';

@Component({
  selector: 'app-ins-comprobante-recepcion',
  templateUrl: './ins-comprobante-recepcion.component.html',
  styleUrls: [],
  providers: [SiscoV3Service]
})

export class InsComprobanteRecepcionComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-ins-comprobante-recepcion';
  public formValid = true;
  public loading: boolean;
  idClase: string;
  idObjeto: number;
  idTipoObjeto: number;
  rfcEmpresa: string;
  idCliente: number;
  campos: any;
  spinner = false;
  IObjeto: IObjeto[];
  @ViewChild(DxTreeViewComponent) treeView;
  getStateNegocio: Observable<any>;
  getStateUser: Observable<any>;
  breadcrumb: any;
  idUsuario: number;
  modulo: any = {};
  appBannerSpinner: boolean;
  numeroContrato: any;
  solicitudActual: any;
  idSolicitud: any;
  idTipoSolicitud: any;
  proveedores: any;
  fechaCotizacion: any;
  solicitudes: any;
  state: any;
  contratoActual: any;
  objStateNegocio: any;
  idProveedorEntidad: any;
  rfcProveedor: any;
  public datosProveedor: IProveedor;
  public proveedorEntidad = [];
  public datosevent: any;
  columns: IColumns[] = [];
  proveedorEntidadColumns = [];
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[] = [];
  fileServer: string;
  showGridPEntidad: boolean;
  constructor(
    private router: Router, private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog, private snackBar: MatSnackBar, private store: Store<AppState>) {
    super();
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateUser = this.store.select(selectAuthState);
    this.fileServer = environment.fileServerUrl;
  }

  ngOnInit() {
    this.getStateUser.subscribe((stateUser) => {
      if (stateUser && stateUser.seguridad) {
        this.idUsuario = stateUser.seguridad.user.id;
        this.objStateNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
          if (stateNegocio && stateNegocio.claseActual) {
            if (this.solicitudActual !== stateNegocio.solicitudActual) {
              if (stateNegocio.solicitudesSeleccionadas) {
                this.idClase = stateNegocio.claseActual;
                this.solicitudes = stateNegocio.solicitudesSeleccionadas;
                this.state = stateUser;
                this.contratoActual = stateNegocio.contratoActual;
                this.loadData(this.state, stateNegocio.solicitudActual);
              } else {
                this.router.navigate(['home']);
              }
            }
          }
        });
      }
    });
  }

  loadData(state, solicitudActual) {
    try {
      this.solicitudActual = solicitudActual;
      this.idSolicitud = this.solicitudActual.idSolicitud;
      this.rfcEmpresa = this.solicitudActual.rfcEmpresa;
      this.idCliente = this.solicitudActual.idCliente;
      this.numeroContrato = this.solicitudActual.numeroContrato;
      this.idObjeto = this.solicitudActual.idObjeto;
      this.idTipoObjeto = this.solicitudActual.idTipoObjeto;
      this.idTipoSolicitud = this.solicitudActual.idTipoSolicitud;
      this.appBannerSpinner = false;

      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
      this.ConfigToolbar();
      if (this.modulo.breadcrumb) {
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idObjeto: this.idObjeto }]);
      }
      this.IObjeto = [
        {
          idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente,
          numeroContrato: this.numeroContrato, rfcEmpresa: this.rfcEmpresa, idTipoObjeto: this.idTipoObjeto
        }];
      this.GetPropiedadesAlComprobanteRecepcion();
      this.GetColumns();
      //this.GetProveedoresEntidadPorSolicitud();

    } catch (error) {
      this.spinner = false;
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description  Agrega las columnas estaticas al data grid de proveedorEntidad.
   * @author Andres Farias
   */
  AgregarColumnasEstaticas() {
    this.columns = [];
    this.columns.push({ caption: 'Nombre comercial', dataField: 'nombreComercial' });
    this.columns.push({ caption: 'Contacto', dataField: 'personaContacto' });
    this.columns.push({ caption: 'Teléfono', dataField: 'telefono' });
  }

  // #region GetColumns
  /**
   * @description  Obtiene del servidor las columnas dinamicas de proveedorEntidad.
   * @param proveedor RFC del proveedor.
   * @author Andres Farias
   */
  GetColumns() {
    this.loading = true;
    this.showGridPEntidad = false;
    this.AgregarColumnasEstaticas();
    this.siscoV3Service.getService('proveedor/GetProveedorEntidadColumns')
      .subscribe((res2: any) => {
        this.loading = false;
        this.proveedorEntidadColumns = res2.recordsets[0];
        if (this.proveedorEntidadColumns.length > 0) {
          // tslint:disable-next-line: forin
          for (const data in this.proveedorEntidadColumns[0]) {
            let tipoDato = '';
            if (this.proveedorEntidadColumns[0][data] === 'File' || this.proveedorEntidadColumns[0][data] === 'Image') {
              tipoDato = 'foto';
            }
            this.columns.push({ caption: data.charAt(0).toUpperCase() + data.slice(1), dataField: data, cellTemplate: tipoDato });
          }
        }

        // Cambiar de posición en columnas el IdProveedorEntidad y cambiarle el titulo.
        const findColumn = this.columns.find((colum: IColumns, index) => {
          return colum.caption === 'IdProveedorEntidad';
        });
        const indexFoundColumn = this.columns.findIndex((colum: IColumns, index) => {

          return colum.caption === 'IdProveedorEntidad';
        });

        findColumn.caption = 'Id';
        this.columns.splice(indexFoundColumn, 1);
        this.columns.unshift(findColumn);

        // Agregar columnas de direccion
        this.columns.push({
          caption: 'Estado',
          dataField: 'estado'
        });
        this.columns.push({
          caption: 'Municipio',
          dataField: 'municipio'
        });
        this.columns.push({
          caption: 'Código postal',
          dataField: 'codigoPostal'
        });
        this.columns.push({
          caption: 'Asentamiento',
          dataField: 'asentamiento'
        });
        this.columns.push({
          caption: 'Vialidad',
          dataField: 'vialidad'
        });
        this.columns.push({
          caption: '# Exterior',
          dataField: 'numeroExterior'
        });
        this.columns.push({
          caption: '# Interior',
          dataField: 'numeroInterior'
        });

        //this.GetProveedorEntidad(this.rfcProveedor);
        this.GetProveedoresEntidadPorSolicitud();

      }, err => {
        this.loading = false;
        this.Excepciones(err, 2);
      });
  }
  /**
   * @description  Obtiene del servidor los datos de los talleres que tiene el proveedor asociado a la solicitud
   * @returns Devuelve las talleres que tiene el proveedor asociado a la solicitud
   * @author Jose Luis Lozada
   */
  GetProveedoresEntidadPorSolicitud() {
    this.loading = true;
    this.siscoV3Service.getService(`solicitud/GetProveedoresEntidadPorSolicitud?idSolicitud=${this.idSolicitud}&idTipoSolicitud=${this.idTipoSolicitud}&idClase=${this.idClase}&rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}`).subscribe((res: any) => {

      this.loading = false;
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.proveedorEntidad = res.recordsets[0] ? res.recordsets[0] : [];
      }

    }, err => {
      this.Excepciones(err, 2);
    });
  }

  /**
   * @description  Funcíon para visualizar sus propiedades
   * @returns Devuelve las propiedades dependiendo el id de clase
   * @author Jose Luis Lozada
   */
  GetPropiedadesAlComprobanteRecepcion() {
    this.siscoV3Service.getService(`solicitud/GetPropiedadesAllComprobanteRecepcion?idClase=${this.idClase}&idObjeto=${this.idObjeto}`).subscribe(
      (res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.GetPropiedades(res.recordsets[0]);

          for (let i = 0; i < this.tipoObjetoPropiedades.length; i++) {
            if (this.tipoObjetoPropiedades[i].idTipoValor === 'Unico') {
              if (this.tipoObjetoPropiedades[i].idTipoDato === 'Bit') {
                this.tipoObjetoPropiedades[i].valorPropiedad = [];
                this.tipoObjetoPropiedades[i].valorPropiedad.push(false);
              }
              if (this.tipoObjetoPropiedades[i].valor === 'Kilometraje GPS') {
                this.tipoObjetoPropiedades[i].valorSelected = res.recordsets[1][0].kmGps;
                this.tipoObjetoPropiedades[i].valorPropiedad = [];
                this.tipoObjetoPropiedades[i].valorPropiedad.push(res.recordsets[1][0].kmGps);
              }
            }
          }
          this.ValidForm();
        }
      }, (error: any) => {
      }
    );
  }

  /**
   * @description  Funcíon para guardar un comprobante de recepcion
   * @author Jose Luis Lozada Guerrero
   */
  GuardaDatosComprobanteRecepcion() {
    this.ValuesFormIns();
    if (this.formDinamico.length > 0) {
      this.spinner = true;
      const dataComprobante = {
        idSolicitud: this.idSolicitud,
        idTipoSolicitud: this.idTipoSolicitud,
        idClase: this.idClase,
        rfcEmpresa: this.rfcEmpresa,
        idCliente: this.idCliente,
        numeroContrato: this.numeroContrato,
        idObjeto: this.idObjeto,
        idTipoObjeto: this.idTipoObjeto,
        idProveedorEntidad: this.idProveedorEntidad,
        rfcProveedor: this.rfcProveedor,
        formDinamico: this.formDinamico
      };
      this.siscoV3Service.postService('solicitud/PostInsComprobanteRecepcion', dataComprobante).toPromise().then(async (res: any) => {
        const paramsAvanzaOrden = {
          idSolicitud: this.idSolicitud,
          idTipoSolicitud: this.idTipoSolicitud,
          idClase: this.idClase,
          rfcEmpresa: this.rfcEmpresa,
          idCliente: this.idCliente,
          numeroContrato: this.numeroContrato
        };
        if (res.recordsets && res.recordsets[0] && res.recordsets[0][0]) {
          await this.siscoV3Service.putService('solicitud/PutAvanzaOrden', paramsAvanzaOrden).toPromise().then(async () => {
            if (res.err) {
              this.Excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.Excepciones(res.excepcion, 3);
            } else {
              const llave = paramsAvanzaOrden;
              const notificacion = {
                accion: AccionNotificacion.INSERCION,
                modulo: this.modulo.id,
                gerencia: GerenciaNotificacion.COBRANZA,
                llave
              };
              console.log(this.modulo);
              await this.siscoV3Service.postService('notificacion/EnviaNotificacion', notificacion).toPromise().then(async (res: any) => { console.log(res) }).catch(async (err: any) => { console.log(err) });
              this.snackBar.open('Se ha guardado correctamente el comprobante de recepción.', 'Ok', {
                duration: 2000
              });

            }
          }, async(err: any) => {
            this.spinner = false;
            this.Excepciones(err, 2);
          });
        }
        this.spinner = false;
        this.router.navigateByUrl('/sel-solicitud');
      }, async (error: any) => {
        this.Excepciones(error, 2);
        this.spinner = false;
      });
    } else {
      this.snackBar.open('Los campos con * son obligatorios.', 'Ok', {
        duration: 2000
      });
    }
  }

  /* Begin Region Grid*/
  /**
   * @description Funcíones necesarias para implementacion de grid
   * @author Jose Luis Lozada Guerrero
   */
  ToolbarButtonEvent($event) {
    switch ($event) {
      case BUTTONS_TOOLBAR.SELECCION_DE_TALLER:
        this.appBannerSpinner = true;
        this.rfcProveedor = this.datosevent[0].rfcProveedor;
        this.idProveedorEntidad = this.datosevent[0].idProveedorEntidad;

        this.appBannerSpinner = false;
        break;
    }
  }

  DatosMessage($event) {
    this.datosevent = $event.data;
  }

  ConfigToolbar() {

    // ******************PARAMETROS DE PAGINACION DE GRID**************** */
    const pageSizes = ['10', '25', '50', '100'];

    this.gridOptions = { paginacion: 10, pageSize: pageSizes };

    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'Proveedor Sucursal' };
    // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
    this.columnHiding = { hide: true };
    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'single' };  // *desactivar con none*/
    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/
    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };

    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };

    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };
    this.toolbar = [];
    this.toolbar.push({
      location: 'after',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        width: 90,
        text: BUTTONS_TOOLBAR.SELECCION_DE_TALLER,
        onClick: this.ToolbarButtonEvent.bind(this, BUTTONS_TOOLBAR.SELECCION_DE_TALLER)
      },
      visible: false,
      name: 'simple',
      name2: 'multiple'
    });
  }
  /* End Region Grid*/

  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'add-cliente.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
      });

    } catch (err) {
    }
  }
}

