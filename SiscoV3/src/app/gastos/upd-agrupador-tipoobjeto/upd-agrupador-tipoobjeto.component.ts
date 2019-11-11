import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { SiscoV3Service } from '../../services/siscov3.service';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { ActivatedRoute } from '@angular/router';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import CustomStore from 'devextreme/data/custom_store';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
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


@Component({
  selector: 'app-upd-agrupador-tipoobjeto',
  templateUrl: './upd-agrupador-tipoobjeto.component.html'
})
export class UpdAgrupadorTipoobjetoComponent implements OnInit, OnDestroy {
  spinner = false;
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-agrupador-tipoobjeto';
  idClase: string;
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  breadcrumb: any[];
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  tipoObjetos = [];
  tipoObjetosAgrupador = [];
  tipoObjetosAgrupador2 = [];
  tipoObjetosColumns = [];
  selectValues;
  idCostoAgrupador: number;
  gridDataSource: any;
  gridBoxValue2: number[];
  idUsuario: number;
  datosevent;
  subsNegocio: Subscription;

  agrupadorForm = new FormGroup({
    agrupador: new FormControl('', [Validators.required]),
  });

  agrupadorContratoForm = new FormGroup({
    agrupador: new FormControl('', [Validators.required])
  });

  constructor(private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private activatedRoute: ActivatedRoute,
              private snackBar: MatSnackBar,
              private store: Store<AppState>) {
    this.spinner = true;
    this.activatedRoute.params.subscribe(parametros => {
      this.idCostoAgrupador = parametros.idCostoAgrupador;
    });
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    // ******************ARREGLO CON LOS OBJETOS PERMITIDOS**************** */

      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idClase = stateNegocio.claseActual;
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(true);
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
            [{ idCostoAgrupador: this.idCostoAgrupador }]);
        }

        this.Grid();
        this.AgrupadorValue();
        this.LoadDataAgrupador();
      });
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
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  AgrupadorValue() {
    try {
      this.siscoV3Service.getService('solicitud/GetCostoAgrupadorIdAgrupador?idAgrupador=' + this.idCostoAgrupador)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            const agrupadorValue = res.recordsets[0][0];
            this.agrupadorForm.controls.agrupador.setValue(agrupadorValue.nombre);

          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  Grid() {
    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'Unidades Agrupador' };
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
    this.toolbar = [];

    if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Eliminar',
            onClick: this.receiveMessage.bind(this, 'delete')
          }, visible: false,
          name: 'simple'
        });
    }
  }

  /**
   * @description Funciones dependiendo boton de toolbar.
   * @param $event Boton al que se le ha dado click
   * @returns Evento de boton que se dio click
   * @author Edgar Mendoza Gómez
   */

  receiveMessage($event) {
    this.evento = $event.event;
    if ($event === 'delete') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.Delete(senddata);
    }
  }

  datosMessage($event) {
    this.datosevent = $event.data;
  }

  /**
   * @description  Función de eliminar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */

  Delete(data) {

    try {
      const self = this;
      let borrar = '<Ids>';
      let cont = 0;
      // tslint:disable-next-line: only-arrow-functions
      data.data.forEach(function(element, index, array) {
        borrar += '<idTipoObjeto>' + element.idTipoObjeto + '</idTipoObjeto>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          self.DeleteData('solicitud/DelTipoObjetoAgrupador', 'data=' + borrar + '&idAgrupador=' + self.idCostoAgrupador);
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

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
          this.LoadDataAgrupador();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  // #region CargaGrid

  /**
   * @description  Carga tipos de objeto existentes
   * @returns Devuelve tipos de objeto con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadData() {
    try {
      this.siscoV3Service.getService('tipoObjeto/GetTipoObjetos?idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.tipoObjetos = res.recordsets[0];
            const idTipoObjetoAgrupador = this.tipoObjetosAgrupador.map(m => m.idTipoObjeto);

            this.tipoObjetos = this.tipoObjetos.filter(f => !idTipoObjetoAgrupador.includes(f.idTipoObjeto));
            this.selectFillData(this.tipoObjetos);

            this.siscoV3Service.getService('tipoObjeto/GetTipoObjetosColumns?idClase=' + this.idClase)
              .subscribe((res2: any) => {
                this.tipoObjetosColumns = res2.recordsets[0];
                this.columns = [];
                if (this.tipoObjetosColumns.length > 0) {
                  // tslint:disable-next-line: forin
                  for (const data in this.tipoObjetosColumns[0]) {
                    if (this.tipoObjetosColumns[0][data] !== 'File' && this.tipoObjetosColumns[0][data] !== 'Image') {
                      if (data !== 'TotalPartidas') {
                        // En grid se cambia nombre de propiedad pero en sp se mantiene el campo idPartida para mantener integridad
                        if (data === 'idTipoObjeto') {
                          this.columns.push({ caption: 'Id', dataField: data });
                        } else {
                          this.columns.push({ caption: data.charAt(0).toUpperCase() + data.slice(1), dataField: data });
                        }
                      }
                    }
                  }
                  this.spinner = false;

                }
              });

          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  LoadDataAgrupador() {
    try {
      this.siscoV3Service.getService('solicitud/GetTipoObjetosAgrupador?idClase=' + this.idClase + '&idAgrupador=' + this.idCostoAgrupador)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.tipoObjetosAgrupador = res.recordsets[0];
            this.tipoObjetosAgrupador2 = this.tipoObjetosAgrupador.filter(f => f.idCostoAgrupador === Number(this.idCostoAgrupador));
            this.LoadData();
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  /**
   * @description Asigna  el valor seleccionado al proveedorContratoForm
   * @param $event fila seleccionada
   * @author Gerardo Zamudio González
   */
  onSelectionChanged($event) {
    this.selectValues = $event.selectedRowsData;
    this.agrupadorContratoForm.controls.agrupador.setValue(
      this.selectValues
    );
  }

  updAgrupador() {
    this.spinner = true;
    this.siscoV3Service.putService('solicitud/PutUpdAgrupador', {
      idAgrupador: this.idCostoAgrupador, nombreAgrupador: this.agrupadorForm.controls.agrupador.value
    })
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.spinner = false;
          this.snackBar.open('Se ha actualizado agrupador.', 'Ok', {
            duration: 2000
          });
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
  }

  insAgrupador() {
    this.spinner = true;
    let objetos = [];
    objetos = this.agrupadorContratoForm.controls.agrupador.value.map(m => m.idTipoObjeto);
    this.siscoV3Service.postService('solicitud/PostInsAgrupadorDetalle', { objetos, idAgrupador: this.idCostoAgrupador })
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.spinner = false;
          this.snackBar.open('Se han insertado en agrupador.', 'Ok', {
            duration: 2000
          });
          this.LoadDataAgrupador();

        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });

  }

  get gridBoxValue(): number[] {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: number[]) {
    this.gridBoxValue2 = value || [];
  }

  selectFillData(tipoobjeto) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoObjeto',
      load() {
        const json = tipoobjeto;
        return json;
      }
    });
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
          moduloExcepcion: 'upd-agrupador.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }



}
