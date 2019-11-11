import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  TooltipComponent
} from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

/*
Obtenemos la tada que nos manda el componente padre al Dialog
*/
export interface SendData {
  ruta: any;
  data: any;
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
    private siscoV3Service: SiscoV3Service,
    public dialogRef: MatDialogRef<DeleteAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendData
  ) {
  }

  ngOnInit() { }

  /*
  Validamos que la data sea correcta con su ruta para eliminarla
  */
  eliminar() {
    try {
      this.numero = 0;
      this.siscoV3Service
        .deleteService(this.data.ruta, this.data.data)
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
                this.snackBar.open("Eliminado exitosamente.", "Ok", {
                  duration: 2000
                });
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

  /*
  Si cancelan se cierra el Dialog
  */
  cancelar(): void {
    try {
      this.dialogRef.close();
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
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
        this.numero = 1;
      });
    } catch (error) {
      this.numero = 1;
      console.error(error);
    }
  }
}
