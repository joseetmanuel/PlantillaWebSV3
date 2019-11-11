import { Component, OnInit, HostListener } from '@angular/core';
import { AppState, selectPermisosState, selectContratoState } from '../store/app.states';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ReseteaFooter } from '../store/actions/permisos.actions';
import { MatSnackBar } from '@angular/material';
import { SessionInitializer } from '../services/session-initializer';
import { Router } from '@angular/router';
import { SiscoV3Service } from '../services/siscov3.service';
import { BaseService } from '../services/base.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
  message: any;
  getStatePermisos: Observable<any>;
  getStateNegocio: Observable<any>;
  objSeguridad: Observable<any> = null;
  idClase: string;
  notificacionesXModulo: any[];
  scrHeight: any;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
     this.scrHeight = (window.innerHeight - 120) + 'px';
  }
  
  constructor(private store: Store<AppState>
      , private snackBar: MatSnackBar
      , private sessionInitializer: SessionInitializer
      , private router: Router
      , private siscoService: SiscoV3Service
      , private baseService: BaseService) {
        this.getScreenSize();
       }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      this.getStatePermisos = this.store.select(selectPermisosState);
      this.getStateNegocio = this.store.select(selectContratoState);

      this.store.dispatch(new ReseteaFooter());
      this.objSeguridad = this.baseService.getSecurityData().modulos;
      this.getNotificacionesModulo();
      this.getStateNegocio.subscribe((state) => {
        this.idClase = !state.claseActual ? 'Automovil' : state.claseActual;
      });
    } else {
      this.snackBar.open(`Tu sesión ha sido finalizada, puede que otro usuario haya iniciado sesión con tus datos`, `Ok`, {
        duration: 2000
      });
      this.router.navigate(['login']);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
     this.scrHeight = (window.innerHeight - 120) + 'px';
  }

  private getNotificacionesModulo() {
    const idModulos = this.objSeguridad.map(os => {
      return { idModulo: os.id }
    });
    this.siscoService.postService('notificacion/ModulosTareasNotificaciones', { idModulos }).subscribe((r: any) => {
      this.objSeguridad.forEach(obs => {
        let not = r.find(t => t.idModulo === obs.id);
        obs.notificaciones = not ? not.notificaciones : {};
      });
    }, reason => {
      console.log(reason);
    })
  }
}
