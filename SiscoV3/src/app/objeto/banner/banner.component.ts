import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { GPSService } from 'src/app/services/gps.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  providers: [SiscoV3Service]
})
export class BannerComponent implements OnInit, OnChanges {
  deviceId: any;

  constructor(private siscoV3Service: SiscoV3Service, private httpClient: HttpClient, private gpsService: GPSService) { }
  IViewer: IViewer[];
  objeto: any;
  tipo = 2;
  pathFile: string;
  url: string;
  latitud = '19.3320935';
  longitud = '-99.2083881';
  @Input() IObjeto: any;
  /** variables para las imagenes de el objeto */
  placaIdFile: string;
  tarjetaCirculacionIdFile: string;
  tenenciaIdFile: string;
  verificacionIdFile: string;
  seguroIdFile: string;
  multaIdFile: string;
  diasUso = 0;
  indicadores: any = {};

  ngOnInit() {
    this.url = environment.fileServerUrl;
    this.AllObjeto();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.AllObjeto();
  }

  AllObjeto() {
    this.siscoV3Service.getService('objeto/getObjetoIdObjeto?idClase=' + this.IObjeto[0].idClase + '&&numeroContrato=' +
      this.IObjeto[0].numeroContrato + '&&idCliente=' + this.IObjeto[0].idCliente + '&&rfcEmpresa=' + this.IObjeto[0].rfcEmpresa +
      '&&idObjeto=' + this.IObjeto[0].idObjeto + '&&idTipoObjeto=' + this.IObjeto[0].idTipoObjeto)
      .subscribe((res: any) => {
        /** validamos fechas por default  */
        if (res.recordsets[0][0].multaVigencia == "1900-01-01" || res.recordsets[0][0].multaVigencia == "") { res.recordsets[0][0].multaVigencia = null }
        if (res.recordsets[0][0].tarjetaCirculacionVigencia == "1900-01-01" || res.recordsets[0][0].tarjetaCirculacionVigencia == "") { res.recordsets[0][0].tarjetaCirculacionVigencia = null }
        if (res.recordsets[0][0].tenenciaVigencia == "1900-01-01" || res.recordsets[0][0].tenenciaVigencia == "") { res.recordsets[0][0].tenenciaVigencia = null }
        if (res.recordsets[0][0].placaVigencia == "1900-01-01" || res.recordsets[0][0].placaVigencia == "") { res.recordsets[0][0].placaVigencia = null }
        if (res.recordsets[0][0].seguroVigencia == "1900-01-01" || res.recordsets[0][0].seguroVigencia == "") { res.recordsets[0][0].seguroVigencia = null }
        if (res.recordsets[0][0].verificacionVigencia == "1900-01-01" || res.recordsets[0][0].verificacionVigencia == "") { res.recordsets[0][0].verificacionVigencia = null }
        this.objeto = res.recordsets[0][0];

        // obtener la ultima ubicacion del objeto
        if (this.objeto.deviceid) {
          if (this.objeto.deviceid[0]) {
            this.gpsService.getService(`vehiculo/UltimaUbicacion?deviceid=${this.objeto.deviceid[0]}`)
              .subscribe((r: any) => {
                if (r.recordsets[0][0]) {
                  if (r.recordsets[0][0].latitude) {
                    this.latitud = r.recordsets[0][0].latitude;
                    this.longitud = r.recordsets[0][0].longitude;
                    this.objeto.latitude = r.recordsets[0][0].latitude;
                    this.objeto.longitude = r.recordsets[0][0].longitude;
                    this.objeto.attributes = r.recordsets[0][0].attributes ? JSON.parse(r.recordsets[0][0].attributes) : null;
                    this.objeto.protocol = r.recordsets[0][0].protocol;
                    this.objeto.altitude = r.recordsets[0][0].altitude;
                    this.objeto.speed = r.recordsets[0][0].speed;
                    this.objeto.course = r.recordsets[0][0].course;
                    this.deviceId = this.objeto.deviceid[0];
                    this.ObtenerTelemetriaObjeto();
                  }
                }
              });
          }
        }


        if (this.objeto) {
          this.CrearView(this.objeto.fotoPrincipal);
          /** fotos de los documentos */
          if (this.objeto.placaIdFile || this.objeto.placaIdFile > 0) {
            this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + this.objeto.placaIdFile)
              .subscribe((data: any) => {
                this.objeto.placaIdFileUrl = data.recordsets[0].path;
              }, (error: any) => {
                console.log(error);
              });
          }
          if (this.objeto.tarjetaCirculacionIdFile || this.objeto.tarjetaCirculacionIdFile > 0) {
            this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + this.objeto.tarjetaCirculacionIdFile)
              .subscribe((data: any) => {
                this.objeto.tarjetaCirculacionIdFileUrl = data.recordsets[0].path;
              }, (error: any) => {
                console.log(error);
              });
          }
          if (this.objeto.tenenciaIdFile || this.objeto.tenenciaIdFile > 0) {
            this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + this.objeto.tenenciaIdFile)
              .subscribe((data: any) => {
                this.objeto.tenenciaIdFileUrl = data.recordsets[0].path;
              }, (error: any) => {
                console.log(error);
              });
          }
          if (this.objeto.verificacionIdFile || this.objeto.verificacionIdFile > 0) {
            this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + this.objeto.verificacionIdFile)
              .subscribe((data: any) => {
                this.objeto.verificacionIdFileUrl = data.recordsets[0].path;
              }, (error: any) => {
                console.log(error);
              });
          }

          if (this.objeto.seguroIdFile || this.objeto.seguroIdFile > 0) {
            this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + this.objeto.seguroIdFile)
              .subscribe((data: any) => {
                this.objeto.seguroIdFileUrl = data.recordsets[0].path;
              }, (error: any) => {
                console.log(error);
              });
          }
          if (this.objeto.multaIdFile || this.objeto.multaIdFile > 0) {
            this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + this.objeto.multaIdFile)
              .subscribe((data: any) => {
                this.objeto.multaIdFileUrl = data.recordsets[0].path;
              }, (error: any) => {
                console.log(error);
              });
          }
        }
      });
  }

  ObtenerTelemetriaObjeto() {
    // Se obtienen los indicadores principales
    this.getIndicadoresPrincipales();
  }

  getIndicadoresPrincipales() {
    const urlSummary = 'vehiculo/IndicadoresPrincipales?from=' + moment().subtract(30, 'days').toISOString() +
      '&to=' + moment().toISOString() + '&deviceId=' + this.deviceId;
   
    this.gpsService.getService(urlSummary).subscribe(
      (res: any) => {
       
        this.indicadores = res.recordsets[0][0];

        const result = res.recordsets[1];
        this.diasUso = result.diasUso;
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  obtieneDiasDesde() {
    return moment().diff(this.objeto.fixtime, 'day');
  }

  CrearView(idArchivo) {

    if (idArchivo !== null) {
      this.IViewer = [
        {
          idDocumento: idArchivo,
          tipo: IViewertipo.avatar,
          descarga: false,
          size: IViewersize.lg
        }
      ];
    }
  }
}
