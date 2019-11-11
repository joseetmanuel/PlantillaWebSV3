import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { SiscoV3Service } from '../../services/siscov3.service';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { Router } from '@angular/router';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';



@Component({
  selector: 'app-ins-agrupador-tipoobjeto',
  templateUrl: './ins-agrupador-tipoobjeto.component.html'
})
export class InsAgrupadorTipoobjetoComponent implements OnInit, OnDestroy {
  spinner = false;
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-agrupador-tipoobjeto';
  idClase: string;
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  breadcrumb: any[];
  idUsuario: number;
  subsNegocio: Subscription;

  agrupadorForm = new FormGroup({
    agrupador: new FormControl('', [Validators.required])
  });

  constructor(private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private router: Router,
              private store: Store<AppState>) {

    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    // ******************ARREGLO CON LOS OBJETOS PERMITIDOS**************** */
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idClase = stateNegocio.claseActual;
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(true);
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

      });
    });
  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, define si el footer se abre o no por defecto.
   * @author Andres Farias
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  insAgrupador() {

    this.spinner = true;
    this.siscoV3Service.postService('solicitud/PostInsAgrupador', {
      nombreAgrupador: this.agrupadorForm.controls.agrupador.value
    })
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.router.navigateByUrl(
            '/upd-agrupador-tipoobjeto/' + res.recordsets[0][0].idAgrupador
          );
          this.snackBar.open('Se ha insertado correctamente agrupador.', 'Ok', {
            duration: 2000
          });
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });

  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 11,
          moduloExcepcion: 'ins-agrupador.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }



}
