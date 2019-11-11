import { Component, OnInit, Input } from '@angular/core';
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
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { Router } from '@angular/router';
import { DeleteAlertComponent } from '../../../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../../../utilerias/excepcion/excepcion.component';
import { moduleProvideDef } from '@angular/core/src/view';

@Component({
  selector: 'app-sel-proveedores-equipamiento',
  templateUrl: './sel-proveedores-equipamiento.component.html',
  styleUrls: ['./sel-proveedores-equipamiento.component.sass']
})
export class SelProveedoresEquipamientoComponent implements OnInit {
  @Input() rfcEmpresa;
  @Input() numeroContrato;
  @Input() idCliente;
  @Input() modulo;

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
  public numero = 1;
  proveedores = [];
  ban = false;

  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.add(senddata);
      } else if ($event === 'edit') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.edit(senddata);
      } else if ($event === 'delete') {
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

  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Función Agregar que rdirige a la pagina ins-contrato
  */
  add(data) {
    try {
      this.router.navigateByUrl(
        `/ins-proveedor-equipamiento/${this.rfcEmpresa}/${
        this.numeroContrato
        }/${this.idCliente}`
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
Funcion Editar redirige a la pagina upd-cliente para actualizar el Contrato
*/
  edit(data) {
    try {
      const url = data.data[0];
      this.router.navigateByUrl(
        `/upd-proveedor-equipamiento/${url.rfcEmpresa}/${
        url.numeroContrato
        }/${url.idCliente}/${url.idActividad}`
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
*/
  delete(data) {
    try {
      let borrar = ``;
      let conta = 0;
      const that = this;
      data.data.forEach((element, index, array) => {
        borrar += `<Ids><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa><idCliente>${
          element.idCliente
          }</idCliente><numeroContrato>${
          element.numeroContrato
          }</numeroContrato><idActividad>${element.idActividad}</idActividad></Ids>`;
        conta++;
        if (conta === array.length) {
          that.deleteData('contrato/actividad/elimina/listado', 'Data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog
  ) { }

  table() {
    /*
    Columnas de la tabla
    */
    try {
      this.columns = [
        {
          caption: 'Nombre corto',
          dataField: 'nombre'
        },
        {
          caption: 'Razón social',
          dataField: 'rfcProveedor'
        },
        {
          caption: 'Cotización',
          dataField: 'cotizacion'
        },
        {
          caption: 'Moneda',
          dataField: 'moneda'
        }
        // {
        //   caption: 'Imagen cotización',
        //   dataField: 'idFileCotizacion',
        //   cellTemplate: 'foto'
        // },
        // {
        //   caption: 'Imagen factura',
        //   dataField: 'idFileFactura',
        //   cellTemplate: 'foto'
        // },
        // {
        //   caption: 'Fechas',
        //   dataField: ''
        // }
      ];

      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Listado de proveedores de quipamiento' };
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
      this.toolbar = []
      if (this.modulo.camposClase.find(x => x.nombre === 'AgregarProveedor')) {
        this.toolbar.push({
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Agregar',
            onClick: this.receiveMessage.bind(this, 'add')
          },
          visible: true
        })
      }
      if (this.modulo.camposClase.find(x => x.nombre === 'EditarProveedor')) {
        this.toolbar.push({
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Editar',
            onClick: this.receiveMessage.bind(this, 'edit')
          },
          visible: false,
          name: 'simple',
          name2: 'multiple'
        })
      }
      if (this.modulo.camposClase.find(x => x.nombre === 'EliminarProveedor')) {
        this.toolbar.push({
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
        })
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /**
   * Carga todos los proveedores registrados en la tabla
   */
  loadProveedores() {
    this.siscoV3Service
      .getService(
        `contrato/actividad/listado/${this.rfcEmpresa}/${this.idCliente}/${
        this.numeroContrato
        }/0/0/1`
      )
      .subscribe(
        (res: any) => {
          this.ban = true;
          this.table();
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.proveedores = res.recordsets[0];
          }
        },
        (error: any) => {
          this.excepciones(error, 2);
        }
      );
  }

  ngOnInit() {
    this.loadProveedores();
  }

  /*
  Abre el dialog delete-alert
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
          moduloExcepcion: 'sel-proveedores-equipamiento.component',
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
