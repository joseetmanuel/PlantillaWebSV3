import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import { NgxIndexedDB } from 'ngx-indexed-db';
import { Store } from '@ngrx/store';
import { FuncionesGlobales } from '../../utilerias/clases/funcionesGlobales';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { AuthActionTypes, LogIn, LogInSuccess, LogInFailure, LogOut } from '../actions/auth.actions';
import { AsignaPermisos, EliminaPermisos } from '../actions/permisos.actions';
import { AsignaContratos, EliminaContratos } from '../actions/contrato.actions';
import { AppState, selectPermisosState } from '../app.states';
import { SiscoV3Service } from '../../services/siscov3.service';
import { SessionInitializer } from '../../services/session-initializer';
import { TokenService } from '../../services/token.service';
import { MessagingService } from '../../services/messaging.service';

@Injectable()
export class AuthEffects {

    private db: NgxIndexedDB;
    permisosState: Observable<any>;

    /**
     * @description             Constructor de clase
     * @param actions           Acciones NgRX
     * @param authService       Servicio de autenticación seguridad V2
     * @param router            Modulo de routeo
     * @param store             Stire NgRX
     * @param siscoV3Service    Servicio de conexión backend
     */
    constructor(
        private actions: Actions,
        private authService: AuthService,
        private router: Router,
        private store: Store<AppState>,
        private siscoV3Service: SiscoV3Service,
        public sessionInitializer: SessionInitializer,
        public tokenService: TokenService,
        private messagingService: MessagingService
    ) {
        this.db = new NgxIndexedDB('SISCO', 1);
        this.store.select(selectPermisosState);
    }

    /**
     * @description         Efecto NgRX para el reducer de Login
     * @author              Alan Rosales Chávez
     */
    @Effect()
    LogIn: Observable<any> = this.actions
        .ofType(AuthActionTypes.LOGIN)
        .map((action: LogIn) => action.payload)
        .switchMap(payload => {
            return this.authService.Login(payload.email, payload.password)
                .map((data) => {
                    return new LogInSuccess({ seguridad: data.data });
                })
                .catch((error) => {
                    return Observable.of(new LogInFailure({ error: error.message }));
                });
        });

    /**
     * @description         Efecto NgRX para el reducer de LoginSuccess
     * @author              Alan Rosales Chávez
     */
    @Effect({ dispatch: false })
    LogInSuccess: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOGIN_SUCCESS),
        tap((user: any) => {
            this.db.openDatabase(1, evt => {
                const objectStore = evt.currentTarget.result.createObjectStore('seguridad', { keyPath: 'Id', autoIncrement: false });
                objectStore.transaction.oncomplete = function () {
                    this.db.transaction('seguridad', 'readwrite').objectStore('seguridad');
                };
            }).then(() => {
                this.suscribreFirebase(user.payload.seguridad.user.id);
                this.db.getByKey('seguridad', 1).then(result => {
                    this.store.dispatch(new AsignaPermisos({ modulos: FuncionesGlobales.GetRecursividad(user.payload.seguridad.permissions.modules) }));
                    this.tokenService.setToken(user.payload.seguridad.security.token);
                    this.siscoV3Service.getService(`common/GetDataSession`).toPromise().then((res: any) => {
                        const claseActual = res.recordsets.clases.length > 0
                            ? res.recordsets.clases.filter(cl => cl === `Automovil`).length > 0
                                ? res.recordsets.clases.filter(cl => cl === `Automovil`)[0]
                                : res.recordsets.clases[0]
                            : `Automovil`;
                        const contratosxClase = res.recordsets.contratos.filter(c => c.idClase === claseActual)
                        const contratosSel = contratosxClase.map(cxc => { return { ...cxc, seleccionadoCheck: true } });
                        this.store.dispatch(new AsignaContratos({
                            contratos: res.recordsets.contratos,
                            gerencia: res.recordsets.gerencias,
                            estados: res.recordsets.estados,
                            contratosPorClase: contratosxClase,
                            contratosSeleccionados: contratosSel,
                            contratoActual: null,
                            clases: res.recordsets.clases,
                            claseActual
                        }));
                        if (result === undefined) {
                            this.db.add('seguridad', {
                                Id: 1,
                                seguridad: user.payload.seguridad,
                                idClase: claseActual,
                                contratosSeleccionados: contratosSel.length > 0 ? contratosSel : [],
                                contratoActual: null
                            });
                        } else {
                            this.db.update('seguridad', {
                                Id: 1,
                                seguridad: user.payload.seguridad,
                                idClase: claseActual,
                                contratosSeleccionados: contratosSel,
                                contratoActual: null
                            });
                        }
                        this.sessionInitializer.state = true;
                        this.router.navigate(['']);
                    }).catch(error => {
                        this.store.dispatch(new EliminaPermisos());
                        this.store.dispatch(new EliminaContratos());
                        this.store.dispatch(new LogOut());
                    })
                });
            }).catch((error) => {
                this.store.dispatch(new EliminaPermisos());
                this.store.dispatch(new EliminaContratos());
                this.store.dispatch(new LogOut());
            });
        })
    );

    /**
     * @description         Efecto NgRX para el reducer de LoginFailure
     * @author              Alan Rosales Chávez
     */
    @Effect({ dispatch: false })
    LogInFailure: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOGIN_FAILURE)
    );
    /**
     * @description         Efecto NgRX para el reducer de LogOut
     * @author              Alan Rosales Chávez
     */
    @Effect({ dispatch: false })
    public LogOut: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOGOUT),
        tap(async () => {
            await this.db.openDatabase(1).then(async () => {
                await this.db.clear('seguridad');
                this.sessionInitializer.state = false;
                this.router.navigate(['login']);
            });
        })
    );

    private suscribreFirebase(userId) {
        this.messagingService.requestPermission(userId);
    }
}
