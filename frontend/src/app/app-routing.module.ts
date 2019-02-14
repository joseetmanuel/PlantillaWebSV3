import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VentasComponent} from './ventas/ventas.component';

const routes: Routes = [
  {path: 'ventas', component: VentasComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
