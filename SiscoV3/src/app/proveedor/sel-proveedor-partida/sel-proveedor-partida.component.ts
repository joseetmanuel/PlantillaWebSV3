import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
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
  TiposdeFormato,
} from '../../interfaces';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import CustomStore from 'devextreme/data/custom_store';
import { AppState, selectAuthState, selectContratoState } from 'src/app/store/app.states';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from '../../models/negocio.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-sel-proveedor-partida',
  templateUrl: './sel-proveedor-partida.component.html',
  styleUrls: ['./sel-proveedor-partida.component.scss'],
  providers: [SiscoV3Service]
})
export class SelProveedorPartidaComponent implements OnInit, OnDestroy {
  claveModulo = 'app-sel-proveedor-partida';
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
  rfcProveedor: string;
  tipoObjetos: any;
  tipoObjetosColumns: any;
  gridDataSource: any;
  selectValues: any;
  newObjetoForm: any;
  idUsuario: any;
  subsNegocio: any;

  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store<AppState>) {
    this.activatedRoute.params.subscribe(parametros => {
      this.rfcProveedor = parametros.rfcProveedor;
    });
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.newObjetoForm = new FormGroup({
      idTipoObjeto: new FormControl('', [Validators.required])
    });

    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;

        this.GetTipoObjeto();

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcProveedor: this.rfcProveedor }]);
        }

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (this.modulo.contratoObligatorio) {
          if (stateNegocio.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;

        }

        this.Grid();

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
    this.Editing = { allowupdate: true, mode: 'cell' }; // *cambiar a batch para editar varias celdas a la vez*/

    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };


    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };

    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };
    this.toolbar = [];

    if (this.modulo.camposClase.find(x => x.nombre === 'CargaMasiva')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 180,
          text: 'Actualización Masiva',
          onClick: this.EventButtonDataGrid.bind(this, 'Actualización Masiva')
        },
        visible: true
      });
    }
  }

  /**
   * @description CRUD del datagrid de proveedor.
   * @param $event Evento que se ejecuta de los botones del data grid.
   * @author Andres Farias
   */
  EventButtonDataGrid($event: string) {
    switch ($event) {
      case 'Actualización Masiva':
        this.router.navigateByUrl('/ins-partida-proveedor-costo-masivo/' + this.rfcProveedor + '/' + this.idTipoObjeto);
        break;
    }
  }

  // #region CargaGrid

  /**
   * @description  Carga partidas existentes
   * @returns Devuelve partidas con sus propiedades
   * @author Andres Farias
   */

  LoadData() {
    try {
      this.spinner = true;
      this.siscoV3Service.getService('proveedor/GetPartidas?idTipoObjeto=' + this.idTipoObjeto + '&&numeroContrato='
        + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&idClase=' + this.idClase
        + '&&rfcProveedor=' + this.rfcProveedor).subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.spinner = false;
            this.partidas = res.recordsets[0];

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
                        this.columns.push({ caption: 'Id', dataField: data, allowEditing: false });
                      } else {
                        this.columns.push({
                          caption: data.charAt(0).toUpperCase() + data.slice(1),
                          dataField: data, cellTemplate: tipoDato,
                          allowEditing: false
                        });
                      }
                    }
                  }

                  this.GetTipoCobro();
                }


              });
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.spinner = false;
      this.Excepciones(error, 1);
    }
  }

  // #endregion

  // #region Botones Grid

  /**
   * @description Funciones dependiendo boton de toolbar.
   * @param $event Boton al que se le ha dado click
   * @returns Evento de boton que se dio click
   * @author Andres Farias
   */

  receiveMessage($event) {
    this.evento = $event.event;
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
    this.tiposCobro = []; 
    this.siscoV3Service.getService('partida/GetPartidaTipoCobro?idClase=' + this.idClase).subscribe((result: any) => {
      if (result.err) {
        this.Excepciones(result.err, 4);
      } else if (result.excepcion) {
        this.Excepciones(result.excepcion, 3);
      } else {

        if (result.recordsets.length > 0) {
          this.tiposCobro = result.recordsets[0];
          this.tiposCobro.forEach((tipo) => {
             // Damos formato a numerico a los costos de partidas.
            this.partidas.forEach((partida, index) => {
              if (partida[tipo.nombre] !== '') {
                this.partidas[index][tipo.nombre] = parseFloat(partida[tipo.nombre]);
              } else {
                this.partidas[index][tipo.nombre] = 0;
              }
            });

            // Agregamos las columnas de costo.
            this.columns.push({
              caption: tipo.nombre,
              dataField: tipo.nombre,
              allowEditing: true,
              format: TiposdeFormato.moneda
            });
          });
  
          this.columns.push({
            caption: 'Total',
            dataField: 'Costo',
            allowEditing: false,
            format: TiposdeFormato.moneda
          });
        }
      }
    });
  }

  datosUpd($event) {
    const data = $event.editdata;
    if (data) {
      const parametros = {
        rfcProveedor: this.rfcProveedor,
        idTipoObjeto: this.idTipoObjeto,
        idClase: this.idClase,
        costos: null,
        idUsuario: this.idUsuario
      }
      let costos = '<tiposCostos>';
      for (const key in data.newData) {
        if (data.newData.hasOwnProperty(key)) {
          const element = data.newData[key];
          costos += '<tipocosto>';
          costos += '<costo>' + element + '</costo>';
          costos += '<tipoCobro>' + key + '</tipoCobro>';
          costos += '<idPartida>' + data.key.idPartida + '</idPartida>';
          costos += '</tipocosto>';
        }
      }

      costos += '</tiposCostos>';

      parametros.costos = costos;

      this.siscoV3Service.postService('proveedor/PostProveedorPartidaCosto', { parametros })
        .subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.snackBar.open('El costo se ha modificado correctamente.', 'Ok', {
              duration: 2000
            });
            this.selectFillData(this.tipoObjetos);
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    }

  }

  /**
   * @description Recupera los tipos de objetos para mostrarlos en el combo
   */
  GetTipoObjeto() {
    this.spinner = true;

    this.siscoV3Service.getService('tipoObjeto/GetTipoObjetos?idClase=' + this.idClase)
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.tipoObjetos = res.recordsets[0];
          this.selectFillData(this.tipoObjetos);
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
  }

  /**
   * Metodo de Debex para que el select se vea como una tabla
   */
  selectFillData(datos) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoObjeto',
      load() {
        const json = datos;
        return json;
      }
    });
  }

  /**
   * Metodos de Devex
   */
  getSelectedItemsKeys(items) {
    let result = [];
    const that = this;

    items.forEach((item) => {
      if (item.selected) {
        result.push(item.key);
      }
      if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeys(item.items));
      }
    });
    return result;
  }

  /**
   * Cuando se seleccione un proveedor del select, se le setea el valor al proveedor
   */
  onChangedTipoObjeto($event) {
    this.idTipoObjeto = $event.selectedRowsData[0].idTipoObjeto;
    this.newObjetoForm.controls.idTipoObjeto.setValue(
      this.selectValues
    );

    this.LoadData();
  }

  closeWindow($event: any) {
    if ($event) {
      $event.instance.close();
    }
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  OnRowUpdated($event) {
    this.tiposCobro;
    if ($event.data) {
      let data = $event.data;
      let costo = 0;
      this.tiposCobro.forEach(tipo => {
        let nombreKey = tipo.nombre;
        if (data.hasOwnProperty(nombreKey)) {
          costo += parseFloat(data[nombreKey]);
        }
      });
  
      $event.data.Costo = costo;
    }

  }

}
