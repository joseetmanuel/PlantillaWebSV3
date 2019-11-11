import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import {Location} from '@angular/common';
import {
  IColumn,
  TypeData,
  IColumns,
  TipoAccionCargaMasiva,
} from '../../interfaces';
import { AppState, selectContratoState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';

@Component({
  selector: 'app-ins-partida-costo-masivo',
  templateUrl: './ins-partida-costo-masiva.component.html',
  providers: [SiscoV3Service]
})
export class InsPartidaCostoMasivaComponent implements OnInit, OnDestroy {
  claveModulo = 'app-ins-partida-costo-masivo';
  datosevent;
  datos = [];
  idTipoObjeto: number;
  cargaMasivaColumns: IColumns[];
  valid = false;
  formDinamico: any;
  spinner = false;
  evento: string;
  headers = [];
  headersColumns = [];
  idClase: string;
  idCliente: number;
  numeroContrato: string;
  breadcrumb: any;
  getStateNegocio: Observable<any>;
  getStateAutenticacion: Observable<any>;
  contratoActual: any;
  modulo: any = {};

  /**
   * Variables que se mandan a carga masiva
   */
  public columnas: IColumn[] = [];
  parametrosSP = {
    idTipoObjeto: 0,
    numeroContrato: '',
    idCliente: 0,
    idClase: '',
    rfcProveedor: '',
    idUsuario: 0
  };
  sp = '[partida].[INS_PARTIDACOSTO_MASIVO_SP]';
  urlApi = 'partida/PostPartidaCostoMasivo';
  idTipoAccion = [TipoAccionCargaMasiva.ACTUALIZAR];
  tiposCobro: any;
  rfcProveedor: string;
  idUsuario: number;
  subsNegocio: any;


  constructor(private siscoV3Service: SiscoV3Service,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private location: Location,
              private router: Router,
              private store: Store<AppState>,
              private snackBar: MatSnackBar) {
    this.cargaMasivaColumns = [];
    this.formDinamico = [];
    this.activatedRoute.params.subscribe(parametros => {
      this.idTipoObjeto = parametros.idTipoObjeto;
      this.parametrosSP.idTipoObjeto = this.idTipoObjeto;
      this.rfcProveedor = parametros.rfcProveedor;
      this.parametrosSP.rfcProveedor = this.rfcProveedor;
    });
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAutenticacion = this.store.select(selectAuthState);

  }

  datosMessage($event) {
    this.datosevent = $event.data;
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  ngOnInit() {
    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.contratoActual = stateNegocio.contratoActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(
            this.modulo.breadcrumb, this.idClase, [{idTipoObjeto: this.idTipoObjeto}]);
        }

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (this.modulo.contratoObligatorio) {
          if (stateNegocio.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }

        this.parametrosSP.idClase = this.idClase;
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.parametrosSP.idUsuario = this.idUsuario;

      });

      this.GetTipoCobro();
    });
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

  /**
   * @description Obtiene los tipos de cobro de la clase para pintar los campos en el formulario
   * @author Andres Farias
   */
  GetTipoCobro() {
    this.spinner = true;
    this.siscoV3Service.getService('partida/GetPartidaTipoCobro?idClase=' + this.idClase).subscribe((result: any) => {
      this.spinner = false;
      if (result.err) {
        this.Excepciones(result.err, 4);
      } else if (result.excepcion) {
        this.Excepciones(result.excepcion, 3);
      } else {
        this.tiposCobro = result.recordsets[0];

        this.tiposCobro.forEach((tipo) => {
          this.columnas.push({
            nombre: tipo.nombre,
            tipo: TypeData.FLOAT,
            longitud: 500,
            obligatorio: true,
            descripcion: tipo.nombre
          });
        });
      }
    }, error => {
      this.spinner = false;
      this.Excepciones(error, 2);
    });
  }

  // #region datosExcel

  /**
   * @description Resultado de carga de excel
   * @param resp Respuesta de la carga de archivo
   * @returns Devuelve los valores con los que es cargado el excel
   * @author Edgar Mendoza Gómez
   */

  responseFileUpload(resp) {
    this.datos = [];
    this.valid = false;
  }

  reponse(res) {
    if (res.error) {
      this.Excepciones(res.error, 3);
    } else {
      this.location.back();
    }
  }
  // #endregion

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'clientes.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
