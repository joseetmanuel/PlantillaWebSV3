import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from '../../../services/siscov3.service';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../../../interfaces'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IProveedor } from '../../interfaces';
import { ITEM_STORAGE, BUTTONS_TOOLBAR } from '../enums';
import { MatSnackBar, MatDialog } from '@angular/material';

@Component({
  selector: 'app-upd-proveedor',
  templateUrl: './upd-proveedor.component.html',
  styleUrls: ['./upd-proveedor.component.sass'],
  providers: [SiscoV3Service]
})

export class UpdProveedorComponent implements OnInit {

  gridOptions: IGridOptions;
  columns: IColumns[] = [];
  columDoc: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[];
  cienteEntidad = [];
  documentos = [];
  public loading:boolean;
  panelOpenState = false;
  proveedorForm = new FormGroup({
    nombre: new FormControl('', [Validators.required])
  });

  public rfcProveedor;
  private proveedorEntidad = [];
  public datosevent: any;


  constructor(
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute) {

      this.activatedRoute.params.subscribe(parametros => {
        this.rfcProveedor = parametros.rfcProveedor;
        this.getProveedorEntidad(this.rfcProveedor);
      });
  }

  modificarProveedor($event) {
    if($event.data){
      this.loading = true;
      const proveedor: IProveedor = $event.data;
      this._siscoV3Service.putService('proveedor/putActualizaProveedor', proveedor).subscribe(rs => {
        this.loading = false;
        localStorage.setItem(ITEM_STORAGE.ITEM_DATOS_PROVEEDOR, JSON.stringify(proveedor));
        this.snackBar.open('Se a actualizado el proveedor.', 'Ok', {
          duration: 2000
        });
      }, err => {
        this.loading = false;
      })
    }
  }

  ngOnInit() {
    //******************PARAMETROS DE PAGINACION DE GRID**************** */
    let pageSizes = [];
    pageSizes.push("10", "25", "50", "100")

    //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

    //******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: "talleres" }

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
          onClick: this.receiveMessage.bind(this, BUTTONS_TOOLBAR.AGREGAR)
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
          onClick: this.receiveMessage.bind(this, BUTTONS_TOOLBAR.EDITAR)
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
          onClick: this.receiveMessage.bind(this, BUTTONS_TOOLBAR.ELIMINAR)
        }, visible: false,
        name: "simple"
      },
    ]
  }

  getColumns(proveedor) {
    for (const key in proveedor) {
      if (proveedor.hasOwnProperty(key)) {
        this.columns.push(
          {
            caption: key,
            dataField: key
          }
        );
      }
    }
  }

  getProveedorEntidad(rfcProveedor:string){
    this._siscoV3Service.getService('proveedor/getProveedorEntidadByRFC?rfcProveedor=' + rfcProveedor).subscribe((rs:any) => {
      this.proveedorEntidad = rs.recordsets[0] ? rs.recordsets[0] : [];
      if(this.proveedorEntidad.length > 0)
        this.getColumns(this.proveedorEntidad[0]);
    }, err => {
      console.log(err);
      
    })
  }

  receiveMessage($event) {
    // this.data = $event.data;
    switch($event.event){
      case BUTTONS_TOOLBAR.AGREGAR:
        this.router.navigateByUrl("/ins-proveedor-entidad/" + this.datosevent[0].rfcProveedor);
      break;
      case BUTTONS_TOOLBAR.EDITAR:
      break;
      case BUTTONS_TOOLBAR.ELIMINAR:
      break;
    }
  }

  datosMessage($event) {
    this.datosevent = $event.data;
  }

}
