import { Component, OnInit } from '@angular/core';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../../../interfaces'
import { BUTTONS_TOOLBAR, ITEM_STORAGE } from '../enums';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router } from '@angular/router';
import { IProveedor } from '../../interfaces';

@Component({
  selector: 'app-sel-proveedor',
  templateUrl: './sel-proveedor.component.html',
  styleUrls: ['./sel-proveedor.component.sass'],
  providers: [SiscoV3Service]
})
export class SelProveedorComponent implements OnInit {

  private datosevent:object;
  gridOptions: IGridOptions;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  // data: [];
  proveedores: IProveedor[] = [];
  public loading:boolean;

  constructor(private router: Router, private _siscoV3Service: SiscoV3Service) {
    this.getProveedores();
  }
  
  ngOnInit() {
    this.configParamsDataGrid();
  }

  getProveedores(){
    this.loading = true;
    this._siscoV3Service.getService('proveedor/getProveedores').subscribe(
      (res: any) => {
        this.loading = false;
        this.proveedores = res.recordsets[0];
      }, (error: any) => {
        this.loading = false;
      }
    )
  }

  eventButtonDataGrid($event:string) {
    switch($event){
      case BUTTONS_TOOLBAR.AGREGAR:
        this.router.navigateByUrl("/ins-proveedor");
      break;
      case BUTTONS_TOOLBAR.EDITAR:
        let rfc = this.datosevent[0].rfcProveedor;
        localStorage.setItem(ITEM_STORAGE.ITEM_DATOS_PROVEEDOR, JSON.stringify(this.datosevent[0]))
        this.router.navigateByUrl("/upd-proveedor/" + rfc);
      break;
      case BUTTONS_TOOLBAR.ELIMINAR:
        this.loading = true;
        this._siscoV3Service.deleteService('proveedor/delProveedor', 'rfcProveedor=' + this.datosevent[0].rfcProveedor)
        .subscribe(rs => {
          console.log(rs);
          this.loading = false;
          this.getProveedores();
        }, err => {
          this.loading = false;
        })

      break;
    }
  }


  configParamsDataGrid(){
    this.columns = [
      {
        caption: "RFC",
        dataField: "rfcProveedor",
        hiddingPriority: "1",
        width: 150
      },
      {
        caption: "Nombre Comercial",
        dataField: "nombreComercial",
        hiddingPriority: "0"
      },
      {
        caption: "Contacto",
        dataField: "personaContacto",
        hiddingPriority: "0"
      }
    ]

    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("10", "25", "50", "100")

    //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

    //******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: "prueba2" }

    //******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: "Buscar...", filterRow: true }

    //******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: "standard" }

    //******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.AGREGAR,
          onClick: this.eventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.AGREGAR)
        },
        visible: true
      },
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.EDITAR,
          onClick: this.eventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.EDITAR)
        }, visible: false,
        name: "simple",
        name2: "multiple"
      },
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: BUTTONS_TOOLBAR.ELIMINAR,
          onClick: this.eventButtonDataGrid.bind(this, BUTTONS_TOOLBAR.ELIMINAR)
        }, visible: false,
        name: "simple"
      }
    ]
  }

  datosMessage($event:any) {
    this.datosevent = $event.data
  }

}
