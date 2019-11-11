import { Action } from '@ngrx/store';
import { FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';

/**
 * Tipos de Acción para el Store de Permisos
 */
export enum PermisosActionTypes {
    AsignaPermisos = '[Permisos] Asigna Permisos',
    EliminaPermisos = '[Permisos] Elimina Permisos',
    CambiaConfiguracionFooter = '[Configura] Configura la forma de desplegar la selección de contratos',
    ReseteaFooter = '[Configura] Resetea la configuración del footer'
}

export class AsignaPermisos implements Action {
    readonly type = PermisosActionTypes.AsignaPermisos;
    constructor(public payload: any) { }
}

export class EliminaPermisos implements Action {
    readonly type = PermisosActionTypes.EliminaPermisos;
}

export class CambiaConfiguracionFooter implements Action {
    readonly type = PermisosActionTypes.CambiaConfiguracionFooter;
    constructor(public payload: FooterConfiguracion) { }
}

export class ReseteaFooter implements Action {
    readonly type = PermisosActionTypes.ReseteaFooter;
}

export type All =
    AsignaPermisos
    | EliminaPermisos
    | CambiaConfiguracionFooter
    | ReseteaFooter;

