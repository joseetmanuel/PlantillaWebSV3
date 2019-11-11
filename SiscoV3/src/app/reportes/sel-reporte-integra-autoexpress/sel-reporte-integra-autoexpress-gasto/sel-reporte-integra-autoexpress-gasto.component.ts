import { Component, OnInit, Pipe, PipeTransform, HostListener, OnDestroy } from '@angular/core';
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
} from '../../../interfaces'
// import { BUTTONS_TOOLBAR } from '../../proveedor/enums';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { map, filter } from 'rxjs/operators';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
// import { IProveedor } from '../../proveedor/interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { AppState, selectAuthState, selectContratoState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Negocio } from '../../../models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { isArray } from 'util';
// import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
export let browserRefresh = false;

@Component({
  selector: 'app-sel-reporte-integra-autoexpress-gasto',
  templateUrl: './sel-reporte-integra-autoexpress-gasto.component.html',
  styleUrls: ['./sel-reporte-integra-autoexpress-gasto.component.scss'],
  providers: [SiscoV3Service]
})
export class SelReporteIntegraAutoexpressGastoComponent implements OnInit, OnDestroy {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-reporte-integra-autoexpress-gasto';
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
  evento: string;
  toolbar: Toolbar[];
  reportes: any[] = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  idTipoGasto: number;
  spinner = false;
  tipoGasto: string;
  public loading: boolean;
  breadcrumb: any[];
  meses: any[] = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  newInnerWidth: any;
  public pathURL: string;
  subscription: Subscription
  
  constructor(private router: Router, public dialog: MatDialog,
    private snackBar: MatSnackBar, private _siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute, private store: Store<AppState>) {
      this.subscription = router.events.subscribe((event) =>{
          if( event instanceof NavigationStart ){
              browserRefresh = !router.navigated;
          }
      })

      this.spinner = true;
      this.getStateAutenticacion = this.store.select(selectAuthState);
      this.getStateNegocio = this.store.select(selectContratoState);

      this.activatedRoute.params.subscribe(parametros => {
        this.idTipoGasto = parametros.idTipoGasto;

        this.GetTipoGasto();
        this.GetReporteGasto();

      });

      this.ConfigParamsDataGrid();
    }

  ngOnDestroy(){
    this.subscription.unsubscribe();
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

        var self = this

        if (this.modulo.breadcrumb) {
          this.modulo.breadcrumb.route.forEach( function( element ){
            if( element.url == "/sel-reporte-integra-autoexpress-gasto/{idTipoGasto}" ){
              if(isArray(element.label)){
                element.label.forEach( function( myLabel ) {
                  switch( parseInt( self.idTipoGasto.toString() ) ) {
                    case 1:
                      myLabel.label += " (Pagos Banco)"
                      break;
                    case 2:
                      myLabel.label += " (Seguro)"
                      break;
                    case 3:
                      myLabel.label += " (Facturación GPS)"
                      break;
                    case 4:
                     myLabel.label += " (Facturación)"
                     break;
                    default:
                      myLabel.label += ""
                      break;
                  }
                })
              }else{
                switch( parseInt( self.idTipoGasto.toString() ) ) {
                  case 1:
                    element.label += " (Pagos Banco)"
                    break;
                  case 2:
                    element.label += " (Seguro)"
                    break;
                  case 3:
                    element.label += " (Facturación GPS)"
                    break;
                  case 4:
                    element.label += " (Facturación)"
                   break;
                  default:
                    element.label += ""
                    break;
                }
              }
            }
          })
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{idTipoGasto: this.idTipoGasto}]);
        }

        this.ConfigParamsDataGrid();

        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd)
        ).subscribe( (navEnd: NavigationEnd) => {
            this.pathURL = navEnd.urlAfterRedirects;
        });
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

  GetTipoGasto(){
    this.loading = true;
    this._siscoV3Service.getService('reporte/GetTipoGasto?idTipoGasto=' + this.idTipoGasto ).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipoGasto = res.recordsets[0][0].tipoGasto;

        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    )
  }

  GetReporteGasto() {
    this.loading = true;
    this._siscoV3Service.getService('reporte/GetGastoById?idGasto=' + this.idTipoGasto ).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          Object.keys(res.recordsets[0]).map(function(key, index){
            res.recordsets[0][key].fechaInicio = new Date(res.recordsets[0][key].fechaInicio)
          })
          this.reportes = res.recordsets[0];
        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    )
  }


  enrutar(idTipoGasto){
    this.router.onSameUrlNavigation = 'reload'
    this.router.navigateByUrl('/sel-reporte-integra-autoexpress').then(
      () =>{
        this.router.navigated = false;
        this.router.navigate(['sel-reporte-integra-autoexpress-gasto', idTipoGasto])
      }
    )
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
          this.GetReporteGasto();
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
        dataField: "contrato",
        allowEditing: false
      }
    ]

    let fecha = new Date()
    if( fecha.getDate() > 28 ){
      fecha.setDate( fecha.getDate() - 4 )
    }
    let fechaFin = new Date()
    fechaFin.setFullYear( fechaFin.getFullYear() - 1 )
    while( fecha >= fechaFin ){
      this.columns.push({
        caption: this.meses[ fecha.getMonth() ] + "-" + fecha.getFullYear(),
        dataField: this.meses[ fecha.getMonth() ] + "-" + fecha.getFullYear(),
        format: TiposdeFormato.currency,
        validationRules: [{ type: 'numeric' }]
      })

      fecha.setMonth( fecha.getMonth() - 1 )
    }

    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("10", "25", "50", "100")

    //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

    //******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: "Reporte de Pago a " + this.tipoGasto + " Integra-Autoexpress" }

    //******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: "Buscar...", filterRow: true }

    //******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: "standard" }
    /*****************OCULTAR COLUMNAS**************** */
    this.columnHiding = { hide: false }
    /**************** CHECKBOX*********************************/
    this.Checkbox = { checkboxmode: 'none' }
    //******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: true, mode: 'batch' } //*cambiar a batch para editar varias celdas a la vez*/
    //******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true }

    //******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          // width: 90,
          // text: BUTTONS_TOOLBAR.AGREGAR,
          // onClick: this.EventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.AGREGAR)
        },
        visible: false
      }
    ]
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.newInnerWidth = event.target.innerWidth;
    if (this.newInnerWidth <= 768) {
      this.columnHiding = {hide: true};
    } else if (this.newInnerWidth > 768) {
      this.columnHiding = {hide: false};
    }
  }
  
  editevent(evento: any){
    let params = {
      idContrato: evento.editdata.key.idContrato,
      idTipoGasto: this.idTipoGasto,
      jsonGasto: ''
    }

    let jsonGasto = []
    for( var periodo in evento.editdata.newData){
      let per = periodo.split('-')
      jsonGasto.push( { mes: this.meses.indexOf( per[0] ) + 1, anio: per[1], valor: ( evento.editdata.newData[periodo] == "" ? 0 : evento.editdata.newData[periodo] ) } )

    }
    params.jsonGasto = JSON.stringify( jsonGasto )
        
    this._siscoV3Service.postService('reporte/PostGastoById', params).subscribe(
      (res: any) => {
        console.log(res)
        this.loading = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          
          this.reportes = res.recordsets[0];
        }
      }, (error: any) => {
        this.GetReporteGasto()
        this.loading = false;
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
          moduloExcepcion: 'sel-reporte-integra-autoexpress-gasto.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }
  
}
