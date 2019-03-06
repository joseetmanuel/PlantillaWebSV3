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
import { Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.sass', '../app.component.sass'],
  providers: [SiscoV3Service]
})
export class ClientesComponent implements OnInit {

  datosevent;
  gridOptions: IGridOptions;
  columns: IColumns[];
  colButtons: IColButtons[];
  exportExcel: IExportExcel;
  summaries: ISummaries[];
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  // data: [];
  clientes = [];
  public numero = 1;

  receiveMessage($event) {
    this.evento = $event.event;
    // this.data = $event.data;
    if ($event == "add") {
      let senddata = {
        event: $event
      }
      this.add(senddata);
    }
    else if ($event == "edit") {
      let senddata = {
        event: $event,
        data: this.datosevent
      }
      this.edit(senddata);
    }
    else if ($event == "delete") {
      let senddata = {
        event: $event,
        data: this.datosevent
      }
      this.delete(senddata);
    }
  }

  datosMessage($event) {
    this.datosevent = $event.data
    // console.log(this.datosevent);
  }

  constructor(private router: Router,private _siscoV3Service: SiscoV3Service) {
    this.numero = 0;
    _siscoV3Service.getService('cliente/getClientes').subscribe(
      (res: any) => {
        this.numero = 1;
        this.clientes = res.recordsets[0];
        // console.log(this.clientes.length)
      }, (error: any) => {
        console.log(error);
      }
    )
  }

  //******************FUNCION AGREGAR**************** */
  add(data) {
    this.router.navigateByUrl("/add-cliente");
  }

  //******************FUNCION EDITAR**************** */
  edit(data) {
    this.router.navigateByUrl("/edit-cliente/"+this.datosevent[0]["idCliente"]);
  }

  //******************FUNCION BORRAR**************** */
  delete(data) {
    let sisco = this._siscoV3Service;
    // console.log(data.data)
    let borrar = "<Ids>";
    let cont = 0;
    data.data.forEach(function(element,index,array){
      borrar += "<idCliente>"+element.idCliente+"</idCliente>";
      cont++;
      if(cont === array.length){
        borrar += "</Ids>";
        sisco.deleteService("cliente/deleteCliente",borrar).subscribe(
          (res:any)=>{
            console.log(res);
          }, (error:any)=>{
            console.log(error);            
          }
        )
       // console.log(borrar)
      }
    });

  }

  borrar(data){
    
  }



  ngOnInit() {
    this.columns = [
      {
        caption: "Check",
        dataField: "check",
        cellTemplate: "checkbox",
        hiddingPriority: "2",
        width: 150
      },
      {
        caption: "idCliente",
        dataField: "idCliente",
        hiddingPriority: "1",
        width: 150
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
          onClick: this.receiveMessage.bind(this, "add")
        },
        visible: true
      },
      {
        location: 'before',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: 'Editar',
          onClick: this.receiveMessage.bind(this, "edit")
        }, visible: false,
        name: "simple",
        name2: "multiple"
      },
      {
        location: 'before',
        widget: 'dxButton',
        locateInMenu: "auto",
        options: {
          width: 90,
          text: 'Eliminar',
          onClick: this.receiveMessage.bind(this, "delete")
        }, visible: false,
        name: "simple"
      },
    ]
  }
}
