import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectContratoState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../models/negocio.model';
import { BaseService } from '../services/base.service';


@Component({
  selector: 'app-objeto',
  templateUrl: './objeto.component.html',
  styles: []
})

export class ObjetoComponent implements OnInit, OnDestroy {
  claveModulo = 'app-objeto';
  idClase = '';
  modulo: any = {};
  label: string;
  getStateNegocio: Observable<any>;
  negocioSubscribe: Subscription;

  constructor(private store: Store<AppState>,
              private baseService: BaseService) {
    this.getStateNegocio = this.store.select(selectContratoState);
   }

  ngOnInit() {
    const usuario = this.baseService.getUserData();
    this.negocioSubscribe = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);

        for (const iterator of this.modulo.camposClase) {
          this.label = iterator.label;
        }

    });
  }

  ngOnDestroy() {
    this.negocioSubscribe.unsubscribe();
  }
}
