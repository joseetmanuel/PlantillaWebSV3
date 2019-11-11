import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from '../../../../../environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ins-provedor-equipamiento',
  templateUrl: './ins-provedor-equipamiento.component.html',
  styleUrls: ['./ins-provedor-equipamiento.component.scss'],
  providers: [SiscoV3Service]
})
export class InsProvedorEquipamientoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  subsNegocio: Subscription;

  claveModulo = 'app-ins-provedor-equipamiento';
  modulo: any = {};
  breadcrumb: any[];
  state;

  public numero = 1;
  ruta: any;
  public rfcEmpresa;
  public idCliente;
  public numeroContrato;
  proveedores;
  IUploadFile: IFileUpload;
  url;
  monedas;


  provedoresForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    rfcProveedor: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    cotizacion: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]),
    idMoneda: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required])
  });

  constructor(
    private router: Router,
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
        this.provedoresForm.controls.idUsuario.setValue(this.idUsuario);
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.state = state;
            this.idClase = state2.claseActual;
            this.getParams(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }


  /**
   * Obtiene los datos de los parametros ya carga la data de la pagina.
   */
  getParams(state) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { numeroContrato: this.numeroContrato }, { idCliente: this.idCliente }]);
      }
      this.provedoresForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
      this.provedoresForm.controls.idCliente.setValue(this.idCliente);
      this.provedoresForm.controls.numeroContrato.setValue(
        this.numeroContrato
      );
      this.getProveedores();
      this.getMonedas();
    });
  }

  /**
   * Llena el select con los proveedores disponibles.
   */
  getProveedores() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        `contrato/proveedor/listado/${this.rfcEmpresa}/${this.idCliente}/${
        this.numeroContrato
        }`
      )
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.proveedores = res.recordsets[0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * Llena el select con las monedas disponibles.
   */
  getMonedas() {
    this.numero = 0;
    this.siscoV3Service.getService('common/moneda/lista').subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.monedas = res.recordsets[0];
          this.asignaPesos(res.recordsets[0]);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  asignaPesos(monedas) {
    // tslint:disable-next-line: prefer-for-of
    for (let x = 0; x < monedas.length; x++) {
      if (monedas[x].currency === 'Pesos') {
        this.provedoresForm.controls.idMoneda.setValue(monedas[x].id);
      }
    }
  }

  /**
   * Inserta un nuevo proveedor equipamiento.
   */
  insProveedor() {
    this.numero = 0;
    const data = {
      rfcEmpresa: this.provedoresForm.controls.rfcEmpresa.value,
      idCliente: this.provedoresForm.controls.idCliente.value,
      numeroContrato: this.provedoresForm.controls.numeroContrato.value,
      rfcProveedor: this.provedoresForm.controls.rfcProveedor.value,
      nombre: this.provedoresForm.controls.nombre.value,
      cotizacion: this.provedoresForm.controls.cotizacion.value,
      idMoneda: this.provedoresForm.controls.idMoneda.value,
      // idUsuario: this.provedoresForm.controls.idUsuario.value
    };
    this.siscoV3Service.postService('contrato/actividad/nuevo', data).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          const idActividad = res.recordsets[0][0].idActividad;
          this.router.navigateByUrl(
            `/upd-proveedor-equipamiento/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}/${idActividad}`
          );
          this.snackBar.open(
            'Proveedor equipamiento agregado exitosamente.',
            'Ok',
            {
              duration: 2000
            }
          );
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ins-proveedor-equipamiento.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }
}
