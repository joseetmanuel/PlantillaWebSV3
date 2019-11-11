import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormularioDinamico } from '../../../../utilerias/clases/formularioDinamico.class';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';

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
  IColumnchooser
} from '../../../../interfaces';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sel-unidad-contrato',
  templateUrl: './sel-unidad-contrato.component.html',
  styleUrls: ['../../upd-contrato.component.scss']
})
export class SelUnidadContratoComponent extends FormularioDinamico implements OnInit{

  selectValues;
  gridBoxValue2;
  gridDataSource;
  tipoObjetosColumns;
  tipoObjetos;
  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  @Input() rfcEmpresa;
  @Input() idCliente;
  @Input() numeroContrato;
  @Input() modulo;

  subsNegocio: Subscription;

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
  unidadesContratos = [];

  edita = false;
  unidadContratoForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idTipoObjeto: new FormControl('', [Validators.required]),
    modelo: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    idConversion: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
  });
  public numero = 1;
  conversiones;

  /*
  Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar.
  */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.add(senddata);
      } else if ($event === 'edit') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.edit(senddata);
      } else if ($event === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.delete(senddata);
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
Obtenemos la data del componente 'grid-component'.
*/
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Función Agregar que rdirige a la pagina ins-contrato
  */
  add(data) {
    this.router.navigateByUrl(`/ins-unidad-contrato/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`);
  }


  edit(data) {
    // tslint:disable-next-line:max-line-length
    this.router.navigateByUrl(`/upd-unidad-contrato/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${data.data[0].idTipoObjeto}`);
  }

  /*
Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
*/
  delete(data) {
    try {
      const that = this;
      let borrar = ``;
      let cont = 0;
      data.data.forEach((element, index, array) => {
        borrar += `<Ids><idCliente>${
          element.idCliente
          }</idCliente><numeroContrato>${
          element.numeroContrato
          }</numeroContrato><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa><idTipoObjeto>${
          element.idTipoObjeto
          }</idTipoObjeto></Ids>`;
        cont++;
        if (cont === array.length) {
          that.deleteData('contrato/tipounidad/elimina/listado', 'Data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Datos de la tabla
  */
  table() {
    this.toolbar = [];
    try {
      
      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Listado tipos unidades contrato' };
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

      /*
  Parametros de Toolbar
  */
      if (this.modulo.camposClase.find(x => x.nombre === 'Agregar Unidad')) {
        this.toolbar.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              width: 90,
              text: 'Agregar',
              onClick: this.receiveMessage.bind(this, 'add')
            },
            visible: true
          }
        );
      }
      if (this.modulo.camposClase.find(x => x.nombre === 'Administrar')) {
        this.toolbar.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              text: 'Administrar',
              onClick: this.receiveMessage.bind(this, 'edit')
            },
            visible: false,
            name: 'simple',
            name2: 'multiple'
          }
        );
      }
      if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar Unidad')) {
        this.toolbar.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              width: 90,
              text: 'Eliminar',
              onClick: this.receiveMessage.bind(this, 'delete')
            },
            visible: false,
            name: 'simple'
          }
        );
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    private siscoV3Service: SiscoV3Service,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    super();
  }
  /**
   * Llenamos la tabla con las Unidades insertadas
   */
  loadUnidadesContrato() {
    this.numero = 0;
    this.table();
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service
      .getService(
        `contrato/tipounidad/listado/${this.rfcEmpresa}/${this.idCliente}/${
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
            this.unidadesContratos = res.recordsets[0];
            this.otro(this.unidadesContratos)
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  otro(unidades) {
    let cont = 0;
    const that = this;
    Object.keys(unidades[0]).forEach((k, v, ar) => {
      if (k !== 'rfcEmpresa' && k !== 'idCliente' && k !== 'numeroContrato' && k !== 'idTipoObjeto') {
        that.columns.push(
          {
            caption: k.charAt(0).toUpperCase() + k.slice(1).toLowerCase(),
            dataField: k
          }
        );
      }
      cont++;
      if (cont === ar.length) {
      }
    });
  }

  /**
   * Carga los datos de la pagina y tambien asigna los valores que se traen por default (rfcEmpresa, idCliente, numeroContrato)
   */
  ngOnInit() {
    this.unidadContratoForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
    this.unidadContratoForm.controls.idCliente.setValue(this.idCliente);
    this.unidadContratoForm.controls.numeroContrato.setValue(
      this.numeroContrato
    );
    // this.GetPropiedadesAll();
    this.loadUnidadesContrato();
  }

  /*
  Abre el dialog delete-alert
  */
  deleteData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.ngOnInit();
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
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
          moduloExcepcion: 'sel-unidad-contrato.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }
}
