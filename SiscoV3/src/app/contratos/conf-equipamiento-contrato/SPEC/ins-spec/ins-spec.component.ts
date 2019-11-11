import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../../../services/siscov3.service';
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
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ins-spec',
  templateUrl: './ins-spec.component.html',
  styleUrls: ['./ins-spec.component.sass']
})
export class InsSpecComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  subsNegocio: Subscription;

  claveModulo = 'app-ins-spec';
  modulo: any = {};
  breadcrumb: any[];
  state;

  public numero = 1;
  ruta: any;
  rfcEmpresa;
  numeroContrato;
  idCliente;
  specs;
  checked = false;
  arr = [];

  specForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required])
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.specForm.controls.idUsuario.setValue(this.idUsuario);
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
   * Obtiene los datos de los parametros
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
      this.ruta = [{
        label: 'home',
        url: '/home-cliente'
      },
      {
        label: 'Contratos',
        url: '/sel-contratos'
      },
      {
        label: 'Configura equipamiento contrato',
        url: `/conf-equipamiento-contrato/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}`
      },
      {
        label: 'Alta SPEC',
        url: `/ins-spec/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}`
      }
      ];
      this.getListado();
    });
  }

  /**
   * Crea el XML conforme los proveedores disponibles por el contrato (Como apenas se va a insertar el SPEC los proveedores
   * van a estar deshabilitados).
   */
  createXML(data) {
    for (let x = 0; x <= data.length - 1; x++) {
      this.arr.push({ id: data[x].idActividad, activo: 0 });
      if (x <= data.length) {
      }
    }
  }

  valida(d, id) {
    if (d.checked) {
      const index = this.arr.findIndex((item, i) => {
        return item.id === id;
      });
      this.arr[index].activo = 1;
    } else {
      const index = this.arr.findIndex((item, i) => {
        return item.id === id;
      });
      this.arr[index].activo = 0;
    }
  }

  insSpec() {
    const that = this;
    let cont = 0;
    let data = `<Ids>`;
    // tslint:disable-next-line:only-arrow-functions
    this.arr.forEach(function(element, indes, array) {
      data += `<actividad><id>${element.id}</id><activo>${element.activo}</activo></actividad>`;
      cont++;
      if (cont === array.length) {
        data += `</Ids>`;
        const datos = {
          rfcEmpresa: that.rfcEmpresa,
          idCliente: that.idCliente,
          numeroContrato: that.numeroContrato,
          nombre: that.specForm.controls.nombre.value,
          descripcion: that.specForm.controls.descripcion.value,
          Data: data,
          // idUsuario: that.specForm.controls.idUsuario.value
        };
        that.insSpecActivity(datos);
      }
    });
  }

  insSpecActivity(datos) {
    this.numero = 0;
    this.siscoV3Service.postService('contrato/spec/actividad/nuevo', datos).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.router.navigateByUrl(`/conf-equipamiento-contrato/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}`);
          this.snackBar.open('SPEC insertado exitosamente.', 'Ok', {
            duration: 2000
          });
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  getListado() {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/spec/disponibles/listado/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.specs = res.recordsets[0];
          this.createXML(this.specs);
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
          moduloExcepcion: 'ins-spec.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }

}
