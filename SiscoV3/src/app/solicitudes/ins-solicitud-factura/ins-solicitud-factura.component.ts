import { OnInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppState, selectContratoState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { IFileUpload, IGridOptions, IObjeto } from 'src/app/interfaces';
import { MatDialog, MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { IProveedor } from 'src/app/proveedor/interfaces';

@Component({
    selector: 'app-ins-solicitud-factura',
    templateUrl: './ins-solicitud-factura.component.html',
    styleUrls: ['./ins-solicitud-factura.component.scss']
})

export class InsSolicitudFacturaComponent implements OnInit, OnDestroy {
    spinner: boolean;
    /**
     * Variables de la solicitud
     */
    idSolicitud: number;
    idTipoSolicitud: string;
    idClase: string;
    rfcEmpresa: string;
    idCliente: number;
    numeroContrato: string;
    idTipoObjeto: number;
    IUploadFile: IFileUpload;
    checkEnabled: boolean;
    cotizaciones: any[] = [];
    keyDetalle = 'partidas';
    keyDetallePagadas = 'cotizacionesPartidas';
    facturasCotizacionesPagadas: any[] = [];
    showFileUpload: boolean = true;
    IObjeto: IObjeto[];
    numeroCotizacionesSeleccionadas: { numeroCotizacion: any; idCotizacion: any; }[] = [];
    showGrid: boolean;
    idObjeto: any;
    showFacturasCotizaciones: boolean;
    partidasProveedor: any[];
    
    // Datos del proveedor
    rfcProveedor: string;
    idProveedorEntidad: number;
    proveedorEntidades: any[] = [];
    public datosProveedorEntidad: IProveedor;


    /**
     * Bandera para indicar se mostrará todas las cotizaciones del proveedor
     * o solo la cotizacion recibida por parametro.
     */
    allSolicitudes: boolean;

    // Redux
    getStateAutenticacion: Observable<any>;
    getStateNegocio: Observable<any>;
    subsNegocio: Subscription;
    fechaCotizacion: any;
    partidasCotizaciones: any[];
    idUsuario: number;
    solicitudActual;

    // Facturas
    facturas: any[] = [];
    partidasSeleccionadas: IPartida[] = [];
    facturaActual: any = { archivos: null, valida: false, subTotal: 0, nombreFactura: '' };
    facturaValida: boolean;
    nombreFactura: string;
    subTotal: number;
    montoAplicado: number = 0;
    cotizacionPartida: any[] = [];

    // Variables para los grid
    // Gird Facturas
    Checkbox: { checkboxmode: string; };
    Editing: { allowupdate: boolean; mode: string; };
    Columnchooser: { columnchooser: boolean; };
    searchPanel: { visible: boolean; width: number; placeholder: string; filterRow: boolean; };
    scroll: { mode: string; };
    toolbar: any[];
    toolbardetail: any[];
    detail: { detail: boolean; };
    columns: any[];
    gridOptions: IGridOptions;
    Color: { color: 'gris'; };
    // Grid Cotizaciones
    CheckboxCotizacion: { checkboxmode: string; };
    EditingCotizacion: { allowupdate: boolean; mode: string; };
    ColumnchooserCotizacion: { columnchooser: boolean; };
    searchPanelCotizacion: { visible: boolean; width: number; placeholder: string; filterRow: boolean; };
    toolbarCotizacion: any[];
    toolbardetailCotizacion: any[];
    detailCotizacion: { detail: boolean};
    columnsCotizacion: any[];
    gridOptionsCotizacion: IGridOptions;
    dataGridCotizacion: any;

    // Grid Proveedor entidad
    CheckboxProveedor: { checkboxmode: string; };
    EditingProveedor: { allowupdate: boolean; mode: string; };
    ColumnchooserProveedor: { columnchooser: boolean; };
    searchPanelProveedor: { visible: boolean; width: number; placeholder: string; filterRow: boolean; };
    toolbarProveedor: any[] = [];
    toolbardetailProveedor: any[];
    detailProveedor: { detail: false; };
    columnsProveedor: any[] = [];
    gridOptionsProveedor: IGridOptions;
    dataGridProveedor: any = [];


    // VARIABLES PARA SEGURIDAD
    claveModulo = 'app-ins-solicitud-factura';
    modulo: any = {};
    breadcrumb: any[];
    datosevent: any;
    showBannerTaller: boolean;
    todasCotizaciones: any;
    totalProveedorEntidad: number = 0;
    totalFacturadoProveedorEntidad: number = 0;
    totalPendienteProveedorEntidad: number = 0;
    contratoActual: any;
    todasPartidasCotizaciones: any;
    datagrid: any;


    constructor(private activatedRoute: ActivatedRoute,
        private siscoV3Service: SiscoV3Service,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router,
        private store: Store<AppState>, ) {
        this.getStateNegocio = this.store.select(selectContratoState);
        this.getStateAutenticacion = this.store.select(selectAuthState);

        this.activatedRoute.params.subscribe(parametros => {
            this.rfcProveedor = parametros.rfcProveedor;
            if(this.rfcProveedor) {
                this.allSolicitudes = true;
            }
        });

        this.getStateAutenticacion.subscribe((stateAutenticacion) => {
            this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
                this.idClase = stateNegocio.claseActual;
                this.solicitudActual = stateNegocio.solicitudActual;
                this.contratoActual = stateNegocio.contratoActual;

                this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

                if (this.modulo.length === 0) {
                    this.snackBar.open('El usuario no tiene permisos para acceder a este módulo.', 'OK', {
                        duration: 2000
                    });
                    this.router.navigate(['/home']);
                    return;
                }

                /**
                 * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
                 * footer por defecto, de lo contrario no se abre el footer.
                 */
                if (this.modulo.contratoObligatorio) {
                    if (stateNegocio.contratoActual) {
                        this.ConfigurarFooter(false);
                    } else {
                        this.ConfigurarFooter(true);
                    }
                } else {
                    this.ConfigurarFooter(false);
                }

                if (this.modulo.breadcrumb) {
                    this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
                }
            });
        });
    }

    ngOnInit() {
        if (this.solicitudActual && !this.allSolicitudes) {
            this.idSolicitud = this.solicitudActual.idSolicitud;
            this.idTipoSolicitud = this.solicitudActual.idTipoSolicitud;
            this.rfcEmpresa = this.solicitudActual.rfcEmpresa;
            this.idCliente = this.solicitudActual.idCliente;
            this.numeroContrato = this.solicitudActual.numeroContrato;
            this.idTipoObjeto = this.solicitudActual.idTipoObjeto;
            this.idObjeto = this.solicitudActual.idObjeto;

            this.IObjeto = this.IObjeto = [{ idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente, numeroContrato: this.numeroContrato, rfcEmpresa: this.rfcEmpresa, idTipoObjeto: this.idTipoObjeto }];

            this.GetProveedorCotizacionPorSolicitud();
            this.allSolicitudes = false;
        } else if (this.rfcProveedor && this.allSolicitudes === true) {
            // this.rfcEmpresa = this.contratoActual.rfcEmpresa;
            // this.idCliente = this.contratoActual.idCliente;
            // this.numeroContrato = this.contratoActual.numeroContrato;
            this.GetProveedorCotizacionPorRFC();
        }

        this.Grid();
        this.IUploadFile = {
            path: this.idClase, idUsuario: 123, idAplicacionSeguridad: environment.aplicacionesId,
            idModuloSeguridad: 1, multiple: true, soloProcesar: false
            , extension: ['.pdf', '.xml'], titulo: 'Factura'
            , descripcion: '', previsualizacion: false, tipoDocumento: 'Factura'
        };
    }

    /**
     * @description Configurar el modal de footer.
     * @param abrir Mandar la configuración del footer, define si el footer se abre o no por defecto.
     * @author Andres Farias
     */
    ConfigurarFooter(abrir: boolean) {
        this.store.dispatch(new CambiaConfiguracionFooter(
            new FooterConfiguracion(
                ContratoMantenimientoEstatus.todos, false, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
    }

    Grid() {
        // ******************PARAMETROS DE PARA CHECKBOX**************** */
        this.Checkbox = { checkboxmode: 'none' };  // *desactivar con none*/
        this.CheckboxCotizacion = { checkboxmode: 'none' };
        this.CheckboxProveedor = { checkboxmode: 'single' };
        // ******************PARAMETROS DE PARA EDITAR GRID**************** */
        this.Editing = { allowupdate: false, mode: 'none' }; // *cambiar a batch para editar varias celdas a la vez*/
        this.EditingCotizacion = { allowupdate: false, mode: 'none' };
        this.EditingProveedor = { allowupdate: false, mode: 'none' };
        // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
        this.Columnchooser = { columnchooser: true };
        this.ColumnchooserCotizacion = { columnchooser: true };
        this.ColumnchooserProveedor = { columnchooser: true };
        // ******************PARAMETROS DE SEARCH**************** */
        this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
        this.searchPanelCotizacion = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
        this.searchPanelProveedor = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
        // ******************PARAMETROS DE SCROLL**************** */
        this.scroll = { mode: 'standard' };

        this.Color = { color: 'gris' };

        // ******************PARAMETROS DE TOOLBAR**************** */
        this.toolbar = [];
        this.toolbarCotizacion = [];
        this.toolbardetail = [];
        this.toolbardetailCotizacion = [];
        this.toolbardetailProveedor = [];

        this.detail = { detail: true };
        this.detailCotizacion = { detail: false };

        this.columns = [];
        this.columnsCotizacion = [];
        this.columnsProveedor = [];

        this.columnsCotizacion = [
            { caption: 'Numero cotización', dataField: 'numeroCotizacion' },
            { caption: 'Partida', dataField: 'idPartida' },
            { caption: 'Descripción', dataField: 'Descripcion' },
            { caption: 'Cantidad', dataField: 'cantidad' },
            { caption: 'Costo unitario', dataField: 'costo', format: 'currency' },
            { caption: 'Subtotal', dataField: 'subTotal', format: 'currency'},
            { caption: 'IVA', dataField: 'iva', format: 'currency'},
            { caption: 'Total', dataField: 'total', format: 'currency'}
        ];

        this.columnsProveedor = [
            { caption: 'Id sucursal', dataField: 'idProveedorEntidad' },
            { caption: 'Proveedor', dataField: 'rfcProveedor' },
            { caption: 'Razon social', dataField: 'razonSocial' },
            { caption: 'Nombre comercial', dataField: 'nombreComercial' },
            { caption: 'Contacto', dataField: 'personaContacto' },
        ];

        this.toolbarProveedor.push({
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              text: 'Cargar Factura',
              onClick: this.EventButtonDataGridProveedor.bind(this, 'Cargar Factura')
            }, visible: false,
            name: 'simple'
          });
    }

    GetProveedorCotizacionPorSolicitud() {
        this.spinner = true;
        this.siscoV3Service.getService(`solicitud/GetProveedoresCotizacionFactura?rfcEmpresa=${this.rfcEmpresa}&idCliente=${this.idCliente}&numeroContrato=${this.numeroContrato}&idSolicitud=${this.idSolicitud}&idTipoObjeto=${this.idTipoObjeto}&idClase=${this.idClase}`).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.Excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.Excepciones(res.excepcion, 3);
                } else {
                    this.todasCotizaciones = res.recordsets[0];
                    const partidasCotizaciones = this.todasCotizaciones.filter((dc) => !dc.uuid);

                    this.partidasCotizaciones = partidasCotizaciones;
                    // Obtenemos los proveedores de la solicitud.
                    this.proveedorEntidades = Array.from(new Set(this.partidasCotizaciones.map(s => s.idProveedorEntidad)))
                        .map(idProveedorEntidad => {
                            return { 
                                idProveedorEntidad,
                                nombreComercial: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).nombreComercialPE,
                                razonSocial: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).razonSocial,
                                personaContacto: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).contactoPE,
                                rfcProveedor: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).rfcProveedor
                            }
                        });
                    
                    // si el numero de proveedores de la solicitud es uno, entonces en automatico seleccionamos el proveedor para no mostrar el grid de proveedores.
                    if (this.proveedorEntidades.length === 1) {
                        this.ConfiguracionUnSoloProveedor();
                    }
                    
                    if(!this.allSolicitudes && this.rfcProveedor) {
                        // Obtener las partidas de la sucursal.
                        this.partidasCotizaciones = this.partidasCotizaciones.filter((partidas: IPartida) => {
                            return partidas.idProveedorEntidad === this.idProveedorEntidad
                        });
                        this.AgregarCostosPartida();
                    }


                }
            }, (error: any) => {
                this.spinner = false;
                this.Excepciones(error, 2);
            }
        );
    }

    GetProveedorCotizacionPorRFC() {
        this.spinner = true;
        this.siscoV3Service.getService(`solicitud/GetProveedoresCotizacionFacturaPorRFC?idClase=${this.idClase}&rfcProveedor=${this.rfcProveedor}`).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.err) {
                    this.Excepciones(res.err, 4);
                } else if (res.excepcion) {
                    this.Excepciones(res.excepcion, 3);
                } else {
                    this.todasCotizaciones = res.recordsets[0];
                    const partidasCotizaciones = this.todasCotizaciones.filter((dc) => !dc.uuid);

                    this.partidasCotizaciones = partidasCotizaciones;
                    this.todasPartidasCotizaciones = partidasCotizaciones;

                    // Obtenemos las sucursales de la solicitud.
                    this.proveedorEntidades = Array.from(new Set(this.partidasCotizaciones.map(s => s.idProveedorEntidad)))
                        .map(idProveedorEntidad => {
                            return { 
                                idProveedorEntidad,
                                nombreComercial: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).nombreComercialPE,
                                razonSocial: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).razonSocial,
                                personaContacto: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).contactoPE,
                                rfcProveedor: this.partidasCotizaciones.find(p => p.idProveedorEntidad === idProveedorEntidad).rfcProveedor
                            }
                        });
                    
                    // si el numero de sucursales de la solicitud es uno, entonces en automatico seleccionamos el proveedor para no mostrar el grid de proveedores.
                    if (this.proveedorEntidades.length === 1) {
                        this.ConfiguracionUnSoloProveedor();
                    }
                
                    this.AgregarCostosPartida();


                }
            }, (error: any) => {
                this.spinner = false;
                this.Excepciones(error, 2);
            }
        );
    }

    AgregarCostosPartida() {
        if (this.allSolicitudes && this.idProveedorEntidad) {
            // Obtener las partidas de la sucursal.
            this.partidasCotizaciones = this.todasPartidasCotizaciones.filter((partidas: IPartida) => {
                return partidas.idProveedorEntidad === this.idProveedorEntidad
            });
            this.spinner = false;
        }

        this.cotizaciones = [];
        this.totalProveedorEntidad = 0;
        this.totalPendienteProveedorEntidad = 0;
        this.totalFacturadoProveedorEntidad = 0;
        this.todasCotizaciones.forEach((coti) => {
            if (coti.idProveedorEntidad === this.idProveedorEntidad){
                this.totalProveedorEntidad += (coti.costo * coti.cantidad);
            }

            if (coti.idProveedorEntidad === this.idProveedorEntidad && coti.uuid !== null){
                this.totalFacturadoProveedorEntidad += (coti.costo * coti.cantidad);
            }
        });

        // calcular el costo de la cotizacion.
        this.partidasCotizaciones.forEach((partida, i) => {
            let costo = 0;
            costo = partida.costo * partida.cantidad;
            this.totalPendienteProveedorEntidad += costo;
            this.partidasCotizaciones[i].subTotal = costo;
            this.partidasCotizaciones[i].iva = costo * .16;
            this.partidasCotizaciones[i].total = costo + (costo * .16);

            this.partidasCotizaciones[i].pagada = false;
        });

        this.cotizaciones = this.partidasCotizaciones;

        this.showGrid = true;
    }

    Excepciones(error, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: 1,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'sel-solicitud-factura.component',
                    mensajeExcepcion: '',
                    stack: error
                }
            });

            dialogRef.afterClosed().subscribe((result: any) => {
                this.spinner = false;
            });
        } catch (error) {
            this.spinner = false;
        }
    }

    ngOnDestroy() {
        this.subsNegocio.unsubscribe();
    }

    ResultUploadFile($event: any) {
        this.numeroCotizacionesSeleccionadas = [];
        
        this.montoAplicado = 0;
        this.LimpiarDatosSeleccionados();
        if (this.datagrid) {
            this.datagrid.instance.clearSelection();
        }
        if ($event.error.length > 0) {
            if ($event.error[0].error) {
                this.snackBar.open($event.error[0].error, 'Ok');
            } else {
                this.snackBar.open($event.error[0], 'Ok');
            }
        } else {
            let archivos: any[] = $event.recordsets;
            this.partidasSeleccionadas = [];

            let facturaValida: boolean;
            let idDocumentoPdf = 0;
            archivos.forEach((archivo, index) => {
                if (archivo.tipo.trim().toLowerCase() === 'text/xml'.trim().toLowerCase()) {
                    let facturaXml = archivo.xml;
                    let Comprobante = facturaXml['cfdi:Comprobante'];
                    let atributos = Comprobante._attributes;
                    let complemento = Comprobante['cfdi:Complemento'];
                    let impuestos = Comprobante['cfdi:Impuestos']._attributes;
                    let emisor = Comprobante['cfdi:Emisor']._attributes;
                    let receptor = Comprobante['cfdi:Receptor']._attributes;
                    // Validar que el el rfc de la factura sea igual al rfcEmpresa
                    if (emisor.Rfc === this.rfcProveedor) {
                        this.subTotal = atributos.SubTotal;
                        this.nombreFactura = archivo.nombreOriginal;

                        // Calcular el total de iva.
                        let iva = 0;
                        for (const key in impuestos) {
                            if (impuestos.hasOwnProperty(key)) {
                                const element = parseFloat(impuestos[key]);
                                iva += element;
                            }
                        }

                        // Timbrado de la factura
                        let timbreFiscalDigital = complemento['tfd:TimbreFiscalDigital'];

                        this.facturaActual = {
                            archivos,
                            valida: facturaValida,
                            nombreFactura: this.nombreFactura,
                            uuid: timbreFiscalDigital._attributes.UUID,
                            serie: atributos.Serie,
                            folio: parseInt(atributos.Folio),
                            fechaFactura: atributos.Fecha,
                            rfcEmisor: emisor.Rfc,
                            rfcReceptor: receptor.Rfc,
                            subTotal: this.subTotal,
                            iva,
                            total: parseFloat(atributos.Total),
                            xml: JSON.stringify(archivo.xml),
                            idDocumentoXml: archivo.idDocumento
                        };
                        this.CheckboxCotizacion.checkboxmode = 'multiple';
                        this.snackBar.open('Se ha habilitado la selección de partidas para asigar a la factura.', 'Ok', { duration: 3000 });

                    } else {
                        this.facturaValida = false;
                        archivos[index].rfcValido = false;
                        this.snackBar.open('El RFC de la factura no coincide con el RFC de la empresa.', 'Ok', {
                            duration: 2000
                        });
                    }
                } else {
                    idDocumentoPdf = archivo.idDocumento;
                }
            });

            this.facturaActual.idDocumentoPdf = idDocumentoPdf;
        }
    }

    ValidarMontos(subTotalSeleccionado: number): boolean {
        if (this.subTotal >= subTotalSeleccionado) {
            return true;
        }
        return false
    }

    SeleccionRowMaster($event: any) {
        let event = $event.event;
        let cotizacionesSeleccionadas = [];

        let eventCotizacionesSeleccionadas: [] = event.currentSelectedRowKeys.filter(i => !i.disable);
        let eventCotizacionesDeseleccionadas: [] = event.currentDeselectedRowKeys.filter(i => !i.disable);

        if (eventCotizacionesSeleccionadas.length > 0) {
            let costoSeleccioando = 0;
            cotizacionesSeleccionadas = eventCotizacionesSeleccionadas;
            cotizacionesSeleccionadas.forEach(cotizacion => {
                costoSeleccioando += cotizacion.subTotal;
            });

            if (this.ValidarMontos(this.montoAplicado + costoSeleccioando)) {
                this.montoAplicado = this.montoAplicado + costoSeleccioando;
                cotizacionesSeleccionadas.forEach((cotizacion) => {
                    this.partidasSeleccionadas.push(cotizacion);
                });
                this.ObtenerNumeroCotizacionesSeleccionadas();
            } else {
                // quitamos la seleccion de row
                let dataGrid = event.component;

                dataGrid.deselectRows(event.currentSelectedRowKeys);
                this.snackBar.open('El monto restante es menor que la cotización seleccionada.', 'Ok', { duration: 3000 });
            }
        } else if (eventCotizacionesDeseleccionadas.length > 0) {
            let cotizaciones = [];
            cotizaciones = eventCotizacionesDeseleccionadas;
            cotizaciones.forEach((cotizacion) => {
                const index = this.partidasSeleccionadas.findIndex((part) => part.idPartida === cotizacion.idPartida && part.idCotizacion === cotizacion.idCotizacion);
                if (index >= 0) {
                    this.montoAplicado = this.montoAplicado - (cotizacion.costo * cotizacion.cantidad);
                    this.partidasSeleccionadas.splice(index, 1);
                }
            });
            this.ObtenerNumeroCotizacionesSeleccionadas();
        }
    }

    ObtenerNumeroCotizacionesSeleccionadas() {
        this.numeroCotizacionesSeleccionadas = Array.from(new Set(this.partidasSeleccionadas.map(s => s.idCotizacion)))
            .map(idCotizacion => {
                return {
                    idCotizacion: idCotizacion,
                    numeroCotizacion: this.partidasCotizaciones.find(p => p.idCotizacion === idCotizacion).numeroCotizacion
                }
            });
    }

    GuardarPartidas() {

        let cotizacionesSeleccionadas = Array.from(new Set(this.partidasSeleccionadas.map((s: IPartida) => s.idCotizacion)))
            .map(idCotizacion => {
                return {
                    idCotizacion: idCotizacion,
                    numeroCotizacion: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).numeroCotizacion,
                    idProveedorEntidad: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).idProveedorEntidad,
                    rfcProveedor: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).rfcProveedor,
                    idSolicitud: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).idSolicitud,
                    idTipoSolicitud: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).idTipoSolicitud,
                    rfcEmpresa: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).rfcEmpresa,
                    numeroContrato: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).numeroContrato,
                    idCliente: this.partidasSeleccionadas.find((p: IPartida) => p.idCotizacion === idCotizacion).idCliente,
                }
            });

        let xmlPartidas = '<partidas>';
        this.partidasSeleccionadas.forEach((partida: IPartida) => {
            xmlPartidas += '<partida>';
            xmlPartidas += '<idCotizacion>' + partida.idCotizacion + '</idCotizacion>';
            xmlPartidas += '<idSolicitud>' + partida.idSolicitud + '</idSolicitud>';
            xmlPartidas += '<idObjeto>' + partida.idObjeto + '</idObjeto>';
            xmlPartidas += '<idTipoObjeto>' + partida.idTipoObjeto + '</idTipoObjeto>';
            xmlPartidas += '<idTipoSolicitud>' + partida.idTipoSolicitud + '</idTipoSolicitud>';
            xmlPartidas += '<rfcEmpresa>' + partida.rfcEmpresa + '</rfcEmpresa>';
            xmlPartidas += '<rfcProveedor>' + this.rfcProveedor + '</rfcProveedor>';
            xmlPartidas += '<idProveedorEntidad>' + partida.idProveedorEntidad + '</idProveedorEntidad>';
            xmlPartidas += '<idPartida>' + partida.idPartida + '</idPartida>';
            xmlPartidas += '<montoAbonado>' + partida.subTotal + '</montoAbonado>';
            xmlPartidas += '</partida>';
        });
        xmlPartidas += '</partidas>';

        let xmlCotizaciones = '<cotizaciones>';
        cotizacionesSeleccionadas.forEach((cotizacion) => {
            xmlCotizaciones += '<cotizacion>';
            xmlCotizaciones += '<idCotizacion>' + cotizacion.idCotizacion + '</idCotizacion>';
            xmlCotizaciones += '<idProveedorEntidad>' + cotizacion.idProveedorEntidad + '</idProveedorEntidad>';
            xmlCotizaciones += '<idSolicitud>' + cotizacion.idSolicitud + '</idSolicitud>';
            xmlCotizaciones += '<idTipoSolicitud>' + cotizacion.idTipoSolicitud + '</idTipoSolicitud>';
            xmlCotizaciones += '<rfcEmpresa>' + cotizacion.rfcEmpresa + '</rfcEmpresa>';
            xmlCotizaciones += '<idCliente>' + cotizacion.idCliente + '</idCliente>';
            xmlCotizaciones += '<numeroContrato>' + cotizacion.numeroContrato + '</numeroContrato>';
            xmlCotizaciones += '</cotizacion>';
        });
        xmlCotizaciones += '</cotizaciones>';

        let parametros = {
            idClase: this.idClase,
            uuid: this.facturaActual.uuid,
            serie: this.facturaActual.serie,
            folio: this.facturaActual.folio,
            fechaFactura: this.facturaActual.fechaFactura,
            rfcEmisor: this.facturaActual.rfcEmisor,
            rfcReceptor: this.facturaActual.rfcReceptor,
            subTotal: parseFloat(this.facturaActual.subTotal),
            iva: this.facturaActual.iva,
            total: this.facturaActual.total,
            xml: this.facturaActual.xml,
            xmlPartidas,
            xmlCotizaciones,
            rfcProveedor: this.rfcProveedor,
            idDocumentoPdf: this.facturaActual.idDocumentoPdf,
            idDocumentoXml: this.facturaActual.idDocumentoXml
        };

        this.spinner = true;
        this.showFileUpload = false;
        this.siscoV3Service.postService('solicitud/PostInsFacturaSolicitudPartidas', parametros).subscribe((res: any) => {
            this.spinner = false;
            if (res.error) {
                this.snackBar.open(res.error, 'Ok', { duration: 2000 });
                this.showFileUpload = true;
            } else if (res.excepcion) {
                this.Excepciones(res.excepcion, 3);
                this.showFileUpload = true;
            } else {
                this.snackBar.open('Se ha guardado la factura.', 'Ok', { duration: 2000 });
                this.LimpiarDatosSeleccionados();
            }
        }, error => {
            this.spinner = false;
            this.LimpiarDatosSeleccionados();
            this.Excepciones(error, 1);
        });

    }

    LimpiarDatosSeleccionados() {
        this.showFileUpload = true;
        this.montoAplicado = 0;
        this.facturaActual = { archivos: null, valida: false, subTotal: 0, nombreFactura: '' };
        this.partidasSeleccionadas = [];
        this.CheckboxCotizacion = { checkboxmode: 'none' };
        this.numeroCotizacionesSeleccionadas = [];
        if(!this.allSolicitudes) {
            this.GetProveedorCotizacionPorSolicitud();
        } else {
            this.GetProveedorCotizacionPorRFC();
        }
    }

    DatosMessage($event) {
        this.datosevent = $event.data;
    }

    EventButtonDataGridProveedor($event: string) {
        switch ($event) {
          case 'Cargar Factura':
           if(this.datosevent[0]) {
               this.GetProveedorEntidad(this.datosevent[0]);
           }
            break;
        }
    }

    GetProveedorEntidad(proveedorEntidad: any) {
        this.idProveedorEntidad = null;
        setTimeout(() => {
            this.showFacturasCotizaciones = false;
            this.idProveedorEntidad = proveedorEntidad.idProveedorEntidad
            this.rfcProveedor = proveedorEntidad.rfcProveedor;
            
            if (this.allSolicitudes) {
                this.spinner = true;
                // Obtener las partidas de la sucursal.
                this.partidasCotizaciones = this.partidasCotizaciones.filter((partidas: IPartida) => {
                    return partidas.idProveedorEntidad === this.idProveedorEntidad
                });
                this.AgregarCostosPartida();
                this.showFacturasCotizaciones = true;
            } else {
                // Obtener las partidas del proveedor.
                this.GetProveedorCotizacionPorSolicitud();
                this.showFacturasCotizaciones = true;
            }
        }, 2000);
    }

    ConfiguracionUnSoloProveedor() {
        this.idProveedorEntidad = null;
        this.showBannerTaller = true;
        this.rfcProveedor = this.proveedorEntidades[0].rfcProveedor;
        this.idProveedorEntidad = this.proveedorEntidades[0].idProveedorEntidad;
        this.showFacturasCotizaciones = true;
       
    }

    onInitialized($event) {
        this.datagrid = $event;
    }
}

export interface IPartida {
    cantidad: number;
    costo: number;
    subTotal: number;
    costoInicial: number;
    fechaEstatus: string;
    idClase: string;
    idCliente: number;
    idCotizacion: number;
    idEstatusCotizacionPartida: string;
    idObjeto: number;
    idPartida: number;
    idProveedorEntidad: number;
    idSolicitud: number;
    idTipoObjeto: number;
    idTipoSolicitud: string;
    nombreCompleto: string;
    nombreEstatus: string;
    numeroContrato: string;
    numeroCotizacion: string;
    pagada: boolean;
    rfcEmpresa: string;
    rfcProveedor: string;
    venta: number;
    ventaInicial: number;
    estatusPago: string;
}
