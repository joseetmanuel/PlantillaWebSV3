import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
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
  IColumn,
  TiposdeDato,
  TiposdeFormato
} from '../../../interfaces'
import { BUTTONS_TOOLBAR } from '../../../proveedor/enums';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../../store/app.states';
import { Negocio } from '../../../models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';


@Component({
  selector: 'app-sel-reporte-integra-autoexpress-kilometraje-gps',
  templateUrl: './sel-reporte-integra-autoexpress-kilometraje-gps.component.html',
  styleUrls: ['./sel-reporte-integra-autoexpress-kilometraje-gps.component.scss'],
  providers: [SiscoV3Service]
})
export class SelReporteIntegraAutoexpressKilometrajeGpsComponent implements OnInit {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-reporte-integra-autoexpress-kilometraje-gps';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  private datosevent: any[];
  gridOptions: IGridOptions;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  spinner = false;
  evento: string;
  toolbar: Toolbar[];
  kilometrajes: any[] = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  public loading: boolean;
  breadcrumb: any[];
  headers = [];
  meses: any[] = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  
  constructor(private router: Router, public dialog: MatDialog,
    private snackBar: MatSnackBar, private _siscoV3Service: SiscoV3Service,
    private store: Store<AppState>) {
      this.GetReporteGps();

      this.spinner = true;
      this.getStateAutenticacion = this.store.select(selectAuthState);
      this.getStateNegocio = this.store.select(selectContratoState);
    }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) =>{
      this.getStateAutenticacion.subscribe((stateAutenticacion) =>{
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
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

        this.ConfigParamsDataGrid();
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
  
  GetReporteGps() {
    this.loading = true;
    this._siscoV3Service.getService('reporte/GetKilometraje').subscribe(
      (res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.kilometrajes = res.recordsets[0];
        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    )
  }


  // #region EventButtonDataGrid
  /*
  Nombre:         EventButtonDataGrid
  Autor:          Andres Farias
  Fecha:          02/04/2019
  Descripción:    CRUD del datagrid de proveedor
  Parametros:     
  Output:
  */
  EventButtonDataGrid($event: string) {
    if ($event === 'Editar') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.edit(senddata);
    }
  }
  // #endregion

  edit(data){
    this.router.navigateByUrl("/ins-reporte-integra-autoexpress-kilometraje-gps/" + this.datosevent[0].idContrato );
  }
  
  /*
  Abre el dialog delete-alert
  */
 
  DeleteData(ruta: any, data) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '60%',
        data: {
          ruta: ruta,
          data: data
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.GetReporteGps();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }


  ConfigParamsDataGrid() {
    this.columns = [
      {
        caption: "Contrato",
        dataField: "contrato"        
      },
      {
        caption: "Total de Kilometraje",
        dataField: "kilometraje",
        dataType: TiposdeDato.number
      }
    ]

    

    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("10", "25", "50", "100")

    //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

    //******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: "Reporte de Facturación GPS Integra-Autoexpress" }

    //******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: "Buscar...", filterRow: true }

    //******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: "standard" }
    /*****************OCULTAR COLUMNAS**************** */
    this.columnHiding = { hide: false }
    /**************** CHECKBOX*********************************/
    this.Checkbox = { checkboxmode: 'single' }
    //******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false } //*cambiar a batch para editar varias celdas a la vez*/
    //******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true }
    //******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.EDITAR,
          onClick: this.EventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.EDITAR)
        },
        name: "simple",
        visible: false
      }
    ]
  }
  // evento que regresa las filas seleccionadas del datagrid
  DatosMessage($event: any) {
    this.datosevent = $event.data
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

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }
  
}
