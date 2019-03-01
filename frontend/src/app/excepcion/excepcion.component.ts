import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, TooltipComponent } from '@angular/material';
import { ExcepcionService } from './excepcion.service';
import { MatSnackBar } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { ExcepcionTipoGlobal } from './excepcionTipoGlobal';

export interface SendData {
  idTipoExcepcion: number,
  idUsuario: string,
  idOperacion: number,
  idAplicacion: string,
  moduloExcepcion: string,
  mensajeExcepcion: string,
  stack: any
}

@Component({
  selector: 'app-excepcion',
  templateUrl: './excepcion.component.html',
  styleUrls: ['./excepcion.component.css'],
  providers: [ExcepcionService]
})
export class ExcepcionComponent implements OnInit {
  public ver = 1;
  tipoMensaje;
  errorMsg;
  constructor(
    private logger: NGXLogger,
    private snackBar: MatSnackBar,
    private _excepcionService: ExcepcionService,
    public dialogRef: MatDialogRef<ExcepcionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendData
  ) {
    let h = Object.keys(this.data).map(key => this.data[key])
    console.log('========================================', h[6]['stack'])
    this.errorMsg = data.stack;
    this.tipoMensaje = ExcepcionTipoGlobal.arr[data.idTipoExcepcion];
    this.data.mensajeExcepcion = 'Error de' + this.tipoMensaje;
    if (data.idTipoExcepcion != 1) {
      this.data.stack = JSON.stringify(this.data.stack, undefined, 2);
    }
    else {
      let h = Object.keys(this.data).map(key => this.data[key])
      let o = {
        message:h[6]['message'],
        stack:h[6]['stack']
      }
      this.data.stack = JSON.stringify(o, undefined, 2);
    }

    // this.data.stack = JSON.stringify(this.data.stack.message);
    // this.logger.debug(this.data.stack);
    // console.log('error =========================================================0 ',JSON.stringify(this.data.stack));
  }

  ngOnInit() {

  }

  cerrar(): void {
    this.dialogRef.close();
  }

  enviar() {
    try {
      let data = {
        "idTipoExcepcion": this.data.idTipoExcepcion,
        "idUsuario": this.data.idUsuario,
        "idOperacion": this.data.idOperacion,
        "idAplicacion": this.data.idAplicacion,
        "moduloExcepcion": this.data.moduloExcepcion,
        "mensajeExcepcion": this.data.mensajeExcepcion,
        "stacktraceExcepcion": this.data.stack
      }
      this._excepcionService.postService('excepcion/postInsExcepcion', data).subscribe(
        response => {
          this.snackBar.open(response['recordsets'][0][0]['result'], 'Ok', {
            duration: 2000
          });
          this.dialogRef.close();
        },
        error => {
          // console.log(error.message)
          // console.log(error)
          this.logger.error(error)
          // this.data.stack = error.message;
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  cambio() {
    try {
      if (this.ver == 1) {
        this.ver--;
      }
      else {
        this.ver++;
      }
    } catch (err) {
      console.log(err);
    }
  }

}
