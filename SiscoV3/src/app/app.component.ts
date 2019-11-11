import { Component, OnInit, OnDestroy } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { ConfigActions } from './ThemeOptions/store/config.actions';
import { ThemeOptions } from './theme-options';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from './store/app.states';
import { SessionInitializer } from './services/session-initializer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  animations: [

    trigger('architectUIAnimation', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            opacity: 0,
            display: 'flex',
            flex: '1',
            transform: 'translateY(-20px)',
            flexDirection: 'column'

          }),
        ]),
        query(':enter', [
          animate('600ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
        ]),

        query(':leave', [
          animate('600ms ease', style({ opacity: 0, transform: 'translateY(-20px)' })),
        ], { optional: true })
      ]),
    ])
  ]
})

export class AppComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  getStatePermisos: Observable<any>;
  getStateContratos: Observable<any>;
  currentMessage = new BehaviorSubject(null);

  // VARIABLES PARA EL MANEJO DEL STATE DE AUTENTICACION
  objAutenticacion: any = null;
  // VARIABLES PARA EL MANEJO DEL STATE DE SEGURIDAD
  objSeguridad: any = null;
  // VARIABLE PARA EL MANEJO DEL NEGOCIO
  objContrato: any = null;

  error: string | null;
  message: any;
  subsParams: Subscription;

  @select('config') public config$: Observable<any>;

  constructor(public globals: ThemeOptions,
              public configActions: ConfigActions,
              private store: Store<AppState>,
              public sessionInitializer: SessionInitializer,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.getState = this.store.select(selectAuthState);
    this.getStatePermisos = this.store.select(selectPermisosState);
    this.getStateContratos = this.store.select(selectContratoState);
    this.validateLogin();
  }

  private getDataRedux() {
    this.getState.subscribe((state) => {
      this.objAutenticacion = state.seguridad;
    });

    this.getStatePermisos.subscribe((state) => {
      this.objSeguridad = state.modulos;
    });

    this.getStateContratos.subscribe((state) => {
      this.objContrato = state.contratos;
    });
  }

  //valida que sea reset de password
  private validateLogin() {
    const arrayData = window.location.href.split('/');
    if (this.sessionInitializer.state) {
      this.getDataRedux();
    } else if(arrayData[3] === 'upd-password') {
      this.router.navigate([`upd-password/${arrayData[4]}`]);
    } else {
      this.router.navigate(['login']);
    }
  }

  toggleSidebarMobile() {
    this.globals.toggleSidebarMobile = !this.globals.toggleSidebarMobile;
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.subsParams.unsubscribe();
  }
}
