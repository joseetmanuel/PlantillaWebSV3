import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ins-orden-compra',
  templateUrl: './ins-orden-compra.component.html',
  styleUrls: ['./ins-orden-compra.component.scss'],
  providers: [SiscoV3Service]
})
export class InsOrdenCompraComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  claveModulo = 'app-ins-orden-compra';
  modulo: any = {};
  breadcrumb: any[];
  state;
  subsNegocio: Subscription;

  ruta: any;
  numero = 1;
  ordenForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idUsuario: new FormControl(''),
    descripcion: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required])
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
        this.ordenForm.controls.idUsuario.setValue(this.idUsuario);
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.state = state;
            this.idClase = state2.claseActual;
            this.getParamsValue(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }


  /**
   * @description Obtiene los parametros de la url y los asigna a los datos correspondientes del ordenForm
   * @returns Obtiene los parametros de la url y los asigna a los datos correspondientes del ordenForm
   * @author Gerardo Zamudio González
   */
  getParamsValue(state) {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.ordenForm.controls.rfcEmpresa.setValue(parametros.rfcEmpresa);
        this.ordenForm.controls.idCliente.setValue(parametros.idCliente);
        this.ordenForm.controls.numeroContrato.setValue(
          parametros.numeroContrato
        );
        this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          // tslint:disable-next-line:max-line-length
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{rfcEmpresa: parametros.rfcEmpresa}, {numeroContrato: parametros.numeroContrato}, {idCliente: parametros.idCliente}]);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /**
   * @description Inserta una nueva orden de compra
   * @returns AL insertar una orden te redirige a la pagina upd-orden-compra
   * @author Gerardo Zamudio González
   */
  agregarOrden() {
    try {
      this.numero = 0;
      const fechaMoment = moment(
        this.ordenForm.controls.fecha.value
      ).format('YYYY-MM-DD');
      const data = {
        rfcEmpresa: this.ordenForm.controls.rfcEmpresa.value,
        idCliente: this.ordenForm.controls.idCliente.value,
        numeroContrato: this.ordenForm.controls.numeroContrato.value,
        // idUsuario: this.ordenForm.controls.idUsuario.value,
        descripcion: this.ordenForm.controls.descripcion.value,
        fecha: fechaMoment
      };
      this.siscoV3Service.postService('orden/nuevo', data).subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            const rfcEmpresa = this.ordenForm.controls.rfcEmpresa.value;
            const idCliente = this.ordenForm.controls.idCliente.value;
            const numeroContrato = this.ordenForm.controls.numeroContrato.value;
            const idOrden = res.recordsets[0][0].idOrden;
            this.router.navigateByUrl(
              `/upd-orden-compra/${rfcEmpresa}/${idCliente}/${numeroContrato}/${idOrden}`
            );
            this.snackBar.open('Orden registrada exitosamente.', 'Ok', {
              duration: 2000
            });
          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.excepciones(error, 1);
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
          moduloExcepcion: 'ins-orden-compra.component',
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
