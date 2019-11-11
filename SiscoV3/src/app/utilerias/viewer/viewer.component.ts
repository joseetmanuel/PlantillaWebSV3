import { Component, OnInit, Input, Inject, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IViewertipo, IViewer } from '../../interfaces';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  providers: [NgbCarouselConfig]
})
export class ViewerComponent implements OnInit {
  // ****************** en Input se reciben los parametros para la visualizacion del archivo *******************
  public iviewer: Array<any>;
  @Input()
  set IViewer(iviewer: Array<any>) {
    this.iviewer = iviewer;
    if (iviewer && iviewer.length > 0) {
      this.Change();
    }
  }
  @Input() doc: Array<any>;
  @Input() total: number;
  @Input() documentosgrid: Array<any>;
  @Input() desactivador: boolean;
  @Input() desactivaragregar: boolean;
  @Output() messageEvent = new EventEmitter<{ event: string }>();
  @Output() datosevent = new EventEmitter<{ data: any[] }>();
  @Output() avatarevent = new EventEmitter<{ event: string, data: any, idUsuario: any }>();
  documento: any;
  documentos: [];
  navbarOpen = false;
  public contador = 0;
  public descarga;

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  constructor(private httpClient: HttpClient, config: NgbModalConfig, private modalService: NgbModal,
    confi: NgbCarouselConfig, public sanitizer: DomSanitizer) {
    // Configuracion base del carrusel
    confi.interval = 10000;
    confi.wrap = true;
    confi.keyboard = true;
    confi.pauseOnHover = false;
    config.backdrop = 'static';
    config.keyboard = false;
    this.documento = {
      path: '../../../assets/images/iconos-utilerias/default.png',
      titulo: 'Imagen no encontrada'
    }
  }

  ngOnInit() { }

  OpenDoc(url, descarga) {
    // si el parametro 'descarga' viene en en true se descargara el archivo de lo contrario se visualizara en una ventana nueva 
    if (descarga == true) {


    } else {
      window.open(url);
    }
  }
  // #endregion
  changed() {
    let data = this.doc.filter(value => value.checked);
    this.datosevent.emit({ data });
    this.contador = data.length;
    this.descarga = data;
    if (this.contador >= 1) {
      let element = document.querySelectorAll('div.oculto, button.oculto');
      [].forEach.call(element, function (el) {
        el.classList.remove('oculto');
      });
    } else if (this.contador <= 0) {
      let element = document.querySelectorAll('[name="ocultar"]');
      [].forEach.call(element, function (el) {
        el.classList.add('oculto');
      });
    } else if (this.contador == 0) {
      let element = document.querySelectorAll('[name="ocultar"]');
      [].forEach.call(element, function (el) {
        el.classList.add('oculto');
      });
    }
  }

  avatarclick(event, data) {
    for (let i = 0; i < this.IViewer.length; i++) {
      const element = this.IViewer[i];
      if (element.idDocumento === data.idDocumento) {
        const idUsuario = element.idUsuario;
        this.avatarevent.emit({ event, data, idUsuario });
      }
    }
  }

  eliminaravatar(index) {
    return index;
  }

  deleteAvatar(i) {
    this.documentos.splice(i, 1);
  }

  downloadimage() {
    this.descarga.forEach(o => {
      FileSaver.saveAs(o.path, o.titulo);
    });
  }

  open(Gridlightbox) {
    this.modalService.open(Gridlightbox, { size: 'lg' });
  }

  // ******************SE DEVUELVE EVENTO CLICK**************** */
  onclick(event) {
    this.messageEvent.emit({ event });
  }

  public Change() {
    if (this.iviewer[0].tipo === IViewertipo.gridavatar) {
      const idDocumentos = [];
      for (var i = 0; i < this.iviewer.length; i++) {
        idDocumentos.push(this.iviewer[i].idDocumento);
      }
      this.httpClient.post(`${environment.fileServerUrl}documento/GetDocumentosById`, { documentos: idDocumentos }).toPromise().then((data: any) => {
        this.documentos = data.recordsets;
      });
    }
    if (this.iviewer[0].tipo === IViewertipo.carrusel) {
      const idDocumentos = [];
      for (var i = 0; i < this.iviewer.length; i++) {
        idDocumentos.push(this.iviewer[i].idDocumento);
      }
      this.httpClient.post(`${environment.fileServerUrl}documento/GetDocumentosById`, { documentos: idDocumentos }).toPromise().then((data: any) => {
        this.documentos = data.recordsets;
      });
    } else {
      let dataV = this.iviewer && this.iviewer[0] ? this.iviewer[0] : []
      if (dataV && dataV.idDocumento && Number(dataV.idDocumento) > 0) {
        this.httpClient.get(`${environment.fileServerUrl}documento/GetDocumentoById?idDocumento=${dataV.idDocumento}`).toPromise().then((data: any) => {
          this.documento = data && data.recordsets && data.recordsets.length > 0 && data.recordsets[0].titulo ? data.recordsets[0] : this.documento;
        });
      } else {
        if (dataV) {
          this.documento = {
            path: dataV.url,
            titulo: dataV.urlNI ? dataV.urlNI : 'Sin título'
          };
        }
      }
    }
    // this.httpClient.get(environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + idFileServer).subscribe((data: any) => {
    //   this.documento = data.recordsets[0];
    // }, error => { });
  }
}
