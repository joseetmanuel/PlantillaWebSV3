import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  IFileUpload, IColumns, IExportExcel, ISearchPanel, IScroll, Toolbar,
  IColumnHiding, ICheckbox, IEditing, IColumnchooser
} from 'src/app/interfaces';
import { DxTreeViewComponent } from 'devextreme-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BUTTONS_TOOLBAR } from '../enums';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { IProveedorEntidadDireccion } from '../interfaces';
import { Observable } from 'rxjs';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from 'src/app/models/negocio.model';
import { environment } from 'src/environments/environment';
import { MapStyle } from 'src/assets/maps/mapstyle';

@Component({
  selector: 'app-upd-proveedor-entidad',
  templateUrl: './upd-proveedor-entidad.component.html',
  styleUrls: ['./upd-proveedor-entidad.component.scss']
})
export class UpdProveedorEntidadComponent extends FormularioDinamico implements OnInit, OnDestroy {

  idProveedorEntidad: number;
  spinner = false;
  IUploadFile: IFileUpload;
  public newProveedorForm: FormGroup;
  public formValid = true;
  proveedorEntidadDatosEstaticos: any;
  direccionesProveedorEntidad: IProveedorEntidadDireccion[];
  rfcProveedor: string;
  @ViewChild(DxTreeViewComponent) treeView;
  viewerArray: any;
  breadcrumb: any[];
  idUsuario: number;

  // Variables para Redux
  private getStateNegocio: Observable<any>;
  private getStateAuth: Observable<any>;
  getState: Observable<any>;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-proveedor-entidad';
  idClase = '';
  modulo: any = {};

  // Maps
  public lat: number = null;
  public lng: number = null;
  public latDefault = 19.2515925;
  public lngDefault = -99.1908343;
  public latMap = 19.2515925;
  public lngMap = -99.1908343;
  public zoomDefault = 8;
  public zoom = 8;
  private map: any;
  public msgErrorPlace: string;
  public address = '';

  // Variables para direccion
  public municipios;
  public tipoVialidades;
  public tipoDirecciones;
  public tipoAsentamientos;
  public asentamiento: string;
  public clases: any[];
  public valCp = false;
  public asentamientos;
  public idPais;
  public idEstado;
  public idMunicipio;
  @ViewChild('codigoPostal') cp;
  subsNegocio: any;
  styles: any[] = [];

  constructor(private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router, private store: Store<AppState>) {
    super();

    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAuth = this.store.select(selectAuthState);

    this.activatedRoute.params.subscribe(parametros => {
      this.idProveedorEntidad = parametros.idProveedorEntidad;
    });


  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  ngOnInit() {
    this.styles = MapStyle.lightblue[0].maptheme;
    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.idClase = stateNegocio.claseActual;
      this.getStateAuth.subscribe((stateAutenticacion) => {
        if (stateAutenticacion.seguridad) {
          this.idUsuario = stateAutenticacion.seguridad.user.id;
          this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
          if (this.modulo.contratoObligatorio) {
            if (stateNegocio.contratoActual) {
              this.ConfigurarFooter(false);
            } else {
              this.ConfigurarFooter(true);
            }
          } else {
            this.ConfigurarFooter(false);
          }
        }
      });
    });

    this.GetPropiedadClase();

    this.GetTipoDireccion();
    this.GetTipoVialidad();
    this.GetTipoAsentamiento();

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

  // #region ConfigFormProveedorEntidad
  /**
   * @description  Función recursiva para devolver propiedades generales y de clase con sus hijos.
   * @author Andres Farias
   */
  ConfigFormProveedorEntidad() {
    this.idPais = this.proveedorEntidadDatosEstaticos.idPais;
    this.idEstado = this.proveedorEntidadDatosEstaticos.idEstado;
    this.idMunicipio = this.proveedorEntidadDatosEstaticos.idMunicipio;
    this.asentamiento = this.proveedorEntidadDatosEstaticos.asentamiento;
    this.lat = this.proveedorEntidadDatosEstaticos.lat;
    this.lng = this.proveedorEntidadDatosEstaticos.lon;

    this.newProveedorForm = new FormGroup({
      idUsuario: new FormControl(this.idUsuario),
      nombreComercial: new FormControl(this.proveedorEntidadDatosEstaticos.nombreComercial, [Validators.required]),
      rfcProveedor: new FormControl({ value: this.rfcProveedor, disabled: true }, [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(13)
      ]),
      personaContacto: new FormControl(this.proveedorEntidadDatosEstaticos.personaContacto, []),
      telefono: new FormControl(this.proveedorEntidadDatosEstaticos.telefono, []),
      email: new FormControl(this.proveedorEntidadDatosEstaticos.email, [Validators.email, Validators.required]),
      codigoPostal: new FormControl(this.proveedorEntidadDatosEstaticos.codigoPostal, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(5)
      ]),
      estado: new FormControl({ value: this.proveedorEntidadDatosEstaticos.idEstado, disabled: true }, [
        Validators.required
      ]),
      municipio: new FormControl(
        { value: this.proveedorEntidadDatosEstaticos.municipio, disabled: true },
        [Validators.required]
      ),
      idTipoAsentamiento: new FormControl(this.proveedorEntidadDatosEstaticos.idTipoAsentamiento, [Validators.required]),
      asentamiento: new FormControl(this.proveedorEntidadDatosEstaticos.asentamiento, [
        Validators.required
      ]),
      idTipoVialidad: new FormControl(this.proveedorEntidadDatosEstaticos.idTipoVialidad, [Validators.required]),
      vialidad: new FormControl(this.proveedorEntidadDatosEstaticos.vialidad, [Validators.required]),
      numeroExterior: new FormControl(this.proveedorEntidadDatosEstaticos.numeroExterior, []),
      numeroInterior: new FormControl(this.proveedorEntidadDatosEstaticos.numeroInterior, []),
      disponibilidad: new FormControl(this.proveedorEntidadDatosEstaticos.disponibilidad, [])
    });

    this.GetCp();
  }

  // #endregion

  // #region GetPropiedadClase

  /**
   * @description  Función recursiva para devolver propiedades generales y de clase con sus hijos.
   * @author Andres Farias
   */
  GetPropiedadClase() {
    // this.spinner = true;
    this.siscoV3Service.getService('proveedor/GetPropiedadesAll?idClase=' + this.idClase).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.GetPropiedades(res.recordsets[0]);

          this.siscoV3Service.getService('proveedor/GetProveedorEntidadValor?idProveedorEntidad='
            + this.idProveedorEntidad).subscribe((res2: any) => {
              if (res2.err) {
                this.Excepciones(res2.err, 4);
              } else if (res2.excepcion) {
                this.Excepciones(res2.excepcion, 3);
              } else {
                this.SetValuesUpd(res2.recordsets[0]);
                this.proveedorEntidadDatosEstaticos = res2.recordsets[1][0];

                this.rfcProveedor = this.proveedorEntidadDatosEstaticos.rfcProveedor;
                if (this.modulo.breadcrumb) {
                  this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(
                    this.modulo.breadcrumb,
                    this.idClase,
                    [{ rfcProveedor: this.rfcProveedor }, { idProveedorEntidad: this.idProveedorEntidad }]);
                }

                // ********* Se llena arreglo con las extensiones de los archivos que se podran cargar **************************

                const ext = ['.jpg', '.jpeg', '.png', '.pdf', '.JPG', '.JPEG', '.PNG', '.PDF'];

                // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
                this.tipoObjetoPropiedades.forEach(e => {
                  if (e.idTipoDato === 'File' || e.idTipoDato === 'Image') {
                    e.IUploadFile = {
                      path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
                      idModuloSeguridad: 1, multiple: false, soloProcesar: false
                      , extension: ext, titulo: '', descripcion: '', previsualizacion: true, tipodecarga: 'instantly'
                    };

                    if (e.valorPropiedad) {
                      e.IUploadFile.idDocumento = e.valorPropiedad[0];
                    }
                  }
                });

                this.ConfigFormProveedorEntidad();
              }
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
   * @description Regresa respuesta al subir un documento.
   * @param $event Resultado con los datos del documento del upload file.
   * @param index Indice del input del formulario dinamico.
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

  // #endregion

  // #region ActualizarTipoObjeto

  /**
   * @description Actualiza el tipo de objeto modificado.
   * @author Andres Farias
   */
  ActualizarTipoObjeto() {

    const data = this.newProveedorForm.value;
    data.rfcProveedor = this.rfcProveedor;
    data.idProveedorEntidad = this.idProveedorEntidad;
    data.idPais = this.idPais;
    data.idEstado = this.idEstado;
    data.idMunicipio = this.idMunicipio;
    data.lat = this.lat;
    data.lng = this.lng;
    data.idClase = this.idClase;

    this.ValuesFormUpd(this.tipoObjetoPropiedades, this.idProveedorEntidad);
    console.log(data);
    if (this.formDinamico.length > 0) {
      this.spinner = true;
      data.formDinamico = this.formDinamico;
      this.siscoV3Service.putService('proveedor/PutActualizaProveedorEntidad', data)
        .subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open('Se ha actualizado correctamente la Sucursal.', 'Ok', {
              duration: 2000
            });
            this.router.navigateByUrl('/upd-proveedor/' + this.rfcProveedor);
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

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
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

  // #region OBTENNER DATOS DIRECCION

  /**
   * @description Obtiene los tipos de direccion.
   * @author Andres Farias
   */
  GetTipoDireccion() {
    this.spinner = true;
    this.siscoV3Service.getService('common/GetTipoDireccion').subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipoDirecciones = res.recordsets[0];
        }
      },
      (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
        this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
          duration: 2000
        });
      }
    );
  }

  /**
   * @description Obtener la lista de tipo de vialidad para la dirección.
   * @author Andres Farias
   */
  GetTipoVialidad() {
    this.spinner = true;
    this.siscoV3Service.getService('common/getTipoVialidad').subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipoVialidades = res.recordsets[0];
        }
      },
      (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
        this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
          duration: 2000
        });
      }
    );
  }

  /**
   * @description Obtener la lista de tipo de asentamiento para la dirección.
   * @author Andres Farias
   */
  GetTipoAsentamiento() {
    this.spinner = true;
    this.siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipoAsentamientos = res.recordsets[0];
        }
      },
      (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      }
    );
  }

  /**
   * @description Obtener la direccion por medio del codigo postal ingresado del formulario.
   * @author Andres Farias
   */
  GetCp() {
    try {
      if (this.newProveedorForm.controls.codigoPostal.value) {
        this.spinner = true;
        this.siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.newProveedorForm.controls.codigoPostal.value
          })
          .subscribe(
            (res: any) => {
              this.spinner = false;
              if (res.err) {
                this.Excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.Excepciones(res.excepcion, 3);
              } else {
                if (res.recordsets[0] < 1) {
                  this.snackBar.open('El Código Postal no es valido', 'Ok', {
                    duration: 2000
                  });
                  this.valCp = true;
                  this.newProveedorForm.controls.codigoPostal.setValue('');
                } else {
                  this.valCp = false;
                  this.asentamientos = res.recordsets[0];
                  this.idPais = res.recordsets[0][0].idPais;
                  this.idEstado = res.recordsets[0][0].idEstado;
                  this.idMunicipio = res.recordsets[0][0].idMunicipio;
                  this.newProveedorForm.controls.estado.setValue(
                    res.recordsets[0][0].nombreEstado
                  );
                  this.newProveedorForm.controls.municipio.setValue(
                    res.recordsets[0][0].nombreMunicipio
                  );
                  this.newProveedorForm.get('asentamiento').enable();

                }
              }
            },
            (error: any) => {
              this.spinner = false;
              this.Excepciones(error, 2);
              this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
                duration: 2000
              });
            }
          );
      }
    } catch (error) {
      this.spinner = false;
      this.Excepciones(error, 1);
    }
  }

  OnKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  // #endregion

  // #region Funciones para el maps

  /**
   * @description evento que se ejecuta cada que se cambia el valor de los inputs de direccion.
   * @author Andres Farias
   */
  changeVialidad() {
    this.msgErrorPlace = '';
    if (this.newProveedorForm.controls.estado.value
      && this.newProveedorForm.controls.municipio.value
      && this.newProveedorForm.controls.asentamiento.value) {

      this.address = this.newProveedorForm.controls.vialidad.value
        + ' ' + this.newProveedorForm.controls.numeroExterior.value
        + ', ' + this.newProveedorForm.controls.asentamiento.value
        + ', ' + this.newProveedorForm.controls.codigoPostal.value
        + ', ' + this.newProveedorForm.controls.municipio.value
        + ', ' + this.newProveedorForm.controls.estado.value
        + ', CDMX';

      this.findPlace();
    } else {
      this.msgErrorPlace = 'Para buscar la Geolocalización, es necesario llenar por lo menos el estado, municipio y asentamiento.';
      this.lat = null;
      this.lng = null;
      this.latMap = this.latDefault;
      this.lngMap = this.lngDefault;
      this.zoom = this.zoomDefault;
      this.map.setCenter({ lat: this.latMap, lng: this.lngMap });
    }
  }

  markerDragEndd($event) {
    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
  }

  mapReady($event) {
    this.map = $event;

    if (this.proveedorEntidadDatosEstaticos.lat) {
      setTimeout(() => {
        this.lat = this.proveedorEntidadDatosEstaticos.lat;
        this.lng = this.proveedorEntidadDatosEstaticos.lng;
        this.latMap = this.proveedorEntidadDatosEstaticos.lat;
        this.lngMap = this.proveedorEntidadDatosEstaticos.lng;
        this.zoom = 15;
        this.map.setCenter({ lat: this.lat, lng: this.lng });
      }, 1000);
    }
  }

  /**
   * @description Buscar las coordenadas por medio de la direccion ingresada en el formulario.
   * @author Andres Farias
   */
  findPlace() {
    if (this.address) {
      this.msgErrorPlace = '';
      const geocoder = new google.maps.Geocoder();
      const self = this;
      geocoder.geocode({ address: this.address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results.length > 0) {
            const location = results[0].geometry.location;
            self.lat = location.lat();
            self.lng = location.lng();

            self.latMap = location.lat();
            self.lngMap = location.lng();
            self.zoom = 15;

            self.map.setCenter({ lat: self.lat, lng: self.lng });
          } else {
            self.msgErrorPlace = 'No se ha podido obtener la Geolocalización, favor de verificar su dirección.';
            self.lat = null;
            self.lng = null;
            self.latMap = self.latDefault;
            self.lngMap = self.lngDefault;
            self.zoom = self.zoomDefault;
            self.map.setCenter({ lat: self.latMap, lng: self.lngMap });
          }

        } else {
          self.msgErrorPlace = 'Hubo un error al buscar la Geolocalización.';
        }
      });
    }
  }
  // #endregion
}
