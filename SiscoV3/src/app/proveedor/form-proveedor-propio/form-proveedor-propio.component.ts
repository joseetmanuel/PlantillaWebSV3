import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors
} from '@angular/forms';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { IProveedor } from '../interfaces';
import { Observable } from 'rxjs';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';
import { MapStyle } from 'src/assets/maps/mapstyle';

@Component({
  selector: 'app-form-proveedor-propio',
  templateUrl: './form-proveedor-propio.component.html',
  styleUrls: ['./form-proveedor-propio.component.scss']
})
export class FormProveedorPropioComponent implements OnInit, OnDestroy {

  // tslint:disable-next-line: no-input-rename
  @Input('newProveedor') newProveedor: boolean;
  // tslint:disable-next-line: no-input-rename
  @Input('rfcProveedor') rfcProveedor: boolean;
  // tslint:disable-next-line: no-input-rename
  @Input('datosProveedor') datosProveedor: IProveedor;
  // tslint:disable-next-line: no-input-rename
  @Input('tituloDireccion') tituloDireccion: string;
  // tslint:disable-next-line: no-input-rename
  @Input('formValid') formValid: boolean;
  // tslint:disable-next-line: no-input-rename
  @Input('showMaps') showMaps: boolean;
  // tslint:disable-next-line: no-input-rename
  @Input('modulo') modulo: any;
  // tslint:disable-next-line: no-input-rename
  @Input('proveedorEntidad') proveedorEntidad: boolean;
  // tslint:disable-next-line: no-input-rename
  @Input('tituloForm') tituloForm: string;
  @Output() formProveedorEvent = new EventEmitter<any>();
  @ViewChild('codigoPostal') cp: any;
  @ViewChild('municipio') municipio: any;

  public newProveedorForm: FormGroup;

  public rfcProveedorEntidad: string;
  public empresa;
  public tipo = 2;
  public municipios;
  public tipoVialidades;
  public tipoAsentamientos;
  public asentamiento: string;
  public lengthRFC = 13;
  public checkedDireccionProeedor: boolean;

  public numero = 1;
  public clases: any[];
  public valCp = false;
  public asentamientos: any;
  public idPais: string;
  public idEstado: string;
  public idMunicipio: string;
  IUploadFile: IFileUpload;
  idDocumento: number;

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
  public styles: any[];

  // Variables para Redux
  private getStateNegocio: Observable<any>;
  private getStateAuth: Observable<any>;
  getState: Observable<any>;

  // Variables usuario y clase
  private idClase: string;
  private idUsuario: string;
  subsNegocio: any;

  constructor(private siscoV3Service: SiscoV3Service, public dialog: MatDialog,
              private snackBar: MatSnackBar, private store: Store<AppState>) {
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAuth = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.subsNegocio= this.getStateNegocio.subscribe((stateNegocio) => {
      this.idClase = stateNegocio.claseActual;
      this.getStateAuth.subscribe((state) => {
        if (state.seguridad && this.idClase) {
          this.idUsuario = state.seguridad.user.id;

          // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
          this.idDocumento = this.datosProveedor ? this.datosProveedor.logo : null;

          this.IUploadFile = {
          // tslint:disable-next-line: radix
            path: this.idClase, idUsuario: parseInt(this.idUsuario),
            idAplicacionSeguridad: environment.aplicacionesId,
            idModuloSeguridad: 1, multiple: false, soloProcesar: false
            , extension: ['.jpg', '.jpeg', '.png', '.pdf', '.JPG', '.JPEG', '.PNG', '.PDF'], titulo: '',
            descripcion: '', previsualizacion: true, idDocumento: this.idDocumento, tipodecarga: 'instantly'
          };
        }
      });
    });


    this.ConfForm();
    this.numero = 0;
    this.styles = MapStyle.lightblue[0].maptheme;

    if (!this.newProveedor) {
      /** Si es para actualizar el proveedor, obtenemos los datos el proveedor */
      this.AddDatosFormProveedor(this.datosProveedor);
    }
    /** En caso de que sea un form para proveedorEntidad, agregamos un valor a razonSocial para que el fromgroup sea valido */
    if (this.proveedorEntidad) {
      this.newProveedorForm.controls.razonSocial.setValue('example razonSocial');
    }
    this.GetTipoVialidad();
    this.GetTipoAsentamiento();
  }

  /**
   * @description Metodo para configurar y agregar campos al formulario de proveedores
   * @author Andres Farias
   */
  ConfForm() {
    this.newProveedorForm = new FormGroup({
      idUsuario: new FormControl(this.idUsuario),
      idTipoPersona: new FormControl('1', [Validators.required]),
      razonSocial: new FormControl('', [Validators.required]),
      nombreComercial: new FormControl('', [Validators.required]),
      rfcProveedor: new FormControl({ value: this.rfcProveedor, disabled: !this.newProveedor || this.rfcProveedor }, [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(13)
      ]),
      personaContacto: new FormControl('', []),
      telefono: new FormControl('', []),
      email: new FormControl('', [Validators.email, Validators.required]),
      codigoPostal: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(5)
      ]),
      estado: new FormControl({ value: '', disabled: true }, [
        Validators.required
      ]),
      municipio: new FormControl(
        { value: 'Se llenará con su CP', disabled: true },
        [Validators.required]
      ),
      idTipoAsentamiento: new FormControl('', [Validators.required]),
      asentamiento: new FormControl({ value: '', disabled: true }, [
        Validators.required
      ]),
      idClase: new FormControl(this.idClase, [Validators.required]),
      idTipoVialidad: new FormControl('', [Validators.required]),
      vialidad: new FormControl('', [Validators.required]),
      numeroExterior: new FormControl('', []),
      numeroInterior: new FormControl('', [])
    });
  }

  /**
   * @description Obtener los tipos de vialidades para la direccion
   * @author Andres Farias
   */
  GetTipoVialidad() {
    this.siscoV3Service.getService('common/getTipoVialidad').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.Excepciones(res.excepcion, 3);
        } else {
          this.numero = 1;
          this.tipoVialidades = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        this.Excepciones(error, 2);
        this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
          duration: 2000
        });
      }
    );
  }

  /**
   * @description Obtener los tipos de asentamiento para la direccion
   * @author Andres Farias
   */
  GetTipoAsentamiento() {
    this.siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.Excepciones(res.excepcion, 3);
        } else {
          this.numero = 1;
          this.tipoAsentamientos = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        this.Excepciones(error, 2);
      }
    );
  }

  /**
   * @description Agregar valores al formulario de proveedor.
   * @param datosProveedor Datos del proveedor a editar.
   * @author Andres Farias
   */
  AddDatosFormProveedor(datosProveedor: IProveedor) {
    this.rfcProveedorEntidad = this.rfcProveedorEntidad ? this.rfcProveedorEntidad : datosProveedor.rfcProveedor;
    this.idPais = datosProveedor.idPais;
    this.idEstado = datosProveedor.idEstado;
    this.idMunicipio = datosProveedor.idMunicipio;
    this.asentamiento = datosProveedor.asentamiento;
    this.newProveedorForm.controls.nombreComercial.setValue(datosProveedor.nombreComercial);
    this.newProveedorForm.controls.razonSocial.setValue(datosProveedor.razonSocial);
    this.newProveedorForm.controls.idTipoPersona.setValue(datosProveedor.idTipoPersona + '');
    this.newProveedorForm.controls.rfcProveedor.setValue(datosProveedor.rfcProveedor);
    this.newProveedorForm.controls.personaContacto.setValue(datosProveedor.personaContacto);
    this.newProveedorForm.controls.idClase.setValue(datosProveedor.idClase);
    this.newProveedorForm.controls.telefono.setValue(datosProveedor.telefono);
    this.newProveedorForm.controls.email.setValue(datosProveedor.email);
    this.newProveedorForm.controls.codigoPostal.setValue(datosProveedor.codigoPostal);
    this.newProveedorForm.controls.estado.setValue(datosProveedor.idEstado);
    this.newProveedorForm.controls.municipio.setValue(datosProveedor.municipio);
    this.newProveedorForm.controls.idTipoAsentamiento.setValue(datosProveedor.idTipoAsentamiento);
    this.newProveedorForm.controls.asentamiento.setValue(datosProveedor.asentamiento);
    this.newProveedorForm.controls.idTipoVialidad.setValue(datosProveedor.idTipoVialidad);
    this.newProveedorForm.controls.vialidad.setValue(datosProveedor.vialidad);
    this.newProveedorForm.controls.numeroExterior.setValue(datosProveedor.numeroExterior);
    this.newProveedorForm.controls.numeroInterior.setValue(datosProveedor.numeroInterior);
  }

  /**
   * @description Metodo para obtener la direccion dependiendo del codigo postal.
   * @author Andres Farias
   */
  GetCp() {
    try {
      if (this.newProveedorForm.controls.codigoPostal.value) {
        this.numero = 0;
        this.siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.newProveedorForm.controls.codigoPostal.value
          })
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.Excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.Excepciones(res.excepcion, 3);
              } else {
                if (res.recordsets[0] < 1) {
                  this.snackBar.open('El Código Postal no es valido', 'Ok', {
                    duration: 2000
                  });
                  this.numero = 1;
                  this.valCp = true;
                  this.newProveedorForm.controls.codigoPostal.setValue('');
                } else {
                  this.numero = 1;
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
                  if (!this.datosProveedor) {
                    this.newProveedorForm.controls.asentamiento.setValue('');
                  }
                }
              }
            },
            (error: any) => {
              this.Excepciones(error, 2);
              this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
                duration: 2000
              });
              this.numero = 1;
            }
          );
      }
    } catch (error) {
      this.numero = 1;
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description Evento que se ocupa en el input de codigo postal.
   * @author Andres Farias
   */
  OnKeydown(event: any) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'form-proveedor.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
      });

    } catch (err) {
    }
  }

  /**
   * @description Metodo que envía los datos del proveedor al componente padre(Submit).
   * @author Andres Farias
   */
  AgregarProveedor() {
    const dataProveedor: IProveedor = this.newProveedorForm.value;
    dataProveedor.rfcProveedor = dataProveedor.rfcProveedor ? dataProveedor.rfcProveedor : this.rfcProveedorEntidad;

    if (dataProveedor.rfcProveedor) {
      dataProveedor.rfcProveedor = dataProveedor.rfcProveedor.toUpperCase();
    }
    dataProveedor.idPais = this.idPais;
    dataProveedor.idEstado = this.idEstado;
    dataProveedor.idMunicipio = this.idMunicipio;
    dataProveedor.asentamiento = dataProveedor.asentamiento ? dataProveedor.asentamiento : this.asentamiento;
    dataProveedor.logo = this.idDocumento;
    const contrato = { rfcEmpresa: null, idCliente: null, numeroContrato: null, idUsuario: dataProveedor.idUsuario, rfcProveedor: null };

    if (this.newProveedor) {
      dataProveedor.lat = this.lat;
      dataProveedor.lng = this.lng;
    }

    delete dataProveedor.contrato;

    this.formProveedorEvent.emit({ data: dataProveedor, contrato });
  }

  /**
   * @description Metodo para cambiar el minimo de caracteres aceptado por el input de rfcProveedor.
   * @author Andres Farias
   */
  cambioTipoPersona() {
    this.lengthRFC = this.newProveedorForm.controls.idTipoPersona.value === '1' ? 13 : 12;
  }

  /**
   * @description Metodo para la validacion de RFC.
   * @param $event DOM del input rfcProveedor.
   * @author Andres Farias
   */
  ReplaceForRfc($event: any) {
    const val = $event.target.value.trim().replace(/[^\w\s]/gi, '').replace('_', '').toUpperCase();
    $event.target.value = val;

    const validateFormatRFC = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;

    const valid = validateFormatRFC.test(val);

    if (!valid) {
      this.newProveedorForm.get('rfcProveedor').setErrors({ formatError: true });
    }
  }

  /**
   * @description Metodo para agregar la direccion de matriz, esto para proveedorEntidad.
   * @param $event DOM del elemento switch cambio de direccion.
   * @author Andres Farias
   */
  changeSelecciontionDireccionProveedor($event: any) {
    this.checkedDireccionProeedor = this.checkedDireccionProeedor ? false : true;

    if (this.checkedDireccionProeedor) {
      this.newProveedorForm.controls.estado.setValue(this.datosProveedor.estado);
      this.newProveedorForm.controls.municipio.setValue(this.datosProveedor.municipio);
      this.newProveedorForm.controls.asentamiento.setValue(this.datosProveedor.asentamiento);
      this.newProveedorForm.controls.codigoPostal.setValue(this.datosProveedor.codigoPostal);
      this.newProveedorForm.controls.vialidad.setValue(this.datosProveedor.vialidad);
      this.newProveedorForm.controls.numeroExterior.setValue(this.datosProveedor.numeroExterior);
      this.newProveedorForm.controls.numeroInterior.setValue(this.datosProveedor.numeroInterior);
      this.newProveedorForm.controls.idTipoAsentamiento.setValue(this.datosProveedor.idTipoAsentamiento);
      this.newProveedorForm.controls.idTipoVialidad.setValue(this.datosProveedor.idTipoVialidad);
      this.idPais = this.datosProveedor.idPais;
      this.idEstado = this.datosProveedor.idEstado;
      this.idMunicipio = this.datosProveedor.idMunicipio;
      this.asentamiento = this.datosProveedor.asentamiento;
      this.changeVialidad();
    } else {
      this.newProveedorForm.controls.estado.setValue('');
      this.newProveedorForm.controls.municipio.setValue('');
      this.newProveedorForm.controls.asentamiento.setValue('');
      this.newProveedorForm.controls.codigoPostal.setValue('');
      this.newProveedorForm.controls.vialidad.setValue('');
      this.newProveedorForm.controls.numeroExterior.setValue('');
      this.newProveedorForm.controls.numeroInterior.setValue('');
      this.newProveedorForm.controls.idTipoAsentamiento.setValue('');
      this.newProveedorForm.controls.idTipoVialidad.setValue('');
    }
  }

  /**
   * @description evento que se ejecuta cada que se cambia el valor de los inputs de dirección.
   * @author Andres Farias
   */
  changeVialidad() {
    if (this.showMaps) {
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
  }

  /**
   * @description Captura el evento que regresa el map, al moverse el marker.
   * @author Andres Farias
   */
  markerDragEndd($event) {
    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
  }

  /**
   * @description Envento que se ejecuta cuando el mapa está listo en el html
   * @author Andres Farias
   */
  mapReady($event) {
    this.map = $event;
  }

  /**
   * @description Metodo para buscar la direccion en maps.
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

  /**
   * @description Metodo para capturar el resultado de upload component.
   * @param $event valor del evento generado al terminar la carga de documentos.
   * @param index   indice de la lista de campos dinamicos.
   * @author Andres Farias
   */
  ResultUploadFile($event) {
    if ($event.recordsets.length > 0) {
      this.idDocumento = $event.recordsets[0].idDocumento;

      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }
}
