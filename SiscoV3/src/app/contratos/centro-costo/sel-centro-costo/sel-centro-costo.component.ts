import { Component, OnInit, OnDestroy } from '@angular/core';
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
  TiposdeDato,
  TiposdeFormato

} from '../../../interfaces';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DeleteAlertComponent } from '../../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../models/negocio.model';
import { Color } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';


@Component({
  selector: 'app-sel-centro-costo',
  templateUrl: './sel-centro-costo.component.html',
  styleUrls: ['./sel-centro-costo.component.scss']
})
export class SelCentroCostoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  modulo;
  claveModulo = 'app-sel-centro-costo';
  breadcrumb: any[];

  idCliente;
  rfcEmpresa;
  numeroContrato;
  state;
  band = false;

  subsNegocio: Subscription;

  datasets2;
  labels;
  lineChartColors2: Color[];
  options;

  ruta: any;
  datosevent: any;
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
  centroCostos = [];
  numero = 1;
  cantidades = {
    presupuesto: 0,
    centrosCosto: 0,
    gastado: {
      cantidad: 0,
      porsentaje: ''
    },
    restante: {
      cantidad: 0,
      porsentaje: ''
    }
  };
  centrosCosto;
  mesesGrafica;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            if (this.state === undefined) {
              this.idClase = state2.claseActual;
              this.state = state;
              this.loadData(this.state);
            }
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /*
    Se toma la configuración de que se bloquee la apertura y no realice cambios sobre el footer
  */
  ConfigurarFooter() {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(ContratoMantenimientoEstatus.todos, false, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)
    ));
  }

  grafica(meses) {
    this.datasets2 = [
      {
        label: '$',
        // tslint:disable-next-line:max-line-length
        data: [meses.enero, meses.febrero, meses.marzo, meses.abril, meses.mayo, meses.junio, meses.julio, meses.agosto, meses.septiembre, meses.octubre, meses.noviembre, meses.diciembre],
        // data: [46, 55, 59, 80, 81, 38, meses.julio, 59, 80],
        datalabels: {
          display: false,
        },
      }
    ];

    this.lineChartColors2 = [
      { // dark grey
        backgroundColor: 'rgba(48, 177, 255, 0.2)',
        borderColor: '#30b1ff',
        borderCapStyle: 'round',
        borderDash: [],
        borderWidth: 4,
        borderDashOffset: 0.0,
        borderJoinStyle: 'round',
        pointBorderColor: '#30b1ff',
        pointBackgroundColor: '#ffffff',
        pointHoverBorderWidth: 4,
        pointRadius: 6,
        pointBorderWidth: 5,
        pointHoverRadius: 8,
        pointHitRadius: 10,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#30b1ff',
      },
    ];

    // tslint:disable-next-line:max-line-length
    this.labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    this.options = {
      layout: {
        padding: {
          left: 0,
          right: 8,
          top: 0,
          bottom: 0
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            display: false,
            beginAtZero: true
          },
          gridLines: {
            display: false
          }
        }],
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            display: false
          }
        }]
      },
      legend: {
        display: false
      },
      responsive: true,
      maintainAspectRatio: false
    };
    this.band = true;
  }

  /**
   * @description Obtenemos los datos del contrato que se va a modificar
   * @returns Los datos son obtenidos y se ejecuta el metodo fillContratoData
   * @author Gerardo Zamudio González
   */
  getContatoData() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        'cliente/getContratoPorKeys?numeroContrato=' +
        this.numeroContrato +
        '&rfcEmpresa=' +
        this.rfcEmpresa +
        '&idCliente=' +
        this.idCliente +
        ''
      )
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.cantidades.presupuesto = res.recordsets[0][0].presupuesto;
            this.getCentroGastos();
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  loadData(state) {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        // this.numero = 0;
        this.idCliente = parametros.idCliente;
        this.rfcEmpresa = parametros.rfcEmpresa;
        this.numeroContrato = parametros.numeroContrato;
        this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

        if (this.modulo.breadcrumb) {
          // tslint:disable-next-line:max-line-length
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }]);
        }
        this.ConfigurarFooter();
        this.getContatoData();
        this.table();
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  getCentroGastos() {
    this.numero = 0;
    const year = new Date().getFullYear().toString();
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/getCentroCosto?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&anio=${year}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.centroCostos = res.recordsets[0];
          this.cantidades.centrosCosto = res.recordsets[1][0].presupuesto;
          this.centrosCosto = res.recordsets[1][0].centrosCosto;
          this.cantidades.gastado.cantidad = res.recordsets[2][0].gastadoCentroCosto;

          this.cantidades.gastado.porsentaje = (this.cantidades.gastado.cantidad / this.cantidades.presupuesto * 100).toFixed(2);

          this.cantidades.restante.cantidad = this.cantidades.presupuesto - this.cantidades.gastado.cantidad;
          this.cantidades.restante.porsentaje = (this.cantidades.restante.cantidad / this.cantidades.presupuesto * 100).toFixed(2);
          this.mesesGrafica = res.recordsets[2][0];
          this.grafica(this.mesesGrafica);
          
        }
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.add(senddata);
      } else if ($event === 'edit') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.edit(senddata);
      } else if ($event === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.delete(senddata);
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Obtenemos la data del componente 'grid-component'
   * @param $event Data del 'grid-component'
   * @returns Data en formato Json
   * @author Gerardo Zamudio González
   */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Función Agregar que rdirige a la pagina ins-centro-costo
   * @returns Redirige al la pagina ins-centro-costo
   * @author Gerardo Zamudio González
   */
  add(data) {
    try {
      this.router.navigateByUrl(`/ins-centro-costo/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Funcion Editar redirige a la pagina upd-centro-costo
   * @returns Redirige al la pagina upd-centro-costo
   * @author Gerardo Zamudio González
   */
  edit(data) {
    try {
      const rfcEmpresa = this.datosevent[0].rfcEmpresa;
      const idCliente = this.datosevent[0].idCliente;
      const numeroContrato = this.datosevent[0].numeroContrato;
      const idCentroCosto = this.datosevent[0].idCentroCosto;
      this.router.navigateByUrl(`upd-centro-costo/${rfcEmpresa}/${idCliente}/${numeroContrato}/${idCentroCosto}`);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @returns Abre el deleteDialog para eliminar el dato
   * @author Gerardo Zamudio González
   */
  delete(data) {
    try {
      let borrar = '';
      let cont = 0;
      const that = this;
      data.data.forEach((element, index, array) => {
        // tslint:disable-next-line:max-line-length
        borrar += `<Ids><idCliente>${element.idCliente}</idCliente><numeroContrato>${element.numeroContrato}</numeroContrato><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa><idCentroCosto>${element.idCentroCosto}</idCentroCosto></Ids>`;
        cont++;
        if (cont === array.length) {
          that.deleteData('contrato/deleteCentroCosto', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  table() {
    /*
    Columnas de la tabla
    */
    try {
      this.columns = [
        {
          caption: 'Nombre',
          dataField: 'nombre'
        },
        {
          caption: 'Presupuesto',
          dataField: 'presupuesto',
          format: TiposdeFormato.moneda
        },
        {
          caption: 'Total de Folios',
          dataField: 'totalDeFolios'
        },
        {
          caption: 'Gastado',
          dataField: 'gastado',
          format: TiposdeFormato.moneda
        },
        {
          caption: 'Restante',
          dataField: 'restante',
          format: TiposdeFormato.moneda
        }
      ];

      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Lista de centros de costo' };
      // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
      this.columnHiding = { hide: true };
      // ******************PARAMETROS DE PARA CHECKBOX**************** */
      this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
      // ******************PARAMETROS DE PARA EDITAR GRID**************** */
      this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/
      // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
      this.Columnchooser = { columnchooser: true };

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
  Parametros de Scroll
  */
      this.scroll = { mode: 'standard' };

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
        },
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 120,
            text: 'Administrar',
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
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog delete-alert
   * @param url La Url para eliminar un documento
   * @param datos Los datos que se van a eliminar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
  deleteData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.loadData(this.state);
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'sel-centro-costos.component',
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
