import { Component, OnInit } from '@angular/core';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material';
import { CambiaConfiguracionFooter, ReseteaFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from '../../models/negocio.model';

@Component({
    selector: 'app-home-solicitud',
    templateUrl: './home-solicitudes.component.html'
})
export class HomeSolicitudComponent implements OnInit {
    claveModulo = 'app-home-solicitud';
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
