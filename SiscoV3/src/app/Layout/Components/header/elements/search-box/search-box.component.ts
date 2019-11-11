import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
})
export class SearchBoxComponent implements OnInit {
  /**
   * Elemento para entrada de la busqueda a realizar
   */
  @ViewChild('busqueda') busquedaElement: ElementRef;
  /**
   * Valor buscado
   */
  @Input() busquedaValor: string;
  /**
   * Marca de agua del elemento
   */
  @Input() placeholder = 'Buscar';
  /**
   * Dispara el evento cuando valor buscado cambia
   */
  @Output() busquedaValorChange: EventEmitter<string> = new EventEmitter<string>();
  /**
   * Dispara el evento cuando se presiona enter
   */
  @Output() enterPressed: EventEmitter<string> = new EventEmitter<string>();
  /**
   * Dispara el evento cuando se presiona el botón
   */
  @Output() buscar: EventEmitter<string> = new EventEmitter<string>();
  /**
   * Define si está activa la entrada de busqueda
   */
  public isActive: any;

  /**
   * Inicializa un nuevo elemento del tipo SearchBoxComponent
   * @author Arturo López Corona
   */
  constructor() { }

  /**
   * Se ejecuta cada vez que el componente está inicializado
   * @author Arturo López Corona
   */
  ngOnInit() {
  }

  /**
   * Abre la entrada de la busqueda
   * @author Arturo López Corona
   */
  AbreBusqueda() {
    if (!this.isActive) {
      this.isActive = true;
      this.busquedaElement.nativeElement.focus();
    }
    if( this.isActive ){
      this.busquedaValorChange.emit( this.busquedaValor )
    }
  }

  /**
   * Obtiene la tecla presionada y en caso de que sea Escape cierra la busqueda
   * @param e Tecla presionada
   */
  OnKeyPress(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.isActive = false;
    } else if (e.key === 'Enter') {
      this.enterPressed.emit(this.busquedaValor);
    }
  }
}