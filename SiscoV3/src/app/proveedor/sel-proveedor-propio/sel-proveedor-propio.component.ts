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
  IColumnchooser
} from '../../interfaces';
import { BUTTONS_TOOLBAR } from '../enums';
import { MatDialog } from '@angular/material';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { IProveedor } from '../interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { Negocio } from 'src/app/models/negocio.model';

@Component({
  selector: 'app-sel-proveedor-propio',
  templateUrl: './sel-proveedor-propio.component.html'
})
export class SelProveedorPropioComponent implements OnInit, OnDestroy {
  private datosevent: any[];
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[];
  exportExcel: IExportExcel;
  public searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[] = [];
  public proveedores: IProveedor[];
  public loading: boolean;
  breadcrumb: any[];
  idUsuario: any;
  contratos: any = [];
  contratoSeleccionado: any;

  // Variables para Redux
  private getStateNegocio: Observable<any>;
  private getStateAuth: Observable<any>;
  getState: Observable<any>;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-proveedor-propio';
  idClase = '';
  modulo: any = {};
  subsNegocio: any;

  constructor(private router: Router, public dialog: MatDialog,
              private siscoV3Service: SiscoV3Service,
              private store: Store<AppState>) {

    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAuth = this.store.select(selectAuthState);
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  ngOnInit() {
    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.idClase = stateNegocio.claseActual;
      this.getStateAuth.subscribe((stateAutenticacion) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.contratoSeleccionado = stateNegocio.contratoActual;

        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

        if (this.contratoSeleccionado) {
          this.GetProveedores();
        }

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }
        this.ConfigParamsDataGrid();

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (this.modulo.contratoObligatorio) {
          if (stateNegocio.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }
      });
    });
  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.sinMantenimiento, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  /**
   * @description Obtener la lista de proveedores por media de la clase.
   * @author Andres Farias
   */
  GetProveedores() {
    this.loading = true;
    this.siscoV3Service.getService('proveedor/GetProveedores?idClase='
      + this.idClase + '&incluyeMantenimiento=0&numeroContrato=' + this.contratoSeleccionado.numeroContrato)
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.proveedores = res.recordsets[0];
          }
        }, (error: any) => {
          this.loading = false;
          this.Excepciones(error, 2);
        }
      );
  }


  // #region EventButtonDataGrid
  /**
   * @description CRUD del datagrid de proveedor.
   * @param $event Evento que se ejecuta de los botones del data grid.
   * @author Andres Farias
   */
  EventButtonDataGrid($event: string) {
    switch ($event) {
      case BUTTONS_TOOLBAR.AGREGAR:
        if (this.contratoSeleccionado) {
          this.router.navigateByUrl('/ins-proveedor-propio');
        } else {
        }
        break;
      case BUTTONS_TOOLBAR.EDITAR:
        const rfc = this.datosevent[0].rfcProveedor;
        this.router.navigateByUrl('/upd-proveedor-propio/' + rfc);
        break;
      case BUTTONS_TOOLBAR.ELIMINAR:
        try {
          let borrar = '<Ids>';
          this.datosevent.forEach( (element) => {
            borrar += '<rfcProveedor>' + element.rfcProveedor + '</rfcProveedor>';
          });
          borrar += '</Ids>';
          this.DeleteData('proveedor/DelProveedor', 'data=' + borrar);
        } catch (error) {
          this.Excepciones(error, 1);
        }

        break;
      case BUTTONS_TOOLBAR.AGREGAR_ENTIDAD:
        this.router.navigateByUrl('/ins-proveedor-propio-entidad/' + this.datosevent[0].rfcProveedor);
        break;
    }
  }
  // #endregion

  /*
  Abre el dialog delete-alert
  */
  DeleteData(ruta: any, data) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '60%',
        data: {
          ruta,
          data
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.GetProveedores();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description Configuracion del data grid de proveedores.
   * @author Andres Farias
   */
  ConfigParamsDataGrid() {
    this.columns = [
      {
        caption: 'RFC',
        dataField: 'rfcProveedor',
        width: 150
      },
      {
        caption: 'Foto',
        dataField: 'logo',
        cellTemplate: 'foto'
      },
      {
        caption: 'Razón social',
        dataField: 'nombreComercial'
      },
      {
        caption: 'Contacto',
        dataField: 'personaContacto'
      },
      {
        caption: 'Teléfono',
        dataField: 'telefono'
      },
      {
        caption: '# Sucursales',
        dataField: 'numeroEntidades'
      },
      {
        caption: 'Contrato',
        dataField: 'nombreContrato'
      }
    ];

    // ******************PARAMETROS DE PAGINACION DE GRID**************** */
    const pageSizes = ['100', '300', '500', '1000'];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };

    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'partidas' };

    // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
    this.columnHiding = { hide: true };

    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/

    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/

    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };


    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };

    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };

    // ******************PARAMETROS DE TOOLBAR**************** */
    /**
     * Validaciones de permisos de seguridad
     */
    this.agregarBotonesSeguridad();

    this.toolbar.push({
      location: 'after',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        width: 180,
        text: BUTTONS_TOOLBAR.AGREGAR_ENTIDAD,
        onClick: this.EventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.AGREGAR_ENTIDAD)
      }, visible: false,
      name: 'simple'
    });
  }

  /**
   * @description Se agregan los botones con los permisos de seguridad
   * @author Andres Farias
   */
  agregarBotonesSeguridad() {
    if (this.modulo.camposClase.find(x => x.nombre === 'Agregar')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.AGREGAR,
          onClick: this.EventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.AGREGAR)
        },
        visible: true
      });
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'Editar')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.EDITAR,
          onClick: this.EventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.EDITAR)
        }, visible: false,
        name: 'simple',
        name2: 'multiple'
      });
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.ELIMINAR,
          onClick: this.EventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.ELIMINAR)
        }, visible: false,
        name: 'simple'
      });
    }

  }

  // evento que regresa las filas seleccionadas del datagrid
  DatosMessage($event: any) {
    this.datosevent = $event.data;
  }

  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'sel-proveedor.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
