import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
// ******************* FIREBASE **********************
import { AngularFireMessagingModule } from 'angularfire2/messaging';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { MessagingService } from './services/messaging.service';
import { AsyncPipe } from '../../node_modules/@angular/common';
import { FilterPipe } from './utilerias/pipes';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgReduxModule } from '@angular-redux/store';
import { NgRedux, DevToolsExtension } from '@angular-redux/store';
import { rootReducer, ArchitectUIState } from './ThemeOptions/store';
import { ConfigActions } from './ThemeOptions/store/config.actions';
import { AppRoutingModule } from './app-routing.module';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

// SessionInitializer
import { SessionInitializer } from './services/session-initializer';

// BOOTSTRAP COMPONENTS

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { LaddaModule } from 'angular2-ladda';
import { NgxLoadingModule } from 'ngx-loading';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CalendarModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CountUpModule } from 'countup.js-angular2';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction'; 
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { AngularStickyThingsModule } from '@w11k/angular-sticky-things';
import { NouisliderModule } from 'ng2-nouislider';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TextMaskModule } from 'angular2-text-mask';
import { ClipboardModule } from 'ngx-clipboard';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { ColorPickerModule } from 'ngx-color-picker';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ChartsModule } from 'ng2-charts';
import { Ng2CarouselamosModule } from 'ng2-carouselamos';

// ANGULAR MATERIAL COMPONENTS

import { MatCheckboxModule, MatRippleModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';

// LAYOUT

// import {BaseLayoutComponent} from './Layout/base-layout/base-layout.component';
// import {AppsLayoutComponent} from './Layout/apps-layout/apps-layout.component';
// import {PagesLayoutComponent} from './Layout/pages-layout/pages-layout.component';
import { ThemeOptions } from './theme-options';
import { OptionsDrawerComponent } from './ThemeOptions/options-drawer/options-drawer.component';
import { PageTitleComponent } from './Layout/Components/page-title/page-title.component';

// HEADER

import { HeaderComponent } from './Layout/Components/header/header.component';
import { DotsComponent } from './Layout/Components/header/elements/dots/dots.component';
import { SearchBoxComponent } from './Layout/Components/header/elements/search-box/search-box.component';
import { MegamenuComponent } from './Layout/Components/header/elements/mega-menu/mega-menu.component';
import { MegapopoverComponent } from './Layout/Components/header/elements/mega-menu/elements/megapopover/megapopover.component';
import { UserBoxComponent } from './Layout/Components/header/elements/user-box/user-box.component';
import { DrawerComponent } from './Layout/Components/header/elements/drawer/drawer.component';

// SIDEBAR

import { SidebarComponent } from './Layout/Components/sidebar/sidebar.component';
import { LogoComponent } from './Layout/Components/sidebar/elements/logo/logo.component';

// FOOTER

import { FooterComponent } from './Layout/Components/footer/footer.component';
import { FooterDotsComponent } from './Layout/Components/footer/elements/footer-dots/footer-dots.component';
import { FooterMenuComponent } from './Layout/Components/footer/elements/footer-menu/footer-menu.component';

// Apex Charts

import { NgApexchartsModule } from 'ng-apexcharts';

// Gauges Charts

import { GaugeModule } from 'angular-gauge';
import { TrendModule } from 'ngx-trend';

import {
  DevExtremeModule,
  DxDataGridModule,
  DxFileUploaderModule,
  DxCheckBoxModule,
  DxSelectBoxModule,
  DxButtonModule,
  DxDropDownBoxModule,
  DxAutocompleteModule,
  DxTemplateModule
} from 'devextreme-angular';

import { LoginComponent } from './acceso/login/login.component';
import { PanelComponent } from './panel/panel.component';
import { ForgotPasswordComponent } from './acceso/forgot-password/forgot-password.component';
import { VentasComponent } from './ventas/ventas.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { UpdPasswordComponent } from './acceso/upd-password/upd-password.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HomeReporteComponent } from './reportes/home-reporte/home-reporte.component';
// tslint:disable-next-line: max-line-length
import { SelReporteIntegraAutoexpressComponent } from './reportes/sel-reporte-integra-autoexpress/sel-reporte-integra-autoexpress.component';
import { SelReporteIntegraAutoexpressGastoComponent } from './reportes/sel-reporte-integra-autoexpress/sel-reporte-integra-autoexpress-gasto/sel-reporte-integra-autoexpress-gasto.component'
import { SelContratoReporteComponent } from './reportes/contrato-reporte/sel-contrato-reporte/sel-contrato-reporte.component';
import { InsContratoReporteComponent } from './reportes/contrato-reporte/ins-contrato-reporte/ins-contrato-reporte.component';
import { SelReporteIntegraAutoexpressKilometrajeGpsComponent } from './reportes/sel-reporte-integra-autoexpress/sel-reporte-integra-autoexpress-kilometraje-gps/sel-reporte-integra-autoexpress-kilometraje-gps.component';
// tslint:disable-next-line: max-line-length
import { InsReporteIntegraAutoexpressKilometrajeGpsComponent } from './reportes/sel-reporte-integra-autoexpress/ins-reporte-integra-autoexpress-kilometraje/ins-reporte-integra-autoexpress-kilometraje-gps.component';

import { GridComponentComponent } from './utilerias/grid-component/grid-component.component';
import { FileUploadComponent } from './utilerias/file-upload-component/file-upload.component';
import { CargaMasivaComponent } from './utilerias/carga-masiva/carga-masiva.component';
import { SelProveedorComponent } from './proveedor/sel-proveedor/sel-proveedor.component';
import { HomeProveedorComponent } from './proveedor/home-proveedor/home-proveedor.component';
import { InsProveedorComponent } from './proveedor/ins-proveedor/ins-proveedor.component';
import { UpdProveedorComponent } from './proveedor/upd-proveedor/upd-proveedor.component';

import { FormProveedorComponent } from './proveedor/form-proveedor/form-proveedor.component';
import { InsProveedorEntidadComponent } from './proveedor/ins-proveedor-entidad/ins-proveedor-entidad.component';
import { EditClienteComponent } from './clientes/upd-cliente/upd-cliente.component';
import { DeleteAlertComponent } from './utilerias/delete-alert/delete-alert.component';
import { AlertConfirmComponent } from './utilerias/alert-confirm/alert-confirm.component';
import { AddDoctoComponent } from './clientes/ins-documento/ins-documento.component';
import { ExcepcionComponent } from './utilerias/excepcion/excepcion.component';
import { ClientesComponent } from './clientes/sel-clientes/sel-clientes.component';
import { AddClienteComponent } from './clientes/ins-cliente/ins-cliente.component';
import { MaterialModule } from './angular-material';
import { ViewerComponent } from './utilerias/viewer/viewer.component';
import { ObjetoComponent } from './objeto/objeto.component';
import { SelObjetoComponent } from './objeto/sel-objeto/sel-objeto.component';
import { UpdObjetoComponent } from './objeto/upd-objeto/upd-objeto.component';
import { BreadcrumbsComponent } from './utilerias/breadcrumbs/breadcrumbs.component';
import { HomePartidaComponent } from './partidas/home-partida/home-partida.component';
import { SelTipoObjetoComponent } from './partidas/sel-tipoobjeto/sel-tipoobjeto.component';
import { InsTipoObjetoComponent } from './partidas/ins-tipoobjeto/ins-tipoobjeto.component';
import { UpdTipoobjetoComponent } from './partidas/upd-tipoobjeto/upd-tipoobjeto.component';
import { UpdateAlertComponent } from './utilerias/update-alert/update-alert.component';
import { InsContratoComponent } from './contratos/ins-contrato/ins-contrato.component';
import { SelContratosComponent } from './contratos/sel-contratos/sel-contratos.component';
import { UpdContratoComponent } from './contratos/upd-contrato/upd-contrato.component';
import {
  SelOrdenesCompraComponent
} from './contratos/conf-equipamiento-contrato/ordenesCompra/sel-ordenes-compra/sel-ordenes-compra.component';
import { InsOrdenCompraComponent } from './contratos/conf-equipamiento-contrato/ordenesCompra/ins-orden-compra/ins-orden-compra.component';
import { UpdOrdenCompraComponent } from './contratos/conf-equipamiento-contrato/ordenesCompra/upd-orden-compra/upd-orden-compra.component';
import { AlertDialogComponent } from './utilerias/alert-dialog/alert-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentModule } from 'ngx-moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { HomeSolicitudComponent } from './solicitudes/home-solicitudes/home-solicitudes.component';
import { InsSolicitudFacturaComponent } from './solicitudes/ins-solicitud-factura/ins-solicitud-factura.component';

import { environment } from '../environments/environment';

// ******************* @NGRX **********************
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AuthService } from './services/auth.service';
import { AuthEffects } from './store/effects/auth.effects';
import { reducers } from './store/app.states';
import { AuthGuardService } from './services/auth-guard.service';
import { SelPartidaComponent } from './partidas/sel-partida/sel-partida.component';
import { SelUnidadContratoComponent } from './contratos/upd-contrato/unidad-contrato/sel-unidad-contrato/sel-unidad-contrato.component';
// tslint:disable-next-line:max-line-length
import { InsProveedorContratoComponent } from './contratos/upd-contrato/proveedor-contrato/ins-proveedor-contrato/ins-proveedor-contrato.component';
import { EquipamientoContratoComponent } from './contratos/conf-equipamiento-contrato/conf-equipamiento-contrato.component';
import { UpdProveedorEntidadComponent } from './proveedor/upd-proveedor-entidad/upd-proveedor-entidad.component';
import { InsPartidaComponent } from './partidas/ins-partida/ins-partida.component';
import { UpdPartidaComponent } from './partidas/upd-partida/upd-partida.component';
import { ExcelService } from './utilerias/carga-masiva/excel.service';
import { InsPartidaMasivaComponent } from './partidas/ins-partida-masiva/ins-partida-masiva.component';
import { InsObjetoComponent } from './objeto/ins-objeto/ins-objeto.component';
import {
  OrdenDetalleComponent
} from './contratos/conf-equipamiento-contrato/ordenesCompra/upd-orden-compra/orden-detalle/orden-detalle.component';
// tslint:disable-next-line: max-line-length
import { SelProveedoresEquipamientoComponent } from './contratos/conf-equipamiento-contrato/proveedores-equipamiento/sel-proveedores-equipamiento/sel-proveedores-equipamiento.component';
import {
  InsProvedorEquipamientoComponent
} from './contratos/conf-equipamiento-contrato/proveedores-equipamiento/ins-provedor-equipamiento/ins-provedor-equipamiento.component';
import {
  UpdProveedorEquipamientoComponent
} from './contratos/conf-equipamiento-contrato/proveedores-equipamiento/upd-proveedor-equipamiento/upd-proveedor-equipamiento.component';
import { SiscoV3Service } from './services/siscov3.service';
import { GPSService } from './services/gps.service';
import { SelSpecComponent } from './contratos/conf-equipamiento-contrato/SPEC/sel-spec/sel-spec.component';
import { InsSpecComponent } from './contratos/conf-equipamiento-contrato/SPEC/ins-spec/ins-spec.component';
import { UpdSpecComponent } from './contratos/conf-equipamiento-contrato/SPEC/upd-spec/upd-spec.component';
import { SelProveedorPropioComponent } from './proveedor/sel-proveedor-propio/sel-proveedor-propio.component';
import { UpdProveedorPropioComponent } from './proveedor/upd-proveedor-propio/upd-proveedor-propio.component';
import { InsProveedorPropioComponent } from './proveedor/ins-proveedor-propio/ins-proveedor-propio.component';
import { FormProveedorPropioComponent } from './proveedor/form-proveedor-propio/form-proveedor-propio.component';
import { InsProveedorPropioEntidadComponent } from './proveedor/ins-proveedor-propio-entidad/ins-proveedor-propio-entidad.component';
import { UpdProveedorPropioEntidadComponent } from './proveedor/upd-proveedor-propio-entidad/upd-proveedor-propio-entidad.component';
import { BottomSheetComponent } from './utilerias/bottom-sheet/bottom-sheet.component';
import { SelPartidaPropiaComponent } from './partidas/sel-partida-propia/sel-partida-propia.component';
import { InsPartidaPropiaComponent } from './partidas/ins-partida-propia/ins-partida-propia.component';
import { UpdPartidaPropiaComponent } from './partidas/upd-partida-propia/upd-partida-propia.component';
import { InsPartidaPropiaMasivaComponent } from './partidas/ins-partida-propia-masiva/ins-partida-propia-masiva.component';
import { HomeComisionesComponent } from './comisiones/home-comisiones/home-comisiones.component';
import { ObjetoDocumentoComponent } from './objeto/objeto-documento/objeto-documento.component';
import { ZonasComponent } from './contratos/zonas/zonas.component';
import { EquipamientoComponent } from './contratos/equipamiento/equipamiento.component';
import { NotificacionComponent } from './notificaciones/notificacion/notificacion.component';
import { PanelNotificacionComponent } from './notificaciones/panel-notificacion/panel-notificacion.component';
import { TareaComponent } from './notificaciones/tarea/tarea.component';
import { PanelTareaComponent } from './notificaciones/panel-tarea/panel-tarea.component';
import { InsTareaComponent } from './notificaciones/ins-tarea/ins-tarea.component';
import { FormTareaComponent } from './notificaciones/form-tarea/form-tarea.component';
import { ComisionesInternosComponent } from './comisiones/comisiones-internos/comisiones-internos.component';
import { ComisionesExternosComponent } from './comisiones/comisiones-externos/comisiones-externos.component';
import { SelComisionesDisponiblesExternosComponent } from './comisiones/sel-comisiones-disponibles-externos/sel-comisiones-disponibles-externos.component';
import { SelComisionesDisponiblesInternosComponent } from './comisiones/sel-comisiones-disponibles-internos/sel-comisiones-disponibles-internos.component';
import { SelDisposicionComponent } from './comisiones/sel-disposicion/sel-disposicion.component'
import { InsContratoNivelComponent } from './contratos/ins-contrato-nivel/ins-contrato-nivel.component';
import { UpdContratoNivelComponent } from './contratos/upd-contrato-nivel/upd-contrato-nivel.component';
import { BannerComponent } from './objeto/banner/banner.component';
import { HeaderTipoObjetoAutomovilComponent } from './partidas/header-tipoobjeto-automovil/header-tipoobjeto-automovil.component';
import { InsSolicitudComponent } from './solicitudes/ins-solicitud/ins-solicitud.component';
import { ClonarPartidaComponent } from './partidas/clonar-partida/clonar-partida.component';
import { ObjetoCargaMasivaComponent } from './objeto/objeto-carga-masiva/objeto-carga-masiva.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BuscadorComponent } from './utilerias/buscador/buscador.component';
import { InsUnidadContratoComponent } from './contratos/upd-contrato/unidad-contrato/ins-unidad-contrato/ins-unidad-contrato.component';
import { BannerProveedorEntidadComponent } from './proveedor/detalle-proveedor/banner-proveedor-entidad.component';
import { UpdUnidadContratoComponent } from './contratos/upd-contrato/unidad-contrato/upd-unidad-contrato/upd-unidad-contrato.component';
import { HomeGastosComponent } from './gastos/home-gastos/home-gastos.component';
import { AgrupadorTipoobjetoComponent } from './gastos/agrupador-tipoobjeto/agrupador-tipoobjeto.component';
import { UpdAgrupadorTipoobjetoComponent } from './gastos/upd-agrupador-tipoobjeto/upd-agrupador-tipoobjeto.component';
import { InsAgrupadorTipoobjetoComponent } from './gastos/ins-agrupador-tipoobjeto/ins-agrupador-tipoobjeto.component';
import { InsGastoComponent } from './gastos/ins-gasto/ins-gasto.component';
import { SolicitudPagoComponent } from './gastos/solicitud-pago/solicitud-pago.component';
import { SelCentroCostoComponent } from './contratos/centro-costo/sel-centro-costo/sel-centro-costo.component';
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { ChatComponent } from './profile/chat/chat.component';
import { ChatBoxComponent } from './profile/chat-box/chat-box.component';

import { HomeMantenimientoComponent } from './mantenimiento/home-mantenimiento/home-mantenimiento.component';
import { SelSolicitudComponent } from './solicitudes/sel-solicitud/sel-solicitud.component';
import { ContestaEncuestaComponent } from './solicitudes/contesta-encuesta/contesta-encuesta.component';
import { EncuestaProveedorComponent } from './solicitudes/encuesta-proveedor/encuesta-proveedor.component';
import { InsCentroCostoComponent } from './contratos/centro-costo/ins-centro-costo/ins-centro-costo.component';
import { UpdCentroCostoComponent } from './contratos/centro-costo/upd-centro-costo/upd-centro-costo.component';
import { PreciosVentaCargaMasivaComponent } from './contratos/upd-contrato/unidad-contrato/upd-unidad-contrato/precios-venta-carga-masiva/precios-venta-carga-masiva.component';
import { InsProveedorSolicitudComponent } from './solicitudes/ins-proveedor-solicitud/ins-proveedor-solicitud.component';
import { SelProveedorPartidaComponent } from './proveedor/sel-proveedor-partida/sel-proveedor-partida.component';
import { InsPartidaProveedorCostoMasivoComponent } from './proveedor/ins-partida-proveedor-costo-masivo/ins-partida-proveedor-costo-masivo.component';
import { InsPartidaCostoMasivaComponent } from './partidas/ins-partida-costo-masiva/ins-partida-costo-masiva.component';
import { SelFichaTecnicaComponent } from './objeto/ficha-tecnica/sel-ficha-tecnica.component';

/*Interceptor*/
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './services/token.interceptor';
import { UsuarioTareaComponent } from './notificaciones/usuario-tarea/usuario-tarea.component';
import { SelSolicitudFooterComponent } from './solicitudes/sel-solicitud-footer/sel-solicitud-footer.component';
import { OperadorComponent } from './operador/operador.component';
import { AsignarObjetoComponent } from './operador/asignar-objeto/asignar-objeto.component';
import { AsignarOperadorComponent } from './operador/asignar-operador/asignar-operador.component';
import { SelGestoriaComponent } from './gastos/sel-gestoria/sel-gestoria.component';
import { UpdOperadorComponent } from './operador/upd-operador/upd-operador.component';
import { InsOperadorComponent } from './operador/ins-operador/ins-operador.component';
import { FasePasoSolicitudComponent } from './solicitudes/fase-paso-solicitud/fase-paso-solicitud.component';
import { SelTipoSolicitudComponent } from './contratos/upd-contrato/tipo-solicitud/sel-tipo-solicitud/sel-tipo-solicitud.component';
import { AuthPartidasComponent } from './solicitudes/auth-partidas/auth-partidas.component';
import { SelSolicitudReporteComponent } from './reportes/solicitudes/sel-solicitud-reporte/sel-solicitud-reporte.component';
import { SelClienteReporteComponent } from './reportes/clientes/sel-cliente-reporte/sel-cliente-reporte.component';
import { SelProveedorReporteComponent } from './reportes/proveedores/sel-proveedor-reporte/sel-proveedor-reporte.component';
import { SelPartidaReporteComponent } from './reportes/partidas/sel-partida-reporte/sel-partida-reporte.component';
import { SelSolicitudPasoComponent } from './mantenimiento/sel-solicitud-paso/sel-solicitud-paso.component';
import { InsComprobanteRecepcionComponent} from './solicitudes/ins-comprobante-recepcion/ins-comprobante-recepcion.component';
import { ChatlistComponent } from './profile/chatlist/chatlist.component';
import { InsSolicitudCotizacionComponent } from './solicitudes/ins-solicitud-cotizacion/ins-solicitud-cotizacion.component';
import { UpdSolicitudCotizacionComponent } from './solicitudes/upd-solicitud-cotizacion/upd-solicitud-cotizacion.component';
import { InsObjetoSustitutoComponent } from './objeto/ins-objeto-sustituto/ins-objeto-sustituto.component';
import { InsSolicitudPrefacturaComponent } from './solicitudes/solicitud-prefactura/ins-solicitud-prefactura.component'
import {FuncionColor } from './utilerias/clases/funcionColor';
import { SelSolicitudesComponent } from './solicitudes/sel-solicitudes/sel-solicitudes.component';

import { GpsComponent } from './gps/gps.component';
import { TooltipVehiculoComponent } from './gps/tooltip-vehiculo/tooltip-vehiculo.component';
import { BannerGenericoComponent } from './objeto/banner-generico/banner-generico.component';
import { ToastSISCOComponent } from './Layout/Components/toast-sisco/toast-sisco.component';
import { VisorTareaComponent } from './notificaciones/visor-tarea/visor-tarea.component';
import { FilterChatPipe } from './utilerias/pipes/filter-chat.pipe';
import { FilterAlarmaPipe } from './utilerias/pipes/filter-alarma.pipe';

import {LineChartComponent} from './utilerias/line-chart/line-chart.component';
import { ReporteControlDocumentalComponent } from './reportes/objeto/reporte-control-documental/reporte-control-documental.component';
import {RedirectComponent} from './utilerias/redirect/redirect.component';


export const ISO_FORMAT = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

export function sessionInitializerProviderFactory(provider: SessionInitializer) {
  return () => provider.validateLogin();
}

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [

    // LAYOUT

    AppComponent,
    // BaseLayoutComponent,
    // AppsLayoutComponent,
    // PagesLayoutComponent,
    OptionsDrawerComponent,
    PageTitleComponent,

    // HEADER

    HeaderComponent,
    DotsComponent,
    SearchBoxComponent,
    MegamenuComponent,
    MegapopoverComponent,
    UserBoxComponent,
    DrawerComponent,

    // Chart.js 
    LineChartComponent,

    // SIDEBAR

    SidebarComponent,
    LogoComponent,

    // FOOTER

    FooterComponent,
    FooterDotsComponent,
    FooterMenuComponent,

    // User Pages

    ForgotPasswordComponent,
    LoginComponent,
    AppComponent,
    HeaderComponent,
    LoginComponent,
    UpdPasswordComponent,
    PanelComponent,
    VentasComponent,
    ClientesComponent,
    AddClienteComponent,
    ExcepcionComponent,
    GridComponentComponent,
    FileUploadComponent,
    DeleteAlertComponent,
    AlertConfirmComponent,
    AddDoctoComponent,
    SelProveedorComponent,
    HomeProveedorComponent,
    InsProveedorComponent,
    UpdProveedorComponent,
    FormProveedorComponent,
    InsProveedorEntidadComponent,
    EditClienteComponent,
    ObjetoComponent,
    SelObjetoComponent,
    UpdObjetoComponent,
    InsObjetoComponent,
    BreadcrumbsComponent,
    UpdateAlertComponent,
    ViewerComponent,
    InsContratoComponent,
    SelContratosComponent,
    UpdContratoComponent,
    SelTipoObjetoComponent,
    HomePartidaComponent,
    InsTipoObjetoComponent,
    UpdTipoobjetoComponent,
    UpdateAlertComponent,
    SelOrdenesCompraComponent,
    InsOrdenCompraComponent,
    UpdOrdenCompraComponent,
    AlertDialogComponent,
    SelPartidaComponent,
    SelUnidadContratoComponent,
    InsProveedorContratoComponent,
    EquipamientoContratoComponent,
    UpdProveedorEntidadComponent,
    InsPartidaComponent,
    UpdPartidaComponent,
    HomeReporteComponent,
    SelReporteIntegraAutoexpressComponent,
    SelReporteIntegraAutoexpressGastoComponent,
    SelContratoReporteComponent,
    InsContratoReporteComponent,
    SelReporteIntegraAutoexpressKilometrajeGpsComponent,
    InsReporteIntegraAutoexpressKilometrajeGpsComponent,
    GpsComponent,
    InsPartidaMasivaComponent,
    CargaMasivaComponent,
    OrdenDetalleComponent,
    SelProveedoresEquipamientoComponent,
    InsProvedorEquipamientoComponent,
    UpdProveedorEquipamientoComponent,
    SelSpecComponent,
    InsSpecComponent,
    UpdSpecComponent,
    SelProveedorPropioComponent,
    UpdProveedorPropioComponent,
    InsProveedorPropioComponent,
    FormProveedorPropioComponent,
    InsProveedorPropioEntidadComponent,
    UpdProveedorPropioEntidadComponent,
    SelPartidaPropiaComponent,
    InsPartidaPropiaComponent,
    BottomSheetComponent,
    UpdPartidaPropiaComponent,
    InsPartidaPropiaMasivaComponent,
    HomeComisionesComponent,
    ObjetoDocumentoComponent,
    FilterPipe,
    FilterAlarmaPipe,
    ZonasComponent,
    EquipamientoComponent,
    InsContratoNivelComponent,
    UpdContratoNivelComponent,
    EquipamientoComponent,
    NotificacionComponent,
    PanelNotificacionComponent,
    TareaComponent,
    PanelTareaComponent,
    InsTareaComponent,
    FormTareaComponent,
    ComisionesInternosComponent,
    ComisionesExternosComponent,
    SelComisionesDisponiblesExternosComponent,
    SelComisionesDisponiblesInternosComponent,
    SelDisposicionComponent,
    BannerComponent,
    HeaderTipoObjetoAutomovilComponent,
    HomeSolicitudComponent,
    InsSolicitudComponent,
    ClonarPartidaComponent,
    ObjetoCargaMasivaComponent,
    BuscadorComponent,
    InsUnidadContratoComponent,
    BannerProveedorEntidadComponent,
    UpdUnidadContratoComponent,
    BuscadorComponent,
    HomeGastosComponent,
    AgrupadorTipoobjetoComponent,
    UpdAgrupadorTipoobjetoComponent,
    InsAgrupadorTipoobjetoComponent,
    InsGastoComponent,
    SolicitudPagoComponent,
    SelCentroCostoComponent,
    HomeMantenimientoComponent,
    SelSolicitudComponent,
    ContestaEncuestaComponent,
    EncuestaProveedorComponent,
    InsComprobanteRecepcionComponent,
    InsCentroCostoComponent,
    UpdCentroCostoComponent,
    PreciosVentaCargaMasivaComponent,
    UserProfileComponent,
    ChatComponent,
    ChatBoxComponent,
    UsuarioTareaComponent,
    SelProveedorPartidaComponent,
    InsProveedorSolicitudComponent,
    InsPartidaProveedorCostoMasivoComponent,
    InsPartidaCostoMasivaComponent,
    SelFichaTecnicaComponent,
    SelSolicitudFooterComponent,
    OperadorComponent,
    InsPartidaCostoMasivaComponent,
    AsignarObjetoComponent,
    AsignarOperadorComponent,
    SelGestoriaComponent,
    UpdOperadorComponent,
    InsOperadorComponent,
    FasePasoSolicitudComponent,
    InsSolicitudFacturaComponent,
    SelTipoSolicitudComponent,
    AuthPartidasComponent,
    SelSolicitudReporteComponent,
    SelClienteReporteComponent,
    SelProveedorReporteComponent,
    SelPartidaReporteComponent,
    SelSolicitudPasoComponent,
    ChatlistComponent,
    InsSolicitudCotizacionComponent,
    UpdSolicitudCotizacionComponent,
    InsObjetoSustitutoComponent,
    InsSolicitudPrefacturaComponent,
    SelSolicitudesComponent,
    BannerGenericoComponent,
    ToastSISCOComponent,
    VisorTareaComponent,
    FilterChatPipe,
    TooltipVehiculoComponent,
    ReporteControlDocumentalComponent,
    RedirectComponent
  ],
  entryComponents: [
    ExcepcionComponent,
    AddClienteComponent,
    DeleteAlertComponent,
    UpdateAlertComponent,
    AlertDialogComponent,
    AlertConfirmComponent,
    BottomSheetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgReduxModule,
    CommonModule,
    LoadingBarRouterModule,

    // Firebase
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),

    // Angular Bootstrap Components

    PerfectScrollbarModule,
    NgbModule,
    AngularFontAwesomeModule,
    LaddaModule,
    FormsModule,
    ReactiveFormsModule,
    NgBootstrapFormValidationModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    RoundProgressModule,
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      customClass: 'modal-content',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn'
    }),
    ToastrModule.forRoot(),
    ToastContainerModule,
    SlickCarouselModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    CountUpModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBMALgRyBm2hi-YynoUKSwvFmQQPCbKUf0',
      libraries: ['geometry', 'places']
    }),
    AgmDirectionModule,     // agm-direction
    AgmJsMarkerClustererModule,
    AgmSnazzyInfoWindowModule,
    ImageCropperModule,
    AngularStickyThingsModule,
    NouisliderModule,
    NgSelectModule,
    SelectDropDownModule,
    NgMultiSelectDropDownModule.forRoot(),
    JwBootstrapSwitchNg2Module,
    AngularEditorModule,
    HttpClientModule,
    TextMaskModule,
    ClipboardModule,
    TextareaAutosizeModule,
    ColorPickerModule,
    DropzoneModule,

    // Charts

    ChartsModule,
    NgApexchartsModule,
    GaugeModule.forRoot(),
    TrendModule,

    // Angular Material Components

    MatCheckboxModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTreeModule,
    MatRippleModule,
    MomentModule,
    DevExtremeModule,
    DxDataGridModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxDropDownBoxModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DxAutocompleteModule,
    DxTemplateModule,
    MaterialModule,
    StoreModule.forRoot(reducers, {}),
    EffectsModule.forRoot([AuthEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),
    NgbModule,
    PdfViewerModule,
    InfiniteScrollModule,
    AgmDirectionModule,
    Ng2CarouselamosModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    CurrencyPipe,
    SessionInitializer,
    {
      provide: APP_INITIALIZER, useFactory: sessionInitializerProviderFactory, deps: [SessionInitializer], multi: true
    },
    SiscoV3Service,
    GPSService,
    {
      provide:
        PERFECT_SCROLLBAR_CONFIG,
      // DROPZONE_CONFIG,
      useValue:
        DEFAULT_PERFECT_SCROLLBAR_CONFIG,
      // DEFAULT_DROPZONE_CONFIG,
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: ISO_FORMAT },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    ExcelService,
    ConfigActions,
    ThemeOptions,
    MessagingService,
    AsyncPipe,
    FuncionColor
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(
    private ngRedux: NgRedux<ArchitectUIState>,
    private devTool: DevToolsExtension) {

    this.ngRedux.configureStore(
      rootReducer,
      {} as ArchitectUIState,
      [],
      [devTool.isEnabled() ? devTool.enhancer() : f => f]
    );

  }
}
