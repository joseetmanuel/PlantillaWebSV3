import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { IProveedor } from '../interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { IFileUpload } from 'src/app/interfaces';
import { DxTreeViewComponent } from 'devextreme-angular';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from 'src/app/models/negocio.model';

@Component({
  selector: 'app-ins-proveedor-entidad',
  templateUrl: './ins-proveedor-entidad.component.html',
  styleUrls: ['./ins-proveedor-entidad.component.scss'],
  providers: [SiscoV3Service]
})
export class InsProveedorEntidadComponent extends FormularioDinamico implements OnInit, OnDestroy {
  public rfcProveedor: string;
  public tituloDireccion = 'Dirección';
  public tituloForm = 'Datos de la sucursal';
  public datosProveedorForm: FormGroup;
  public datosProveedorEntidadForm: FormGroup;
  public loading: boolean;
  public formValid = true;
  public datosProveedor: IProveedor;
  breadcrumb: any[];
  proveedorInterno: boolean;

  // Variables para Redux
  private getStateNegocio: Observable<any>;
  private getStateAuth: Observable<any>;
  getState: Observable<any>;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-proveedor-entidad';
  modulo: any = {};

  IUploadFile: IFileUpload;
  dataUsuario = { idUsuario: 1, idAplicacionSeguridad: 1, idModuloSeguridad: 1, idClase: 'Automovil' };
  spinner = false;
  valorTipoObjeto: any;
  tipoObjetoGroup: any;
  @ViewChild(DxTreeViewComponent) treeView;
  subsNegocio: any;

  constructor(private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>) {
    super();

    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAuth = this.store.select(selectAuthState);

    this.activatedRoute.params.subscribe(parametros => {
      this.rfcProveedor = parametros.rfcProveedor;
      this.GetProveedor(this.rfcProveedor);

      this.datosProveedorForm = new FormGroup({
        razonSocial: new FormControl({ value: '', disabled: true }),
        nombreComercial: new FormControl({ value: '', disabled: true }),
        personaContacto: new FormControl({ value: '', disabled: true }),
        telefono: new FormControl({ value: '', disabled: true }),
        rfcProveedor: new FormControl({ value: '', disabled: true })
      });

      /** datos estaticos del proveedor */
      this.datosProveedorEntidadForm = new FormGroup({
        rfcProveedor: new FormControl({ value: this.rfcProveedor, disabled: true }),
        nombreComercial: new FormControl('', [Validators.required]),
        personaContacto: new FormControl(''),
        telefono: new FormControl(''),
        email: new FormControl('', [Validators.email, Validators.required]),
        proveedorInt: new FormControl('', [Validators.required])
      });
    });
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  ngOnInit() {

    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.dataUsuario.idClase = stateNegocio.claseActual;
      this.getStateAuth.subscribe((stateAutenticacion) => {
        this.dataUsuario.idUsuario = stateAutenticacion.seguridad.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.dataUsuario.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(
            this.modulo.breadcrumb, this.dataUsuario.idClase, [{ rfcProveedor: this.rfcProveedor }]);
        }

        if (this.modulo.contratoObligatorio) {
          if (stateNegocio.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }
      });
    });

    // ********* Se llena arreglo con las extensiones de los archivos que se podran cargar **************************
    const ext = [];
    ext.push('.JPG', '.JPEG', '.PNG', '.jpg', '.jpeg', '.png');

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: this.dataUsuario.idClase, idUsuario: this.dataUsuario.idUsuario,
      idAplicacionSeguridad: this.dataUsuario.idAplicacionSeguridad,
      idModuloSeguridad: this.dataUsuario.idModuloSeguridad, multiple: false, soloProcesar: false
      , extension: ext, titulo: '', descripcion: '', previsualizacion: true, tipodecarga: 'instantly'
    };

    this.GetPropiedadAll();

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

  // #region GetProveedor
  /**
   * @description Obtiene los datos del proveedor por medio de rfcProveedor
   * @param rfcProveedor RFC del proveedor a buscar.
   * @author Andres Farias
   */
  GetProveedor(rfcProveedor: any) {
    this.loading = true;
    this.siscoV3Service.getService('proveedor/GetProveedorByRFC?rfcProveedor=' + rfcProveedor).subscribe((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.datosProveedor = res.recordsets[0][0];
      }
      this.loading = false;
    }, err => {
      this.Excepciones(err, 2);
      this.loading = false;
    });
  }

  // #endregion

  // #region GetPropiedadAll
  /**
   * @description Obtiene todas las propiedades estaticas y dinamicas del proveedorEntidad.
   * @author Andres Farias
   */
  GetPropiedadAll() {
    this.spinner = true;
    this.siscoV3Service.getService('proveedor/GetPropiedadesAll?idClase=' + this.dataUsuario.idClase).subscribe(
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
        this.Excepciones(error, 2);
      }
    );
  }
  // #endregion

  changeSelectionProveedorInterno($event) {
    this.proveedorInterno = $event.checked;
  }

  // #region AgregarProveedorEntidad
  /**
   * @description Guarda los datos del proveedor entidad, dinamicas y estaticas
   * @param $event Valor del evento con los datos del formulario de proveedor
   * @author Andres Farias
   */
  AgregarProveedorEntidad($event: any) {
    const proveedorEntidad: any = $event.data;
    proveedorEntidad.rfcProveedor = proveedorEntidad.rfcProveedor ? proveedorEntidad.rfcProveedor : this.rfcProveedor;
    proveedorEntidad.proveedorInterno = proveedorEntidad.proveedorInterno ? proveedorEntidad.proveedorInterno : this.proveedorInterno;
    delete proveedorEntidad.razonSocial;
    delete proveedorEntidad.idTipoPersona;
    this.ValuesFormIns();
    if (this.formDinamico.length > 0) {
      proveedorEntidad.formDinamico = this.formDinamico;
      this.loading = true;
      this.siscoV3Service.postService('proveedor/PostInsProveedorEntidad', proveedorEntidad)
        .subscribe(
          (res: any) => {
            this.loading = false;
            if (res.err) {
              // error tipo base de datos
              this.Excepciones(res.err, 4);
            } else if (res.excepcion) {
              // excepcion de conexion a la base de datos
              this.Excepciones(res.excepcion, 3);
            } else {
              this.snackBar.open('Se a guardado correctamente la Sucursal.', 'Ok', {
                duration: 2000
              });
              this.router.navigateByUrl('/upd-proveedor/' + this.rfcProveedor);
            }
          },
          (error: any) => {
            // error de no conexion al servicio
            this.Excepciones(error, 2);
            this.loading = false;
          }
        );
    } else {
      this.snackBar.open('Los campos con * son obligatorios.', 'Ok', {
        duration: 2000
      });
    }
  }
  // #endregion

  /**
   * @description Metodo para capturar el resultado de upload component.
   * @param $event valor del evento generado al terminar la carga de documentos.
   * @param index   indice de la lista de campos dinamicos.
   * @author Andres Farias
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

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.dataUsuario.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ins-proveedor-entidad.component',
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
