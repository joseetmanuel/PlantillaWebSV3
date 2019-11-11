import { Component, OnInit, ViewChild } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { DxTreeViewComponent } from 'devextreme-angular';
import { IFileUpload } from '../../interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { AppState, selectContratoState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';

@Component({
  selector: 'app-ins-tipoobjeto',
  templateUrl: './ins-tipoobjeto.component.html',
  styleUrls: ['./ins-tipoobjeto.component.scss'],
  providers: [SiscoV3Service]
})
export class InsTipoObjetoComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-ins-tipoobjeto';
  IUploadFile: IFileUpload;
  public formValid = true;
  idClase: string;
  spinner = false;
  valorTipoObjeto: any;
  @ViewChild(DxTreeViewComponent) treeView;
  getStateNegocio: Observable<any>;
  getStateAutenticacion: Observable<any>;
  breadcrumb: any;
  idUsuario: number;
  modulo: any = {};
  contratoActual: any;

  constructor(private router: Router,
              private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private store: Store<AppState>) {
    super();
    this.spinner = true;
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAutenticacion = this.store.select(selectAuthState);
  }

  ngOnInit() {

    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.contratoActual = stateNegocio.contratoActual;

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
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
    // ********* Se llena arreglo con las extensiones de los archivos que se podran cargar **************************
    const ext = ['.jpg', '.jpeg', '.png', '.pdf'];

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
      idModuloSeguridad: 1, multiple: false, soloProcesar: false, tipodecarga: 'instantly'
      , extension: ext, titulo: '', descripcion: '', previsualizacion: true
    };
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

  // #region get Propiedades
  /**
   * @description Funcíon para visualizar sus propiedades
   * @returns Devuelve las propiedades dependiendo el id de clase
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
          this.ValidForm();
        }
      }, (error: any) => {
        this.spinner = false;
      }
    );
  }

  // #endregion

  // #region AgregarTipoObjeto
  /**
   * @description Inserción de tipo de objeto
   * @returns Devuelve error o exito al realizar inserción
   * @author Edgar Mendoza Gómez
   */

  AgregarTipoObjeto() {
    this.ValuesFormIns();
    if (this.formDinamico.length > 0) {
      this.spinner = true;
      this.siscoV3Service.postService('tipoObjeto/PostInsTipoObjeto', { formDinamico: this.formDinamico, idClase: this.idClase})
        .subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open('Se ha guardado correctamente el tipo de objeto.', 'Ok', {
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
