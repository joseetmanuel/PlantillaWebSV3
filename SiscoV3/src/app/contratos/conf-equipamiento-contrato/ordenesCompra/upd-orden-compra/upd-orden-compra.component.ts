import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../../../../interfaces';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DeleteAlertComponent } from '../../../../utilerias/delete-alert/delete-alert.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from '../../../../utilerias/excepcion/excepcion.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upd-orden-compra',
  templateUrl: './upd-orden-compra.component.html',
  styleUrls: ['./upd-orden-compra.component.scss'],
  providers: [SiscoV3Service]
})
export class UpdOrdenCompraComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  subsNegocio: Subscription;

  claveModulo = 'app-upd-orden-compra';
  modulo: any = {};
  breadcrumb: any[];
  state;

  public numero = 1;
  ruta: any;
  public rfcEmpresa;
  public numeroContrato;
  public idCliente;
  public idOrden;
  ordenForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    idOrden: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required]),
  });
  ordenCompra;

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
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
   * Llena los datos de la orden a actualizar
   */
  fillOrdenCompra(orden) {
    const date = moment(orden.fecha, 'YYYY-MM-DD').utc();
    this.ordenForm.controls.rfcEmpresa.setValue(orden.rfcEmpresa);
    this.ordenForm.controls.idCliente.setValue(orden.idCliente);
    this.ordenForm.controls.numeroContrato.setValue(orden.numeroContrato);
    this.ordenForm.controls.idUsuario.setValue(orden.idUsuario);
    this.ordenForm.controls.descripcion.setValue(orden.descripcion);
    this.ordenForm.controls.idOrden.setValue(orden.idOrden);
    this.ordenForm.controls.fecha.setValue(date);
  }

  /**
   * Obtiene los datos de la orden que se va a actualizar
   */
  getOrdenCompra(rfc, idCliente, numeroContrato, idOrden) {
    this.numero = 0;
    this.siscoV3Service.getService(`orden/informacion/${rfc}/${idCliente}/${numeroContrato}/${idOrden}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.ordenCompra = res.recordsets[0][0];
          this.fillOrdenCompra(this.ordenCompra);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 1);
      }
    );
  }


  /**
   * Obtiene los datos de los parametros y los asigna a su valor correspondiente
   */
  getParamsValue(state) {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.ordenForm.controls.rfcEmpresa.setValue(parametros.rfcEmpresa);
        this.ordenForm.controls.idCliente.setValue(parametros.idCliente);
        this.ordenForm.controls.numeroContrato.setValue(
          parametros.numeroContrato
        );
        this.ordenForm.controls.idOrden.setValue(parametros.idOrden);
        this.rfcEmpresa = parametros.rfcEmpresa;
        this.numeroContrato = parametros.numeroContrato;
        this.idCliente = parametros.idCliente;
        this.idOrden = parametros.idOrden;
        this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

        if (this.modulo.breadcrumb) {
          // tslint:disable-next-line:max-line-length
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{rfcEmpresa: this.rfcEmpresa}, {numeroContrato: this.numeroContrato}, {idCliente: this.idCliente}, {idOrden: this.idOrden}]);
        }
        this.getOrdenCompra(parametros.rfcEmpresa, parametros.idCliente, parametros.numeroContrato, parametros.idOrden);
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /**
   * Modifica una orden
   */
  modificarOrden() {
    try {
      const fechaM = moment(
        this.ordenForm.controls.fecha.value
      ).format('YYYY-MM-DD');
      const data = {
        rfcEmpresa: this.ordenForm.controls.rfcEmpresa.value,
        idCliente: this.ordenForm.controls.idCliente.value,
        numeroContrato: this.ordenForm.controls.numeroContrato.value,
        // idUsuario: this.ordenForm.controls.idUsuario.value,
        descripcion: this.ordenForm.controls.descripcion.value,
        idOrden: this.ordenForm.controls.idOrden.value,
        fecha: fechaM
      };
      this.updateData('orden/actualiza', data);
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }


  /*
 Abre el dialog update-alert
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
        if (result === 1) {
          this.getParamsValue(this.state);
        }
      });
    } catch (error) {
      this.numero = 1;
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
          moduloExcepcion: 'upd-orden-compra.component',
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
