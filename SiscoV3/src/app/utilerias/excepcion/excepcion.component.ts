import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, TooltipComponent } from '@angular/material';
import { ExcepcionService } from './excepcion.service';
import { MatSnackBar } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { ExcepcionTipoGlobal } from './excepcionTipoGlobal';

// #region
  /*
  Recivimos la data que se va a insertar en la base de datos
  */
  // #endregion
export interface SendData {
  idTipoExcepcion: number;
  idUsuario: string;
  idOperacion: number;
  idAplicacion: string;
  moduloExcepcion: string;
  mensajeExcepcion: string;
  stack: any;
}

@Component({
  selector: 'app-excepcion',
  templateUrl: './excepcion.component.html',
  styleUrls: ['./excepcion.component.scss'],
  providers: [ExcepcionService]
})
export class ExcepcionComponent implements OnInit {
  public ver = 1;
  tipoMensaje;
  errorMsg;


    /*
    Obtenemos la Data y validamos los tipos de Errores para enviarlos a la base de datos
    */
  constructor(
    private logger: NGXLogger,
    private snackBar: MatSnackBar,
    private _excepcionService: ExcepcionService,
    public dialogRef: MatDialogRef<ExcepcionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendData
  ) {
    this.errorMsg = data.stack;
    this.tipoMensaje = ExcepcionTipoGlobal.arr[data.idTipoExcepcion];
    this.data.mensajeExcepcion = 'Error de' + this.tipoMensaje;
    if (data.idTipoExcepcion !== 1) {
      this.data.stack = JSON.stringify(this.data.stack, undefined, 2);
    } else {
      // tslint:disable-next-line:no-shadowed-variable
      const h = Object.keys(this.data).map(key => this.data[key]);
      const o = {
        message: h[6]['message'],
        stack: h[6]['stack']
      };
      this.data.stack = JSON.stringify(o, undefined, 2);
    }
  }

  ngOnInit() {

  }


  /*
  Cerramos el Dialog
  */
  cerrar(): void {
    this.dialogRef.close();
  }

  /*
  Formamos la Data y enviamos a la base de datos
  */
  enviar() {
    try {
      const data = {
        'idTipoExcepcion': this.data.idTipoExcepcion,
        'idUsuario': this.data.idUsuario,
        'idOperacion': this.data.idOperacion,
        'idAplicacion': this.data.idAplicacion,
        'moduloExcepcion': this.data.moduloExcepcion,
        'mensajeExcepcion': this.data.mensajeExcepcion,
        'stacktraceExcepcion': this.data.stack
      };
      this._excepcionService.postService('excepcion/postInsExcepcion', data).subscribe(
        (res: any) => {
          this.snackBar.open('Ticket levantado', 'Ok', {
            duration: 2000
          });
          this.dialogRef.close();
        },
        (error: any) => {
          this.logger.error(error);
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  /*
  Abre y oculta el collapse donde esta el error
  */
  cambio() {
    try {
      if (this.ver === 1) {
        this.ver--;
      } else {
        this.ver++;
      }
    } catch (err) {
      console.error(err);
    }
  }

}
