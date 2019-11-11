import { Injectable } from '@angular/core';
import { AppState, selectAuthState } from '../store/app.states';
import { UpdateData } from '../store/actions/auth.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NgxIndexedDB } from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})

export class TokenService {
  getStateUser: Observable<any>;
  public token = '';
  private indexedDB: NgxIndexedDB;
  constructor(private store: Store<AppState>) {
    this.getStateUser = this.store.select(selectAuthState);
  }

  setToken(token: string){
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  getUserId(): any {
    let idUsuario = 0;
    let idAvatar = 0;
    let fullName = '';
    let name = '';
    let firstName = '';
    let lastName = '';
    let email = '';
    let phone = '';
    this.getStateUser.subscribe((stateAuth) => {
      idUsuario = stateAuth.autenticado ? stateAuth.seguridad.user.id: idUsuario;
      idAvatar = stateAuth.autenticado ? stateAuth.seguridad.user.avatar: idAvatar;
      fullName = stateAuth.autenticado ? stateAuth.seguridad.user.fullname: fullName;
      name = stateAuth.autenticado ? stateAuth.seguridad.user.name: name;
      firstName = stateAuth.autenticado ? stateAuth.seguridad.user.firstname: firstName;
      lastName = stateAuth.autenticado ? stateAuth.seguridad.user.lastname: lastName;
      email = stateAuth.autenticado ? stateAuth.seguridad.user.email: email;
      phone = stateAuth.autenticado ? stateAuth.seguridad.user.phone: phone;
    });
    return {idUsuario, idAvatar, fullName, name, firstName, lastName, email, phone};
  }

  updateDataUser(newUserData) {
    let actualUserData
    this.getStateUser.subscribe((stateUser) => {
      actualUserData = stateUser.seguridad;
    });
    actualUserData.user = {
      id: newUserData.idUsuario,
      fullname: `${newUserData.nombre} ${newUserData.apellidoP} ${newUserData.apellidoM}`,
      name: newUserData.nombre,
      firstname: newUserData.apellidoP,
      lastname: newUserData.apellidoM,
      email: newUserData.email,
      phone: newUserData.telefono,
      avatar: newUserData.avatar
    };
    this.store.dispatch(new UpdateData(actualUserData));
    this.indexedDB = new NgxIndexedDB('SISCO', 1);
    this.indexedDB.openDatabase(1).then(() => {
      this.indexedDB.getByKey('seguridad', 1).then(resultado => {
        this.indexedDB.update('seguridad', {
          ...resultado,
          seguridad: actualUserData
        });
      });
    });
  }
}
