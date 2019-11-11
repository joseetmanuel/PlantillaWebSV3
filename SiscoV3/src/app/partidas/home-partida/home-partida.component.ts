import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';

@Component({
  selector: 'app-home-partida',
  templateUrl: './home-partida.component.html'
})
export class HomePartidaComponent implements OnInit {
  claveModulo = 'app-home-partida';
  idClase = '';
  modulo: any = {};
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  constructor(private store: Store<AppState>) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
   }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
      });
    });
  }

}
