import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelComponent} from './panel/panel.component';
import { LoginComponent} from './acceso/login/login.component';
import { ForgotPasswordComponent} from './acceso/forgot-password/forgot-password.component';
import { VentasComponent} from './ventas/ventas.component';
import { ClientesComponent} from './clientes/sel-clientes/sel-clientes.component';
import { AddClienteComponent } from './clientes/ins-cliente/ins-cliente.component';
import { EditClienteComponent } from './clientes/upd-cliente/upd-cliente.component';
import { AddDoctoComponent } from './clientes/ins-documento/ins-documento.component';

const routes: Routes = [
  {path: '', component: PanelComponent},
  {path: 'login', component: LoginComponent },
  {path: 'forgot', component: ForgotPasswordComponent },
  {path: 'ventas', component: VentasComponent },
  {path: 'sel-clientes', component: ClientesComponent },
  {path: 'ins-cliente', component: AddClienteComponent },
  {path: 'upd-cliente/:idCliente', component: EditClienteComponent },
  {path: 'upd-clienteEntidad/:rfcClienteEntidad', component: AddClienteComponent },
  {path: 'ins-clienteEntidad/:idCliente', component: AddClienteComponent },
  {path: 'ins-documento/:idCliente', component: AddDoctoComponent }
  // {path: '**', component: ClientesComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
