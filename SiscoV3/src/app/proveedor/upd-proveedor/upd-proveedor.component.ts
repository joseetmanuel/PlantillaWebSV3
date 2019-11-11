import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  Template
} from '../../interfaces';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IProveedor } from '../interfaces';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { selectAuthState, AppState, selectContratoState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { BUTTONS_TOOLBAR } from '../enums';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from 'src/app/models/negocio.model';

@Component({
  selector: 'app-upd-proveedor',
  templateUrl: './upd-proveedor.component.html',
  providers: [SiscoV3Service]
})

export class UpdProveedorComponent implements OnInit, OnDestroy {

  gridOptions: IGridOptions;
  columns: IColumns[] = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  proveedorEntidadColumns = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[] = [];
  public loading: boolean;
  panelOpenState = false;
  proveedorForm = new FormGroup({
    nombre: new FormControl('', [Validators.required])
  });

  public rfcProveedor: string;
  public proveedorEntidad;
  public datosevent: any;
  public tituloDireccion = 'Dirección fiscal';
  public datosProveedor: IProveedor;
  breadcrumb: any[];
  idUsuario: any;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-proveedor';
  idClase = '';
  modulo: any = {};

  // Variables para Redux
  private getStateNegocio: Observable<any>;
  private getStateAuth: Observable<any>;
  getState: Observable<any>;
  subsNegocio: any;
  showGridPEntidad: boolean;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>) {

    this.getStateAuth = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  // #region GetProveedor

  /**
   * @description  Obtiene del servidor los datos del proveedor a editar.
   * @author Andres Farias
   */
  GetProveedor(rfcProveedor: any) {
    this.siscoV3Service.getService('proveedor/GetProveedorByRFC?rfcProveedor=' + rfcProveedor).subscribe((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.datosProveedor = res.recordsets[0][0];
      }

    }, err => {
      this.Excepciones(err, 2);
    });
  }
  // #endregion

  // #region ModificarProveedor
  /**
   * @description  Funcion para modificar un proveedor.
   * @author Andres Farias
   */
  ModificarProveedor($event) {
    if ($event.data) {
      this.loading = true;
      const proveedor: IProveedor = $event.data;
      this.siscoV3Service.putService('proveedor/PutActualizaProveedor', proveedor).subscribe(rs => {
        this.loading = false;
        this.snackBar.open('Se a actualizado el proveedor.', 'Ok', {
          duration: 2000
        });
      }, err => {
        this.loading = false;
        this.Excepciones(err, 2);
      });
    }
  }
  // #endregion

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(parametros => {
      this.rfcProveedor = parametros.rfcProveedor;

      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.getStateAuth.subscribe((stateAutenticacion) => {
          this.idUsuario = stateAutenticacion.seguridad.user.id;
          this.idClase = stateNegocio.claseActual;

          this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

          if (this.modulo.contratoObligatorio) {
            if (stateNegocio.contratoActual) {
              this.ConfigurarFooter(false);
            } else {
              this.ConfigurarFooter(true);
            }
          } else {
            this.ConfigurarFooter(false);
          }

          this.ConfigToolbar();
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(
            this.modulo.breadcrumb, this.idClase, [{ rfcProveedor: this.rfcProveedor, contrato: parametros.contrato }]);

        });
      });
      this.GetColumns();
      this.GetProveedor(this.rfcProveedor);
    });

  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, define si el footer se abre o no por defecto.
   * @author Andres Farias
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  /**
   * @description Configurar el tooblar para el card de proveedor entidad.
   * @author Andres Farias
   */
  ConfigToolbar() {

    // ******************PARAMETROS DE PAGINACION DE GRID**************** */
    const pageSizes = ['10', '25', '50', '100'];

    this.gridOptions = { paginacion: 10, pageSize: pageSizes };

    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'Proveedor Sucursal' };
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
    this.toolbar = [];
    if (this.modulo.camposClase.find(x => x.nombre === 'Agregar')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.AGREGAR,
          onClick: this.ToolbarButtonEvent.bind(this, BUTTONS_TOOLBAR.AGREGAR)
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
          onClick: this.ToolbarButtonEvent.bind(this, BUTTONS_TOOLBAR.EDITAR)
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
          onClick: this.ToolbarButtonEvent.bind(this, BUTTONS_TOOLBAR.ELIMINAR)
        }, visible: false,
        name: 'simple'
      });
    }
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

        this.GetProveedorEntidad(this.rfcProveedor);

      }, err => {
        this.loading = false;
        this.Excepciones(err, 2);
      });
  }
  // #endregion

  // #region AgregarColumnasEstaticas

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

  // #endregion

  // #region Delete
  /**
   * @description  Recupera los datos de un proveedorEntidad mediante su rfcProveedor.
   * @param rfcProveedor RFC del proveedor para buscar las propiedades.
   * @author Andres Farias
   */
  GetProveedorEntidad(rfcProveedor: string) {
    this.loading = true;
    this.siscoV3Service.getService('proveedor/GetProveedorEntidadByRFC?rfcProveedor=' + rfcProveedor).subscribe((res: any) => {
      this.loading = false;
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.proveedorEntidad = res.recordsets.length > 0 ? res.recordsets[0] : [];
      }

    }, err => {
      this.Excepciones(err, 2);
    });
  }
  // #endregion

  // #region Delete
  /**
   * @description CRUD de dataGrid ProveedorEntidad.
   * @param $event Eventos del data grid.
   * @author Andres Farias
   */
  ToolbarButtonEvent($event) {
    switch ($event) {
      case BUTTONS_TOOLBAR.AGREGAR:
        this.router.navigateByUrl('/ins-proveedor-entidad/' + this.rfcProveedor);
        break;
      case BUTTONS_TOOLBAR.EDITAR:
        try {
          this.router.navigateByUrl(
            '/upd-proveedor-entidad/' + this.datosevent[0].idProveedorEntidad
          );
        } catch (error) {
          this.Excepciones(error, 1);
        }
        break;
      case BUTTONS_TOOLBAR.ELIMINAR:
        try {
          let borrar = '<Ids>';
          this.datosevent.forEach((element) => {
            borrar += '<idProveedorEntidad>' + element.idProveedorEntidad + '</idProveedorEntidad>';
          });
          borrar += '</Ids>';
          this.DeleteData('proveedor/DelProveedorEntidad', 'data=' + borrar);
        } catch (error) {
          this.Excepciones(error, 1);
        }
        break;
    }
  }
  // #endregion

  DatosMessage($event) {
    this.datosevent = $event.data;
  }

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
          this.GetProveedorEntidad(this.rfcProveedor);
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'add-cliente.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
