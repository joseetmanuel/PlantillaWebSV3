import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { AppState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { BaseService } from '../../services/base.service';
import { SessionInitializer } from '../../services/session-initializer';
import { CurrencyPipe } from '@angular/common';

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
  selector: 'app-upd-contrato',
  templateUrl: './upd-contrato.component.html',
  styleUrls: ['./upd-contrato.component.scss'],
  providers: [SiscoV3Service]
})
export class UpdContratoComponent implements OnInit, OnDestroy {
  breadcrumb: any[];
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-contrato';
  idClase = '';
  modulo: any = {};

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;

  PropiedadC;

  public numero = 1;
  IUploadFile: IFileUpload;
  band = false;
  total;
  doc;
  url;
  empresas;
  clientes;
  formasDePago;
  tiposDeOperacion;
  apariencia;
  estatus;
  data;
  /** variable para la clase de el contrato seleccionado */
  claseActual;
  estatusAct;
  labelTotalUnidades;
  ruta: any;
  presupuestoFormatted;
  checkedClienteFinal;
  valClienteFinal = false;
  valEquipamiento = false;
  validaFecha = false;
  validaPresupuesto = false;
  public idCliente;
  public rfcEmpresa;
  public numeroContrato;
  matcher = new MyErrorStateMatcher();
  contratoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    idClienteFinal: new FormControl(''),
    idClase: new FormControl('', [Validators.required]),
    idEstatus: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl({ value: '', disabled: true }),
    fechaFin: new FormControl({ value: '', disabled: true }),
    fechaFirma: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    equipamiento: new FormControl(''),
    totalUnidades: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    mantenimiento: new FormControl('', [Validators.required]),
    idFileAvatar: new FormControl(''),
    idTipoOperacion: new FormControl(''),
    manejoDeUtilidad: new FormControl(''),
    idFormaDePago: new FormControl(''),
    geolocalizacion: new FormControl(''),
    manejoDePresupuesto: new FormControl(''),
    unidadSustituto: new FormControl(''),
    idApariencia: new FormControl(''),
    controlDeTiempo: new FormControl(''),
    folio: new FormControl({ value: '', disabled: true }, [Validators.required]),
    presupuesto: new FormControl('', Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')),
    porcentajeUtilidad: new FormControl('', Validators.pattern('^[1-9][0-9]?$|^100$')),
    aplicaEncuesta: new FormControl('')
  });
  totalUnidades: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>,
    private sessionInitializer: SessionInitializer,
    private baseService: BaseService,
    private currencyPipe: CurrencyPipe) { }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      let stateCB = this.baseService.getUserData();
      this.idUsuario = stateCB.user.id;
      this.contratoForm.controls.idUsuario.setValue(this.idUsuario);
      const stateN = this.baseService.getContractData();
      if (stateN) {
        this.idClase = stateN.claseActual;
        this.contratoForm.controls.idClase.setValue(this.idClase);
      }
      try {
        this.loadData();
        this.documentoExtenciones();
        this.construyeBreadcrumb(stateCB.permissions.modules);
      } catch (error) {
        this.excepciones(error, 1);
      }
    }
  }

  /*
    Se toma la configuración de que se bloquee la apertura y no realice cambios sobre el footer
  */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)
    )
    );
  }

  ngOnDestroy() { }

  /**
   * @description Valida a que toggle se le dio click y asigna un valor
   * @param data Evento del toggle en el cual se obtiene el checked
   * @param tipo Que toggle se le dio click
   * @returns Asigna el valor de true o false al contratoForm
   * @author Gerardo Zamudio González
   */
  // tslint:disable-next-line:no-shadowed-variable
  validacionesToggle(data: any) {
    this.valClienteFinal = data.checked;
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

  transformAmount() {
    this.presupuestoFormatted = this.currencyPipe.transform(this.contratoForm.controls.presupuesto.value, 'USD');
  }

  transformAmountClean() {
    this.presupuestoFormatted = this.contratoForm.controls.presupuesto.value;
  }

  /**
   * @description Obtenemos los datos del contrato que se va a modificar
   * @returns Los datos son obtenidos y se ejecuta el metodo fillContratoData
   * @author Gerardo Zamudio González
   */
  getContatoData() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        'cliente/getContratoPorKeys?numeroContrato=' +
        this.numeroContrato +
        '&rfcEmpresa=' +
        this.rfcEmpresa +
        '&idCliente=' +
        this.idCliente +
        ''
      )
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.data = res.recordsets[0][0];
            this.claseActual = this.data.idClase;
            this.fillContratoData(this.data);
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Llena el contratoForm con los datos del contrato
   * @param data Los datos del contrato obtenidos de la base de datos
   * @returns Llena y muestra los datos del contrato
   * @author Gerardo Zamudio González
   */
  fillContratoData(data) {
    const equipamientoAut = this.claseActual === 'Automovil' ? data.equipamiento : false;
    this.contratoForm.controls.rfcEmpresa.disable();
    this.contratoForm.controls.idCliente.disable();
    this.contratoForm.controls.rfcEmpresa.setValue(data.rfcEmpresa);
    this.contratoForm.controls.idCliente.setValue(data.idCliente);
    this.contratoForm.controls.numeroContrato.setValue(data.numeroContrato);
    this.contratoForm.controls.nombre.setValue(data.nombre);
    this.contratoForm.controls.idClienteFinal.setValue(data.idClienteFinal);
    this.contratoForm.controls.idClase.setValue(data.idClase);
    this.contratoForm.controls.idEstatus.setValue(data.idEstatus);
    this.contratoForm.controls.idUsuario.setValue(data.idUsuario);
    this.contratoForm.controls.equipamiento.setValue(equipamientoAut);
    this.contratoForm.controls.totalUnidades.setValue(data.totalUnidades);
    this.totalUnidades = data.totalUnidades;
    this.contratoForm.controls.mantenimiento.setValue(data.incluyeMantenimiento);
    this.contratoForm.controls.idTipoOperacion.setValue(data.idTipoOperacion);
    this.contratoForm.controls.manejoDeUtilidad.setValue(data.manejoDeUtilidad);
    this.contratoForm.controls.aplicaEncuesta.setValue(data.aplicaEncuesta);
    this.contratoForm.controls.porcentajeUtilidad.setValue(data.porcentajeUtilidad);
    this.contratoForm.controls.idFormaDePago.setValue(data.idFormaDePago);
    this.contratoForm.controls.geolocalizacion.setValue(data.geolocalizacion);
    this.contratoForm.controls.manejoDePresupuesto.setValue(data.manejoDePresupuesto);
    this.contratoForm.controls.unidadSustituto.setValue(data.unidadSustituto);
    this.contratoForm.controls.idApariencia.setValue(data.idApariencia);
    this.contratoForm.controls.folio.setValue(data.folio);
    this.contratoForm.controls.presupuesto.setValue(data.presupuesto);
    this.contratoForm.controls.idFileAvatar.setValue(data.idFileAvatar);
    const fechaFir = moment(data.fechaFirma, 'YYYY-MM-DD').utc();
    this.contratoForm.controls.fechaFirma.setValue(fechaFir);
    this.transformAmount();
    if (data.idClienteFinal) {
      this.valClienteFinal = true;
      this.checkedClienteFinal = 'checked';
    }

    if (data.idEstatus === 'ACT') {
      if (data.fechaInicio) {
        const dateInicio = moment(data.fechaInicio, 'YYYY-MM-DD').utc();
        this.contratoForm.controls.fechaInicio.setValue(dateInicio);
      }
      if (data.fechaFin) {
        const dateFin = moment(data.fechaFin, 'YYYY-MM-DD').utc();
        this.contratoForm.controls.fechaFin.setValue(dateFin);
      }
      this.cambioEstatus(this.data.idEstatus);
    }
    if (data.idFileAvatar > 0) {
      this.band = true;
      const ext = ['.jpg', '.jpeg', '.png', '.pdf'];
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
        idDocumento: data.idFileAvatar,
        tipodecarga: 'instantly'
      };
    }
  }

  /**
   * @description Obtiene las empresas disponibles de la base de datos
   * @returns Empresas en formato Json
   * @author Gerardo Zamudio González
   */
  getEmpresas() {
    this.numero = 0;
    this.siscoV3Service.getService('empresa/getEmpresas').subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
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
    this.numero = 0;
    this.siscoV3Service.getService('cliente/getClientes').subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
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
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  calculaUnidad(e) {
    if (e < this.totalUnidades) {
      this.labelTotalUnidades = true;
    } else {
      this.labelTotalUnidades = false;
    }
  }

  /**
   * @description Obtiene los estatus disponibles de la base de datos
   * @returns Estatus en formato Json
   * @author Gerardo Zamudio González
   */
  getSelEstatus() {
    this.numero = 0;
    this.siscoV3Service.getService('cliente/getSelEstatus').subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.estatus = res.recordsets[0];
          this.getFormaDePago();
        }
      },
      (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Obtiene las formas de pago disponibles de la base de datos
   * @returns FormasDePago en formato Json
   * @author Gerardo Zamudio González
   */
  getFormaDePago() {
    this.numero = 0;
    this.siscoV3Service.getService(`contrato/getFormaDePago`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.formasDePago = res.recordsets[0];
          this.getTipoOperacion();
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Obtiene los tipo de operacion disponibles de la base de datos
   * @returns Tipos
   * Operacion en formato Json
   * @author Gerardo Zamudio González
   */
  getTipoOperacion() {
    this.numero = 0;
    this.siscoV3Service.getService(`contrato/getTipoOperacion`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.tiposDeOperacion = res.recordsets[0];
          this.getContatoData();
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Carga los datos principales de la pagina
   * @author Gerardo Zamudio González
   */
  loadData() {
    try {
      this.labelTotalUnidades = false
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        this.rfcEmpresa = parametros.rfcEmpresa;
        this.numeroContrato = parametros.numeroContrato;
        this.numero = 0;
      });
      if (this.numeroContrato) {
        this.ConfigurarFooter(false);
      } else {
        this.ConfigurarFooter(true);
      }
      this.getEmpresas();
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  private construyeBreadcrumb(modulos: any) {
    this.modulo = Negocio.GetModulo(this.claveModulo, modulos, this.idClase);
    if (this.modulo.breadcrumb) {
      // tslint:disable-next-line:max-line-length
      this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { numeroContrato: this.numeroContrato }, { idCliente: this.idCliente }]);
    }
  }


  /**
   * @description Prepara los datos en formato json para enviarlos a la base de datos
   * @returns Ejecuta el metodo updateData
   * @author Gerardo Zamudio González
   */
  modificarContrato() {
    try {
      let fechaIn;
      let fechaTer;
      if (this.contratoForm.controls.fechaInicio.value) {
        fechaIn = moment(
          this.contratoForm.controls.fechaInicio.value
        ).format('YYYY-MM-DD');
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
      this.numero = 0;
      if (fechaIn > fechaTer) {
        this.numero = 1;
        this.validaFecha = true;
      } else {
        if (this.contratoForm.controls.manejoDePresupuesto.value) {
          if (!this.contratoForm.controls.presupuesto.value || this.contratoForm.controls.presupuesto.value === 0) {
            this.numero = 1;
            return this.snackBar.open('El presupuesto es un campo obligatorio.', 'Ok');
          }
        }
        if (this.contratoForm.controls.manejoDeUtilidad.value) {
          if (!this.contratoForm.controls.manejoDeUtilidad.value || this.contratoForm.controls.manejoDeUtilidad.value === 0) {
            this.numero = 1;
            return this.snackBar.open('El manejo de utilidad es un campo obligatorio.', 'Ok');
          }
        }
        this.validaFecha = false;
        const equipamientoA = this.claseActual === 'Automovil' ? this.contratoForm.controls.equipamiento.value : false ;
        const data = {
          rfcEmpresa: this.contratoForm.controls.rfcEmpresa.value,
          idCliente: this.contratoForm.controls.idCliente.value,
          numeroContrato: this.contratoForm.controls.numeroContrato.value,
          nombre: this.contratoForm.controls.nombre.value,
          idClienteFinal: this.contratoForm.controls.idClienteFinal.value,
          idEstatus: this.contratoForm.controls.idEstatus.value,
          fechaInicio: fechaIn,
          fechaFin: fechaTer,
          fechaFirma: this.contratoForm.controls.fechaFirma.value,
          equipamiento: equipamientoA,
          cantidad: this.contratoForm.controls.totalUnidades.value,
          mantenimiento: this.contratoForm.controls.mantenimiento.value,
          idFileAvatar: this.contratoForm.controls.idFileAvatar.value,
          idTipoOperacion: this.contratoForm.controls.idTipoOperacion.value,
          manejoDeUtilidad: this.contratoForm.controls.manejoDeUtilidad.value,
          porcentajeUtilidad: this.contratoForm.controls.porcentajeUtilidad.value,
          idFormaDePago: this.contratoForm.controls.idFormaDePago.value,
          geolocalizacion: this.contratoForm.controls.geolocalizacion.value,
          manejoDePresupuesto: this.contratoForm.controls.manejoDePresupuesto.value,
          unidadSustituto: this.contratoForm.controls.unidadSustituto.value,
          idApariencia: this.contratoForm.controls.idApariencia.value,
          controlDeTiempo: this.contratoForm.controls.controlDeTiempo.value,
          folio: this.contratoForm.controls.folio.value,
          presupuesto: this.contratoForm.controls.presupuesto.value,
          aplicaEncuesta: this.contratoForm.controls.aplicaEncuesta.value
        };
        this.updateData(`cliente/putActualizaContrato`, data);
      }
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog update-alert
   * @param url La Url para editar un documento
   * @param datos Los datos que se van a editar
   * @returns Recarga la pagina
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
        this.numero = 1;
        if (result === 1) {
          this.loadData();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }


  /**
   * @description Llena el IUploadFile con sus respectivos valores
   * @returns Obtiene la variable IUploadFile para poder insertar una foto o documento
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
