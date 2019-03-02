import { Component, OnInit } from '@angular/core';
import {
  IGridOptions,
  IColumns,
  IColButtons,
  IExportExcel,
  ISummaries,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../interfaces'
import { SiscoV3Service } from '../services/siscov3.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.sass', '../app.component.sass'],
  providers: [SiscoV3Service]
})
export class ClientesComponent implements OnInit {

  gridOptions: IGridOptions;
  columns: IColumns[];
  colButtons: IColButtons[];
  exportExcel: IExportExcel;
  summaries: ISummaries[];
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  data: [1];
  clientes = [];

  receiveMessage($event) {
    this.evento = $event.event;
    this.data = $event.data;
    console.log($event);

    if (this.evento == "add") {
      this.add(this.data);
    }
    else if (this.evento == "edit") {
      this.edit(this.data);
    }
    else if (this.evento == "delete") {
      this.delete(this.data);
    }
  }

  datos = [{
    "check": false,
    "id": 1,
    "nombre": "Edgar"
  },
  {
    "check": false,
    "id": 2,
    "nombre": "otro"
  }]

  //******************FUNCION AGREGAR**************** */
  add(data) {

  }

  //******************FUNCION EDITAR**************** */
  edit(data) {

  }

  //******************FUNCION BORRAR**************** */
  delete(data) {

  }

  constructor(private _siscoV3Service:SiscoV3Service) {
    _siscoV3Service.getService('cliente/getClientes').subscribe(
      (res:any)=>{
        this.clientes = res.recordsets[0];
        console.log(this.clientes.length)
        console.log(this.datos)
      },(error:any)=>{
        console.log(error);
      }
    )
  }

  ngOnInit() {
    this.columns = [
      {
        caption: "Check",
        dataField: "check",
        cellTemplate: "checkbox",
        hiddingPriority: "2"
      },
      {
        caption: "idCliente",
        dataField: "idCliente",
        hiddingPriority: "1",
        width:100
      },
      {
        caption: "nombreCliente",
        dataField: "nombre",
        hiddingPriority: "0"
      },
    ]

    //******************PARAMETROS DE TEMPLATE DE BOTONES**************** */
    


    //******************PARAMETROS DE SUMMARIES**************** */
    this.summaries = [
      {
        column: "idCliente",
        summaryType: "custom",
        displayFormat: "Check: {0}",
        name: "SelectedRowsSummary"
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
        location: 'before',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: 'Agregar',
          onClick: this.receiveMessage.bind(this, 'add')

        }
      },
      {
        location: 'before',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: 'Editar'
        }
      },
      {
        location: 'before',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: 'Eliminar'
        }
      }
    ]
  }
}
