import { OnInit, Component, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import {
    IObjeto,
    IFileUpload,
    IViewer,
    IViewertipo,
    IViewersize,
    AccionNotificacion,
    TareaPredefinida,
    GerenciaNotificacion

} from '../../interfaces';
import * as moment from 'moment';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { environment } from 'src/environments/environment';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { HttpClient } from '@angular/common/http';
import { SessionInitializer } from 'src/app/services/session-initializer';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ThemeOptions } from '../../theme-options';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { defer, resolve } from 'q';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseService } from 'src/app/services/base.service';


@Component({
    selector: 'app-sel-solicitud',
    templateUrl: './sel-solicitud.component.html',
    styleUrls: ['./sel-solicitud.component.scss']
})

export class SelSolicitudComponent implements OnInit, OnDestroy {
    @ViewChild('horizontal', { read: ElementRef }) horizontal: ElementRef<any>;
    public newInnerWidth: number;

    @ViewChild('tok') tok: ElementRef;
    @ViewChild('planAcc') planAcc: ElementRef;

    getStateUser: any;
    getStateNegocio: Observable<any>;
    subsNegocio: Subscription;
    idUsuario;
    idClase;
    modulo;
    claveModulo = 'app-sel-solicitud';
    breadcrumb: any[];
    spinner = false;
    IObjeto: IObjeto[];

    IUploadFile: IFileUpload;

    state;
    contratoActual;

    idSolicitud;
    rfcEmpresa;
    idCliente;
    numeroContrato;
    idObjeto;
    idTipoObjeto;
    idLogo;
    costos;

    fases = [];
    pasos = [];
    url;

    tokenBand = false;
    PlanAccionBand = false;

    docOrden;
    numeroDocOrden;
    docEvidencia;
    numeroDocEvidencia;
    total = 3;
    IViewer: IViewer[];
    IViewer2 = [];
    conta = 0;
    fileUploader = [];
    ban = false;
    ban2 = false;
    ban3 = false;
    autenticado: any;
    proveedores;
    partidasCotizaciones = [];
    descripcion1partidasCotizaciones;
    descripcion2partidasCotizaciones;
    solicitudes;
    solicitudActual;
    idTipoSolicitud;
    documentos;
    fechaCotizacion;
    tarjeta;
    prove;
    moduloCosto;
    moduloVenta;
    datePlanAccion = moment();

    sumaTotalSolicitud;
    bandCostoVenta;


    pasoActual;
    dataPaso;
    resizewidth: any;

    tokenForm = new FormGroup({
        idSolicitud: new FormControl('', [Validators.required]),
        token: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
        idUsuario: new FormControl('', [Validators.required])
    });
    planAccionForm = new FormGroup({
        descripcion: new FormControl('', [Validators.required]),
        vFecha: new FormControl(this.datePlanAccion, [Validators.required]),
        prioridad: new FormControl('', [Validators.required]),
    });

    banEvidencia = false;
    tokenBoton: boolean;
    //se agrega provisionalmente un plan de acción para la creación
    accionTareaPlanAccion: number = null;
    prioridades: Array<any> = [];
    fasessolicitud: any;
    pasossolicitud: any;
    pasoActualsolicitud: any;
    reloj: string;
    hours: any;
    minutes: any;
    seconds: any;
    negativos: boolean;
    idFase: string;
    indexfaseactual: number;
    porcentaje: number;
    barrasolicitud: boolean;

    constructor(
        private baseService: BaseService,
        private modalService: NgbModal,
        public dialog: MatDialog,
        private router: Router,
        private snackBar: MatSnackBar,
        private httpClient: HttpClient,
        private siscoV3Service: SiscoV3Service,
        private sessionInitializer: SessionInitializer,
        private store: Store<AppState>,
        public globals: ThemeOptions) {
        this.url = environment.fileServerUrl;
        globals.banderaFooterSol = true;
    }

    ngOnInit() {
        if (this.sessionInitializer.state) {
            this.getStateUser = this.baseService.getUserData();
            const contrato = this.baseService.getContractData();
            this.idUsuario = this.getStateUser.user.id;
            if (this.solicitudActual !== contrato.solicitudActual) {
                if (contrato.solicitudesSeleccionadas) {
                    this.idClase = contrato.claseActual;
                    this.solicitudes = contrato.solicitudesSeleccionadas;
                    this.state = this.getStateUser;
                    this.contratoActual = contrato.contratoActual;
                    this.loadData(this.state, contrato.solicitudActual);
                } else {
                    this.router.navigate(['home']);
                }
            }
        }
    }

    ngOnDestroy() {
        this.globals.banderaFooterSol = false;
    }

    receiveMessageDoc($event) {
        try {
            const evento = $event.event;
            if (evento === 'add') {
                const senddata = {
                    event: $event
                };
                // this.addDoc(senddata);
            }
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    loadData(state, solicitudActual) {
        try {
            if (this.IViewer2.length < 1) {
                this.IViewer2 = [];
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < this.solicitudes.length; i++) {
                    const element = this.solicitudes[i];
                    this.IViewer2.push({
                        idSolicitud: element.idSolicitud, image: [{
                            idDocumento: element.idLogoContrato,
                            tipo: IViewertipo.avatar,
                            descarga: false,
                            size: IViewersize.xs
                        }]
                    });
                }
            }
            this.bandCostoVenta = true;
            this.tokenBand = false;
            this.PlanAccionBand = false;
            this.accionTareaPlanAccion = null;
            this.ban = false;
            this.ban3 = false;
            this.banEvidencia = false;
            this.solicitudActual = solicitudActual;
            this.idSolicitud = this.solicitudActual.idSolicitud;
            this.rfcEmpresa = this.solicitudActual.rfcEmpresa;
            this.idCliente = this.solicitudActual.idCliente;
            this.numeroContrato = this.solicitudActual.numeroContrato;
            this.idObjeto = this.solicitudActual.idObjeto;
            this.idTipoObjeto = this.solicitudActual.idTipoObjeto;
            this.idTipoSolicitud = this.solicitudActual.idTipoSolicitud;
            this.idLogo = this.solicitudActual.idLogoContrato;
            this.modulo = Negocio.GetModulo(this.claveModulo, state.permissions.modules, this.idClase);
            this.moduloCosto = true;
            this.moduloVenta = false;
            this.tokenBoton = false;
            if (this.modulo.camposClase.find(x => x.nombre === 'TokenBoton')) {
                this.tokenBoton = true;
            }

            //this.planAccionForm.controls.descripcion.setValue('');
            //this.planAccionForm.controls.vfecha.setValue(new Date().getDate);
            //this.planAccionForm.controls.vhora.setValue(new Date().getTime);

            // if (this.modulo.breadcrumb) {
            //     // tslint:disable-next-line:max-line-length
            //     this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idSolicitud: this.idSolicitud }, { rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }, { idObjeto: this.idObjeto }]);
            // }
            // tslint:disable-next-line:max-line-length
            this.IObjeto = [{ idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente, numeroContrato: this.numeroContrato, rfcEmpresa: this.rfcEmpresa, idTipoObjeto: this.idTipoObjeto }];
            this.getProveedorCotizacion();
            // if (this.modulo.camposClase.find(x => x.nombre === 'VerCosto')) {
            //     this.moduloCosto = true;
            // }
            if (this.modulo.camposClase.find(x => x.nombre === 'VerVenta')) {
                this.moduloVenta = true;
            }
        } catch (error) {
            this.spinner = false;
            this.excepciones(error, 1);
        }
    }

    getProveedorCotizacion() {
        this.spinner = true;
        // tslint:disable-next-line:max-line-length
        this.siscoV3Service.getService(`solicitud/GetProveedoresCotizacion?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idSolicitud=${this.idSolicitud}&idTipoObjeto=${this.idTipoObjeto}&idClase=${this.idClase}`).subscribe(
            (res: any) => {
                this.spinner = false;
                this.ban3 = true;
                if (res.err) {
                    this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.excepciones(res.excepcion, 3);
                } else {
                    this.prove = res.recordsets[0];
                    this.proveedores = res.recordsets[1];
                    const partidasCotizaciones = res.recordsets[2];
                    this.fechaCotizacion = res.recordsets[3];
                    this.costos = res.recordsets[4];
                    this.sumaTotalSolicitud = res.recordsets[5][0];
                    this.partidasCot(partidasCotizaciones);
                    this.getDocumentos();
                }
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }

    partidasCot(partidas) {
        this.partidasCotizaciones = [];
        let conta = 0;
        this.ban2 = false;
        partidas.forEach((e, i, ar) => {
            e.Foto = [{
                idDocumento: e.Foto,
                tipo: IViewertipo.avatar,
                descarga: false,
                size: IViewersize.xs
            }];
            e.Instructivo = [{
                idDocumento: e.Instructivo,
                tipo: IViewertipo.avatar,
                descarga: false,
                size: IViewersize.xs
            }];
            this.partidasCotizaciones.push(e);
            conta++;
            if (conta === ar.length) {
                // tslint:disable-next-line:prefer-for-of
                for (let index = 0; index < this.partidasCotizaciones.length; index++) {
                    const element = this.partidasCotizaciones[index];
                    const descripcion = element.Descripcion.split('/');
                    this.descripcion1partidasCotizaciones = descripcion[0];
                    this.descripcion2partidasCotizaciones = `/${descripcion[1]}`;
                }
                this.ban2 = true;
                this.getTarget();
            }
        });
    }

    pasoAct(pasoActual) {
        this.pasoActual = pasoActual;
        this.ban3 = true;
    }

    datafasepasosolicitud(event) {
        this.IViewer2 = [
            {
              idDocumento: this.idLogo,
              tipo: IViewertipo.avatar,
              descarga: false,
              size: IViewersize.sm
            }
          ];
        this.dataPaso = event;
        console.log(this.dataPaso[2]);
        this.fasessolicitud = this.dataPaso[0];
        this.pasossolicitud = this.dataPaso[1];
        this.pasoActualsolicitud = this.dataPaso[2][0];
        const tiempoEstimadoAux = moment(this.pasoActualsolicitud.tiempoEstimado).utc().format('HH:mm:ss');
        const fechaIngresoAux = moment(this.pasoActualsolicitud.fechaIngreso).utc().format('YYYY-MM-DD HH:mm:ss');
        this.getDate(this.pasossolicitud);

        this.reloj = moment(fechaIngresoAux).add(tiempoEstimadoAux.split(':')[0], 'hours')
            .add(tiempoEstimadoAux.split(':')[1], 'minutes')
            .add(tiempoEstimadoAux.split(':')[2], 'seconds').format('YYYY-MM-DD HH:mm:ss');

          // reloj = '2019-07-31 12:48:00';
          

          setInterval(() => {
            const countDownDate: any = new Date(this.reloj);
            const now: any = new Date();
            let delta = Math.abs(countDownDate - now) / 1000;
            const days = Math.floor(delta / 86400);
            delta -= days * 86400;
            this.hours = Math.floor(delta / 3600) % 24;
            delta -= this.hours * 3600;
            this.minutes = Math.floor(delta / 60) % 60;
            delta -= this.minutes * 60;
            this.seconds = Math.floor(delta % 60);
            this.negativos = false;
            this.hours = this.hours + (days * 24);
            this.hours = String(this.hours).padStart(2,'0');
            this.minutes = String(this.minutes).padStart(2,'0');
            this.seconds = String(this.seconds).padStart(2,'0');
            if (moment(this.reloj).diff(moment(), 'seconds') < 0) {
              this.negativos = true;
            }
          }, 1000);

          this.idFase = null;
          // tslint:disable-next-line:prefer-for-of
          for (let index = 0; index < this.pasossolicitud.length; index++) {
            if (this.pasossolicitud[index].idPaso === this.pasoActualsolicitud.idPaso) {
              this.pasossolicitud[index].actual = true;
              this.idFase = this.pasossolicitud[index].idFase;
              break;
            } else {
              this.pasossolicitud[index].finalizado = true;
            }
          }

          const faseActual = this.pasossolicitud.filter((p) => {
            return p.idFase === this.idFase;
          });

          let cont = 1;
          this.indexfaseactual = 0;
          // tslint:disable-next-line:prefer-for-of
          for (let index = 0; index < faseActual.length; index++) {
            if (faseActual[index].idPaso !== this.pasoActualsolicitud.idPaso) {
              cont++;
            } else {
              break;
            }
          }
          this.porcentaje = cont * 100 / faseActual.length;
          for (let index = 0; index < this.fasessolicitud.length; index++) {
            if (this.fasessolicitud[index].idFase === this.idFase) {
              this.fasessolicitud[index].porcentaje = this.porcentaje;
              this.indexfaseactual = index;
              break;
            } else {
              this.fasessolicitud[index].porcentaje = 100;
            }
          }
    }

    getDate(pasos) {
        for (let x = 0; x < pasos.length; x++) {
          if (this.pasossolicitud[x].fechaSalida) {
            this.pasossolicitud[x].fechaSalida = moment(this.pasossolicitud[x].fechaSalida, 'YYYY-MM-DD HH:mm:ss');
          }
        }
        this.ban = true;
      }

    getTarget() {
        const newArr = [];
        let cont = 0;
        const that = this;
        let ot = [];
        this.proveedores.forEach((e, i, ar) => {
            ot = [];
            newArr.push(i);
            this.partidasCotizaciones.forEach((ep, ip, arp) => {
                if (ep.fechaEstatus) {
                    ep.fechaEstatus = moment(ep.fechaEstatus, 'YYYY-MM-DD').utc();
                }
                // tslint:disable-next-line:max-line-length
                if (e.rfcProveedor === ep.rfcProveedor && e.idProveedorEntidad === ep.idProveedorEntidad && e.numeroCotizacion === ep.numeroCotizacion) {
                    ot.push({ folio: ep.folio, idEstatusCotizacionPartida: ep.idEstatusCotizacionPartida });
                }
                if (ip + 1 === arp.length) {
                    if (e.muestraCampos === undefined) {
                        if (ot.find(idEstatusCotizacionPartida => idEstatusCotizacionPartida.idEstatusCotizacionPartida === 'APROBADA' || idEstatusCotizacionPartida.idEstatusCotizacionPartida === 'RECHAZADA')) {
                            e.muestraCampos = true;
                        } else {
                            e.muestraCampos = false;
                        }

                        if (ot.find(folio => folio.folio)) {
                            e.muestraFolio = true;
                        } else {
                            e.muestraFolio = false;
                        }
                    }
                }
            });
            cont++;
            if (cont === ar.length) {
                // tslint:disable-next-line: no-shadowed-variable
                that.fechaCotizacion.forEach((e) => {
                    e.fechaEstatus = moment(e.fechaEstatus, 'YYYY-MM-DD').utc();
                });
            }
        });
    }

    cambioSolicitud(solicitud, i) {
        this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: this.solicitudes[i] }));
        this.loadData(this.state, solicitud);
    }

    uploadFile(fileUploader: DxFileUploaderComponent) {
        this.spinner = true;
        this.banEvidencia = false;
        const file = fileUploader.value.length;
        const formData = new FormData();
        formData.append('path', this.IUploadFile.path);
        for (let i = 0; i < file; i++) {
            formData.append('files', fileUploader.value[i]);
        }
        // ************************** Se llena formData **************************
        formData.append(
            'idAplicacionSeguridad',
            this.IUploadFile.idAplicacionSeguridad + ''
        );
        formData.append(
            'idModuloSeguridad',
            this.IUploadFile.idModuloSeguridad + ''
        );
        formData.append('idUsuario', this.IUploadFile.idUsuario + '');

        formData.append('titulo', '');
        formData.append('descripcion', '');
        this.httpClient.post(environment.fileServerUrl + 'documento/UploadFiles', formData).subscribe(
            (data: any) => {
                const idDocumento = data.recordsets[0].idDocumento;
                this.postSolicitudEvidencia(idDocumento);
            }
        );
    }

    postSolicitudEvidencia(idDocumento) {
        this.spinner = true;
        this.banEvidencia = false;
        const data = {
            rfcEmpresa: this.rfcEmpresa,
            idClase: this.idClase,
            idCliente: this.idCliente,
            numeroContrato: this.numeroContrato,
            idSolicitud: this.idSolicitud,
            idFileServer: idDocumento
        };
        this.spinner = true;
        this.siscoV3Service.postService(`solicitud/PostSolicitudEvidencia`, data).subscribe(
            (res: any) => {
                this.ban = true;
                this.spinner = false;
                if (res.err) {
                    this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.excepciones(res.excepcion, 3);
                } else {
                    this.snackBar.open('Documento registrado', 'Ok', {
                        duration: 2000
                    });
                    this.getDocumetoEvidencia();
                }
            }, (error: any) => {
                this.spinner = false;
                this.ban = true;
                this.excepciones(error, 2);
            }
        );
    }

    getDocumentos() {
        const ext = [];
        ext.push('.jpg', '.jpeg', '.png', '.pdf', '.JPG', '.JPEG', '.PNG', '.PDF');

        // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
        this.IUploadFile = {
            path: this.idClase,
            idUsuario: this.idUsuario,
            idAplicacionSeguridad: environment.aplicacionesId,
            idModuloSeguridad: 1,
            multiple: false,
            soloProcesar: false,
            extension: ext
        };
        this.spinner = true;
        // tslint:disable-next-line:max-line-length
        this.siscoV3Service.getService(`solicitud/GetDocumentosSolicitud?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idSolicitud=${this.idSolicitud}&idClase=${this.idClase}&idTipoSolicitud=${this.idTipoSolicitud}`).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.excepciones(res.excepcion, 3);
                } else {
                    this.numeroDocOrden = res.recordsets[0][0].numeroDocumentos;
                    const documentos = res.recordsets[1];
                    const documents = res.recordsets[2];
                    this.loadDocumentos(documents, documentos);
                }
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }


    loadDocumentos(numeroDoc, documentoss) {
        this.documentos = [];
        let conta = 0;
        const that = this;
        let val = [];
        for (let i = 0; i < numeroDoc.length; i++) {
            if (numeroDoc[i].idFileServer != undefined) {
                that.documentos.push({ idDocumento: numeroDoc[i].idFileServer });
            } else {
                val.push(numeroDoc[i]);
            }
        }
        const doc = this.documentos.map(d => d.idDocumento);
        this.IViewer = [
            {
                idDocumento: 16551,
                tipo: IViewertipo.gridimagenes,
                descarga: false,
                size: IViewersize.lg
            }
        ];
        this.httpClient.post(`${this.url}documento/GetDocumentosById`, { documentos: doc }).toPromise().then((res: any) => {
            this.docOrden = [];
            const documentos = res.recordsets;
            let exten;
            let con = 0;
            documentos.forEach((d: any) => {
                exten = d.path.split('.');
                this.docOrden[con] = {
                    extencion: exten.slice(-1)[0],
                    activo: d.activo,
                    descripcion: d.descripcion,
                    fechaCreacion: d.fechaCreacion,
                    idAplicacion: d.idAplicacion,
                    idDocumento: d.idDocumento,
                    idModulo: d.idModulo,
                    idUsuario: d.idUsuario,
                    nombre: d.nombre,
                    nombreOriginal: d.nombreOriginal,
                    path: d.path,
                    size: d.size,
                    tipo: d.tipo,
                    titulo: d.titulo,
                    ultimaActualizacion:
                        d.ultimaActualizacion
                };
                con++;
            });
            if (val.length > 0) {
                for (let i = 0; i < val.length; i++) {
                    con = con + 1;
                    this.docOrden[con] = {
                        extencion: 'png',
                        activo: true,
                        // fechaCreacion: '2019-07-15 12:44:48.017',
                        idAplicacion: 11,
                        idDocumento: 18590,
                        idModulo: 1,
                        // idUsuario: this.idUsuario,
                        nombre: 'f95c813015b30c87f68dedb5ce04c482.png',
                        nombreOriginal: 'doc.png',
                        path: 'http://189.204.141.199:5114/1/Automovil/f95c813015b30c87f68dedb5ce04c482.png',
                        size: 26279,
                        tipo: 'image/png',
                        titulo: 'doc.png.png',
                        ultimaActualizacion: '2019-07-24 12:52:02.050',
                        bloqueo: true,
                        descripcion: val[i].nombre
                    };
                }
                this.docOrden = this.docOrden.filter((x) => {
                    return (x !== (undefined || null || ''));
                });
                this.getDocumetoEvidencia();
            } else {
                this.getDocumetoEvidencia();
            }
        },
            (error: any) => {
                this.excepciones(error, 2);
            }
        );
    }

    getDocumetoEvidencia() {
        this.spinner = true;
        // tslint:disable-next-line:max-line-length
        this.siscoV3Service.getService(`solicitud/GetSolicitudEvidencia?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idClase=${this.idClase}&idSolicitud=${this.idSolicitud}`).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.excepciones(res.excepcion, 3);
                } else {
                    const getDocumentos = [];
                    res.recordsets[0].map(doc =>
                        getDocumentos.push({
                            idDocumento: doc.idFileServer
                        })
                    );
                    this.numeroDocEvidencia = getDocumentos.length;
                    this.loadDocEvidencia(getDocumentos);
                }
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }

    loadDocEvidencia(doc) {
        let dataDoc = doc.map(d => d.idDocumento);
        this.httpClient.post(`${this.url}documento/GetDocumentosById`, { documentos: dataDoc }).toPromise().then((res: any) => {
            this.docEvidencia = [];
            this.documentos = res.recordsets;
            let exten;
            let con = 0;
            this.documentos.forEach((d: any) => {
                exten = d.path.split('.');
                this.docEvidencia[con] = {
                    extencion: exten.slice(-1)[0],
                    activo: d.activo,
                    descripcion: d.descripcion,
                    fechaCreacion: d.fechaCreacion,
                    idAplicacion: d.idAplicacion,
                    idDocumento: d.idDocumento,
                    idModulo: d.idModulo,
                    idUsuario: d.idUsuario,
                    nombre: d.nombre,
                    nombreOriginal: d.nombreOriginal,
                    path: d.path,
                    size: d.size,
                    tipo: d.tipo,
                    titulo: d.titulo,
                    ultimaActualizacion:
                        d.ultimaActualizacion
                };
                con++;
            });
            this.spinner = false;
            this.ban = true;
            this.banEvidencia = true;
        },
            (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }

    open(Gridlightbox) {
        this.modalService.open(Gridlightbox, { size: 'lg' });
    }

    validaCostoVenta(val) {
        if (val === '1') {
            this.bandCostoVenta = true;
        } else {
            this.bandCostoVenta = false;
        }
    }

    generarToken() {
        this.spinner = true;
        const data = {
            idSolicitud: this.idSolicitud,
            idPaso: this.pasoActual
        }
        this.siscoV3Service.postService('solicitud/PostToken', data).subscribe(
            (res: any) => {
                this.spinner = false;
                this.tokenForm.controls.token.setValue(res.recordsets[0][0].token);
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }

    sendToken() {
        const data = {
            idSolicitud: this.tokenForm.controls.idSolicitud.value,
            token: this.tokenForm.controls.token.value,
            idUsuario: this.tokenForm.controls.idUsuario.value
        };
        const accion = AccionNotificacion.ENTREGA;

        this.siscoV3Service.putService(`solicitud/PutToken`, data).toPromise().then(async (res: any) => {
            if (res.err) {
                this.snackBar.open(res.error, 'Ok', {
                    duration: 2000
                });
                this.excepciones(res.err, 4);
            } else if (res.excepcion) {
                this.excepciones(res.excepcion, 3);
            } else {
                const parametros = {
                    idSolicitud: this.idSolicitud,
                    idTipoSolicitud: this.idTipoSolicitud,
                    idClase: this.idClase,
                    rfcEmpresa: this.rfcEmpresa,
                    idCliente: this.idCliente,
                    numeroContrato: this.numeroContrato
                };
                await this.siscoV3Service.putService(`solicitud/PutAvanzaOrden`, parametros).toPromise().then(async (resultado: any) => {
                    if (resultado.err) {
                        this.excepciones(resultado.err, 4);
                    } else if (resultado.excepcion) {
                        this.excepciones(resultado.excepcion, 3);
                    } else {
                        let llave = { ...parametros, numeroSolicitud: this.solicitudActual.numeroOrden };
                        await this.creaTarea(llave, accion);
                        this.tokenForm.reset();
                        this.snackBar.open('Token validado', 'Ok', {
                            duration: 2000
                        });
                    }
                }, async (error: any) => {
                    this.excepciones(error, 2);
                });
                this.loadData(this.state, this.solicitudActual);
            }
        }, async (error: any) => {
            this.excepciones(error, 2);
        });
    }
    enviaPlanAccion() {
        const fecha = new Date(this.planAccionForm.controls.vFecha.value);
        const accion = this.accionTareaPlanAccion;
        const prioridadId = this.planAccionForm.get('prioridad').value;
        const parametros = {
            idSolicitud: this.idSolicitud,
            idTipoSolicitud: this.idTipoSolicitud,
            idClase: this.idClase,
            rfcEmpresa: this.rfcEmpresa,
            idCliente: this.idCliente,
            numeroContrato: this.numeroContrato,
            descripcion: this.planAccionForm.controls.descripcion.value,
            fecha: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59)
        };
        let llave = { ...parametros, numeroSolicitud: this.solicitudActual.numeroOrden };
        const body = {
            titulo: null,
            descripcion: this.planAccionForm.controls.descripcion.value,
            fechaVencimiento: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59),
            periodicidadRecordatorio: 1,
            tags: [prioridadId],
            userIds: [this.idUsuario],
            idDocumentos: [],
            idModulo: TareaPredefinida.SOLICITUD,
            idAccion: accion,
            llave
        };
        this.creaTareaManual(body);
        this.PlanAccionBand = false;
        this.planAccionForm.controls.descripcion.setValue('');
        this.snackBar.open('Se ha guardado correctamente el plan de acción.', 'Ok', {
            duration: 2000
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
        })
    }

    private creaTareaManual(body) {
        return new Promise((resolve, reject) => {
            this.siscoV3Service.postService('tarea/TareaColaEvento', body).toPromise().then(async (res) => {
                await resolve(1);
                this.accionTareaPlanAccion = null;
            }).catch(async (err) => {
                await resolve(0);
                this.accionTareaPlanAccion = null;
            });
        })
    }

    encuesta() {
        this.spinner = true;
        this.siscoV3Service.getService(`proveedor/EncuestasXSolicitud?idClase=${this.idClase}&idTipoSolicitud=${this.idTipoSolicitud}&idSolicitud=${this.idSolicitud}&rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}`).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.recordsets.aplicaEncuesta) {
                    this.router.navigateByUrl(`encuesta/${this.idTipoSolicitud}/${this.idSolicitud}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`);
                } else {
                    this.snackBar.open('No aplica encuesta', 'Ok', {
                        duration: 2000
                    });
                }
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }

    excepciones(error, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: 1,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'sel-centro-costos.component',
                    mensajeExcepcion: '',
                    stack: error
                }
            });

            dialogRef.afterClosed().subscribe((result: any) => {
                this.spinner = false;
            });
        } catch (error) {
            this.spinner = false;
            console.error(error);
        }
    }

    reponse(res) {
        if (res.muestraSpinner) { this.spinner = true; } else { this.spinner = false; }
        if (res.error) {
            this.excepciones(res.error, 4);
        } else {
            if (res.ruta) {
                if (res.ruta === '/sel-solicitud') {
                    this.loadData(this.state, this.solicitudActual);
                    this.ban3 = false;
                    setTimeout(() => this.ban3 = true, 2000);
                } else {
                    this.router.navigate([res.ruta]);
                }
            }
            if (res.panelAMostrar == 'panelPlanAccion') {
                this.PlanAccionBand = true;
                this.cargarCatalogosPA();
                //this.planAccionForm.controls.idSolicitud.setValue(this.idSolicitud);
                //this.planAccionForm.controls.idUsuario.setValue(this.idUsuario);
                setTimeout(() => this.planAcc.nativeElement.focus());
            }

            //accion del plan de acción
            if (res.parametros) {
                this.accionTareaPlanAccion = res.parametros.accion;
            }

            if (res.panelAMostrar == 'panelToken') {
                this.tokenBand = true;
                this.tokenForm.controls.idSolicitud.setValue(this.idSolicitud);
                this.tokenForm.controls.idUsuario.setValue(this.idUsuario);
                setTimeout(() => this.tok.nativeElement.focus());
            }
        }
    }

    private cargarCatalogosPA(): void {
        this.siscoV3Service.getService('tarea/Tag').toPromise().then((res: any) => {
            if (!res.error) {
                this.prioridades = res.recordsets[0];
            } else {
                this.excepciones(res.error, 4)
            }
        }, (error: any) => {
            this.excepciones(error, 2)
        });
    }

    onResize(event) {
        this.resizewidth = event.target.innerWidth;
    }

    public scrollRight(): void {
        this.newInnerWidth = window.innerWidth;
        if (this.newInnerWidth <= 425) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 180), behavior: 'smooth' });
        } else if (this.newInnerWidth === 500) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 210), behavior: 'smooth' });
        } else if (this.newInnerWidth > 425 && this.newInnerWidth <= 768) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 146), behavior: 'smooth' });
        } else if (this.newInnerWidth > 768 && this.newInnerWidth <= 1024) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 155), behavior: 'smooth' });
        } else if (this.newInnerWidth > 1024 && this.newInnerWidth <= 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 148), behavior: 'smooth' });
        } else if (this.newInnerWidth > 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 215), behavior: 'smooth' });
        }

        if (this.resizewidth <= 425) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 180), behavior: 'smooth' });
        } else if (this.resizewidth === 500) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 210), behavior: 'smooth' });
        } else if (this.resizewidth > 425 && this.resizewidth <= 768) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 146), behavior: 'smooth' });
        } else if (this.resizewidth > 768 && this.resizewidth <= 1024) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 155), behavior: 'smooth' });
        } else if (this.resizewidth > 1024 && this.resizewidth <= 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 148), behavior: 'smooth' });
        } else if (this.resizewidth > 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft + 215), behavior: 'smooth' });
        }
    }

    public scrollLeft(): void {
        this.newInnerWidth = window.innerWidth;
        if (this.newInnerWidth <= 425) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 180), behavior: 'smooth' });
        } else if (this.newInnerWidth === 500) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 210), behavior: 'smooth' });
        } else if (this.newInnerWidth > 425 && this.newInnerWidth <= 768) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 146), behavior: 'smooth' });
        } else if (this.newInnerWidth > 768 && this.newInnerWidth <= 1024) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 155), behavior: 'smooth' });
        } else if (this.newInnerWidth > 1024 && this.newInnerWidth <= 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 148), behavior: 'smooth' });
        } else if (this.newInnerWidth > 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 215), behavior: 'smooth' });
        }

        if (this.resizewidth <= 425) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 180), behavior: 'smooth' });
        } else if (this.resizewidth === 500) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 210), behavior: 'smooth' });
        } else if (this.resizewidth > 425 && this.resizewidth <= 768) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 146), behavior: 'smooth' });
        } else if (this.resizewidth > 768 && this.resizewidth <= 1024) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 155), behavior: 'smooth' });
        } else if (this.resizewidth > 1024 && this.resizewidth <= 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 148), behavior: 'smooth' });
        } else if (this.resizewidth > 1366) {
            this.horizontal.nativeElement.scrollTo({ left: (this.horizontal.nativeElement.scrollLeft - 215), behavior: 'smooth' });
        }
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll($event) {
        let scroll = window.scrollY;
        console.log(scroll);
        if (scroll > 99 ) {
            this.barrasolicitud = true;
        } else{
            this.barrasolicitud = false;
        }

    }
}

