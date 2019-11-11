import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { HttpClient } from '@angular/common/http';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { AccionNotificacion, GerenciaNotificacion, TareaPredefinida } from '../../interfaces';

@Component({
  selector: 'app-sel-solicitud-footer',
  templateUrl: './sel-solicitud-footer.component.html',
  styleUrls: ['./sel-solicitud-footer.component.scss']
})
export class SelSolicitudFooterComponent implements OnInit {
  @ViewChild('chatDropDown') chatDropDown: NgbDropdown;
  // VARIABLES INPUT Y OUTPUT

  @Input() idSolicitud: string;
  @Input() idTipoSolicitud: string;
  @Input() idClase: string;

  @Input() rfcEmpresa: string;
  @Input() idCliente: string;
  @Input() numeroContrato: string;
  @Output() responseFooter = new EventEmitter<{}>();

  ParametrosRecibidos: any;
  ParametrosAdicionales: any;
  spinner = false;
  togglemobilefooter = false;
  token = '';

  // VARIABLES PRIVADAS
  Botones = [];
  constructor(private siscoV3Service: SiscoV3Service, private httpClient: HttpClient, private router: Router) { }

  ngOnInit() {
    this.CreaParametrosRecibidos();
    // OBTENEMOS LOS BOTONES A TRAVES DEL SERVICIO
    this.siscoV3Service.getService('solicitud/GetBotonPaso?idSolicitud=' + this.idSolicitud +
      '&idTipoSolicitud=' + this.idTipoSolicitud + '&idClase=' + this.idClase +
      '&rfcEmpresa=' + this.rfcEmpresa + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato)
      .subscribe((res: any) => {
        if (res.recordsets[0]) {
          this.Botones = res.recordsets[0];
          // OBTENEMOS PARAMETROS ADICIONALES DEPENDIENDO EL NEGOCIO Y LA SOLICITUD
          // DICHOS PARAMETROS DEBERÁN DE SER DISTINTOS DE LOS @INPUT
          this.ParametrosAdicionales = [];
          this.siscoV3Service.getService('solicitud/GetSolicitudParametrosPaso?idSolicitud=' + this.idSolicitud +
            '&idTipoSolicitud=' + this.idTipoSolicitud + '&idClase=' + this.idClase +
            '&rfcEmpresa=' + this.rfcEmpresa + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato)
            .subscribe((res2: any) => {
              if (res2.recordsets.length > 0)
                this.AgregaParametrosAdicionales(res2.recordsets[0]);
            });

        }
      });

  }

  cerrarChat() {
    // this.chatDropDown.close();
  }

  CreaParametrosRecibidos() {
    this.ParametrosRecibidos = [];
    // ARMAMOS TOKEN
    this.token = this.idSolicitud + this.idTipoSolicitud + this.idClase + this.rfcEmpresa + this.idCliente + this.numeroContrato;
    // INSERTAMOS LOS VALORES RECIBIDOS POR @INPUTS
    this.ParametrosRecibidos.push({ key: 'idSolicitud', value: this.idSolicitud });
    this.ParametrosRecibidos.push({ key: 'idTipoSolicitud', value: this.idTipoSolicitud });
    this.ParametrosRecibidos.push({ key: 'idClase', value: this.idClase });
    this.ParametrosRecibidos.push({ key: 'rfcEmpresa', value: this.rfcEmpresa });
    this.ParametrosRecibidos.push({ key: 'idCliente', value: this.idCliente });
    this.ParametrosRecibidos.push({ key: 'numeroContrato', value: this.numeroContrato });
  }

  AgregaParametrosAdicionales(res: any) {
    res.forEach(element => {
      Object.keys(element).forEach(key => {
        this.ParametrosRecibidos.push(
          {
            key,
            value: element[key]
          });
      });
    });
  }

  async EjecutaAccionDinamica(accion: any) {
    this.responseFooter.emit({ muestraSpinner: true });
    this.spinner = true;
    const jsonDinamico = accion.AccionParametro ? JSON.parse(accion.AccionParametro) : '';
    const parametrosFuncion = jsonDinamico.parametrosFuncion;
    const parametrosRouter = jsonDinamico.parametrosRouter;
    const funcionComponente = accion.AccionFuncionComponente;
    let routerString = '';

    // RECORREMOS LOS PARAMETROS REQUERIDOS PARA TIPO FUNCION VS LOS PARAMETROS SETEADOS
    if (parametrosFuncion) {
      parametrosFuncion.forEach(parametro => {
        const auxiliar = this.ParametrosRecibidos.find(((x: { key: string; }) => x.key === parametro.key));
        if (auxiliar) {
          parametro.value = auxiliar.value;
        }
      });
    }

    // RECORREMOS LOS PARAMETROS REQUERIDOS PARA TIPO FUNCION VS LOS PARAMETROS SETEADOS
    if (parametrosRouter) {
      parametrosRouter.forEach(parametro => {
        const auxiliar = this.ParametrosRecibidos.find(((x: { key: string; }) => x.key === parametro.key));
        if (auxiliar) {
          parametro.value = auxiliar.value;
        }
      });
    }

    // GENERAMOS EL STRING DE ROUTEO
    if (parametrosRouter) {
      parametrosRouter.sort((n1, n2) => n1 - n2).forEach(parametro => {
        routerString += '/' + parametro.value;
      });
      if (parametrosRouter.length > 0) {
        // VERIFICAMOS QUE LA LONGITUD DE LOS PARAMETROS REQUERIDOS SEA IGUAL A LOS PARAMETROS SETEADOS
        if (parametrosRouter.filter(x => x.value !== '').length !== parametrosRouter.length) {
          this.responseFooter.emit({ error: ['Los parámetros no corresponden a la definición del botón'], recordsets: [] });
          return;
        }
      }
    }

    switch (accion.AccionTipoAccion) {
      case 'Router':
        this.spinner = false;
        this.responseFooter.emit({ c: false });
        this.responseFooter.emit({
          ruta: '/' + jsonDinamico.router + routerString
        });
        break;

      case 'Metodo':
        switch (accion.AccionFuncionComponente) {
          case 'EnviarAprobacion':
            this.EnviarAprobacion(parametrosFuncion, jsonDinamico.router, parametrosRouter, (mainPouter, prametersRouter) => {
              // VERIFICAMOS SI EL METODO APLICA ROUTEO
              if (mainPouter !== '') {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  ruta: '/' + mainPouter + (prametersRouter.length > 0 ? ('/' + prametersRouter) : '')
                });
              } else {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  estatus: 'OK'
                });
              }
            });
            break;
          case 'TerminoTrabajo':
            this.TerminoTrabajo(parametrosFuncion, jsonDinamico.router, parametrosRouter, (mainPouter, prametersRouter) => {
              // VERIFICAMOS SI EL METODO APLICA ROUTEO
              if (mainPouter !== '') {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  ruta: '/' + mainPouter + (prametersRouter.length > 0 ? ('/' + prametersRouter) : '')
                });
              } else {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  estatus: 'OK'
                });
              }
            });
            break;
          case 'ProcesarCompra':
            this.ProcesarCompra(parametrosFuncion, jsonDinamico.router, parametrosRouter, (mainPouter, prametersRouter) => {
              // VERIFICAMOS SI EL METODO APLICA ROUTEO
              if (mainPouter !== '') {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  ruta: '/' + mainPouter + (prametersRouter.length > 0 ? ('/' + prametersRouter) : '')
                });
              } else {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  estatus: 'OK'
                });
              }
            });
            break;
          case 'AprobarProvision':
            this.ApobarProvision(parametrosFuncion, jsonDinamico.router, parametrosRouter, (mainPouter, prametersRouter) => {
              // VERIFICAMOS SI EL METODO APLICA ROUTEO
              if (mainPouter !== '') {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  ruta: '/' + mainPouter + (prametersRouter.length > 0 ? ('/' + prametersRouter) : '')
                });
              } else {
                this.spinner = false;
                this.responseFooter.emit({ muestraSpinner: false });
                this.responseFooter.emit({
                  estatus: 'OK'
                });
              }
            });
            break;
          default:
            this.spinner = false;
            this.responseFooter.emit({ muestraSpinner: false });
            break;
        }
        break;
      case 'Activacion':
        this.spinner = false;
        this.responseFooter.emit({ muestraSpinner: false });
        this.responseFooter.emit({ panelAMostrar: funcionComponente });
        this.responseFooter.emit({ parametros: jsonDinamico })

        break;
      default:
        this.responseFooter.emit({ muestraSpinner: false });
        this.spinner = false;
        break;
    }

  }

  // FUNCIONES ESPECIFICAS POR FASE/PASO

  // FASE: SOLCITIUD, PASO: EN TALLER
  EnviarAprobacion(params: any, jsdRouter?: any, pRouter?: any, cb?: Function) {
    const paramsAvanzaOrden = {
      idSolicitud: params.find(x => x.key === 'idSolicitud').value,
      idTipoSolicitud: params.find(x => x.key === 'idTipoSolicitud').value,
      idClase: params.find(x => x.key === 'idClase').value,
      rfcEmpresa: params.find(x => x.key === 'rfcEmpresa').value,
      idCliente: params.find(x => x.key === 'idCliente').value,
      numeroContrato: params.find(x => x.key === 'numeroContrato').value,
    };
    this.siscoV3Service.putService('solicitud/PutAvanzaOrden', paramsAvanzaOrden).toPromise().then(async () => {
      let llave = { ...paramsAvanzaOrden, numeroSolicitud: '' }
      await this.creaTarea(llave, AccionNotificacion.APROBACION);
      cb(jsdRouter, pRouter);
    });
  }

  // FASE: PROCESO, PASO: ENPROCESO
  TerminoTrabajo(params: any, jsdRouter?: any, pRouter?: any, cb?: Function) {
    const paramsAvanzaOrden = {
      idSolicitud: params.find(x => x.key === 'idSolicitud').value,
      idTipoSolicitud: params.find(x => x.key === 'idTipoSolicitud').value,
      idClase: params.find(x => x.key === 'idClase').value,
      rfcEmpresa: params.find(x => x.key === 'rfcEmpresa').value,
      idCliente: params.find(x => x.key === 'idCliente').value,
      numeroContrato: params.find(x => x.key === 'numeroContrato').value,
    };

    this.siscoV3Service.postService('solicitud/PostReporte', paramsAvanzaOrden).toPromise().then(async () => {
      await this.siscoV3Service.putService('solicitud/PutAvanzaOrden', paramsAvanzaOrden).toPromise().then(async () => {
        let llave = { ...paramsAvanzaOrden, numeroSolicitud: '' }
        await this.creaTarea(llave, AccionNotificacion.TERMINOTRABAJO);
        cb(jsdRouter, pRouter);
      });
    });
  }

  // FASE: COBRANZA, PASO: COBRANZA
  ProcesarCompra(params: any, jsdRouter?: any, pRouter?: any, cb?: Function) {
    const paramsProcesar = {
      idSolicitud: params.find(x => x.key === 'idSolicitud').value,
      idTipoSolicitud: params.find(x => x.key === 'idTipoSolicitud').value,
      idClase: params.find(x => x.key === 'idClase').value,
      rfcEmpresa: params.find(x => x.key === 'rfcEmpresa').value,
      idCliente: params.find(x => x.key === 'idCliente').value,
      numeroContrato: params.find(x => x.key === 'numeroContrato').value,
    };

    //14 Cobranza

    this.siscoV3Service.postService('solicitud/PostInsFacturaProcesaCompra', paramsProcesar).toPromise().then(async () => {
      await this.siscoV3Service.putService('solicitud/PutAvanzaOrden', paramsProcesar).toPromise().then(async () => {
        let llave = paramsProcesar;
        await this.creaTarea(llave, AccionNotificacion.PROCESARCOMPRA);
        cb(jsdRouter, pRouter);
      });
    });
  }

  //FASE: COBRANZA, PASO: Provision
  ApobarProvision(params: any, jsdRouter?: any, pRouter?: any, cb?: Function) {
    const paramsProcesar = {
      idSolicitud: params.find(x => x.key === 'idSolicitud').value,
      idTipoSolicitud: params.find(x => x.key === 'idTipoSolicitud').value,
      idClase: params.find(x => x.key === 'idClase').value,
      rfcEmpresa: params.find(x => x.key === 'rfcEmpresa').value,
      idCliente: params.find(x => x.key === 'idCliente').value,
      numeroContrato: params.find(x => x.key === 'numeroContrato').value,
    };

    let solicitudes = '<solicitudes>';
    solicitudes += '<solicitud><idSolicitud>' + paramsProcesar.idSolicitud + '</idSolicitud><idTipoSolicitud>' + paramsProcesar.idTipoSolicitud +
      '</idTipoSolicitud><rfcEmpresa>' + paramsProcesar.rfcEmpresa + '</rfcEmpresa><idCliente>' + paramsProcesar.idCliente + '</idCliente><numeroContrato>' +
      paramsProcesar.numeroContrato + '</numeroContrato><idClase>' + paramsProcesar.idClase + '</idClase></solicitud>'
    solicitudes += '</solicitudes>';

    this.siscoV3Service.putService('solicitud/PutUpdFacturaApruebaProvision', { solicitudes: solicitudes })
      .subscribe((res: any) => {
        cb(jsdRouter, pRouter);
      });
  }

  private creaTarea(llave, accion) {
    return new Promise((resolve, reject) => {
      const notificacion = {
        accion: accion,
        modulo: TareaPredefinida.SOLICITUD,
        gerencia: GerenciaNotificacion.COBRANZA,
        llave
      }
      this.siscoV3Service.postService('notificacion/EnviaNotificacion', notificacion).toPromise().then(async () => {
        await resolve(1);
      }).catch(async () => {
        await resolve(0);
      });
    });
  }

  toggleMobileFooter() {
    this.togglemobilefooter = !this.togglemobilefooter;
  }

}
