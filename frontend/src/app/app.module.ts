import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { PanelComponent } from './panel/panel.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VentasComponent } from './ventas/ventas.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    PanelComponent,
    ForgotPasswordComponent,
    NavbarComponent,
    VentasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [PanelComponent]
})
export class AppModule { }
