import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Negocio } from '../../models/negocio.model';
import { BaseService } from '../../services/base.service';
import { SessionInitializer } from '../../services/session-initializer';

/*
Cacha los posibles errores del fomControl
*/
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-ins-cliente',
  templateUrl: './ins-cliente.component.html',
  styleUrls: ['./ins-cliente.component.scss'],
  providers: [SiscoV3Service]
})
export class AddClienteComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idClase;
  idUsuario;
  modulo1: any = {};
  modulo2: any = {};
  modulo3: any = {};
  claveModuloInsCliente = 'app-ins-cliente';
  claveModuloInsDF = 'app-ins-df';
  claveModuloUpdDF = 'app-upd-df';
  breadcrumb1: any[];
  breadcrumb2: any[];
  breadcrumb3: any[];
  state;

  IUploadFile: IFileUpload;
  url;

  idCliente;
  idCliente2;
  rfcClienteEntidad;
  clienteEntidad;
  datos;
  public empresa;
  public tipo = 2;
  public municipios;
  public tipoVialidades;
  public tipoAsentamientos;
  public asentamientos;
  public idPais;
  public idEstado;
  public idMunicipio;
  public numero = 1;
  public valCp = false;
  public len = 13;
  ruta1: any;
  ruta2: any;
  ruta3: any;
  @ViewChild('cp') cp;
  @ViewChild('municipio') municipio;

  /*
  Hace las validaciones para que los datos que inserten del cliente sean correctos
  */
  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idFileAvatar: new FormControl(''),
    idUsuario: new FormControl('', [Validators.required])
  });

  /*
  Hace las validaciones para que los datos que inserten del Cliente Entidad sean correctos
  */
  clienteEntidadForm = new FormGroup({
    tipoPersona: new FormControl('1', [Validators.required]),
    razonSocial: new FormControl('', [Validators.required]),
    nombreComercial: new FormControl('', [Validators.required]),
    rfcCliente: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9ñÑ]*$')]),
    personaContacto: new FormControl(''),
    telefono: new FormControl('', [Validators.pattern('^[0-9]*$')]),
    email: new FormControl('', [Validators.email, Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    cp: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(5),
      Validators.pattern('^[0-9]*$')
    ]),
    estado: new FormControl({ value: '', disabled: true }, [
      Validators.required
    ]),
    municipio: new FormControl(
      { value: 'Se llenará con su CP', disabled: true },
      [Validators.required]
    ),
    tipoAsentamiento: new FormControl('', [Validators.required]),
    asentamiento: new FormControl({ value: 'Asentamiento', disabled: true }, [
      Validators.required
    ]),
    tipoVialidad: new FormControl('', [Validators.required]),
    vialidad: new FormControl('', [Validators.required]),
    numeroExterior: new FormControl(''),
    numeroInterior: new FormControl('')
  });
  matcher = new MyErrorStateMatcher();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private sessionInitializer: SessionInitializer,
    private baseService: BaseService
  ) { }

  ngOnInit() {
    try {
      if (this.sessionInitializer.state) {
        this.state = this.baseService.getUserData();
        const state2 = this.baseService.getContractData();
        this.idUsuario = this.state.user.id;
        this.clienteForm.controls.idUsuario.setValue(this.idUsuario);
        this.clienteEntidadForm.controls.idUsuario.setValue(this.idUsuario);
        if (state2.claseActual) {
          this.idClase = state2.claseActual;
          this.loadData();
          this.construyeBreadCrumb(this.state.permissions.modules);
          this.getTipoVialidad();
          this.getTipoAsentamiento();
          this.documentoExtenciones();
        }
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  ngOnDestroy() { }

  construyeBreadCrumb(modulos: any) {
    this.modulo1 = Negocio.GetModulo(this.claveModuloInsCliente, modulos, this.idClase);
    if (this.modulo1.breadcrumb) {
      this.breadcrumb1 = Negocio.GetConfiguracionBreadCrumb(this.modulo1.breadcrumb, this.idClase);
    }

    this.modulo2 = Negocio.GetModulo(this.claveModuloInsDF, modulos, this.idClase);
    if (this.modulo2.breadcrumb) {
      this.breadcrumb2 = Negocio.GetConfiguracionBreadCrumb(this.modulo2.breadcrumb, this.idClase, [{ idCliente: this.idCliente }]);
    }

    this.modulo3 = Negocio.GetModulo(this.claveModuloUpdDF, modulos, this.idClase);
    if (this.modulo3.breadcrumb) {
      // tslint:disable-next-line:max-line-length
      this.breadcrumb3 = Negocio.GetConfiguracionBreadCrumb(this.modulo3.breadcrumb, this.idClase, [{ rfcClienteEntidad: this.rfcClienteEntidad }, { idCliente2: this.idCliente2 }]);
    }
  }

  /**
   * @description Llena el IUploadFile con sus respectivos valores
   * @returns Obtiene la variable IUploadFile para poder insertar una foto
   * @author Gerardo Zamudio González
   */
  documentoExtenciones() {
    const ext = [];
    ext.push('.jpg', '.jpeg', '.png', '.pdf');
    this.IUploadFile = {
      path: this.idClase,
      idUsuario: this.clienteForm.controls.idUsuario.value,
      idAplicacionSeguridad: environment.aplicacionesId,
      idModuloSeguridad: 1,
      multiple: false,
      soloProcesar: false,
      extension: ext,
      titulo: '',
      descripcion: '',
      previsualizacion: true,
      tipodecarga: 'instantly'
    };
  }


  /**
   * @description Carga de archivo
   * @param $event Detalle del archivo cargado
   * @param index Posición de la propiedad
   * @returns Resultado de la carga del archivo
   * @author Edgar Mendoza Gómez
   */
  ResultUploadFile($event) {
    if ($event.recordsets.length > 0) {
      this.clienteForm.controls.idFileAvatar.setValue($event.recordsets[0].idDocumento);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }


  /**
   * @description Carga una longitud al campo de RFC dependiendo el tipo de persona que se seleccione
   * @returns Resultado de la longitud
   * @author Gerardo Zamudio González
   */
  cambio() {
    if (this.clienteEntidadForm.controls.tipoPersona.value === '1') {
      this.len = 13;
    } else if (this.clienteEntidadForm.controls.tipoPersona.value === '4') {
      this.len = 12;
    }
  }

  /**
   * @description Llena los datos si los parametros solo tienen el idCliente
   * @returns Obtiene los datos del cliente
   * @author Gerardo Zamudio González
   */
  getClientePorId() {
    this.numero = 0;
    this.siscoV3Service
      .getService('cliente/getClientePorId?idCliente=' + this.idCliente)
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.datos = res.recordsets[0][0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Llena los datos si los parametros solo tienen el rfcClienteEntidad
   * @returns Obtiene los datos del Cliente entidad listos para ser mostrados
   * @author Gerardo Zamudio González
   */
  getClienteEntidadConDireccion() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        'cliente/getClienteEntidadConDireccion?rfcClienteEntidad=' +
        this.rfcClienteEntidad
      )
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.datos = res.recordsets[0][0];
            this.fillDataClienteEntidad(this.datos);
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }


  /**
   * @description Llena los campos del Cliente Entidad para ser actualizados
   * @param datos Datos del Cliente entidad
   * @returns Setea los datos en el clienteForm para mostrarlos en el HTML
   * @author Gerardo Zamudio González
   */
  fillDataClienteEntidad(datos) {
    const num = datos.idTipoPersona;
    this.clienteForm.controls.nombre.setValue(datos.nombre);
    this.clienteEntidadForm.controls.tipoPersona.setValue(num.toString());
    this.clienteEntidadForm.controls.razonSocial.setValue(
      datos.razonSocial
    );
    this.clienteEntidadForm.controls.nombreComercial.setValue(
      datos.nombreComercial
    );
    this.clienteEntidadForm.controls.rfcCliente.setValue(
      datos.rfcClienteEntidad
    );
    this.clienteEntidadForm.controls.personaContacto.setValue(
      datos.personaContacto
    );
    this.clienteEntidadForm.controls.telefono.setValue(datos.telefono);
    this.clienteEntidadForm.controls.email.setValue(datos.email);
    this.clienteEntidadForm.controls.cp.setValue(datos.codigoPostal);
    this.clienteEntidadForm.controls.tipoAsentamiento.setValue(
      datos.idTipoAsentamiento
    );

    this.clienteEntidadForm.controls.tipoVialidad.setValue(
      datos.idTipoVialidad
    );
    this.clienteEntidadForm.controls.vialidad.setValue(datos.vialidad);
    this.clienteEntidadForm.controls.numeroExterior.setValue(
      datos.numeroExterior
    );
    this.clienteEntidadForm.controls.numeroInterior.setValue(
      datos.numeroInterior
    );
    this.getCp();
    this.clienteEntidadForm.controls.asentamiento.setValue(
      datos.asentamiento
    );
    this.clienteEntidadForm.controls.idUsuario.setValue(datos.idUsuario);
    this.numero = 1;
    if (num === 1) {
      this.len = 13;
    } else if (num === 4) {
      this.len = 12;
    }
  }

  /**
   * @description Carga Toda la data inicial
   * @returns Regresa todos los datos dependiendo de lo que se le mande en los parametros
   * @author Gerardo Zamudio González
   */
  loadData() {
    /*
    Obtiene el idClinte o rfcClienteEntidad por los parametros
    */
    this.url = environment.fileServerUrl;
    this.activatedRoute.params.subscribe(parametros => {
      this.numero = 0;
      this.idCliente = parametros.idCliente;
      this.rfcClienteEntidad = parametros.rfcClienteEntidad;
      this.idCliente2 = parametros.idCliente2;
      /*
      Si solo llega el idCliente por los parametros entonces se va a insertar un nuevo dato Fiscal. De lo contrario si llega el
      rfcClienteEntidad los datos de ese rfc serán actualizados.
      */
      if (parametros.idCliente) {
        this.clienteForm.disable();
        this.getClientePorId();
      }
      if (parametros.rfcClienteEntidad) {
        this.clienteForm.disable();
        this.getClienteEntidadConDireccion();
      }
    });
  }


  /**
   * @description Obtiene los tipos de Vialidades
   * @returns Regresa las Vialidades disponibles de la base de datos
   * @author Gerardo Zamudio González
   */
  getTipoVialidad() {
    this.numero = 0;
    this.siscoV3Service.getService('common/getTipoVialidad').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.numero = 1;
          this.tipoVialidades = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Obtiene todos los tipos de asentamientos
   * @returns Regresa los Tipos de asentamientos disponibles de la base de datos
   * @author Gerardo Zamudio González
   */
  getTipoAsentamiento() {
    this.numero = 0;
    this.siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.numero = 1;
          this.tipoAsentamientos = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Este metodo se encarga de buscar el código postal, junto con su estado, municipio y asentamiento
   * @returns Retorna en Código postal junto con el estado y la vialidad
   * @author Gerardo Zamudio González
   */
  getCp() {
    try {
      if (this.clienteEntidadForm.controls.cp.value) {
        this.numero = 0;
        this.siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.clienteEntidadForm.controls.cp.value
          })
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3);
              } else {
                if (res.recordsets[0] < 1) {
                  this.snackBar.open('El Código Postal no es valido', 'Ok', {
                    duration: 2000
                  });
                  this.numero = 1;
                  this.valCp = true;
                  this.clienteEntidadForm.controls.cp.setValue('');
                } else {
                  this.numero = 1;
                  this.valCp = false;
                  this.asentamientos = res.recordsets[0];
                  this.idPais = res.recordsets[0][0].idPais;
                  this.idEstado = res.recordsets[0][0].idEstado;
                  this.idMunicipio = res.recordsets[0][0].idMunicipio;
                  this.clienteEntidadForm.controls.estado.setValue(
                    res.recordsets[0][0].nombreEstado
                  );
                  this.clienteEntidadForm.controls.municipio.setValue(
                    res.recordsets[0][0].nombreMunicipio
                  );
                  this.clienteEntidadForm.get('asentamiento').enable();
                  if (!this.datos.asentamiento) {
                    this.clienteEntidadForm.controls.asentamiento.setValue(
                      ''
                    );
                  }
                }
              }
            },
            (error: any) => {
              this.excepciones(error, 2);
              this.numero = 1;
            }
          );
      }
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Cuando le den enter en el capo de Código postal ejecutará el metodo getCp().
   * @param $event Tipo de tecla que se preciono
   * @returns Ejecuta el metodo getCp()
   * @author Gerardo Zamudio González
   */
  onKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Agrega un nuevo dato fiscal
   * @returns Recarga la pagina para insertar otro Cliente entidad
   * @author Gerardo Zamudio González
   */
  agregarClienteEntidad() {
    try {
      this.numero = 0;
      const data = {
        idCliente: this.datos.idCliente,
        idPais: this.idPais,
        idEstado: this.idEstado,
        idMunicipio: this.idMunicipio,
        codigoPostal: this.clienteEntidadForm.controls.cp.value,
        idTipoAsentamiento: this.clienteEntidadForm.controls.tipoAsentamiento
          .value,
        asentamiento: this.clienteEntidadForm.controls.asentamiento.value,
        idTipoVialidad: this.clienteEntidadForm.controls.tipoVialidad.value,
        vialidad: this.clienteEntidadForm.controls.vialidad.value,
        numeroExterior: this.clienteEntidadForm.controls.numeroExterior
          .value,
        numeroInterior: this.clienteEntidadForm.controls.numeroInterior
          .value,
        rfcClienteEntidad: this.clienteEntidadForm.controls.rfcCliente.value,
        razonSocial: this.clienteEntidadForm.controls.razonSocial.value,
        nombreComercial: this.clienteEntidadForm.controls.nombreComercial
          .value,
        idTipoPersona: this.clienteEntidadForm.controls.tipoPersona.value,
        personaContacto: this.clienteEntidadForm.controls.personaContacto
          .value,
        telefono: this.clienteEntidadForm.controls.telefono.value,
        email: this.clienteEntidadForm.controls.email.value,
        // idUsuario: this.clienteEntidadForm.controls.idUsuario.value
      };
      this.siscoV3Service
        .postService('cliente/postInsertaClienteEntidad', data)
        .subscribe(
          (res: any) => {
            if (res.err) {
              this.numero = 1;
              // error tipo base de datos
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              // excepcion de conexion a la base de datos
              this.excepciones(res.excepcion, 3);
            } else {
              this.numero = 1;
              this.snackBar.open('Registrado exitosamente.', 'Ok', {
                duration: 2000
              });
              this.router.navigateByUrl(
                `/upd-cliente/${this.idCliente}`
              );
            }
          },
          (error: any) => {
            // error de no conexion al servicio
            this.excepciones(error, 2);
            this.numero = 1;
          }
        );
    } catch (error) {
      this.excepciones(error, 1);
      // error en el metodo
    }
  }

  /**
   * @description Agrega un nuevo Cliente
   * @returns Al registrar un cliente, redirige a la pagina "Editar cliente"
   * @author Gerardo Zamudio González
   */
  agregarCliente() {
    try {
      this.numero = 0;
      const data = {
        nombre: this.clienteForm.controls.nombre.value,
        // idUsuario: this.clienteForm.controls.idUsuario.value,
        idFileAvatar: this.clienteForm.controls.idFileAvatar.value
      };
      this.siscoV3Service
        .postService('cliente/postInsertaCliente', data)
        .subscribe(
          (res: any) => {
            if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              this.excepciones(res.excepcion, 3);
            } else {
              this.numero = 1;
              this.router.navigateByUrl(
                '/upd-cliente/' + res.recordsets[1][0].idCliente
              );
              this.snackBar.open('Cliente registrado exitosamente.', 'Ok', {
                duration: 2000
              });
            }
          },
          (error: any) => {
            this.numero = 1;
            this.excepciones(error, 2);
          }
        );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Genera el Json que se va a mandar con los datos a modificar
   * @returns Abre el Dialog de modificar
   * @author Gerardo Zamudio González
   */
  modificarClienteEntidad() {
    try {
      const data = {
        idCliente: this.datos.idCliente,
        idPais: this.idPais,
        idEstado: this.idEstado,
        idMunicipio: this.idMunicipio,
        codigoPostal: this.clienteEntidadForm.controls.cp.value,
        idTipoAsentamiento: this.clienteEntidadForm.controls.tipoAsentamiento
          .value,
        asentamiento: this.clienteEntidadForm.controls.asentamiento.value,
        idTipoVialidad: this.clienteEntidadForm.controls.tipoVialidad.value,
        vialidad: this.clienteEntidadForm.controls.vialidad.value,
        numeroExterior: this.clienteEntidadForm.controls.numeroExterior
          .value,
        numeroInterior: this.clienteEntidadForm.controls.numeroInterior
          .value,
        rfcClienteEntidad: this.clienteEntidadForm.controls.rfcCliente.value,
        razonSocial: this.clienteEntidadForm.controls.razonSocial.value,
        nombreComercial: this.clienteEntidadForm.controls.nombreComercial
          .value,
        idTipoPersona: this.clienteEntidadForm.controls.tipoPersona.value,
        idLogo: this.datos.idLogo,
        personaContacto: this.clienteEntidadForm.controls.personaContacto
          .value,
        telefono: this.clienteEntidadForm.controls.telefono.value,
        email: this.clienteEntidadForm.controls.email.value
      };
      this.updateData('cliente/putActualizaDireccionClienteEntidad', data);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog update-alert
   * @param $url Url del servicio para modificar
   * @param datos Datos que se van a kodificar en formato Json
   * @returns Abre el Dilog para modificar los datos
   * @author Gerardo Zamudio González
   */
  updateData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(UpdateAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.loadData();
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.clienteForm.controls.idUsuario.value,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ins-cliente.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        this.numero = 1;
      });
    } catch (error) {
      this.numero = 1;
      console.error(error);
    }
  }
}
