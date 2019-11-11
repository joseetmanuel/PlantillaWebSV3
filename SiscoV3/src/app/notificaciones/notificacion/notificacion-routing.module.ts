import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificacionComponent } from './notificacion.component';

const routes: Routes = [{
  path: '',
  component: NotificacionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class NotificacionRoutingModule { }
