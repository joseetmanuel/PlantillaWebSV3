import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import * as moment from 'moment';
import { ErrorStateMatcher, MatDialog, MatSnackBar } from '@angular/material';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';


@Component({
    selector: 'app-ins-contrato-reporte',
    templateUrl: './ins-contrato-reporte.component.html',
    styleUrls: ['./ins-contrato-reporte.component.scss']
})

export class InsContratoReporteComponent implements OnInit {
    public contratoForm: FormGroup;
    spinner: boolean;
    // matcher = new MyErrorStateMatcher();
    constructor(private siscoV3Service: SiscoV3Service, private router: Router, public dialog: MatDialog, private snackBar: MatSnackBar) {
        this.contratoForm = new FormGroup({
            contrato: new FormControl('', [Validators.required]),
            fechaInicio: new FormControl('', [Validators.required]),
            fechaFirma: new FormControl('', [Validators.required]),
            parqueVehicular: new FormControl('', [Validators.required]),
            sustituto: new FormControl('', [Validators.required])
        });
    }

    ngOnInit() {
    }

    AgregarContrato() {
        let datos = this.contratoForm.value;
        let fechaIn = '';
        let fechaTer = '';
        if (this.contratoForm.controls.fechaInicio.value) {
            fechaIn = moment(
                this.contratoForm.controls.fechaInicio.value
            ).format('YYYY-MM-DD');
        } else {
            fechaIn = null;
        }
        if (this.contratoForm.controls.fechaFirma.value) {
            fechaTer = moment(this.contratoForm.controls.fechaFirma.value).format(
                'YYYY-MM-DD'
            );
        } else {
            fechaTer = null;
        }

        datos.fechaInicio = fechaIn;
        datos.fechaFirma = fechaTer;
        datos.idContrato = 432;
        this.spinner = true;
        this.siscoV3Service.postService('reporte/PostContrato', datos).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.Excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.Excepciones(res.excepcion, 3);
                } else {
                    this.snackBar.open('Se a guardado el contrato.', 'Ok', {
                        duration: 2000
                    });
                    this.router.navigateByUrl('/sel-reporte-contrato');
                }
            },
            (error: any) => {
                this.Excepciones(error, 1);
                this.spinner = false;
            }
        );
    }

    Excepciones(stack: any, tipoExcepcion: number) {
        try {
          const dialogRef = this.dialog.open(ExcepcionComponent, {
            width: '60%',
            data: {
              idTipoExcepcion: tipoExcepcion,
              idUsuario: 1,
              idOperacion: 1,
              idAplicacion: 1,
              moduloExcepcion: 'sel-contrato-reporte.component',
              mensajeExcepcion: '',
              stack
            }
          });
    
          dialogRef.afterClosed().subscribe((result: any) => {
          });
    
        } catch (err) {
        }
      }

}
