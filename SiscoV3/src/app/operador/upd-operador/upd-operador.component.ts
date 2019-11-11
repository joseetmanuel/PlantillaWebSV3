import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ErrorStateMatcher } from '@angular/material';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';

import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  IColumnHiding,
  ICheckbox,
  IEditing,
  IColumnchooser,
  TiposdeDato,
  TiposdeFormato,
  IViewer, IViewertipo, IViewersize
} from './../../interfaces';
import { SiscoV3Service } from './../../services/siscov3.service';
import { AppState, selectContratoState } from './../../store/app.states';
import { Negocio } from 'src/app/models/negocio.model';
import { ExcepcionComponent } from './../../utilerias/excepcion/excepcion.component';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { BaseService } from '../../services/base.service';

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
  selector: 'app-upd-operador',
  templateUrl: './upd-operador.component.html',
  providers: [SiscoV3Service]
})
export class UpdOperadorComponent implements OnInit, OnDestroy {
  getStateNegocio: Observable<any>;
  claveModulo = 'app-upd-operador';
  claveModInsertar = 'app-updIns-operador';
  spinner = false;
  idUsuario: number;
  idClase: string;
  titleClase: string;
  logo: string;
  modulo: any = {};
  moduloInsert: any = {};
  breadcrumb: any;
  breadcrumbIns: any;
  /*variables para el contrato activo*/
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  idCliente: number;
  matcher = new MyErrorStateMatcher();
  /** variables para el form de operadores */
  operadorForm = new FormGroup({
    estado: new FormControl({ value: '', disabled: true }, [
      Validators.required
    ]),
    municipio: new FormControl(
      { value: '', disabled: true },
      [Validators.required]
    ),
    cp: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(5),
      Validators.pattern('^[0-9]*$')
    ]),
    tipoAsentamiento: new FormControl('', [Validators.required]),
    asentamiento: new FormControl({ value: '', disabled: true }, [
      Validators.required
    ]),
    tipoVialidad: new FormControl('', [Validators.required]),
    vialidad: new FormControl('', [Validators.required]),
    numeroExterior: new FormControl(''),
    numeroInterior: new FormControl('')
  });

  public municipios;
  public tipoVialidades;
  public tipoAsentamientos;
  public asentamientos;
  public idPais;
  public idEstado;
  public idMunicipio;
  public valCp = false;
  @ViewChild('cp') cp;
  @ViewChild('municipio') municipio;
  public dataUser: any;
  public operadorObjetos: any;
  public tipoObjetos: any;
  public operador: any;
  public idOperador: number;
  public IViewerOperador: IViewer[];
  subscriptionNegocio: Subscription;
  /** variables parael grid */
  datosevent: any;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];

  constructor(private snackBar: MatSnackBar,
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>,
    private baseService: BaseService,
    public dialog: MatDialog) {

    this.getStateNegocio = this.store.select(selectContratoState);

    this.activatedRoute.params.subscribe(parametros => {
      this.idOperador = parametros.idOperador;
    });
  }

  ngOnInit() {
    this.spinner = true;

    try {
      const usuario = this.baseService.getUserData();
      this.idUsuario = usuario.user.id;
      this.subscriptionNegocio = this.getStateNegocio.subscribe((stateN) => {
        if (stateN && stateN.claseActual) {
          this.contratoActual = stateN.contratoActual;
          this.idClase = stateN.claseActual;


          if (this.contratoActual !== null) {
            this.numeroContrato = this.contratoActual.numeroContrato;
            this.idCliente = this.contratoActual.idCliente;
            this.DataOperadorObjetos();
            this.DataUser();
            this.GetTipoVialidad();
            this.GetTipoAsentamiento();
            this.Grid();

            this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
            if (this.modulo.breadcrumb) {
              this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
                [{ idOperador: this.idOperador }]);
            }

            this.moduloInsert = Negocio.GetModulo(this.claveModInsertar, usuario.permissions.modules, this.idClase);
            if (this.moduloInsert.breadcrumb) {
              this.breadcrumbIns = Negocio.GetConfiguracionBreadCrumb(this.moduloInsert.breadcrumb, this.idClase,
                [{ idOperador: this.idOperador }]);
            }


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

  Grid() {
    const pageSizes = [];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };
    this.exportExcel = { enabled: true, fileName: this.titleClase };
    this.columnHiding = { hide: true };
    this.Checkbox = { checkboxmode: 'multiple' };
    this.Editing = { allowupdate: false };
    this.Columnchooser = { columnchooser: true };
    this.scroll = { mode: 'standard' };

    /*
    Parametros de Search
    */
    this.searchPanel = {
      visible: true,
      width: 200,
      placeholder: 'Buscar...',
      filterRow: true
    };
    this.toolbar = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        visible: true
      }
    ];
  }
  /**
   * @description Cuando le den enter en el capo de Código postal ejecutará el metodo getCp().
   * @param $event Tipo de tecla que se preciono
   * @returns Ejecuta el metodo getCp()
   */
  onKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  DataUser() {
    this.siscoV3Service.getService('seguridad/getUsuario?idUser=' + this.idOperador).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.dataUser = res.recordsets[0];
          this.dataUser.forEach(element => {
            this.IViewerOperador = [{
              idDocumento: element.Avatar,
              tipo: IViewertipo.avatar,
              descarga: false,
              size: IViewersize.md
            }];
          });
        }
      },
      (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      }
    );
  }

  DataOperadorObjetos() {

    this.siscoV3Service.getService('operador/getAsignacionesOperador?idUsers=' + this.idOperador
      + '&numContrato=' + this.numeroContrato).subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.operador = res.recordsets[0];
            /** mostrando los datos ya insertados de el operador  */
            this.operador.forEach(op => {
              this.operadorForm.controls.cp.setValue(op.codigoPostal);
              this.operadorForm.controls.estado.setValue(op.estadoNombre);
              this.operadorForm.controls.municipio.setValue(op.municipioNombre);
              this.operadorForm.controls.tipoAsentamiento.setValue(op.idTipoAsentamiento);
              this.operadorForm.controls.tipoVialidad.setValue(op.idTipoVialidad);
              this.operadorForm.controls.asentamiento.setValue(op.asentamiento);
              this.operadorForm.controls.vialidad.setValue(op.vialidad);
              this.operadorForm.controls.numeroExterior.setValue(op.numeroExterior);
              this.operadorForm.controls.numeroInterior.setValue(op.numeroInterior);
            });

            this.operadorObjetos = res.recordsets[1];
            if (this.operadorObjetos.length > 0) {
              this.siscoV3Service.getService('objeto/getObjetoId?idClase=' + this.idClase + '&&numeroContrato='
                + this.numeroContrato + '&&idCliente=' + this.idCliente).subscribe(
                  (result: any) => {
                    this.spinner = false;
                    if (result.err) {
                      this.Excepciones(result.err, 4);
                    } else if (result.excepcion) {
                      this.Excepciones(result.excepcion, 3);
                    } else {
                      this.tipoObjetos = result.recordsets[0];
                      this.operadorObjetos.forEach(element => {
                        this.tipoObjetos.forEach(tipo => {
                          if (element.idTipoObjeto === tipo.idTipoObjeto[0] && element.idObjeto === tipo.idObjeto) {
                            element.fotoPrincipal = tipo.fotoPrincipal;
                            element.marca = tipo.Marca;
                            element.submarca = tipo.Submarca;
                            element.clase = tipo.Clase;
                            element.combustible = tipo.Combustible;
                            element.vin = tipo.VIN;
                            element.placa = tipo.Placa;
                            element.modelo = tipo.modelo;
                          }
                        });
                      });
                      this.columns = [
                        {
                          caption: 'Id vehiculo',
                          dataField: 'idObjeto',
                          hiddingPriority: '0',
                          width: 60
                        },
                        {
                          caption: 'Foto',
                          dataField: 'fotoPrincipal',
                          hiddingPriority: '0',
                          cellTemplate: 'foto'
                        },
                        {
                          caption: 'Clase',
                          dataField: 'clase',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Marca',
                          dataField: 'marca',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Submarca',
                          dataField: 'submarca',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Modelo',
                          dataField: 'modelo',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Placa',
                          dataField: 'placa',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'VIN',
                          dataField: 'vin',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Estatus',
                          dataField: 'estatus',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Fecha asignación',
                          dataField: 'fechaAsignacion',
                          dataType: TiposdeDato.datetime,
                          format: TiposdeFormato.dmyt
                        },
                        {
                          caption: 'Odómetro asig.',
                          dataField: 'odometroAsignacion',
                          hiddingPriority: '0'
                        },
                        {
                          caption: 'Fecha entrega',
                          dataField: 'fechaEntrega',
                          dataType: TiposdeDato.datetime,
                          format: TiposdeFormato.dmyt
                        },
                        {
                          caption: 'Odómetro entrega',
                          dataField: 'odometroEntrega',
                          hiddingPriority: '0'
                        }
                      ];

                    }
                  },
                  (error: any) => {
                    this.Excepciones(error, 2);
                  }
                );

            }

          }
        },
        (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        }
      );
  }


  GetTipoAsentamiento() {
    this.siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
      (res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {

          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipoAsentamientos = res.recordsets[0];
        }
      },
      (error: any) => {
        this.Excepciones(error, 2);
      }
    );
  }

  /**
   * @description Este metodo se encarga de buscar el código postal, junto con su estado, municipio y asentamiento
   * @returns Retorna en Código postal junto con el estado y la vialidad
   * @author Sandra Gil Rosales
   */
  GetCp() {
    try {
      if (this.operadorForm.controls.cp.value) {
        this.siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.operadorForm.controls.cp.value
          })
          .subscribe(
            (res: any) => {
              if (res.err) {

                this.Excepciones(res.err, 4);
              } else if (res.excepcion) {

                this.Excepciones(res.excepcion, 3);
              } else {
                if (res.recordsets[0] < 1) {
                  this.snackBar.open('El Código Postal no es valido', 'Ok', {
                    duration: 2000
                  });
                  this.valCp = true;
                  this.operadorForm.controls.cp.setValue('');
                } else {
                  this.valCp = false;
                  this.idPais = res.recordsets[0][0].idPais;
                  this.idEstado = res.recordsets[0][0].idEstado;
                  this.idMunicipio = res.recordsets[0][0].idMunicipio;
                  this.operadorForm.controls.estado.setValue(
                    res.recordsets[0][0].nombreEstado
                  );
                  this.operadorForm.controls.municipio.setValue(
                    res.recordsets[0][0].nombreMunicipio
                  );
                  this.operadorForm.get('asentamiento').enable();
                  if (res.recordsets[0][0].idTipoAsentamiento !== null) {
                    this.operadorForm.controls.tipoAsentamiento.setValue(
                      res.recordsets[0][0].idTipoAsentamiento
                    );

                    this.operadorForm.controls.asentamiento.setValue(
                      res.recordsets[0][0].nombreAsentamiento
                    );
                  }
                }
              }
            },
            (error: any) => {
              this.Excepciones(error, 2);
            }
          );
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  GetTipoVialidad() {
    this.siscoV3Service.getService('common/getTipoVialidad').subscribe(
      (res: any) => {
        if (res.err) {

          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipoVialidades = res.recordsets[0];
        }
      },
      (error: any) => {
        this.Excepciones(error, 2);
      }
    );
  }
  /**
   * @description Genera el Json que se va a mandar con los datos a modificar o insertar
   * @returns Abre el Dialog de modificar o insertar
   * @author Sandra Gil Rosales
   */
  ModificarOperador() {
    try {
      const data = {
        idUsers: this.idOperador,
        idEstatus: 1,
        idPais: this.idPais,
        idEstado: this.idEstado,
        idMunicipio: this.idMunicipio,
        codigoPostal: this.operadorForm.controls.cp.value,
        idTipoAsentamiento: this.operadorForm.controls.tipoAsentamiento
          .value,
        asentamiento: this.operadorForm.controls.asentamiento.value,
        idTipoVialidad: this.operadorForm.controls.tipoVialidad.value,
        vialidad: this.operadorForm.controls.vialidad.value,
        numeroExterior: this.operadorForm.controls.numeroExterior
          .value,
        numeroInterior: this.operadorForm.controls.numeroInterior.value,
        latitud: null,
        longitud: null
      };

      this.siscoV3Service.postService('operador/insOperador', data)
        .subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open('Se ha guardado correctamente el operador.', 'Ok', {
              duration: 2000
            });
            this.router.navigateByUrl('sel-operador');
          }
        },
          (error: any) => {
            this.Excepciones(error, 2);
            this.spinner = false;
          });

    } catch (error) {
      this.Excepciones(error, 1);
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
