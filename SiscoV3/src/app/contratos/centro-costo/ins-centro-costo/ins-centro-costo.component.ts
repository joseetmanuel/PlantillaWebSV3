import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExcepcionComponent } from '../../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../models/negocio.model';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ins-centro-costo',
  templateUrl: './ins-centro-costo.component.html',
  styleUrls: ['./ins-centro-costo.component.scss']
})
export class InsCentroCostoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  modulo;
  claveModulo = 'app-ins-centro-costo';
  breadcrumb: any[];
  state;
  numero = 1;
  subsNegocio: Subscription;

  idCliente;
  rfcEmpresa;
  numeroContrato;

  validaFecha = false;

  centroCostoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    presupuesto: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]),
    idUsuario: new FormControl('', [Validators.required])
  });


  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.state = state;
            this.idClase = state2.claseActual;
            this.centroCostoForm.controls.idUsuario.setValue(this.idUsuario);
            this.getParamsValue(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  getParamsValue(state) {
    this.activatedRoute.params.subscribe(parametros => {
      // this.numero = 0;
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
      this.centroCostoForm.controls.idCliente.setValue(this.idCliente);
      this.centroCostoForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
      this.centroCostoForm.controls.numeroContrato.setValue(this.numeroContrato);
      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }]);
      }
    });
  }

  insCentroCosto() {
    this.numero = 0;
    const data = {
      rfcEmpresa: this.centroCostoForm.controls.rfcEmpresa.value,
      idCliente: this.centroCostoForm.controls.idCliente.value,
      numeroContrato: this.centroCostoForm.controls.numeroContrato.value,
      nombre: this.centroCostoForm.controls.nombre.value,
      presupuesto: this.centroCostoForm.controls.presupuesto.value
    };
    this.siscoV3Service.postService(`contrato/postInsCentroCosto`, data).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.error) {
          // this.excepciones(res.error, 4);
          this.snackBar.open(res.error, 'Ok');
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Centro costo agregado exitosamente.', 'Ok', {
            duration: 2000
          });
          const idCentroCosto = res.recordsets[1][0].idCentroCosto;
          this.router.navigateByUrl(`upd-centro-costo/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${idCentroCosto}`);
        }
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );

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
          moduloExcepcion: 'ins-centro-costo.component',
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
