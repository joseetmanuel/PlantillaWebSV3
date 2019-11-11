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
  selector: 'app-ins-partida-masiva',
  templateUrl: './ins-partida-masiva.component.html',
  providers: [SiscoV3Service]
})
export class InsPartidaMasivaComponent implements OnInit, OnDestroy {
  claveModulo = 'app-ins-partida-masiva';
  datosevent;
  datos = [];
  idTipoObjeto: number;
  cargaMasivaColumns: IColumns[];
  valid = false;
  formDinamico: any;
  spinner = true;
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
    rfc: ''
  };
  sp = '[partida].[INS_PARTIDA_MASIVA_SP]';
  urlApi = 'partida/PostInsPartidaMasiva';
  acciones = [TipoAccionCargaMasiva.ACTUALIZAR, TipoAccionCargaMasiva.CONCATENAR, TipoAccionCargaMasiva.REEMPLAZAR];
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
        this.store.dispatch(new CambiaConfiguracionFooter(new FooterConfiguracion(ContratoMantenimientoEstatus.conMantemiento,
          this.modulo.contratoObligatorio, this.modulo.multicontrato, false, true)));

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{idTipoObjeto: this.idTipoObjeto}]);
        }

        this.parametrosSP.idClase = this.idClase;

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          // Agregamos valor a los parametros de carga masiva
          this.parametrosSP.idCliente = this.idCliente;
          this.parametrosSP.numeroContrato = this.numeroContrato;
          this.parametrosSP.rfc = this.contratoActual.rfc;

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;

        }

      });

      this.GetHeaders();
    });
  }

  // #region GetCampos

  /**
   * @description Muestra los campos que se requieren para poder insertar partidas
   * @returns Regresa los nombres de los campos necesarios para inserción
   * @author Edgar Mendoza Gómez
   */

  GetHeaders() {
    try {
      this.siscoV3Service.getService('partida/GetPartidaColumns?idTipoObjeto='
        + this.idTipoObjeto + '&&numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente
        + '&&idClase=' + this.idClase).subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              this.headers = res.recordsets[0];
              this.siscoV3Service.getService('partida/GetPropiedadesAll?idClase='
                + this.idClase + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato).subscribe((res2: any) => {
                  this.headersColumns = res2.recordsets[0].filter(idPadre => idPadre.idPadre === 0);
                  this.columnas = [];

                  if (this.headers.length > 0) {
                    // tslint:disable-next-line: forin
                    for (const data in this.headers[0]) {
                      let type: string;

                      const obligatorio = this.headersColumns.find(element => element.valor === data);

                      switch (this.headers[0][data]) {
                        case 'String': {
                          type = TypeData.STRING;
                          break;
                        }
                        case 'Numeric': {
                          type = TypeData.NUMBER;
                          break;
                        }
                        case 'Decimal': {
                          type = TypeData.FLOAT;
                          break;
                        }
                        case 'Date' || 'DateTime': {
                          type = TypeData.DATE;
                          break;
                        }
                        default: {
                          type = TypeData.STRING;
                          break;
                        }
                      }

                      if (this.headers[0][data] !== 'File' && this.headers[0][data] !== 'Image'
                        && data !== 'idPartida' && this.headers[0][data] !== null && this.headers[0][data] !== undefined) {
                        this.columnas.push({
                          nombre: data, tipo: type, longitud: 500, obligatorio: obligatorio.obligatorio,
                          descripcion: data.charAt(0).toUpperCase() + data.slice(1)
                        });

                      }
                    }
                  }
                });
            }
            this.spinner = false;
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  // #endregion

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
