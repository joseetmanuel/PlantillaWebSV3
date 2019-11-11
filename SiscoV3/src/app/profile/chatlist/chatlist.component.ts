import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Store } from '@ngrx/store';
import { AppState, selectContratoState } from '../../store/app.states';

@Component({
  selector: 'app-chatlist',
  templateUrl: './chatlist.component.html',
  styleUrls: ['./chatlist.component.sass']
})
export class ChatlistComponent implements OnInit {
  tokenSolicitudList: Observable<any>;
  @Output('solicitudSeleccionada') solicitudSeleccionada = new EventEmitter<{}>();
  contratosSeleccionados: Observable<any>;
  stateNegocio: Observable<any>;
  solicitudBuscada: string = '';

  constructor(private store: Store<AppState>
    , private siscoService: SiscoV3Service) {
    this.stateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getContratoUsuario();
  }

  private getContratoUsuario() {
    this.stateNegocio.subscribe((stateContrato) => {
      if (stateContrato) {
        this.contratosSeleccionados = stateContrato.contratosSeleccionados;
      }
      if (stateContrato.contratosSeleccionados !== this.contratosSeleccionados || !this.tokenSolicitudList) {
        this.getSolicitudesXContratos();
      }
    });
  }

  private getSolicitudesXContratos() {
    const contSel = {
      contratos: this.contratosSeleccionados.map(cs => {
        return {
          contrato: {
            idClase: cs.idClase,
            idCliente: cs.idCliente,
            numeroContrato: cs.numeroContrato,
            rfcEmpresa: cs.rfcEmpresa
          }
        }
      })
    };
    this.siscoService.postService('solicitud/PostSolicitudByContrato', contSel).toPromise().then((solList: any) => {
      this.tokenSolicitudList = solList.recordsets[0]
        ? solList.recordsets[0].map(s => {
          return {
            tokenSolicitud: s.tokenSolicitud,
            idSolicitud: s.idSolicitud,
            urlAvatar: s.urlAvatar,
            numeroContrato: s.numeroContrato,
            idUsuario: s.idUsuario,
            fechaUltimaEscritura: this.getDateFormatted(s.fechaUltimaEscritura),
            nombreUsuario: s.nombreUsuario,
            numeroOrden: s.numeroOrden,
            usuarios: s.usuarios
          }
        })
        : [];
    }, error => {
      console.log(error);
    });
  }

  abrirChatSeleccionado(solicitud: any) {
    this.solicitudSeleccionada.emit(solicitud);
  }

  private getDateFormatted(fecha: string): string {
    return `${fecha.substr(8, 2)}-${fecha.substr(5, 2)}-${fecha.substr(0, 4)} ${fecha.substr(11, 2)}:${fecha.substr(14, 2)}:${fecha.substr(17, 2)}`;
  }
}
