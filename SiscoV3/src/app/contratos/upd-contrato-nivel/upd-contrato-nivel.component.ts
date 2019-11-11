import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { ErrorStateMatcher } from '@angular/material';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';

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
  selector: 'app-upd-contrato-nivel',
  templateUrl: './upd-contrato-nivel.component.html',
  providers: [SiscoV3Service]
})
export class UpdContratoNivelComponent implements OnInit, OnDestroy {


  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-upd-contrato-nivel';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  spinner = true;
  breadcrumb: any[];
  numeroContrato: string;
  idCliente: number;
  idUsuario: number;
  subsNegocio: Subscription;
  matcher = new MyErrorStateMatcher();
  idContratoNivel: number;
  ordenAnterior: number;
  nivelForm = new FormGroup({
    nivel: new FormControl('', [Validators.required]),
    orden: new FormControl('', [Validators.required])
  });


  constructor(private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private store: Store<AppState>) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.activatedRoute.params.subscribe(parametros => {
      this.idContratoNivel = parametros.idContratoNivel;
    });
  }

  ngOnInit() {
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;
        this.spinner = false;

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */

        if (stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(false);
        } else {
          this.ConfigurarFooter(true);
        }

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
            [{ idContratoNivel: this.idContratoNivel }]);
        }

        this.numeroContrato = this.contratoActual.numeroContrato;
        this.idCliente = this.contratoActual.idCliente;

      });

      this.setValues();
    });
  }

  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  /**
   * @description  Se setean valores de input
   * @returns Valores que tiene el nivel contrato
   * @author Edgar Mendoza Gómez
   */

  setValues() {
    this.spinner = true;
    this.siscoV3Service.getService('common/GetValuesContratoNivel?idContratoNivel=' + this.idContratoNivel).subscribe((res: any) => {
      this.spinner = false;
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.ordenAnterior = res.recordsets[0][0].orden;

        const data = res.recordsets[0][0];
        if (data) {
          this.nivelForm.controls.nivel.setValue(data.descripcion);
          this.nivelForm.controls.orden.setValue(data.orden);

        }

      }
    }, (error: any) => {
      this.spinner = false;
    });
  }

  /**
   * @description  Actualiza nivel contrato
   * @returns Devuelve si fue exitosa o hubo error al actualziar
   * @author Edgar Mendoza Gómez
   */
  updNivelContrato() {
    this.spinner = true;
    let actualizaOrden = 0;

    if (this.ordenAnterior === this.nivelForm.controls.orden.value) {
      actualizaOrden = 0;

    } else {
      actualizaOrden = 1;

    }
    const data = {

      idContratoNivel: this.idContratoNivel,
      nivel: this.nivelForm.controls.nivel.value,
      orden: this.nivelForm.controls.orden.value,
      actualizaOrden
    };

    this.siscoV3Service.putService('common/PutUpdContratoNivel', data)
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          if (res.error !== '') {
            this.snackBar.open(res.error, 'Ok', {
              duration: 4000
            });
          } else {
            this.snackBar.open('Se ha actualizado correctamente el nivel de contrato.', 'Ok', {
              duration: 2000
            });
            this.router.navigateByUrl('/upd-zonas');
          }
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'upd-contrato-nivel.component',
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
