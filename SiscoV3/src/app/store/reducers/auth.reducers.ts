import { AuthActionTypes, All } from '../actions/auth.actions';


export interface State {
    autenticado: boolean;
    seguridad: any | null;
    error: string | null;
}

export const initialState: State = {
    autenticado: false,
    seguridad: null,
    error: null
};

export function authReducer(state = initialState, action: All): State {
    switch (action.type) {
        case AuthActionTypes.LOGIN_SUCCESS: {
            return {
                ...state,
                autenticado: true,
                seguridad: action.payload.seguridad,
                error: null
            };
        }
        case AuthActionTypes.LOGIN_FAILURE: {
            return {
                ...state,
                error: 'Usuario y/o contraseña incorrectos.'
            };
        }
        case AuthActionTypes.LOGOUT: {
            return initialState;
        }
        case AuthActionTypes.SET_AUTH: {
            return {
                ...state,
                autenticado: true,
                seguridad: action.payload.seguridad,
                error: null
            };
        }
        case AuthActionTypes.UPDATE_DATA: {
            return {
                ...state,
                seguridad: action.payload,
                error: null
            }
        }
        default: {
            return state;
        }
    }
}
