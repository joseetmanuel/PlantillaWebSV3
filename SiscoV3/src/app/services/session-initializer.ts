import { Injectable } from '@angular/core';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NgxIndexedDB } from 'ngx-indexed-db';
import { defer } from 'q';
import { FuncionesGlobales } from '../utilerias/clases/funcionesGlobales';
import { SiscoV3Service } from '../services/siscov3.service';
import { LogOut, SetAuth } from '../store/actions/auth.actions';
import { EliminaPermisos, AsignaPermisos } from '../store/actions/permisos.actions';
import { EliminaContratos, AsignaContratos } from '../store/actions/contrato.actions';
import { TokenService } from './token.service';

@Injectable()
export class SessionInitializer {
    state = false;
    indexedDB: NgxIndexedDB;
    getState: Observable<any>;
    getStatePermisos: Observable<any>;
    getStateContratos: Observable<any>;

    constructor(private store: Store<AppState>, private siscoV3Service: SiscoV3Service, public tokenService: TokenService) {
        this.getState = this.store.select(selectAuthState);
        this.getStatePermisos = this.store.select(selectPermisosState);
        this.getStateContratos = this.store.select(selectContratoState);
        this.indexedDB = new NgxIndexedDB('SISCO', 1);
        this.createOBS();
    }

    private createOBS() {
        this.indexedDB.openDatabase(1, (evt: any) => {
            const objectStore = evt.currentTarget.result.createObjectStore('seguridad', { keyPath: 'Id', autoIncrement: false });
            objectStore.transaction.oncomplete = function () {
                const sec = this.db.transaction('seguridad', 'readwrite').objectStore('seguridad');
            };
        });
    }

    public getStateSession(): any {
        return this.state;
    }

    public setStateLogOut(): any {
        this.store.dispatch(new LogOut());
        this.store.dispatch(new EliminaPermisos());
        this.store.dispatch(new EliminaContratos());
    }

    async validateLogin(): Promise<boolean> {
        const deferred = defer<boolean>();
        const resp = await this.validateIndexed();
        if (resp.autenticado) {
            this.state = await this.generateState(resp.payload);
            deferred.resolve(this.state);
        } else {
            deferred.resolve(false);
        }
        return deferred.promise;
    }

    private async validateIndexed(): Promise<any> {
        const deferred = defer<any>();
        this.indexedDB.openDatabase(1).then(async res => {
            await this.indexedDB.getByKey('seguridad', 1).then(async resultado => {
                if (resultado && resultado.seguridad) {
                    deferred.resolve({
                        autenticado: true,
                        error: '',
                        payload: resultado
                    });
                } else {
                    deferred.resolve({
                        autenticado: false,
                        error: '',
                        payload: null
                    });
                }
            }).catch(async (reason) => {
                deferred.resolve({
                    autenticado: false,
                    error: JSON.stringify(reason),
                    payload: null
                });
            });
        });
        return deferred.promise;
    }

    private async generateState(resp): Promise<boolean> {
        const deferred = defer<boolean>();
        const payload = { autenticado: true, error: '', seguridad: resp.seguridad };
        this.store.dispatch(new SetAuth(payload));
        this.store.dispatch(new AsignaPermisos({
            modulos: FuncionesGlobales.GetRecursividad(payload.seguridad.permissions.modules)
        }));
        this.tokenService.setToken(payload.seguridad.security.token);
        this.siscoV3Service.getService(`common/GetDataSession`).toPromise().then((res: any) => {
            const contratosxClase = res.recordsets.contratos.filter(c => c.idClase === resp.idClase)
            this.store.dispatch(new AsignaContratos({
                contratos: res.recordsets.contratos,
                gerencia: res.recordsets.gerencias,
                estados: res.recordsets.estados,
                contratosPorClase: contratosxClase,
                contratosSeleccionados: contratosxClase, //.filter(cs => cs.seleccionadoCheck),
                contratoActual: null,
                clases: res.recordsets.clases,
                claseActual: resp.idClase
            }));
            deferred.resolve(true);
        }).catch(error => {
            deferred.resolve(false);
        });
        return deferred.promise;
    }
}
