import { OnInit, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IViewertipo,
  IViewersize

} from '../../interfaces';
import * as moment from 'moment';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
@Component({
  selector: 'app-fase-paso-solicitud',
  templateUrl: './fase-paso-solicitud.component.html',
  styleUrls: ['./fase-paso-solicitud.component.scss']
})
export class FasePasoSolicitudComponent implements OnInit {
  @Input() rfcEmpresa;
  @Input() idCliente;
  @Input() numeroContrato;
  @Input() idSolicitud;
  @Input() idClase;
  @Input() idTipoSolicitud;
  @Input() idLogo;
  @Output() pasoActualSend = new EventEmitter<any>();
  @Output() dataPaso = new EventEmitter<any>();

  fases;
  pasos;
  spinner = false;
  pasoActual;
  idFase: string;
  indexfaseactual: number;
  porcentaje: number;
  IViewer2 = [];
  ban = false;
  pasomobil;
  pasoclick;
  days: any;
  hours: any;
  minutes: any;
  seconds: any;
  negativos: boolean;
  reloj: string;

  constructor(
    public dialog: MatDialog,
    private siscoV3Service: SiscoV3Service
  ) { }

  ngOnInit() {
    this.getSolicitudes();
  }

  getSolicitudes() {
    this.IViewer2 = [
      {
        idDocumento: this.idLogo,
        tipo: IViewertipo.avatar,
        descarga: false,
        size: IViewersize.sm
      }
    ];
    this.spinner = true;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`solicitud/GetFasesSolicitud?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idSolicitud=${this.idSolicitud}&idClase=${this.idClase}&idTipoSolicitud=${this.idTipoSolicitud}`).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.dataPaso.emit(res.recordsets);
          this.fases = res.recordsets[0];
          this.pasos = res.recordsets[1];
          this.pasoActual = res.recordsets[2][0];
          this.pasoActualSend.emit(this.pasoActual.idPaso);
          this.pasoActual = res.recordsets[2][0];
          this.pasoActual.centroCosto = (res.recordsets[2][0].centroCosto).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
          const tiempoEstimadoAux = moment(this.pasoActual.tiempoEstimado).utc().format('HH:mm:ss');
          const fechaIngresoAux = moment(this.pasoActual.fechaIngreso).utc().format('YYYY-MM-DD HH:mm:ss');
          this.getDate(this.pasos);

          this.reloj = moment(fechaIngresoAux).add(tiempoEstimadoAux.split(':')[0], 'hours')
            .add(tiempoEstimadoAux.split(':')[1], 'minutes')
            .add(tiempoEstimadoAux.split(':')[2], 'seconds').format('YYYY-MM-DD HH:mm:ss');

          // reloj = '2019-07-31 12:48:00';
          

          setInterval(() => {
            const countDownDate: any = new Date(this.reloj);
            const now: any = new Date();
            let delta = Math.abs(countDownDate - now) / 1000;
            const days = Math.floor(delta / 86400);
            delta -= days * 86400;
            this.hours = Math.floor(delta / 3600) % 24;
            delta -= this.hours * 3600;
            this.minutes = Math.floor(delta / 60) % 60;
            delta -= this.minutes * 60;
            this.seconds = Math.floor(delta % 60);
            this.negativos = false;
            this.hours = this.hours + (days * 24);
            this.hours = String(this.hours).padStart(2,'0');
            this.minutes = String(this.minutes).padStart(2,'0');
            this.seconds = String(this.seconds).padStart(2,'0');
            if (moment(this.reloj).diff(moment(), 'seconds') < 0) {
              this.negativos = true;
            }
          }, 1000);

          this.idFase = null;
          // tslint:disable-next-line:prefer-for-of
          for (let index = 0; index < this.pasos.length; index++) {
            if (this.pasos[index].idPaso === this.pasoActual.idPaso) {
              this.pasos[index].actual = true;
              this.idFase = this.pasos[index].idFase;
              break;
            } else {
              this.pasos[index].finalizado = true;
            }
          }

          const faseActual = this.pasos.filter((p) => {
            return p.idFase === this.idFase;
          });

          let cont = 1;
          this.indexfaseactual = 0;
          // tslint:disable-next-line:prefer-for-of
          for (let index = 0; index < faseActual.length; index++) {
            if (faseActual[index].idPaso !== this.pasoActual.idPaso) {
              cont++;
            } else {
              break;
            }
          }
          this.porcentaje = cont * 100 / faseActual.length;
          for (let index = 0; index < this.fases.length; index++) {
            if (this.fases[index].idFase === this.idFase) {
              this.fases[index].porcentaje = this.porcentaje;
              this.indexfaseactual = index;
              break;
            } else {
              this.fases[index].porcentaje = 100;
            }
          }
        }
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    );
  }

  getDate(pasos) {
    for (let x = 0; x < pasos.length; x++) {
      if (this.pasos[x].fechaSalida) {
        this.pasos[x].fechaSalida = moment(this.pasos[x].fechaSalida, 'YYYY-MM-DD HH:mm:ss');
      }
    }
    this.ban = true;
  }

  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'sel-centro-costos.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        this.spinner = false;
      });
    } catch (error) {
      this.spinner = false;
      console.error(error);
    }
  }

  getpaso(paso) {
    this.pasomobil = paso;
    this.pasoclick = true;
  }

}
