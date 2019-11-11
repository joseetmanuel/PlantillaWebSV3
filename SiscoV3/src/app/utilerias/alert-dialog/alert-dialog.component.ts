import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  TooltipComponent
} from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

/**
 * Obtenemos el Mensaje a mostrar
 */
export interface SendData {
  message: string;
}

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.sass']
})
export class AlertDialogComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AlertDialogComponent>,
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
