import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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
} from '../../../../interfaces';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { Router } from '@angular/router';
import { DeleteAlertComponent } from '../../../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../../../utilerias/excepcion/excepcion.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { moduleProvideDef } from '@angular/core/src/view';

@Component({
  selector: 'app-sel-ordenes-compra',
  templateUrl: './sel-ordenes-compra.component.html',
  styleUrls: ['./sel-ordenes-compra.component.scss'],
  providers: [SiscoV3Service]
})
export class SelOrdenesCompraComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  subsNegocio: Subscription;


  @Input() rfcEmpresa;
  @Input() idCliente;
  @Input() numeroContrato;
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
  contratos;
  datosContrato;
  ordenes = [];
  muestra = false;

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
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
   * @description Función Agregar que rdirige a la pagina ins-orden-compra
   * @returns Redirige al la pagina ins-orden-compra
   * @author Gerardo Zamudio González
   */
  add(data) {
    try {
      // tslint:disable-next-line:max-line-length
      this.router.navigateByUrl(`ins-orden-compra/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Funcion Editar redirige a la pagina upd-orden-compra
   * @returns Redirige al la pagina upd-orden-compra
   * @author Gerardo Zamudio González
   */
  edit(data) {
    try {
      const datos = data.data[0];
      this.router.navigateByUrl(
        // tslint:disable-next-line:max-line-length
        `upd-orden-compra/${datos.rfcEmpresa}/${datos.idCliente}/${datos.numeroContrato}/${datos.idOrden}`
      );
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
        // tslint:disable-next-line:max-line-length
        borrar += `<Ids><idCliente>${element.idCliente}</idCliente><numeroContrato>${element.numeroContrato}</numeroContrato><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa><idOrden>${element.idOrden}</idOrden></Ids>`;
        cont++;
        if (cont === array.length) {
          that.deleteData('orden/elimina', 'Data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
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
            this.idClase = state2.claseActual;
            this.getOrdenes();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }


  /**
   * @description Obtiene todas las ordenes de la base de datos
   * @returns Muestra las ordenes en la tabla
   * @author Gerardo Zamudio González
   */
  getOrdenes() {
    this.table();
    this.siscoV3Service.getService(`orden/listado/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.ordenes = res.recordsets[0];
          this.muestra = false;
          this.muestra = true;
        }
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );
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
          caption: 'Número de orden',
          dataField: 'idOrden',
          width: 150
        },
        {
          caption: 'Descripción',
          dataField: 'descripcion',
          width: 150
        },
        {
          caption: 'Cantidad',
          dataField: 'cantidad',
        },
        {
          caption: 'Progreso',
          dataField: 'progreso'
        },
        {
          caption: 'Fecha',
          dataField: 'fecha',
          dataType: TiposdeDato.datetime,
          format: TiposdeFormato.dmy
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
      this.exportExcel = { enabled: true, fileName: 'Listado de ordenes' };
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
      if (this.modulo.camposClase.find(x => x.nombre === 'AgregarOrden')) {
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
      if (this.modulo.camposClase.find(x => x.nombre === 'EditarOrden')) {
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
      if (this.modulo.camposClase.find(x => x.nombre === 'EliminarOrden')) {
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
          this.getOrdenes();
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
          moduloExcepcion: 'sel-ordenes-compra.component',
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
