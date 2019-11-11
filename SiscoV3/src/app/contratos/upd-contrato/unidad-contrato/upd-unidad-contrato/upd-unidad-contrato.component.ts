import { Component, OnInit } from '@angular/core';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';

import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { IGridOptions, IColumns, IColumnHiding, IEditing, ICheckbox, IColumnchooser, IExportExcel, ISearchPanel, IScroll, Toolbar } from 'src/app/interfaces';
import { Router } from '@angular/router';
import { FormularioDinamico } from '../../../../utilerias/clases/formularioDinamico.class';
import CustomStore from 'devextreme/data/custom_store';
import { FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { SessionInitializer } from '../../../../services/session-initializer';
import { BaseService } from '../../../../services/base.service';
import { TiposdeFormato } from '../../../../interfaces';
import { format } from 'util';

@Component({
  selector: 'app-upd-unidad-contrato',
  templateUrl: './upd-unidad-contrato.component.html',
  styleUrls: ['./upd-unidad-contrato.component.scss']
})
export class UpdUnidadContratoComponent extends FormularioDinamico implements OnInit {

  breadcrumb: any[];
  state;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-unidad-contrato';
  idClase = '';
  modulo: any = {};

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;

  numero = 1;

  idCliente;
  rfcEmpresa;
  numeroContrato;
  idTipoObjeto;
  flagGrid = false;


  conversiones;
  unidadContratoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idTipoObjeto: new FormControl('', [Validators.required]),
    modelo: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    idConversion: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    idUsuario: new FormControl('', [Validators.required])
  });
  gridDataSource: any;
  tipoObjetosColumns: any;
  tipoObjetos: any;
  selectValues: any;
  // gridBoxValue2: number = 3;
  gridBoxValue2: number;
  gridSelectedRowKeys2: number[];
  edita = false;
  partidas = [];
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
  partidaColumns = [];
  datosevent: any;
  dinamicColumns;

  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store<AppState>,
    private baseService: BaseService,
    private sessionInitializer: SessionInitializer
  ) {
    super();
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      const usuario = this.baseService.getUserData();
      this.idUsuario = usuario.user.id;
      this.unidadContratoForm.controls.idUsuario.setValue(this.idUsuario);
      const contrato = this.baseService.getContractData();
      if (contrato.claseActual) {
        this.idClase = contrato.claseActual;
        this.loadData(usuario.permissions.modules);
        this.GetPropiedadesAll();
        this.LoadDataSelect();
      }
    }
  }

  /*
    Se deja el multicontrato y el contrato como obligatorio ya que se desconoce si esta en seguridad
    Lo debe cambiar de acuerdo a la regla de negocio
  */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, false, true, false)
    ));
  }

  loadData(modulos) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.idTipoObjeto = parametros.idTipoObjeto;
      this.unidadContratoForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
      this.unidadContratoForm.controls.idCliente.setValue(this.idCliente);
      this.unidadContratoForm.controls.numeroContrato.setValue(
        this.numeroContrato
      );
      this.unidadContratoForm.controls.idTipoObjeto.setValue(
        this.idTipoObjeto
      );
      this.construyeBreadCrumb(modulos);
      if (this.numeroContrato) {
        this.ConfigurarFooter(false);
      } else {
        this.ConfigurarFooter(true);
      }
      this.getUnidadData();
    });
  }

  construyeBreadCrumb(modulos) {
    this.modulo = Negocio.GetModulo(this.claveModulo, modulos, this.idClase);
    if (this.modulo.breadcrumb) {
      this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }, { idTipoObjeto: this.idTipoObjeto }]);
    }
  }


  /**
   * Carga el select dinamico con las Marcas y Sub-Marcas
   */
  GetPropiedadesAll() {
    this.numero = 0;
    this.siscoV3Service
      .getService('tipoObjeto/GetPropiedadMarcas?idClase=' + this.idClase)
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.getConversiones();
            this.GetPropiedades(res.recordsets[0]);
          }
        },
        (error: any) => {
          this.excepciones(error, 2);
          this.numero = 1;
        }
      );
  }


  LoadDataSelect() {
    try {
      this.siscoV3Service.getService('tipoObjeto/GetTipoObjetos?idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excecion) {
            this.excepciones(res.err, 3);
          } else {
            this.tipoObjetos = res.recordsets[0];
            this.selectFillData(this.tipoObjetos);

            this.siscoV3Service.getService('tipoObjeto/GetTipoObjetosColumns?idClase=' + this.idClase)
              .subscribe((res2: any) => {
                this.numero = 1;
                this.tipoObjetosColumns = res2.recordsets[0];
              });
          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

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
   * Llenamos el select de conversiones
   */
  getConversiones() {
    this.numero = 0;
    this.siscoV3Service.getService('contrato/conversion/listado/0/0/1').subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.conversiones = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        this.excepciones(error, 1);
      }
    );
  }

  getUnidadData() {
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/tipounidad/detalle/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${this.idTipoObjeto}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          const unidad = res.recordsets[0][0];
          this.fillUnidadData(unidad);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  fillUnidadData(unidad) {
    this.gridBoxValue2 = +this.idTipoObjeto;
    this.gridSelectedRowKeys2 = [this.idTipoObjeto];
    this.unidadContratoForm.controls.modelo.setValue(unidad.modelo);
    this.unidadContratoForm.controls.idConversion.setValue(unidad.idConversion);
    this.unidadContratoForm.controls.cantidad.setValue(unidad.cantidad);
    this.Grid();
    this.LoadDataa();
  }

  // =============================================== PARTIDAS =========================================

  // #endregion

  datosMessage($event) {
    this.datosevent = $event.data;
  }

  datosUpd($event) {
    const vari = $event.editdata.key;
    const that = this;
    let columName;
    let venta = 0;
    let idTipoCobro = '';
    // vari.resultado = 0;
    let conta = 0;
    let r = 0;
    Object.keys(vari).forEach((k, v, ar) => {
      this.dinamicColumns.forEach((col) => {
        if (k === col.nombre) {
          // tslint:disable-next-line:radix
          const valorCol = parseInt($event.editdata.newData[col.nombre]);
          // tslint:disable-next-line:use-isnan
          if (valorCol && valorCol !== NaN) {
            columName = col.nombre;
            idTipoCobro = col.idTipoCobro;
            r += valorCol;
            venta = valorCol;
            // aquí va el storde que actualiza el valor de col
          } else {
            if (valorCol === 0) {
              // tslint:disable-next-line:radix
              r -= parseInt($event.editdata.key[col.nombre]);
              idTipoCobro = col.idTipoCobro;
              venta = 0;
            }
            // tslint:disable-next-line:radix
            r += parseInt($event.editdata.key[col.nombre]);
          }
        }
      });
      conta++;
      if (conta === ar.length) {
        const data = {
          rfcEmpresa: that.rfcEmpresa,
          idCliente: that.idCliente,
          numeroContrato: that.numeroContrato,
          idPartida: vari.idPartida,
          idTipoCobro,
          idClase: that.idClase,
          costo: null,
          venta,
          // idUsuario: this.idUsuario
        };
        that.siscoV3Service.postService(`contrato/postInsPartidaPrecio`, data).subscribe(
          (res: any) => {
            that.numero = 1;
            if (res.error) {
              if (res.error === 'No existe costo para la partida') {
                this.snackBar.open(res.error, 'Ok');
                vari[columName] = 0;
              } else {
                that.excepciones(res.error, 4);
              }
            } else if (res.excepcion) {
              that.excepciones(res.excepcion, 3);
            } else {
              vari.Resultado = 0;
              vari.Resultado += r;
              this.snackBar.open(
                'Datos actualizados.',
                'Ok',
                {
                  duration: 2000
                }
              );
            }
          }, (error: any) => {
            that.excepciones(error, 2);
          }
        );
      }
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
    if ($event === 'carga') {
      const senddata = {
        event: $event
      };
      this.cargaMasiva();
    }
  }

  cargaMasiva() {
    // tslint:disable-next-line:max-line-length
    this.router.navigateByUrl(`ins-precios-venta-carga-masiva/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${this.idTipoObjeto}`);
  }

  Grid() {
    this.toolbar = [];
    if (this.modulo.camposClase.find(x => x.nombre === 'Carga Masiva')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          text: 'Carga masiva',
          onClick: this.receiveMessage.bind(this, 'carga')
        },
        visible: true
      });
    }

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
  }

  LoadDataa() {
    try {
      this.flagGrid = false;
      this.numero = 0;
      // tslint:disable-next-line:max-line-length
      this.siscoV3Service.getService(`contrato/getPartidaVenta?idClase=${this.idClase}&rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idTipoObjeto=${this.idTipoObjeto}`).subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.columns = [];
            this.partidas = res.recordsets[0];
            this.dinamicColumns = res.recordsets[1];
            this.columns.push({
              caption: 'Id partida',
              dataField: 'idPartida',
              allowEditing: false
            },{
              caption: 'Partida',
              dataField: 'partida',
              allowEditing: false
            }, {
                caption: 'Descripción',
                dataField: 'Descripción',
                allowEditing: false
              }
            );
            this.fillTable(this.partidas);
          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  fillTable(partidas) {
    let conta = 0;
    Object.keys(partidas[0]).forEach((k, i, arr) => {
      if (k !== 'noParte' && k!== 'partida' && k !== 'Descripción' && k !== 'foto' && k !== 'idPartida' && k !== 'instructivo' && k !== 'rfcEmpresa' && k !== 'idCliente' && k !== 'numeroContrato' && k !== 'idClase' && k !== 'Resultado') {
        this.columns.push({
          caption: k,
          dataField: k,
          allowEditing: true
        });
      }
      conta++;
      if (conta === arr.length) {
        this.columns.push({
          caption: 'Venta total',
          dataField: 'Resultado',
          allowEditing: false
        });
      }
    });
    this.flagGrid = true;
  }

  // =============================== END PARTIDAS =================================

  onSelectionChanged($event) {
    this.selectValues = $event.selectedRowsData[0].idTipoObjeto;
    this.unidadContratoForm.controls.idTipoObjeto.setValue(
      this.selectValues
    );
    // this.proveedorContratoForm.controls.proveedor.setValue(
    //   this.selectValues
    // );
  }

  get gridBoxValue(): number {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: number) {
    this.gridSelectedRowKeys2 = value && [value] || [];
    this.gridBoxValue2 = value;
  }

  get gridSelectedRowKeys(): number[] {
    return this.gridSelectedRowKeys2;
  }

  set gridSelectedRowKeys(value: number[]) {
    this.gridBoxValue2 = value.length && value[0] || null;
    this.gridSelectedRowKeys2 = value;
  }

  closeWindow($event: any) {
    if ($event) {
      $event.instance.close();
    }
  }

  // /**
  //  * Actualiza un tipo unidad
  //  */
  updTipoUnidad() {
    // this.numero = 0;
    const data = {
      rfcEmpresa: this.unidadContratoForm.controls.rfcEmpresa.value,
      idCliente: this.unidadContratoForm.controls.idCliente.value,
      numeroContrato: this.unidadContratoForm.controls.numeroContrato.value,
      idTipoObjeto: this.unidadContratoForm.controls.idTipoObjeto.value,
      modelo: this.unidadContratoForm.controls.modelo.value,
      idConversion: this.unidadContratoForm.controls.idConversion.value,
      cantidad: this.unidadContratoForm.controls.cantidad.value
    };
    this.updateData('contrato/tipounidad/actualiza/unidad', data);
  }

  /**
   * @description Abre el dialog update-alert
   * @param url La Url para eliminar un documento
   * @param datos Los datos que se van a actualizar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
  updateData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(UpdateAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.ngOnInit();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

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
          moduloExcepcion: 'upd-unidad-contrato.component',
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
