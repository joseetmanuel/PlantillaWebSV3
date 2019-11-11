import { Component, OnInit, OnDestroy } from '@angular/core';

import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../interfaces';
import { Observable } from 'rxjs';
import { selectAuthState, AppState, selectContratoState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { Negocio } from 'src/app/models/negocio.model';

@Component({
  selector: 'app-ins-proveedor-propio',
  templateUrl: './ins-proveedor-propio.component.html'
})
export class InsProveedorPropioComponent implements OnInit, OnDestroy {

  public rfcProveedor: string;
  public rfcProveedorEntidad: string;
  public tipo = 2;
  public loading: boolean;
  public tituloDireccion = 'Direccion fiscal';
  breadcrumb: any;
  private idUsuario: string;
  public contratoSeleccionado: any;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-proveedor-propio';
  idClase = '';
  modulo: any = {};

  private getStateAuth: Observable<any>;
  private getStateNegocio: Observable<any>;
  contratos: any = [];
  subsNegocio: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
  ) {
    this.getStateAuth = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAuth.subscribe((stateAutenticacion) => {
        if (stateAutenticacion.seguridad) {
          this.idUsuario = stateAutenticacion.seguridad.user.id;
          this.idClase = stateNegocio.claseActual;
          this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }
      });
    });

    this.store.select(selectContratoState).subscribe((state: any) => {
      if (state.contratosSeleccionados) {
        this.contratos = state.contratosSeleccionados.filter((contrato: any) => {
          return contrato.incluyeMantenimiento === false;
        });
      }
    });

    this.activatedRoute.params.subscribe(parametros => {
      this.rfcProveedor = parametros.rfcProveedor;
      this.rfcProveedorEntidad = parametros.rfcClienteEntidad;
    });

    this.store.select(selectContratoState).subscribe((state: any) => {
      this.contratoSeleccionado = state.contratoActual;
    });

  }

  ngOnInit(): void {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(ContratoMantenimientoEstatus.sinMantenimiento, false, false, false, true)));
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }

  // #region AgregarProveedor
  /**
   * @description Guardar un nuevo proveedor.
   * @param $event Evento ejecutado del boton submit del fomulario form-proveedor-propio.
   * @author Andres Farias
   */
  AgregarProveedor($event) {
    try {
      this.loading = true;
      const proveedor = $event.data;
      proveedor.incluyeMantenimiento = 0;
      delete proveedor.lat;
      delete proveedor.lng;
      const contrato = $event.contrato;

      contrato.idCliente = this.contratoSeleccionado.idCliente;
      contrato.rfcEmpresa = this.contratoSeleccionado.rfcEmpresa;
      contrato.numeroContrato = this.contratoSeleccionado.numeroContrato;
      contrato.idUsuario = this.idUsuario;

      this.siscoV3Service
        .postService('proveedor/postInsProveedor', proveedor)
        .subscribe(
          (res: any) => {
            if (res.err) {
              this.loading = false;
              // error tipo base de datos
              this.Excepciones(res.err, 4);

            } else if (res.excepcion) {
              this.loading = false;
              // excepcion de conexion a la base de datos
              this.Excepciones(res.excepcion, 3);
            } else {
              this.loading = false;
              // tslint:disable-next-line: no-shadowed-variable
              const proveedor: IProveedor = res.recordsets[0][0];
              if (proveedor.rfcProveedor) {
                contrato.rfcProveedor = proveedor.rfcProveedor;
                this.AgregarContratoProveedor(contrato);
              }
            }
          },
          (error: any) => {
            // error de no conexion al servicio
            this.Excepciones(error, 2);
            this.loading = false;
          }
        );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description Guardar un nuevo proveedor.
   * @param contrato detalle del contrato seleccionado, se obtiene de redux.
   * @author Andres Farias
   */
  AgregarContratoProveedor(contrato: any) {
    const proveedor = '<Ids>'
      + '<rfcEmpresa>' + contrato.rfcEmpresa + '</rfcEmpresa>'
      + '<idCliente>' + contrato.idCliente + '</idCliente>'
      + '<numeroContrato>' + contrato.numeroContrato + '</numeroContrato>'
      + '<rfcProveedor>' + contrato.rfcProveedor + '</rfcProveedor>'
      + '</Ids>';

    this.loading = true;
    this.siscoV3Service.postService('contrato/proveedor/nuevo', { data: proveedor, idUsuario: this.idUsuario }).subscribe((res: any) => {
      this.loading = false;
      if (res.err) {
        this.loading = false;
        // error tipo base de datos
        this.Excepciones(res.err, 4);

      } else if (res.excepcion) {
        // excepcion de conexion a la base de datos
        this.Excepciones(res.excepcion, 3);
      } else {
        this.snackBar.open('Se a guardado el proveedor.', 'Ok', {
          duration: 2000
        });
        this.router.navigateByUrl('/upd-proveedor-propio/' + contrato.rfcProveedor);
      }
    }, (error: any) => {
      // error de no conexion al servicio
      this.Excepciones(error, 2);
      this.loading = false;
    });
  }
  // #endregion

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'add-cliente.component',
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
