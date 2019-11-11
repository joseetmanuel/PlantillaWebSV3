import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { IFileUpload } from 'src/app/interfaces';
import { DxTreeViewComponent } from 'devextreme-angular';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { Observable } from 'rxjs';
import { AppState, selectContratoState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';

@Component({
  selector: 'app-upd-tipoobjeto',
  templateUrl: './upd-tipoobjeto.component.html',
  styleUrls: ['./upd-tipoobjeto.component.scss'],
  providers: [SiscoV3Service]
})
export class UpdTipoobjetoComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-upd-tipoobjeto';
  idTipoObjeto: number;
  spinner = false;
  IUploadFile: IFileUpload;
  public formValid = true;
  idClase: string;
  idDocumento: number;
  idUsuario: number;
  @ViewChild(DxTreeViewComponent) treeView;
  viewerArray: any;
  breadcrumb: any;
  getStateNegocio: Observable<any>;
  getStateAutenticacion: Observable<any>;
  modulo: any = {};
  contratoActual: any;

  constructor(private activatedRoute: ActivatedRoute,
              private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private router: Router,
              private store: Store<AppState>) {
    super();
    this.spinner = true;
    this.activatedRoute.params.subscribe(parametros => {
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAutenticacion = this.store.select(selectAuthState);


  }

  ngOnInit() {
    this.store.dispatch(new ReseteaFooter());
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.contratoActual = stateNegocio.contratoActual;

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idTipoObjeto: this.idTipoObjeto }]);
        }

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(true);
        } else {
          this.ConfigurarFooter(false);
        }
      });

      this.GetPropiedadesAll();
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
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  // #region get propiedades
  /**
   * @description Función recursiva para devolver propiedades generales y de clase con sus hijos
   * @returns Devuelve propiedades de tipo de objeto
   * @author Edgar Mendoza Gómez
   */

  GetPropiedadesAll() {
    this.siscoV3Service.getService('tipoObjeto/GetPropiedadesAll?idClase=' + this.idClase).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.GetPropiedades(res.recordsets[0]);

          this.siscoV3Service.getService('tipoObjeto/GetTipoObjetoValor?idTipoObjeto=' + this.idTipoObjeto + '&&idClase=' + this.idClase)
          .subscribe((res2: any) => {

            this.SetValuesUpd(res2.recordsets[0]);

            // ********* Se llena arreglo con las extensiones de los archivos que se podran cargar **************************

            const ext = ['.jpg', '.jpeg', '.png', '.pdf'];

            // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
            this.tipoObjetoPropiedades.forEach(e => {
              if (e.idTipoDato === 'File' || e.idTipoDato === 'Image') {
                e.IUploadFile = {
                  path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
                  idModuloSeguridad: 1, multiple: false, soloProcesar: false, tipodecarga: 'instantly'
                  , extension: ext, titulo: '', descripcion: '', previsualizacion: true
                };

                if (e.valorPropiedad) {
                  e.IUploadFile.idDocumento = e.valorPropiedad[0];
                }
              }
            });


          });
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

  // #region ActualizarTipoObjeto
  /**
   * @description Actualiza tipo objeto por su id.
   * @returns Devuelve éxito o error al modificar
   * @author Edgar Mendoza Gómez
   */

  ActualizarTipoObjeto() {

    this.ValuesFormUpd(this.tipoObjetoPropiedades, this.idTipoObjeto, undefined);
    if (this.formDinamico.length > 0) {
      this.spinner = true;
      this.siscoV3Service.putService('tipoObjeto/PutActualizaTipoObjeto', {formDinamico: this.formDinamico, idClase: this.idClase})
        .subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open('Se ha actualizado correctamente el tipo de objeto.', 'Ok', {
              duration: 2000
            });
            this.router.navigateByUrl('/sel-tipoobjeto');
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
