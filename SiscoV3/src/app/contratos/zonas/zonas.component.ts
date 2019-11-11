import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Store } from '@ngrx/store';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { ErrorStateMatcher } from '@angular/material';
import { MatSnackBar, MatDialog } from '@angular/material';
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
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-zonas',
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.scss'],
  providers: [SiscoV3Service]
})
export class ZonasComponent implements OnInit, OnDestroy {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-zonas';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  spinner = true;
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
  toolbar: Toolbar[];
  numeroContrato: string;
  idCliente: number;
  idUsuario: number;
  niveles: any;
  zonas: any;
  evento: string;
  nuevaZonaEnabled = false;
  idPadre: number;
  idContratoNivel: number;
  ultimoNivel: number;
  estadoEnabled = false;
  estados: any;
  eliminarZonaEnabled = false;
  subsNegocio: Subscription;
  rfcEmpresa: string;

  zonaForm = new FormGroup({
    zonaPadre: new FormControl(),
    nuevaZona: new FormControl('', [Validators.required]),
    estado: new FormControl()
  });

  constructor(private router: Router,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>) {

    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
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
          this.idCliente = this.contratoActual.idCliente;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa
        }
      });

      if (this.numeroContrato && this.idCliente) {
        this.Grid();
        this.LoadData();
        this.Tree();
        this.Estados();
      }
    });

  }

  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  Grid() {

    // ******************PARAMETROS DE PAGINACION DE GRID**************** */
    const pageSizes = ['100', '300', '500', '1000'];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };
    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'niveles' };
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

    this.columns = [
      {
        dataField: 'idContratoNivel',
        caption: 'Id'
      },
      {
        dataField: 'rfcEmpresa',
        caption: 'RFC'
      },
      {
        dataField: 'idCliente',
        caption: 'Cliente'
      },
      {
        dataField: 'numeroContrato',
        caption: 'Número Contrato'
      },
      {
        dataField: 'descripcion',
        caption: 'Descrpción'
      },
      {
        dataField: 'orden',
        caption: 'Orden'
      }

    ];
  }

  /**
   * @description  Carga nivelex existentes
   * @returns Niveles existentes
   * @author Edgar Mendoza Gómez
   */

  LoadData() {
    try {
      this.siscoV3Service.getService('common/GetContratoNivel?numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              this.niveles = res.recordsets[0];
            } else {
              this.niveles = [];
            }
            if (this.niveles.length > 0) {
              this.ultimoNivel = this.niveles[0].ultimoNivel;
            } else {
              this.ultimoNivel = 0;
            }

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
    }
  }

  // #endregion

  datosMessage($event) {
    this.datosevent = $event.data;
  }

  // #region Toolbar

  /**
   * @description Función de agregar registros en el toolbar del grid.
   * @param data Evento que se realizara
   * @returns Devuelve exito o error
   * @author Edgar Mendoza Gómez
   */
  Add(data) {
    this.router.navigateByUrl('/ins-contrato-nivel');
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
        '/upd-contrato-nivel/' + this.datosevent[0].idContratoNivel
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
        borrar += '<idContratoNivel>' + element.idContratoNivel + '</idContratoNivel>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          self.DeleteData('common/DelContratoNivel', 'data=' + borrar);
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

  /**
   * @description  Carga listado de zonas para mostrar en árbol
   * @returns Listado de zonas
   * @author Edgar Mendoza Gómez
   */

  Tree() {
    try {
      this.siscoV3Service.getService('common/GetZonas?numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&rfcEmpresa=' + this.rfcEmpresa )
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.zonas = res.recordsets[0];

            this.zonas.forEach(element => {
              if (element.idContratoZona !== 999999) {
                element.isExpanded = true;
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

  /**
   * @description  Carga los estados de la republica
   * @returns Devuelve los estados
   * @author Edgar Mendoza Gómez
   */

  Estados() {
    try {
      this.siscoV3Service.getService('common/GetEstados')
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.estados = res.recordsets[0];

          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  /**
   * @description  Valida el evento click del árbol de partidas
   * @returns Activa inputs
   * @author Edgar Mendoza Gómez
   * @param e  Evento
   */

  selectItem(e) {

    this.zonaForm.reset();
    this.zonaForm = new FormGroup({
      zonaPadre: new FormControl(),
      nuevaZona: new FormControl('', [Validators.required]),
      estado: new FormControl()
    });
    this.estadoEnabled = false;
    this.eliminarZonaEnabled = true;
    this.idPadre = e.itemData.idContratoZona;
    this.idContratoNivel = e.itemData.idContratoNivel;
    
    this.nuevaZonaEnabled = true;
    this.zonaForm.controls.zonaPadre.setValue(e.itemData.descripcion);

    if (this.ultimoNivel === e.itemData.orden) {
      this.nuevaZonaEnabled = false;
    }

    if (this.ultimoNivel - 1 === e.itemData.orden) {
      this.estadoEnabled = true;
      this.zonaForm.controls.estado.setValidators([Validators.required]);
    }

    if (this.idPadre === 999999) {
      this.eliminarZonaEnabled = false;
    }

  }

  /**
   * @description  Inserta una nueva zona
   * @returns Devuelve si hubo error o fue exitosa la inserción
   * @author Edgar Mendoza Gómez
   */

  insZonaNueva() {
    this.spinner = true;
    const data = {
      rfcEmpresa: this.contratoActual.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato,
      idPadre: this.idPadre,
      descripcion: this.zonaForm.controls.nuevaZona.value,
      idContratoNivel: this.idContratoNivel,
      idEstado: this.zonaForm.controls.estado.value
    };

    this.siscoV3Service.postService('common/PostInsNuevaZona', data).subscribe((res: any) => {
      this.spinner = false;
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.snackBar.open('Se ha guardado correctamente la zona.', 'Ok', {
          duration: 2000
        });
        this.nuevaZonaEnabled = false;
        this.zonaForm.reset();
        this.Tree();
      }
    },
      (error: any) => {
        this.Excepciones(error, 2);
        this.spinner = false;

      });
  }

  Eliminar() {
    this.spinner = true;
    this.siscoV3Service.deleteService('common/DeleteZona', 'idContratoZona=' + this.idPadre).subscribe((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.snackBar.open('Se ha eliminado correctamente la zona.', 'Ok', {
          duration: 2000
        });
        this.nuevaZonaEnabled = false;
        this.zonaForm.reset();
        this.Tree();
        this.spinner = false;
      }
    },
      (error: any) => {
        this.Excepciones(error, 2);
        this.spinner = false;

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
          moduloExcepcion: 'zonas.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }
}
