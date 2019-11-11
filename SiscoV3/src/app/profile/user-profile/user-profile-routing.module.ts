import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelNotificacionComponent } from '../../notificaciones/panel-notificacion/panel-notificacion.component';

const routes: Routes = [{
  path: '',
  component: PanelNotificacionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
