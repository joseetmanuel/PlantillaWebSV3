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
  IColumnchooser,
  TiposdeDato,
  TiposdeFormato

} from '../../interfaces';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-sel-clientes',
  templateUrl: './sel-clientes.component.html',
  styleUrls: ['./sel-clientes.component.scss', '../../app.component.sass'],
  providers: [SiscoV3Service]
})
export class ClientesComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  modulo;
  claveModulo = 'app-sel-clientes';
  breadcrumb: any[];

  ruta: any;
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
  clientes = [];
  public numero = 1;
  subsNegocio: Subscription;

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


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private siscoV3Service: SiscoV3Service,
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
            this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
            if (this.modulo.breadcrumb) {
              this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
            }
            this.loadData();
            this.table();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }


  table() {
    this.toolbar = [];
    /*
   Columnas de la tabla
   */
    try {
      this.columns = [
        {
          caption: 'Id cliente',
          dataField: 'idCliente',
          hiddingPriority: '1',
          width: 150
        },
        {
          caption: 'Nombre cliente',
          dataField: 'nombre',
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
      this.exportExcel = { enabled: true, fileName: 'Listado de clientes' };
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
      if (this.modulo.camposClase.find(x => x.nombre === 'Agregar')) {
        this.toolbar.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              width: 90,
              text: 'Agregar',
              onClick: this.receiveMessage.bind(this, 'add')
            },
            visible: true
          }
        );
      }
      if (this.modulo.camposClase.find(x => x.nombre === 'Editar')) {
        this.toolbar.push(
          {
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
          },
        );
      }
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
   * @description Este metodo es el que trae todos los datos inciales de los clientes
   * @returns Carga todos los clientes en la página
   * @author Gerardo Zamudio González
   */
  loadData() {
    try {
      this.numero = 0;
      this.siscoV3Service.getService('cliente/getClientes').subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.clientes = res.recordsets[0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Función Agregar que rdirige a la pagina ins-cliente
   * @returns Redirige al la pagina ins-cliente
   * @author Gerardo Zamudio González
   */
  add(data) {
    try {
      this.router.navigateByUrl('/ins-cliente');
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Funcion Editar redirige a la pagina upd-cliente
   * @returns Redirige al la pagina upd-cliente
   * @author Gerardo Zamudio González
   */
  edit(data) {
    try {
      this.router.navigateByUrl(
        `/upd-cliente/${this.datosevent[0].idCliente}`
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
      let borrar = '<Ids>';
      let cont = 0;
      data.data.forEach((element, index, array) => {
        borrar += '<idCliente>' + element.idCliente + '</idCliente>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          that.deleteData('cliente/deleteCliente', 'data=' + borrar);
        }
      });
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
          this.loadData();
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
          moduloExcepcion: 'sel-clientes.component',
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
