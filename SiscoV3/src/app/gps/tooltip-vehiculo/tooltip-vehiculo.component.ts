import {
    Component
    , OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';

import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-tooltip-vehiculo',
    templateUrl: './tooltip-vehiculo.component.html',
    styleUrls: ['./tooltip-vehiculo.component.scss'],
    providers: [SiscoV3Service]
})
export class TooltipVehiculoComponent implements OnInit {
    // tslint:disable-next-line: no-input-rename
    @Input('vehiculo') vehiculo: any;
    @Output() detalle = new EventEmitter<any>();
    @Output() mostrarRecorrido = new EventEmitter<any>();
    spinner: boolean;

    constructor(
        private siscoV3Service: SiscoV3Service,
        private httpClient: HttpClient,
        public dialog: MatDialog) {

    }

    ngOnInit(): void {
        this.spinner = true;
        this.siscoV3Service.getService(`operador/getOperadoresPorObj?idClase=${this.vehiculo.idClase}
            &&idObjeto=${this.vehiculo.idObjeto}&&idTipoObjeto=${this.vehiculo.idTipoObjeto}`).subscribe((res: any) => {
            this.spinner = false;
            if (res.err) {
                // this.excepciones(res.err, 4);
            } else if (res.excepcion) {
                // this.excepciones(res.err, 3);
            } else {
                if (res.recordsets[0].length > 0) {
                    const operadores: any[] = res.recordsets[0].length > 0 ? res.recordsets[0] : [];
                    this.vehiculo.operadores = operadores;

                    if (this.vehiculo.operadores.length > 0) {
                        this.vehiculo.operadores.forEach((element, indexO) => {
                            if (element.Avatar) {
                                this.httpClient.get(`${environment.fileServerUrl}documento/GetDocumentoById?idDocumento=${element.Avatar}`)
                                    .subscribe((resD: any) => this.vehiculo.operadores[indexO].avatar = resD.recordsets[0].path);
                            }
                        });
                    }
                }
            }
        }, error => {
            this.spinner = false;
        });

        this.spinner = true;
        if (this.vehiculo.fotoPrincipal || this.vehiculo.Foto) {
            const f = this.vehiculo.fotoPrincipal ? this.vehiculo.fotoPrincipal : this.vehiculo.Foto;
            this.httpClient.get(`${environment.fileServerUrl}documento/GetDocumentoById?idDocumento=
            ${f}`)
                .subscribe((resD: any) => {
                    this.vehiculo.foto = resD.recordsets[0].path;
                    this.spinner = false;
                }, (err) => this.spinner = false);
        }
    }

    irDetalle() {
        this.detalle.emit(this.vehiculo);
    }

    abrirRecorrido() {
        this.mostrarRecorrido.emit(this.vehiculo);
    }
}
