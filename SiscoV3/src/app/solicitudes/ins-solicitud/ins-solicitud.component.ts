import { Component, OnInit } from '@angular/core';
import {
    IColumns,
    IColumnHiding,
    TiposdeFormato,
    TiposdeDato,
    IObjeto,
    IGridGeneralConfiguration,
    IBuscador,
    TipoBusqueda,
    AccionNotificacion,
    GerenciaNotificacion
} from '../../interfaces';
import { MatSnackBar, MatDialog, ErrorStateMatcher } from '@angular/material';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { Negocio } from '../../models/negocio.model';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { } from 'googlemaps';
import { ChatService } from 'src/app/services/chat.service';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import * as moment from 'moment';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched || isSubmitted)
        );
    }
}

@Component({
    selector: 'app-ins-solicitud',
    templateUrl: './ins-solicitud.component.html',
    styleUrls: ['./ins-solicitud.component.scss']
})

export class InsSolicitudComponent extends FormularioDinamico implements OnInit {
    // tslint:disable: triple-equals
    claveModulo = 'app-ins-solicitud';
    idClase = '';
    modulo: any = {};

    getStateAutenticacion: Observable<any>;
    getStateNegocio: Observable<any>;
    breadcrumb: any;
    idTipoObjeto: number;
    idObjeto: number;
    band = false;
    idUsuario;
    idProveedorEntidad: number;
    rfcProveedor: string;
    contractData: any = {
        DisplayValue: ''
    };
    spinner = false;
    private datosevent: any[];

    columnsTalleres: IColumns[] = [];
    columnHiding: IColumnHiding;
    evento: string;
    partidasData: any = [];
    partidasSelData: any = [];
    workshopGridData: any = [];
    tipoCitaList: any = [];
    centroCostosList: any = [];
    contratosSeleccionados: any = [];
    proveedorData: any = [];
    IObjeto: IObjeto[];
    proveedorSeleccionado: any;
    proveedorEntidadSel: any;
    usuarioSeleccionado: any;
    partidaGridConfiguration: IGridGeneralConfiguration;
    partidaSelGridConfiguration: IGridGeneralConfiguration;
    workshopGridConfiguration: IGridGeneralConfiguration;
    showProveedorDetailHeader = false;
    assignWorkshop = false;
    matcher = new MyErrorStateMatcher();

    dateCita = moment();
    solicitudForm = new FormGroup({
        vNombreContrato: new FormControl(
            { value: '', disabled: true }
        ),

        vTipoSolicitud: new FormControl('', [Validators.required]),
        vFecha: new FormControl(this.dateCita, [Validators.required]),
        vHora: new FormControl(this.dateCita, [Validators.required]),
        vComentarios: new FormControl('', [Validators.required]),
        vCentroCostos: new FormControl('', [Validators.required]),
        vUsuario: new FormControl('')
    });

    partidaColumns = [];
    total: any = 0;
    iva: any = 0;
    subTotal: any = 0;
    sumaTotal = {
        subTotal: null,
        IVA: null,
        Total: null
    };
    public address = '';

    public msgErrorPlace: string;
    loading: boolean;
    loadAppBanner = false;
    appBannerSpinner = false;
    numeroContrato: string;
    idCliente: number;
    contratoActual: any;
    selected: any;
    rfcEmpresa: any;
    nuevaSolicitudBandera = true;

    buscador: IBuscador = {
        parametros: {
            contratos: '',
            idClase: ''
        },
        tipoBusqueda: TipoBusqueda.parqueVehicular,
        isActive: true
    };

    constructor(private router: Router, public dialog: MatDialog,
        private snackBar: MatSnackBar, private siscoV3Service: SiscoV3Service,
        private store: Store<AppState>,
        private activatedRoute: ActivatedRoute,
        public chatService: ChatService) {
        super();
        this.spinner = true;
        this.activatedRoute.params.subscribe(parametros => {
            if (parametros.idObjeto && parametros.idClase && parametros.numeroContrato && parametros.idCliente && parametros.idTipoObjeto) {
                this.idObjeto = parametros.idObjeto;
                this.rfcEmpresa = parametros.rfcEmpresa;
                this.idTipoObjeto = parametros.idTipoObjeto;
                this.idClase = parametros.idClase;
                this.numeroContrato = parametros.numeroContrato;
                this.idCliente = parametros.idCliente;
            }
        });
        this.gridConfiguration();
        this.partidaSelGridConfiguration = {
            GridOptions: { paginacion: 100, pageSize: ['100', '300', '500', '1000'] },
            ExportExcel: { enabled: true, fileName: 'solicitud' },
            ColumnHiding: { hide: true },
            Checkbox: { checkboxmode: 'multiple' },
            Editing: { allowupdate: true, mode: 'cell' },
            Columnchooser: { columnchooser: true },
            SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
            Scroll: { mode: 'standard' },
            Detail: { detail: false },
            ToolbarDetail: null,
            Color: {
                color: 'gris',
                columnas: true,
                alternar: true,
                filas: true
            },
            ToolBox: null,
            Columns: null
        };
        this.workshopGridConfiguration = {
            GridOptions: { paginacion: 100, pageSize: ['100', '300', '500', '1000'] },
            ExportExcel: { enabled: true, fileName: 'solicitud' },
            ColumnHiding: { hide: true },
            Checkbox: { checkboxmode: 'multiple' },
            Editing: { allowupdate: true, mode: 'cell' },
            Columnchooser: { columnchooser: true },
            SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
            Scroll: { mode: 'standard' },
            Detail: { detail: false },
            ToolbarDetail: null,
            Color: null,
            ToolBox: [],
            Columns: null
        };
        this.getStateAutenticacion = this.store.select(selectAuthState);
        this.getStateNegocio = this.store.select(selectContratoState);
    }

    ngOnInit() {
        this.getStateNegocio.subscribe((stateNegocio) => {
            this.getStateAutenticacion.subscribe((stateAutenticacion) => {
                this.idClase = stateNegocio.claseActual;
                this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
                this.contratoActual = stateNegocio.contratoActual;
                this.contratosSeleccionados = stateNegocio.contratosSeleccionados;
                this.solicitudForm.controls.vUsuario.setValue(this.idUsuario);
                if (this.modulo.breadcrumb) {
                    this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(
                        this.modulo.breadcrumb,
                        this.idClase, [{ idTipoObjeto: this.idTipoObjeto }]
                    );
                }
                this.buscador.parametros.contratos = this.fnGetBuscadorParameters(this.contratosSeleccionados);
                this.buscador.parametros.idClase = this.idClase;
            });
        });
        if (this.idObjeto > 0) {
            this.IObjeto = [
                {
                    idClase: this.idClase,
                    idObjeto: this.idObjeto,
                    idCliente: this.idCliente,
                    numeroContrato: this.numeroContrato,
                    rfcEmpresa: this.rfcEmpresa,
                    idTipoObjeto: this.idTipoObjeto
                }
            ];
            this.loadAppBanner = true;
            this.appBannerSpinner = true;
            this.obtieneCatalogoCentroCostos();
            this.obtieneCatalogoTipoSolicitud();
            setInterval(() => {
                this.appBannerSpinner = false;
            }, 5000);
            this.obtieneDatosContrato(this.numeroContrato, this.idCliente);
            this.gridConfiguration();
        }
        this.spinner = false;
        this.selected = 1;
        this.obtieneCatalogoCentroCostos();
        this.GetPropiedadesAll();
    }

    ConfigurarFooter(abrir: boolean) {
        this.store.dispatch(new CambiaConfiguracionFooter(
            new FooterConfiguracion(
                ContratoMantenimientoEstatus.conMantemiento, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
    }

    GetPropiedadesAll() {
        this.siscoV3Service.getService('solicitud/GetPropiedadesAll?idClase=' + this.idClase).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.excepciones(res.excepcion, 3);
                } else {
                    this.GetPropiedades(res.recordsets[0]);
                    this.ValidForm();
                }
            }, (error: any) => {
                this.spinner = false;
            }
        );
    }

    obtienePartidas(e) {
        try {
         //  this.spinner = true;
            this.siscoV3Service.getService('partida/GetPartidas?idTipoObjeto=' + this.idTipoObjeto + '&numeroContrato='
                + this.numeroContrato + '&idCliente=' + this.idCliente + '&idClase=' + this.idClase+ '&idTipoSolicitud=' + e).subscribe((res: any) => {
                    if (res.err) {
          //              this.spinner = false;
                        this.excepciones(res.err, 4);
                    } else if (res.excecion) {
                        this.excepciones(res.err, 3);
                    } else {
                 //       this.spinner = false;
                        this.partidasData = res.recordsets[0];
                        this.siscoV3Service.getService('partida/GetPartidaColumns?idTipoObjeto=' + this.idTipoObjeto +
                            '&&numeroContrato=' + this.numeroContrato +
                            '&&idCliente=' + this.idCliente +
                            '&&idClase=' + this.idClase).subscribe((res2: any) => {
                //                this.spinner = false;
                                this.partidaGridConfiguration.Columns = [];
                                if (res2.recordsets.length > 0) {
                                    this.partidaColumns = res2.recordsets[0];
                                    if (this.partidaColumns.length > 0) {
                                        for (const data of Object.keys(this.partidaColumns[0])) {
                                            let tipoDato = '';
                                            if (this.partidaColumns[0][data] === 'File' || this.partidaColumns[0][data] === 'Image') {
                                                tipoDato = 'foto';
                                            }
                                            if (data === 'idPartida') {
                                                this.partidaGridConfiguration.Columns.push({
                                                    caption: 'Id',
                                                    dataField: data
                                                });
                                            } else {
                                                this.partidaGridConfiguration.Columns.push({
                                                    caption: data.charAt(0).toUpperCase() + data.slice(1),
                                                    dataField: data, cellTemplate: tipoDato
                                                });
                                            }
                                        }
                                        this.partidaGridConfiguration.Columns.push(
                                            {
                                                caption: 'Costo',
                                                dataField: 'Costo',
                                                dataType: TiposdeDato.number,
                                                format: TiposdeFormato.currency
                                            }
                                        );
                                    }
                                    this.fnConfigureSelGrid();
                                    this.partidasSelData = [];

                                }
                            });
                    }
                }, (error: any) => {
           //         this.spinner = false;
                    this.excepciones(error, 2);
                });
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    obtieneCatalogoTipoSolicitud() {
        try {
            this.siscoV3Service.getService('contrato/getTipoSolicitud?rfcEmpresa=' + this.IObjeto[0].rfcEmpresa +
                '&idCliente=' + this.idCliente +
                '&numeroContrato=' + this.numeroContrato +
                '&idClase=' + this.idClase).subscribe((res: any) => {
                    if (res.err) {
                        this.excepciones(res.err, 4);
                    } else if (res.excecion) {
                        this.excepciones(res.err, 3);
                    } else {
                        this.tipoCitaList = [];
                        for (const objeto of res.recordsets[0]) {
                            this.tipoCitaList.push(
                                {
                                    idTipoSol: objeto.idTipoSolicitud,
                                    nombreTipoSol: objeto.nombre
                                }
                            );
                        }
                    }
                });
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    obtieneCatalogoCentroCostos() {
        try {
            this.siscoV3Service.getService('cliente/getCentroCostos/' +
                this.rfcEmpresa + '/' + this.idCliente + '/' + this.numeroContrato).subscribe((res: any) => {
                    if (res.err) {
                        this.excepciones(res.err, 4);
                    } else if (res.excecion) {
                        this.excepciones(res.err, 3);
                    } else {
                        this.centroCostosList = [];
                        for (const objeto of res.recordsets[0]) {
                            this.centroCostosList.push(
                                {
                                    idCentroC: objeto.idCentroCosto,
                                    idFolio: objeto.folio,
                                    nombreCentroC: objeto.nombre,
                                    presupuesto: objeto.presupuestoCF.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'),
                                    gastado: objeto.gastado.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                                }
                            );
                        }
                    }
                });
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    obtieneDatosContrato(constrato: string, cliente: number) {
        try {
            this.siscoV3Service.getService('contrato/solicitud/propiedades/' + cliente + '/' + constrato)
                .subscribe((res: any) => {
                    if (res.err) {
                        this.excepciones(res.err, 4);
                    } else if (res.excecion) {
                        this.excepciones(res.err, 3);
                    } else {
                        this.contractData.DisplayValue = res.recordsets[0][0].nombre + ' - ' + res.recordsets[0][0].descripcion;
                    }
                });
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    add(evento) {
        try {
            if (evento === null) {
                this.nuevaSolicitudBandera = true;
                return;
            } else {
                this.partidasSelData = [];
                const arrayLength = evento.data.length;
                for (let index = 0; index < arrayLength; index++) {
                    this.partidasSelData.push(evento.data[index]);
                    this.partidasSelData[index].cantidad = 1;
                }
                this.nuevaSolicitudBandera = false;
            }
            const suma = this.fnPlusSelectedData();
            this.fnPlusPrices(suma);
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    fnPlusSelectedData(): number {
        let suma = 0;
        if (this.selected == 1) {
            this.partidasSelData.forEach(element => {
                suma = suma + (Number(element.Costo) * Number(element.cantidad));
            });
        } else if (this.selected == 2) {
            this.partidasSelData.forEach(element => {
                suma = suma + (Number(element.Venta) * Number(element.cantidad));
            });
        }
        return suma;
    }

    fnConfigureSelGrid() {
        this.partidaSelGridConfiguration.Columns = [];
        this.partidaSelGridConfiguration.Columns = this.partidaGridConfiguration.Columns;
        this.partidaSelGridConfiguration.Columns.map((item) => item.allowEditing = false);
        this.partidaSelGridConfiguration.Columns.splice(0, 0, {
            caption: 'Cantidad',
            dataField: 'cantidad',
            allowEditing: true,
            dataType: TiposdeDato.number
        });
        this.partidaSelGridConfiguration.ToolBox = [
            {
                location: 'after',
                widget: 'dxButton',
                locateInMenu: 'auto',
                options: {
                    width: 90,
                    text: 'Eliminar',
                    onClick: this.receiveMessage.bind(this, 'fnEliminaSeleccion')
                },
                visible: false,
                name: 'simple',
            }];
    }

    editevent($event) {
        let precio = 0;
        let cantidad = 0;
        let cantidadPasada = 0;
        let nuevaCantidad = 0;
        let subTotal = parseFloat(this.subTotal.replace(',', ''));
        if ($event !== null) {
            if (this.selected == 1) {
                precio = $event.editdata.key.Costo;
                cantidad = $event.editdata.key.cantidad;
                cantidadPasada = precio * cantidad;
                nuevaCantidad = $event.editdata.newData.cantidad;
                subTotal = subTotal + (precio * nuevaCantidad);
                subTotal = subTotal - cantidadPasada;
            } else if (this.selected == 2) {
                precio = $event.editdata.key.Venta;
                cantidad = $event.editdata.key.cantidad;
                cantidadPasada = precio * cantidad;
                nuevaCantidad = $event.editdata.newData.cantidad;
                subTotal = subTotal + (precio * nuevaCantidad);
                subTotal = subTotal - cantidadPasada;
            }
            this.fnPlusPrices(subTotal);
        }
    }

    fnPlusPrices(precioTotal) {
        if (precioTotal <= 0) {
            this.subTotal = 0;
            this.iva = 0;
            this.total = 0;
        } else {
            this.subTotal = precioTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.iva = (precioTotal * 0.16).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.total = (precioTotal + (precioTotal * 0.16)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        }
    }

    receiveMessage($event) {
        try {
            this.evento = $event.event;
            if ($event === 'add') {
                const senddata = {
                    event: $event,
                    data: this.datosevent
                };
                this.add(senddata);
            } else if ($event === 'fnEliminaSeleccion') {
                const senddata = {
                    event: $event,
                    data: this.datosevent
                };
                this.fnEliminaSeleccion(senddata);
            }
        } catch (error) {
            this.excepciones(error, 1);
        }
    }

    fnEliminaSeleccion(data) {
        if (data !== null && this.partidasSelData.length > 0) {
            this.partidasSelData.forEach((element: { idPartida: any; }, index: string | number) => {
                data.data.forEach((item: { idPartida: any; }) => {
                    if (element.idPartida == item.idPartida) {
                        delete this.partidasSelData[index];
                    }
                });
            });
        }
        this.partidasSelData = this.partidasSelData.filter((el) => {
            return el != null;
        });
        this.nuevaSolicitudBandera = !(this.solicitudForm.valid && (this.partidasSelData.length > 0));
        const suma = this.fnPlusSelectedData();
        this.subTotal = suma;
        this.fnPlusPrices(suma);
    }

    Delete(data) {
        try {
            const self = this;
            let borrar = '<Ids>';
            let cont = 0;
            data.data.forEach((element) => {
                borrar += '<idPartida>' + element.idPartida + '</idPartida>';
                cont++;
            });
        } catch (error) {
            this.excepciones(error, 1);
        }

    }

    datosMessage($event) {
        this.datosevent = [];
        this.datosevent = $event.data;
    }

    gridConfiguration() {
        this.partidaGridConfiguration = {
            GridOptions: {
                paginacion: 100,
                pageSize: [
                    '100',
                    '300',
                    '500',
                    '1000'
                ]
            },
            ExportExcel: { enabled: false, fileName: 'solicitud' },
            ColumnHiding: { hide: false },
            Checkbox: { checkboxmode: 'multiple' },
            Editing: { allowupdate: false, mode: 'cell' },
            Columnchooser: { columnchooser: false },
            SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
            Scroll: { mode: 'standard' },
            Color: null,
            Detail: { detail: false },
            ToolbarDetail: null,
            ToolBox: [
                {
                    location: 'after',
                    widget: 'dxButton',
                    locateInMenu: 'auto',
                    options: {
                        width: 90,
                        text: 'Agregar',
                        onClick: this.receiveMessage.bind(this, 'add')
                    },
                    visible: false,
                    name: 'simple'
                }],
            Columns: null
        };
    }

    excepciones(stack: any, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: this.idUsuario,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'app-ins-solicitud',
                    mensajeExcepcion: '',
                    stack
                }
            });
            dialogRef.afterClosed().subscribe((result: any) => { });
        } catch (error) { }
    }

    responseBuscador($event) {
        this.loadAppBanner = true;
        this.appBannerSpinner = true;
        this.partidasSelData = [];
        this.partidaSelGridConfiguration.Columns = null;
        if ($event !== null) {
            this.idCliente = $event.recordsets[0].idCliente;
            this.numeroContrato = $event.recordsets[0].numeroContrato;
            this.idTipoObjeto = $event.recordsets[0].idTipoObjeto;
            this.rfcEmpresa = $event.recordsets[0].rfcEmpresa;
            this.IObjeto = [
                {
                    idClase: this.idClase,
                    idObjeto: $event.recordsets[0].idObjeto,
                    idCliente: this.idCliente,
                    numeroContrato: this.numeroContrato,
                    rfcEmpresa: this.rfcEmpresa,
                    idTipoObjeto: this.idTipoObjeto
                }
            ];
            this.obtieneCatalogoTipoSolicitud();
            this.obtieneCatalogoCentroCostos();
            this.obtieneDatosContrato(this.numeroContrato, this.idCliente);
            this.gridConfiguration();
        }
        setInterval(() => {
            this.appBannerSpinner = false;
        }, 3000);
    }

    fnGetBuscadorParameters(array): string {
        let xml = '';
        let cadena;
        if (array !== null) {
            array.forEach((element: { rfcEmpresa: string; idCliente: string; numeroContrato: string; }) => {
                cadena +=
                    '<contrato>' +
                    '<rfcEmpresa>' + element.rfcEmpresa + '</rfcEmpresa>' +
                    '<idCliente>' + element.idCliente + '</idCliente>' +
                    '<numeroContrato>' + element.numeroContrato + '</numeroContrato>' +
                    '</contrato>';
            });
        }
        xml =
            '<contratos>' +
            cadena +
            '</contratos>';
        return xml;
    }

    fnAgregarNuevaSolicitud() {
        this.spinner = true;
        const xmlPartidas = this.fnCreatePartidaXML(this.partidasSelData);
        this.ValuesFormIns();
        const fechaCita = new Date(this.solicitudForm.controls.vFecha.value);
        const horaCita = new Date(this.solicitudForm.controls.vHora.value);
        const xmlPropiedades = this.fnCreatePropiedadesXML(this.formDinamico);
        const centroCosto = this.solicitudForm.controls.vCentroCostos.value.split(',');
        const parametros = {
            rfcEmpresa: this.rfcEmpresa,
            idCliente: this.idCliente,
            numeroContrato: this.numeroContrato,
            idCentroCostoFolio: centroCosto[1],
            idCentroCosto: centroCosto[0],
            idObjeto: this.IObjeto[0].idObjeto,
            idTipoObjeto: this.idTipoObjeto,
            idClase: this.idClase,
            idTipoSolicitud: this.solicitudForm.controls.vTipoSolicitud.value,
            fecha: new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate(), horaCita.getHours(), horaCita.getMinutes()),
            Propiedades: xmlPropiedades,
            comentarios: this.solicitudForm.controls.vComentarios.value,
            partidas: xmlPartidas
        };
        this.siscoV3Service
            .postService('solicitud/PostInsSolicitud', parametros)
            .subscribe(
                (res: any) => {
                    this.spinner = false;
                    if (res.err) {
                        this.excepciones(res.err, 4);
                        this.snackBar.open('No se pudo generar la cita.', 'Ok', {
                            duration: 2000
                        });
                    } else if (res.excepcion) {
                        this.snackBar.open('No se pudo generar la cita.', 'Ok', {
                            duration: 2000
                        });
                        this.excepciones(res.excepcion, 3);
                    } else {
                        if (res.recordsets[0][0].error != '') {
                            this.snackBar.open(res.recordsets[0][0].error, 'Ok', {
                                duration: 2000
                            });
                            return;
                        }
                        this.snackBar.open('Se ha generado una nueva cita.', 'Ok', {
                            duration: 2000
                        });
                        const idSolicitud = res.recordsets[0][0].idSolicitud;
                        const numeroSolicitud = res.recordsets[0][0].numeroSolicitud;
                        const idLogoContrato = res.recordsets[0][0].idLogoContrato;
                        this.chatService.createChat(`${idSolicitud.toString().trim()}${parametros.idTipoSolicitud.toString().trim()}${parametros.idClase.toString().trim()}${this.rfcEmpresa.toString().trim()}${this.idCliente.toString().trim()}${this.numeroContrato.toString().trim()}`, idSolicitud);
                        const solicitudes = [];
                        solicitudes.push({
                            idSolicitud,
                            numeroOrden: numeroSolicitud,
                            idLogoContrato,
                            rfcEmpresa: parametros.rfcEmpresa,
                            idCliente: parametros.idCliente,
                            numeroContrato: parametros.numeroContrato,
                            idObjeto: parametros.idObjeto,
                            idTipoObjeto: parametros.idTipoObjeto,
                            idTipoSolicitud: parametros.idTipoSolicitud
                        });
                        this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: solicitudes }));
                        this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: solicitudes[0] }));
                        this.router.navigate(['/sel-solicitud']);
                    }
                },
                (error: any) => {
                    this.snackBar.open('No se pudo generar la cita.', 'Ok', {
                        duration: 2000
                    });
                    this.excepciones(error, 2);
                }
            );
    }

    fnCreatePartidaXML(array): string {
        let resultado = '';
        let cadena = '';
        if (array !== null) {
            array.forEach(element => {
                cadena +=
                    '<partida>' +
                    '<idPartida>' + element.idPartida + '</idPartida>' +
                    '<cantidad>' + element.cantidad + '</cantidad>' +
                    '<costoInicial>' + element.Costo + '</costoInicial>' +
                    '<ventaInicial>' + element.Venta + '</ventaInicial>' +
                    '</partida>';
            });
        }
        resultado =
            '<partidas>' +
            cadena +
            '</partidas>';
        return resultado;
    }

    fnCreatePropiedadesXML(array): string {
        let resultado = '';
        let cadena = '';
        if (array !== null) {
            const arrayLength = array.length;
            for (let index = 0; index < arrayLength; index++) {
                const arrayHLength = array[index].valor.length;
                cadena +=
                    '<propiedad>' +
                    '<idPropiedad>' + array[index].idPropiedad + '</idPropiedad>' +
                    '<valores>';
                for (let indexH = 0; indexH < arrayHLength; indexH++) {
                    cadena +=
                        '<valor>' + array[index].valor[indexH] + '</valor>';
                }
                cadena += '</valores></propiedad>';
            }
        }
        resultado =
            '<Propiedades>' +
            cadena +
            '</Propiedades>';
        return resultado;
    }

    fnWorkshopType($event) {
        if ($event == 2) {
            this.selected = 2;
            this.partidaGridConfiguration.Columns = this.partidaGridConfiguration.Columns
                .filter((item) => item.dataField !== 'Costo');
            this.partidaGridConfiguration.Columns.push({
                caption: 'Venta',
                dataField: 'Venta',
                allowEditing: false,
                dataType: TiposdeDato.number,
                format: TiposdeFormato.currency
            });
            if (this.partidaSelGridConfiguration.Columns != null) {
                this.partidaSelGridConfiguration.Columns = this.partidaSelGridConfiguration.Columns
                    .filter((item) => item.dataField !== 'Costo');
                this.partidaSelGridConfiguration.Columns.push({
                    caption: 'Venta',
                    dataField: 'Venta',
                    allowEditing: false,
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                });
            }
        } else if ($event == 1) {
            this.selected = 1;
            this.partidaGridConfiguration.Columns = this.partidaGridConfiguration.Columns
                .filter((item) => item.dataField !== 'Venta');
            this.partidaGridConfiguration.Columns.push({
                caption: 'Costo',
                dataField: 'Costo',
                allowEditing: false,
                dataType: TiposdeDato.number,
                format: TiposdeFormato.currency
            });
            if (this.partidaSelGridConfiguration.Columns != null) {
                this.partidaSelGridConfiguration.Columns = this.partidaSelGridConfiguration.Columns
                    .filter((item) => item.dataField !== 'Venta');
                this.partidaSelGridConfiguration.Columns.push({
                    caption: 'Costo',
                    dataField: 'Costo',
                    allowEditing: false,
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                });
            }
        }
        const suma = this.fnPlusSelectedData();
        this.fnPlusPrices(suma);
        this.siscoV3Service.getService('partida/GetPartidas?idTipoObjeto=' + this.idTipoObjeto + '&&numeroContrato='
            + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&idClase=' + this.idClase+ '&&idTipoSolicitud=' + this.solicitudForm.controls.vTipoSolicitud.value).subscribe((res: any) => {
                if (res.err) {
                    this.spinner = false;
                    this.excepciones(res.err, 4);
                } else if (res.excecion) {
                    this.excepciones(res.err, 3);
                } else {
                    this.spinner = false;
                    this.partidasData = res.recordsets[0];
                }
            });
    }
}
