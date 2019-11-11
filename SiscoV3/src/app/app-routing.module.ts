import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import {BaseLayoutComponent} from './Layout/base-layout/base-layout.component';
// import {PagesLayoutComponent} from './Layout/pages-layout/pages-layout.component';
// import {AppsLayoutComponent} from './Layout/apps-layout/apps-layout.component';

import { PanelComponent } from './panel/panel.component';
import { LoginComponent } from './acceso/login/login.component';
import { ForgotPasswordComponent } from './acceso/forgot-password/forgot-password.component';
import { VentasComponent } from './ventas/ventas.component';
import { UpdPasswordComponent } from './acceso/upd-password/upd-password.component';

import { InsProveedorComponent } from './proveedor/ins-proveedor/ins-proveedor.component';
import { HomeProveedorComponent } from './proveedor/home-proveedor/home-proveedor.component';
import { SelProveedorComponent } from './proveedor/sel-proveedor/sel-proveedor.component';
import { UpdProveedorComponent } from './proveedor/upd-proveedor/upd-proveedor.component';
import { InsProveedorEntidadComponent } from './proveedor/ins-proveedor-entidad/ins-proveedor-entidad.component';
import { SelProveedorPropioComponent } from './proveedor/sel-proveedor-propio/sel-proveedor-propio.component';
import { InsProveedorPropioComponent } from './proveedor/ins-proveedor-propio/ins-proveedor-propio.component';
import { UpdProveedorPropioComponent } from './proveedor/upd-proveedor-propio/upd-proveedor-propio.component';

import { HomeReporteComponent } from './reportes/home-reporte/home-reporte.component';
import { SelReporteIntegraAutoexpressComponent } from './reportes/sel-reporte-integra-autoexpress/sel-reporte-integra-autoexpress.component';
import { SelReporteIntegraAutoexpressGastoComponent } from './reportes/sel-reporte-integra-autoexpress/sel-reporte-integra-autoexpress-gasto/sel-reporte-integra-autoexpress-gasto.component';
import { SelReporteIntegraAutoexpressKilometrajeGpsComponent } from './reportes/sel-reporte-integra-autoexpress/sel-reporte-integra-autoexpress-kilometraje-gps/sel-reporte-integra-autoexpress-kilometraje-gps.component';
import { InsReporteIntegraAutoexpressKilometrajeGpsComponent } from './reportes/sel-reporte-integra-autoexpress/ins-reporte-integra-autoexpress-kilometraje/ins-reporte-integra-autoexpress-kilometraje-gps.component';

import { ClientesComponent } from './clientes/sel-clientes/sel-clientes.component';
import { AddClienteComponent } from './clientes/ins-cliente/ins-cliente.component';
import { EditClienteComponent } from './clientes/upd-cliente/upd-cliente.component';
import { AddDoctoComponent } from './clientes/ins-documento/ins-documento.component';
import { ObjetoComponent } from './objeto/objeto.component';
import { SelObjetoComponent } from './objeto/sel-objeto/sel-objeto.component';
import { UpdObjetoComponent } from './objeto/upd-objeto/upd-objeto.component';
import { ObjetoDocumentoComponent } from './objeto/objeto-documento/objeto-documento.component';
import { ObjetoCargaMasivaComponent } from './objeto/objeto-carga-masiva/objeto-carga-masiva.component';
import { InsContratoComponent } from './contratos/ins-contrato/ins-contrato.component';
import { SelContratosComponent } from './contratos/sel-contratos/sel-contratos.component';
import { UpdContratoComponent } from './contratos/upd-contrato/upd-contrato.component';
import { HomePartidaComponent } from './partidas/home-partida/home-partida.component';
import { SelTipoObjetoComponent } from './partidas/sel-tipoobjeto/sel-tipoobjeto.component';
import { InsTipoObjetoComponent } from './partidas/ins-tipoobjeto/ins-tipoobjeto.component';
import { UpdTipoobjetoComponent } from './partidas/upd-tipoobjeto/upd-tipoobjeto.component';
import { SelOrdenesCompraComponent } from './contratos/conf-equipamiento-contrato/ordenesCompra/sel-ordenes-compra/sel-ordenes-compra.component';
import { InsOrdenCompraComponent } from './contratos/conf-equipamiento-contrato/ordenesCompra/ins-orden-compra/ins-orden-compra.component';
import { UpdOrdenCompraComponent } from './contratos/conf-equipamiento-contrato/ordenesCompra/upd-orden-compra/upd-orden-compra.component';
import { AuthGuardService } from './services/auth-guard.service';
import { EquipamientoContratoComponent } from './contratos/conf-equipamiento-contrato/conf-equipamiento-contrato.component';
import { SelPartidaComponent } from './partidas/sel-partida/sel-partida.component';
import { UpdProveedorEntidadComponent } from './proveedor/upd-proveedor-entidad/upd-proveedor-entidad.component';
import { InsPartidaComponent } from './partidas/ins-partida/ins-partida.component';
import { UpdPartidaComponent } from './partidas/upd-partida/upd-partida.component';
import { InsPartidaMasivaComponent } from './partidas/ins-partida-masiva/ins-partida-masiva.component';
import { InsProvedorEquipamientoComponent } from './contratos/conf-equipamiento-contrato/proveedores-equipamiento/ins-provedor-equipamiento/ins-provedor-equipamiento.component';
import { UpdProveedorEquipamientoComponent } from './contratos/conf-equipamiento-contrato/proveedores-equipamiento/upd-proveedor-equipamiento/upd-proveedor-equipamiento.component';
import { InsSpecComponent } from './contratos/conf-equipamiento-contrato/SPEC/ins-spec/ins-spec.component';
import { UpdSpecComponent } from './contratos/conf-equipamiento-contrato/SPEC/upd-spec/upd-spec.component';
import { InsProveedorPropioEntidadComponent } from './proveedor/ins-proveedor-propio-entidad/ins-proveedor-propio-entidad.component';
import { UpdProveedorPropioEntidadComponent } from './proveedor/upd-proveedor-propio-entidad/upd-proveedor-propio-entidad.component';
import { SelPartidaPropiaComponent } from './partidas/sel-partida-propia/sel-partida-propia.component';
import { InsPartidaPropiaComponent } from './partidas/ins-partida-propia/ins-partida-propia.component';
import { UpdPartidaPropiaComponent } from './partidas/upd-partida-propia/upd-partida-propia.component';
import { InsPartidaPropiaMasivaComponent } from './partidas/ins-partida-propia-masiva/ins-partida-propia-masiva.component';
import { HomeComisionesComponent } from './comisiones/home-comisiones/home-comisiones.component';
import { ComisionesExternosComponent } from './comisiones/comisiones-externos/comisiones-externos.component';
import { EquipamientoComponent } from './contratos/equipamiento/equipamiento.component';
import { HomeSolicitudComponent } from './solicitudes/home-solicitudes/home-solicitudes.component'
import { InsSolicitudComponent } from './solicitudes/ins-solicitud/ins-solicitud.component';
import { ComisionesInternosComponent } from './comisiones/comisiones-internos/comisiones-internos.component';
import { SelComisionesDisponiblesExternosComponent } from './comisiones/sel-comisiones-disponibles-externos/sel-comisiones-disponibles-externos.component';
import { SelComisionesDisponiblesInternosComponent } from './comisiones/sel-comisiones-disponibles-internos/sel-comisiones-disponibles-internos.component';
import { SelDisposicionComponent } from './comisiones/sel-disposicion/sel-disposicion.component';

// import { ComisionesComponent } from './comisiones/comisiones/comisiones.component';
import { ZonasComponent } from './contratos/zonas/zonas.component';
import { InsContratoNivelComponent } from './contratos/ins-contrato-nivel/ins-contrato-nivel.component';
import { UpdContratoNivelComponent } from './contratos/upd-contrato-nivel/upd-contrato-nivel.component';
import { InsUnidadContratoComponent } from './contratos/upd-contrato/unidad-contrato/ins-unidad-contrato/ins-unidad-contrato.component';
import { ClonarPartidaComponent } from './partidas/clonar-partida/clonar-partida.component';
import { UpdUnidadContratoComponent } from './contratos/upd-contrato/unidad-contrato/upd-unidad-contrato/upd-unidad-contrato.component';
import { HomeMantenimientoComponent } from './mantenimiento/home-mantenimiento/home-mantenimiento.component';
import { SelCentroCostoComponent } from './contratos/centro-costo/sel-centro-costo/sel-centro-costo.component';
import { InsCentroCostoComponent } from './contratos/centro-costo/ins-centro-costo/ins-centro-costo.component';
import { UpdCentroCostoComponent } from './contratos/centro-costo/upd-centro-costo/upd-centro-costo.component';
import { PreciosVentaCargaMasivaComponent } from './contratos/upd-contrato/unidad-contrato/upd-unidad-contrato/precios-venta-carga-masiva/precios-venta-carga-masiva.component';
import { SelSolicitudComponent } from './solicitudes/sel-solicitud/sel-solicitud.component';
import { AuthPartidasComponent } from './solicitudes/auth-partidas/auth-partidas.component';
import { InsProveedorSolicitudComponent } from './solicitudes/ins-proveedor-solicitud/ins-proveedor-solicitud.component';
import { InsComprobanteRecepcionComponent } from './solicitudes/ins-comprobante-recepcion/ins-comprobante-recepcion.component'
import { ContestaEncuestaComponent } from './solicitudes/contesta-encuesta/contesta-encuesta.component';

import { SelSolicitudReporteComponent } from './reportes/solicitudes/sel-solicitud-reporte/sel-solicitud-reporte.component';

//modulo Objeto/operador
import { OperadorComponent } from './operador/operador.component';
import { UpdOperadorComponent } from './operador/upd-operador/upd-operador.component';
import { InsOperadorComponent } from './operador/ins-operador/ins-operador.component';
import { AsignarObjetoComponent } from './operador/asignar-objeto/asignar-objeto.component';
import { AsignarOperadorComponent } from './operador/asignar-operador/asignar-operador.component';
// Panel notificaciones
// import { PanelNotificacionComponent } from './notificaciones/panel-notificacion/panel-notificacion.component';
import { PanelTareaComponent } from './notificaciones/panel-tarea/panel-tarea.component';
import { InsTareaComponent } from './notificaciones/ins-tarea/ins-tarea.component';
import { VisorTareaComponent } from './notificaciones/visor-tarea/visor-tarea.component';
import { from } from 'rxjs';

//  RUTAS DE GASTOS
import { HomeGastosComponent } from './gastos/home-gastos/home-gastos.component';
import { AgrupadorTipoobjetoComponent } from './gastos/agrupador-tipoobjeto/agrupador-tipoobjeto.component';
import { UpdAgrupadorTipoobjetoComponent } from './gastos/upd-agrupador-tipoobjeto/upd-agrupador-tipoobjeto.component';
import { InsAgrupadorTipoobjetoComponent } from './gastos/ins-agrupador-tipoobjeto/ins-agrupador-tipoobjeto.component';
import { InsGastoComponent } from './gastos/ins-gasto/ins-gasto.component';
import { SolicitudPagoComponent } from './gastos/solicitud-pago/solicitud-pago.component';
// Profile
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { SelProveedorPartidaComponent } from './proveedor/sel-proveedor-partida/sel-proveedor-partida.component';
import { InsPartidaProveedorCostoMasivoComponent } from './proveedor/ins-partida-proveedor-costo-masivo/ins-partida-proveedor-costo-masivo.component';
import { InsPartidaCostoMasivaComponent } from './partidas/ins-partida-costo-masiva/ins-partida-costo-masiva.component';
import { SelFichaTecnicaComponent } from './objeto/ficha-tecnica/sel-ficha-tecnica.component';
import { InsSolicitudFacturaComponent } from './solicitudes/ins-solicitud-factura/ins-solicitud-factura.component';
import { SelGestoriaComponent } from './gastos/sel-gestoria/sel-gestoria.component';
import { SelSolicitudPasoComponent } from './mantenimiento/sel-solicitud-paso/sel-solicitud-paso.component';
import { InsSolicitudCotizacionComponent } from './solicitudes/ins-solicitud-cotizacion/ins-solicitud-cotizacion.component';
import { UpdSolicitudCotizacionComponent } from './solicitudes/upd-solicitud-cotizacion/upd-solicitud-cotizacion.component';
import { InsSolicitudPrefacturaComponent } from './solicitudes/solicitud-prefactura/ins-solicitud-prefactura.component';
import { SelSolicitudesComponent } from './solicitudes/sel-solicitudes/sel-solicitudes.component';
import { InsObjetoSustitutoComponent } from './objeto/ins-objeto-sustituto/ins-objeto-sustituto.component';

import { GpsComponent } from './gps/gps.component';
import { SelPartidaReporteComponent } from './reportes/partidas/sel-partida-reporte/sel-partida-reporte.component';
import { SelContratoReporteComponent } from './reportes/contrato-reporte/sel-contrato-reporte/sel-contrato-reporte.component';
import { InsContratoReporteComponent } from './reportes/contrato-reporte/ins-contrato-reporte/ins-contrato-reporte.component';
import { ReporteControlDocumentalComponent } from './reportes/objeto/reporte-control-documental/reporte-control-documental.component';


const routes: Routes = [
  { path: '', component: PanelComponent, canActivate: [AuthGuardService] },
  { path: 'home', component: PanelComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'home-cliente', component: VentasComponent, canActivate: [AuthGuardService] },
  { path: 'upd-password/:token', component: UpdPasswordComponent },

  /**
   * RUTAS PROVEEDOR
   */
  { path: 'home-proveedor', component: HomeProveedorComponent, canActivate: [AuthGuardService] },
  { path: 'sel-proveedor', component: SelProveedorComponent, canActivate: [AuthGuardService] },
  { path: 'upd-proveedor/:rfcProveedor', component: UpdProveedorComponent, canActivate: [AuthGuardService] },
  { path: 'ins-proveedor', component: InsProveedorComponent, canActivate: [AuthGuardService] },
  { path: 'ins-proveedor-entidad/:rfcProveedor', component: InsProveedorEntidadComponent, canActivate: [AuthGuardService] },
  { path: 'upd-proveedor-entidad/:idProveedorEntidad', component: UpdProveedorEntidadComponent, canActivate: [AuthGuardService] },
  { path: 'sel-proveedor-propio', component: SelProveedorPropioComponent, canActivate: [AuthGuardService] },
  { path: 'ins-proveedor-propio', component: InsProveedorPropioComponent, canActivate: [AuthGuardService] },
  { path: 'upd-proveedor-propio/:rfcProveedor', component: UpdProveedorPropioComponent, canActivate: [AuthGuardService] },
  { path: 'ins-proveedor-propio-entidad/:rfcProveedor', component: InsProveedorPropioEntidadComponent, canActivate: [AuthGuardService] },
  { path: 'upd-proveedor-propio-entidad/:idProveedorEntidad', component: UpdProveedorPropioEntidadComponent, canActivate: [AuthGuardService] },
  { path: 'sel-proveedor-partida/:rfcProveedor', component: SelProveedorPartidaComponent, canActivate: [AuthGuardService] },
  { path: 'ins-partida-proveedor-costo-masivo/:rfcProveedor/:idTipoObjeto', component: InsPartidaProveedorCostoMasivoComponent, canActivate: [AuthGuardService] },

  /**
   * RUTAS REPORTES
   */
  { path: 'home-reporte', component: HomeReporteComponent, canActivate: [AuthGuardService] },
  { path: 'sel-reporte-integra-autoexpress', component: SelReporteIntegraAutoexpressComponent, canActivate: [AuthGuardService] },
  { path: 'sel-reporte-integra-autoexpress-gasto/:idTipoGasto', component: SelReporteIntegraAutoexpressGastoComponent, canActivate: [AuthGuardService] },
  { path: 'sel-reporte-contrato', component: SelContratoReporteComponent, canActivate: [AuthGuardService] },

  // REPORTES DE OBJETOS
  { path: 'sel-reporte-control-documental', component: ReporteControlDocumentalComponent, canActivate: [AuthGuardService] },


  // { path: 'ins-reporte-contrato', component: InsContratoReporteComponent, canActivate: [AuthGuardService] },
  { path: 'sel-reporte-integra-autoexpress-kilometraje-gps', component: SelReporteIntegraAutoexpressKilometrajeGpsComponent, canActivate: [AuthGuardService] },
  { path: 'ins-reporte-integra-autoexpress-kilometraje-gps/:idContrato', component: InsReporteIntegraAutoexpressKilometrajeGpsComponent, canActivate: [AuthGuardService] },
  { path: 'sel-solicitud-reporte', component: SelSolicitudReporteComponent },
  { path: 'sel-clientes', component: ClientesComponent, canActivate: [AuthGuardService] },
  { path: 'ins-cliente', component: AddClienteComponent, canActivate: [AuthGuardService] },
  { path: 'upd-cliente/:idCliente', component: EditClienteComponent, canActivate: [AuthGuardService] },
  { path: 'upd-clienteEntidad/:rfcClienteEntidad/:idCliente2', component: AddClienteComponent, canActivate: [AuthGuardService] },
  { path: 'ins-clienteEntidad/:idCliente', component: AddClienteComponent, canActivate: [AuthGuardService] },
  { path: 'ins-documento/:idCliente', component: AddDoctoComponent, canActivate: [AuthGuardService] },
  { path: 'ins-proveedor-entidad/:rfcProveedor', component: InsProveedorEntidadComponent },
  { path: 'sel-partida-reporte', component: SelPartidaReporteComponent, canActivate: [AuthGuardService] },

  /**
   * RUTAS PARTIDA
   */
  { path: 'home-partida', component: HomePartidaComponent, canActivate: [AuthGuardService] },
  { path: 'sel-tipoobjeto', component: SelTipoObjetoComponent, canActivate: [AuthGuardService] },
  { path: 'ins-tipoobjeto', component: InsTipoObjetoComponent, canActivate: [AuthGuardService] },
  { path: 'upd-tipoobjeto/:idTipoObjeto', component: UpdTipoobjetoComponent, canActivate: [AuthGuardService] },
  { path: 'sel-partida/:idTipoObjeto', component: SelPartidaComponent, canActivate: [AuthGuardService] },
  { path: 'ins-partida/:idTipoObjeto', component: InsPartidaComponent, canActivate: [AuthGuardService] },
  { path: 'upd-partida/:idTipoObjeto/:idPartida', component: UpdPartidaComponent, canActivate: [AuthGuardService] },
  { path: 'ins-partida-masiva/:idTipoObjeto', component: InsPartidaMasivaComponent, canActivate: [AuthGuardService] },
  { path: 'sel-partida-propia/:idTipoObjeto', component: SelPartidaPropiaComponent, canActivate: [AuthGuardService] },
  { path: 'ins-partida-propia/:idTipoObjeto', component: InsPartidaPropiaComponent, canActivate: [AuthGuardService] },
  { path: 'upd-partida-propia/:idTipoObjeto/:idPartida', component: UpdPartidaPropiaComponent, canActivate: [AuthGuardService] },
  { path: 'ins-partida-propia-masiva/:idTipoObjeto', component: InsPartidaPropiaMasivaComponent, canActivate: [AuthGuardService] },
  { path: 'clonar-partida/:idTipoObjeto', component: ClonarPartidaComponent, canActivate: [AuthGuardService] },
  { path: 'ins-partida-costo-masiva/:idTipoObjeto', component: InsPartidaCostoMasivaComponent, canActivate: [AuthGuardService] },

  { path: 'home-objeto', component: ObjetoComponent },
  { path: 'sel-objeto', component: SelObjetoComponent },
  { path: 'upd-objeto/:idObjeto/:idTipoObjeto', component: UpdObjetoComponent },
  { path: 'sel-objeto-documento/:idObjeto/:idTipoObjeto', component: ObjetoDocumentoComponent },
  { path: 'ins-objeto-carga-masiva', component: ObjetoCargaMasivaComponent },
  { path: 'sel-operador', component: OperadorComponent },
  { path: 'upd-operador/:idOperador', component: UpdOperadorComponent },
  { path: 'ins-operador', component: InsOperadorComponent },
  { path: 'asignar-operador/:idObjeto/:idTipoObjeto', component: AsignarOperadorComponent },
  { path: 'asignar-objeto/:idOperador', component: AsignarObjetoComponent },
  { path: 'ins-objeto-sustituto/:idObjeto/:idTipoObjeto/:rfcEmpresa/:idCliente/:numeroContrato/:numeroOrden', component: InsObjetoSustitutoComponent, canActivate: [AuthGuardService] },

  { path: 'ins-contrato', component: InsContratoComponent },
  { path: 'sel-contratos', component: SelContratosComponent },
  { path: 'upd-contrato/:rfcEmpresa/:numeroContrato/:idCliente', component: UpdContratoComponent },
  { path: 'sel-ordenes-compra', component: SelOrdenesCompraComponent },
  { path: 'ins-orden-compra/:rfcEmpresa/:idCliente/:numeroContrato', component: InsOrdenCompraComponent },
  { path: 'upd-orden-compra/:rfcEmpresa/:idCliente/:numeroContrato/:idOrden', component: UpdOrdenCompraComponent },
  { path: 'conf-equipamiento-contrato/:rfcEmpresa/:numeroContrato/:idCliente', component: EquipamientoContratoComponent },
  { path: 'ins-proveedor-equipamiento/:rfcEmpresa/:numeroContrato/:idCliente', component: InsProvedorEquipamientoComponent },
  { path: 'upd-proveedor-equipamiento/:rfcEmpresa/:numeroContrato/:idCliente/:idActividad', component: UpdProveedorEquipamientoComponent },
  { path: 'ins-spec/:rfcEmpresa/:numeroContrato/:idCliente', component: InsSpecComponent },
  { path: 'upd-spec/:rfcEmpresa/:numeroContrato/:idCliente/:id', component: UpdSpecComponent },
  { path: 'sel-equipamiento-contrato/:rfcEmpresa/:numeroContrato/:idCliente', component: EquipamientoComponent },
  { path: 'sel-ficha-tecnica/:idObjeto/:idTipoObjeto/:rfcEmpresa/:idCliente/:numeroContrato', component: SelFichaTecnicaComponent },

  { path: 'upd-zonas', component: ZonasComponent, canActivate: [AuthGuardService] },
  { path: 'ins-contrato-nivel', component: InsContratoNivelComponent, canActivate: [AuthGuardService] },
  { path: 'upd-contrato-nivel/:idContratoNivel', component: UpdContratoNivelComponent, canActivate: [AuthGuardService] },

  /**
   * Centros de Costo
   */
  { path: 'sel-centro-costos/:rfcEmpresa/:idCliente/:numeroContrato', component: SelCentroCostoComponent },
  { path: 'ins-centro-costo/:rfcEmpresa/:idCliente/:numeroContrato', component: InsCentroCostoComponent },
  { path: 'upd-centro-costo/:rfcEmpresa/:idCliente/:numeroContrato/:idCentroCosto', component: UpdCentroCostoComponent },
  { path: 'ins-precios-venta-carga-masiva/:rfcEmpresa/:idCliente/:numeroContrato/:idTipoObjeto', component: PreciosVentaCargaMasivaComponent },

  /** 
   * RUTAS COMISIONES
   */
  { path: 'home-comisiones', component: HomeComisionesComponent },
  { path: 'sel-comisiones-externos/:idUsuarioComision', component: ComisionesExternosComponent },
  { path: 'sel-comisiones-internos/:idUsuarioComision', component: ComisionesInternosComponent },
  { path: 'sel-comisiones-disponibles-externos/:idUsuarioComision', component: SelComisionesDisponiblesExternosComponent },
  { path: 'sel-comisiones-disponibles-internos/:idUsuarioComision', component: SelComisionesDisponiblesInternosComponent },
  { path: 'sel-disposicion/:idUsuarioComision', component: SelDisposicionComponent },

  { path: 'ins-unidad-contrato/:rfcEmpresa/:idCliente/:numeroContrato', component: InsUnidadContratoComponent },
  { path: 'upd-unidad-contrato/:rfcEmpresa/:idCliente/:numeroContrato/:idTipoObjeto', component: UpdUnidadContratoComponent },

  /** RUTAS GASTOS */
  { path: 'home-gastos', component: HomeGastosComponent, canActivate: [AuthGuardService] },
  { path: 'sel-gestoria', component: SelGestoriaComponent, canActivate: [AuthGuardService] },
  { path: 'sel-agrupador-tipoobjeto', component: AgrupadorTipoobjetoComponent, canActivate: [AuthGuardService] },
  { path: 'ins-agrupador-tipoobjeto', component: InsAgrupadorTipoobjetoComponent, canActivate: [AuthGuardService] },
  { path: 'upd-agrupador-tipoobjeto/:idCostoAgrupador', component: UpdAgrupadorTipoobjetoComponent, canActivate: [AuthGuardService] },
  { path: 'ins-gasto', component: InsGastoComponent, canActivate: [AuthGuardService] },
  { path: 'sel-pago/:idEstado/:anoFiscal/:idResponsable/:otrosGastos', component: SolicitudPagoComponent, canActivate: [AuthGuardService] },

  // ruta notificaciones
  // { path: 'panelNotificaciones', component: PanelNotificacionComponent },
  { path: 'panelTareas', component: PanelTareaComponent },
  { path: 'notificacion', loadChildren: './notificaciones/notificacion/notificacion.module#NotificacionModule' },
  { path: 'panel-notificacion', loadChildren: './notificaciones/panel-notificacion/panel-notificacion.module#PanelNotificacionModule' },
  { path: 'chat', loadChildren: './profile/chat/chat.module#ChatModule' },
  { path: 'tarea', loadChildren: './notificaciones/tarea/tarea.module#TareaModule' },
  { path: 'ins-tarea', component: InsTareaComponent },
  { path: 'visor-tarea/:idTarea', component: VisorTareaComponent },

  // Profile
  { path: 'user-profile/:tab', component: UserProfileComponent },

  /**
   * RUTAS SOLICITUDES
   */
  { path: 'home-solicitudes', component: HomeSolicitudComponent },
  { path: 'ins-solicitud', component: InsSolicitudComponent },
  { path: 'ins-solicitud/:idObjeto/:idTipoObjeto/:idClase/:idCliente/:rfcEmpresa/:numeroContrato', component: InsSolicitudComponent },
  { path: 'sel-solicitud', component: SelSolicitudComponent },
  { path: 'sel-solicitudes/:idSolicitud/:idTipoSolicitud/:idClase/:rfcEmpresa/:idCliente/:numeroContrato', component: SelSolicitudesComponent, canActivate: [AuthGuardService] },
  { path: 'ins-proveedor-solicitud/:numeroSolicitud/:idTipoSolicitud/:idClase/:rfcEmpresa/:idCliente/:numeroContrato', component: InsProveedorSolicitudComponent },
  { path: 'ins-solicitud-factura/:rfcProveedor', component: InsSolicitudFacturaComponent },
  { path: 'ins-solicitud-factura', component: InsSolicitudFacturaComponent },
  { path: 'aut-partidas', component: AuthPartidasComponent },
  { path: 'ins-comprobante-recepcion', component: InsComprobanteRecepcionComponent },
  { path: 'upd-solicitud-cotizacion/:idSolicitud/:idTipoSolicitud/:idClase/:rfcEmpresa/:idCliente/:numeroContrato', component: UpdSolicitudCotizacionComponent },
  { path: 'ins-solicitud-cotizacion/:idSolicitud/:idTipoSolicitud/:idClase/:rfcEmpresa/:idCliente/:numeroContrato', component: InsSolicitudCotizacionComponent },
  { path: 'encuesta/:idTipoSolicitud/:idSolicitud/:rfcEmpresa/:idCliente/:numeroContrato', component: ContestaEncuestaComponent },
  /**
   * RUTAS MANTENIMIENTO
   */
  { path: 'home-mantenimiento', component: HomeMantenimientoComponent },
  { path: 'sel-solicitud-paso/:token', component: SelSolicitudPasoComponent, canActivate: [AuthGuardService] },
  { path: 'ins-solicitud-prefactura', component: InsSolicitudPrefacturaComponent, canActivate: [AuthGuardService] },

  { path: 'home-gps', component: GpsComponent },


  { path: '**', component: PanelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
