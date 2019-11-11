import { Component, OnInit } from '@angular/core';
import {
  IBreadCrumb, IGridOptions,
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
  TiposdeFormato,
  IDetail,
  IViewer,
  IViewertipo,
  IViewersize
} from 'src/app/interfaces';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-comisiones-internos',
  templateUrl: './comisiones-internos.component.html',
  styleUrls: ['./comisiones-internos.component.scss']
})
export class ComisionesInternosComponent implements OnInit {
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-comisiones-internos';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  spinner = false;
  public loading: boolean;
  private datosevent: any[];
  idUsuarioComision: number;
  comisiones: any[] = [];

  IViewer: IViewer[];
  public breadcrumb: IBreadCrumb[];
  gridOptions: IGridOptions;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  toolbardetail: Toolbar[];
  columnsdetail: IColumns[];
  reportes: any[] = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  Detail: IDetail;
  urlImagen: string;
  usuarioComision: any[] = [];

  public nombre: string;
  public rol: string;
  totales: any[] = [];

  algunos: any[] = [];
  constructor(private store: Store<AppState>,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private http: HttpClient,
    private _siscoV3Service: SiscoV3Service) {

    this.spinner = true;
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

    this.activatedRoute.params.subscribe(parametros => {
      this.idUsuarioComision = parametros.idUsuarioComision;
    });



  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
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
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{
            idUsuarioComision: this.idUsuarioComision
          }]);
        }
        this.GetComisionesById()
        this.ConfigParamsDataGrid()
        this.obtenerUsuarioComision();
      })
    })
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



  GetComisionesById() {
    this.loading = true;
    this._siscoV3Service.getService('comision/GetComisionesInternasByUser?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.comisiones = res.recordsets[0].comisiones;
          this.totales = res.recordsets[0];
        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    );
  }

  obtenerUsuarioComision() {
    this._siscoV3Service.getService('comision/GetUsuarioById?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          if (res.recordsets[0].length > 0) {
            this.usuarioComision = res.recordsets[0][0];
            
            this.IViewer = [
              {
                idDocumento: res.recordsets[0][0].avatar,
                tipo: IViewertipo.avatar,
                descarga: false,
                size: IViewersize.xs
              }
            ];
            
            this.http.get(`${environment.fileServerUrl}documento/GetDocumentoById?idDocumento=${res.recordsets[0][0].img}}]`).subscribe((res: any) => {
              if (res.err) {
                this.Excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.Excepciones(res.excepcion, 3);
              } else {
                this.urlImagen = res.recordsets[0].path;
              }
            });
          }
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    );
  }


  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'comisiones-internos.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) { }
  }

  receiveMessage($event) {
    this.evento = $event.event;
    if ($event === 'cobrar') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      //   this.Cobrar(senddata);
    }
  }

  ConfigParamsDataGrid() {
    this.columns = [{
      caption: "Mes",
      dataField: "periodo"
    },
    {
      caption: "Comisión Posible",
      dataField: "comisionPosible",
      dataType: TiposdeDato.number,
      format: TiposdeFormato.currency
    },
    {
      caption: "Comisión Obtenida",
      dataField: "comisionGanada",
      dataType: TiposdeDato.number,
      format: TiposdeFormato.currency
    }
    ]

    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("100", "300", "500", "1000")

    this.Detail= { detail: true }

    this.toolbardetail = []
    this.columnsdetail = [
      { caption: "Regla Deducción", dataField: "reglaDeduccion" },
      { caption: "Comisión Posible", dataField: "comisionPosible", dataType: TiposdeDato.number, format: TiposdeFormato.moneda },
      { caption: "Comisión Ganada", dataField: "comisionGanada", dataType: TiposdeDato.number, format: TiposdeFormato.moneda },
      { caption: "Porcentaje Deducción", dataField: "porcentajeDeduccion", dataType: TiposdeDato.number, format: TiposdeFormato.percent }
    ]
    //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

    //******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = {
      enabled: false,
      fileName: "Reporte de Pago a Integra-Autoexpress"
    }

    //******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = {
      visible: false,
      width: 200,
      placeholder: "Buscar...",
      filterRow: true
    }

    //******************PARAMETROS DE SCROLL**************** */
    this.scroll = {
      mode: "standard"
    }
    /*****************OCULTAR COLUMNAS**************** */
    this.columnHiding = {
      hide: false
    }
    /**************** CHECKBOX*********************************/
    this.Checkbox = {
      checkboxmode: 'none'
    }
    //******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = {
      allowupdate: false
    } //*cambiar a batch para editar varias celdas a la vez*/
    //******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = {
      columnchooser: false
    }

    //******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = []

  }
}
