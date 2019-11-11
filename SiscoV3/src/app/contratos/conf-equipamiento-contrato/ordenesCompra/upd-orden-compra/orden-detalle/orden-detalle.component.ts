import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import CustomStore from 'devextreme/data/custom_store';
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
} from '../../../../../interfaces';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-orden-detalle',
  templateUrl: './orden-detalle.component.html',
  styleUrls: ['../upd-orden-compra.component.scss'],
  providers: [SiscoV3Service]
})
export class OrdenDetalleComponent extends FormularioDinamico implements OnInit, OnDestroy {


  gridDataSource: any;
  gridBoxValue2: number[];
  selectValues;
  tipoObjetos = [];
  tipoObjetosColumns = [];

  subsNegocio: Subscription;

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  public numero = 1;
  @Input() rfcEmpresa;
  @Input() numeroContrato;
  @Input() idCliente;
  @Input() idOrden;

  datosevent: any;
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
  altaDetallesOrden = [];

  ordenDetalleForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idOrden: new FormControl('', [Validators.required]),
    unidades: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    idTipoObjeto: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required])
  });

  etiqueta;

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.delete(senddata);
      }
    } catch (error) {
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
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @returns Abre el deleteDialog para eliminar el dato
   * @author Gerardo Zamudio González
   */
  delete(data) {
    try {
      const datos = data.data;
      const that = this;
      let borrar = ``;
      let conta = 0;
      datos.forEach((element, index, array) => {
        // tslint:disable-next-line:max-line-length
        borrar += `<Ids><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa><idCliente>${element.idCliente}</idCliente><numeroContrato>${element.numeroContrato}</numeroContrato><idOrden>${element.idOrden}</idOrden><idOrdenDetalle>${element.idOrdenDetalle}</idOrdenDetalle></Ids>`;
        conta++;
        if (conta === array.length) {
          that.deleteData(`orden/detalle/elimina/listado`, `Data=${borrar}`);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    super();
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }


  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.ordenDetalleForm.controls.idUsuario.setValue(this.idUsuario);
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.idClase = state2.claseActual;
            this.etiqueta = null;
            this.ordenDetalleForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
            this.ordenDetalleForm.controls.idCliente.setValue(this.idCliente);
            this.ordenDetalleForm.controls.numeroContrato.setValue(this.numeroContrato);
            this.ordenDetalleForm.controls.idOrden.setValue(this.idOrden);
            this.getAllDetallesOrden();
            this.LoadData();
          }
        });
      }
    });
  }


  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /**
   * @description Cierra el Select de la tabla
   * @returns Cierra el Select de la tabla
   * @author Gerardo Zamudio González
   */
  closeWindow($event: any) {
    if ($event) {
      $event.instance.close();
    }
  }

  /**
   * @description Trae todos los datos del servicio para llenar el select de la tabla
   * @returns Regresa los datos que se muestran en la tabla
   * @author Gerardo Zamudio González
   */
  LoadData() {
    try {
      this.siscoV3Service.getService('tipoObjeto/GetTipoObjetos?idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excecion) {
            this.excepciones(res.err, 3);
          } else {
            this.tipoObjetos = res.recordsets[0];
            this.selectFillData(this.tipoObjetos);

            this.siscoV3Service.getService('tipoObjeto/GetTipoObjetosColumns?idClase=' + this.idClase)
              .subscribe((res2: any) => {
                this.numero = 1;
                this.tipoObjetosColumns = res2.recordsets[0];
                if (this.tipoObjetosColumns.length > 0) {
                  // tslint:disable-next-line: forin
                  for (const data in this.tipoObjetosColumns[0]) {
                    let tipoDato = '';
                    if (this.tipoObjetosColumns[0][data] === 'File' || this.tipoObjetosColumns[0][data] === 'Image') {
                      tipoDato = 'foto';
                    }

                  }

                }
              });

          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Se encarga de convertir los datosn en un Json para llenar la tabla
   * @param datos Los datos obtenidos del servicio para llenar la tabla
   * @returns Retorna el gridDataSource
   * @author Gerardo Zamudio González
   */
  selectFillData(datos) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoObjeto',
      load() {
        const json = datos;
        return json;
      }
    });
  }

  /**
   * @description Se encarga de obtener la data seleccionada del grit
   * @param $event La data del grit seleccionada
   * @returns Ejecuta el metodo getOrderDetailCount()
   * @author Gerardo Zamudio González
   */
  onSelectionChanged($event) {
    this.selectValues = $event.selectedRowsData[0].idTipoObjeto;
    this.ordenDetalleForm.controls.idTipoObjeto.setValue(
      this.selectValues
    );
    this.getOrderDetailCount(this.ordenDetalleForm.controls.idTipoObjeto.value);
  }

  /**
   * @description Carga los datos en la tabla
   * @returns MUestra la tabla
   * @author Gerardo Zamudio González
   */
  table() {
    /*
    Columnas de la tabla
    */
    try {
      this.columns = [
        {
          caption: 'Cantidad',
          dataField: 'unidades',
          hiddingPriority: '1',
          width: 150
        },
        {
          caption: 'Marca',
          dataField: 'marca',
          hiddingPriority: '0'
        },
        {
          caption: 'Submarca',
          dataField: 'subMarca',
          hiddingPriority: '0'
        },
        {
          caption: 'Año',
          dataField: 'modelo',
          hiddingPriority: '0'
        },
        {
          caption: 'Conversión',
          dataField: 'idConversion',
          hiddingPriority: '0'
        }
      ];

      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Listado de detalle de ordenes' };
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

      /*
  Parametros de Toolbar
  */
      this.toolbar = [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Eliminar',
            onClick: this.receiveMessage.bind(this, 'delete')
          },
          visible: false,
          name: 'simple'
        }
      ];
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Carga los detalles de las ordenes en la tabla
   * @returns Carga la tabla con las ordenes
   * @author Gerardo Zamudio González
   */
  getAllDetallesOrden() {
    this.table();
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`orden/detalle/listado/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${this.idOrden}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.altaDetallesOrden = res.recordsets[0];
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }


  /**
   * @description Inserta una orden detalle
   * @returns Recarga la página
   * @author Gerardo Zamudio González
   */
  insOrdenDetalle() {
    const data = {
      rfcEmpresa: this.ordenDetalleForm.controls.rfcEmpresa.value,
      idCliente: this.ordenDetalleForm.controls.idCliente.value,
      numeroContrato: this.ordenDetalleForm.controls.numeroContrato.value,
      idOrden: this.ordenDetalleForm.controls.idOrden.value,
      unidades: this.ordenDetalleForm.controls.unidades.value,
      idTipoObjeto: this.ordenDetalleForm.controls.idTipoObjeto.value,
      idClase: this.idClase
      // idUsuario: this.ordenDetalleForm.controls.idUsuario.value
    };
    this.numero = 0;
    this.siscoV3Service.postService('orden/detalle/nuevo', data).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          if (res.recordsets != null && res.recordsets.length > 0) {
            this.snackBar.open(
              res.recordsets[0][0].mensaje,
              'Ok'
            );
          } else {
            this.ordenDetalleForm.reset();
            this.ordenDetalleForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
            this.ordenDetalleForm.controls.idCliente.setValue(this.idCliente);
            this.ordenDetalleForm.controls.numeroContrato.setValue(this.numeroContrato);
            this.ordenDetalleForm.controls.idOrden.setValue(this.idOrden);
            this.ordenDetalleForm.controls.idUsuario.setValue(this.idUsuario);
            this.snackBar.open(
              'Detalle orden insertada correctamente.',
              'Ok',
              {
                duration: 2000
              }
            );
            this.ngOnInit();
          }
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Obtiene el conteo de las unidades diponibles
   * @returns Muestra la etiqueta que te indica cuantas ordenes estan disponibles
   * @author Gerardo Zamudio González
   */
  getOrderDetailCount(idObject) {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`orden/detalle/conteo/listado/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${idObject}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.etiqueta = res.recordsets[0][0];
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }


  /**
   * @description Abre el dialog delete-alert
   * @param url La Url para eliminar un documento
   * @param datos Los datos que se van a eliminar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
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
          this.ngOnInit();
          this.ordenDetalleForm.reset();
          this.ordenDetalleForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
          this.ordenDetalleForm.controls.idCliente.setValue(this.idCliente);
          this.ordenDetalleForm.controls.numeroContrato.setValue(this.numeroContrato);
          this.ordenDetalleForm.controls.idOrden.setValue(this.idOrden);
          this.ordenDetalleForm.controls.idUsuario.setValue(this.idUsuario);
        }
      });
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
          moduloExcepcion: 'orden-detalle.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }
}
