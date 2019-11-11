import { Component, OnInit, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { LogIn } from '../../store/actions/auth.actions';
import { AppState, selectAuthState } from '../../store/app.states';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/observable/timer';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

@Injectable({
  providedIn: 'root'
})

export class LoginComponent implements OnInit {
  getState: Observable<any>;
  errorMessage: string | null;
  imagen = 0;

  constructor( private store: Store<AppState> ) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.getState.subscribe((state) => {
      this.errorMessage = state.error;
    });
    Observable.timer(0, 5000)
      .subscribe(() => {
        this.imagen++;
        if (this.imagen === 4) {
          this.imagen = 1;
        }
      });
  }

  async LogIn(data: any) {
    const payload = {
      email: data.email,
      password: data.password
    };
    await this.store.dispatch(new LogIn(payload));
  }
}
