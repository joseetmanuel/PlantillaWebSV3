import { Component, OnInit, ViewChild } from '@angular/core';
import { ThemeOptions } from '../../../../../theme-options';
import { Router } from '@angular/router';
import { SessionInitializer } from '../../../../../services/session-initializer';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { BaseService } from '../../../../../services/base.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-box',
  templateUrl: './user-box.component.html',
})
export class UserBoxComponent implements OnInit {
  usuario: any;
  userName = '';
  userRol = '';
  urlAvatar = '';
  @ViewChild('userBoxDropDown') userBoxDropDown: NgbDropdown;

  constructor(public globals: ThemeOptions, private sessionInitializer: SessionInitializer, private baseService: BaseService, private router: Router, private httpClient: HttpClient) { }

  toggleDrawer() {
    this.globals.toggleDrawer = !this.globals.toggleDrawer;
  }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      this.usuario = this.baseService.getUserData();
      if (this.usuario.user) {
        this.userName = this.usuario.user.fullname;
        this.userRol = this.usuario.security.rol.map(r => { return r.nombre }).join('|');
        this.httpClient.get(`${environment.fileServerUrl}documento/GetDocumentoById?idDocumento=${this.usuario.user.avatar}`).toPromise().then((data: any) => {
          this.urlAvatar = data.recordsets[0].path;
        }, () => {});
      }
    }
  }

  async CerrarSesion() {
    await this.sessionInitializer.setStateLogOut();
  }

  abrirChat() {
    this.userBoxDropDown.close()
    this.router.navigate(['/user-profile/1']);
  }

  abrirPerfilUsuario() {
    this.userBoxDropDown.close()
    this.router.navigate(['/user-profile/0']);
  }
}
