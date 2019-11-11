import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatlistComponent } from './chatlist.component';

const routes: Routes = [{
  path: '',
  component: ChatlistComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatlistRoutingModule { }
