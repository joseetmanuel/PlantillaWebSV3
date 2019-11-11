import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

import { SiscoV3Service } from './../../services/siscov3.service';
import {
  IBuscador, TipoBusqueda,
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
  IFileUpload,
  TiposdeDato,
  TiposdeFormato,
  IViewer, IViewertipo, IViewersize
} from './../../interfaces';
import { AppState, selectContratoState } from './../../store/app.states';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { ExcepcionComponent } from './../../utilerias/excepcion/excepcion.component';
import { BaseService } from '../../services/base.service';

import { InsOperadorComponent } from './../ins-operador/ins-operador.component';

@Component({
  selector: 'app-asignar-objeto',
  templateUrl: './asignar-objeto.component.html',
  styleUrls: ['./asignar-objeto.component.scss']
})
export class AsignarObjetoComponent implements OnInit, OnDestroy {
  @ViewChild(InsOperadorComponent) operadorBusqueda: InsOperadorComponent;
  getStateNegocio: Observable<any>;
  claveModulo = 'app-asignar-objeto';
  spinner = false;
  idUsuario: number;
  idClase: string;
  idCliente: number;
  titleClase: string;
  logo: string;
  modulo: any = {};
  breadcrumb: any;
  subscripcionNegocio: Subscription;
  /*variables para el contrato activo*/
  contratos: any[];
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  rfcEmpresa: string;
  idOperador: number;
  /** variables para el buscador de usuario */
  objeto: number;
  idTipoObjeto: number;
  objetoAsignado: any;
  objetoVigente: any;
  url: string;
  buscador: IBuscador = {
    parametros: {
      contratos: '',
      idClase: ''
    },
    tipoBusqueda: TipoBusqueda.parqueVehicular,
    isActive: true
  };
  IViewerObjeto: IViewer[];
  operador: any;
  operadorObjetos: any;
  tipoObjetos: any;
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

  /** variables para el form de usuario */
  objetoForm = new FormGroup({
    //idObjeto: new FormControl('', [Validators.required]),
    fechaAsignacion: new FormControl('', [Validators.required]),
    odometroAsignacion: new FormControl('', [Validators.required])
  });

  updObjetoForm = new FormGroup({
    idAsignacion: new FormControl('', [Validators.required]),
    fechaEntrega: new FormControl('', [Validators.required]),
    odometroEntrega: new FormControl('', [Validators.required])
  });


  constructor(private store: Store<AppState>,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private baseService: BaseService,
    private activatedRoute: ActivatedRoute) {
    this.getStateNegocio = this.store.select(selectContratoState);

    this.activatedRoute.params.subscribe(parametros => {
      this.idOperador = parametros.idOperador;
    });
  }

  ngOnInit() {
    this.spinner = true;
    this.url = environment.fileServerUrl;
    const usuario = this.baseService.getUserData();
    this.idUsuario = usuario.user.id;
    this.subscripcionNegocio = this.getStateNegocio.subscribe((stateN) => {

      if (stateN && stateN.claseActual) {
        this.contratoActual = stateN.contratoActual;
        this.idClase = stateN.claseActual;
        if (this.modulo.contratoObligatorio) {
          if (this.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;
          this.idCliente = this.contratoActual.idCliente;
          this.Grid();
          this.DataOperadorObjetos();
          this.buscador.parametros.contratos = this.fnGetBuscadorParameters(this.contratoActual);
          this.buscador.parametros.idClase = this.idClase;

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
        }
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
            [{ idOperador: this.idOperador }]);
        }
      }
    });
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
  /** funcion auxiliar para el buscador  */

  fnGetBuscadorParameters(contractArray): string {
    let _xmlResult = '';
    let _bodyString;
    if (contractArray !== null) {
      _bodyString =
        '<contrato>' +
        '<rfcEmpresa>' + contractArray.rfcEmpresa + '</rfcEmpresa>' +
        '<idCliente>' + contractArray.idCliente + '</idCliente>' +
        '<numeroContrato>' + contractArray.numeroContrato + '</numeroContrato>' +
        '</contrato>';
    }
    _xmlResult =
      '<contratos>' +
      _bodyString +
      '</contratos>';
    return _xmlResult;
  }

  Grid() {
    const pageSizes = [];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };
    this.exportExcel = { enabled: true, fileName: this.titleClase };
    this.columnHiding = { hide: true };
    this.Checkbox = { checkboxmode: 'single' };
    this.Editing = { allowupdate: false };
    this.Columnchooser = { columnchooser: true };
    this.scroll = { mode: 'standard' };
    this.searchPanel = {
      visible: true,
      width: 200,
      placeholder: 'Buscar...',
      filterRow: true
    };
    this.toolbar = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        visible: true
      }
    ];
  }

  DataOperadorObjetos() {
    this.columns = [
      {
        caption: 'Id',
        dataField: 'idObjeto',
        hiddingPriority: '0',
        width: 60
      },
      {
        caption: 'Foto',
        dataField: 'fotoPrincipal',
        hiddingPriority: '0',
        cellTemplate: 'foto'
      },
      {
        caption: 'Clase',
        dataField: 'clase',
        hiddingPriority: '0'
      },
      {
        caption: 'Marca',
        dataField: 'marca',
        hiddingPriority: '0'
      },
      {
        caption: 'Submarca',
        dataField: 'submarca',
        hiddingPriority: '0'
      },
      {
        caption: 'Modelo',
        dataField: 'modelo',
        hiddingPriority: '0'
      },
      {
        caption: 'Placa',
        dataField: 'placa',
        hiddingPriority: '0'
      },
      {
        caption: 'VIN',
        dataField: 'vin',
        hiddingPriority: '0'
      },
      {
        caption: 'Estatus',
        dataField: 'estatus',
        hiddingPriority: '0'
      },
      {
        caption: 'Fecha asignación',
        dataField: 'fechaAsignacion',
        dataType: TiposdeDato.datetime,
        format: TiposdeFormato.dmyt
      },
      {
        caption: 'Odómetro asig.',
        dataField: 'odometroAsignacion',
        hiddingPriority: '0'
      },
      {
        caption: 'Fecha entrega',
        dataField: 'fechaEntrega',
        dataType: TiposdeDato.datetime,
        format: TiposdeFormato.dmyt
      },
      {
        caption: 'Odómetro entrega',
        dataField: 'odometroEntrega',
        hiddingPriority: '0'
      }
    ];
    this.siscoV3Service.getService('operador/getAsignacionesOperador?idUsers=' + this.idOperador
      + '&numContrato=' + this.numeroContrato).subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.operador = res.recordsets[0];
            this.operadorObjetos = res.recordsets[1];
            if (this.operadorObjetos.length > 0) {
              this.siscoV3Service.getService('objeto/getObjetoId?idClase=' + this.idClase + '&numeroContrato='
                + this.numeroContrato + '&idCliente=' + this.idCliente).subscribe(
                  (result: any) => {
                    this.spinner = false;
                    if (result.err) {
                      this.Excepciones(result.err, 4);
                    } else if (result.excepcion) {
                      this.Excepciones(result.excepcion, 3);
                    } else {
                      this.tipoObjetos = result.recordsets[0];
                      this.operadorObjetos.forEach(element => {
                        this.tipoObjetos.forEach(tipo => {
                          if (element.idTipoObjeto === tipo.idTipoObjeto[0] && element.idObjeto === tipo.idObjeto) {
                            element.fotoPrincipal = tipo.fotoPrincipal;
                            element.marca = tipo.Marca;
                            element.submarca = tipo.Submarca;
                            element.clase = tipo.Clase;
                            element.combustible = tipo.Combustible;
                            element.vin = tipo.VIN;
                            element.placa = tipo.Placa;
                            element.modelo = tipo.modelo;
                          }
                        });
                      });
                    }
                  },
                  (error: any) => {
                    this.Excepciones(error, 2);
                  }
                );

            }

          }
        },
        (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        }
      );
  }


  GenerarEntrega($event) {
    this.objetoAsignado = null;
    if ($event) {
      this.objetoVigente = {
        submarca: $event.data[0].submarca,
        modelo: $event.data[0].modelo,
        fechaAsignacion: $event.data[0].fechaAsignacion,
        odometroAsignacion: $event.data[0].odometroAsignacion,
        fechaEntregaVigente: $event.data[0].fechaEntrega,
        odometroEntregaVigente: $event.data[0].odometroEntrega,
        iviewerVigente: [{
          idDocumento: $event.data[0].fotoPrincipal,
          tipo: IViewertipo.avatar,
          descarga: false,
          size: IViewersize.md
        }],
      };
      this.updObjetoForm.controls.idAsignacion.setValue($event.data[0].idAsignacion);
    }
  }

  GuardarObjeto() {
    this.spinner = true;
    const data = [];
    let fechaAsig;

    if (this.objetoForm.controls.fechaAsignacion.value) {
      fechaAsig = moment(
        this.objetoForm.controls.fechaAsignacion.value).format('YYYY-MM-DD');
    } else {
      fechaAsig = null;
    }

    data.push({
      idUsers: this.idOperador,
      idTipoObjeto: this.idTipoObjeto,
      idObjeto: this.objeto,
      fechaAsignacion: fechaAsig,
      odometroAsignacion: this.objetoForm.controls.odometroAsignacion.value,
      idFileAsignacion: null,
      fechaEntrega: null,
      odometroEntrega: null,
      idFileEntrega: null
    });

    this.siscoV3Service.postService('operador/postInsAsignacionOp', data[0])
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha asignado correctamente el vehículo', 'Ok', {
            duration: 2000
          });
          this.ngOnInit();
          this.objetoAsignado = null;
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });
  }

  ActualizarObjeto() {
    this.spinner = true;
    const data = [];
    let fechaEnt;
    if (this.updObjetoForm.controls.fechaEntrega.value) {
      fechaEnt = moment(this.updObjetoForm.controls.fechaEntrega.value).format('YYYY-MM-DD');
    } else {
      fechaEnt = null;
    }
    data.push({
      idAsignacion: this.updObjetoForm.controls.idAsignacion.value,
      fechaEntrega: fechaEnt,
      odometroEntrega: this.updObjetoForm.controls.odometroEntrega.value,
      idFileEntrega: null
    });
    this.siscoV3Service.postService('operador/postUpdAsignacionOp', data[0])
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha actualizado correctamente el operador.', 'Ok', {
            duration: 2000
          });
          this.ngOnInit();
          this.ResponseBuscador(null);
          this.objetoVigente = null;
          this.objetoAsignado = null;
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });

  }

  ResponseBuscador($event) {
    if ($event !== null) {
      this.objeto = $event.recordsets[0].idObjeto;
      this.idTipoObjeto = $event.recordsets[0].idTipoObjeto;
      this.objetoAsignado = $event.recordsets[0];
      /** validamos si el usuario ya esta seleccionado y ya no esta vigente */
      this.getObjetoActivo(this.objeto);
    }
  }

  getObjetoActivo(idObjeto: number) {
    this.operadorObjetos.forEach(element => {
      if (element.idObjeto === idObjeto && element.fechaEntrega === null && element.odometroEntrega === null) {

        this.objetoVigente = {
          submarca: element.submarca,
          modelo: element.modelo,
          fechaAsignacion: element.fechaAsignacion,
          odometroAsignacion: element.odometroAsignacion,
          fechaEntregaVigente: element.fechaEntrega,
          odometroEntregaVigente: element.odometroEntrega,
          iviewerVigente: [{
            idDocumento: element.fotoPrincipal,
            tipo: IViewertipo.avatar,
            descarga: false,
            size: IViewersize.md
          }],
        };

        this.objetoAsignado = null;
        this.updObjetoForm.controls.idAsignacion.setValue(element.idAsignacion);
      }
    });
  }


  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de  la escepción ocurrida
   * @returns exception
   * @author Sandra Gil Rosales
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
          moduloExcepcion: 'objeto-documento.component',
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
    this.subscripcionNegocio.unsubscribe();
  }

}
