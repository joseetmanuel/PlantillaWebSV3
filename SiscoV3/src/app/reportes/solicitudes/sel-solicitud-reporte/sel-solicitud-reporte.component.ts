import { Component, OnInit, ViewChild, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { SiscoV3Service } from '../../../services/siscov3.service';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  ICheckbox,
  IColumnHiding,
  IEditing,
  IColumnchooser,
  Template,
  AccionNotificacion,
  GerenciaNotificacion,
  IGridGeneralConfiguration,
  TiposdeDato,
  TiposdeFormato
} from '../../../interfaces';

import { DxTreeViewComponent } from 'devextreme-angular';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { FormControl, FormGroup, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { BUTTONS_TOOLBAR } from 'src/app/proveedor/enums';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

@Component({
  selector: 'app-sel-solicitud-reporte',
  templateUrl: './sel-solicitud-reporte.component.html',
  styleUrls: [],
  providers: [SiscoV3Service]
})
export class SelSolicitudReporteComponent implements OnInit {
  claveModulo = 'app-sel-solicitud-reporte';
  public formValid = true;
  public loading: boolean;
  idClase: string;
  idObjeto: number;
  idTipoObjeto: number;
  rfcEmpresa: string;
  idCliente: number;
  campos: any;
  spinner = false;
  @ViewChild(DxTreeViewComponent) treeView;
  getStateNegocio: Observable<any>;
  getStateUser: Observable<any>;
  breadcrumb: any;
  idUsuario: number;
  modulo: any = {};
  appBannerSpinner: boolean;
  numeroContrato: any;
  solicitudActual: any;
  idSolicitud: any;
  idTipoSolicitud: any;
  fechaCotizacion: any;
  solicitudes: any;
  contratoActual: any;
  objStateNegocio: any;
  selectedTreeItem: any = [];

  fechaDesde: any;
  fechaHasta: any;
  serverFile: any;

  //public datosProveedor: IProveedor;
  //public proveedorEntidad = [];
  public datosevent: any;
  columns: IColumns[] = [];
  //proveedorEntidadColumns = [];
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[] = [];
  fileServer: string;
  showGridPEntidad: boolean;
  gridConfiguration: IGridGeneralConfiguration;


  getStateAutenticacion: Observable<any>;
  subsNegocio: Subscription;
  public _contratosSeleccionados = [];
  public _contratosPorClase = [];

  zonas: any;
  usuarios: any;
  public datosReporte = [];
  treeBoxValue: string;
  idZona: any;
  itemZona: any;

  activaZona = false;
  contratosSeleccionados = '';

  busquedaForm = new FormGroup({
    frmIdZona: new FormControl(''),
    frmFechaDesde: new FormControl(),
    frmFechaHasta: new FormControl(),
    frmIdUsuarioBusqueda: new FormControl('')
  });

  constructor(
    private router: Router, private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog, private snackBar: MatSnackBar, private store: Store<AppState>) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.fileServer = environment.fileServerUrl;
    this.idZona = 0;
    this.spinner = true;
  }

  ngOnInit() {
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        if (stateNegocio.contratosSeleccionados > 1) {
          this._contratosSeleccionados = [...stateNegocio.contratosSeleccionados];
        } else {
          this.previewLoadData(stateAutenticacion.seguridad.user.id, stateNegocio.claseActual,
            stateAutenticacion.seguridad.permissions.modules, stateNegocio.contratoActual,
            stateNegocio.contratosSeleccionados,
            stateNegocio.contratosPorClase);
        }
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }
        this.serverFile = environment.fileServerUrl;
        this.fnGridInitializer();
        this.LlenaComboUsuarios();
      });
    });
    setTimeout(() => {
      this.spinner = false;
    }, 1000);
  }

  previewLoadData(idUser, claseActual, modulos, contratoActual, contratosSeleccionados, contratosPorClase) {
    this.idUsuario = idUser;
    this.idClase = claseActual;
    this.modulo = Negocio.GetModulo(this.claveModulo, modulos, this.idClase);
    if (contratosSeleccionados.length > 0) {
      this.contratosSeleccionados = '';
      let cadena = '';
      contratosSeleccionados.forEach(element => {
        element.zonas.forEach(e => {
          cadena +=
            '<contrato>' +
            '<numeroContrato>' + element.numeroContrato + '</numeroContrato>' +
            '<idCliente>' + element.idCliente + '</idCliente>' +
            '<rfcEmpresa>' + element.rfcEmpresa + '</rfcEmpresa>' +
            '<estado>' + e.estado + '</estado>' +
            '</contrato>';
        })
      });
      this.contratosSeleccionados = '<contratos>' + cadena + '</contratos>';
      if (contratosSeleccionados.length === 1) {
        this.activaZona = true;
        this.TreeZonas();
      } else {
        this.zonas = [];
      }
    }
  }

  armaParametroXml(): string {
    let contratos = [];
    if (this.selectedTreeItem.length > 0) {
      this.selectedTreeItem.forEach(element => {
        contratos.push({
          numeroContrato: element.numeroContrato,
          idCliente: element.idCliente,
          rfcEmpresa: element.rfcEmpresa,
          idContratoZona: element.idContratoZona
        });
      });
    } else {
      if (this._contratosSeleccionados.length == 1) {
        contratos = [];
        contratos.push(
          this._contratosSeleccionados[0].zonas.map(
            (item: any) => {
              return {
                numeroContrato: item.numeroContrato,
                idCliente: item.idCliente,
                rfcEmpresa: item.rfcEmpresa,
                idContratoZona: item.idContratoZona
              }
            })
        );
      } else {
        contratos = [];
        this._contratosSeleccionados.forEach(element => {
          this.itemZona = element.zonas;
          contratos.push(element.zonas.map((item) => {
            return {
              numeroContrato: item.numeroContrato,
              idCliente: item.idCliente,
              rfcEmpresa: item.rfcEmpresa,
              idContratoZona: item.idContratoZona
            }
          }));
        });
      }
    }
    let contatoXML = '<contratos>';
    if (contratos.length > 0) {
      contratos.forEach((item) => {
        if (Array.isArray(item)) {
          item.forEach((childItem) => {
            contatoXML += this.fnContratoItemXML(childItem);
          })
        } else {
          contatoXML += this.fnContratoItemXML(item);
        }
      });
      contatoXML += '</contratos>';
    }
    return contatoXML;
  }

  fnContratoItemXML(_arrayItem: any): string {
    let result = '';
    result += '<contrato>'
    result += '<numeroContrato>' + _arrayItem.numeroContrato + '</numeroContrato>';
    result += '<idCliente>' + _arrayItem.idCliente + '</idCliente>';
    result += '<rfcEmpresa>' + _arrayItem.rfcEmpresa + '</rfcEmpresa>';
    result += '<idContratoZona>' + _arrayItem.idContratoZona + '</idContratoZona>';
    result += '</contrato>';
    return result;
  }

  LlenaComboUsuarios() {
    try {
      this.siscoV3Service.getService('reporte/GetUsuariosSolicitud?idClase=' + this.idClase + '&&idUsuario=' + this.idUsuario).subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {

          this.usuarios = res.recordsets[0];
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  buscarInformacion() {
    try {
      this.spinner = true;
      const _xmldata = this.armaParametroXml();
      const fechaDesde = this.busquedaForm.controls.frmFechaDesde.value != null ? moment(this.busquedaForm.controls.frmFechaDesde.value).format('YYYY-MM-DD') : null;
      const fechaHasta = this.busquedaForm.controls.frmFechaHasta.value != null ? moment(this.busquedaForm.controls.frmFechaHasta.value).format('YYYY-MM-DD') : null;
      const _url = 'reporte/GetDatosReporteSolicitud';
      let data = {
        contratos: _xmldata,
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
        idClase: this.idClase,
        servidorArchivos: this.serverFile.slice(0, -1),
        idUsuarioBusqueda: this.busquedaForm.controls.frmIdUsuarioBusqueda.value != '' ? this.busquedaForm.controls.frmIdUsuarioBusqueda.value : null
      };
      this.siscoV3Service.postService(_url, data).subscribe((res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.datosReporte = res.recordsets[0] ? res.recordsets[0] : [];
        }
        this.spinner = false;
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  TreeZonas() {
    try {
      const data = {
        contratosSeleccionados: this.contratosSeleccionados
      }
      this.siscoV3Service.postService('common/PostZonasByEstado', data)
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              this.zonas = res.recordsets[0];
            } else {
              this.zonas = [];
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
 * @description Obtenemos la data del componente 'grid-component'
 * @param $event Data del 'grid-component'
 * @returns Data en formato Json
 * @author Gerardo Zamudio González
 */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  fnGridInitializer() {
    this.gridConfiguration = {
      GridOptions: {
        paginacion: 10,
        pageSize: [10, 30, 50, 100]
      },
      ExportExcel: { enabled: false, fileName: 'reportes' },
      ColumnHiding: { hide: false },
      Checkbox: { checkboxmode: 'multiple' },
      Editing: { allowupdate: false, mode: 'cell' },
      Columnchooser: { columnchooser: false },
      SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
      Scroll: { mode: 'standard' },
      Detail: { detail: false },
      ToolbarDetail: null,
      Color: null,
      ToolBox: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 200,
            text: 'Asignar taller',
            onClick: this.receiveMessage.bind(this, '.')
          },
          visible: false
        }],
      Columns: [
        {
          caption: 'Solicitud',
          dataField: 'idSolicitud',
          allowEditing: false
        },
        {
          caption: 'Cliente',
          dataField: 'Cliente',
          allowEditing: false
        },
        {
          caption: 'Tipo de solicitud',
          dataField: 'TipoSolicitud',
          allowEditing: false
        },
        {
          caption: 'Clase',
          dataField: 'idClase',
          allowEditing: false
        },
        {
          caption: 'RFC empresa',
          dataField: 'rfcEmpresa',
          allowEditing: false
        },
        {
          caption: 'Numero contrato',
          dataField: 'numeroContrato',
          allowEditing: false
        },
        {
          caption: 'Numero solicitud',
          dataField: 'numeroSolicitud',
          allowEditing: false
        },
        {
          caption: 'Fecha de creacion',
          dataField: 'fechaCreacionSolicitud',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Dias transcurridos',
          dataField: 'DiasTranscurridosSolicitud',
          allowEditing: false
        },
        {
          caption: 'Numero de orden',
          dataField: 'numeroOrden',
          allowEditing: false
        },
        {
          caption: 'Zona',
          dataField: 'Zona',
          allowEditing: false
        },
        {
          caption: 'Placas',
          dataField: 'Placas',
          allowEditing: false
        },
        {
          caption: 'Kilometraje',
          dataField: 'Kilometraje',
          allowEditing: false
        },
        {
          caption: 'Marca',
          dataField: 'Marca',
          allowEditing: false
        },
        {
          caption: 'Submarca',
          dataField: 'Submarca',
          allowEditing: false
        },
        {
          caption: 'Combustible',
          dataField: 'Combustible',
          allowEditing: false
        },
        {
          caption: 'Clase',
          dataField: 'Clase',
          allowEditing: false
        },
        {
          caption: 'Cilindros',
          dataField: 'Cilindros',
          allowEditing: false
        },
        {
          caption: 'VIN',
          dataField: 'VIN',
          allowEditing: false
        },
        {
          caption: 'Año',
          dataField: 'Año',
          allowEditing: false
        },
        {
          caption: 'Numero economico',
          dataField: 'NumeroEconomico',
          allowEditing: false
        },
        {
          caption: 'Razon social',
          dataField: 'razonSocial',
          allowEditing: false
        },
        {
          caption: 'RFC proveedor',
          dataField: 'rfcProveedor',
          allowEditing: false
        },
        {
          caption: 'Nombre comercial',
          dataField: 'nombreComercial',
          allowEditing: false
        },
        {
          caption: 'Sub total costo',
          dataField: 'subTotalCosto',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'IVA costo',
          dataField: 'IVACosto',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'Total costo',
          dataField: 'totalCosto',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'Sub total venta',
          dataField: 'subTotalVenta',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'IVA venta',
          dataField: 'IVAVenta',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'Total venta',
          dataField: 'totalVenta',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'Usuario solicitud',
          dataField: 'UsuarioSolicitud',
          allowEditing: false
        },
        {
          caption: 'Fecha solicitud',
          dataField: 'FechaSolicitud',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Estado de la unidad',
          dataField: 'EstadoDeLaUnidad',
          allowEditing: false
        },
        {
          caption: 'Fecha cita',
          dataField: 'FechaCita',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Usuario aprobacion',
          dataField: 'UsuarioAprobacion',
          allowEditing: false
        },
        {
          caption: 'Fecha aprobacion',
          dataField: 'FechaAprobacion',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Usuario proceso',
          dataField: 'UsuarioProceso',
          allowEditing: false
        },
        {
          caption: 'Fecha proceso',
          dataField: 'FechaProceso',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Usuario entrega',
          dataField: 'UsuarioEntrega',
          allowEditing: false
        },
        {
          caption: 'Fecha entrega',
          dataField: 'FechaEntrega',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Usuario cobranza',
          dataField: 'UsuarioCobranza',
          allowEditing: false
        },
        {
          caption: 'Fecha cobranza',
          dataField: 'FechaCobranza',
          allowEditing: false,
          dataType: TiposdeDato.datetime
        },
        {
          caption: 'Estatus orden',
          dataField: 'EstatusOrden',
          allowEditing: false
        },
        {
          caption: 'Centro costo',
          dataField: 'CentroCosto',
          allowEditing: false
        },
        {
          caption: 'Hoja de trabajo',
          dataField: 'HojaDeTrabajo',
          allowEditing: false,
          cellTemplate: "pdf"
        },
        {
          caption: 'Factura',
          dataField: 'factura',
          allowEditing: false
        },
        {
          caption: 'CXP folio',
          dataField: 'CXP_folio',
          allowEditing: false
        },
        {
          caption: 'CXP serie',
          dataField: 'CXP_serie',
          allowEditing: false
        },
        {
          caption: 'CXP uuid',
          dataField: 'CXP_uuid',
          allowEditing: false
        },
        {
          caption: 'No tareas terminadas',
          dataField: '#TareasTerminadas',
          allowEditing: false
        },
        {
          caption: 'No tareas no terminadas',
          dataField: '#TareasNoTerminadas',
          allowEditing: false
        },
        {
          caption: 'Comentarios',
          dataField: 'comentarios',
          allowEditing: false
        },
        {
          caption: 'Ejecutivo',
          dataField: 'Ejecutivo',
          allowEditing: false
        }
      ]
    };
  }

  receiveMessage($event) {

  }

  Excepciones(stack, tipoExcepcion: number) {
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
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
      });

    } catch (err) {
    }
  }

  getSelectedItemsKeys(items) {
    let result = [];
    const _this = this;
    items.forEach((item) => {
      if (item.selected) {
        result.push({
          numeroContrato: item.itemData.numeroContrato,
          idCliente: item.itemData.idCliente,
          rfcEmpresa: item.itemData.rfcEmpresa,
          label: item.itemData.descripcion,
          idContratoZona: item.itemData.idContratoZona
        });
        if (item.children.length > 0) {
          item.children.forEach((_child) => {
            result.push({
              numeroContrato: item.itemData.numeroContrato,
              idCliente: item.itemData.idCliente,
              rfcEmpresa: item.itemData.rfcEmpresa,
              label: item.itemData.descripcion,
              idContratoZona: _child.itemData.idContratoZona
            });
          });
          return _this.getSelectedItemsKeys(item.children)  
        }
      }
      if (item.children.length > 0) {
        return result = result.concat(_this.getSelectedItemsKeys(item.children));
      }
    });
    return result;
  }

  TreeView_itemSelectionChanged(e) {
    this.selectedTreeItem = [];
    const nodes = e.component.getNodes();
    console.log(nodes);
    const valor = this.getSelectedItemsKeys(nodes);
    if (valor.length > 0) {
      this.treeBoxValue = valor[0].label;
      this.idZona = valor[0].idContratoZona;
      this.selectedTreeItem = [...valor];
    }
  }

  /* Begin Region Grid*/
  /**
   * @description Funcíones necesarias para implementacion de grid
   * @author Jose Luis Lozada Guerrero
   */
  ToolbarButtonEvent($event) {
    switch ($event) {
      case BUTTONS_TOOLBAR.SELECCION_DE_TALLER:
        this.appBannerSpinner = true;
        // this.rfcProveedor = this.datosevent[0].rfcProveedor;
        // this.idProveedorEntidad = this.datosevent[0].idProveedorEntidad;

        this.appBannerSpinner = false;
        break;
    }
  }

  /**
    * @description Cierra en automatico al seleccionar un item de la lista dinamica
    * @param $event Objeto de la lista
    * @author Andres Farias
    */
  closeWindow($event: any) {
    if ($event.value === null) {
      this.idZona = 0;
      //this.LoadData();
    }
    $event.instance.close();
  }
}