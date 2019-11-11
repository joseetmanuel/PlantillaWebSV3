import { Component, OnInit, Input } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';

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
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';

@Component({
  selector: 'app-sel-tipo-solicitud',
  templateUrl: './sel-tipo-solicitud.component.html',
  styleUrls: ['./sel-tipo-solicitud.component.scss']
})
export class SelTipoSolicitudComponent implements OnInit {
  @Input() rfcEmpresa;
  @Input() idCliente;
  @Input() numeroContrato;
  @Input() idClase;
  @Input() modulo;

  datosevent: any;
  gridOptions: IGridOptions;
  columns: IColumns[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];

  gridDataSource: any;
  gridBoxValue2: number[];
  selectValues: any;

  ban = false;
  band = false;
  spinner = false;
  tiposSolicitudTable = [];
  bandAgregar = false;

  tipoSolicitudForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idClase: new FormControl('', [Validators.required]),
    solicitudes: new FormControl('', [Validators.required])
  });

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service
  ) { }

  ngOnInit() {
    this.band = true;
    this.tipoSolicitudForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
    this.tipoSolicitudForm.controls.idCliente.setValue(this.idCliente);
    this.tipoSolicitudForm.controls.numeroContrato.setValue(this.numeroContrato);
    this.tipoSolicitudForm.controls.idClase.setValue(this.idClase);
    this.getSolicitudTipoSolicitud();
  }

  getSolicitudTipoSolicitud() {
    if (this.modulo.camposClase.find(x => x.nombre === 'Agregar Tipo Solicitud')) {
      this.bandAgregar = true;
    }
    this.spinner = true;
    this.siscoV3Service.getService(`contrato/getSolicitudesTipoSolicitud?idClase=${this.idClase}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&rfcEmpresa=${this.rfcEmpresa}`).subscribe(
      (res: any) => {
        if (res.err) {
          this.spinner = false;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.getTipoSolicitud();
          this.selectFillData(res.recordsets[0]);
        }
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  getTipoSolicitud() {
    this.spinner = true;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/getTipoSolicitud?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idClase=${this.idClase}`).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.tiposSolicitudTable = res.recordsets[0];
          this.table();
          this.ban = true;
        }
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Metodo de Debex para que el select se vea como una tabla
   * @param proveedores Todos los proveedores
   * @author Gerardo Zamudio González
   */
  selectFillData(tipoSolicitud) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoSolicitud',
      load() {
        const json = tipoSolicitud;
        return json;
      }
    });
  }

  get gridBoxValue(): number[] {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: number[]) {
    this.gridBoxValue2 = value || [];
  }

  /**
   * @description Asigna  el valor seleccionado al proveedorContratoForm
   * @param $event fila seleccionada
   * @author Gerardo Zamudio González
   */
  onSelectionChanged($event) {
    this.selectValues = $event.selectedRowsData;
    this.tipoSolicitudForm.controls.solicitudes.setValue(
      this.selectValues
    );
  }

  insCreateXmlTipoSolicitud() {
    const that = this;
    let xml = ``;
    this.selectValues.forEach((e, i, ar) => {
      // tslint:disable-next-line:max-line-length
      xml += `<solicitudes><rfcEmpresa>${this.rfcEmpresa}</rfcEmpresa><idCliente>${this.idCliente}</idCliente><numeroContrato>${this.numeroContrato}</numeroContrato><idTipoSolicitud>${e.idTipoSolicitud}</idTipoSolicitud><idClase>${this.idClase}</idClase></solicitudes>`;
      if (i + 1 === ar.length) {
        that.insTipoSolicitud(xml);
      }
    });
  }

  insTipoSolicitud(xml) {
    const datos = {
      data: xml
    };
    this.spinner = true;
    this.siscoV3Service.postService('contrato/postTipoSolicitud', datos).subscribe(
      (res: any) => {
        if (res.err) {
          this.spinner = false;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.band = false;
          this.ngOnInit();
        }
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'delete') {
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

  /**
   * @description Obtenemos la data del componente 'grid-component'
   * @param $event Data del 'grid-component'
   * @returns Data en formato Json
   * @author Gerardo Zamudio González
   */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @returns Abre el deleteDialog para eliminar el dato
   * @author Gerardo Zamudio González
   */
  delete(data) {
    try {
      const that = this;
      let borrar = ``;
      this.datosevent.forEach((e, i, ar) => {
        // tslint:disable-next-line:max-line-length
        borrar += `<solicitudes><rfcEmpresa>${this.rfcEmpresa}</rfcEmpresa><idCliente>${this.idCliente}</idCliente><numeroContrato>${this.numeroContrato}</numeroContrato><idTipoSolicitud>${e.idTipoSolicitud}</idTipoSolicitud><idClase>${this.idClase}</idClase></solicitudes>`;
        if (i + 1 === ar.length) {
          that.deleteData('contrato/deleteTipoSolicitud', `data=${borrar}`);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Carga los datos en la tabla
   * @returns MUestra la tabla
   * @author Gerardo Zamudio González
   */
  table() {
    this.toolbar = [];
    /*
    Columnas de la tabla
    */
    try {
      this.columns = [
        {
          caption: 'ID tipo solicitud',
          dataField: 'idTipoSolicitud'
        },
        {
          caption: 'Nombre',
          dataField: 'nombre'
        }
      ];

      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Listado tipos de solicitd' };
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
      if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar Tipo Solicitud')) {
        this.toolbar.push({
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
        });
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog delete-alert
   * @param url La Url para eliminar un documento
   * @param datos Los datos que se van a eliminar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
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
      // this.numero = 1;
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
          moduloExcepcion: 'ins-proveedor-contrato.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }

}
