import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';

import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IFileUpload } from 'src/app/interfaces';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { environment } from 'src/environments/environment';
import { Negocio } from '../../models/negocio.model';
import { Subscription } from 'rxjs/Subscription';

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
  selector: 'app-ins-contrato',
  templateUrl: './ins-contrato.component.html',
  styleUrls: ['./ins-contrato.component.scss'],
  providers: [SiscoV3Service]
})
export class InsContratoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  claveModulo = 'app-ins-contrato';
  modulo: any = {};
  breadcrumb: any[];

  subsNegocio: Subscription;

  ruta;
  url;
  IUploadFile: IFileUpload;
  public numero = 1;
  empresas;
  clientes;
  estatus;
  data;
  estatusAct;
  checked;
  checked2;
  checked3;
  valClienteFinal = false;
  valEquipamiento = false;
  validaFecha = false;
  public idCliente;
  public rfcEmpresa;
  public numeroContrato;
  matcher = new MyErrorStateMatcher();
  contratoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [
      Validators.required
    ]),
    nombre: new FormControl('', [
      Validators.required
    ]),
    idClienteFinal: new FormControl(''),
    idClase: new FormControl('', [Validators.required]),
    idEstatus: new FormControl('', [Validators.required]),
    fechaFirma: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl({ value: '', disabled: true }),
    fechaFin: new FormControl({ value: '', disabled: true }),
    idUsuario: new FormControl('', [Validators.required]),
    equipamiento: new FormControl(''),
    cantidad: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]*$')
    ]),
    idFileAvatar: new FormControl(''),
    mantenimiento: new FormControl('', [Validators.required])
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private httpClient: HttpClient,
    private store: Store<AppState>,
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    try {
      this.getStateUser.subscribe((state) => {
        if (state && state.seguridad) {
          this.idUsuario = state.seguridad.user.id;
          this.contratoForm.controls.idUsuario.setValue(this.idUsuario);
          this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
            if (state2 && state2.claseActual) {
              this.idClase = state2.claseActual;
              this.contratoForm.controls.idClase.setValue(this.idClase);
              this.url = environment.fileServerUrl;
              this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
              if (this.modulo.length === 0) {
                this.snackBar.open('El usuario no tiene permisos para acceder a este módulo.', 'OK', {
                  duration: 2000
                });
                this.router.navigate(['/home']);
                return;
              }
              if (this.modulo.breadcrumb) {
                this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
              }
              this.ruta = [
                {
                  label: 'home',
                  url: '/home-cliente'
                },
                {
                  label: 'Contratos',
                  url: '/sel-contratos'
                },
                {
                  label: 'Agregar contrato',
                  url: '/ins-contrato'
                }
              ];
              this.documentoExtenciones();
              this.loadData();
            }
          });
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /**
   * @description Muestra u oculta para insertar un Cliente Final
   * @param data Evento de la accion del toggle
   * @returns Valida si tiene o no cliente final
   * @author Gerardo Zamudio González
   */
  validaClienteFinal(data) {
    this.valClienteFinal = data.checked;
  }


  /**
   * @description Asigna un true o false al equipamiento
   * @param data Evento de la accion del toggle
   * @returns Asigna valor para mandar a la base de datos
   * @author Gerardo Zamudio González
   */
  validaEquipamiento(data) {
    this.contratoForm.controls.equipamiento.setValue(data.checked);
  }


  /**
   * @description Asigna un true o false al mantenimiento
   * @param data Evento de la accion del toggle
   * @returns Asigna valor para mandar a la base de datos
   * @author Gerardo Zamudio González
   */
  validaMantenimiento(data) {
    this.contratoForm.controls.mantenimiento.setValue(data.checked);
  }


  /**
   * @description Obtiene las empresas disponibles de la base de datos
   * @returns Empresas en formato Json
   * @author Gerardo Zamudio González
   */
  getEmpresas() {
    this.siscoV3Service.getService('empresa/getEmpresas').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.empresas = res.recordsets[0];
          this.getClientes();
        }
      },
      (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Obtiene los clientes disponibles de la base de datos
   * @returns Clientes en formato Json
   * @author Gerardo Zamudio González
   */
  getClientes() {
    this.siscoV3Service.getService('cliente/getClientes').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.clientes = res.recordsets[0];
          this.getSelEstatus();
        }
      },
      (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }


  /**
   * @description Obtiene los estatus disponibles de la base de datos
   * @returns Estatus en formato Json
   * @author Gerardo Zamudio González
   */
  getSelEstatus() {
    this.siscoV3Service.getService('cliente/getSelEstatus').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.estatus = res.recordsets[0];
          this.numero = 1;
        }
      },
      (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Carga los datos principales de la pagina
   * @returns Empresas en formato Json
   * @author Gerardo Zamudio González
   */
  loadData() {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        this.rfcEmpresa = parametros.rfcEmpresa;
        this.numeroContrato = parametros.numeroContrato;
        this.numero = 0;
        this.getEmpresas();
        this.contratoForm.controls.equipamiento.setValue(false);
        this.contratoForm.controls.mantenimiento.setValue(false);
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Muestra u Ocualta las fechas cuando es estatus esta en ACT
   * @param val Valor del selec
   * @returns Si el estatus es ACT muestra las fechas
   * @author Gerardo Zamudio González
   */
  cambioEstatus(val) {
    this.estatusAct = val;
  }

  /**
   * @description Carga las extenciones disponibles del documento.
   * @returns IUploadFile lleno
   * @author Gerardo Zamudio González
   */
  documentoExtenciones() {
    const ext = [];
    ext.push('.jpg', '.jpeg', '.png', '.pdf');

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: this.idClase,
      idUsuario: this.idUsuario,
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
      this.contratoForm.controls.idFileAvatar.setValue($event.recordsets[0].idDocumento);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  // agregarContrato(fileUploader: DxFileUploaderComponent) {
  //   try {
  //     const formData = new FormData();
  //     formData.append('path', this.IUploadFile.path);
  //     // tslint:disable-next-line:prefer-for-of
  //     for (let i = 0; i < fileUploader.value.length; i++) {
  //       formData.append('files', fileUploader.value[i]);
  //     }
  //     // ************************** Se llena formData **************************
  //     formData.append(
  //       'idAplicacionSeguridad',
  //       this.IUploadFile.idAplicacionSeguridad + ''
  //     );
  //     formData.append(
  //       'idModuloSeguridad',
  //       this.IUploadFile.idModuloSeguridad + ''
  //     );
  //     formData.append('idUsuario', this.IUploadFile.idUsuario + '');

  //     formData.append('titulo', this.contratoForm.controls.nombre.value);
  //     formData.append(
  //       'descripcion',
  //       this.contratoForm.controls.descripcion.value
  //     );
  //     this.insDocto(formData);
  //   } catch (error) {
  //     this.numero = 1;
  //     this.excepciones(error, 1);
  //   }
  // }

  /**
   * Inserta el documento (Factura, Cotización) con FileServer y se obtiene el id del dicho documento insertado
   */
  // insDocto(data) {
  //   this.numero = 0;
  //   this.httpClient.post(this.url + 'documento/UploadFiles', data)
  //     .subscribe(
  //       (res: any) => {
  //         this.numero = 1;
  //         const idDocumento = res.recordsets[0].idDocumento;
  //         this.insContrato(idDocumento);
  //       }, (error: any) => {
  //         this.numero = 1;
  //         this.excepciones(error, 2);
  //       }
  //     );
  // }

  /**
   * @description Inserta un contrato
   * @returns Redirecciona a la pantalla upd-contrato
   * @author Gerardo Zamudio González
   */
  insContrato() {
    this.numero = 0;
    let fechaIn;
    let fechaTer;
    if (this.contratoForm.controls.equipamiento.value === '') {
      this.contratoForm.controls.equipamiento.setValue(false);
    }
    if (this.contratoForm.controls.fechaInicio.value) {
      fechaIn = moment(this.contratoForm.controls.fechaInicio.value).format(
        'YYYY-MM-DD'
      );
    } else {
      fechaIn = null;
    }
    if (this.contratoForm.controls.fechaFin.value) {
      fechaTer = moment(this.contratoForm.controls.fechaFin.value).format(
        'YYYY-MM-DD'
      );
    } else {
      fechaTer = null;
    }
    if (fechaIn > fechaTer) {
      this.numero = 1;
      this.validaFecha = true;
    } else {
      this.validaFecha = false;
      const data = {
        rfcEmpresa: this.contratoForm.controls.rfcEmpresa.value,
        idCliente: this.contratoForm.controls.idCliente.value,
        numeroContrato: this.contratoForm.controls.numeroContrato.value,
        idClienteFinal: this.contratoForm.controls.idClienteFinal.value,
        idClase: this.contratoForm.controls.idClase.value,
        nombre: this.contratoForm.controls.nombre.value,
        idEstatus: this.contratoForm.controls.idEstatus.value,
        fechaInicio: fechaIn,
        fechaFin: fechaTer,
        fechaFirma: this.contratoForm.controls.fechaFirma.value,
        equipamiento: this.contratoForm.controls.equipamiento.value,
        cantidad: this.contratoForm.controls.cantidad.value,
        mantenimiento: this.contratoForm.controls.mantenimiento.value,
        idFileAvatar: this.contratoForm.controls.idFileAvatar.value
      };
      this.siscoV3Service
        .postService('cliente/postInsertaContrato', data)
        .subscribe(
          (res: any) => {
            if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              this.excepciones(res.excepcion, 3);
            } else {
              const rfcEmpresa = res.recordsets[0][0].rfcEmpresa;
              const idCliente = res.recordsets[0][0].idCliente;
              const numeroContrato = res.recordsets[0][0].numeroContrato;
              this.router.navigateByUrl(
                `/upd-contrato/${rfcEmpresa}/${numeroContrato}/${idCliente}`
              );
              this.numero = 1;
              this.snackBar.open('Contrato registrado exitosamente.', 'Ok', {
                duration: 2000
              });
            }
          },
          (error: any) => {
            this.numero = 1;
            this.excepciones(error, 2);
          }
        );
    }
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  excepciones(error, tipoExcepcion: number) {
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
