import { Component, OnInit } from '@angular/core';
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
  } from '../../interfaces'
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';

@Component({
    selector: 'app-sel-disposicion',
    templateUrl: './sel-disposicion.component.html',
    styleUrls: ['./sel-disposicion.component.sass']
})
export class SelDisposicionComponent implements OnInit {
    // VARIABLES PARA SEGURIDAD
    claveModulo = 'app-sel-disposicion';
    idClase = '';
    modulo: any = {};
    // VARIABLES PARA NGRX
    getStateAutenticacion: Observable<any>;
    getStateNegocio: Observable<any>;

    idUsuarioComision: number;

    breadcrumb: any[];
    spinner = false;
    public loading: boolean;

    disposiciones: any[] = [];
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

    constructor( private store: Store<AppState>, private _siscoV3Service: SiscoV3Service, private snackBar: MatSnackBar,
        public dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router ) {
        this.spinner = true;
        this.getStateAutenticacion = this.store.select(selectAuthState);
        this.getStateNegocio = this.store.select(selectContratoState);

        this.activatedRoute.params.subscribe(parametros => {
            this.idUsuarioComision = parametros.idUsuarioComision;
        });
        
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
              this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idUsuarioComision: this.idUsuarioComision }] );
          }

          this.ConfigParamsDataGrid();
          this.getDisposicion();
        })
      })
      this.ConfigParamsDataGrid();
      
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
    

    getDisposicion(){
      this.loading = true;
      this._siscoV3Service.getService('comision/GetDisposicion?idUsuarioComision=' + this.idUsuarioComision).subscribe(
        (res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
              this.disposiciones = res.recordsets[0];
              this.loading = false
          }
        }, (error: any) => {
          this.loading = false
          this.Excepciones(error, 2);
        }
      )
    }


    ConfigParamsDataGrid() {
      this.columns = [
        {
          caption: "Nombre",
          dataField: "nombreCompleto"
        },
        {
          caption: "Folio",
          dataField: "idDisposicion"
        },
        {
          caption: "Monto",
          dataField: "montoDisposicion",
          dataType: TiposdeDato.number,
          format: TiposdeFormato.moneda
        },
        {
          caption: "Fecha",
          dataField: "fecha",
          dataType: TiposdeDato.date,
          format: TiposdeFormato.dmy
        },
        {
          caption: "Estatus",
          dataField: "estatus"
        },
        {
          caption: "PDF",
          dataField: "facturaPDF",
          cellTemplate: "pdf"
        },
        {
          caption: "XML",
          dataField: "facturaXML",
          cellTemplate: "xml"
        }
      ]
    
        
      //******************PARAMETROS DE PAGINACION DE GRID**************** */
      let pageSizes = [];
      pageSizes.push("100", "300", "500", "1000")
  
      //this.gridOptions = { paginacion: 10, pageSize:pageSizes}
  
      //******************PARAMETROS DE EXPORTACION**************** */
      this.exportExcel = { enabled: true, fileName: "Disposición de Comisiones" }
  
      //******************PARAMETROS DE SEARCH**************** */
      this.searchPanel = { visible: true, width: 200, placeholder: "Buscar...", filterRow: true }
  
      //******************PARAMETROS DE SCROLL**************** */
      this.scroll = { mode: "standard" }
      /*****************OCULTAR COLUMNAS**************** */
      this.columnHiding = { hide: false }
      /**************** CHECKBOX*********************************/
      this.Checkbox = { checkboxmode: 'none' }
      //******************PARAMETROS DE PARA EDITAR GRID**************** */
      this.Editing = { allowupdate: false, mode: 'batch' } //*cambiar a batch para editar varias celdas a la vez*/
      //******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
      this.Columnchooser = { columnchooser: true }
  
      //******************PARAMETROS DE TOOLBAR**************** */
      this.toolbar = []

      // if (this.modulo.camposClase.find(x => x.nombre === 'Disponer')) {
      //   this.toolbar.push(
      //     {
      //       location: 'after',
      //       widget: 'dxButton',
      //       locateInMenu: "auto",
      //       options: {
      //         width: 120,
      //         text: 'Disponer',
      //         onClick: this.receiveMessage.bind(this, 'cobrar')
      //       },
      //       visible: false,
      //       name: "simple"
      //     }
      //   )
      // }
    }

    receiveMessage($event) {
      this.evento = $event.event;
      if ($event === 'cobrar') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        
      } 
    }
    

    datosMessage($event) {
      this.datosevent = $event.data;
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
