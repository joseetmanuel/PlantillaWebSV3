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


@Component({
  selector: 'app-ins-partida-propia',
  templateUrl: './ins-partida-propia.component.html',
  providers: [SiscoV3Service]
})
export class InsPartidaPropiaComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-ins-partida-propia';
  spinner = true;
  idTipoObjeto: number;
  breadcrumb: any;
  IUploadFile: IFileUpload;
  idClase: string;
  idUsuario: number;
  idCliente: number;
  numeroContrato: string;
  getStateNegocio: Observable<any>;
  getStateAutenticacion: Observable<any>;
  modulo: any = {};
  contratoActual: any;
  rfc: string;

  constructor(private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private store: Store<AppState>) {
    super();
    this.activatedRoute.params.subscribe(parametros => {
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAutenticacion = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idTipoObjeto: this.idTipoObjeto }]);
        }

        this.numeroContrato = this.contratoActual.numeroContrato;
        this.idCliente = this.contratoActual.idCliente;
        this.rfc = this.contratoActual.rfcEmpresa;

      });

      this.store.dispatch(new CambiaConfiguracionFooter(new FooterConfiguracion(ContratoMantenimientoEstatus.sinMantenimiento,
        this.modulo.contratoObligatorio, this.modulo.multicontrato, true, true)));

      this.GetPartidas();
    });

    // ********* Se llena arreglo con las extensiones de los archivos que se podran cargar **************************
    const ext = ['.jpg', '.jpeg', '.png', '.pdf'];

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId, tipodecarga: 'instantly',
      idModuloSeguridad: 1, multiple: true, soloProcesar: false, extension: ext, titulo: '', descripcion: '', previsualizacion: true
    };
  }

  // #region get partidas

  /**
   * @description  Función recursiva para devolver propiedades generales y de clase con sus hijos
   * @returns Propiedades por idClase
   * @author Edgar Mendoza Gómez
   */

  GetPartidas() {
    this.siscoV3Service.getService('partida/GetPropiedadesAll?idClase='
      + this.idClase + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato).subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {

            this.GetPropiedades(res.recordsets[0]);
            this.ValidForm();
          }
        }, (error: any) => {
          this.spinner = false;
        }
      );
  }

  // #endregion

  // #region ResultUploadFile

  /**
   * @description Carga de archivo
   * @param $event se recibe el evento al subir archivo
   * @param index  se recibe index
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


  // #region AgregarPartidaPropia
  /**
   * @description Función para agregar partida propia
   * @returns Respuesta si el insertar partida propia fue correcto o tuvo error
   * @author Edgar Mendoza Gómez
   */

  AgregarPartidaPropia() {
    this.ValuesFormIns();

    if (this.formDinamico.length > 0) {
      this.spinner = true;

      this.siscoV3Service.postService('partida/PostInsPartidaPropia',
        {
          formDinamico: this.formDinamico, idTipoObjeto: this.idTipoObjeto,
          idClase: this.idClase, rfc: this.rfc, idCliente: this.idCliente, numeroContrato: this.numeroContrato
        }).subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open('Se ha guardado correctamente el tipo de objeto.', 'Ok', {
              duration: 2000
            });
            this.router.navigateByUrl('/sel-partida-propia/' + this.idTipoObjeto);
            this.spinner = false;
          }
        },
          (error: any) => {
            this.Excepciones(error, 2);
            this.spinner = false;
          });
    } else {
      this.snackBar.open('Los campos con * son obligatorios.', 'Ok', {
        duration: 2000
      });
    }

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

}
