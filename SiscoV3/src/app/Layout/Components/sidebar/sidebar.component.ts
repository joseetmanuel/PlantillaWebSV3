import { Component, HostListener, OnInit } from '@angular/core';
import { ThemeOptions } from '../../../theme-options';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { SessionInitializer } from '../../../services/session-initializer';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public extraParameter: any;

  // VARIABLES PARA REDUX
  getState: Observable<any>;
  getStatePermisos: Observable<any>;
  getStateNegocio: Observable<any>;
  // VARIABLES PARA EL MANEJO DEL STATE DE AUTENTICACION
  objAutenticacion: any = null;
  // VARIABLES PARA EL MANEJO DEL STATE DE SEGURIDAD
  objSeguridad: any = [];
  objNegocio: any = [];
  idClase: string;

  constructor(public globals: ThemeOptions, private store: Store<AppState>, private sessionInitializer: SessionInitializer) {
    this.getState = this.store.select(selectAuthState);
    this.getStatePermisos = this.store.select(selectPermisosState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  @select('config') public config$: Observable<any>;

  private newInnerWidth: number;
  private innerWidth: number;
  activeId = 'dashboardsMenu';

  toggleSidebar() {
    this.globals.toggleSidebar = !this.globals.toggleSidebar;
    if (this.globals.toggleSidebar === false) {
      const element = document.querySelectorAll('[name="burger"]');
      [].forEach.call(element, function (el) {
        el.classList.remove('logo-src');
      });
    } else if (this.globals.toggleSidebar === true) {
      const element = document.querySelectorAll('[name="burger"]');
      [].forEach.call(element, function (el) {
        el.classList.add('logo-src');
      });
    }

  }

  sidebarHover() {
    this.globals.sidebarHover = !this.globals.sidebarHover;
  }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      this.getStateNegocio.subscribe((state) => {
        this.idClase = state.claseActual;
        this.getStatePermisos.subscribe((statePermisos) => {
          this.objSeguridad = statePermisos.modulos;
        });
        if (this.objSeguridad) {
          this.objSeguridad.forEach(element => {
            try {
              if (element.caption) {
                element.caption = JSON.parse(element.caption);
              }
            }
            catch{ }
          });
        }
      });
      setTimeout(() => {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth < 1200) {
          this.globals.toggleSidebar = true;
        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.newInnerWidth = event.target.innerWidth;

    if (this.newInnerWidth < 1200) {
      this.globals.toggleSidebar = true;
    }
  }

  GetJson(data: any) {
    if (data) {
      return JSON.parse(data);
    } else {
      return {};
    }

  }
  GetLabelByClase(data: any) {
    if (data) {
      if (JSON.parse(data).clase) {
        if (JSON.parse(data).clase.filter(x => x.idClase === this.idClase).length > 0) {
          return JSON.parse(data).clase.filter(x => x.idClase === this.idClase)[0].label;
        } else {
          return '';
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
}
