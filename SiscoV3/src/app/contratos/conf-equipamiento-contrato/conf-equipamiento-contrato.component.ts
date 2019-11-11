import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { Subscription } from 'rxjs';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';

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
  selector: 'app-conf-equipamiento-contrato',
  templateUrl: './conf-equipamiento-contrato.component.html',
  styleUrls: ['./conf-equipamiento-contrato.component.sass'],
  providers: [SiscoV3Service]
})
export class EquipamientoContratoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  claveModulo = 'app-conf-equipamiento-contrato';
  modulo: any = {};
  breadcrumb: any[];
  state;

  subsNegocio: Subscription;

  ruta: any;
  public numero = 1;
  public idCliente;
  public rfcEmpresa;
  public numeroContrato;
  empresas;
  clientes;
  estatus;
  data;
  valClienteFinal;
  checked;
  checked2;
  estatusAct;

  matcher = new MyErrorStateMatcher();
  contratoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    idClienteFinal: new FormControl(''),
    idClase: new FormControl('', [Validators.required]),
    idEstatus: new FormControl('', [Validators.required]),
    fechaInicio: new FormControl(''),
    fechaFin: new FormControl(''),
    fechaFirma: new FormControl(''),
    idUsuario: new FormControl('', [Validators.required]),
    equipamiento: new FormControl(''),
    totalUnidades: new FormControl('', [Validators.required])
  });
  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.contratoForm.controls.idUsuario.setValue(this.idUsuario);
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.state = state;
            this.idClase = state2.claseActual;
            this.contratoForm.controls.idClase.setValue(this.idClase);
            this.loadData(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /*
    Se toma la configuración de que se bloquee la apertura y no realice cambios sobre el footer
  */
  ConfigurarFooter() {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, false, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  loadData(state) {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        this.rfcEmpresa = parametros.rfcEmpresa;
        this.numeroContrato = parametros.numeroContrato;
        this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

        if (this.modulo.breadcrumb) {
          // tslint:disable-next-line:max-line-length
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{rfcEmpresa: this.rfcEmpresa}, {numeroContrato: this.numeroContrato}, {idCliente: this.idCliente}]);
        }
        this.ConfigurarFooter();
        this.numero = 0;
        this.getEmpresas();
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

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

  /*
  Muestra u Ocualta las fechas cuando es estatus esta en ACT
  */
  cambioEstatus(val) {
    this.estatusAct = val;
  }

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

  getSelEstatus() {
    this.siscoV3Service.getService('cliente/getSelEstatus').subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.estatus = res.recordsets[0];
          this.getContatoData();
        }
      },
      (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  getContatoData() {
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
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.data = res.recordsets[0][0];
            this.fillContratoData(this.data);
          }
        },
        (error: any) => {
          this.excepciones(error, 2);
        }
      );
  }

  fillContratoData(data) {
    this.contratoForm.controls.rfcEmpresa.disable();
    this.contratoForm.controls.idCliente.disable();
    this.contratoForm.controls.idEstatus.disable();
    this.contratoForm.controls.idClienteFinal.disable();
    this.contratoForm.controls.rfcEmpresa.setValue(data.rfcEmpresa);
    this.contratoForm.controls.idCliente.setValue(data.idCliente);
    this.contratoForm.controls.numeroContrato.setValue(data.numeroContrato);
    this.contratoForm.controls.nombre.setValue(data.nombre);
    this.contratoForm.controls.idClienteFinal.setValue(data.idClienteFinal);
    this.contratoForm.controls.idClase.setValue(data.idClase);
    this.contratoForm.controls.idEstatus.setValue(data.idEstatus);
    this.contratoForm.controls.idUsuario.setValue(data.idUsuario);
    this.contratoForm.controls.equipamiento.setValue(data.equipamiento);
    this.contratoForm.controls.totalUnidades.setValue(data.totalUnidades);
    if (data.idClienteFinal) {
      this.valClienteFinal = true;
      this.checked = 'checked';
    }
    if (data.equipamiento === true) {
      this.checked2 = 'checked';
    }
    if (data.idEstatus === 'ACT') {
      const dateInicio = moment(data.fechaInicio, 'YYYY-MM-DD').utc();
      const dateFin = moment(data.fechaFin, 'YYYY-MM-DD').utc();
      const fechaFi = moment(data.fechaFirma, 'YYYY-MM-DD').utc();
      this.contratoForm.controls.fechaInicio.setValue(dateInicio);
      this.contratoForm.controls.fechaFin.setValue(dateFin);
      this.contratoForm.controls.fechaFirma.setValue(fechaFi);
      this.cambioEstatus(this.data.idEstatus);
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
