import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { Subscription } from 'rxjs/Subscription';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
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
  IColumnchooser,
  TiposdeFormato
} from '../../interfaces';

@Component({
  selector: 'app-sel-gestoria',
  templateUrl: './sel-gestoria.component.html',
  styleUrls: ['./sel-gestoria.component.sass']
})
export class SelGestoriaComponent implements OnInit, OnDestroy {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-gestoria';
  idClase: string;
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  breadcrumb: any[];
  spinner = false;
  numeroContrato: string;
  idUsuario: number;
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
  datosevent;
  subsNegocio: Subscription;
  gestorias: any;
  gestoriasDetalle: any;
  btnEliminar = false;

  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private router: Router,
    private store: Store<AppState>) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.spinner = true;
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

        this.Grid();
        this.LoadData();
      });

    });
  }

  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  Grid() {
    this.columns = [
      {
        caption: 'Estado',
        dataField: 'estado'
      },
      {
        caption: 'Año Fiscal',
        dataField: 'añoFiscal'
      },
      {
        caption: 'Subtotal',
        dataField: 'subTotal',
        format: TiposdeFormato.moneda
      },
      {
        caption: 'Otras Comisiones',
        dataField: 'otrosGastos'
      },
      {
        caption: 'Total',
        dataField: 'total',
        format: TiposdeFormato.moneda
      },
      {
        caption: 'No. Solicitudes',
        dataField: 'noSolicitudes'
      },
      {
        caption: 'Estatus',
        dataField: 'estatus'
      }
    ];

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

    // ******************PARAMETROS DE TOOLBAR**************** */
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

        });
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
          }, visible: false,
          name: 'simple',
          name2: 'multiple'
        });
    }

    this.toolbar.push(
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: 'Eliminar',
          onClick: this.receiveMessage.bind(this, 'delete')
        }, visible: this.btnEliminar,
        name: 'simple',
        name2: 'multiple'
      });

  }

  /**
   * @description Funciones dependiendo boton de toolbar.
   * @param $event Boton al que se le ha dado click
   * @returns Evento de boton que se dio click
   * @author Edgar Mendoza Gómez
   */

  receiveMessage($event) {
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
    }
  }

  // #region Toolbar
  /**
   * @description Función de agregar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */

  Add(data) {
    this.router.navigateByUrl('/sel-pago/0/0/0/0');
  }

  /**
   * @description  Función de editar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */

  Edit(data) {

    try {
      this.router.navigateByUrl(
        '/sel-pago/' + this.datosevent[0].idEstado + '/' + this.datosevent[0].añoFiscal + '/'
        + this.datosevent[0].idResponsable + '/' + this.datosevent[0].otrosGastos
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  /**
   * @description  Función de eliminar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */

  Delete(data) {

    this.DeleteData('solicitud/DelGestoria', 'data=' + data.data[0].idGestoria + '&&idClase=' + this.idClase);

  }
  // #endregion

  // #region DeleteData
  /**
   * @description Muestra componente de la alerta de eliminar.
   * @param ruta Ruta de la función del controller
   * @param data datos de partidas a eliminar
   * @returns Devuelve exito o error al eliminar
   * @author Edgar Mendoza Gómez
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
          this.LoadData();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  // #endregion

  datosMessage($event) {
    this.datosevent = $event.data;

    if (this.datosevent.length === 1) {
      const solicitudes = this.gestoriasDetalle.filter(f => f.idGestoria === this.datosevent[0].idGestoria);
      const detalleSolicitud = solicitudes.find(f => f.idEstatusSolicitud !== 'CANCELADA');

      if (solicitudes.length === 0) {
        this.btnEliminar = true;

      } else if (detalleSolicitud.length === 0) {
        this.btnEliminar = true;

      } else {
        this.btnEliminar = false;
      }

    }
  }

  LoadData() {
    this.spinner = true;
    this.siscoV3Service.getService('solicitud/GetGestoria?idClase=' + this.idClase)
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.gestorias = res.recordsets[0];
          this.gestoriasDetalle = res.recordsets[1];
          this.spinner = false;
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
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
          moduloExcepcion: 'solicitud-pago.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
