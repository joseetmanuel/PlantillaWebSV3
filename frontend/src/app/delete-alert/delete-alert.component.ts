import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  TooltipComponent
} from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { SiscoV3Service } from '../services/siscov3.service';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

export interface SendData {
  data: any;
  tipo: string;
}

@Component({
  selector: 'app-delete-alert',
  templateUrl: './delete-alert.component.html',
  styleUrls: ['./delete-alert.component.sass'],
  providers: [SiscoV3Service]
})
export class DeleteAlertComponent implements OnInit {
  public numero = 1;
  constructor(
    public dialog: MatDialog,
    private logger: NGXLogger,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service,
    public dialogRef: MatDialogRef<DeleteAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendData
  ) {}

  ngOnInit() {}

  eliminar() {
    try {
      if (this.data.tipo === '1') {
        this._siscoV3Service
          .deleteService('cliente/deleteCliente', this.data.data)
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3);
              } else {
                this.numero = 1;
                this.dialogRef.close(1);
              }
            },
            (error: any) => {
              this.excepciones(error, 2);
            }
          );
      } else if (this.data.tipo === '2') {
        this.numero = 0;
        this._siscoV3Service
          .deleteService('cliente/deleteClienteEntidad', this.data.data)
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3);
              } else {
                this.numero = 1;
                this.dialogRef.close(1);
              }
            },
            (error: any) => {
              this.numero = 1;
              this.excepciones(error, 2);
            }
          );
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  cancelar(): void {
    try {
      this.dialogRef.close();
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

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {
      console.log(error);
    }
  }
}
