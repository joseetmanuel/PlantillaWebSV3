import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelComponent} from './panel/panel.component';
import { LoginComponent} from './login/login.component';
import { ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import { VentasComponent} from './ventas/ventas.component';
import { ClientesComponent} from './clientes/clientes.component';

const routes: Routes = [
  {path: '', component: PanelComponent},
  {path: 'login', component: LoginComponent },
  {path: 'forgot', component: ForgotPasswordComponent },
  {path: 'ventas', component: VentasComponent },
  {path: 'clientes', component: ClientesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
