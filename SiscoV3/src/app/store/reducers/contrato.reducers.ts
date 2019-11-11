import { All, ContratoActionTypes } from '../actions/contrato.actions';
import { SolicitudPagoComponent } from 'src/app/gastos/solicitud-pago/solicitud-pago.component';

export interface State {
    contratos: any | null;
    gerencia: any | null;
    estados: any | null;
    contratosPorClase: any | null;
    contratosSeleccionados: any;
    clases: any | null;
    claseActual: string;
    contratoActual: any | null;
    solicitudesSeleccionadas: any | null;
    solicitudActual: any | null;
    error: string | null;

}

export const initialState: State = {
    contratos: null,
    gerencia: null,
    estados: null,
    contratosPorClase: null,
    contratosSeleccionados: null,
    clases: null,
    claseActual: null,
    contratoActual: null,
    solicitudesSeleccionadas: null,
    solicitudActual: null,
    error: null
};

export function Reducer(state = initialState, action: All): State {
    switch (action.type) {
        case ContratoActionTypes.AsignaContratos:
            return {
                ...state,
                error: null,
                contratos: action.payload.contratos,
                gerencia: action.payload.gerencia,
                estados: action.payload.estados,
                contratosPorClase: action.payload.contratosPorClase,
                contratosSeleccionados: action.payload.contratosSeleccionados,
                clases: action.payload.clases,
                claseActual: action.payload.claseActual,
                contratoActual: action.payload.contratoActual
            };
        case ContratoActionTypes.EliminaContratos:
            return initialState;
        case ContratoActionTypes.SeleccionarClase:
            return {
                ...state,
                claseActual: action.payload.claseActual,
                contratosPorClase: action.payload.contratosPorClase
            };
        case ContratoActionTypes.SeleccionarContratoActual:
            return {
                ...state,
                contratoActual: action.payload.contratoActual
            };
        case ContratoActionTypes.SeleccionarContratos:
            return {
                ...state,
                contratosSeleccionados: action.payload.contratosSeleccionados
            };
        case ContratoActionTypes.SeleccionarSolicitudes:
            return {
                ...state,
                solicitudesSeleccionadas: action.payload.solicitudesSeleccionadas
            };
        case ContratoActionTypes.SeleccionarSolicitudActual:
            return {
                ...state,
                solicitudActual: action.payload.solicitudActual
            };
        case ContratoActionTypes.LimpiaSeleccionarSolicitudes:
            return {
                ...state,
                solicitudActual: null,
                solicitudesSeleccionadas: null
            }
        default:
            return state;
    }
}
