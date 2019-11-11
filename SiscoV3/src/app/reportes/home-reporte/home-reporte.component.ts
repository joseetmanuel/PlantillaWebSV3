import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home-reporte',
  templateUrl: './home-reporte.component.html',
  styleUrls: ['./home-reporte.component.scss']
})
export class HomeReporteComponent implements OnInit {
  claveModulo = 'app-home-reporte';
  idClase = '';
  modulo: any = {};

  /** State */
  getStateNegocio: Observable<any>;
  getStateUser: Observable<any>;
  getStateAutenticacion: Observable<any>;

  /** Commons */
  spinner = false;

  constructor(private router: Router, private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog, private snackBar: MatSnackBar, private store: Store<AppState>) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.spinner = true;
  }

  ngOnInit() {
    this.spinner = false;
  }
}
