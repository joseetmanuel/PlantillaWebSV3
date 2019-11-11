import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IGridOptions,
  IColumns,
  ICheckbox,
  IEditing,
  IColumnchooser,
  IColumnHiding,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  TiposdeDato,
  TiposdeFormato
} from '../interfaces';
import { Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { SiscoV3Service } from '../services/siscov3.service';
import { DeleteAlertComponent } from '../utilerias/delete-alert/delete-alert.component';
import { AppState, selectContratoState } from '../store/app.states';

import { Negocio } from 'src/app/models/negocio.model';
import { ExcepcionComponent } from '../utilerias/excepcion/excepcion.component';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { BaseService } from '../services/base.service';
@Component({
  selector: 'app-operador',
  templateUrl: './operador.component.html',
  providers: [SiscoV3Service]
})
export class OperadorComponent implements OnInit, OnDestroy {

  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  claveModulo = 'app-operador';
  spinner = false;
  idUsuario: number;
  idClase: string;
  titleClase: string;
  logo: string;
  modulo: any = {};
  breadcrumb: any;
  /*variables para el contrato activo*/
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  idCliente: number;
  /** variables de los datos */
  numero: number;
  operadores = [];
  /** variables parael grid */
  datosevent: any;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  subscriptionNegocio: Subscription;


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
    private baseService: BaseService
  ) {
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.Grid();
    this.dataOperadores();
    try {
      this.titleClase = 'Operadores';
      const usuario = this.baseService.getUserData();
      this.idUsuario = usuario.user.id;
      this.subscriptionNegocio = this.getStateNegocio.subscribe((stateN) => {
        if (stateN && stateN.claseActual) {
          this.contratoActual = stateN.contratoActual;
          this.idClase = stateN.claseActual;

          this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
          if (this.modulo.breadcrumb) {
            this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
          }

          if (this.contratoActual !== null) {
            this.numeroContrato = this.contratoActual.numeroContrato;
            this.idCliente = this.contratoActual.idCliente;
          }
        }
      });

    } catch (error) {
      this.Excepciones(error, 1);
    }
  }
  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }
  /**
   * Datos de los operadores
   */
  dataOperadores() {
    this.spinner = true;
    this.columns = [
      {
        caption: 'Id usuario',
        dataField: 'idUsers',
        hiddingPriority: '0',
        width: 60
      },
      {
        caption: 'Foto',
        dataField: 'Avatar',
        hiddingPriority: '0',
        cellTemplate: 'foto'
      },
      {
        caption: 'Nombre',
        dataField: 'PrimerNombre',
        hiddingPriority: '0'
      },
      {
        caption: 'Apellido',
        dataField: 'PrimerApellido',
        hiddingPriority: '0'
      },
      {
        caption: 'Segundo apellido',
        dataField: 'SegundoApellido',
        hiddingPriority: '0'
      },
      {
        caption: 'Pais',
        dataField: 'paisNombre',
        hiddingPriority: '0'
      },
      {
        caption: 'Estado',
        dataField: 'estadoNombre',
        hiddingPriority: '0'
      },
      {
        caption: 'Municipio',
        dataField: 'municipioNombre',
        hiddingPriority: '0'
      },
      {
        caption: 'Vialidad',
        dataField: 'vialidad',
        hiddingPriority: '0'
      },
      {
        caption: 'Registro',
        dataField: 'fechaRegistro',
        dataType: TiposdeDato.datetime,
        format: TiposdeFormato.dmyt
      }
    ];

    this.siscoV3Service.getService('operador/getOperadores').subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.operadores = res.recordsets[0];

        }
      },
      (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
        this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
          duration: 2000
        });
      }
    );

  }

  Grid() {
    const pageSizes = [];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };
    this.exportExcel = { enabled: true, fileName: this.titleClase };
    this.columnHiding = { hide: true };
    this.Checkbox = { checkboxmode: 'multiple' };
    this.Editing = { allowupdate: false };
    this.Columnchooser = { columnchooser: true };
    this.scroll = { mode: 'standard' };

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
    Parametros de Toolbar
    */
    this.toolbar = [
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
      }, {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: 'Asignar vehículo',
          onClick: this.receiveMessage.bind(this, 'objeto')
        },
        visible: false,
        name: 'simple',
        name2: 'multiple'
      },
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
  }


  /**
   * Evaluamos a que tipo de evento nos vamos a dirigir cuando se presionen los botones del Toolbar.
   * @param $event  evento lanzado en el  html
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.Add(senddata);
      } else if ($event === 'edit') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Edit(senddata);
      } else if ($event === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Delete(senddata);
      } else if ($event === 'objeto') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Objeto(senddata);
      }

    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Obtenemos la data del componente "grid-component".
   * @param $event evento lanzado en el  html
   */
  DatosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /*
  Función Agregar para ir a la pagina de insertar objetos
  */
  Add(data) {
    try {
      this.router.navigateByUrl(
        'ins-operador'
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Funcion para redirigir a la pagina de editar campos
   * @param data datos de el objeto a editar
   */
  Edit(data) {
    let idOperador;
    data.data.forEach(element => {
      idOperador = element.idUsers;
    });
    try {
      this.router.navigateByUrl(
        'upd-operador/' + idOperador
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
 * Funcion para redirigir a la pagina de editar campos
 * @param data datos de el objeto a editar
 */
  Objeto(data) {
    let idOperador;
    data.data.forEach(element => {
      idOperador = element.idUsers;
    });
    try {
      this.router.navigateByUrl(
        'asignar-objeto/' + idOperador
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }


  /**
   * Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @param data datos de el objeto a borrar
   */
  Delete(data) {
    try {
      let borrar = '<Ids>';
      let cont = 0;
      data.data.forEach((element, index, array) => {
        borrar += '<idUsers>' + element.idUsers + '</idUsers>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          this.DeleteData('operador/delOperador', 'data=' + borrar);

        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }


  /**
   * Abre el dialog delete-alert funcion auxiliar
   * @param direccion ruta a la cual se va a direccionar despues dde la accion
   * @param datos parametro de seguimiento
   */
  DeleteData(direccion: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '60%',
        data: {
          ruta: direccion,
          data: datos
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.dataOperadores();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }
  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de la escecpción lanzada
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'operador.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.subscriptionNegocio.unsubscribe();
  }
}
