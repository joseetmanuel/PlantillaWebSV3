import { Component, OnDestroy } from '@angular/core';

import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../interfaces';
import { Observable } from 'rxjs';
import { selectAuthState, AppState, selectContratoState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from 'src/app/models/negocio.model';
import { AlertConfirmComponent } from 'src/app/utilerias/alert-confirm/alert-confirm.component';

@Component({
  selector: 'app-ins-proveedor',
  templateUrl: './ins-proveedor.component.html',
  providers: [SiscoV3Service]
})
export class InsProveedorComponent implements OnDestroy {
  public rfcProveedor: string;
  public rfcProveedorEntidad: string;
  public tipo = 2;
  public loading: boolean;
  public tituloDireccion = 'Direccion fiscal';
  breadcrumb: any;
  private idUsuario: string;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-proveedor';
  idClase = '';
  modulo: any = {};

  // Variables para Redux
  private getStateAuth: Observable<any>;
  private getStateNegocio: Observable<any>;
  subsNegocio: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>
  ) {
    this.getStateAuth = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAuth.subscribe((stateAutenticacion) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;

        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        if (this.modulo.contratoObligatorio) {
          if (stateNegocio.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }
      });
    });


    this.activatedRoute.params.subscribe(parametros => {
      this.rfcProveedor = parametros.rfcProveedor;
      this.rfcProveedorEntidad = parametros.rfcClienteEntidad;
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
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  /**
   * @description Guardar un nuevo proveedor.
   * @param $event Datos del formulario proveedor.
   * @author Andres Farias
   */
  AgregarProveedor($event) {
    try {
      this.loading = true;
      const proveedor: IProveedor = $event.data;
      proveedor.incluyeMantenimiento = 1;
      delete proveedor.lat;
      delete proveedor.lng;
      proveedor.incluyeMantenimiento = 1;

      this.siscoV3Service
        .postService('proveedor/postInsProveedor', proveedor)
        .subscribe(
          (res: any) => {
            this.loading = false;
            if (res.error) {
              // error tipo base de datos
              this.snackBar.open(res.error, 'Ok', {
                duration: 2000
              });

              try {
                const dialogRef = this.dialog.open(AlertConfirmComponent, {
                  width: '60%',
                  data: {
                    ruta : 'proveedor/putActivar',
                    params: { idClase: this.idClase, rfcProveedor: proveedor.rfcProveedor },
                    message: 'Ya existe el proveedor en estatus inactivo, ¿desea activarlo?'
                  }
                });
          
                dialogRef.afterClosed().subscribe((result: any) => {
                  if (result === 1) {
                    this.router.navigateByUrl('/upd-proveedor/' + proveedor.rfcProveedor);
                    this.snackBar.open('Se ha activado el proveedor.', 'Ok', {
                      duration: 2000
                    });
                  }
                });
              } catch (error) {
                this.Excepciones(error, 1);
              }

            } else if (res.excepcion) {
              this.loading = false;
              // excepcion de conexion a la base de datos
              this.Excepciones(res.excepcion, 3);
            } else {
              this.loading = false;
              // tslint:disable-next-line: no-shadowed-variable
              if (res.recordsets[0]) {
                const proveedor: IProveedor = res.recordsets[0][0];
               
                this.router.navigateByUrl('/upd-proveedor/' + proveedor.rfcProveedor);
                this.snackBar.open('Se ha guardado el proveedor.', 'Ok', {
                  duration: 2000
                });
                 
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

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
  }
}

