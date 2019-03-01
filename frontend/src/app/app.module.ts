import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { DevExtremeModule, 
  DxDataGridModule, 
  DxFileUploaderModule, 
  DxCheckBoxModule, DxSelectBoxModule, DxButtonModule } from "devextreme-angular";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { PanelComponent } from './panel/panel.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VentasComponent } from './ventas/ventas.component';
import { ClientesComponent } from './clientes/clientes.component';
import { AddClienteComponent } from './add-cliente/add-cliente.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import { MaterialModule } from './angular-material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ExcepcionComponent } from './excepcion/excepcion.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { GridComponentComponent } from './grid-component/grid-component.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    PanelComponent,
    ForgotPasswordComponent,
    NavbarComponent,
    VentasComponent,
    ClientesComponent,
    AddClienteComponent,
    ExcepcionComponent,
    GridComponentComponent
  ],
  entryComponents:[
    ExcepcionComponent,
    AddClienteComponent
  ],
  imports: [
    BrowserModule,
    DevExtremeModule, 
    DxDataGridModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxButtonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule, 
    MatCheckboxModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR}),
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
