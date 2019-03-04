import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelComponent} from './panel/panel.component';
import { LoginComponent} from './login/login.component';
import { ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import { VentasComponent} from './ventas/ventas.component';
import { ClientesComponent} from './clientes/clientes.component';
import { AddClienteComponent } from './add-cliente/add-cliente.component';
import { EditClienteComponent } from './edit-cliente/edit-cliente.component';

const routes: Routes = [
  {path: '', component: PanelComponent},
  {path: 'login', component: LoginComponent },
  {path: 'forgot', component: ForgotPasswordComponent },
  {path: 'ventas', component: VentasComponent },
  {path: 'clientes', component: ClientesComponent },
  {path: 'add-cliente', component: AddClienteComponent },
  {path: 'edit-cliente/:idCliente', component: EditClienteComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
