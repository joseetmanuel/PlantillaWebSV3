import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IGridOptions, IColumns, IColButtons, IExportExcel, ISummaries, ISearchPanel, IScroll, Toolbar } from '../interfaces'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-grid-component',
  templateUrl: './grid-component.component.html',
  styleUrls: ['./grid-component.component.css'],
})

export class GridComponentComponent implements OnInit {


  @ViewChild('grid',{read: ElementRef})
  grid: ElementRef;
  //******************SE RECIBEN PARAMETROS Y SE ENVIA RESPUESTA**************** */
  @Input() datos: [];
  @Input() gridOptions: IGridOptions;
  @Input() columns: IColumns;
  @Input() colButtons: IColButtons;
  @Input() exportExcel: IExportExcel;
  @Input() summaries: ISummaries;
  @Input() searchPanel: ISearchPanel;
  @Input() scroll: IScroll;
  @Input() toolbar: Toolbar[];

  @Output() messageEvent = new EventEmitter<{ event: string, data: [] }>();
  remoteOperations: boolean;

  constructor(config: NgbModalConfig, private modalService: NgbModal,private element: ElementRef,private renderer: Renderer2) {
    config.backdrop = 'static';
    config.keyboard = false;
   }

   ngAfterViewInit(){
    // console.log("grid:", this.grid.nativeElement);

       const div = this.grid.nativeElement.querySelector('.dx-datagrid-filter-panel');
       const parent = this.grid.nativeElement.querySelector('.dx-datagrid');
       const refChild = this.element.nativeElement.querySelector('.dx-datagrid-header-panel');
       this.renderer.insertBefore(parent, div, refChild);
   }

   open(content) {
    this.modalService.open(content);
  }

  checkBoxToggled(e) {
    console.log(e.value);
   };


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

  //******************CONTADOR DE ITEMS SELECCINADOS**************** */
  calculateSelectedRow(options) {
    if (options.name === "SelectedRowsSummary") {
        if (options.summaryProcess === "start") {
            options.totalValue = 0;
        } else if (options.summaryProcess === "calculate") {
            if (options.component.isRowSelected(options.value.id)) {
                options.totalValue++;
            }
        }
    }
}
onSelectionChanged(e) {
  e.component.refresh(true);
}



//******************CREACION DE TOOLBAR**************** */
  onToolbarPreparing(e) {
    e.toolbarOptions.items.unshift({
         location: 'before',
         template: 'totalGroupCount'
    }, 
    ...this.toolbar
  );
}



}
