import { Component, OnInit, ViewChild } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IFileUpload } from '../../interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { Observable } from 'rxjs';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';


@Component({
  selector: 'app-ins-partida',
  templateUrl: './ins-partida.component.html',
  styleUrls: ['./ins-partida.component.scss'],
  providers: [SiscoV3Service]
})
export class InsPartidaComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-ins-partida';
  spinner = false;
  idTipoObjeto: number;
  breadcrumb: any;
  IUploadFile: IFileUpload;
  idClase: string;
  idUsuario: number;
  getStateNegocio: Observable<any>;
  getStateAutenticacion: Observable<any>;
  modulo: any = {};
  contratoActual: any;
  numeroContrato: string;
  idCliente: number;
  camposTipoCobro: any[] = [];
  rfcEmpresa: string;

  idTipoSolicitud: any = false;
  tipoSolicitud;
  tipo: any;
  gridDataSource: any;
  gridBoxValue2: string[];

  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store<AppState>) {
    super();
    this.spinner = true;
    this.activatedRoute.params.subscribe(parametros => {
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;
        this.store.dispatch(new CambiaConfiguracionFooter(new FooterConfiguracion(ContratoMantenimientoEstatus.conMantemiento,
          this.modulo.contratoObligatorio, this.modulo.multicontrato, false, true)));

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idTipoObjeto: this.idTipoObjeto }]);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
          this.rfcEmpresa = '';

        }

      });

      this.GetPartidas();
      this.GetTipoSolicitud();
    });

    // ********* Se llena arreglo con las extensiones de los archivos que se podran cargar **************************
    const ext = ['.jpg', '.jpeg', '.png', '.pdf', '.JPG', '.JPEG', '.PNG', '.PDF'];

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId, tipodecarga: 'instantly',
      idModuloSeguridad: 1, multiple: true, soloProcesar: false, extension: ext, titulo: '', descripcion: '', previsualizacion: true
    };

  }


  // #region get partidas
  /**
   * @description Función recursiva para devolver propiedades generales y de clase con sus hijos
   * @returns Propiedades por idClase
   * @author Edgar Mendoza Gómez
   */

  GetPartidas() {
    this.siscoV3Service.getService('partida/GetPropiedadesAll?idClase=' + this.idClase + '&idCliente='
      + this.idCliente + '&numeroContrato=' + this.numeroContrato).subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.GetPropiedades(res.recordsets[0]);
            this.ValidForm();

            this.GetTipoCobro();
          }
        }, (error: any) => {
          this.spinner = false;
        }
      );
  }

  // #endregion

  /**
   * @description Obtiene los tipos de cobro de la clase
   * @author Andres Farias
   */
  GetTipoCobro() {
    this.siscoV3Service.getService('partida/GetPartidaTipoCobro?idClase=' + this.idClase).subscribe((result: any) => {
      if (result.err) {
        this.Excepciones(result.err, 4);
      } else if (result.excepcion) {
        this.Excepciones(result.excepcion, 3);
      } else {
        this.camposTipoCobro = result.recordsets[0];
      }
    });
  }

  // #region ResultUploadFile

  /**
   * @description Carga de archivo
   * @param $event Detalle del archivo cargado
   * @param index Posición de la propiedad
   * @returns Resultado de la carga del archivo
   * @author Edgar Mendoza Gómez
   */

  ResultUploadFile($event, index: number) {

    if ($event.recordsets.length > 0) {
      this.tipoObjetoPropiedades[index].valorPropiedad = [$event.recordsets[0].idDocumento];

      this.ValidForm();
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  // #endregion


  insCreateXmlTipoSolicitud() {
    const that = this;
    let xml = ``;
    this.idTipoSolicitud.forEach((e, i, ar) => {
      // tslint:disable-next-line:max-line-length
      xml += `<solicitudes><idTipoSolicitud>${e.idTipoSolicitud}</idTipoSolicitud></solicitudes>`;
      if (i + 1 === ar.length) {
        that.AgregarPartida(xml);
      }
    });
  }

  // #region AgregarPartida
  /**
   * @description Función para agregar partida
   * @returns Respuesta si el insertar partida fue correcto o tuvo error
   * @author Edgar Mendoza Gómez
   */

  AgregarPartida(xml) {
    this.ValuesFormIns();
    if (this.formDinamico.length > 0) {
      // buscamos los campos de tipo costo que tenga de costo mayor a 0
      const found = this.camposTipoCobro.find((tipoCobro: any) => {
        return tipoCobro.costo > 0;
      });

      if (found) {
        this.spinner = true;

        this.siscoV3Service.postService('partida/PostInsPartida', {
          formDinamico: this.formDinamico, idTipoObjeto: this.idTipoObjeto,
          idClase: this.idClase, rfc: this.rfcEmpresa, idCliente: this.idCliente, numeroContrato: this.numeroContrato, idTipoSolicitud: xml
        }).subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.spinner = false;
            const idPartida = res.recordsets[0][0].idPartida;
            this.GuardarTipoCostos(idPartida);
          }
        },
          (error: any) => {
            this.Excepciones(error, 2);
            this.spinner = false;
          });
      } else {
        this.snackBar.open('Se debe de agregar por lo menos un tipo de cobro.', 'Ok', {
          duration: 2000
        });
      }
    } else {
      this.snackBar.open('Los campos con * son obligatorios.', 'Ok', {
        duration: 2000
      });
    }

  }

  /**
   * @description agrega tipos de cobro a una partida
   * @param idPartida Id de la partida para asigarle tipos de cobro
   * @author Andres Farias
   */
  GuardarTipoCostos(idPartida: number) {
    let tipoCostos = '<tiposCostos>';

    this.camposTipoCobro.forEach((tipocosto: any) => {
      const precio = tipocosto.costo === undefined ? 0 : tipocosto.costo;
      tipoCostos += '<tipocosto>';
      tipoCostos += '<idPartida>' + idPartida + '</idPartida>';
      tipoCostos += '<costo>' + precio + '</costo>';
      tipoCostos += '<idTipoCobro>' + tipocosto.idTipoCobro + '</idTipoCobro>';
      tipoCostos += '<idClase>' + this.idClase + '</idClase>';
      tipoCostos += '<idUsuario>' + this.idUsuario + '</idUsuario>';
      tipoCostos += '</tipocosto>';
    });

    tipoCostos += '</tiposCostos>';
    this.spinner = true;
    this.siscoV3Service.postService('partida/PostInsPartidaCosto', {
      costos: tipoCostos, idTipoObjeto: this.idTipoObjeto, idClase: this.idClase
    }).subscribe((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.snackBar.open('Se ha guardado correctamente el tipo de objeto.', 'Ok', {
          duration: 2000
        });
        this.router.navigateByUrl('/sel-partida/' + this.idTipoObjeto);
      }
    }, errorCosto => {
      this.Excepciones(errorCosto, 2);
      this.spinner = false;
    });
  }

  // #endregion

  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'add-cliente.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
      });

    } catch (err) {
    }
  }

  CambioInputCosto($event, index) {
    this.camposTipoCobro[index].costo = $event.value;
  }

  GetTipoSolicitud() {
    this.tipoSolicitud = [];
    this.siscoV3Service.getService(`solicitud/getSolicitudTipoSolicitud?idClase=${this.idClase}`).subscribe(
      (res: any) => {
        if (res.error) {
          this.Excepciones(res.error, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipo = res.recordsets[0];
          this.selectFillData(this.tipo);
          // this.tipoSolicitud = new ArrayStore({
          //   data: this.tipo,
          //   key: 'idTipoSolicitud'
          // });
        }
      }, (error: any) => {
        this.Excepciones(error, 2);
      }
    );
  }

  closeSelect($event) {
    this.idTipoSolicitud = $event.value
  }

  /**
    * @description Metodo de Debex para que el select se vea como una tabla
    * @param proveedores Todos los proveedores
    * @author Gerardo Zamudio González
    */
  selectFillData(tipoSolicitud) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoSolicitud',
      load() {
        const json = tipoSolicitud;
        return json;
      }
    });
  }

  get gridBoxValue(): string[] {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: string[]) {
    this.gridBoxValue2 = value || [];
  }

  /**
   * @description Asigna  el valor seleccionado al proveedorContratoForm
   * @param $event fila seleccionada
   * @author Gerardo Zamudio González
   */
  onSelectionChanged($event) {
    this.idTipoSolicitud = $event.selectedRowsData
  }

}
