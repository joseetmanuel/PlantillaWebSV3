import { Component, OnInit } from '@angular/core';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
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
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from 'src/app/store/app.states';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from '../../models/negocio.model';

@Component({
  selector: 'app-sel-partida',
  templateUrl: './sel-partida.component.html',
  providers: [SiscoV3Service]
})
export class SelPartidaComponent implements OnInit {
  claveModulo = 'app-sel-partida';
  datosevent;
  spinner = false;
  idTipoObjeto: number;
  partidas = [];
  idClase: string;
  modulo: any = {};
  breadcrumb: any;
  evento: string;
  gridOptions: IGridOptions;
  columns: IColumns[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[] = [];
  partidaColumns = [];
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  numeroContrato: string;
  idCliente: number;
  contratoActual: any;
  tiposCobro: any[] = [];
  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>) {
    this.spinner = true;
    this.activatedRoute.params.subscribe(parametros => {
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;

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
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idTipoObjeto: this.idTipoObjeto }]);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;

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
        ContratoMantenimientoEstatus.conMantemiento, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  Grid() {

    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'partidas' };

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
    this.toolbar = [];
    this.columns = [];
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
    if (this.modulo.camposClase.find(x => x.nombre === 'Carga Masiva')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 120,
            text: 'Carga Masiva',
            onClick: this.receiveMessage.bind(this, 'cargaMasiva')
          },
          visible: true
        });
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'Costo Masivo')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 180,
            text: 'Costos Masivo',
            onClick: this.receiveMessage.bind(this, 'costoMasivo')
          },
          visible: true
        });
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
    this.router.navigateByUrl('/ins-partida/' + this.idTipoObjeto);
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
        '/upd-partida/' + this.idTipoObjeto + '/' + this.datosevent[0].idPartida
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  /**
   * @description  Función para hacer carga masiva de partidas.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */

  CargaMasiva(data) {
    this.router.navigateByUrl('/ins-partida-masiva/' + this.idTipoObjeto);
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
        borrar += '<idPartida>' + element.idPartida + '</idPartida>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          self.DeleteData('partida/DelPartida', 'data=' + borrar + '&&idClase=' + self.idClase);
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  // #endregion

  // #region CargaGrid

  /**
   * @description  Carga partidas existentes
   * @returns Devuelve partidas con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadData() {
    try {
      this.spinner = true;
      this.siscoV3Service.getService('partida/GetPartidas?idTipoObjeto=' + this.idTipoObjeto + '&&numeroContrato='
        + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&idClase=' + this.idClase).subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              this.partidas = res.recordsets[0];
            } else {
              this.partidas = [];
            }
            this.siscoV3Service.getService('partida/GetPartidaColumns?idTipoObjeto=' + this.idTipoObjeto + '&&numeroContrato='
              + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&idClase=' + this.idClase).subscribe((res2: any) => {
                this.spinner = false;
                this.columns = [];

                if (res2.recordsets.length > 0) {
                  this.partidaColumns = res2.recordsets[0];
                  if (this.partidaColumns.length > 0) {
                    // tslint:disable-next-line: forin
                    for (const data in this.partidaColumns[0]) {

                      let tipoDato = '';
                      if (this.partidaColumns[0][data] === 'File' || this.partidaColumns[0][data] === 'Image') {
                        tipoDato = 'foto';
                      }
                      // En grid se cambia nombre de propiedad pero en sp se mantiene el campo idPartida para mantener integridad
                      if (data === 'idPartida') {
                        this.columns.push({ caption: 'Id', dataField: data });
                      } else {
                        this.columns.push({
                          caption: data.charAt(0).toUpperCase() + data.slice(1),
                          dataField: data, cellTemplate: tipoDato
                        });
                      }
                    }
                    this.spinner = false;
                  }
                }

                this.GetTipoCobro();

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
    } else if ($event === 'cargaMasiva') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.CargaMasiva(senddata);
    } else if ($event === 'costoMasivo') {
      this.router.navigateByUrl('/ins-partida-costo-masiva/' + this.idTipoObjeto);
    }
  }

  // #endregion

  datosMessage($event) {
    this.datosevent = $event.data;
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
          moduloExcepcion: 'clientes.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

  /**
   * @description Obtiene los tipos de cobro de la clase para pintar los campos en el formulario
   * @author Andres Farias
   */
  GetTipoCobro() {
    this.siscoV3Service.getService('partida/GetPartidaTipoCobro?idClase=' + this.idClase).subscribe((result: any) => {
      if (result.err) {
        this.Excepciones(result.err, 4);
      } else if (result.excepcion) {
        this.Excepciones(result.excepcion, 3);
      } else {
        if (this.tiposCobro.length === 0) {
          this.tiposCobro = result.recordsets[0];
          this.tiposCobro.forEach((tipo) => {
            this.columns.push({
              caption: tipo.nombre,
              dataField: tipo.nombre
            });
          });
          this.columns.push({
            caption: 'Costo',
            dataField: 'Costo'
          });
        }
      }
    });
  }

}
