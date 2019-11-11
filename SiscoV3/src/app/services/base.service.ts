import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { NgxIndexedDB } from 'ngx-indexed-db';
import { SeleccionarContratoActual } from '../store/actions/contrato.actions';
import { defer, IPromise } from 'q';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private idxSISCO: NgxIndexedDB;
  private stateAuth: Observable<any>;
  private stateCont: Observable<any>;
  private stateSecu: Observable<any>;
  private ContratoSubscribe: Subscription;
  private SeguridadSubscribe: Subscription;
  private AutenticacionSubscribe: Subscription;

  constructor(private store: Store<AppState>) {
    this.stateReduxStore();
    this.idxSISCO = new NgxIndexedDB('SISCO', 1);
  }

  private stateReduxStore() {
    this.stateAuth = this.store.select(selectAuthState);
    this.stateCont = this.store.select(selectContratoState);
    this.stateSecu = this.store.select(selectPermisosState);
  }

  /**
   * Solo obtiene los datos del usuario y destruye la suscripción, es para datos que no requieren que este un observable
  */
  public getUserData() {
    let usuario;
    this.AutenticacionSubscribe = this.stateAuth.subscribe(state => {
      usuario = state.seguridad;
    });
    this.AutenticacionSubscribe.unsubscribe();
    return usuario;
  }

  /**
   * Solo obtiene los datos del contrato y destruye la suscripción, es para datos que no requieren que este un observable
  */
  public getContractData() {
    let contrato;
    this.ContratoSubscribe = this.stateCont.subscribe(state => {
      contrato = state
    })
    this.ContratoSubscribe.unsubscribe();
    return contrato;
  }

  /**
   * Solo obtiene los datos de la seguridad y destruye la suscripción, es para datos que no requieren que este un observable
  */
  public getSecurityData() {
    let seguridad;
    this.SeguridadSubscribe = this.stateSecu.subscribe(state => {
      seguridad = state;
    })
    this.SeguridadSubscribe.unsubscribe();
    return seguridad;
  }

  /**
   * Realiza un dispatch del contrato y actualiza en indexdb
   * Esto deberia ser un efecto del seleccionarcontratoactual
   * @param contratoActual contrato para dispatch en redux
   */
  public setContratoActual(contratoActual): IPromise<boolean> {
    var deferred = defer<boolean>();
    this.store.dispatch(new SeleccionarContratoActual({ contratoActual }));
    this.idxSISCO.openDatabase(1).then(() => {
      this.idxSISCO.getByKey('seguridad', 1).then(resultado => {
        if (resultado.contratoActual !== contratoActual) {
          this.idxSISCO.update('seguridad', {
            ...resultado,
            contratoActual
          });
        }
        deferred.resolve(true)
      });
    }).catch(error => {
      deferred.resolve(false);
    });
    return deferred.promise;
  }

}
