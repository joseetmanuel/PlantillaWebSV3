import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsuarioTareaComponent } from './usuario-tarea.component';

const routes: Routes = [{
  path: '',
  component: UsuarioTareaComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioTareaRoutingModule { }
