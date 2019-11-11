import {
  Component,
  OnInit
} from '@angular/core';
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
  TiposdeFormato,
  IFileUpload
} from '../../interfaces'
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  Store
} from '@ngrx/store';
import {
  Observable
} from 'rxjs';
import {
  AppState,
  selectAuthState,
  selectContratoState
} from '../../store/app.states';
import {
  Negocio
} from '../../models/negocio.model';
import {
  ReseteaFooter,
  CambiaConfiguracionFooter
} from 'src/app/store/actions/permisos.actions';
import {
  FooterConfiguracion,
  ContratoMantenimientoEstatus
} from 'src/app/models/footerConfiguracion.model';
import {
  SiscoV3Service
} from 'src/app/services/siscov3.service';
import {
  MatDialog,
  MatSnackBar
} from '@angular/material';
import {
  ExcepcionComponent
} from 'src/app/utilerias/excepcion/excepcion.component';

@Component({
  selector: 'app-sel-comisiones-disponibles-internos',
  templateUrl: './sel-comisiones-disponibles-internos.component.html',
  styleUrls: ['./sel-comisiones-disponibles-internos.component.sass']
})
export class SelComisionesDisponiblesInternosComponent implements OnInit {
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-comisiones-disponibles-internos';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable < any > ;
  getStateNegocio: Observable < any > ;

  idUsuarioComision: number;

  breadcrumb: any[];
  spinner = false;
  public loading: boolean;

  archivoPDF;
  archivoXML;
  total = 0;
  subtotal = 0;
  totalComision = 0;
  totalFactura = 0;
  valid = true;

  fileEnabled = false;

  comisionesDisponibles: any[] = [];
  private datosevent: any[];
  IUploadFile: IFileUpload;
  gridOptions: IGridOptions;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  reportes: any[] = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;

  constructor(private store: Store < AppState > , private _siscoV3Service: SiscoV3Service,
    public dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router,
    private snackBar: MatSnackBar) {
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

        this.ConfigParamsDataGrid();
        this.obtenerComision()
        this.configFileUploader();
      })
    })
    // this.ConfigParamsDataGrid();
    // this.configFileUploader();
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


  cargarFactura() {
    this.fileEnabled = true;
  }

  configFileUploader() {
    const ext = ['.xml', '.XML', '.PDF', '.pdf'];
    this.IUploadFile = {
      tipodecarga: "",
      tipoDocumento: "Factura",
      path: this.idClase,
      idUsuario: 1,
      idAplicacionSeguridad: 11,
      idModuloSeguridad: 1,
      multiple: true,
      soloProcesar: false,
      extension: ext,
      titulo: 'A',
      descripcion: 'B',
      previsualizacion: false
    };
  }

  ResultUploadFile($event) {
    let total = 0,
      subtotal = 0
    let archivoXML, archivoPDF
    $event.recordsets.forEach(function (archivo) {
      if (archivo.tipo === "text/xml") {
        total = archivo.xml['cfdi:Comprobante']._attributes.Total
        subtotal = archivo.xml['cfdi:Comprobante']._attributes.SubTotal
        archivoXML = archivo.idDocumento
      }
      if (archivo.tipo === "application/pdf") {
        archivoPDF = archivo.idDocumento
      }
    })

    this.archivoPDF = archivoPDF
    this.archivoXML = archivoXML
    this.totalFactura = total

    if ($event.recordsets.length > 0) {
      this.valid = false;
      this.snackBar.open('Se han subido correctamente los archivos.', 'Ok', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 3000
      });
    }

  }

  ConfigParamsDataGrid() {
    this.columns = [{
        caption: "Contrato",
        dataField: "contrato"
      },
      {
        caption: "Mes",
        dataField: "periodo"
      },
      {
        caption: "Comision",
        dataField: "comisionGanada",
        dataType: TiposdeDato.number,
        format: TiposdeFormato.currency
      }
    ]


    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("100", "300", "500", "1000")

    //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

    //******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = {
      enabled: true,
      fileName: "Comisiones Vendedor Interno"
    }

    //******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = {
      visible: true,
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
      checkboxmode: 'multiple'
    }
    //******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = {
      allowupdate: false
    } //*cambiar a batch para editar varias celdas a la vez*/
    //******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = {
      columnchooser: true
    }

    //******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = []

    // if (this.modulo.camposClase.find(x => x.nombre === 'Disponer')) {
    //   this.toolbar.push({
    //     location: 'after',
    //     widget: 'dxButton',
    //     locateInMenu: "auto",
    //     options: {
    //       width: 94,
    //       text: 'Disponer',
    //       onClick: this.receiveMessage.bind(this, 'cobrar')
    //     },
    //     visible: false,
    //     name: "simple"
    //   })
    // }

    if (this.modulo.camposClase.find(x => x.nombre === 'Cargar Factura')) {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 128,
          text: 'Cargar Factura',
          onClick: this.receiveMessage.bind(this, 'cargarFactura')
        },
        visible: false,
        name: "simple"
      })
    }
  }

  receiveMessage($event) {
    this.evento = $event.event;
    
    if ($event === 'cobrar') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      if(this.validarFactura)
        this.Cobrar(senddata);
    }
    if ($event === 'cargarFactura'){
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.cargarFactura();
    }
  }

  validarFactura(){
    if (this.archivoPDF === undefined || this.archivoXML === undefined) {
      this.snackBar.open('Los archivos no han sido cargados.', 'Ok', {
        duration: 3000
      });

      return false;
    }
    let totalSeleccionado = 0;
    this.datosevent.forEach(function (element) {
      totalSeleccionado += element.comisionGanada
    });

    totalSeleccionado = parseFloat(totalSeleccionado.toFixed(2))

    if (totalSeleccionado != this.totalFactura) {
      this.snackBar.open('El total de la factura no coincide con el total de comisiones a cobrar.', 'Ok', {
        duration: 3000
      });

      return false;
    }
    return true;
  }

  Cobrar(data) {
    try {
      let cobrar = ''

      data.data.forEach(function ( element ) {
        
        element.ids.forEach( function ( idDeduccionMensualUsuario ){
          cobrar += '<Ids>'
          cobrar += '<idDeduccionMensualUsuario>' + idDeduccionMensualUsuario + '</idDeduccionMensualUsuario>'
          cobrar += '</Ids>'
        })

      })

      // this.agregarDisposicion(cobrar)
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  datosMessage($event) {
    this.datosevent = $event.data;
    let totalComision = 0
    this.datosevent.forEach(function (element) {
      totalComision += element.comisionGanada
    })

    this.totalComision = parseFloat(totalComision.toFixed(2))
  }

  agregarDisposicion(cobrar) {
    let params = {
      'tipoUsuario': 'Interno',
      'facturaXML': this.archivoXML,
      'facturaPDF': this.archivoPDF,
      'data': cobrar
    }

    this._siscoV3Service.postService('comision/PostInsDisposicion', params).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.router.navigateByUrl(
            '/sel-disposicion/' + this.idUsuarioComision
          );
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    )
  }

  obtenerComision() {
    this.loading = true;
    this._siscoV3Service.getService('comision/GetComisionesInternas?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.comisionesDisponibles = res.recordsets[0].comisionesDisponibles;
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    )
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
          moduloExcepcion: 'sel-reporte-integra-autoexpress-kilometraje-gps.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {}
  }

}
