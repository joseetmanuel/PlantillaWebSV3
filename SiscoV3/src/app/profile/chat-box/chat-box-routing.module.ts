import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatBoxComponent } from './chat-box.component';
import { ChatComponent } from '../chat/chat.component';

const routes: Routes = [{
  path: '',
  component: ChatComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatBoxRoutingModule { }
