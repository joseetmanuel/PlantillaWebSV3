import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';

import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { Router } from '@angular/router';
import { FormularioDinamico } from '../../../../utilerias/clases/formularioDinamico.class';
import CustomStore from 'devextreme/data/custom_store';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ins-unidad-contrato',
  templateUrl: './ins-unidad-contrato.component.html',
  styleUrls: ['./ins-unidad-contrato.component.scss']
})
export class InsUnidadContratoComponent extends FormularioDinamico implements OnInit, OnDestroy {

  breadcrumb: any[];
  state;

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-unidad-contrato';
  idClase = '';
  modulo: any = {};

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;

  numero = 1;
  subsNegocio: Subscription;

  idCliente;
  rfcEmpresa;
  numeroContrato;

  conversiones;
  unidadContratoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idTipoObjeto: new FormControl('', [Validators.required]),
    modelo: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    idConversion: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    idUsuario: new FormControl('', [Validators.required])
  });
  gridDataSource: any;
  tipoObjetosColumns: any;
  tipoObjetos: any;
  tipoObjColumns = [];
  selectValues: any;
  gridBoxValue2;
  edita = false;

  constructor(
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    super();
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.unidadContratoForm.controls.idUsuario.setValue(this.idUsuario);
        this.subsNegocio = this.getStateNegocio.subscribe((stateN) => {
          if (stateN && stateN.claseActual) {
            this.idClase = stateN.claseActual;
            this.state = state;
            this.loadData(this.state);
            this.GetPropiedadesAll();
            this.LoadData();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /**
   * @description Carga los datos que se van a mostrar en la pagina
   * @param state Recibe el state para cuando se recarge la pagina ya tenga el state asignado.
   * @returns Datos que se le van a mostrar al usuario
   * @author Gerardo Zamudio González
   */
  loadData(state) {
    // tslint:disable-next-line: deprecation
    this.activatedRoute.params.subscribe(parametros => {
      // this.numero = 0;
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.unidadContratoForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
      this.unidadContratoForm.controls.idCliente.setValue(this.idCliente);
      this.unidadContratoForm.controls.numeroContrato.setValue(
        this.numeroContrato
      );
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }]);
      }
    });
  }

  /**
   * @description Carga el select dinamico con las Marcas y Sub-Marcas
   * @returns Ejecuta los metodos getConversiones(), GetPropiedades()
   * @author Gerardo Zamudio González
   */
  GetPropiedadesAll() {
    this.numero = 0;
    this.siscoV3Service
      .getService('tipoObjeto/GetPropiedadMarcas?idClase=' + this.idClase)
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.getConversiones();
            this.GetPropiedades(res.recordsets[0]);
          }
        },
        (error: any) => {
          this.excepciones(error, 2);
          this.numero = 1;
        }
      );
  }


  LoadData() {
    try {
      this.siscoV3Service.getService('tipoObjeto/GetTipoObjetos?idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excecion) {
            this.excepciones(res.err, 3);
          } else {
            this.tipoObjetos = res.recordsets[0];
            for (let data in this.tipoObjetos[0] ) {
              this.tipoObjColumns.push (data);
            }
            this.selectFillData(this.tipoObjetos);

            this.siscoV3Service.getService('tipoObjeto/GetTipoObjetosColumns?idClase=' + this.idClase)
              .subscribe((res2: any) => {
                this.numero = 1;
                this.tipoObjetosColumns = res2.recordsets[0];
                if (this.tipoObjetosColumns.length > 0) {
                  // tslint:disable-next-line: forin
                  for (const data in this.tipoObjetosColumns[0]) {
                    let tipoDato = '';
                    if (this.tipoObjetosColumns[0][data] === 'File' || this.tipoObjetosColumns[0][data] === 'Image') {
                      tipoDato = 'foto';
                    }

                  }

                }
              });

          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  selectFillData(datos) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoObjeto',
      load() {
        const json = datos;
        return json;
      }
    });
  }

  /**
   * Llenamos el select de conversiones
   */
  getConversiones() {
    this.numero = 0;
    this.siscoV3Service.getService('contrato/conversion/listado/0/0/1').subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.conversiones = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        this.excepciones(error, 1);
      }
    );
  }

  onSelectionChanged($event) {
    this.selectValues = $event.selectedRowsData[0].idTipoObjeto;
    this.unidadContratoForm.controls.idTipoObjeto.setValue(
      this.selectValues
    );
    // this.proveedorContratoForm.controls.proveedor.setValue(
    //   this.selectValues
    // );
  }

  get gridBoxValue(): number[] {
    return this.gridBoxValue2;
  }


  set gridBoxValue(value: number[]) {
    // this.gridBoxValue2 = value || [];
  }

  closeWindow($event: any) {
    if ($event) {
      $event.instance.close();
    }
  }


  /*
   * Inerta un tipo unidad
   */
  insTipoUnidad() {
    this.numero = 0;
    const data = {
      rfcEmpresa: this.unidadContratoForm.controls.rfcEmpresa.value,
      idCliente: this.unidadContratoForm.controls.idCliente.value,
      numeroContrato: this.unidadContratoForm.controls.numeroContrato.value,
      idClase: this.idClase,
      idTipoObjeto: this.selectValues,
      modelo: this.unidadContratoForm.controls.modelo.value,
      idConversion: this.unidadContratoForm.controls.idConversion.value,
      cantidad: this.unidadContratoForm.controls.cantidad.value,
      // idUsuario: this.unidadContratoForm.controls.idUsuario.value
    };
    this.siscoV3Service
      .postService('contrato/tipounidad/nuevo', data)
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            if (res.recordsets != null && res.recordsets.length > 0) {
              this.snackBar.open(
                res.recordsets[0][0].mensaje,
                'Ok'
              );
            } else {
              this.unidadContratoForm.reset();
              this.unidadContratoForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
              this.unidadContratoForm.controls.idCliente.setValue(
                this.idCliente
              );
              this.unidadContratoForm.controls.numeroContrato.setValue(
                this.numeroContrato
              );
              this.unidadContratoForm.controls.idUsuario.setValue(this.idUsuario);
              this.snackBar.open(
                'Tipo de unidad insertada correctamente.',
                'Ok',
                {
                  duration: 2000
                }
              );
              // tslint:disable-next-line:max-line-length
              this.router.navigateByUrl(`/upd-unidad-contrato/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${this.selectValues}`);
            }
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
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
          moduloExcepcion: 'ins-unidad-contrato.component',
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
