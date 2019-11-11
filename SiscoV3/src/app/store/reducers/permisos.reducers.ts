import { All, PermisosActionTypes } from '../actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';

export interface State {
    modulos: any | null | {};
    error: string | null;
    footer: FooterConfiguracion | null;
}

export const initialState: State = {
    modulos: null,
    error: null,
    footer: null
};

export function Reducer(state = initialState, action: All): State {
    switch (action.type) {
        case PermisosActionTypes.AsignaPermisos:
            return {
                ...state,
                error: null,
                modulos: action.payload.modulos
            };
        case PermisosActionTypes.CambiaConfiguracionFooter:
            return {
                ...state,
                footer: action.payload
            };
        case PermisosActionTypes.EliminaPermisos:
            return initialState;
        case PermisosActionTypes.ReseteaFooter:
            return {
                ...state,
                footer: new FooterConfiguracion(ContratoMantenimientoEstatus.todos, false, true, false, false)
            };
        default:
            return state;
    }
}
