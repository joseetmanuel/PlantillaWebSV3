import { OnInit, Component, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
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
    selector: 'app-encuesta-proveedor',
    templateUrl: './encuesta-proveedor.component.html',
    styleUrls: ['./encuesta-proveedor.component.scss'],
    providers: [SiscoV3Service]
})

export class EncuestaProveedorComponent implements OnInit {
    @Input() encuest: any;
    @Input() idComprobanteRecepcion: any;
    spinner: boolean;
    @Output() data: any = new EventEmitter();

    valores = [5,4,3,2,1];

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
        public globals: ThemeOptions
    ) { }

    ngOnInit() {
        
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

    ver(e, idComprobanteRecepcion, idPregunta, idObjeto, idTipoObjeto, idTipoCalificacion) {
        this.data.emit({ idComprobanteRecepcion: idComprobanteRecepcion, 
                         idObjeto: idObjeto, 
                         idTipoObjeto: idTipoObjeto, 
                         idTipoCalificacion: idTipoCalificacion,
                         idPregunta: idPregunta, 
                         respuesta: e.target.value
                        });
    }
}