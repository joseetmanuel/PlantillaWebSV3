import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from '../../services/siscov3.service';
import {
  IGridOptions,
  TiposdeFormato,
  IFileUpload
} from '../../interfaces';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { selectAuthState, AppState, selectContratoState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { Negocio } from 'src/app/models/negocio.model';
import { BaseService } from 'src/app/services/base.service';
import { SessionInitializer } from 'src/app/services/session-initializer';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { StickyThingDirective } from '@w11k/angular-sticky-things';

@Component({
  selector: 'app-ins-solicitud-prefactura',
  templateUrl: './ins-solicitud-prefactura.component.html'
})

export class InsSolicitudPrefacturaComponent implements OnInit, OnDestroy {
  spinner: boolean;
  objetos: any[] = [];
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-ins-solicitud-prefactura';
  idClase = '';
  modulo: any = {};
  breadcrumb: any[];
  idUsuario: number;
  contratoActual: any;

  // Variables para Redux
  private getStateNegocio: Observable<any>;
  getState: Observable<any>;
  subsNegocio: any;

  // Gird Ordenes
  Checkbox: { checkboxmode: string; };
  Editing: { allowupdate: boolean; mode: string; };
  Columnchooser: { columnchooser: boolean; };
  searchPanel: { visible: boolean; width: number; placeholder: string; filterRow: boolean; };
  scroll: { mode: string; };
  toolbar: any[];
  columns: any[] = [];
  gridOptions: IGridOptions;
  datosevent: any = [];

  //Detalle copade
  public copadeForm: FormGroup;
  xmlCopade:string;

  IUploadFile: IFileUpload;
  dateCita = moment();
  subtotalCopade: number;
  datagrid: any;
  subtotalFormCopade = 0;
  facturaXml: any;
  numeroEstimacion: string;
  objetosSolicitudes: any;
  numeroCopade: any;
  mostrarGridOrdenes: boolean;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    private baseService: BaseService,
    private sessionInitializer: SessionInitializer,
    private currencyPipe: CurrencyPipe,
    private store: Store<AppState>) {

    this.getStateNegocio = this.store.select(selectContratoState);

    this.copadeForm = new FormGroup({
      agrupador: new FormControl({ value: 'Por asignar', disabled: true }, []),
      numeroCopade: new FormControl({ value: '', disabled: true }, []),
      subtotal: new FormControl({ value: '0', disabled: true }, [Validators.pattern('^[1-9][0-9]?$|^100$')]),
      fechaLLegada: new FormControl(this.dateCita, []),
      horaLlegada: new FormControl(this.dateCita, [Validators.required]),
      fechaCarga: new FormControl({ value: moment(), disabled: true }, [])
    });
  }

  ngOnInit() {
    this.xmlCopade = null;
    try {
      if (this.sessionInitializer.state) {
        const usuario = this.baseService.getUserData();
        this.idUsuario = usuario.user.id;
        this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
          if (stateNegocio.claseActual) {
            this.idClase = stateNegocio.claseActual;
            this.contratoActual = stateNegocio.contratoActual;
  
            this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
            if (this.modulo.breadcrumb) {
              this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
            }
  
            if (this.contratoActual) {
              this.contratoActual.requiereCopade = true;
              this.GetSolicitudOrdenesPrefactura();
              if (!this.contratoActual.requiereCopade) {
                this.mostrarGridOrdenes = true;
              } else {
                this.mostrarGridOrdenes = false;
              }
            }
  
            if (stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
              this.ConfigurarFooter(false);
            } else {
              this.ConfigurarFooter(true);
            }
  
            this.IUploadFile = {
              path: this.idClase, idUsuario: this.idUsuario,
              idAplicacionSeguridad: environment.aplicacionesId,
              idModuloSeguridad: 1, multiple: false, soloProcesar: false
              , extension: ['.xml'], titulo: '',
              descripcion: '', tipodecarga: 'instantly'
            };

          }

        });

        this.Grid();
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  Grid() {
    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false, mode: 'none' }; // *cambiar a batch para editar varias celdas a la vez*/
    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };
    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };

    // ******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [];

    this.columns = [];

    this.columns = [
      { caption: 'Número de la órden', dataField: 'numeroOrden' },
      { caption: 'Número económico', dataField: 'numeroEconomico' },
      { caption: 'Sub total', dataField: 'subtotal', format: TiposdeFormato.moneda }
    ];
  }

  GetSolicitudOrdenesPrefactura() {
    this.objetosSolicitudes = [];
    this.objetos = [];
    this.numeroCopade = null;
    this.numeroEstimacion = null;
    this.spinner = true;
    this.siscoV3Service.getService(`solicitud/GetSolicitudSinPrefactura?numeroContrato=${this.contratoActual.numeroContrato}
      &idCliente=${this.contratoActual.idCliente}&rfcEmpresa=${this.contratoActual.rfcEmpresa}&idClase=${this.contratoActual.idClase}`)
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.objetosSolicitudes = res.recordsets[0];
          if (this.objetosSolicitudes.length > 0) {
            this.objetos = Array.from(new Set(this.objetosSolicitudes.map((s) => s.numeroOrden)))
            .map(numeroOrden => {
                let subtotal = 0;
                this.objetosSolicitudes.forEach(element => {
                  if (element.numeroOrden === numeroOrden) {
                    subtotal += element.subtotal;
                  }
                });

                return {
                    numeroOrden,
                    numeroEconomico: this.objetosSolicitudes.find((p) => p.numeroOrden === numeroOrden).numeroEconomico,
                    subtotal
                }
            });
          }
          this.spinner = false;
        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
  }


  /*
  Se toma la configuración de que se bloquee la apertura y no realice cambios sobre el footer
  */
 ConfigurarFooter(abrir: boolean) {
  this.store.dispatch(new CambiaConfiguracionFooter(
    new FooterConfiguracion(
      ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
}

  DatosMessage($event: any) {
    const event = $event.event;
    this.datosevent = $event.data;

    let eventCotizacionesSeleccionadas: [] = event.currentSelectedRowKeys.filter(i => !i.disable);
    let eventCotizacionesDeseleccionadas: [] = event.currentDeselectedRowKeys.filter(i => !i.disable);

    if (eventCotizacionesSeleccionadas.length > 0) {
        if (!this.xmlCopade) {
          this.copadeForm.controls.subtotal.setValue(this.GetTotalSeleccionadas($event.data));
        } else {
          const subtotalSeleccionadas = this.GetTotalSeleccionadas($event.data);
          if (subtotalSeleccionadas > this.subtotalCopade) {
            let dataGrid = event.component;
            dataGrid.deselectRows(event.currentSelectedRowKeys);
            this.snackBar.open('El subtotal del copade es menor que el subtotal de órdenes seleccionadas.', 'Ok', { duration: 2000 });
          }
        }
    } else if (eventCotizacionesDeseleccionadas.length > 0) {
      if (!this.xmlCopade) {
        this.copadeForm.controls.subtotal.setValue(this.GetTotalSeleccionadas($event.data));
      }
    } 
  }

  GetTotalSeleccionadas(seleccionadas): number {
    let total = 0;
    seleccionadas.forEach(element => {
      total += element.subtotal;
    });

    return total;
  }

  ngOnDestroy(): void {
    this.subsNegocio.unsubscribe();
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
          moduloExcepcion: 'ins-solicitud-prefactura.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

  ResultUploadFile($event) {
    if ($event.recordsets.length > 0) {
      const archivo = $event.recordsets[0];
      this.facturaXml = archivo.xml;
      this.xmlCopade = archivo;
      const Comprobante = this.facturaXml['PreFactura']['Comprobante'];
      const addendaPemex = this.facturaXml['PreFactura']['cfdi:Addenda']['pm:Addenda_Pemex'];
      const estimacion = addendaPemex['pm:N_ESTIMACION']._text;
      this.numeroEstimacion = estimacion.split(',')[0];
      this.numeroCopade = addendaPemex['pm:O_SURTIMIENTO']._text;
      let atributos = Comprobante._attributes;
      this.subtotalCopade = parseFloat(atributos.subtotal);
      this.copadeForm.controls.subtotal.setValue(atributos.subtotal);
      
      if (this.numeroEstimacion && this.numeroCopade) {
        this.mostrarGridOrdenes = true;
        this.copadeForm.controls.agrupador.setValue(this.numeroEstimacion);
        this.copadeForm.controls.numeroCopade.setValue(this.numeroCopade);
      }
      if (this.datagrid) {
        this.datagrid.instance.clearSelection();
      }
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  onInitialized($event) {
    this.datagrid = $event;
  }

  GenerarPrefactura() {
    const subtotalSeleccionado = this.GetTotalSeleccionadas(this.datosevent);
    const subtotalCargado = parseFloat(this.copadeForm.controls.subtotal.value) ? parseFloat(this.copadeForm.controls.subtotal.value): 0;
    
    if (subtotalSeleccionado == subtotalCargado) {
      
      const fechaCita = new Date(this.copadeForm.controls.fechaLLegada.value);
      const horaCita = new Date(this.copadeForm.controls.horaLlegada.value);
      const fechaLlegadaCopade = new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate(), horaCita.getHours(), horaCita.getMinutes());

      const ordenesSeleccionadas = this.datosevent;
      let xmlFacturas = '<facturas>';
      ordenesSeleccionadas.forEach((orden) => {
        this.objetosSolicitudes.forEach(ordenSolicitud => {
          if (ordenSolicitud.numeroOrden === orden.numeroOrden) {
            xmlFacturas += '<factura>';
            xmlFacturas += '<idFactura>' + ordenSolicitud.idFactura + '</idFactura>';
            xmlFacturas += '</factura>';
          }
        });
      });

      xmlFacturas += '</facturas>';

      let solicitudes = [];

      ordenesSeleccionadas.forEach((orden) => {
        this.objetosSolicitudes.forEach(ordenSolicitud => {
          if (ordenSolicitud.numeroOrden === orden.numeroOrden) {
            solicitudes.push({ idSolicitud: ordenSolicitud.idSolicitud, idTipoSolicitud: ordenSolicitud.idTipoSolicitud });
          }
        });
      });

      // quitar las solicitudes repetidas
      const solicitudesUnicos = Array.from(new Set(solicitudes.map((s) => s.idSolicitud)))
            .map(idSolicitud => {
              return {
                idSolicitud,
                idTipoSolicitud: solicitudes.find((p) => p.idSolicitud === idSolicitud).idTipoSolicitud
              }
            });
      
          let xmlSolicitudes = '<solicitudes>';
          solicitudesUnicos.forEach((sol) => {
            xmlSolicitudes += '<solicitud>';
            xmlSolicitudes += '<idSolicitud>' + sol.idSolicitud + '</idSolicitud>';
            xmlSolicitudes += '<idTipoSolicitud>' + sol.idTipoSolicitud + '</idTipoSolicitud>';
            xmlSolicitudes += '</solicitud>';
          });
    
          xmlSolicitudes += '</solicitudes>';

      const paramsOrdenGlobal = {
        idClase: this.idClase,
        rfcEmpresa: this.contratoActual.rfcEmpresa,
        idCliente: this.contratoActual.idCliente,
        numeroContrato: this.contratoActual.numeroContrato,
        fechaCarga: moment(),
        fechaRecepcion: fechaLlegadaCopade,
        numeroCopade: this.numeroCopade,
        numeroEstimacion: this.numeroEstimacion,
        subtotal: subtotalCargado,
        total:	subtotalCargado + (subtotalCargado * 0.16),
        xml:	JSON.stringify(this.facturaXml),
        xmlFacturas,
        xmlSolicitudes
      };

      this.spinner = true;
      this.siscoV3Service.postService('solicitud/PostFacturaAgrupada', paramsOrdenGlobal).subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.snackBar.open('Se ha guardado correctamente.', 'Ok', {
            duration: 2000
          });

          this.router.navigate(['sel-solicitud-paso/ProvisionAprobada/0']);
        }
      }, error => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });

    } else {
      this.snackBar.open('La suma de los subtatales de las órdenes seleccionadas debe ser igual al subtotal del COPADE.', 'Ok', {
        duration: 3000
      });
    }
  }
}
