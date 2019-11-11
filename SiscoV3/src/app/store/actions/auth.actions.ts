import { Action } from '@ngrx/store';

/**
 * Tipos de Acción para el Store de Autenticación
 */
export enum AuthActionTypes {
    LOGIN = '[Auth] Login',
    LOGIN_SUCCESS = '[Auth] Login Success',
    LOGIN_FAILURE = '[Auth] Login Failure',
    LOGOUT = '[Auth] Logout',
    SET_AUTH = '[Auth] Set Login',
    UPDATE_DATA = 'Update User Data'
}

export class LogIn implements Action {
    readonly type = AuthActionTypes.LOGIN;
    constructor(public payload: any) { }
}

export class LogInSuccess implements Action {
    readonly type = AuthActionTypes.LOGIN_SUCCESS;
    constructor(public payload: any) { }
}

export class LogInFailure implements Action {
    readonly type = AuthActionTypes.LOGIN_FAILURE;
    constructor(public payload: any) { }
}

export class LogOut implements Action {
    readonly type = AuthActionTypes.LOGOUT;
}

export class SetAuth implements Action {
    readonly type = AuthActionTypes.SET_AUTH;
    constructor(public payload: any) {}
}

export class UpdateData implements Action {
    readonly type = AuthActionTypes.UPDATE_DATA;
    constructor(public payload: any) { }
}

export type All =
    | LogIn
    | LogInSuccess
    | LogInFailure
    | LogOut
    | UpdateData
    | SetAuth;
