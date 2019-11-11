import { Component, OnInit } from '@angular/core';
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
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';

@Component({
  selector: 'app-sel-tipoobjeto',
  templateUrl: './sel-tipoobjeto.component.html',
  providers: [SiscoV3Service]
})
export class SelTipoObjetoComponent implements OnInit {
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-tipoobjeto';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

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
  spinner = false;
  tipoObjetos = [];
  tipoObjetosColumns = [];
  contratos: any;
  breadcrumb: any[];

  constructor(private router: Router,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private store: Store<AppState>) {

    this.spinner = true;
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    // ******************ARREGLO CON LOS OBJETOS PERMITIDOS**************** */

    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
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

        this.contratos = stateNegocio.contratosPorClase;
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
        ContratoMantenimientoEstatus.conMantemiento, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  Grid() {
    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'tipoObjetos' };
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

    let partidasPropias: boolean;

    this.contratos.forEach(f => {
      if (f.incluyeMantenimiento === false) {
        partidasPropias = true;
      }

    });


    this.toolbar.push({
      location: 'after',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        width: 90,
        text: 'Partidas',
        onClick: this.receiveMessage.bind(this, 'partidas')
      }, visible: false,
      name: 'simple',
      name2: 'multiple'
    });

    if (partidasPropias === true) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 140,
          text: 'Partidas Propias',
          onClick: this.receiveMessage.bind(this, 'partidasPropias')
        }, visible: false,
        name: 'simple',
        name2: 'multiple'
      });
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'Clonar')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 130,
            text: 'Clonar Partida',
            onClick: this.receiveMessage.bind(this, 'clonar')
          }, visible: false,
          name: 'simple',
          name2: 'multiple'
        });
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
            if (res.recordsets.length > 0) {
              this.tipoObjetos = res.recordsets[0];

            } else {
              this.tipoObjetos = [];
            }

            this.siscoV3Service.getService('tipoObjeto/GetTipoObjetosColumns?idClase=' + this.idClase)
              .subscribe((res2: any) => {
                this.spinner = false;
                if (res2.recordsets.length > 0) {
                  this.tipoObjetosColumns = res2.recordsets[0];
                }
                this.columns = [];
                if (this.tipoObjetosColumns.length > 0) {
                  // tslint:disable-next-line: forin
                  for (const data in this.tipoObjetosColumns[0]) {
                    let tipoDato = '';
                    if (this.tipoObjetosColumns[0][data] === 'File' || this.tipoObjetosColumns[0][data] === 'Image') {
                      tipoDato = 'foto';
                    }
                    // En grid se cambia nombre de propiedad pero en sp se mantiene el campo idPartida para mantener integridad
                    if (data === 'idTipoObjeto') {
                      this.columns.push({ caption: 'Id', dataField: data });
                    } else {
                      this.columns.push({ caption: data.charAt(0).toUpperCase() + data.slice(1), dataField: data, cellTemplate: tipoDato });
                    }
                  }

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

  // #endregion


  // #region Toolbar
  /**
   * @description Función de agregar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */
  Add(data) {
    this.router.navigateByUrl('/ins-tipoobjeto');
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
        '/upd-tipoobjeto/' + this.datosevent[0].idTipoObjeto
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
        borrar += '<idTipoObjeto>' + element.idTipoObjeto + '</idTipoObjeto>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          self.DeleteData('tipoObjeto/delTipoObjeto', 'data=' + borrar + '&&idClase=' + self.idClase);
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description Función de clonar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */

  Clonar(data) {
    this.router.navigateByUrl('/clonar-partida/' + this.datosevent[0].idTipoObjeto);
  }

  /**
   * @description  Función para cargar partidas.
   * @param data Evento que se realizara
   * @returns Carga partidas
   * @author Edgar Mendoza Gómez
   */

  Partidas(data) {
    try {
      this.router.navigateByUrl(
        '/sel-partida/' + this.datosevent[0].idTipoObjeto
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  /**
   * @description  Función para cargar partidas propias.
   * @param data Evento que se realizara
   * @returns Carga partidas propias
   * @author Edgar Mendoza Gómez
   */

  PartidasPropias(data) {
    try {
      this.router.navigateByUrl(
        '/sel-partida-propia/' + this.datosevent[0].idTipoObjeto
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  // #endregion

  // #region Botones Grid

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
    } else if ($event === 'partidas') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.Partidas(senddata);
    } else if ($event === 'partidasPropias') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.PartidasPropias(senddata);
    } else if ($event === 'clonar') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.Clonar(senddata);
    }
  }

  // #endregion

  datosMessage($event) {
    this.datosevent = $event.data;
  }


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
          moduloExcepcion: 'clientes.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }
}

