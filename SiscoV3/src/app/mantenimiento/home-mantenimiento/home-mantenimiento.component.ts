import { Component, OnInit, OnDestroy } from '@angular/core';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CambiaConfiguracionFooter, ReseteaFooter, } from 'src/app/store/actions/permisos.actions';
import { SeleccionarSolicitudActual, SeleccionarSolicitudes, SeleccionarContratoActual } from 'src/app/store/actions/contrato.actions';
import { Negocio } from '../../models/negocio.model';
import { SiscoV3Service } from '../../services/siscov3.service';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-home-mantenimiento',
    templateUrl: './home-mantenimiento.component.html',
    styleUrls: ['./home-mantenimiento.component.scss']
})

export class HomeMantenimientoComponent implements OnInit, OnDestroy {
    claveModulo = 'app-home-mantenimiento';
    idClase: string;
    modulo: any = {};
    getStateAutenticacion: Observable<any>;
    getStateNegocio: Observable<any>;
    spinner = false;
    idUsuario: number;
    fases: any;
    pasos: any;
    contratosSeleccionados = '';
    idClientes: any;
    zonas: any;
    treeBoxValue: string;
    idZona = 0;
    activaZona = false;
    _contratosSeleccionados = [];
    _contratosPorClase = [];
    pintaGrafica = false;
    breadcrumb: any;
    subsNegocio: Subscription;
    switch = 0;
    switchCosto = false;
    switchVenta = false;
    label: string;
    number: number;
    paso: any;
    pasoactive: boolean;
    barChartOptions = {
        responsive: true,
        cutoutPercentage: 80,
        tooltips: {
            mode: 'nearest',
            intersect: true,
            backgroundColor: 'rgb(0,0,0)'
        }
    };

    token = {
        filtros:
        {
            idTipoObjeto: 0,
            idObjeto: 0,
            idFase: 'null',
            idPaso: 'null',
            idZona: 0
        },
        titulo: '',
        color: ''
    }


    constructor(private siscoV3Service: SiscoV3Service,
        public dialog: MatDialog,
        private router: Router,
        private store: Store<AppState>) {
        this.getStateAutenticacion = this.store.select(selectAuthState);
        this.getStateNegocio = this.store.select(selectContratoState);

    }

    ngOnInit() {
        this.getStateAutenticacion.subscribe((stateAutenticacion) => {
            this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {

                if (
                    (
                        this._contratosPorClase.length !== stateNegocio.contratosPorClase.length &&
                        this._contratosPorClase.every((v, i) => {
                            return v !== stateNegocio[i];
                        })
                    )
                    ||
                    (
                        this._contratosSeleccionados.length !== stateNegocio.contratosSeleccionados.length &&
                        this._contratosSeleccionados.every((v, i) => {
                            return v !== stateNegocio[i];
                        })
                    )

                ) {

                    this._contratosPorClase = stateNegocio.contratosPorClase;
                    this._contratosSeleccionados = stateNegocio.contratosSeleccionados;

                    this.previewLoadData(stateAutenticacion.seguridad.user.id, stateNegocio.claseActual,
                        stateAutenticacion.seguridad.permissions.modules, stateNegocio.contratoActual,
                        this._contratosSeleccionados,
                        this._contratosPorClase);
                    this.LoadData();
                }
            });
        });
    }

    previewLoadData(idUser, claseActual, modulos, contratoActual, contratosSeleccionados, contratosPorClase) {
        this.idUsuario = idUser;
        this.idClase = claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, modulos, this.idClase);

        if (this.modulo.camposClase.find(x => x.nombre === 'switchCosto')) {
            this.switchCosto = true;
            this.switch = 1;
        }

        if (this.modulo.camposClase.find(x => x.nombre === 'switchVenta')) {
            this.switchVenta = true;
            if (this.switch === 0) {
                this.switch = 2;
            }
        }

        if (this.modulo.breadcrumb) {
            this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

        if (contratosSeleccionados.length > 0) {
            this.ConfigurarFooter(false);

            this.contratosSeleccionados = '';
            let cadena = '';


            contratosSeleccionados.forEach(element => {
                element.zonas.forEach(e => {
                    cadena +=
                        '<contrato>' +
                        '<numeroContrato>' + element.numeroContrato + '</numeroContrato>' +
                        '<idCliente>' + element.idCliente + '</idCliente>' +
                        '<rfcEmpresa>' + element.rfcEmpresa + '</rfcEmpresa>' +
                        '<estado>' + e.estado + '</estado>' +
                        '</contrato>';
                })
            });
            this.contratosSeleccionados = '<contratos>' + cadena + '</contratos>';
            if (contratosSeleccionados.length === 1) {
                this.activaZona = true;
                this.TreeZonas();
            }
        } else {
            this.ConfigurarFooter(true);
        }

    }

    ConfigurarFooter(abrir: boolean) {
        this.store.dispatch(new CambiaConfiguracionFooter(
            new FooterConfiguracion(
                ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, false)));
    }

    /**
     * @description  Carga listado de zonas para mostrar en árbol
     * @returns Listado de zonas
     * @author Edgar Mendoza Gómez
     */

    TreeZonas() {
        try {
            const data = {
                contratosSeleccionados: this.contratosSeleccionados
            }
            this.siscoV3Service.postService('common/PostZonasByEstado', data)
                .subscribe((res: any) => {
                    if (res.err) {
                        this.spinner = false;
                        this.Excepciones(res.err, 4);
                    } else if (res.excecion) {
                        this.Excepciones(res.err, 3);
                    } else {
                        if (res.recordsets.length > 0) {
                            this.zonas = res.recordsets[0];
                        } else {
                            this.zonas = [];
                        }
                    }
                }, (error: any) => {
                    this.spinner = false;
                    this.Excepciones(error, 2);
                });
        } catch (error) {
            this.Excepciones(error, 1);
        }
    }

    fnWorkshopType($event) {
        this.switch = $event;
    }

    LoadData() {
        this.pasos = [];
        this.fases = [];
        this.spinner = true;
        this.pasoactive = false;

        this.siscoV3Service.getService('solicitud/GetFases?idClase=' + this.idClase + '&&contratos='
            + this.contratosSeleccionados + '&&idZona=' + this.idZona)
            .subscribe((res: any) => {
                if (res.err) {
                    this.spinner = false;
                    this.Excepciones(res.err, 4);
                } else if (res.excecion) {
                    this.Excepciones(res.err, 3);
                } else {
                    if (res.recordsets.length > 0) {
                        this.fases = res.recordsets[0];
                        if (res.recordsets.length == 2) {
                            this.pasos = res.recordsets[1];
                        } else {
                            this.pasos = [];
                        }
                        this.spinner = false;

                        this.fases.forEach(element => {
                            element.datosGrph = [{
                                data: element.totalPasos,
                                backgroundColor: element.colores,
                                label: element.labels,
                                borderWidth: 5
                            }];
                        });
                    } else {
                        this.fases = [];
                        this.pasos = [];
                        this.spinner = false;
                    }
                    this.pintaGrafica = true;

                }
            }, (error: any) => {
                this.spinner = false;
                this.Excepciones(error, 2);
            });
    }

    getSelectedItemsKeys(items) {
        let result = [];
        const that = this;

        // tslint:disable-next-line: only-arrow-functions
        items.forEach(function (item) {
            if (item.selected) {
                result.push({ idZona: item.key, label: item.text });
            }
            if (item.items.length) {
                result = result.concat(that.getSelectedItemsKeys(item.items));
            }
        });
        return result;
    }

    TreeView_itemSelectionChanged(e) {
        const item = e.node;
        if (!item.children.length) {
            const nodes = e.component.getNodes();
            const valor = this.getSelectedItemsKeys(nodes);
            if (valor.length > 0) {
                this.treeBoxValue = valor[0].label;
                this.idZona = valor[0].idZona;
                this.spinner = true;
                this.LoadData();
            }
        } else {
            e.node.selected = false;
        }
    }

    public chartClicked(e: any): void {
        if (e.active && e.active.length > 0) {
            const paso = this.pasos.filter(f => f.paso === e.active[0]._view.label);
            this.token.filtros.idPaso = paso[0].idPaso;
            this.token.filtros.idZona = this.idZona;
            this.token.titulo = this.label;
            this.token.color = e.active[0]._options.backgroundColor;
            this.router.navigateByUrl(`/sel-solicitud-paso/${btoa(JSON.stringify(this.token))}`);
        }
    }

    public chartHovered(e: any): void {
        // console.log(e.active[0]._model.backgroundColor);
        this.paso = [];
        this.paso = this.pasos.filter(f => f.paso === e.active[0]._view.label);
        this.label = this.paso[0].paso;
        this.number = this.paso[0].totalPaso;
        this.pasoactive = true;
    }

    ngOnDestroy() {
        this.subsNegocio.unsubscribe();
    }

    /**
     * @description Cierra en automatico al seleccionar un item de la lista dinamica
     * @param $event Objeto de la lista
     * @author Andres Farias
     */
    closeWindow($event: any) {
        if ($event.value === null) {
            this.idZona = 0;
            this.LoadData();
        }
        $event.instance.close();
    }

    /*
      En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
      */
    Excepciones(stack, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: this.idUsuario,
                    idOperacion: 1,
                    idAplicacion: 11,
                    moduloExcepcion: 'solicitud-fases.component',
                    mensajeExcepcion: '',
                    stack
                }
            });

            dialogRef.afterClosed().subscribe((result: any) => { });
        } catch (error) {
        }
    }

    ConsultaSolicitud() {
        const Solicitudes = [{
            idSolicitud: 33,
            numeroSolicitud: '03-1024',
            idLogoContrato: 16541,
            rfcEmpresa: 'DIC0503123MD3',
            idCliente: 78,
            numeroContrato: '123PEMEX',
            idObjeto: 82,
            idTipoObjeto: 92
        }];
        this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: Solicitudes }));
        this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: Solicitudes[0] }));
        this.router.navigate(['sel-solicitud']);
    }

    redirige(idPaso, nombrePaso, color) {
        this.token.filtros.idPaso = idPaso;
        this.token.filtros.idZona = this.idZona;
        this.token.titulo = nombrePaso;
        this.token.color = color;

        this.router.navigateByUrl(`/sel-solicitud-paso/${btoa(JSON.stringify(this.token))}`);
    }
}

