import { Component, OnInit, Inject, Input } from '@angular/core';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
    TooltipComponent
} from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { ExcepcionComponent } from '../excepcion/excepcion.component';
import { SiscoV3Service } from 'src/app/services/siscov3.service';

/**
 * Obtenemos el Mensaje a mostrar
 */
export interface SendData {
    message: string;
    params: JSON;
    ruta: any;
}

@Component({
    selector: 'app-alert-confirm',
    templateUrl: './alert-confirm.component.html',
    styleUrls: ['./alert-confirm.component.scss']
})
export class AlertConfirmComponent implements OnInit {
    numero: number;

    constructor(
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private siscoV3Service: SiscoV3Service,
        public dialogRef: MatDialogRef<AlertConfirmComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SendData
    ) {
    }

    ngOnInit() {
    }

    cancelar(): void {
        try {
            this.dialogRef.close();
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    activar(): void {
        try {
            this.numero = 0;
            
            this.siscoV3Service
                .putService(this.data.ruta, this.data.params)
                .subscribe(
                    (res: any) => {
                        if (res.err) {
                            this.numero = 1;
                            this.excepciones(res.err, 4);
                        } else if (res.excepcion) {
                            this.numero = 1;
                            this.excepciones(res.excepcion, 3);
                        } else {
                            if (res.error.length > 0) {
                                this.numero = 1;
                                this.dialogRef.close(1);
                                this.snackBar.open(res.error, "Ok", {
                                    duration: 2000
                                });
                            } else {

                                this.numero = 1;
                                this.dialogRef.close(1);
                            }
                        }
                    },
                    (error: any) => {
                        this.numero = 1;
                        this.excepciones(error, 2);
                    }
                );
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    excepciones(stack, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: 1,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'delete-alert.component',
                    mensajeExcepcion: '',
                    stack: stack
                }
            });

            dialogRef.afterClosed().subscribe((result: any) => {
            });
        } catch (error) {
            console.error(error);
        }
    }

}
