import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';

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
} from '../../../../interfaces';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ins-proveedor-contrato',
  templateUrl: './ins-proveedor-contrato.component.html',
  styleUrls: ['./ins-proveedor-contrato.component.scss']
})
export class InsProveedorContratoComponent implements OnInit {
  @Input() rfcEmpresa;
  @Input() idCliente;
  @Input() numeroContrato;
  @Input() modulo;
  @Input() idClase;

  subsNegocio: Subscription;
  idUsuario;

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

  gridDataSource: any;
  gridBoxValue2: number[];
  proveedores = [];
  proveedoresTable = [];
  selectValues;
  public numero = 1;
  bandAgrega = false;

  proveedorContratoForm = new FormGroup({
    proveedor: new FormControl('', [Validators.required])
  });

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service) { }

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
      const that = this;
      let borrar = ``;
      let cont = 0;
      data.data.forEach((element, index, array) => {
        borrar += `<Ids><idCliente>${
          that.idCliente
          }</idCliente><numeroContrato>${
          that.numeroContrato
          }</numeroContrato><rfcEmpresa>${that.rfcEmpresa}</rfcEmpresa><rfcProveedor>${
          element.rfcProveedor
          }</rfcProveedor></Ids>`;
        cont++;
        if (cont === array.length) {
          that.deleteData(
            'contrato/proveedor/elimina/listado',
            'Data=' + borrar
          );
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
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
          caption: 'Nombre comercial',
          dataField: 'nombreComercial',
          hiddingPriority: '1'
        },
        {
          caption: 'RFC Proveedor',
          dataField: 'rfcProveedor',
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
      this.exportExcel = { enabled: true, fileName: 'Listado proveedores contrato' };
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
      this.toolbar = [];
      if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar Proveedor Contrato')) {
        this.toolbar.push(
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
        );
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /**
   * @description Obtiene los proveedores disponibles de la base de datos
   * @returns Proveedores en formato Json
   * @author Gerardo Zamudio González
   */
  loadProveedores() {
    this.siscoV3Service
      .getService(`proveedor/listado/filtrados/${this.idClase}/${this.idCliente}/${this.numeroContrato}`)
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.proveedores = res.recordsets[0];
            this.selectFillData(this.proveedores);
          }
        },
        (error: any) => {
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Metodo de Debex para que el select se vea como una tabla
   * @param proveedores Todos los proveedores
   * @author Gerardo Zamudio González
   */
  selectFillData(proveedores) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'rfcProveedor',
      load() {
        const json = proveedores;
        return json;
      }
    });
  }


  /**
   * Pregarga los datos de la pagína
   */
  ngOnInit() {
    this.loadProveedores();
    this.getProveedores();
    if (this.modulo.camposClase.find(x => x.nombre === 'Agregar Proveedor Contrato')) {
      this.bandAgrega = true;
    }
  }


  /**
   * @description Obtiene los proveedores disponibles de la base de datos
   * @returns Proveedores en formato Json
   * @author Gerardo Zamudio González
   */
  getProveedores() {
    this.table();
    this.siscoV3Service
      .getService(
        `contrato/proveedor/contrato/${this.rfcEmpresa}/${this.idCliente}/${
        this.numeroContrato
        }`
      )
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.proveedoresTable = res.recordsets[0];
          }
        },
        (error: any) => {
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Metodos de devex
   */
  getSelectedItemsKeys(items) {
    let result = [];
    const that = this;

    items.forEach((item) => {
      if (item.selected) {
        result.push(item.key);
      }
      if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeys(item.items));
      }
    });
    return result;
  }

  get gridBoxValue(): number[] {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: number[]) {
    this.gridBoxValue2 = value || [];
  }

  /**
   * @description Asigna  el valor seleccionado al proveedorContratoForm
   * @param $event fila seleccionada
   * @author Gerardo Zamudio González
   */
  onSelectionChanged($event) {
    this.selectValues = $event.selectedRowsData;
    this.proveedorContratoForm.controls.proveedor.setValue(
      this.selectValues
    );
  }

  /**
   * @description Crea el XML para mandarlo a la base de datos
   * @returns Ejecuta el metodo insertarProveedor()
   * @author Gerardo Zamudio González
   */
  insProveedor() {
    const that = this;
    let data = '';
    let conta = 0;
    this.selectValues.forEach((element, index, array) => {
      data += `<Ids><rfcEmpresa>${that.rfcEmpresa}</rfcEmpresa><idCliente>${
        that.idCliente
        }</idCliente><numeroContrato>${
        that.numeroContrato
        }</numeroContrato><rfcProveedor>${
        element.rfcProveedor
        }</rfcProveedor></Ids>`;
      conta++;
      if (conta === array.length) {
        that.insertarProveedor(data);
      }
    });
  }

  /**
   * @description Inserta el XML de los proveedores a la base de datos
   * @param data XML de los proveedores
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
  insertarProveedor(data) {
    const datos = {
      Data: data,
      // idUsuario: this.idUsuario
    };
    this.siscoV3Service
      .postService('contrato/proveedor/nuevo', datos)
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.gridBoxValue2 = [];
            this.proveedorContratoForm.reset();
            this.loadProveedores();
            this.getProveedores();
            this.snackBar.open('Proveedores registrado correctamente.', 'Ok', {
              duration: 2000
            });
          }
        },
        (error: any) => {
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
        }
      });
    } catch (error) {
      this.numero = 1;
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
          moduloExcepcion: 'ins-proveedor-contrato.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }
}
