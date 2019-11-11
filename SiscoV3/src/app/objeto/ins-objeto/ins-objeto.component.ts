import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import CustomStore from 'devextreme/data/custom_store';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { equip_upd_objeto_url } from '../../contratos/equipamiento/equipamiento.component';
import { BaseService } from '../../services/base.service';

import { AppState, selectContratoState } from '../../store/app.states';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { Negocio } from 'src/app/models/negocio.model';

@Component({
  selector: 'app-ins-objeto',
  templateUrl: './ins-objeto.component.html',
  styleUrls: ['../objeto.component.scss'],
  providers: [SiscoV3Service]
})
export class InsObjetoComponent extends FormularioDinamico implements OnInit, OnDestroy {

  spinner = false;
  getStateNegocio: Observable<any>;
  claveModuloIns = 'app-ins-objeto';
  idUsuario: number;
  idClase: string;
  idCliente: number;
  rfcEmpresa: string;
  idContratoZona: number;
  modulo: any = {};
  /*variables para el contrato activo*/
  contratos: any[];
  contratoActual: any;
  numeroContrato: string;
  titleClase: string;
  logo: string;
  breadcrumbIns: any;
  idTipoObjeto: number;
  idObjeto: number;
  descripcion: string;
  valTipoObjeto: number;
  valDescripcion: string;
  objeto: any;
  public newObjetoForm: FormGroup;
  marcas = [];
  disabled: boolean;
  valorSelect = '';

  datosevent: any;
  evento: string;
  /** variables para los selectores */
  gridBoxValue2: number;
  gridSelectedRowKeys2: number[];

  zonas: any;
  treeBoxValue: string;
  idZona: number;
  idZonaIni: number;
  /** variables para centro de costos */
  costos: any;
  idCostoIni: number;


  /* id Clase temporal  */
  gridDataSource: any;
  selectValues;
  public numero = 1;
  tipoObjetos = [];
  tipoObjetosColumns = [];
  subsNegocio: Subscription;
  varTem;
  varTemContraZ;
  varTemContraC;

  constructor(
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private baseService: BaseService,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    super();
    this.spinner = true;
    this.activatedRoute.params.subscribe(parametros => {
      this.idObjeto = parametros.idObjeto;
      this.idTipoObjeto = parametros.idTipoObjeto;
    });

    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.spinner = true;
    const usuario = this.baseService.getUserData();

    this.subsNegocio = this.getStateNegocio.subscribe((stateN) => {
      if (stateN && stateN.claseActual) {
        this.contratoActual = stateN.contratoActual;
        this.idClase = stateN.claseActual;
        this.varTem = equip_upd_objeto_url.idOrden;
        this.varTemContraZ = equip_upd_objeto_url.idContratoZona;
        this.varTemContraC = equip_upd_objeto_url.idContratoCosto;
        if (this.contratoActual) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;
        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
        }
        this.idClase = stateN.claseActual;
        this.LoadData();
        this.GetObjetoId(this.idObjeto);
        this.TreeZonas();
        this.CentroCosto();

        this.modulo = Negocio.GetModulo(this.claveModuloIns, usuario.permissions.modules, this.idClase);

        if (this.modulo.camposClase) {
          this.modulo.camposClase.forEach(campos => {
            if (campos.nombre === 'LogoCard1') {
              this.titleClase = campos.label;
              this.logo = campos.path;
            }
          });
        }
      }
    });


    this.newObjetoForm = new FormGroup({
      idTipoObjeto: new FormControl('', [Validators.required]),
      idZona: new FormControl('', [Validators.required]),
      idCosto: new FormControl('', [Validators.required]),
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  closeWindow($event: any) {
    if ($event) {
      $event.instance.close();
    }
  }
  /**
   * update y recuperar los valores
   * @param idObjeto objeto a editar, si  es 0 es insertobjeto/getObjeto
   */
  GetObjetoId(idObjeto: number) {
    try {

      if (idObjeto > 0) {
        this.siscoV3Service.getService('objeto/getObjeto?idClase=' + this.idClase + '&idObjeto=' + idObjeto
          + '&numeroContrato=' + this.numeroContrato + '&idCliente=' + this.idCliente
          + '&rfcEmpresa=' + this.rfcEmpresa + '&idTipoObjeto=' + this.idTipoObjeto)
          .subscribe((res: any) => {
            if (res.err) {
              this.spinner = false;
              this.Excepciones(res.err, 4);
            } else if (res.excecion) {
              this.Excepciones(res.err, 3);
            } else {
              this.spinner = false;
              this.objeto = res.recordsets[0];
              this.gridBoxValue2 = +this.idTipoObjeto;
              this.gridSelectedRowKeys2 = [this.idTipoObjeto];
              this.newObjetoForm.controls.idTipoObjeto.setValue(this.idTipoObjeto);
              this.objeto.forEach(element => {
                this.valDescripcion = element.descripcion;
                this.idZonaIni = element.idContratoZona[0];
                this.idContratoZona = element.zona;
                this.idCostoIni = element.idCentroCosto[0];
                this.newObjetoForm.controls.idCosto.setValue(element.idCentroCosto[0]);

              });
              this.disabled = true;
            }
          }, (error: any) => {
            this.spinner = false;
            this.Excepciones(error, 2);
          });
      } else {
        this.disabled = false;

      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Cuando se seleccione un proveedor del select, se le setea el valor al proveedor
   */
  onSelectionChanged($event) {
    if ($event) {
      this.selectValues = $event.selectedRowsData[0].idTipoObjeto;
      this.newObjetoForm.controls.idTipoObjeto.setValue(
        this.selectValues
      );
    }
  }

  get gridBoxValue(): number {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: number) {
    this.gridSelectedRowKeys2 = value && [value] || [];
    this.gridBoxValue2 = value;
  }

  get gridSelectedRowKeys(): number[] {
    return this.gridSelectedRowKeys2;
  }

  set gridSelectedRowKeys(value: number[]) {
    this.gridBoxValue2 = value.length && value[0] || null;
    this.gridSelectedRowKeys2 = value;
  }

  /*
   * Descripción:    Función para agregar, guardar un objeto
   * @param formUpd array con los  datos de elform dinamico
   */
  AgregarObjeto(formUpd) {
    this.spinner = true;
    let zonaSet;
    if (this.newObjetoForm.value.idZona == this.idContratoZona) {
      zonaSet = this.idZonaIni;
    } else {
      zonaSet = this.newObjetoForm.value.idZona;
    }
    const data = {
      idClase: this.idClase,
      idTipoObjeto: this.newObjetoForm.value.idTipoObjeto,
      idObjetoActual: this.idObjeto,
      rfcEmpresa: this.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato,
      idZona: zonaSet,
      idCentroCosto: this.newObjetoForm.value.idCosto
    };

    if (this.idObjeto > 0 && this.idTipoObjeto == this.newObjetoForm.value.idTipoObjeto
      && this.idZonaIni == zonaSet && this.idCostoIni == this.newObjetoForm.value.idCosto) {
      /** -- existe el objeto y no se modifico solo sus propiedades  */
      this.GuardarPropiedades(formUpd);
      if (equip_upd_objeto_url.ruta === '') {
        this.router.navigateByUrl('/sel-objeto');
      } else {
        equip_upd_objeto_url.idOrden = this.varTem;
        equip_upd_objeto_url.idContratoZona = this.varTemContraZ;
        equip_upd_objeto_url.idContratoCosto = this.varTemContraC;

        this.router.navigateByUrl(equip_upd_objeto_url.ruta);
      }

    } else {
      /** no existe el objeto por lo que es un insert  */
      this.siscoV3Service.putService('objeto/putInsertaObjeto', data).subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          let idObjetoA;
          let idTipoObjetoA;
          res.recordsets[0].forEach(element => {
            idObjetoA = element.idObjeto;
            idTipoObjetoA = element.idTipoObjeto;
          });
          formUpd.push({
            idObjetoActual: idObjetoA,
            idTipoObjetoAct: idTipoObjetoA
          });
          this.GuardarPropiedades(formUpd);
          this.snackBar.open('Se ha guardado correctamente.', 'Ok', {
            duration: 2000
          });
          if (equip_upd_objeto_url.ruta === '') {
            this.router.navigateByUrl('/sel-objeto');
          } else {
            equip_upd_objeto_url.idOrden = this.varTem;
            equip_upd_objeto_url.idContratoZona = this.varTemContraZ;
            equip_upd_objeto_url.idContratoCosto = this.varTemContraC;
            this.router.navigateByUrl(equip_upd_objeto_url.ruta);
          }
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });

    }

  }

  /**
   *
   * @param form array con los  datos de elform dinamico
   */
  GuardarPropiedades(form: any) {
    this.siscoV3Service.postService('objeto/postActualizaPropiedades', form)
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.spinner = false;
          console.log('se guardaron propiedades');
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });
  }


  /**
   * @description  Carga tipos de objeto existentes
   * @returns Devuelve tipos de objeto con sus propiedades
   * @author Edgar Mendoza Gómez
   */

  LoadData() {
    try {
      this.siscoV3Service.getService('tipoObjeto/GetTipoObjetoMarcaSub?idClase=' + this.idClase + '&numContrato=' + this.numeroContrato)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.tipoObjetos = res.recordsets[0];          
            if (this.tipoObjetos) {
              for (let data in this.tipoObjetos[0]) {
                this.tipoObjetosColumns.push(data);
              }
            }
            this.selectFillData(this.tipoObjetos);

            if (this.idObjeto < 1) {
              this.disabled = false;
            } else {
              this.disabled = true;

            }
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });


    } catch (error) {
      this.Excepciones(error, 1);
    }
  }


  /**
   * Metodo de Dx para que el select se vea como una tabla
   */
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
   * Metodos de Devex
   */
  getSelectedItemsKeys(items) {
    let result = [];
    const that = this;

    items.forEach((item) => {
      if (item.selected) {
        result.push(item.key);
      }
      if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeys(item.items));
      }
    });
    return result;
  }

  getSelectedItemsKeysZona(items) {
    let result = [];
    const that = this;

    // tslint:disable-next-line: only-arrow-functions
    items.forEach(function (item) {
      if (item.selected) {
        result.push({ idZona: item.key, label: item.text });
      }
      if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeysZona(item.items));
      }
    });
    return result;
  }

  TreeView_itemSelectionChanged(e) {
    const item = e.node;
    if (!item.children.length) {
      const nodes = e.component.getNodes();
      const valor = this.getSelectedItemsKeysZona(nodes);
      if (valor.length > 0) {
        this.treeBoxValue = valor[0].label;
        this.idZona = valor[0].idZona;
        this.newObjetoForm.controls.idZona.setValue(valor[0].idZona);
      }
    } else {
      e.node.selected = false;
    }
  }

  /**
   * @description  Carga listado de zonas para mostrar en árbol
   * @returns Listado de zonas
   * @author Edgar Mendoza Gómez
   */

  TreeZonas() {
    try {
      this.siscoV3Service.getService('common/GetZonas?numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&rfcEmpresa=' + this.rfcEmpresa)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.zonas = res.recordsets[0];
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /** funcion para los Centros de Costo */

  CentroCosto() {
    try {
      this.siscoV3Service.getService('contrato/getCentroCostoObj?idClase=' + this.idClase)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.costos = res.recordsets[0];
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  CostosChanged(e) {
    const item = e.node;
    if (!item.children.length) {
      const nodes = e.component.getNodes();
      const valor = this.getSelectedItemsKeysZona(nodes);
      if (valor.length > 0) {
        this.treeBoxValue = valor[0].label;
        this.idZona = valor[0].idZona;
        this.newObjetoForm.controls.idZona.setValue(valor[0].idZona);
      }
    } else {
      e.node.selected = false;
    }
  }

  /**
   *
   * @param pila stack para mandar a el componente de escepciones
   * @param tipoExcepcion numero de  el  tipo de error que tenemos
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ins-objeto.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
      });
    } catch (err) {
    }
  }
}
