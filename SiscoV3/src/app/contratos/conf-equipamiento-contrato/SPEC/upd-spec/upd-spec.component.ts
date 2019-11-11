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
  selector: 'app-upd-spec',
  templateUrl: './upd-spec.component.html',
  styleUrls: ['./upd-spec.component.sass']
})
export class UpdSpecComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  claveModulo = 'app-upd-spec';
  modulo: any = {};
  breadcrumb: any[];
  state;

  subsNegocio: Subscription;

  public numero = 1;
  ruta: any;
  rfcEmpresa;
  numeroContrato;
  idCliente;
  id;
  specs;
  checked = false;
  specData;
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
        this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
          if (state2 && state2.claseActual) {
            this.idClase = state2.claseActual;
            this.state = state;
            this.getParams(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  getParams(state) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.id = parametros.id;
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);
      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { numeroContrato: this.numeroContrato }, { idCliente: this.idCliente }, { id: this.id }]);
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
        label: 'Modifica SPEC',
        url: `/upd-spec/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}/${this.id}`
      }
      ];
      this.getSpecs();
    });
  }

  getSpecs() {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/spec/actividad/editar/${this.id}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/propiedades`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.specData = res.recordsets[0];
          this.fillSpecData(this.specData);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  fillSpecData(spec) {
    this.specForm.controls.nombre.setValue(spec[0].nombre);
    this.specForm.controls.descripcion.setValue(spec[0].descripcion);
    this.specForm.controls.idUsuario.setValue(spec[0].idUsuario);
    this.createXML(spec);
  }

  createXML(data) {
    for (let x = 0; x <= data.length - 1; x++) {
      this.arr.push(data.nombreActividad = { id: data[x].idActividad, activo: data[x].activo });
      if (x === data.length - 1) {
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

  updSpec() {
    const that = this;
    let cont = 0;
    let data = `<Ids>`;
    // tslint:disable-next-line:only-arrow-functions
    this.arr.forEach(function(element, index, array) {
      data += `<actividad><id>${element.id}</id><activo>${element.activo}</activo></actividad>`;
      cont++;
      if (cont === array.length) {
        data += `</Ids>`;
        const datos = {
          idSpec: that.id,
          nombre: that.specForm.controls.nombre.value,
          descripcion: that.specForm.controls.descripcion.value,
          rfcEmpresa: that.rfcEmpresa,
          idCliente: that.idCliente,
          numeroContrato: that.numeroContrato,
          data,
          // idUsuario: that.specForm.controls.idUsuario.value
        };
        that.updSpecActivity(datos);
      }
    });
  }

  updSpecActivity(datos) {
    this.numero = 0;
    this.siscoV3Service.putService(`contrato/spec/actividad/actualiza`, datos).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.router.navigateByUrl(`/conf-equipamiento-contrato/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}`);
          this.snackBar.open('SPEC modificado exitosamente.', 'Ok', {
            duration: 2000
          });
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
          moduloExcepcion: 'upd-spec.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }

}
