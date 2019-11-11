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
import { ActivatedRoute, Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { AppState, selectAuthState, selectContratoState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Negocio } from '../../../models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';



@Component({
  selector: 'app-ins-reporte-integra-autoexpress-kilometraje-gps',
  templateUrl: './ins-reporte-integra-autoexpress-kilometraje-gps.component.html',
  styleUrls: ['./ins-reporte-integra-autoexpress-kilometraje-gps.component.sass'],
  providers: [SiscoV3Service]
})
export class InsReporteIntegraAutoexpressKilometrajeGpsComponent implements OnInit {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-reporte-integra-autoexpress-kilometraje-gps';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  private datosevent: any[];
  gridOptions: IGridOptions;
  columnas: IColumn[] = [];
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  spinner = false;
  valid = false;
  kilometrajes: any[] = [];
  formDinamico: any;
  public loading: boolean;
  jsonUnidades: any[] = []
  breadcrumb: any[];
  idContrato: number;
  meses: any[] = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  parametrosSP = {
    idContrato: 0
  };
  sp = '[siscoV2].[INS_KILOMETRAJEBYID_SP]';
  urlApi = 'reporte/PostKilometrajeById';
  acciones = ['Agregar']
  
  constructor(private router: Router, public dialog: MatDialog,
    private snackBar: MatSnackBar, private _siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute, private store: Store<AppState>) {

      this.spinner = true;
      this.getStateAutenticacion = this.store.select(selectAuthState);
      this.getStateNegocio = this.store.select(selectContratoState);

      this.formDinamico = []
      this.activatedRoute.params.subscribe(parametros => {
        this.idContrato = parametros.idContrato;
        this.parametrosSP.idContrato = parametros.idContrato
      });

      this.columnas.push({ nombre: 'vin', tipo: TiposdeDato.string, longitud: 500, obligatorio: true, descripcion: 'VIN' })
      this.columnas.push({ nombre: 'kilometraje', tipo: TiposdeDato.number, longitud: 500, obligatorio: true, descripcion: 'Kilometraje' })

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
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{idContrato: this.idContrato}]);
        }

        // this.ConfigParamsDataGrid();
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
  
  response(evento){
    console.log(evento)
    this.router.navigate(['sel-reporte-integra-autoexpress-kilometraje-gps'])
  }

  responseFileUpload(evento){
    this.jsonUnidades = []
    this.valid = false;
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
