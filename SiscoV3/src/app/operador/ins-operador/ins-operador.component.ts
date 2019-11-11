import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { MatDialog, MatSnackBar } from '@angular/material';
import {
  FormGroup,
  FormControl,
  NgForm,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { ExcepcionComponent } from './../../utilerias/excepcion/excepcion.component';
import { IBuscador, TipoBusqueda, IViewer, IViewertipo, IViewersize } from './../../interfaces';
import { SiscoV3Service } from './../../services/siscov3.service';
import { AppState, selectContratoState } from './../../store/app.states';
import { Negocio } from 'src/app/models/negocio.model';
import { BaseService } from '../../services/base.service';


@Component({
  selector: 'app-ins-operador',
  templateUrl: './ins-operador.component.html',
  providers: [SiscoV3Service]
})
export class InsOperadorComponent implements OnInit, OnDestroy {
  getStateNegocio: Observable<any>;
  claveModulo = 'app-ins-operador';
  spinner = false;
  idUsuario: number;
  idClase: string;
  titleClase: string;
  logo: string;
  modulo: any = {};
  breadcrumb: any;
  /*variables para el contrato activo*/
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  idCliente: number;
  subscriptionNegocio: Subscription;
  /** variables para el buscador de usuario */
  usuariosAsignados: any;
  operador: number;
  buscador: IBuscador;
  IViewerUsu: IViewer[];
  /** variables para el form de usuario */
  usuarioForm = new FormGroup({
    usuarioOperador: new FormControl('', [Validators.required])
    /** estatus: new FormControl('', [Validators.required]) */
  });

  constructor(private router: Router, private store: Store<AppState>,
    private baseService: BaseService,
    public dialog: MatDialog) {
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.IViewerUsu = [{
      idDocumento: 16964,
      tipo: IViewertipo.avatar,
      descarga: false,
      size: IViewersize.md
    }];

    this.buscador = {
      isActive: true,
      tipoBusqueda: TipoBusqueda.usuario,
      parametros: {
        buscarPorJerarquia: false,
        idUsuario: 0,
        busqueda: this.usuarioForm.get('usuarioOperador').value
      }
    };
    try {
      this.titleClase = 'Operadores';
      const usuario = this.baseService.getUserData();
      this.idUsuario = usuario.user.id;
      this.subscriptionNegocio = this.getStateNegocio.subscribe((stateN) => {
        if (stateN && stateN.claseActual) {
          this.contratoActual = stateN.contratoActual;
          this.idClase = stateN.claseActual;

          this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
          if (this.modulo.breadcrumb) {
            this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
          }

          if (this.contratoActual !== null) {
            this.numeroContrato = this.contratoActual.numeroContrato;
            this.idCliente = this.contratoActual.idCliente;

            // this.Grid();
          }

          if (stateN.contratoActual && this.modulo.contratoObligatorio) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }
  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  /**
   * Funcion de el buscador de usuarios
   *
   * @param $event evento que lanza el buscador
   */
  responseBuscador($event) {
    if ($event !== null) {
      this.operador = $event.recordsets[0].Id;
      this.usuarioForm.controls.usuarioOperador.setValue(this.operador);
      this.usuariosAsignados = $event.recordsets[0];

      this.IViewerUsu = [{
        idDocumento: this.usuariosAsignados.IdAvatar,
        tipo: IViewertipo.avatar,
        descarga: false,
        size: IViewersize.sm
      }];

      let viewer: any = JSON.stringify(this.IViewerUsu);
      viewer = JSON.parse(viewer);
      viewer[0].idDocumento = $event.recordsets[0].IdAvatar;
      this.IViewerUsu = viewer;
    }
  }

  Asignar(usuario: number) {
    if (usuario > 0) {
      this.router.navigateByUrl(
        'upd-operador/' + usuario
      );
    }

  }
  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de la escecpción lanzada
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'operador.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.subscriptionNegocio.unsubscribe();
  }


}
