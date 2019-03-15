import { BrowserModule,  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { DevExtremeModule,
  DxDataGridModule,
  DxFileUploaderModule,
  DxCheckBoxModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './acceso/login/login.component';
import { PanelComponent } from './panel/panel.component';
import { ForgotPasswordComponent } from './acceso/forgot-password/forgot-password.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VentasComponent } from './ventas/ventas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { GridComponentComponent } from './utilerias/grid-component/grid-component.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SelProveedorComponent } from './proveedor/home-proveedor/sel-proveedor/sel-proveedor.component';
import { HomeProveedorComponent } from './proveedor/home-proveedor/home-proveedor.component';
import { InsProveedorComponent } from './proveedor/home-proveedor/ins-proveedor/ins-proveedor.component';
import { DelProveedorComponent } from './proveedor/home-proveedor/del-proveedor/del-proveedor.component';
import { UpdProveedorComponent } from './proveedor/home-proveedor/upd-proveedor/upd-proveedor.component';
import { FormProveedorComponent } from './proveedor/form-proveedor/form-proveedor.component';
import { EditClienteComponent } from './clientes/upd-cliente/upd-cliente.component';
import { DeleteAlertComponent } from './utilerias/delete-alert/delete-alert.component';
import { AddDoctoComponent } from './clientes/ins-documento/ins-documento.component';
import { ExcepcionComponent } from './utilerias/excepcion/excepcion.component';
import { ClientesComponent } from './clientes/sel-clientes/sel-clientes.component';
import { AddClienteComponent } from './clientes/ins-cliente/ins-cliente.component';
import { MaterialModule } from './angular-material';
import { MatCheckboxModule, MatButtonModule } from '@angular/material';
import { UpdateAlertComponent } from './utilerias/update-alert/update-alert.component';


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
    GridComponentComponent,
    DeleteAlertComponent,
    AddDoctoComponent,
    SelProveedorComponent,
    HomeProveedorComponent,
    InsProveedorComponent,
    DelProveedorComponent,
    UpdProveedorComponent,
    FormProveedorComponent,
    EditClienteComponent,
    UpdateAlertComponent
  ],
  entryComponents: [
    ExcepcionComponent,
    AddClienteComponent,
    DeleteAlertComponent,
    UpdateAlertComponent
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
