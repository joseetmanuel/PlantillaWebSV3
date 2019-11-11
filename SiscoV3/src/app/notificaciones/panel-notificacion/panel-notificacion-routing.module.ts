import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelNotificacionComponent } from './panel-notificacion.component';

const routes: Routes = [{
    path: '',
    component: PanelNotificacionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PanelNotificacionRoutingModule { }
