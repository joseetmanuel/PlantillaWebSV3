import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { SiscoV3Service } from '../../services/siscov3.service';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { FormGroup, Validators, FormControl } from '@angular/forms';
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
  selector: 'app-agrupador-tipoobjeto',
  templateUrl: './agrupador-tipoobjeto.component.html'
})
export class AgrupadorTipoobjetoComponent implements OnInit, OnDestroy {
  spinner = false;
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-agrupador-tipoobjeto';
  idClase: string;
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  breadcrumb: any[];
  datosevent;
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
  agrupadores = [];
  selectValues;
  subsNegocio: Subscription;

  agrupadorContratoForm = new FormGroup({
    agrupador: new FormControl('', [Validators.required])
  });

  constructor(private siscoV3Service: SiscoV3Service,
              private router: Router,
              public dialog: MatDialog,
              private store: Store<AppState>) {

    this.spinner = true;
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    // ******************ARREGLO CON LOS OBJETOS PERMITIDOS**************** */
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idClase = stateNegocio.claseActual;
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
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

        this.Grid();
        this.LoadData();

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

  Grid() {

    this.columns = [
      {
        caption: 'Id',
        dataField: 'idCostoAgrupador'
      },
      {
        caption: 'Agrupador',
        dataField: 'nombre'
      },
      {
        caption: 'Total',
        dataField: 'total'
      }
    ];
    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'Agrupadores' };
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
          visible: this.modulo.camposClase.find(x => x.nombre === 'Agregar') ? true : false
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


  datosMessage($event) {
    this.datosevent = $event.data;
  }

  /**
   * @description  Carga tipos de objeto existentes
   * @returns Devuelve tipos de objeto con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadData() {
    try {
      this.siscoV3Service.getService('solicitud/GetAgrupador?idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.agrupadores = res.recordsets[0];
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

  // #region Toolbar
  /**
   * @description Función de agregar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */
  Add(data) {
    this.router.navigateByUrl('/ins-agrupador-tipoobjeto');
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
        '/upd-agrupador-tipoobjeto/' + this.datosevent[0].idCostoAgrupador
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

    try {
      const self = this;
      let borrar = '<Ids>';
      let cont = 0;
      // tslint:disable-next-line: only-arrow-functions
      data.data.forEach(function (element, index, array) {
        borrar += '<idAgrupador>' + element.idCostoAgrupador + '</idAgrupador>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          self.DeleteData('solicitud/DelAgrupador', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
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
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'agrupadortipoobjeto.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }


}
