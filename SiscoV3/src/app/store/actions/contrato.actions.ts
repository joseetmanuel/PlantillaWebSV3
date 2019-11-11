import { Action } from '@ngrx/store';

/**
 * Tipos de Acción para el Store de Contrato
 */
export enum ContratoActionTypes {
    AsignaContratos = '[Contrato] AsignaContratos',
    EliminaContratos = '[Contrato] EliminaContratos',
    SeleccionarClase = '[Clase] SeleccionarClase',
    SeleccionarContratoActual = '[Contrato] Asigna Contrato Unico',
    SeleccionarContratos = '[Contrato] Asigna Contratos',
    SeleccionarSolicitudes = '[Solicitudes] Seleccionar Solicitudes',
    SeleccionarSolicitudActual = '[Solicitudes] Seleccionar Solicitud Actual',
    LimpiaSeleccionarSolicitudes = '[Solicitudes] LimpiarSeleccionarSolicitudes'
}

export class AsignaContratos implements Action {
    readonly type = ContratoActionTypes.AsignaContratos;
    constructor(public payload: any) { }
}

export class EliminaContratos implements Action {
    readonly type = ContratoActionTypes.EliminaContratos;
}

export class SeleccionarClase implements Action {
    readonly type = ContratoActionTypes.SeleccionarClase;
    constructor(public payload: any) { }
}

export class SeleccionarContratos implements Action {
    readonly type = ContratoActionTypes.SeleccionarContratos;
    constructor(public payload: any) {
    }
}

export class SeleccionarContratoActual implements Action {
    readonly type = ContratoActionTypes.SeleccionarContratoActual;
    constructor(public payload: any) {
    }
}

export class SeleccionarSolicitudes implements Action {
    readonly type = ContratoActionTypes.SeleccionarSolicitudes;
    constructor(public payload: any) {
    }
}

export class SeleccionarSolicitudActual implements Action {
    readonly type = ContratoActionTypes.SeleccionarSolicitudActual;
    constructor(public payload: any) {
    }
}

export class LimpiaSeleccionarSolicitudes implements Action {
    readonly type = ContratoActionTypes.LimpiaSeleccionarSolicitudes;
    constructor() { }
}

export type All =
    AsignaContratos
    | EliminaContratos
    | SeleccionarClase
    | SeleccionarContratos
    | SeleccionarContratoActual
    | SeleccionarSolicitudes
    | SeleccionarSolicitudActual
    | LimpiaSeleccionarSolicitudes;
