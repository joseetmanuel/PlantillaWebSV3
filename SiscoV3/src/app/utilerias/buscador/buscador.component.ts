import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SiscoV3Service } from '../../services/siscov3.service';
import { environment } from '../../../environments/environment';
import { IBuscador, TipoBusqueda } from 'src/app/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.scss']
})
export class BuscadorComponent implements OnInit, AfterViewInit {
  formBuscar = new FormControl();
  prueba = '<img class="example-option-img" aria-hidden src="https://www.adnradio.cl/images_remote/360/3602973_n_vir3.jpg?u=902020">'
  datosFiltrados: any[] = [];
  loading = true;
  /**
   * Elemento para entrada de la busqueda a realizar
   */
  @ViewChild('busqueda') busquedaElement: ElementRef;
  @ViewChild('contentInput') contentInput: ElementRef;
  placeholder = 'Buscar';
  // tslint:disable-next-line: no-input-rename
  @Input('IBuscador') buscador: IBuscador;
  @Input('numeroOrden') numeroOrden: any;
  // tslint:disable-next-line: no-output-rename
  @Output('responseBuscador') responseBuscador = new EventEmitter<{}>();
  // tslint:disable-next-line: no-output-rename
  @Output('closeInput') closeInputEvent = new EventEmitter<{}>();

  busquedaValor: string;
  // Url del file upload, se ocupa para obtener las fotos.
  urlFileServer = environment.fileServerUrl;
  TipoBusqueda = TipoBusqueda;
  private url: string;
  tipoTmp: string;
  campos: any;

  constructor(private service: SiscoV3Service, private router: Router,) {
  }

  ngOnInit(): void {
    switch (this.buscador.tipoBusqueda) {
      case TipoBusqueda.parqueVehicular:
        this.url = 'contrato/selObjetoPorContrato';
        break;
      case TipoBusqueda.usuario:
        this.url = 'seguridad/selUsuarioBuscador';
        break;
      case TipoBusqueda.proveedor:
        this.url = 'proveedor/SelProveedorEntidadPorContrato';
        break;
      case TipoBusqueda.operador:
        this.url = 'operador/selOperadorNombre';
        break;
      case TipoBusqueda.objeto:
        this.url = 'operador/selObjetoGeneral';
        break;
      case TipoBusqueda.general:
        this.url = 'common/PostBusquedaGeneral';
    }
  }

  ngAfterViewInit() {
    this.formBuscar.valueChanges.subscribe(val => {
      // Si hay mas de 3 letras en el input, se ejecuta el buscador.
      if(val) {
        if (val.length > 3) {
          this.buscador.parametros.busqueda = val;
          this.service.postService(this.url, this.buscador.parametros).subscribe((res: any) => {
            //Si es de tipo general
            this.datosFiltrados = [];
            if(this.TipoBusqueda.general == this.buscador.tipoBusqueda) {

              let objetos = res.recordsets[0];
              let proveedor = res.recordsets[1];
              let orden = res.recordsets[2];
              this.campos = res.recordsets[3];
              if (objetos.length > 0) {
                this.datosFiltrados.push({ grupo: objetos[0].nombreObjeto, items: objetos });
              }
              if (proveedor.length > 0) {
                this.datosFiltrados.push({ grupo: 'Proveedores', items: proveedor });
              }

              if (orden.length > 0) {
                this.datosFiltrados.push({ grupo: 'Ordenes', items: orden });
              }
            } else {
              this.datosFiltrados = res.recordsets[0];
              this.campos = res.recordsets[1];
            }
          }, error => {
            this.responseBuscador.emit({ error: [error], recordsets: [] });
          });
        } else {
          this.datosFiltrados = [];
        }
      }
    });
  }

  /**
   * @description Abre la entrada de la busqueda
   * @author Andres Farias
   */
  AbreBusqueda() {
    this.buscador.isActive = true;
    this.busquedaElement.nativeElement.focus();
    this.closeInputEvent.emit({ close: false });
  }

  /**
   * @description Se ejecuta al seleccionar un item de la lista
   * @author Andres Farias
   */
  changeOption(filtro: any) {
    this.responseBuscador.emit({ error: [], recordsets: [filtro] });
    this.datosFiltrados = [];

    this.busquedaElement.nativeElement.value = '';

  }

  closeInput() {
    this.buscador.isActive = false;
    this.closeInputEvent.emit({ close: true });
  }

}
