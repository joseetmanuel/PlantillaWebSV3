import { Component, OnInit } from '@angular/core';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material';
import { CambiaConfiguracionFooter, ReseteaFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from '../../models/negocio.model';

@Component({
  selector: 'app-home-proveedor',
  templateUrl: './home-proveedor.component.html'
})
export class HomeProveedorComponent implements OnInit {
  // Variables para Redux
  claveModulo = 'app-home-proveedor';
  idClase = '';
  modulo: any = {};
  private getStateNegocio: Observable<any>;
  getState: Observable<any>;
  public contratos: any[] = [];
  public sinMantenimiento: boolean;
  contratoSeleccionado: any;

  rfcProveedor = 'AIC111115I30';
  idProveedorEntidad = 124;

  constructor(private store: Store<AppState>,
              private router: Router,
              private bottomSheet: MatBottomSheet) {
    this.getState = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {

    this.store.select(selectContratoState).subscribe((state: any) => {
      this.getState.subscribe((stateAutenticacion: any) => {
      this.idClase = state.claseActual;
      this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
      this.contratos = state.contratosSeleccionados.filter((contrato: any) => {
        return contrato.incluyeMantenimiento === false;
      });

      });
    });

    this.store.dispatch(new ReseteaFooter());
  }

}
