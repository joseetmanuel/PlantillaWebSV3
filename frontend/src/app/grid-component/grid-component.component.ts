import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IGridOptions, IColumns, IExportExcel, ISearchPanel, IScroll, Toolbar } from '../interfaces'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridModule, DxDataGridComponent, getElement } from "devextreme-angular";




@Component({
  selector: 'app-grid-component',
  templateUrl: './grid-component.component.html',
  styleUrls: ['./grid-component.component.css'],
})

export class GridComponentComponent implements OnInit {

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent
  @ViewChild('grid',{read: ElementRef})
  grid: ElementRef;
  //******************SE RECIBEN PARAMETROS Y SE ENVIA RESPUESTA**************** */
  @Input() datos: [];
  @Input() gridOptions: IGridOptions;
  @Input() columns: IColumns;
  @Input() exportExcel: IExportExcel;
  @Input() searchPanel: ISearchPanel;
  @Input() scroll: IScroll;
  @Input() toolbar: Toolbar[];

  @Output() messageEvent = new EventEmitter<{ event: string, data: [] }>();
  remoteOperations: boolean;
  @Output() datosevent = new EventEmitter<{data:[] }>();
  

  constructor(config: NgbModalConfig, private modalService: NgbModal,private element: ElementRef,private renderer: Renderer2) {
    config.backdrop = 'static';
    config.keyboard = false;
   }

   ngAfterViewInit(){
    // console.log("grid:", this.grid.nativeElement);
       const div = this.grid.nativeElement.querySelector('.dx-datagrid-filter-panel');
       const parent = this.grid.nativeElement.querySelector('.dx-datagrid');
       const refChild = this.element.nativeElement.querySelector('.dx-datagrid-headers');
       this.renderer.insertBefore(parent, div, refChild);
   }

   open(content) {
    this.modalService.open(content);
  }

  ngOnInit() {

    if (this.gridOptions == undefined) {
      this.gridOptions = { paginacion: 50, pageSize: ["50", "100", "150"] }
    }
    if (this.scroll.mode == "virtual") {
      this.remoteOperations = true;
    } else {
      this.remoteOperations = false;
    }
    
  }

  //******************SE DEVUELVE EVENTO CLICK**************** */
  onclick(event, data) {
    this.messageEvent.emit({ event, data })
  }

  //******************CONTADOR DE ITEMS SELECCINADOS Y DEVUELVE DATOS AL EMITER**************** */

public contador = 0;
onSelectionChanged(e) {
  let data = e.selectedRowsData
  this.datosevent.emit({ data })
  let cont = [];
  cont.push(e.selectedRowKeys)
  this.contador = cont[0].length;
  // console.log(this.toole.toolbarOptions.items)
    for( let i=0;i< this.toole.toolbarOptions.items.length-1; i++){
      if (this.toole.toolbarOptions.items[i].name){
        if(cont[0].length >= 1 && this.toole.toolbarOptions.items[i].name == "simple"){
          this.toole.toolbarOptions.items[i]['visible']=true; 
          
              if(cont[0].length >= 2  && this.toole.toolbarOptions.items[i].name2 == "multiple"){
                this.toole.toolbarOptions.items[i]['visible']=false;
                
              }
            } else if(cont[0].length <= 0  && this.toole.toolbarOptions.items[i].name == "simple"){
              this.toole.toolbarOptions.items[i]['visible']=false;
            }
      }
    }
    this.dataGrid.instance.refresh()
}



//******************CREACION DE TOOLBAR**************** */
public toole;
onToolbarPreparing(e) {
  this.toole = e;
  var item = e.toolbarOptions.items.find(item => item.name === "columnChooserButton");
  item.options.icon = "../../assets/seleccion.png";
  
    e.toolbarOptions.items.unshift({
         location: 'before',
         template: 'Totalderegistros'
    },{
      location: 'before',
      template: 'Contarseleccionados',
      visible: false,
      name: "simple"
 }, 
    ...this.toolbar
  );

}

//***************COLUMN CHOOSER EVENT****************** */
onContentReady(e){
// console.log(e)
}

}
