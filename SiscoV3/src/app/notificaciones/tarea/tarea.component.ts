import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { EstatusTarea } from '../../interfaces';
import { Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog } from '@angular/material';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.component.html',
  styleUrls: ['./tarea.component.sass']
})
export class TareaComponent implements OnInit {
  public categorias: any;
  public acciones: any;
  public tareaConcluida = EstatusTarea.TERMINADA;
  public tareaRechazada = EstatusTarea.RECHAZADA;
  @Output('tareaActualizada') tareaActualizada: EventEmitter<any> = new EventEmitter<any>();
  @Input() tarea: any;
  @Input() tipoTarea: any;
  constructor(private siscoV3Service: SiscoV3Service, private router: Router, private dialog: MatDialog) { }

  ngOnInit() {
    this.tarea.rutaProcesada  = this.tarea.rutaProcesada && this.tarea.rutaProcesada !== '' ? this.tarea.rutaProcesada : null;
    this.getTags(this.tarea.idTarea);
    this.getDocumentos(this.tarea.idTarea);
  }

  public navegaTarea(ruta: string) {
    this.router.navigate([`/${ruta}`]);
  }

  public visualizaAdjunto(tarea: any) {
    this.router.navigate([`/visor-tarea/${tarea.idTarea}`]);
  }

  private getTags(idTarea: number) {
    this.siscoV3Service.getService('tarea/TagsTarea?idTarea=' + idTarea).toPromise().then((res: any) => {
      if (res.err) {
        this.excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.excepciones(res.excepcion, 3);
      } else {
        this.tarea.tags = res.recordsets[0];
      }
    }, (error: any) => {
      this.excepciones(error, 2);
    });
  }

  private getDocumentos(idTarea: number) {
    this.siscoV3Service.getService('tarea/DocumentosTarea?idTarea=' + idTarea).toPromise().then((res: any) => {
      if (res.err) {
        this.excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.excepciones(res.excepcion, 3);
      } else {
        this.tarea.documentos = res.recordsets[0]
      }
    }, (error: any) => {
      this.excepciones(error, 2);
    });
  }

  marcarFinalizado(tarea) {
    if (tarea.idEstatusTarea === this.tareaConcluida || tarea.idEstatusTarea === this.tareaRechazada) {
    } else {
      const body = {
        idTarea: tarea.idTarea
      };
      this.siscoV3Service.postService('tarea/ConcluirTarea', body).toPromise().then((res: any) => {
        if (res.err) {
          this.excepciones(res.excepcion, 2);
          this.tareaActualizada.emit(false);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
          this.tareaActualizada.emit(false);
        } else {
          tarea.idEstatusTarea = this.tareaConcluida;
          this.tareaActualizada.emit(true);
        }
      }, (error: any) => {
        this.tareaActualizada.emit(false);
        this.excepciones(error, 4);
      });
    }
  }

  rechazarTarea(tarea) {
    if (tarea.idEstatusTarea === this.tareaConcluida || tarea.idEstatusTarea === this.tareaRechazada) {
    } else {
      try {
        const dialogRef = this.dialog.open(DeleteAlertComponent, {
          width: '500px',
          data: {
            ruta: 'tarea/RechazarTarea',
            data: `idTarea=${tarea.idTarea}`
          }
        });
        dialogRef.afterClosed().subscribe((result: any) => {
          if (result === 1) {
            this.tareaActualizada.emit(true);
          } else {
            this.tareaActualizada.emit(false);
          }
        });
      } catch (error) {
        this.excepciones(error, 4);
        this.tareaActualizada.emit(false);
      }
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
          moduloExcepcion: 'ins-tarea.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) { }
  }
}
