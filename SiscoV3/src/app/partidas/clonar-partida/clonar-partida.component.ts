import { Component, OnInit } from '@angular/core';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from 'src/app/store/app.states';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from '../../models/negocio.model';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import {
  IColumns,
  IProcess,
  IGridOptions,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  IColumnHiding,
  ICheckbox,
  IEditing,
  IColumnchooser,
} from '../../interfaces';

@Component({
  selector: 'app-clonar-partida',
  templateUrl: './clonar-partida.component.html',
  styleUrls: ['./clonar-partida.component.sass'],
  providers: [SiscoV3Service]
})
export class ClonarPartidaComponent implements OnInit {

  claveModulo = 'app-clonar-partida';
  spinner = true;
  idTipoObjeto: number;
  numeroContrato: string;
  idCliente: number;
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  idClase: string;
  datosevent;
  modulo: any = {};
  breadcrumb: any;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[] = [];
  partidas: [];
  objetos: any;
  public indexActive = 0;
  contratoActual: any;
  columnsPartidas: IColumns[];
  public btnNextEnable: boolean;
  columnsObjetos: IColumns[];
  selectValuesPartidas: any;
  selectValuesObjetos: any;
  clonarEnabled = false;
  partidaPorcentaje: number;
  objetoPorcentaje: number;

  public process: IProcess[] = [{
    active: true,
    finish: false,
    enabled: true
  }, {
    active: false,
    finish: false,
    enabled: false
  }, {
    active: false,
    finish: false,
    enabled: false
  }];

  constructor(private siscoV3Service: SiscoV3Service,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private store: Store<AppState>) {
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
        this.LoadDataPartidas();
        this.LoadDataTipoObjeto();
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

    // ******************PARAMETROS DE PAGINACION DE GRID**************** */
    const pageSizes = ['100', '300', '500', '1000'];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };

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

  }

  /**
   * @description  Carga partidas existentes
   * @returns Devuelve partidas con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadDataPartidas() {
    this.siscoV3Service.getService('partida/GetPartidas?idTipoObjeto='
      + this.idTipoObjeto + '&&numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente
      + '&&idClase=' + this.idClase).subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.spinner = false;
          this.partidas = res.recordsets[0];

          this.siscoV3Service.getService('partida/GetPartidaColumns?idTipoObjeto='
            + this.idTipoObjeto + '&&numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente
            + '&&idClase=' + this.idClase).subscribe((res2: any) => {
              this.columnsPartidas = [];

              if (res2.recordsets.length > 0) {
                const partidaColumns = res2.recordsets[0];
                if (partidaColumns.length > 0) {
                  // tslint:disable-next-line: forin
                  for (const data in partidaColumns[0]) {
                    let tipoDato = '';
                    if (partidaColumns[0][data] === 'File' || partidaColumns[0][data] === 'Image') {
                      tipoDato = 'foto';
                    }
                    if (data === 'idPartida') {
                      this.columnsPartidas.push({ caption: 'Id', dataField: data });
                    } else {
                      this.columnsPartidas.push({
                        caption: data.charAt(0).toUpperCase() + data.slice(1),
                        dataField: data, cellTemplate: tipoDato
                      });
                    }

                  }
                }
              }
              this.spinner = false;
            });
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });

  }

  active(index: number) {
    if ((this.process[index].enabled)) {
      if (index < this.process.length) {
        this.indexActive = index;
        this.process.forEach((element, i) => {
          this.process[i].active = false;
        });
        this.process[this.indexActive].active = true;

      }
    }
  }


  /**
   * @description  Funcíon de boton siguiente
   * @returns Acción de botón siguiente
   * @author Edgar Mendoza Gómez
   */
  next(): void {
    this.btnNextEnable = false;
    if (this.indexActive < this.process.length) {

      this.process[this.indexActive].active = this.indexActive < (this.process.length - 1) ? false : true;
      this.process[this.indexActive].finish = true;
      this.indexActive++;
      if (this.indexActive < (this.process.length)) {
        this.process[this.indexActive].active = true;
        this.process[this.indexActive].enabled = true;
      }

    }
    if (this.indexActive === 0) {
      this.valida(1);
    }
    if (this.indexActive === 1) {
      this.valida(2);
    }

    if (this.indexActive === 2) {
      this.partidaPorcentaje = (this.selectValuesPartidas.length * 100) / this.partidas.length;
      this.objetoPorcentaje = (this.selectValuesObjetos.length * 100) / this.objetos.length;
    }
  }

  /**
   * @description  Funcíon de boton atras
   * @returns Acción de botón atras
   * @author Edgar Mendoza Gómez
   */

  previous(): void {
    this.btnNextEnable = false;
    this.indexActive = this.indexActive === this.process.length ? (this.process.length - 1) : this.indexActive;
    if (this.indexActive > 0) {
      this.process[this.indexActive].active = false;
      this.indexActive--;
      this.process[this.indexActive].active = true;

    }
    if (this.indexActive === 0) {
      this.valida(1);
    }
    if (this.indexActive === 1) {
      this.valida(2);
    }
  }

  /**
   * @description  Carga tipos de objeto existentes
   * @returns Devuelve tipos de objeto con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadDataTipoObjeto() {
    this.siscoV3Service.getService('tipoObjeto/GetTipoObjetos?idClase=' + this.idClase).subscribe((res: any) => {
      if (res.err) {
        this.spinner = false;
        this.Excepciones(res.err, 4);
      } else if (res.excecion) {
        this.Excepciones(res.err, 3);
      } else {
        if (res.recordsets.length > 0) {
          this.objetos = res.recordsets[0].filter(f => f.idTipoObjeto != this.idTipoObjeto);

        } else {
          this.objetos = [];
        }

        this.siscoV3Service.getService('tipoObjeto/GetTipoObjetosColumns?idClase=' + this.idClase).subscribe((res2: any) => {
          this.spinner = false;
          this.columnsObjetos = [];

          if (res2.recordsets.length > 0) {
            const objetoColumns = res2.recordsets[0];
            if (objetoColumns.length > 0) {
              // tslint:disable-next-line: forin
              for (const data in objetoColumns[0]) {
                if (objetoColumns[0][data] !== 'File' && objetoColumns[0][data] !== 'Image') {
                  if (data === 'idTipoObjeto') {
                    this.columnsObjetos.push({ caption: 'Id', dataField: data });
                  } else {
                    this.columnsObjetos.push({
                      caption: data.charAt(0).toUpperCase() + data.slice(1),
                      dataField: data, width: 200
                    });
                  }
                }
              }
            }
          }
          this.spinner = false;
        });
      }
    }, (error: any) => {
      this.spinner = false;
      this.Excepciones(error, 2);
    });
  }

  datosMessagePartidas($event) {
    this.selectValuesPartidas = $event.data;
    this.valida(1);
  }

  datosMessageObjetos($event) {
    this.selectValuesObjetos = $event.data;
    this.valida(2);
  }

  /**
   * @description  Valida la activación del boton next
   * @returns Activa botón
   * @author Edgar Mendoza Gómez
   * @param grid En que grid se encuentra
   */

  valida(grid) {
    if (grid === 1) {
      if (this.selectValuesPartidas) {
        if (this.selectValuesPartidas.length > 0) {
          this.btnNextEnable = true;
        } else {
          this.btnNextEnable = false;
        }
      }
    }
    if (grid === 2) {
      if (this.selectValuesObjetos) {
        if (this.selectValuesObjetos.length > 0) {
          this.btnNextEnable = true;
        } else {
          this.btnNextEnable = false;
        }
      }
    }

  }

  /**
   * @description  Realiza inserción de partidas dependiendo cuantos objetos se hayan seleccionad
   * @returns Regresa si fue exitosa o hubo error en la inserción
   * @author Edgar Mendoza Gómez
   */

  clonarPartida() {
    this.process[2].finish = true;
    this.spinner = true;
    const idsPartidas = this.selectValuesPartidas.map(m => m.idPartida);
    const idsTiposObjetos = this.selectValuesObjetos.map(m => m.idTipoObjeto);

    this.siscoV3Service.postService('partida/PostClonarPartida', { idsPartidas, idsTiposObjetos, idClase: this.idClase }).subscribe((res: any) => {
      if (res.err) {
        this.spinner = false;
        this.Excepciones(res.err, 4);
      } else if (res.excecion) {
        this.Excepciones(res.err, 3);
      } else {
        this.snackBar.open('Se han clonado la(s) partida(s) correctamente.', 'Ok', {
          duration: 2000
        });
        this.router.navigateByUrl('/sel-tipoobjeto');

      }
    }, (error: any) => {
      this.spinner = false;
      this.Excepciones(error, 2);
    });
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
          moduloExcepcion: 'clona-partida.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
