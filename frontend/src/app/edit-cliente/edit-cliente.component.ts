import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '../../../node_modules/@angular/router';
import { SiscoV3Service } from '../services/siscov3.service';
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
import { FormGroup, FormControl, Validators } from '../../../node_modules/@angular/forms';

@Component({
  selector: 'app-edit-cliente',
  templateUrl: './edit-cliente.component.html',
  styleUrls: ['./edit-cliente.component.sass'],
  providers: [SiscoV3Service]
})
export class EditClienteComponent implements OnInit {

  datosevent;
  gridOptions: IGridOptions;
  columns: IColumns[];
  columDoc: IColumns[];
  colButtons: IColButtons[];
  exportExcel: IExportExcel;
  summaries: ISummaries[];
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  // data: [1];
  cienteEntidad = [];
  documentos = [];
  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required])
  });

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
  
  //******************FUNCION AGREGAR**************** */
  add(data) {
    console.log(data)
    this.router.navigateByUrl("/add-clienteEntidad/"+this.idCliente);
  }

  //******************FUNCION EDITAR**************** */
  edit(data) {
    let rfcClienteEntidad = this.datosevent[0].rfcClienteEntidad;
    this.router.navigateByUrl("/edit-clienteEntidad/"+rfcClienteEntidad);
  }

  //******************FUNCION BORRAR**************** */
  delete(data) {
    console.log(data)
  }

  public idCliente;
  cliente;
  constructor(
    private router: Router,
    private _siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
    });
    _siscoV3Service.getService('cliente/getClientePorId?idCliente=' + this.idCliente).subscribe(
      (res: any) => {
        // console.log();
        this.cliente = res.recordsets[0][0];
        this.clienteForm.controls['nombre'].setValue(this.cliente.nombre);
        _siscoV3Service.getService('cliente/getClienteEntidadPorIdCliente?idCliente=' + this.idCliente).subscribe(
          (res: any) => {
            this.cienteEntidad = res.recordsets[0];
          }, (error: any) => {
            console.log(error);
          }
        )
      }, (error: any) => {
        console.log(error);
      }
    )

  }

  agregarCliente() {
    this.cliente.nombre = this.clienteForm.controls['nombre'].value;
    let data = {
      hola: 'ghj'
    }
    console.log(this.cliente);
    this._siscoV3Service.putService('cliente/putActualizaCliente', this.cliente).subscribe(
      (res: any) => {
        console.log(res)
      }, (error: any) => {
        console.log(error)
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
        caption: "rfcClienteEntidad",
        dataField: "rfcClienteEntidad",
        hiddingPriority: "1"
      },
      {
        caption: "nombreComercial",
        dataField: "nombreComercial",
        hiddingPriority: "0"
      },
      {
        caption: "Teléfono",
        dataField: "telefono",
        hiddingPriority: "0"
      },
      {
        caption: "Email",
        dataField: "email",
        hiddingPriority: "0"
      },
    ]

    this.columDoc = [
      {
        caption: "Check",
        dataField: "check",
        cellTemplate: "checkbox",
        hiddingPriority: "2"
      },
      {
        caption: "idDocumento",
        dataField: "idDocumento",
        hiddingPriority: "1"
      },
      {
        caption: "Documento",
        dataField: "docuemento",
        hiddingPriority: "1"
      }
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
