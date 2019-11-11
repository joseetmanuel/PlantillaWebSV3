import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { IBuscador, TipoBusqueda, IGridOptions, IColumns, IColumnHiding, ICheckbox, IEditing, IColumnchooser, IExportExcel, ISearchPanel, IScroll, Toolbar, Color, TiposdeFormato, TiposdeDato, IObjeto } from 'src/app/interfaces';
import { Negocio } from 'src/app/models/negocio.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Label } from 'ng2-charts';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import { CambiaConfiguracionFooter, ReseteaFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { ChartComponent } from 'ng-apexcharts';
import { SessionInitializer } from 'src/app/services/session-initializer';
import { BaseService } from 'src/app/services/base.service';
import { Alarms } from 'src/app/gps/enum/alarms.enum';
import { GPSService } from '../../services/gps.service';

@Component({
  selector: 'app-sel-ficha-tecnica',
  templateUrl: './sel-ficha-tecnica.component.html',
  styleUrls: ['./ficha-tecnica.component.scss'],
})

export class SelFichaTecnicaComponent implements OnInit {

  data: boolean;

  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  claveModulo = 'app-sel-ficha-tecnica';
  loading: boolean;
  widthBarServicio = '0%';

  subsNegocio: Subscription;

  buscador: IBuscador = {
    parametros: {
      contratos: '',
      idClase: ''
    },
    tipoBusqueda: TipoBusqueda.parqueVehicular,
    isActive: true
  };
  idClase: any;
  modulo: any;
  contratoActual: any;
  contratosSeleccionados: any;
  breadcrumb: any[];

  fechaInicio = moment().subtract(30, 'days').format('YYYY/MM/DD');

  // Datos objeto
  IObjeto: any = {
    idObjeto: null,
    Foto: null,
    Modelo: null,
    Placas: null,
    Submarca: null,
    VIN: null,
    idCliente: null,
    idTipoObjeto: null,
    numeroContrato: null,
    numeroEconomico: null,
    rfcEmpresa: null,
    fotoPrincialUrl: null,
    deviceid: null
  };

  IBannerObjeto: IObjeto[];

  // Progressbar Alarmas
  alarmas = [];

  // Para guardar el periodo de los reportes. (30 dias antes de la fecha actual)
  periodo = moment().locale('es').subtract(30, 'days').format('MMMM YYYY');

  objeto: any;
  urlFileServer = environment.fileServerUrl;

  // Parametros carousel fotos del objeto
  carouselConfig = {
    slidesToShow: 3,
    dots: false,
  };

  carouselConfigEspecialidades = {
    slidesToShow: 4,
    dots: false,
  };

  fotosObjeto = [];

  // Grafica kilometros

  dataKilometrosRecorriodos: Array<IDataKilometros> = [];
  promediosFlotilla = [];
  public barChartOptions: any;

  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;

  public barChartData: ChartDataSets[] = [];

  // Variables para catalogo de servicios
  fases = [];
  totalInversion = 0;
  especialidades: any[] = [];
  servicioActual: any;
  historicoOrdenes: any;

  // Variables para el grid de servicio actual
  gridOptions: IGridOptions;
  gridOptionsHistorico: IGridOptions;
  columns: IColumns[] = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[] = [];
  toolbarHistorico: Toolbar[] = [];
  Color: Color;
  datosevent: any;
  datoseventHistorico: any;

  indicadores: any = {};

  token = {
    filtros:
    {
      idTipoObjeto: 0,
      idObjeto: 0,
      idFase: 'null',
      idPaso: 'null',
      idZona: 0
    },
    titulo: '',
    color: ''
  }

  @ViewChild('contentFases') contentFases: ElementRef;
  bandCostoVenta: boolean;
  ventaCosto: any;
  moduloVenta: boolean;

  @ViewChild('chart') chart: ChartComponent;
  getStateUser: any;
  deviceId: string;
  diasUso = 0;
  /**
   *
   * @param dialog instancia  para generar un Mat dialog
   * @param router instancia para redireccionar o ir a otras rutas
   * @param siscoV3Service instancia para llamar los servicios
   */
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
    private httpClient: HttpClient,
    private sessionInitializer: SessionInitializer,
    private baseService: BaseService,
    private elementRef: ElementRef,
    private gpsService: GPSService
  ) {
    this.data = false;
    let tmpMes = '';
    this.barChartOptions = {
      responsive: true,
      scales: {
        xAxes: [
          {
            id: 'xAxis1',
            type: 'category',
            ticks: {
              callback: function (label) {
                var dia = label.split(';')[0];
                return dia;
              },
              // fontColor: 'red'
            }
          },
          {
            id: 'xAxis2',
            type: "category",
            gridLines: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              callback: function (label) {
                const dia = label.split(';')[0];
                const mes = label.split(';')[1];

                if (tmpMes !== mes) {
                  tmpMes = mes
                  return tmpMes;
                } else {
                  return '';
                }
              },
              display: true
            }
          }
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Km'
            }
          }
        ]
      },
    };
  }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      this.getStateUser = this.baseService.getUserData();
      const contrato = this.baseService.getContractData();

      this.idClase = contrato.claseActual;
      this.modulo = Negocio.GetModulo(this.claveModulo, this.getStateUser.permissions.modules, this.idClase);
      const htmlScriptElement = document.createElement('script');
      htmlScriptElement.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
      this.elementRef.nativeElement.appendChild(htmlScriptElement);

      this.activatedRoute.params.subscribe(parametros => {
        this.IObjeto.idObjeto = parametros.idObjeto;
        this.IObjeto.idTipoObjeto = parametros.idTipoObjeto;
        this.IObjeto.numeroContrato = parametros.numeroContrato;
        this.IObjeto.idCliente = parametros.idCliente;
        this.IObjeto.rfcEmpresa = parametros.rfcEmpresa;
        this.IObjeto.idTipoObjeto = parametros.idTipoObjeto;
        this.IBannerObjeto = [
          {
            idClase: this.idClase,
            idObjeto: parametros.idObjeto,
            idCliente: parametros.idCliente,
            numeroContrato: parametros.numeroContrato,
            idTipoObjeto: parametros.idTipoObjeto,
            rfcEmpresa: parametros.rfcEmpresa
          }];
        this.moduloVenta = false;


        if (this.modulo.camposClase.find(x => x.nombre === 'BotonVenta')) {
          this.moduloVenta = true;
        }

        this.contratosSeleccionados = contrato.contratosSeleccionados;

        this.ConfigurarFooter();
        this.ConfigParamsDataGrid();
        this.GetDatosObjeto();
        this.GetFasesServicio();
        this.GetObjetoEspecialidades();
        this.GetSolicitudServicioActual();
        this.GetSolicitudHistoricoOrdenes();
        if (this.modulo.breadcrumb) {
          this.breadcrumb =
            Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
              [{ idObjeto: this.IObjeto.idObjeto, idTipoObjeto: this.IObjeto.idTipoObjeto, rfcEmpresa: this.IObjeto.rfcEmpresa, idCliente: this.IObjeto.idCliente, numeroContrato: this.IObjeto.numeroContrato }]);
        }

      });
    }
  }

  /*
    Se toma la configuración de que se bloquee la apertura y no realice cambios sobre el footer
  */
  ConfigurarFooter() {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(ContratoMantenimientoEstatus.todos, false, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)
    ));
  }

  /**
   * @description Configuracion del data grid de proveedores.
   * @author Andres Farias
   */
  ConfigParamsDataGrid() {
    this.columns = [
      {
        caption: 'Cliente',
        dataField: 'nombreCliente',
        width: 150
      },
      {
        caption: 'Solicitud',
        dataField: 'idSolicitud'
      },
      {
        caption: 'Número de la orden',
        dataField: 'numeroOrden'
      },
      {
        caption: 'Número económico',
        dataField: 'numeroEconomico'
      },
      {
        caption: 'Tipo de solicitud',
        dataField: 'tipoSolicitud'
      },
      {
        caption: 'Fecha creación',
        dataField: 'fechaOrden',
        dataType: TiposdeDato.datetime,
        format: TiposdeFormato.dmyt
      },
      {
        caption: 'Comentarios',
        dataField: 'comentarios',
        format: TiposdeFormato.currency
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
    this.Color = { color: 'gris' };

    this.toolbar = [];

    if (this.modulo.camposClase.find(x => x.nombre === 'verOrdenActual')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          text: 'Ver',
          onClick: this.EventButtonDataGrid.bind(this, 'ver')
        }, visible: false,
        name: 'simple'
      });
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'verHistoricoOrden')) {
      this.toolbarHistorico.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          text: 'Ver',
          onClick: this.EventButtonDataGridHistorico.bind(this, 'ver')
        }, visible: false,
        name: 'simple'
      });
    }


  }

  fnGetBuscadorParameters(_contractArray:
    { forEach: (arg0: (element: { rfcEmpresa: string; idCliente: string; numeroContrato: string; }) => void) => void; }): string {
    let _xmlResult = '';
    let _bodyString;
    if (_contractArray !== null) {
      _contractArray.forEach((element: { rfcEmpresa: string; idCliente: string; numeroContrato: string; }) => {
        _bodyString +=
          '<contrato>' +
          '<rfcEmpresa>' + element.rfcEmpresa + '</rfcEmpresa>' +
          '<idCliente>' + element.idCliente + '</idCliente>' +
          '<numeroContrato>' + element.numeroContrato + '</numeroContrato>' +
          '</contrato>';
      });
    }
    _xmlResult =
      '<contratos>' +
      _bodyString +
      '</contratos>'
    return _xmlResult;
  }

  GetDatosObjeto() {
    this.loading = true;
    this.fotosObjeto = [];
    this.siscoV3Service.getService('objeto/getObjetoFichaTecnicaPorIdObjeto?idClase=' + this.idClase + '&&numeroContrato=' +
      this.IObjeto.numeroContrato + '&&idCliente=' + this.IObjeto.idCliente + '&&idObjeto=' + this.IObjeto.idObjeto
      + '&&rfcEmpresa=' + this.IObjeto.rfcEmpresa + '&&idTipoObjeto=' + this.IObjeto.idTipoObjeto)
      .subscribe((res: any) => {
        if (res.recordsets[0].length > 0) {
          if (res.recordsets[0][0].multaVigencia == '1900-01-01' || res.recordsets[0][0].multaVigencia == '') { res.recordsets[0][0].multaVigencia = null }
          if (res.recordsets[0][0].tarjetaCirculacionVigencia == '1900-01-01' || res.recordsets[0][0].tarjetaCirculacionVigencia == '') { res.recordsets[0][0].tarjetaCirculacionVigencia = null }
          if (res.recordsets[0][0].tenenciaVigencia == '1900-01-01' || res.recordsets[0][0].tenenciaVigencia == '') { res.recordsets[0][0].tenenciaVigencia = null }
          if (res.recordsets[0][0].placaVigencia == '1900-01-01' || res.recordsets[0][0].placaVigencia == '') { res.recordsets[0][0].placaVigencia = null }
          if (res.recordsets[0][0].seguroVigencia == '1900-01-01' || res.recordsets[0][0].seguroVigencia == '') { res.recordsets[0][0].seguroVigencia = null }
          if (res.recordsets[0][0].verificacionVigencia == '1900-01-01' || res.recordsets[0][0].verificacionVigencia == '') { res.recordsets[0][0].verificacionVigencia = null }
          this.objeto = res.recordsets[0][0];
          if (this.objeto) {

            // obtener la ultima ubicacion del objeto
            if (this.objeto.deviceid) {
              if (this.objeto.deviceid[0]) {
                this.gpsService.getService(`vehiculo/UltimaUbicacion?deviceid=${this.objeto.deviceid[0]}`)
                  .subscribe((r: any) => {
                    if (r.recordsets[0][0]) {
                      if (r.recordsets[0][0].latitude) {
                        this.objeto.latitude = r.recordsets[0][0].latitude;
                        this.objeto.longitude = r.recordsets[0][0].longitude;
                        this.objeto.attributes = r.recordsets[0][0].attributes ? JSON.parse(r.recordsets[0][0].attributes) : null;
                        this.objeto.protocol = r.recordsets[0][0].protocol;
                        this.objeto.altitude = r.recordsets[0][0].altitude;
                        this.objeto.speed = r.recordsets[0][0].speed;
                        this.objeto.course = r.recordsets[0][0].course;
                        this.deviceId = this.objeto.deviceid[0];
                        this.ObtenerTelemetriaObjeto();
                      }
                    }
                  });
              }
            }
            this.ObtenerDocumentos();
          }
        }
        this.loading = false;
      }, err => {
        this.loading = false;
      });

  }

  ObtenerDocumentos() {
    const data = {
      documentos: [this.objeto.fotoPrincipal, this.objeto.placaIdFile, this.objeto.tarjetaCirculacionIdFile, this.objeto.tenenciaIdFile, this.objeto.verificacionIdFile, this.objeto.seguroIdFile, this.objeto.multaIdFile, this.objeto.fotoFrente, this.objeto.fotoDerecho, this.objeto.fotoIzquierda, this.objeto.fotoTrasera]
    }
    this.httpClient.post(`${this.urlFileServer}documento/GetDocumentosById`, data).subscribe(
      (res: any) => {
        this.FillDocumentos(res.recordsets);
      }, (error: any) => {
        this.Excepciones(error, 2);
      }
    );
  }

  FillDocumentos(res) {
    this.fotosObjeto = [];
    res.forEach((e, i, a) => {
      if (this.objeto.fotoPrincipal === e.idDocumento) {
        this.IObjeto.fotoPrincialUrl = e.path
      }
      else if (this.objeto.placaIdFile === e.idDocumento) {
        this.objeto.placaIdFileUrl = e.path
      }
      else if (this.objeto.tarjetaCirculacionIdFile === e.idDocumento) {
        this.objeto.tarjetaCirculacionIdFileUrl = e.path
      }
      else if (this.objeto.tenenciaIdFile === e.idDocumento) {
        this.objeto.tenenciaIdFileUrl = e.path
      }
      else if (this.objeto.verificacionIdFile === e.idDocumento) {
        this.objeto.verificacionIdFileUrl = e.path
      }
      else if (this.objeto.seguroIdFile === e.idDocumento) {
        this.objeto.seguroIdFileUrl = e.path
      }
      else if (this.objeto.multaIdFile === e.idDocumento) {
        this.objeto.multaIdFileUrl = e.path
      }
      else if (this.objeto.fotoFrente == e.idDocumento) {
        this.objeto.fotoFrente = e.path
        this.fotosObjeto.push(e.path);
        this.arrayUnique();
      }
      else if (this.objeto.fotoDerecho == e.idDocumento) {
        this.objeto.fotoDerecho = e.path
        this.fotosObjeto.push(e.path);
        this.arrayUnique();
      }
      else if (this.objeto.fotoIzquierda == e.idDocumento) {
        this.objeto.fotoIzquierda = e.path
        this.fotosObjeto.push(e.path);
        this.arrayUnique();
      }
      else if (this.objeto.fotoTrasera == e.idDocumento) {
        this.objeto.fotoTrasera = e.path
        this.fotosObjeto.push(e.path);
        this.arrayUnique();
      }
    });

  }

  ObtenerTelemetriaObjeto() {
    // Obtiene las alarmas de la unidad
    this.getAlarmasUnidad();

    // Obtener los kilometros recorridos de la unidad
    this.getKilometrosRecorridos();

    // Se obtienen los indicadores principales
    this.getIndicadoresPrincipales();
  }

  getKilometrosRecorridos() {
    this.fechaInicio = moment().subtract(30, 'days').format('YYYY/MM/DD');

    // Para guardar el periodo de los reportes. (30 dias antes de la fecha actual)
    this.periodo = moment().locale('es').subtract(30, 'days').format('MMMM YYYY');
    let dias = '<dias>';
    for (let index = 29; index >= 0; index--) {
      dias += '<dia>' + moment().subtract(index, 'days').format('YYYY/MM/DD') + '</dia>';
    }
    dias += '</dias>';
    this.loading = true;
    this.gpsService
      .postService(`vehiculo/GetKilometrosRecorridos`, {
        deviceid: this.deviceId,
        dias: dias,
        numeroContrato: this.objeto.numeroContrato[0],
        idCliente: this.objeto.idCliente[0],
        tipo: this.objeto.Clase
      })
      .subscribe((res: any) => {
        this.loading = false;
        const recorrido = res.recordsets[0] ? res.recordsets[0] : [];
        this.ConfigurarKilometrosRecorridos(recorrido);
      }, (err) => {
        console.log(err);
        this.loading = false;
      });

  }

  getAlarmasUnidad() {
    this.alarmas = [];
    this.loading = true;
    this.gpsService.getService('vehiculo/GetComportamiento?deviceid=' + this.deviceId)
      .subscribe((res: any) => {
        this.loading = false;
        if (res.err) {
          console.log(res);
        } else {
          // Alarmas
          if (res.recordsets[0][0]) {
            this.configurarAlarmas(res.recordsets[0][0]);
          }
        }
      }, error => {
        this.loading = false;
      });
  }

  getIndicadoresPrincipales() {
    const urlSummary = 'vehiculo/IndicadoresPrincipales?from=' + moment().subtract(30, 'days').toISOString() +
      '&to=' + moment().toISOString() + '&deviceId=' + this.deviceId;
    this.loading = true;
    this.gpsService.getService(urlSummary).subscribe(
      (res: any) => {
        this.loading = false;
        this.indicadores = res.recordsets[0][0];

        const result = res.recordsets[1];
        this.diasUso = result.diasUso;
      }, (err: any) => {
        this.loading = false;
        console.log(err);
      }
    );
  }

  arrayUnique() {
    // Si el array de fotos tiene objetos repetidos
    if (this.fotosObjeto) {
      this.fotosObjeto = this.fotosObjeto.filter((valorActual, indiceActual, arreglo) => {
        //Podríamos omitir el return y hacerlo en una línea, pero se vería menos legible
        return arreglo.findIndex(
          valorDelArreglo => JSON.stringify(valorDelArreglo) === JSON.stringify(valorActual)
        ) === indiceActual
      });
    }
  }

  ConfigurarAlarmas(alarmaTmp: any) {
    this.alarmas = [];
    for (const key in alarmaTmp) {
      if (alarmaTmp.hasOwnProperty(key)) {
        const element = alarmaTmp[key];
        this.alarmas.push({ key, value: element });
      }
    }

    this.alarmas = this.alarmas.map(alarma => {
      const v = Math.floor(Math.random() * Math.floor(3));
      switch (v) {
        case 0:
          alarma.type = 'success';
          break;
        case 1:
          alarma.type = 'info';
          break;
        case 2:
          alarma.type = 'warning';
          break;
        case 3:
          alarma.type = 'danger';
          break;
      }
      return alarma;
    });
  }

  configurarAlarmas(alarmaTmp: any) {
    this.alarmas = [];
    for (const key in alarmaTmp) {
      if (alarmaTmp.hasOwnProperty(key) && key !== 'Alarma') {
        if (alarmaTmp[key] !== 0) {
          const element: string = alarmaTmp[key];
          const k = Alarms[key];
          this.alarmas.push({ key: k, value: element });
        }
      }
    }

    this.alarmas = this.alarmas.map(alarma => {
      const v = Math.floor(Math.random() * Math.floor(3));
      switch (v) {
        case 0:
          alarma.type = 'success';
          break;
        case 1:
          alarma.type = 'info';
          break;
        case 2:
          alarma.type = 'warning';
          break;
        case 3:
          alarma.type = 'danger';
          break;
      }
      return alarma;
    });
  }

  ConfigurarKilometrosRecorridos(kilometros) {
    this.dataKilometrosRecorriodos = [];
    this.barChartData = [];
    // LLenar los datos de kilometros recorridos
    kilometros.forEach(kilometro => {
      if (kilometro) {
        this.dataKilometrosRecorriodos.push({
          dia: kilometro.dia,
          valor: kilometro.kilometros,
          festivo: kilometro.feriado,
          finDeSemana: kilometro.finSemana,
          mes: moment(kilometro.fecha).locale('es').format('MMMM')
        });
        this.promediosFlotilla.push(kilometro.promedioFlotilla);
      }
    });

    const data = this.dataKilometrosRecorriodos.map((dataK: IDataKilometros) => dataK.valor);
    const backgroundColor = this.dataKilometrosRecorriodos.map((dataK: IDataKilometros) => dataK.finDeSemana ? '#7BD3FF' : (dataK.festivo ? '#F7B924' : '#3F6AD8'));

    this.barChartData.push(
      {
        data: data,
        backgroundColor: backgroundColor,
        label: 'Kms por día'
      }
    );

    this.barChartData.push(
      {
        data: this.promediosFlotilla,
        label: 'Promedio Flotilla',
        backgroundColor: ['#DCE7FF']
      }
    );

    this.barChartLabels = this.dataKilometrosRecorriodos.map((dataK: IDataKilometros) => dataK.dia + ';' + dataK.mes);

  }

  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de la escecpción lanzada
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ficha-tecnica.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }


  GetFasesServicio() {
    this.siscoV3Service.getService('solicitud/GetFasesServicio?idClase=' + this.idClase + '&&numeroContrato=' +
      this.IObjeto.numeroContrato + '&&idCliente=' + this.IObjeto.idCliente + '&&idObjeto=' +
      this.IObjeto.idObjeto + '&idTipoObjeto=' + this.IObjeto.idTipoObjeto)
      .subscribe((res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.err, 3);
        } else {
          this.ventaCosto = res.recordsets[1][0];
          this.bandCostoVenta = true;
          this.fases = [];
          res.recordsets[0].forEach((element: IFases) => {
            if (element.nombre !== 'Solicitud'
              && element.nombre !== 'Aprobacion') {
              this.fases.push(element);
            }
          });
          this.totalInversion = 0;
          if (this.fases) {
            this.widthBarServicio = (100 / this.fases.length) + '';
            // this.fases.forEach((element: IFases) => {
            //   this.totalInversion += element.total;
            // });
            this.totalInversion = res.recordsets[1][0].costo;
          }
        }
      }, err => {
        this.loading = false;
        this.Excepciones(err, 1);
      });
  }

  validaCostoVenta(val) {
    if (val === '1') {
      this.bandCostoVenta = true;
      this.totalInversion = this.ventaCosto.costo;
    } else {
      this.bandCostoVenta = false;
      this.totalInversion = this.ventaCosto.venta;
    }
  }

  GetObjetoEspecialidades() {
    this.siscoV3Service.getService('objeto/getObjetoEspecialidades?idClase=' + this.idClase + '&&numeroContrato=' +
      this.IObjeto.numeroContrato + '&&idCliente=' + this.IObjeto.idCliente + '&&idObjeto=' +
      this.IObjeto.idObjeto + '&idTipoObjeto=' + this.IObjeto.idTipoObjeto)
      .subscribe((res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.err, 3);
        } else {
          this.especialidades = res.recordsets[0];
        }
      }, err => {
        this.loading = false;
        this.Excepciones(err, 1);
      });
  }

  GetSolicitudServicioActual() {
    this.siscoV3Service.getService('solicitud/GetSolicitudOrdenesActuales?idClase=' + this.idClase +
      '&idObjeto=' + this.IObjeto.idObjeto + '&idTipoObjeto=' + this.IObjeto.idTipoObjeto)
      .subscribe((res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.err, 3);
        } else {
          this.servicioActual = res.recordsets[0];
        }
      }, err => {
        this.loading = false;
        this.Excepciones(err, 1);
      });
  }

  GetSolicitudHistoricoOrdenes() {
    this.siscoV3Service.getService('solicitud/GetSolicitudHistoricoOrdenes?idClase=' + this.idClase +
      '&idObjeto=' + this.IObjeto.idObjeto + '&idTipoObjeto=' + this.IObjeto.idTipoObjeto)
      .subscribe((res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.err, 3);
        } else {
          this.historicoOrdenes = res.recordsets[0];
        }
      }, err => {
        this.loading = false;
        this.Excepciones(err, 1);
      });
  }

  EventButtonDataGrid($event: string) {
    switch ($event) {
      case 'ver':
        const solicitudes = [];
        this.datosevent.forEach((so: any) => {
          solicitudes.push({
            idSolicitud: so.idSolicitud,
            numeroOrden: so.numeroOrden,
            idLogoContrato: so.foto,
            rfcEmpresa: so.rfcEmpresa,
            idCliente: so.idCliente,
            numeroContrato: so.numeroContrato,
            idObjeto: so.idObjeto,
            idTipoObjeto: so.idTipoObjeto,
            idTipoSolicitud: so.idTipoSolicitud
          });
        });
        this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: solicitudes }));
        this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: solicitudes[0] }));
        this.router.navigateByUrl('/sel-solicitud');
        break;
    }
  }

  EventButtonDataGridHistorico($event: string) {
    switch ($event) {
      case 'ver':
        const solicitudes = [];
        this.datoseventHistorico.forEach((so: any) => {
          solicitudes.push({
            idSolicitud: so.idSolicitud,
            numeroOrden: so.numeroOrden,
            idLogoContrato: so.foto,
            rfcEmpresa: so.rfcEmpresa,
            idCliente: so.idCliente,
            numeroContrato: so.numeroContrato,
            idObjeto: so.idObjeto,
            idTipoObjeto: so.idTipoObjeto,
            idTipoSolicitud: so.idTipoSolicitud
          });
        });
        this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: solicitudes }));
        this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: solicitudes[0] }));
        this.router.navigateByUrl('/sel-solicitud');
        break;
      default:
        break;
    }
  }

  // evento que regresa las filas seleccionadas del datagrid
  DatosMessage($event: any) {
    this.datosevent = $event.data;
  }

  // evento que regresa las filas seleccionadas del datagrid
  DatosMessageHistorico($event: any) {
    this.datoseventHistorico = $event.data;
  }

  redirige(idFase, color) {
    this.token.filtros.idFase = idFase;
    this.token.filtros.idObjeto = this.IObjeto.idObjeto;
    this.token.filtros.idTipoObjeto = this.IObjeto.idTipoObjeto;
    this.token.titulo = idFase;
    this.token.color = color;
    this.router.navigateByUrl(`/sel-solicitud-paso/${btoa(JSON.stringify(this.token))}`);
  }


  obtieneDiasDesde() {
    return moment().diff(this.objeto.fixtime, 'day');
  }
}

interface IDataKilometros {
  dia: string;
  festivo: boolean;
  valor: number;
  finDeSemana: boolean;
  mes: string;
}

interface IFases {
  idFase: string;
  nombre: string;
  descripcion: string;
  total: number,
  type: string
}
