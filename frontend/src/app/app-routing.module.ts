import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelComponent} from './panel/panel.component';
import { LoginComponent} from './acceso/login/login.component';
import { ForgotPasswordComponent} from './acceso/forgot-password/forgot-password.component';
import { VentasComponent} from './ventas/ventas.component';
import { InsProveedorComponent } from './proveedor/home-proveedor/ins-proveedor/ins-proveedor.component';
import { HomeProveedorComponent } from './proveedor/home-proveedor/home-proveedor.component';
import { SelProveedorComponent } from './proveedor/home-proveedor/sel-proveedor/sel-proveedor.component';
import { UpdProveedorComponent } from './proveedor/home-proveedor/upd-proveedor/upd-proveedor.component';
import { ClientesComponent} from './clientes/sel-clientes/sel-clientes.component';
import { AddClienteComponent } from './clientes/ins-cliente/ins-cliente.component';
import { EditClienteComponent } from './clientes/upd-cliente/upd-cliente.component';
import { AddDoctoComponent } from './clientes/ins-documento/ins-documento.component';

const routes: Routes = [
  {path: '', component: PanelComponent},
  {path: 'login', component: LoginComponent },
  {path: 'forgot', component: ForgotPasswordComponent },
  {path: 'ventas', component: VentasComponent },
  {path: 'home-proveedor', component: HomeProveedorComponent },
  {path: 'proveedor', component: SelProveedorComponent },
  {path: 'upd-proveedor/:rfcProveedor', component: UpdProveedorComponent },
  {path: 'ins-proveedor', component: InsProveedorComponent },
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
