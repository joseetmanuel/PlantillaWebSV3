import { OnInit, Component } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Negocio } from '../../models/negocio.model';
import { IBuscador, TipoBusqueda, IGridGeneralConfiguration, TiposdeDato, TiposdeFormato, IObjeto, AccionNotificacion, GerenciaNotificacion } from 'src/app/interfaces';
import { SeleccionarSolicitudes, SeleccionarSolicitudActual } from 'src/app/store/actions/contrato.actions';
import { MapStyle } from 'src/assets/maps/mapstyle';

@Component({
    selector: 'app-ins-proveedor-solicitud',
    templateUrl: './ins-proveedor-solicitud.component.html',
    styleUrls: ['./ins-proveedor-solicitud.component.scss']
})

export class InsProveedorSolicitudComponent implements OnInit {
    // tslint:disable: triple-equals
    spinner = false;
    claveModulo = 'app-ins-proveedor-solicitud';
    idClase = '';
    idCliente: number;
    numeroContrato: string;
    idTipoObjeto: number;
    idObjeto: number;
    idTipoSolicitud: string;
    rfcEmpresa: string;
    buscador: IBuscador;
    currentCustomer: any;
    columnsdetail: any;
    cargaGrid = false;
    toolbardetail: any;
    IObjeto: IObjeto[];
    workshopAvailableData: any = [];
    ListadoMarcasTalleres: any = [];
    address: string;
    labelOption: any;
    idLogo;
    numeroOrden;

    modulo: any = {};
    breadcrumb: any;

    band = false;
    idUsuario;
    idProveedorEntidad: number;
    rfcProveedor: string;
    selected: number;
    workshopGridData: any = [];
    numeroSolicitud: any;
    contratoSeleccionado: any;
    partidasData: any = [];
    partidasReferential: any = [];
    partidasDataShadow: any = [];
    partidaColumns: any = [];
    datosevent: any = [];
    partidasSelData: any = [];
    workshopGridDetailData: any = [];
    amountType = 1;
    appBannerSpinner: boolean = null;
    showWorkshopComponents = false;
    sumaPrecios = {
        subTotal: null,
        IVA: null,
        Total: null
    };
    sumaTotal = {
        subTotal: null,
        IVA: null,
        Total: null
    };
    getStateAutenticacion: Observable<any>;
    getStateNegocio: Observable<any>;

    // Maps
    public lat: number = null;
    public lng: number = null;
    public latDefault = 19.2515925;
    public lngDefault = -99.1908343;
    public latMap = 19.2515925;
    public lngMap = -99.1908343;
    public zoomDefault = 15;
    public zoom = 15;
    private map: any;
    showAppBanner = false;

    buscadorProvedor: IBuscador;
    workshopGridConfiguration: IGridGeneralConfiguration;
    customerGridConfiguration: IGridGeneralConfiguration;
    partidasGridConfiguration: IGridGeneralConfiguration;
    styles: any[] = [];

    constructor(private router: Router, public dialog: MatDialog,
        private snackBar: MatSnackBar, private siscoV3Service: SiscoV3Service,
        private store: Store<AppState>,
        private activatedRoute: ActivatedRoute) {
        this.getStateAutenticacion = this.store.select(selectAuthState);
        this.getStateNegocio = this.store.select(selectContratoState);
        this.getStateNegocio.subscribe((stateNegocio) => {
            this.getStateAutenticacion.subscribe((stateAutenticacion) => {
                this.activatedRoute.params.subscribe(parametros => {
                    this.numeroSolicitud = parametros.numeroSolicitud;
                    this.idTipoSolicitud = parametros.idTipoSolicitud;
                    this.idClase = parametros.idClase;
                    this.rfcEmpresa = parametros.rfcEmpresa;
                    this.idCliente = parametros.idCliente;
                    this.numeroContrato = parametros.numeroContrato;

                    this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
                    if (this.modulo.breadcrumb) {
                        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [
                            {
                                numeroSolicitud: this.numeroSolicitud,
                                idTipoSolicitud: this.idTipoSolicitud,
                                idClase: this.idClase,
                                rfcEmpresa: this.rfcEmpresa,
                                idCliente: this.idCliente,
                                numeroContrato: this.numeroContrato
                            }
                        ]);
                    }
                });
            });
        });
        this.partidasGridConfiguration = {
            GridOptions: {
                paginacion: 10,
                pageSize: [10, 30, 50, 100]
            },
            ExportExcel: { enabled: false, fileName: 'solicitud' },
            ColumnHiding: { hide: false },
            Checkbox: { checkboxmode: 'multiple' },
            Editing: { allowupdate: false, mode: 'cell' },
            Columnchooser: { columnchooser: false },
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
            ToolBox: [
                {
                    location: 'after',
                    widget: 'dxButton',
                    locateInMenu: 'auto',
                    options: {
                        width: 200,
                        text: 'Asignar',
                        onClick: this.receiveMessage.bind(this, 'fnAgregaPartidasProveedor')
                    },
                    visible: false,
                    name: 'simple'
                }],
            Columns: null
        };
        this.workshopGridData = [];
        this.workshopGridConfiguration = {
            GridOptions: { paginacion: 100, pageSize: ['100', '300', '500', '1000'] },
            ExportExcel: { enabled: true, fileName: 'solicitud' },
            ColumnHiding: { hide: true },
            Checkbox: { checkboxmode: 'multiple' },
            Editing: { allowupdate: true, mode: 'cell' },
            Columnchooser: { columnchooser: true },
            SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
            Scroll: { mode: 'standard' },
            Color: null,
            Detail: { detail: true },
            ToolbarDetail: null,
            ToolBox: [
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
                }],
            Columns: [
                {
                    caption: 'RFC',
                    dataField: 'rfcProveedor',
                    width: 150,
                    allowEditing: false
                },
                {
                    caption: 'Foto',
                    dataField: 'logo',
                    cellTemplate: 'foto'
                },
                {
                    caption: 'Razón Social',
                    dataField: 'nombreComercial',
                    allowEditing: false
                },
                {
                    caption: 'Contacto',
                    dataField: 'personaContacto',
                    allowEditing: false
                },
                {
                    caption: 'Teléfono',
                    dataField: 'telefono',
                    allowEditing: false
                },
                {
                    caption: '# Sucursales',
                    dataField: 'numeroEntidades',
                    allowEditing: false
                },
                {
                    caption: 'Contrato',
                    dataField: 'nombreContrato',
                    allowEditing: false
                },
                {
                    caption: 'Total',
                    dataField: 'Total',
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency,
                    allowEditing: false
                }
            ]
        };
        this.toolbardetail = [
            {
                location: 'after',
                widget: 'dxButton',
                locateInMenu: 'auto',
                options: {
                    width: 200,
                    text: 'Eliminar',
                    onClick: null
                },
                visible: false
            }];
        this.columnsdetail = [
            {
                caption: 'Id',
                dataField: 'Id',
                allowEditing: false
            },
            {
                caption: 'Foto',
                dataField: 'Foto',
                cellTemplate: 'foto'
            },
            {
                caption: 'Cantidad',
                dataField: 'cant',
                dataType: TiposdeDato.number,
                allowEditing: true
            },
            {
                caption: 'Partida',
                dataField: 'Partida',
                allowEditing: false
            },
            {
                caption: 'NoParte',
                dataField: 'NoParte',
                allowEditing: false
            },
            {
                caption: 'Descripcion',
                dataField: 'Descripcion',
                allowEditing: false
            },
            {
                caption: 'Tipo',
                dataField: 'Tipo de partida',
                allowEditing: false
            },
            {
                caption: 'Especialidad',
                dataField: 'Especialidad',
                allowEditing: false
            },
            {
                caption: 'Clasificacion',
                dataField: 'Clasificacion',
                allowEditing: false
            },
            {
                caption: 'Marca',
                dataField: 'Marca',
                allowEditing: false
            },
            {
                caption: 'Grupo',
                dataField: 'Grupo',
                allowEditing: false
            },
            {
                caption: 'Costo',
                dataField: 'Costo',
                dataType: TiposdeDato.number,
                format: TiposdeFormato.currency,
                allowEditing: false
            },
            {
                caption: 'Total',
                dataField: 'Total',
                dataType: TiposdeDato.number,
                format: TiposdeFormato.currency,
                allowEditing: false
            }
        ];
    }

    ngOnInit() {
        this.obtienePropiedadesContrato();
        this.obtieneObjeto();
        this.obtienePartidas();
        this.sumaTotal.IVA = 0;
        this.sumaTotal.Total = 0;
        this.sumaTotal.subTotal = 0;
        this.sumaPrecios.IVA = 0;
        this.sumaPrecios.Total = 0;
        this.sumaPrecios.subTotal = 0;
        this.spinner = false;
        this.selected = 2;
        this.spinner = true;
        this.styles = MapStyle.lightblue[0].maptheme;
    }

    obtieneObjeto() {
        const uri = 'solicitud/GetObjetoPorSolicitud/' +
            this.numeroSolicitud + '/' +
            this.idClase + '/' +
            this.rfcEmpresa + '/' +
            this.idCliente + '/' +
            this.numeroContrato;
        this.siscoV3Service.getService(uri)
            .subscribe((res: any) => {
                if (res.err) {
                    this.Excepciones(res.err, 4);
                } else if (res.excecion) {
                    this.Excepciones(res.err, 3);
                } else {
                    this.idObjeto = res.recordsets[0][0].idObjeto;
                    this.idTipoObjeto = res.recordsets[0][0].idTipoObjeto;
                    this.IObjeto = [
                        {
                            idClase: this.idClase,
                            idObjeto: this.idObjeto,
                            idCliente: this.idCliente,
                            numeroContrato: this.numeroContrato,
                            idTipoObjeto: this.idTipoObjeto,
                            rfcEmpresa: this.rfcEmpresa
                        }];
                    this.showAppBanner = true;
                }
            });
    }

    obtienePropiedadesContrato() {
        const uri = `solicitud/getContratoPorSolicitud/${this.numeroSolicitud}`;
        this.siscoV3Service.getService(uri)
            .subscribe((res: any) => {
                if (res.err) {
                    this.Excepciones(res.err, 4);
                } else if (res.excecion) {
                    this.Excepciones(res.err, 3);
                } else {
                    this.idLogo = res.recordsets[0][0].idFileAvatar;
                    this.numeroOrden = res.recordsets[0][0].numero;
                }
            });
    }

    fnEliminaPartidasDetalle(data: { event?: any; data: any; }) {
        const referencias = [];
        data.data.forEach((selItem, index) => {
            this.workshopGridDetailData.forEach(element => {
                if (selItem.Id == element.Id) {
                    referencias.push(element.Id);
                    delete this.workshopGridDetailData[index];
                }
            });
        });
        this.partidasReferential.forEach(element => {
            referencias.forEach(refElement => {
                if (element.idPartida == refElement) {
                    this.partidasDataShadow.push(element);
                }
            });
        });
        this.workshopGridDetailData = this.workshopGridDetailData.filter((el) => el != null);
        const suma = this.fnPlusWorkshopdData();
        this.fnPlusTotal(suma);
    }

    fnEliminaSeleccion(data) {
        const referencias = [];
        const dataCounter = data.data.length;
        for (let index = 0; index < dataCounter; index++) {
            const dataDetailCounter = data.data[index].detalle.length;
            for (let pIndex = 0; pIndex < dataDetailCounter; pIndex++) {
                referencias.push(data.data[index].detalle[pIndex].Id);
            }
            delete this.workshopGridData[index];
        }
        this.workshopGridData = this.workshopGridData.filter((el) => el != null);
        this.partidasReferential.forEach(element => {
            referencias.forEach(refElement => {
                if (element.idPartida == refElement) {
                    this.partidasDataShadow.push(element);
                }
            });
        });
        const suma = this.fnPlusWorkshopdData();
        this.fnPlusTotal(suma);
    }

    fnBusquedaProveedor($event) {
        this.idProveedorEntidad = $event.recordsets[0].idProveedorEntidad;
        this.rfcProveedor = $event.recordsets[0].rfcProveedor;
        this.currentCustomer = $event.recordsets[0];
        this.appBannerSpinner = true;
        setTimeout(() => {
            this.appBannerSpinner = false;
        }, 2000);
    }

    obtienePartidas() {
        try {
            this.spinner = true;
            this.siscoV3Service.getService('partida/GetPartidasPorSolicitud?idSolicitud=' + this.numeroSolicitud + '&numeroContrato='
                + this.numeroContrato + '&idCliente=' + this.idCliente + '&idClase=' + this.idClase).subscribe((res: any) => {
                    if (res.err) {
                        this.spinner = false;
                        this.Excepciones(res.err, 4);
                    } else if (res.excecion) {
                        this.Excepciones(res.err, 3);
                    } else {
                        this.spinner = false;
                        const arrayLenght = res.recordsets[0].length;
                        for (let index = 0; index < arrayLenght; index++) {
                            let cantidadTotal = 0;
                            if (this.amountType === 1) {
                                cantidadTotal = cantidadTotal + (Number(res.recordsets[0][index].Costo) * res.recordsets[0][index].cant);
                            } else if (this.amountType === 2) {
                                cantidadTotal = cantidadTotal + (Number(res.recordsets[0][index].Venta) * res.recordsets[0][index].cant);
                            }
                            res.recordsets[0][index].Total = cantidadTotal;
                            this.partidasReferential.push(res.recordsets[0][index]);
                            this.partidasDataShadow.push(res.recordsets[0][index]);
                        }
                        this.buscadorProvedor = {
                            parametros: {
                                rfcEmpresa: this.rfcEmpresa,
                                numeroContrato: this.numeroContrato,
                                idClase: this.idClase,
                                idCliente: this.idCliente,
                                especialidades: this.fnCreateEspecialidadesXML(this.partidasDataShadow)
                            },
                            isActive: true,
                            tipoBusqueda: TipoBusqueda.proveedor
                        };
                        this.siscoV3Service.getService('partida/GetSolicitudPartidaColumns?idSolicitud='
                            + this.numeroSolicitud + '&&numeroContrato='
                            + this.contratoSeleccionado + '&&idCliente='
                            + this.idCliente + '&&idClase='
                            + this.idClase).subscribe((res2: any) => {
                                this.spinner = false;
                                this.partidasGridConfiguration.Columns = [];
                                if (res2.recordsets.length > 0) {
                                    this.partidaColumns = res2.recordsets[0];
                                    if (this.partidaColumns.length > 0) {
                                        for (const data of Object.keys(this.partidaColumns[0])) {
                                            let tipoDato = '';
                                            if (this.partidaColumns[0][data] === 'File' || this.partidaColumns[0][data] === 'Image') {
                                                tipoDato = 'foto';
                                            }
                                            if (data === 'Partida') {
                                                this.partidasGridConfiguration.Columns.push(
                                                    {
                                                        caption: 'Cantidad',
                                                        dataField: 'cant',
                                                        dataType: TiposdeDato.number
                                                    });
                                            }
                                            if (data === 'idPartida') {
                                                this.partidasGridConfiguration.Columns.push({
                                                    caption: 'Id',
                                                    dataField: data
                                                });
                                            } else {
                                                this.partidasGridConfiguration.Columns.push({
                                                    caption: data.charAt(0).toUpperCase() + data.slice(1),
                                                    dataField: data, cellTemplate: tipoDato
                                                });
                                            }
                                        }
                                        this.partidasGridConfiguration.Columns.push(
                                            {
                                                caption: 'Costo',
                                                dataField: 'Costo',
                                                dataType: TiposdeDato.number,
                                                format: TiposdeFormato.currency
                                            },
                                            {
                                                caption: 'Total',
                                                dataField: 'Total',
                                                dataType: TiposdeDato.number,
                                                format: TiposdeFormato.currency
                                            }

                                        );
                                    }
                                }
                            });
                    }
                });
        } catch (error) {
            this.Excepciones(error, 1);
        }
    }

    fnAmountType($event) {
        if ($event == 2) {
            this.amountType = 2;
            this.partidasGridConfiguration.Columns = this.partidasGridConfiguration.Columns
                .filter((item) => item.dataField !== 'Costo' && item.dataField !== 'Total');
            this.partidasGridConfiguration.Columns.push(
                {
                    caption: 'Venta',
                    dataField: 'Venta',
                    allowEditing: false,
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                },
                {
                    caption: 'Total',
                    dataField: 'Total',
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                });
            this.columnsdetail = this.columnsdetail.filter((item) => item.dataField !== 'Costo' && item.dataField !== 'Total');
            this.columnsdetail.push(
                {
                    caption: 'Venta',
                    dataField: 'Venta',
                    allowEditing: false,
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                },
                {
                    caption: 'Total',
                    dataField: 'Total',
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                });
        } else if ($event == 1) {
            this.amountType = 1;
            this.partidasGridConfiguration.Columns = this.partidasGridConfiguration.Columns
                .filter((item) => item.dataField !== 'Venta' && item.dataField !== 'Total');
            this.partidasGridConfiguration.Columns.push(
                {
                    caption: 'Costo',
                    dataField: 'Costo',
                    allowEditing: false,
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                },
                {
                    caption: 'Total',
                    dataField: 'Total',
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                });
            this.columnsdetail = this.columnsdetail.filter((item) => item.dataField !== 'Venta' && item.dataField !== 'Total');
            this.columnsdetail.push(
                {
                    caption: 'Costo',
                    dataField: 'Costo',
                    allowEditing: false,
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                },
                {
                    caption: 'Total',
                    dataField: 'Total',
                    dataType: TiposdeDato.number,
                    format: TiposdeFormato.currency
                });
        }
        this.fnCalculaTotalPartidas();
        const suma = this.fnPlusSelectedData();
        this.fnPlusPrices(suma);
        const total = this.fnPlusWorkshopdData();
        this.fnPlusTotal(total);
        this.fnCalculateTotal();
    }

    fnCalculaTotalPartidas() {
        let cantidadTotal = 0;
        this.partidasDataShadow.forEach(element => {
            if (this.amountType === 1) {
                cantidadTotal = cantidadTotal + (Number(element.Costo) * element.cant);
            } else if (this.amountType === 2) {
                cantidadTotal = cantidadTotal + (Number(element.Venta) * element.cant);
            }
            element.Total = cantidadTotal;
        });
    }

    fnCrearCotizacion() {
        if (this.partidasSelData != null && this.partidasSelData.length > 0 && this.currentCustomer != null) {
            this.appBannerSpinner = false;
            this.showWorkshopComponents = false;
            const parametros = {
                Partidas: this.fnCreatePartidaXML(this.partidasSelData),
                numeroContrato: this.numeroContrato,
                idCliente: this.idCliente,
                idClase: this.idClase,
                rfcProveedor: this.rfcProveedor
            };
            this.partidasSelData.forEach((selItem: { idPartida: any; }, index: string | number) => {
                this.partidasDataShadow.forEach(shadowItem => {
                    if (selItem.idPartida == shadowItem.idPartida) {
                        delete this.partidasDataShadow[index];
                        //delete this.partidasSelData[index];
                    }
                });
            });
            this.partidasDataShadow = this.partidasDataShadow.filter((el) => {
                return el != null;
            });
            this.sumaPrecios.IVA = 0;
            this.sumaPrecios.Total = 0;
            this.sumaPrecios.subTotal = 0;
            this.siscoV3Service.postService('proveedor/PostObtieneCostosPartidaPorProveedor', parametros).subscribe(
                (res: any) => {
                    this.spinner = false;
                    if (res.err) {
                        this.Excepciones(res.err, 4);
                    } else if (res.excepcion) {
                        this.Excepciones(res.excepcion, 3);
                    } else {
                        let dataProveedor;
                        const partidasArray = [];
                        res.recordsets[0].forEach(element => {
                            this.partidasSelData.forEach(pElement => {
                                if (pElement.idPartida == element.idPartida && this.amountType == 1) {
                                    dataProveedor = {};
                                    dataProveedor = {
                                        Id: element.idPartida,
                                        Foto: element.Foto,
                                        Instructivo: element.Instructivo,
                                        Partida: element.Partida,
                                        NoParte: element.noParte,
                                        Descripcion: element.Descripción,
                                        Especialidad: element.Especialidad,
                                        Marca: element.Marca,
                                        Grupo: element.Grupo,
                                        Costo: element.Costo,
                                        Venta: element.Venta,
                                        idProveedorEntidad: this.currentCustomer.idProveedorEntidad,
                                        rfcProveedor: this.currentCustomer.rfcProveedor,
                                        idObjeto: this.idObjeto,
                                        idTipoObjeto: this.idTipoObjeto,
                                        cant: pElement.cant,
                                        Total: pElement.cant * element.Costo
                                    };
                                } else if (pElement.idPartida == element.idPartida && this.amountType == 2) {
                                    dataProveedor = {};
                                    dataProveedor = {
                                        Id: element.idPartida,
                                        Foto: element.Foto,
                                        Instructivo: element.Instructivo,
                                        Partida: element.Partida,
                                        NoParte: element.noParte,
                                        Descripcion: element.Descripción,
                                        Especialidad: element.Especialidad,
                                        Marca: element.Marca,
                                        Grupo: element.Grupo,
                                        Costo: element.Costo,
                                        Venta: element.Venta,
                                        idProveedorEntidad: this.currentCustomer.idProveedorEntidad,
                                        rfcProveedor: this.currentCustomer.rfcProveedor,
                                        idObjeto: this.idObjeto,
                                        idTipoObjeto: this.idTipoObjeto,
                                        cant: pElement.cant,
                                        Total: pElement.cant * element.Venta
                                    };
                                }
                            });
                            partidasArray.push(dataProveedor);
                        });
                        this.workshopGridData.push({
                            rfcProveedor: this.currentCustomer.rfcProveedor,
                            idProveedorEntidad: this.currentCustomer.idProveedorEntidad,
                            nombreComercial: this.currentCustomer.nombreComercial,
                            //personaContacto: this.currentCustomer.personaContacto[0],
                            telefono: this.currentCustomer.telefono,
                            nombreContrato: this.numeroContrato,
                            detalle: partidasArray
                        });
                        this.rfcProveedor = null;
                        this.idProveedorEntidad = null;
                        const suma = this.fnPlusWorkshopdData();
                        this.fnPlusTotal(suma);
                        this.cargaGrid = true;
                        this.fnCalculateTotal();
                    }
                }, (error: any) => {
                    this.spinner = false;
                    this.Excepciones(error, 2);
                }
            );
        }
    }

    fnCalculateTotal() {
        this.workshopGridData.forEach((element) => {
            let auxiliar = 0;
            element.detalle.forEach(delement => {
                if (this.amountType == 1) {
                    delement.Total = (Number(delement.Costo) * delement.cant);
                } else if (this.amountType == 2) {
                    delement.Total = (Number(delement.Venta) * delement.cant);
                }
                auxiliar = auxiliar + delement.Total;
            });
            element.Total = auxiliar;
        });
    }

    datosMessage($event) {
        this.datosevent = [];
        this.datosevent = $event.data;
    }

    receiveMessage($event) {
        try {
            if ($event === 'fnAgregaPartidasProveedor') {
                const senddata = {
                    event: $event,
                    data: this.datosevent
                };
                this.fnAgregaPartidasProveedor(senddata);
            } else if ($event === 'fnEliminaSeleccion') {
                const senddata = {
                    event: $event,
                    data: this.datosevent
                };
                this.fnEliminaSeleccion(senddata);
            } else if ($event === 'fnEliminaPartidasDetalle') {
                const senddata = {
                    event: $event,
                    data: this.datosevent
                };
                this.fnEliminaPartidasDetalle(senddata);
            } else if ($event === 'fnAsignaProveedorGrid') {
                const senddata = {
                    event: $event,
                    data: this.datosevent
                };
                this.fnAsignaProveedorGrid(senddata);
            }
        } catch (error) {
            this.Excepciones(error, 1);
        }
    }

    editevent($event) {

    }

    fnCreatePartidaXML(array): string {
        let resultado = '';
        let cadena = '';
        if (array !== null) {
            array.forEach(element => {
                cadena += '<idPartida>' + element.idPartida + '</idPartida>' +
                    '<cantidad>' + element.cant + '</cantidad>';
            });
        }
        resultado =
            '<Partidas>' +
            cadena +
            '</Partidas>';
        return resultado;
    }

    fnAgregaPartidasProveedor($event) {
        this.partidasSelData = [];
        if ($event.data.length > 0) {
            this.partidasSelData = $event.data;
            const suma = this.fnPlusSelectedData();
            this.fnPlusPrices(suma);
            this.showWorkshopComponents = true;
        }
    }

    fnPlusPrices(precioTotal: number) {
        if (precioTotal <= 0) {
            this.sumaPrecios.subTotal = (0).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaPrecios.IVA = (0).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaPrecios.Total = (0).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        } else {
            this.sumaPrecios.subTotal = precioTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaPrecios.IVA = (precioTotal * 0.16).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaPrecios.Total = (precioTotal + (precioTotal * 0.16)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        }
    }

    fnPlusTotal(precioTotal: number) {
        if (precioTotal <= 0) {
            this.sumaTotal.subTotal = (0).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaTotal.IVA = (0).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaTotal.Total = (0).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        } else {
            this.sumaTotal.subTotal = precioTotal.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaTotal.IVA = (precioTotal * 0.16).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            this.sumaTotal.Total = (precioTotal + (precioTotal * 0.16)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        }
    }

    fnPlusSelectedData(): number {
        let sum = 0;
        if (this.amountType == 1) {
            this.partidasSelData.forEach(element => {
                sum = sum + element.Total;
            });
        } else if (this.amountType == 2) {
            this.partidasSelData.forEach(element => {
                sum = sum + element.Total;
            });
        }
        return sum;
    }

    fnPlusWorkshopdData(): number {
        let suma = 0;
        if (this.amountType == 1) {
            this.workshopGridData.forEach(element => {
                element.detalle.forEach(delement => {
                    suma = suma + (Number(delement.Costo) * delement.cant);
                });
            });
        } else if (this.amountType == 2) {
            this.workshopGridData.forEach(element => {
                element.detalle.forEach(delement => {
                    suma = suma + (Number(delement.Venta) * delement.cant);
                });
            });
        }
        return suma;
    }

    GetProveedores() {
        this.spinner = true;
        this.siscoV3Service.getService('proveedor/GetProveedores?idClase='
            + this.idClase + '&incluyeMantenimiento=0&numeroContrato=' + this.contratoSeleccionado.numeroContrato)
            .subscribe(
                (res: any) => {
                    this.spinner = false;
                    if (res.err) {
                        this.Excepciones(res.err, 4);
                    } else if (res.excepcion) {
                        this.Excepciones(res.excepcion, 3);
                    } else {
                        this.workshopGridData = res.recordsets[0];
                    }
                }, (error: any) => {
                    this.spinner = false;
                    this.Excepciones(error, 2);
                }
            );
    }

    fnAgregarNuevaCotizacion() {
        const parametros = {
            idSolicitud: this.numeroSolicitud,
            idTipoSolicitud: this.idTipoSolicitud,
            idClase: this.idClase,
            rfcEmpresa: this.rfcEmpresa,
            idCliente: this.idCliente,
            numeroContrato: this.numeroContrato,
            data: this.fnCreatePartidasXML(this.workshopGridData)
        };
        this.siscoV3Service.postService('solicitud/PostInsCotizacion', parametros)
            .subscribe((res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.Excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.Excepciones(res.excepcion, 3);
                } else {
                    this.snackBar.open('Se generaron las cotizaciones.', 'Ok', {
                        duration: 2000
                    });
                    const paramsAvanzaOrden = {
                        idSolicitud: this.numeroSolicitud,
                        idTipoSolicitud: this.idTipoSolicitud,
                        idClase: this.idClase,
                        rfcEmpresa: this.rfcEmpresa,
                        idCliente: this.idCliente,
                        numeroContrato: this.numeroContrato
                    };
                    this.siscoV3Service.putService('solicitud/PutAvanzaOrden', paramsAvanzaOrden)
                        .subscribe((resAvanza: any) => {
                            const llave = {
                                idSolicitud: this.numeroSolicitud,
                                idTipoSolicitud: this.idTipoSolicitud,
                                idClase: this.idClase,
                                rfcEmpresa: this.rfcEmpresa,
                                idCliente: this.idCliente,
                                numeroContrato: this.numeroContrato
                            };
                            const notificacion = {
                                accion: AccionNotificacion.INSERCION,
                                modulo: this.modulo.id,
                                gerencia: GerenciaNotificacion.COBRANZA,
                                llave
                            };
                            this.siscoV3Service.postService('notificacion/EnviaNotificacion', notificacion).toPromise().then((res: any) => { console.log(res) }).catch((err: any) => { console.log(err) });
                            const solicitudes = [];
                            solicitudes.push({
                                idSolicitud: this.numeroSolicitud,
                                numeroOrden: this.numeroOrden,
                                idLogoContrato: this.idLogo,
                                rfcEmpresa: this.rfcEmpresa,
                                idCliente: this.idCliente,
                                numeroContrato: this.numeroContrato,
                                idObjeto: this.idObjeto,
                                idTipoObjeto: this.idTipoObjeto,
                                idTipoSolicitud: this.idTipoSolicitud
                            });
                            this.store.dispatch(new SeleccionarSolicitudes({ solicitudesSeleccionadas: solicitudes }));
                            this.store.dispatch(new SeleccionarSolicitudActual({ solicitudActual: solicitudes[0] }));
                            this.router.navigateByUrl('/sel-solicitud');
                        });
                }
            }, (error: any) => {
                this.spinner = false;
                this.Excepciones(error, 2);
            });
    }

    fnCreatePartidasXML(array): string {
        let resultado = '';
        let cadena = '';
        if (array !== null) {
            array.forEach(elementoPadre => {
                cadena +=
                    '<proveedor>' +
                    '<idProveedorEntidad>' + elementoPadre.idProveedorEntidad + '</idProveedorEntidad>' +
                    '<rfcProveedor>' + elementoPadre.rfcProveedor + '</rfcProveedor>' +
                    '<Partidas>';
                elementoPadre.detalle.forEach(elementoHijo => {
                    cadena +=
                        '<partida>' +
                        '<idPartida>' + elementoHijo.Id + '</idPartida>' +
                        '<cantidad>' + elementoHijo.cant + '</cantidad>' +
                        '<idProveedorEntidad>' + elementoHijo.idProveedorEntidad + '</idProveedorEntidad>' +
                        '<rfcProveedor>' + elementoHijo.rfcProveedor + '</rfcProveedor>' +
                        '<idObjeto>' + elementoHijo.idObjeto + '</idObjeto>' +
                        '<idTipoObjeto>' + elementoHijo.idTipoObjeto + '</idTipoObjeto>' +
                        '<costo>' + elementoHijo.Costo + '</costo>' +
                        '<venta>' + elementoHijo.Venta + '</venta>' +
                        '</partida>';
                });
                cadena += '</Partidas></proveedor>';
            });
        }
        resultado =
            '<Proveedores>' +
            cadena +
            '</Proveedores>';
        return resultado;
    }

    fnCreateEspecialidadesXML(array): string {
        let resultado = '';
        let cadenaString = '';
        if (array !== null) {
            array.forEach(element => {
                const esp = element.Especialidad !== null ? element.Especialidad : 0;
                cadenaString +=
                    '<especialidad>' + esp + '</especialidad>';
            });
        }
        resultado =
            '<especialidades>' +
            cadenaString +
            '</especialidades>';
        return resultado;
    }

    mapReady($event: any) {
        this.map = $event;
    }

    fnWorkshopType($event) {
        if ($event == 1) {
            this.selected = 1;
            this.customerGridConfiguration = {
                GridOptions: { paginacion: 100, pageSize: ['100', '300', '500', '1000'] },
                ExportExcel: { enabled: false, fileName: 'solicitud' },
                ColumnHiding: { hide: false },
                Checkbox: { checkboxmode: 'single' },
                Editing: { allowupdate: false, mode: 'cell' },
                Columnchooser: { columnchooser: true },
                SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
                Scroll: { mode: 'standard' },
                Color: {
                    color: 'gris',
                    columnas: true,
                    alternar: true,
                    filas: true
                },
                Detail: { detail: false },
                ToolbarDetail: null,
                ToolBox: [
                    {
                        location: 'after',
                        widget: 'dxButton',
                        locateInMenu: 'auto',
                        options: {
                            width: 200,
                            text: 'Asignar',
                            onClick: this.receiveMessage.bind(this, 'fnAsignaProveedorGrid')
                        },
                        visible: false,
                        name: 'simple',
                    }],
                Columns: [
                    {
                        caption: 'Proveedor mas cercano',
                        dataField: 'index',
                        width: 200,
                        allowEditing: false
                    },
                    {
                        caption: 'RFC',
                        dataField: 'rfcProveedor',
                        width: 150,
                        allowEditing: false
                    },
                    {
                        caption: 'Razón social',
                        dataField: 'razonSocial',
                        allowEditing: false
                    },
                    {
                        caption: 'Nombre comercial',
                        dataField: 'nombreComercial',
                        allowEditing: false
                    },
                    {
                        caption: 'Contacto',
                        dataField: 'Contacto',
                        allowEditing: false
                    },
                    {
                        caption: 'Teléfono',
                        dataField: 'Telefono',
                        allowEditing: false
                    },
                    {
                        caption: 'Contrato',
                        dataField: 'Contrato',
                        allowEditing: false
                    }
                ]
            };
            this.fnAllowLocation();
        } else if ($event == 2) {
            this.selected = 2;
        }
    }

    fnAsignaProveedorGrid($event) {
        if ($event.data != null) {
            this.rfcProveedor = $event.data[0].rfcProveedor;
            this.idProveedorEntidad = $event.data[0].idProveedorEntidad;
            this.appBannerSpinner = true;
            setTimeout(() => {
                this.appBannerSpinner = false;
            }, 2000);
            this.currentCustomer = {
                rfcProveedor: $event.data[0].rfcProveedor,
                idProveedorEntidad: $event.data[0].idProveedorEntidad,
                nombreComercial: $event.data[0].razonSocial,
                //personaContacto[0] = $event.data[0].Contrato,
                telefono: $event.data[0].Telefono
            };
        }
    }

    fnAgregaProveedorMapa($event) {
        if ($event != null) {
            this.rfcProveedor = $event.rfc;
            this.idProveedorEntidad = $event.entidad;
            this.appBannerSpinner = true;
            setTimeout(() => {
                this.appBannerSpinner = false;
            }, 2000);
            this.currentCustomer = {
                rfcProveedor: $event.rfc,
                idProveedorEntidad: $event.entidad,
                nombreComercial: $event.customerName,
                //personaContacto[0] = $event.data[0].Contrato,
                telefono: $event.telefono
            };
        }
    }

    fnAllowLocation() {
        navigator.geolocation.getCurrentPosition(position => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.zoom = 8;
            this.ListadoMarcasTalleres = [];
            this.workshopAvailableData = [];
            if (position) {
                this.siscoV3Service.getService('proveedor/GetTalleresPorPartidas/null/' +
                    this.idClase + '/' +
                    this.numeroContrato + '/' +
                    this.idCliente + '/' +
                    position.coords.latitude + '/' +
                    position.coords.longitude)
                    .subscribe((res: any) => {
                        if (res.err) {
                            this.spinner = false;
                            this.Excepciones(res.err, 4);
                        } else if (res.excecion) {
                            this.Excepciones(res.err, 3);
                        } else {
                            res.recordsets[0].forEach((element, index) => {
                                const provider = {
                                    lat: element.Latitud,
                                    lng: element.Longitud,
                                    customerName: element.nombreComercial,
                                    rfc: element.rfcProveedor,
                                    contacto: element.Contacto,
                                    telefono: element.Telefono,
                                    contrato: element.Contrato,
                                    entidad: element.idProveedorEntidad,
                                    numero: index,
                                    // tslint:disable-next-line: max-line-length
                                    image: `./assets/images/iconos-sisco/Solicitudes/solicitud.ins-proveedor-solicitud.marker${index + 1}.png`
                                };
                                this.ListadoMarcasTalleres.push(provider);
                                element.index = index + 1;
                                this.workshopAvailableData.push(element);
                            });
                        }
                    });
            }
            this.lngMap = position.coords.longitude;
            this.latMap = position.coords.latitude;
        });
    }

    findPlace($event) {
        this.address = $event;
        if (this.address) {
            const geocoder = new google.maps.Geocoder();
            const self = this;
            geocoder.geocode({ address: this.address }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results.length > 0) {
                        const location = results[0].geometry.location;
                        self.lat = location.lat();
                        self.lng = location.lng();
                        this.ListadoMarcasTalleres = [];
                        this.workshopAvailableData = [];
                        this.siscoV3Service.getService('proveedor/GetTalleresPorPartidas/null/' +
                            this.idClase + '/' +
                            this.numeroContrato + '/' +
                            this.idCliente + '/' +
                            self.lat + '/' + self.lng)
                            .subscribe((res: any) => {
                                if (res.err) {
                                    this.spinner = false;
                                    this.Excepciones(res.err, 4);
                                } else if (res.excecion) {
                                    this.Excepciones(res.err, 3);
                                } else {
                                    if (res.recordsets[0].length > 0) {
                                        for (let index = 0; index <= res.recordsets[0].length; index++) {
                                            const provider = {
                                                lat: res.recordsets[0][index].Latitud,
                                                lng: res.recordsets[0][index].Longitud,
                                                customerName: res.recordsets[0][index].nombreComercial,
                                                rfc: res.recordsets[0][index].rfcProveedor,
                                                contacto: res.recordsets[0][index].Contacto,
                                                telefono: res.recordsets[0][index].Telefono,
                                                contrato: res.recordsets[0][index].Contrato,
                                                entidad: res.recordsets[0][index].idProveedorEntidad,
                                                // tslint:disable-next-line: max-line-length
                                                image: `./assets/images/iconos-sisco/Solicitudes/solicitud.ins-proveedor-solicitud.marker${index + 1}.png`
                                            };
                                            this.ListadoMarcasTalleres.push(provider);
                                            res.recordsets[0][index].index = index + 1;
                                            this.workshopAvailableData.push(res.recordsets[0][index]);
                                        }
                                    }
                                }
                            });
                        self.latMap = location.lat();
                        self.lngMap = location.lng();
                        self.zoom = 8;

                        self.map.setCenter({ lat: self.lat, lng: self.lng });
                    } else {
                        self.lat = null;
                        self.lng = null;
                        self.latMap = self.latDefault;
                        self.lngMap = self.lngDefault;
                        self.zoom = self.zoomDefault;
                        self.map.setCenter({ lat: self.latMap, lng: self.lngMap });
                    }
                }
            });
        }
    }

    currentLocationChange($event) {
        if ($event != null) {
            this.ListadoMarcasTalleres = [];
            this.lat = $event.coords.lat;
            this.lng = $event.coords.lng;
            this.workshopAvailableData = [];
        }
        this.siscoV3Service.getService('proveedor/GetTalleresPorPartidas/null/' +
            this.idClase + '/' +
            this.numeroContrato + '/' +
            this.idCliente + '/' +
            this.lat + '/' + this.lng)
            .subscribe((res: any) => {
                if (res.err) {
                    this.spinner = false;
                    this.Excepciones(res.err, 4);
                } else if (res.excecion) {
                    this.Excepciones(res.err, 3);
                } else {
                    if (res.recordsets[0].length > 0) {
                        res.recordsets[0].forEach((element, index) => {
                            const provider = {
                                lat: element.Latitud,
                                lng: element.Longitud,
                                customerName: element.nombreComercial,
                                rfc: element.rfcProveedor,
                                contacto: element.Contacto,
                                telefono: element.Telefono,
                                contrato: element.Contrato,
                                entidad: element.idProveedorEntidad,
                                numero: index,
                                image: `./assets/images/iconos-sisco/Solicitudes/solicitud.ins-proveedor-solicitud.marker${index + 1}.png`
                            };
                            this.ListadoMarcasTalleres.push(provider);
                            element.index = index + 1;
                            this.workshopAvailableData.push(element);
                        });
                    }
                }
            });
    }

    ConfigurarFooter(abrir: boolean) {
        this.store.dispatch(new CambiaConfiguracionFooter(
            new FooterConfiguracion(
                ContratoMantenimientoEstatus.sinMantenimiento, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
    }

    onMouseOver(infoWindow, gm) {
        if (gm.lastOpen != null) {
            gm.lastOpen.close();
        }
        gm.lastOpen = infoWindow;
        infoWindow.open();
    }

    Excepciones(stack: any, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: this.idUsuario,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'app-ins-proveedor-solicitud',
                    mensajeExcepcion: '',
                    stack
                }
            });
            dialogRef.afterClosed().subscribe((result: any) => { });
        } catch (error) {

        }
    }
}
