import { Component, OnInit } from '@angular/core';
import { AppState, selectAuthState } from '../store/app.states';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ReseteaFooter } from '../store/actions/permisos.actions';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.sass', '../app.component.sass']
})
export class VentasComponent implements OnInit {
  getState: Observable<any>;
  errorMessage: string | null;
  isAuthenticated = null;
  permisos: any = []
  constructor(private store: Store<AppState>) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.store.dispatch(new ReseteaFooter());
    this.getState.subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      this.errorMessage = state.errorMessage;
    });
  }
}