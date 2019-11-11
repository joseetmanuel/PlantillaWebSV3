import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
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

@Component({
  selector: 'app-ins-gasto',
  templateUrl: './ins-gasto.component.html',
  providers: [SiscoV3Service]
})
export class InsGastoComponent implements OnInit, OnDestroy {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-gasto';
  idClase: string;
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  breadcrumb: any[];
  spinner = false;
  estados: any;
  numeroContrato: string;
  idUsuario: number;
  costoPorcentaje: number;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[] = [];
  columnsdetail: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[];
  toolbardetail: Toolbar[];
  detail: IDetail;
  agrupadores = [];
  agrupadorDetalle = [];
  agrupadoresColumns = [];
  idEstado: string;
  estadistica = [];
  columnasNombres = [];
  cargaGrid: boolean;
  subsNegocio: Subscription;

  costoForm = new FormGroup({
    estado: new FormControl('', [Validators.required])
  });

  constructor(private router: Router,
              private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private store: Store<AppState>) {

    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */

        if (!stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(true);
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

        if (this.contratoActual) {
          this.numeroContrato = this.contratoActual.numeroContrato;
        }
      });

      this.Estados();

    });
  }

  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  Grid() {
    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'Costos' };
    // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
    this.columnHiding = { hide: true };
    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'none' };  // *desactivar con none*/
    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: true, mode: 'cell' }; // *cambiar a batch para editar varias celdas a la vez*/
    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };
    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };

    // ******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [];
    this.toolbardetail = [];

    this.detail = { detail: true };


  }

  setEstado() {
    this.idEstado = this.costoForm.controls.estado.value;
    this.cargaGrid = true;

    this.Grid();
    this.LoadData();


  }

  // #region CargaGrid

  /**
   * @description  Carga tipos de objeto existentes
   * @returns Devuelve tipos de objeto con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadData() {
    try {

      this.columns = [];
      this.columnsdetail = [];
      this.siscoV3Service.getService('solicitud/GetCosto?idEstado=' + this.idEstado + '&&idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.agrupadores = res.recordsets[0];
            this.agrupadorDetalle = res.recordsets[1];
            this.estadistica = res.recordsets[2][0];
            this.columnasNombres = res.recordsets[3];

            // tslint:disable-next-line: forin
            for (const data in this.agrupadores[0]) {
              if (data !== 'idTipoObjeto') {
                if (data === 'idCostoAgrupador') {
                  this.columns.push({ caption: 'Id', dataField: data, allowEditing: false });
                } else if (data === 'Agrupador') {
                  this.columns.push({ caption: 'Agrupador', dataField: data, allowEditing: false });
                } else {
                  this.columns.push({
                    caption: data.charAt(0).toUpperCase() + data.slice(1), dataField: data,
                    allowEditing: true, dataType: TiposdeDato.number, format: TiposdeFormato.moneda
                  });
                }
              }
            }
            this.columnsdetail = [{ caption: 'Id', dataField: 'idCostoAgrupador', allowEditing: false }];

            for (const data in this.agrupadorDetalle[0]) {
              if (data !== 'idTipoObjeto' && data !== 'idCostoAgrupador') {
                if (this.columnasNombres.find(f => f.nombre === data)) {
                  this.columnsdetail.push({
                    caption: data.charAt(0).toUpperCase() + data.slice(1), dataField: data, allowEditing: false,
                    dataType: TiposdeDato.number, format: TiposdeFormato.moneda
                  });
                } else {
                  this.columnsdetail.push({
                    caption: data.charAt(0).toUpperCase() + data.slice(1), dataField: data, allowEditing: false,

                  });
                }

              }
            }

            this.cargaGrid = false;
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  datosUpd($event) {

    let idCostoAgrupador = $event.editdata.key.idCostoAgrupador;
    const idTipoObjeto = $event.editdata.key.idTipoObjeto;
    const newData = Object.values($event.editdata.newData);
    const key = Object.keys($event.editdata.newData);

    if (idCostoAgrupador === 'S/A') {
      idCostoAgrupador = 0;
    }

    this.siscoV3Service.postService('solicitud/PostInsCosto', {
      idCostoAgrupador, key: key[0], newData: newData[0], idEstado: this.idEstado, idTipoObjeto, idClase: this.idClase
    })
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.cargaGrid = true;
          this.snackBar.open('Costo Actualizado.', 'Ok', {
            duration: 2000
          });
          this.LoadData();

        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
  }


  /**
   * @description  Carga los estados de la republica
   * @returns Devuelve los estados
   * @author Edgar Mendoza Gómez
   */

  Estados() {
    try {
      this.spinner = true;
      this.siscoV3Service.getService('common/GetEstados')
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.estados = res.recordsets[0];
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
