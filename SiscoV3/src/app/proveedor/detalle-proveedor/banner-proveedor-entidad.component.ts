import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { environment } from 'src/environments/environment';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-banner-proveedor-entidad',
  templateUrl: './banner-proveedor-entidad.component.html',
  styleUrls: ['./banner-proveedor-entidad.component.scss']
})
export class BannerProveedorEntidadComponent implements OnInit {
  public fotoProveedor: string;
  IViewer: IViewer[];
  loading = false;
  public datosProveedorEntidad: any;
  urlFileServer = environment.fileServerUrl;
  especialidades: any[] = [];
  calificaciones: any[] = [];
  porcentajeTotal = 0;
  disponibilidad: any;
  contrato: any;
  datos: any;

  // tslint:disable-next-line: no-input-rename
  @Input('rfcProveedor') rfcProveedor: string;
  // tslint:disable-next-line: no-input-rename
  @Input('idProveedorEntidad') idProveedorEntidad: string;
  // tslint:disable-next-line: no-output-rename
  @Output('responseBannerProveedorEntidad') responseBuscador = new EventEmitter<{}>();

  constructor(private siscoV3Service: SiscoV3Service, private baseService: BaseService) { }

  ngOnInit() {
    this.contrato = this.baseService.getContractData();
    this.GetProveedor();
  }

  CrearView(urlArchivo) {
    if (urlArchivo) {
      this.IViewer = [
        {
          idDocumento: 0,
          tipo: IViewertipo.avatar,
          descarga: false,
          size: IViewersize.lg,
          url: urlArchivo,
          urlNI: 'Taller'
        }
      ];
    }
  }

  /**
   * @description Obtiene los datos del proveedor por medio de rfcProveedor
   * @author Andres Farias
   */
  GetProveedor() {
    this.loading = true;
    let ruta = `proveedor/GetProveedorEntidadBanner?rfcProveedor=${this.rfcProveedor}&idProveedorEntidad=${this.idProveedorEntidad}&idClase=${this.contrato.claseActual}`;
    this.siscoV3Service.getService(ruta).toPromise().then((res: any) => {
      if (res.err) {
      } else if (res.excepcion) {
      } else {
        this.datos = res.recordsets;
        if (this.datos.contacto) {
          this.CrearView(this.datos.contacto.logo);
        }
        this.especialidades = this.datos.especialidades;
        this.calificaciones = this.datos.calificaciones.calificacion;
        const porcentaje = this.datos.contacto.porcentajeDisponibilidad;
        this.disponibilidad = {
          cantidadDisponible: this.datos.contacto.cantidadDisponible,
          cantidadTotal: this.datos.contacto.totalDisponible,
          porcentaje: isNaN(porcentaje) ? 0 : porcentaje
        };
        this.porcentajeTotal = this.datos.calificaciones.porcentajeTotal;
      }
      this.loading = false;
    }).catch(err => {
      this.loading = false;
    });
  }

}
