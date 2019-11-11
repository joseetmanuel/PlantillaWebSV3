import {
  Component,
  OnInit,
  SimpleChange
} from '@angular/core';
import {
  IBreadCrumb,
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
} from 'src/app/interfaces';
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
  MatDialog
} from '@angular/material';
import {
  ExcepcionComponent
} from 'src/app/utilerias/excepcion/excepcion.component';
import {
  Router
} from '@angular/router';

@Component({
  selector: 'app-home-comisiones',
  templateUrl: './home-comisiones.component.html',
  styleUrls: ['./home-comisiones.component.sass']
})
export class HomeComisionesComponent implements OnInit {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-home-comisiones';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable < any > ;
  getStateNegocio: Observable < any > ;

  spinner = false;
  public loading: boolean;
  private datosevent: any[];

  public breadcrumb: IBreadCrumb[];
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

  usuariosComision: any[] = [];


  constructor(private store: Store < AppState > , private router: Router,
    public dialog: MatDialog, private _siscoV3Service: SiscoV3Service) {
    this.spinner = true;
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    try {
      this.getStateAutenticacion.subscribe((stateAuth) => {
        if (stateAuth && stateAuth.seguridad) {
          this.getStateNegocio.subscribe((stateN) => {
            if (stateN && stateN.claseActual) {
              this.idClase = stateN.claseActual;

              this.modulo = Negocio.GetModulo(this.claveModulo, stateAuth.seguridad.permissions.modules, this.idClase);
              if (this.modulo.breadcrumb) {
                this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
              }

              this.ConfigParamsDataGrid()
              this.obtenerUsuariosComision()

              this.ConfigurarFooter(false);

              // if (stateN.contratoActual && this.modulo.contratoObligatorio) {
              //   this.ConfigurarFooter(false);
              // } else {
              //   this.ConfigurarFooter(true);
              // }

            }
          });
        }
      });


    } catch (error) {
      this.Excepciones(error, 1);
    }

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

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {}
  }


  obtenerUsuariosComision() {
    this.loading = true;
    this._siscoV3Service.getService('comision/GetUsuariosComisiones?AplicacionesId=11').subscribe(
      (res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.usuariosComision = res.recordsets[0];
          for (let i = 0; i < this.usuariosComision.length; i++) {
            if (i == 1) {
              this.usuariosComision[i].foto = null;
            } else {
              this.usuariosComision[i].foto = '17287';
            }

          }
          this.loading = false;
        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    )
  }


  ConfigParamsDataGrid() {
    this.columns = [{
        caption: "Nombre",
        dataField: "nombreCompleto"
      },
      {
        caption: "Tipo Usuario",
        dataField: "tipoUsuario"
      },
      {
        caption: "Perfil",
        dataField: "perfil"
      },
      {
        caption: "Nivel",
        dataField: "nivel",
        cellTemplate: 'foto'
      },
      {
        caption: "Comisión Acumulada",
        dataField: "comisionAcumulada",
        dataType: TiposdeDato.number,
        format: TiposdeFormato.moneda
      },
      {
        caption: "Comisión Disponible",
        dataField: "comisionDisponible",
        dataType: TiposdeDato.number,
        format: TiposdeFormato.moneda
      },
      {
        caption: "Contratos",
        dataField: "numContratos",
        dataType: TiposdeDato.number
      }, {
        caption: "Puntos",
        dataField: "puntos",
        dataType: TiposdeDato.number
      }
    ]

    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("100", "300", "500", "1000")

    this.gridOptions = { paginacion: 10, pageSize:pageSizes}

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
    };
    /*****************OCULTAR COLUMNAS**************** */
    this.columnHiding = {
      hide: false
    };
    /**************** CHECKBOX*********************************/
    this.Checkbox = {
      checkboxmode: 'multiple'
    };
    //******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = {
      allowupdate: false
    }; //*cambiar a batch para editar varias celdas a la vez*/
    //******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = {
      columnchooser: false
    };

    //******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [];

    this.toolbar.push({
      location: 'after',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        width: 90,
        text: 'Ver',
        onClick: this.receiveMessage.bind(this, 'view')
      },
      name: "simple",
      visible: false
    })

    this.toolbar.push({
      location: 'after',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        width: 124,
        text: 'Disposiciones',
        onClick: this.receiveMessage.bind(this, 'disposicion')
      },
      name: "simple",
      visible: false
    })
  }

  receiveMessage($event) {
    this.evento = $event.event;
    if ($event === 'view') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.View(senddata);
    }
    if ($event === 'disposicion') {
      const senddata = {
        event: $event,
        data: this.datosevent
      }
      this.disposicion(senddata);
    }
  }

  datosMessage($event) {
    this.datosevent = $event.data;
  }


  View(data) {
    var tipo = data.data[0].tipoUsuario
    if (tipo == "Externo") {
      this.router.navigateByUrl(`/sel-comisiones-externos/${data.data[0].idUsuarioComision}`);
    } else {
      this.router.navigateByUrl(`/sel-comisiones-internos/${data.data[0].idUsuarioComision}`);
    }
  }


  disposicion(data) {
    this.router.navigateByUrl('/sel-disposicion/' + data.data[0].idUsuarioComision)
  }
}
