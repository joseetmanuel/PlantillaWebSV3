import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'header-tipoobjeto-automovil',
    templateUrl: './header-tipoobjeto-automovil.component.html',
    styleUrls: ['./header-tipoobjeto-automovil.component.scss'],
    providers: [SiscoV3Service]
})
export class HeaderTipoObjetoAutomovilComponent implements OnInit {

    @Input() public idTipoObjeto: number;
    @Input() public idClase: string;
    @Output() public found = new EventEmitter<any>();

    spinner = false;
    headAutomovil: any;
    headClase: any;
    headCilindros: any;
    headCombustible: any;
    headFoto: any;
    IViewer: IViewer[];
    tipoObjetos: any;
    constructor(private siscoV3Service: SiscoV3Service,
        public dialog: MatDialog) { }

    ngOnInit() {
        if (this.idTipoObjeto && this.idClase) {
            if (this.idClase === 'Automovil') {
                this.siscoV3Service.getService('partida/GetDetalleObjeto/' + this.idTipoObjeto + '/Submarca/Automovil')
                    .subscribe((res: any) => {
                        if (res.err) {
                            this.spinner = false;
                            this.Excepciones(res.err, 4);
                        } else if (res.excecion) {
                            this.Excepciones(res.err, 3);
                        } else {
                            this.spinner = false;
                            this.headAutomovil = res.recordsets[0][0].NombreCompleto;
                            this.headClase = res.recordsets[0][0].Clase;
                            this.headCilindros = res.recordsets[0][0].Cilindros;
                            this.headCombustible = res.recordsets[0][0].Combustible;
                            this.headFoto = res.recordsets[0][0].Foto;
                            this.CrearView(this.headFoto);
                        }
                    });
            } else {
                this.siscoV3Service.getService('objeto/GetBannerGenerico?idTipoObjeto=' + this.idTipoObjeto + '&&idClase=' + this.idClase)
                    .subscribe((res: any) => {
                        if (res.err) {
                            this.spinner = false;
                            this.Excepciones(res.err, 4);
                        } else if (res.excecion) {
                            this.Excepciones(res.err, 3);
                        } else {
                            if (res.recordsets.length > 0) {
                                const tipoObjetos = res.recordsets[0];

                                this.tipoObjetos = [];

                                tipoObjetos.forEach(element => {
                                    if (element.campo === 'Foto') {
                                        this.CrearView(element.valor);
                                    }
                                    if (element.campo !== 'Foto') {
                                        this.tipoObjetos.push({ campo: element.campo, valor: element.valor })
                                    }
                                });
                            }
                            this.spinner = false;

                        }
                    });
            }
        }
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

    Excepciones(stack, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: 1,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'clientes.component',
                    mensajeExcepcion: '',
                    stack
                }
            });

            dialogRef.afterClosed().subscribe((result: any) => { });
        } catch (error) {
        }
    }
}