import { OnInit, Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
    selector: 'app-contesta-encuesta',
    templateUrl: './contesta-encuesta.component.html',
    styleUrls: ['./contesta-encuesta.component.scss'],
    providers: [SiscoV3Service]
})

export class ContestaEncuestaComponent implements OnInit {
    idClase: string;
    idTipoSolicitud: string;
    idSolicitud: number;
    rfcEmpresa: string;
    idCliente: number;
    numeroContrato: string;
    spinner: boolean;
    encuestas = [];
    modulo: any;
    claveModulo: string = 'app-contesta-encuesta';
    breadcrumb: any[];

    constructor(
        private snackBar: MatSnackBar,
        private baseService: BaseService,
        private sessionInitializer: SessionInitializer,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public siscoV3Service: SiscoV3Service,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.sessionInitializer.state) {
            const usuario = this.baseService.getUserData();
            const contrato = this.baseService.getContractData();
            if (contrato.solicitudActual) {
                this.idClase = contrato.claseActual;
                this.activatedRoute.params.subscribe(parametros => {
                    this.idTipoSolicitud = parametros.idTipoSolicitud;
                    this.idSolicitud = parametros.idSolicitud;
                    this.rfcEmpresa = parametros.rfcEmpresa;
                    this.idCliente = parametros.idCliente;
                    this.numeroContrato = parametros.numeroContrato;
                });
                this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
                if (this.modulo.breadcrumb) {
                    // tslint:disable-next-line:max-line-length
                    this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idTipoSolicitud: this.idTipoSolicitud }, { idSolicitud: this.idSolicitud }, { rfcEmpresa: this.rfcEmpresa }, { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }]);
                }

                this.loadData();
            } else {
                this.router.navigate(['home']);
            }
        }
    }

    loadData() {
        this.spinner = true;
        this.siscoV3Service.getService(`proveedor/EncuestasXSolicitud?idClase=${this.idClase}&idTipoSolicitud=${this.idTipoSolicitud}&idSolicitud=${this.idSolicitud}&rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}`).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.error) {
                    this.snackBar.open(res.error, 'Ok', {
                        duration: 2000
                    });
                } else {
                    this.encuestas = res.recordsets
                }
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2);
            }
        );
    }

    getDatos(e) {
        const encuesta = this.encuestas["solicitud"].findIndex(data => data.idComprobanteRecepcion === e.idComprobanteRecepcion);

        const unidad = this.encuestas["solicitud"][encuesta].unidad.findIndex(unidad => unidad.idObjeto === e.idObjeto && unidad.idTipoObjeto === e.idTipoObjeto);

        const calificacion = this.encuestas["solicitud"][encuesta].unidad[unidad].encuesta.findIndex(calificacion => calificacion.idTipoCalificacion === e.idTipoCalificacion);

        const pregunta = this.encuestas["solicitud"][encuesta].unidad[unidad].encuesta[calificacion].preguntas.findIndex(pregunta => pregunta.idPregunta === e.idPregunta);

        this.encuestas["solicitud"][encuesta].unidad[unidad].encuesta[calificacion].preguntas[pregunta].respuesta = e.respuesta

    }

    guardarEncuesta() {
        this.siscoV3Service.postService('proveedor/GuardarEncuesta', this.encuestas).subscribe(
            (res: any) => {
                if (res.error) {
                    this.excepciones(res.error, 4)
                } else if (res.excepcion) {
                    this.excepciones(res.excepcion, 3)
                } else {
                    this.router.navigate(['/sel-solicitud']);
                    this.snackBar.open('Encuesta contestada, gracias', 'Ok', {
                        duration: 2000
                      });
                }
            }, (error: any) => {
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
}