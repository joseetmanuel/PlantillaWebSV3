import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
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
  IFileUpload,
  TiposdeDato
} from '../../interfaces';
import { ActivatedRoute } from '@angular/router';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../store/app.states';
import { FormularioDinamico } from '../../utilerias/clases/formularioDinamico.class';
import { Negocio } from '../../models/negocio.model';
import { NgxIndexedDB } from 'ngx-indexed-db';
import { SeleccionarContratoActual } from 'src/app/store/actions/contrato.actions';
import { Subscription } from 'rxjs/Subscription';

// tslint:disable-next-line:variable-name
export let equip_upd_objeto_url = {
  ruta: '',
  idOrden: null,
  idContratoZona: null,
  idContratoCosto: null
};

@Component({
  selector: 'app-equipamiento',
  templateUrl: './equipamiento.component.html',
  styleUrls: ['./equipamiento.component.scss']
})
export class EquipamientoComponent implements OnInit, OnDestroy {

  none1 = true;
  none2 = true;
  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  claveModulo = 'app-equipamiento';
  modulo: any = {};
  breadcrumb: any[];
  state;
  dinamicColumns;

  subsNegocio: Subscription;

  indexedDB: NgxIndexedDB;


  @ViewChild('archivoXml') archivoXml: ElementRef;
  @ViewChild('archivoPdf') archivoPdf: ElementRef;
  IUploadFile: IFileUpload;

  conta = 0;
  ruta: any;
  numero = 1;
  idCliente;
  rfcEmpresa;
  numeroContrato;
  ordenes;
  idOrden;

  contratoActual;

  idContratoZona;

  datosevent: any;
  gridOptions: IGridOptions;
  columns = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  spec = [];
  ban = false;
  idSpec;
  fileUploader = [];

  equipamientoForm = new FormGroup({
    idOrden: new FormControl(''),
    idCosto: new FormControl('', [Validators.required])
  });
  zonas: any;
  treeBoxValue: any;
  idZona: any;
    /** variables para centro de costos */
    costos: any;
    idCostoIni: number;

  receiveMessage($event) {
    try {
      // this.evento = $event.event;
      // if ($event === 'add') {
      //   const senddata = {
      //     event: $event
      //   };
      //   this.add(senddata);
      // } else if ($event === 'edit') {
      //   const senddata = {
      //     event: $event,
      //     data: this.datosevent
      //   };
      //   this.edit(senddata);
      // } else if ($event === 'delete') {
      //   const senddata = {
      //     event: $event,
      //     data: this.datosevent
      //   };
      //   this.delete(senddata);
      // }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private httpClient: HttpClient,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.indexedDB = new NgxIndexedDB('SISCO', 1);
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      if (state && state.seguridad) {
        this.idUsuario = state.seguridad.user.id;
        this.subsNegocio = this.getStateNegocio.subscribe((stateN) => {
          if (stateN && stateN.claseActual) {
            this.state = state;
            this.idClase = stateN.claseActual;
            const ext = [];
            ext.push('.jpg', '.jpeg', '.png', '.pdf', '.xml');
            this.IUploadFile = {
              path: this.idClase,
              idUsuario: this.idUsuario,
              idAplicacionSeguridad: environment.aplicacionesId,
              idModuloSeguridad: 1,
              multiple: false,
              soloProcesar: false,
              extension: ext,
              titulo: '',
              descripcion: '',
              previsualizacion: true
            };
            this.getParams(this.state);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  table(idOrden) {
    this.ban = false;
    this.columns = [];
    if (this.idContratoZona && idOrden && this.equipamientoForm.value.idCosto) {
      /*
    Columnas de la tabla
    */
      try {
        this.getSpecOrden(idOrden);
        /*
    Parametros de Paginacion de Grit
    */
        const pageSizes = [];
        pageSizes.push('10', '25', '50', '100');

        /*
    Parametros de Exploracion
    */
        this.exportExcel = { enabled: true, fileName: 'Listado de SPEC' };
        // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
        this.columnHiding = { hide: true };
        // ******************PARAMETROS DE PARA CHECKBOX**************** */
        this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
        // ******************PARAMETROS DE PARA EDITAR GRID**************** */
        this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/
        // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
        this.Columnchooser = { columnchooser: true };

        /*
    Parametros de Search
    */
        this.searchPanel = {
          visible: true,
          width: 200,
          placeholder: 'Buscar...',
          filterRow: true
        };

        /*
    Parametros de Scroll
    */
        this.scroll = { mode: 'standard' };
      } catch (error) {
        this.excepciones(error, 1);
      }
    } else {
      if (idOrden) {
        this.snackBar.open('Debes seleccionar todos los campos.', 'Ok', {
          duration: 2000
        });
      }
      if (this.idContratoZona) {
        this.snackBar.open('Debes seleccionar todos los campos.', 'Ok', {
          duration: 2000
        });
      }

    }
  }

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
      this.getOrdenes();
      this.TreeZonas();
      this.CentroCosto();
    });
  }

  getOrdenes() {
    this.numero = 0;
    this.siscoV3Service.getService(`orden/listado/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.ordenes = res.recordsets[0];
          this.getContatoData();
          if (equip_upd_objeto_url.idOrden !== null) {
            this.equipamientoForm.controls.idOrden.setValue(equip_upd_objeto_url.idOrden);
            this.idContratoZona = equip_upd_objeto_url.idContratoZona;
            this.equipamientoForm.controls.idCosto.setValue(equip_upd_objeto_url.idContratoCosto);
            this.onSelection(null);
          }
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description  Carga listado de zonas para mostrar en árbol
   * @returns Listado de zonas
   * @author Edgar Mendoza Gómez
   */

  TreeZonas() {
    try {
      this.numero = 0;
      this.siscoV3Service.getService('common/GetZonas?numeroContrato=' + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&rfcEmpresa=' + this.rfcEmpresa)
        .subscribe((res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excecion) {
            this.excepciones(res.err, 3);
          } else {
            this.zonas = res.recordsets[0];
          }
        }, (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  TreeView_itemSelectionChanged(e) {
    const item = e.node;
    if (!item.children.length) {
      const nodes = e.component.getNodes();
      const valor = this.getSelectedItemsKeysZona(nodes);
      if (valor.length > 0) {
        this.treeBoxValue = valor[0].label;
        this.idZona = valor[0].idZona;
        this.idContratoZona = this.idZona;
        //this.table(this.idOrden);
        this.createTable();
      }
    } else {
      e.node.selected = false;
    }
  }

  createTable (){
    if (this.idContratoZona > 0  && this.equipamientoForm.value.idCosto > 0 ){
      this.table(this.idOrden);
    }else{
      this.snackBar.open('Debes seleccionar todos los campos.', 'Ok', {
        duration: 2000
      });

    }
  }

  getSelectedItemsKeysZona(items) {
    let result = [];
    const that = this;

    // tslint:disable-next-line: only-arrow-functions
    items.forEach((item) => {
      if (item.selected) {
        result.push({ idZona: item.key, label: item.text });
      }
      if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeysZona(item.items));
      }
    });
    return result;
  }

    /** funcion para los Centros de Costo */

    CentroCosto() {
      try {
        this.siscoV3Service.getService('contrato/getCentroCostoObj?idClase=' + this.idClase)
          .subscribe((res: any) => {
            if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excecion) {
              this.excepciones(res.err, 3);
            } else {
              this.costos = res.recordsets[0];
            }
          }, (error: any) => {
            this.numero = 1;
            this.excepciones(error, 2);
          });
      } catch (error) {
        this.excepciones(error, 1);
      }
    }
  

  getContatoData() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        'cliente/getContratoPorKeys?numeroContrato=' +
        this.numeroContrato +
        '&rfcEmpresa=' +
        this.rfcEmpresa +
        '&idCliente=' +
        this.idCliente +
        ''
      )
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.contratoActual = res.recordsets[0][0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  closeWindow($event: any) {
    if ($event) {
      $event.instance.close();
    }
  }

  otro(spec) {
    let cont = 0;
    const that = this;
    Object.keys(spec[0]).forEach((k, v, ar) => {
      // tslint:disable-next-line:max-line-length
      if (k !== 'idSPEC' && k !== 'consecutivo' && k !== 'unidad' && k !== 'VIN' && k !== 'nombreSpec' && k !== 'Index' && k !== 'unidad' && k !== 'idTipoObjeto' && k !== 'idObjeto' && k !== 'modelo') {
        that.columns.push(
          {
            caption: k,
            dataField: k,
            dataType: TiposdeDato.boolean
          }
        );
      }
      cont++;
      if (cont === ar.length) {
        this.getSpecName(this.idOrden);
      }
    });
  }

  onSelection($event) {
    this.toolbar = [];
    this.columns = [];
    this.ban = false;
    if (equip_upd_objeto_url.idOrden === null || equip_upd_objeto_url.idOrden === undefined) {
      if ($event.value) {
        this.idOrden = $event.value;
        this.table(this.idOrden);
      }
    } else {
      this.idOrden = equip_upd_objeto_url.idOrden;
      equip_upd_objeto_url.idOrden = null;
      this.table(this.idOrden);
    }
    // this.idOrden = $event.value;
  }

  getSpec(idOrden) {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`equipamiento/orden/listado/disponible/${idOrden}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.dinamicColumns = res.recordsets[0];
          this.ban = true;
          if (this.modulo.camposClase.find(x => x.nombre === 'Actividad')) {
            this.toolbar.push(
              {
                location: 'after',
                widget: 'dxTagBox',
                locateInMenu: 'auto',
                options: {
                  dataSource: res.recordsets[0],
                  displayExpr: 'nombre',
                  showSelectionControls: true,
                  applyValueMode: 'useButtons',
                  width: 200,
                  onValueChanged: this.createXmlObjetos.bind(this),
                  placeholder: 'Actividad'
                }, visible: false,
                name: 'simple'
              });
          }
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }


  createXmlObjetos($event) {
    try {
      if ($event.value === '' || $event.value.length < 1) {
        this.snackBar.open('Debes seleccionar una actividad.', 'Ok');
      } else {
        this.numero = 0;
        let xmlObjetos = `<objetos>`;
        const rompe = false;
        let conta = 0;
        this.datosevent.forEach((v, i, ar) => {
          if (v.idObjeto === '' || v.idObjeto === null || v.idObjeto === undefined) {
            this.numero = 1;
            this.snackBar.open('Alguna de las ordenes no tiene un spec asignado.', 'Ok');
            return rompe;
          }
          xmlObjetos += `<id>${v.idObjeto}</id>`;
          conta++;
          if (conta === ar.length) {
            xmlObjetos += '</objetos>';
            this.createXmlActividad($event.value, xmlObjetos);
          }
        });
      }
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  createXmlActividad(actividades, xmlObjetos) {
    try {
      let xmlActividades = `<actividades>`;
      let conta = 0;
      actividades.forEach((v, i, ar) => {
        xmlActividades += `<id>${v.idActividad}</id>`;
        conta++;
        if (conta === ar.length) {
          xmlActividades += `</actividades>`;
          this.asignaActividad(xmlObjetos, xmlActividades);
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  asignaActividad(xmlObjetos, xmlActividades) {
    const data = {
      rfcEmpresa: this.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato,
      idOrden: this.idOrden,
      idActividades: xmlActividades,
      objetosSPEC: xmlObjetos
    };
    this.siscoV3Service.postService(`equipamiento/spec/insSpecUnidadDetalle`, data).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.ban = false;
          equip_upd_objeto_url.idOrden = this.idOrden;
          equip_upd_objeto_url.idContratoZona = this.idContratoZona;
          equip_upd_objeto_url.idContratoCosto = this.equipamientoForm.value.idCosto;
          this.snackBar.open('Registros actualizados.', 'Ok', {
            duration: 2000
          });
          this.ngOnInit();
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  getSpecName(idOrden) {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`equipamiento/spec/listado/disponible/${idOrden}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          if (this.modulo.camposClase.find(x => x.nombre === 'Cargar Documentos')) {
            this.toolbar.push(
              {
                location: 'after',
                widget: 'dxButton',
                locateInMenu: 'auto',
                options: {
                  text: 'Cargar documentos',
                  onClick: this.cargaDocumentos.bind(this)
                },
                visible: false,
                name: 'simple',
                name2: 'multiple'
              });
          }
          if (this.modulo.camposClase.find(x => x.nombre === 'Nombre Spec')) {
            this.toolbar.push(
              {
                location: 'after',
                widget: 'dxSelectBox',
                locateInMenu: 'auto',
                options: {
                  dataSource: res.recordsets[0],
                  displayExpr: 'nombre',
                  width: 200,
                  onValueChanged: this.asignaSpec.bind(this),
                  placeholder: 'Nombre spec'
                }, visible: false,
                name: 'simple',
                name2: 'multiple'
              });
          }
          if (this.modulo.camposClase.find(x => x.nombre === 'Elimina Actividades')) {
            this.toolbar.push(
              {
                location: 'after',
                widget: 'dxButton',
                locateInMenu: 'auto',
                options: {
                  text: 'Elimina actividades',
                  onClick: this.eliminaActividades.bind(this)
                },
                visible: false,
                name: 'simple',
                name2: 'multiple'
              });
          }
          this.getSpec(idOrden);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  eliminaActividades() {
    this.numero = 0;
    let conta = 0;
    let xmlActividades = `<actividades>`;
    Object.keys(this.datosevent[0]).forEach((k, i, ar) => {
      this.dinamicColumns.forEach((v) => {
        if (k === v.nombre) {
          xmlActividades += `<id>${v.idActividad}</id>`;
        }
      });
      conta++;
      if (conta === ar.length) {
        xmlActividades += `</actividades>`;
        this.eliminaAct(xmlActividades);
      }
    });
  }

  eliminaAct(xmlActividades) {
    const data = {
      rfcEmpresa: this.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato,
      idOrden: this.idOrden,
      idActividades: xmlActividades,
      idObjetosSPEC: this.datosevent[0].idObjeto
    };
    this.siscoV3Service.postService(`equipamiento/spec/delSpecUnidadDetalle`, data).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.ban = false;
          equip_upd_objeto_url.idOrden = this.idOrden;
          equip_upd_objeto_url.idContratoZona = this.idContratoZona;
          equip_upd_objeto_url.idContratoCosto = this.equipamientoForm.value.idCosto;
          this.snackBar.open('Registros actualizados.', 'Ok', {
            duration: 2000
          });
          this.ngOnInit();
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  getSpecOrden(idOrden) {
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`equipamiento/orden/listado/${idOrden}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.spec = res.recordsets[0];
          this.columns.push(
            {
              caption: 'Consecutivo',
              dataField: 'consecutivo'
            },
            {
              caption: 'Unidad',
              dataField: 'unidad'

            },
            {
              caption: 'VIN',
              dataField: 'VIN'
            },
            {
              caption: 'Nombre spec',
              dataField: 'nombreSpec'
            }
          );
          if (res.recordsets[0].length) {
            this.otro(this.spec);
          } else {
            this.snackBar.open('Esta orden no cuenta con spec.', 'Ok', {
              duration: 2000
            });
          }
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  asignaSpec(e) {
    if (this.datosevent[0].idSPEC === null) {
      this.idSpec = e.value.idSPEC;
    } else {
      this.snackBar.open('Ya has asignado un spec', 'Ok', {
        duration: 2000
      });
    }
  }

  cargaDocumentos() {
    if (this.idSpec) {
      this.none1 = true;
      this.none2 = true;
      this.conta++;
      if (this.conta === 1) {
        this.archivoXml.nativeElement.value = '';
        this.archivoPdf.nativeElement.value = '';
        this.fileUploader = [];
        this.archivoXml.nativeElement.click();
        this.conta = -1;
      }
    } else {
      this.snackBar.open('Debes seleccionar primero un spec', 'Ok', {
        duration: 2000
      });
    }
  }

  cargaXml() {
    this.fileUploader.push(this.archivoXml.nativeElement.files[0]);
    this.archivoPdf.nativeElement.click();
  }

  cargaPdf() {
    this.fileUploader.push(this.archivoPdf.nativeElement.files[0]);
    this.GuardarDocumento(this.fileUploader);
  }

  /**
   * @description Sube el documento al file server
   * @param fileUploader Datos del o los documentos a subir.
   * @author Andres Farias
   */
  GuardarDocumento(fileUploader) {
    // if (this.datosevent[0].NombreSpec === '' || this.datosevent[0].NombreSpec === null) {
    if (1 === 1) {
      const formData = new FormData();
      formData.append('path', this.IUploadFile.path);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < fileUploader.length; i++) {
        formData.append('files', fileUploader[i]);
      }
      // ************************** Se llena formData **************************
      formData.append('idAplicacionSeguridad', this.IUploadFile.idAplicacionSeguridad + '');
      formData.append('idModuloSeguridad', this.IUploadFile.idModuloSeguridad + '');
      formData.append('idUsuario', this.IUploadFile.idUsuario + '');
      formData.append('titulo', '' + '');
      formData.append('descripcion', '' + '');
      // ******* Se consume servicio y si tuvo exito regresa id del o los documentos subidos  ***************
      this.httpClient.post(environment.fileServerUrl + 'documento/UploadFiles', formData).subscribe(
        (data: any) => {
          let conta = 0;
          let idXml;
          let idPdf;
          let xml;
          const that = this;
          data.recordsets.forEach((e, i, arr) => {
            if (e.tipo === 'application/pdf') {
              idPdf = e.idDocumento;
            } else if (e.tipo === 'text/xml') {
              idXml = e.idDocumento;
              xml = e.xml;
            }
            conta++;
            if (conta === arr.length) {
              if (xml['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['cfdi:ComplementoConcepto']['ventavehiculos:VentaVehiculos']) {
                // tslint:disable-next-line:max-line-length
                if (xml['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['cfdi:ComplementoConcepto']['ventavehiculos:VentaVehiculos']._attributes.Niv) {
                  // tslint:disable-next-line:max-line-length
                  const VIN = xml['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['cfdi:ComplementoConcepto']['ventavehiculos:VentaVehiculos']._attributes.Niv;
                  const descripcion = xml['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']._attributes.Descripcion;
                  that.getIdObjeto(idXml, idPdf, VIN, descripcion);
                } else {
                  this.snackBar.open('El VIN no se encontro', 'Ok');
                }
              } else {
                this.snackBar.open('El formato del xml no es el correcto', 'Ok');
              }
            }
          });
          // const idDocumento = data.recordsets[0].idDocumento;
        }, (error: any) => this.excepciones(2, error));
    } else {
      this.snackBar.open('Ya has asignado un spec', 'Ok', {
        duration: 2000
      });
    }
  }

  getIdObjeto(idXml, idPdf, VIN, descripcionn) {
    // const data = {
    //   idTipoObjeto: this.datosevent[0].idTipoObjeto,
    //   rfcEmpresa: this.rfcEmpresa,
    //   idCliente: this.idCliente,
    //   numeroContrato: this.numeroContrato,
    //   idUsuario: this.idUsuario
    //   // descripcion: descripcionn
    // };
    const data = {
      objeto: {
        idTipoObjeto: this.datosevent[0].idTipoObjeto,
        idClase: this.idClase,
        rfcEmpresa: this.rfcEmpresa,
        idCliente: this.idCliente,
        numeroContrato: this.numeroContrato,
        idZona: this.idContratoZona,
        idCosto: this.equipamientoForm.value.idCosto
      },
      propiedades: [{
        nombreProp: 'Año',
        valor: this.datosevent[0].modelo
      },
      {
        nombreProp: 'VIN',
        valor: VIN
      }]
    };
    this.numero = 0;
    this.siscoV3Service.postService('objeto/postInsertPropVal', data).subscribe(
      (res: any) => {
        this.numero = 1;
        const idObjeto = res.recordsets[0][0].idObjeto;
        const idTipoObjeto = res.recordsets[0][0].idTipoObjeto;
        this.asignaSpecUnidad(VIN, idObjeto, idTipoObjeto);
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  asignaSpecUnidad(VIN, idObjeto, idTipoObjeto) {
    this.numero = 0;
    const data = {
      rfcEmpresa: this.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato,
      idOrden: this.idOrden,
      idSPEC: this.idSpec,
      idObjeto,
      idTipoObjeto: this.datosevent[0].idTipoObjeto,
      idClase: this.idClase
    };
    this.siscoV3Service.postService(`equipamiento/spec/insSpecUnidad`, data).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          equip_upd_objeto_url.ruta = this.router.url;
          equip_upd_objeto_url.idContratoZona = this.idContratoZona;
          equip_upd_objeto_url.idContratoCosto = this.equipamientoForm.value.idCosto;
          equip_upd_objeto_url.idOrden = this.idOrden;
          const contratoActual = this.contratoActual;
          // Notifica el cambio en los contratos seleccionados.
          if (contratoActual) {
            this.store.dispatch(new SeleccionarContratoActual({ contratoActual }));
            this.indexedDB.openDatabase(1).then(() => {
              this.indexedDB.getByKey('seguridad', 1).then(resultado => {
                this.indexedDB.update('seguridad', {
                  ...resultado,
                  contratoActual
                });
                this.router.navigateByUrl(`upd-objeto/${idObjeto}/${idTipoObjeto}`);
              });
            });
          }
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
          moduloExcepcion: 'add-cliente.component',
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
