import { Component, OnInit, AfterContentInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from '../../../../../environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../../../models/negocio.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upd-proveedor-equipamiento',
  templateUrl: './upd-proveedor-equipamiento.component.html',
  styleUrls: ['./upd-proveedor-equipamiento.component.scss'],
  providers: [SiscoV3Service]
})
export class UpdProveedorEquipamientoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;

  claveModulo = 'app-upd-proveedor-equipamiento';
  modulo: any = {};
  breadcrumb: any[];
  state;

  subsNegocio: Subscription;

  public numero = 1;
  ruta: any;
  public rfcEmpresa: any;
  public idCliente: any;
  public numeroContrato: any;
  public idActividad: any;
  proveedores: any;
  IUploadFile: IFileUpload;
  url: string;
  monedas: any;

  total: any;
  doc: any;
  datosevent: any;
  evento: string;
  IViewerCotizacion: IFileUpload;
  IViewerFactura: IFileUpload;
  bandCot = false;
  bandFac = false;
  band = false;

  provedoresForm = new FormGroup({
    rfcEmpresa: new FormControl('', [Validators.required]),
    idCliente: new FormControl('', [Validators.required]),
    numeroContrato: new FormControl('', [Validators.required]),
    idActividad: new FormControl('', [Validators.required]),
    rfcProveedor: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    cotizacion: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]),
    idMoneda: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    idFileFactura: new FormControl(''),
    idFileCotizacion: new FormControl('')
  });

  /*
 Obtenemos la data del componente 'grid-component'.
 */
  datosMessage($event: { data: any; }) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar (documento).
  */
  receiveMessageDoc($event: { event: any; }) {
    try {
      this.evento = $event.event;
      if (this.evento === 'add') {
        const senddata = {
          event: $event
        };
        this.addDoc(senddata);
      } else if (this.evento === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.deleteDoc(senddata);
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Función Agregar que rdirige a la pagina ins-documento
  */
  addDoc(data: { event: any; }) { }

  deleteDoc(data: { event: any; data: any; }) {
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private httpClient: HttpClient,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.url = environment.fileServerUrl;
  }

  ngOnInit() {
    this.getStateUser.subscribe((state) => {
      this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
        if (state.seguridad) {
          this.idUsuario = state.seguridad.user.id;
          this.provedoresForm.controls.idUsuario.setValue(this.idUsuario);
          if (state2.claseActual) {
            this.state = state;
            this.idClase = state2.claseActual;
            this.getParams(this.state);
            // this.documentoExtenciones();
          }
        }
      });
    });
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }


  /**
   * Obtiene los parametros de la url y asigna los valores por default al provedoresForm
   */
  getParams(state) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.numeroContrato = parametros.numeroContrato;
      this.idActividad = parametros.idActividad;
      this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

      if (this.modulo.breadcrumb) {
        // tslint:disable-next-line:max-line-length
        this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ rfcEmpresa: this.rfcEmpresa }, { numeroContrato: this.numeroContrato }, { idCliente: this.idCliente }, {idActividad: this.idActividad}]);
      }
      this.ruta = [
        {
          label: 'home',
          url: '/home-cliente'
        },
        {
          label: 'Contratos',
          url: '/sel-contratos'
        },
        {
          label: 'Configura equipamiento contrato',
          url: `/conf-equipamiento-contrato/${this.rfcEmpresa}/${
            this.numeroContrato
            }/${this.idCliente}`
        },
        {
          label: 'Edita proveedor equipamiento',
          url: `/upd-proveedor-equipamiento/${this.rfcEmpresa}/${
            this.numeroContrato
            }/${this.idCliente}/${this.idActividad}`
        }
      ];
      this.provedoresForm.controls.rfcEmpresa.setValue(this.rfcEmpresa);
      this.provedoresForm.controls.idCliente.setValue(this.idCliente);
      this.provedoresForm.controls.numeroContrato.setValue(
        this.numeroContrato
      );
      this.provedoresForm.controls.idActividad.setValue(
        this.idActividad
      );
      this.loadProveedorEquipamiento();
      this.getProveedores();
      this.getMonedas();
    });
  }

  /**
   * Obtiene los proveedores para llenar el select.
   */
  getProveedores() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        `contrato/proveedor/listado/${this.rfcEmpresa}/${this.idCliente}/${
        this.numeroContrato
        }`
      )
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.proveedores = res.recordsets[0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * Obtiene las monedas disponibles para llenar el select
   */
  getMonedas() {
    this.numero = 0;
    this.siscoV3Service.getService('common/moneda/lista').subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          this.monedas = res.recordsets[0];
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * Craga los datos del proveeedor equipamiento que se va a actualizar
   */
  loadProveedorEquipamiento() {
    this.band = false;
    this.bandCot = false;
    this.bandFac = false;
    this.numero = 0;
    // tslint:disable-next-line:max-line-length
    this.siscoV3Service.getService(`contrato/actividad/unidad/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}/${this.idActividad}`).subscribe(
      (res: any) => {
        this.numero = 1;
        if (res.err) {
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.excepciones(res.excepcion, 3);
        } else {
          const proveedorData = res.recordsets[0][0];
          this.loadData(proveedorData);
        }
      }, (error: any) => {
        this.numero = 1;
        this.excepciones(error, 2);
      }
    );
  }

  /**
   * Llena en los inputs los datos del proveedor
   */
  loadData(data) {
    let cotizacion;
    let factura;
    const ext = ['.pdf'];
    this.provedoresForm.controls.rfcProveedor.setValue(data.rfcProveedor);
    this.provedoresForm.controls.nombre.setValue(data.nombre);
    this.provedoresForm.controls.cotizacion.setValue(data.cotizacion);
    this.provedoresForm.controls.idMoneda.setValue(data.idMoneda);
    if (data.idFileCotizacion !== null) {
      cotizacion = data.idFileCotizacion;
      this.bandCot = true;
      this.band = true;
      this.IViewerCotizacion = {
        path: this.idClase,
        idUsuario: this.idUsuario,
        idAplicacionSeguridad: environment.aplicacionesId,
        idModuloSeguridad: 1,
        multiple: false,
        soloProcesar: false,
        extension: ext,
        titulo: '',
        descripcion: '',
        previsualizacion: true,
        idDocumento: cotizacion
      };
    } else {
      this.bandCot = true;
      this.band = true;
      this.IViewerCotizacion = {
        path: this.idClase,
        idUsuario: this.idUsuario,
        idAplicacionSeguridad: environment.aplicacionesId,
        idModuloSeguridad: 1,
        multiple: false,
        soloProcesar: false,
        extension: ext,
        titulo: '',
        descripcion: '',
        previsualizacion: true
      };
    }
    if (data.idFileFactura !== null) {
      factura = data.idFileFactura;
      this.band = true;
      this.bandFac = true;
      this.IViewerFactura = {
        path: this.idClase,
        idUsuario: this.idUsuario,
        idAplicacionSeguridad: environment.aplicacionesId,
        idModuloSeguridad: 1,
        multiple: false,
        soloProcesar: false,
        extension: ext,
        titulo: '',
        descripcion: '',
        previsualizacion: true,
        idDocumento: factura
      };
    } else {
      this.band = true;
      this.bandFac = true;
      this.IViewerFactura = {
        path: this.idClase,
        idUsuario: this.idUsuario,
        idAplicacionSeguridad: environment.aplicacionesId,
        idModuloSeguridad: 1,
        multiple: false,
        soloProcesar: false,
        extension: ext,
        titulo: '',
        descripcion: '',
        previsualizacion: true
      };
    }
  }



  /**
   * Carga las extenciones disponibles del documento.
   */
  documentoExtenciones() {
    const ext = [];
    ext.push('.pdf');

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IViewerCotizacion = {
      path: this.idClase,
      idUsuario: this.idUsuario,
      idAplicacionSeguridad: environment.aplicacionesId,
      idModuloSeguridad: 1,
      multiple: false,
      soloProcesar: false,
      extension: ext,
      titulo: '',
      descripcion: '',
      previsualizacion: true
    };

    this.IViewerFactura = {
      path: this.idClase,
      idUsuario: this.idUsuario,
      idAplicacionSeguridad: environment.aplicacionesId,
      idModuloSeguridad: 1,
      multiple: false,
      soloProcesar: false,
      extension: ext,
      titulo: '',
      descripcion: '',
      previsualizacion: true
    };
    this.band = true;
  }

  /**
   * Actualiza los datos del Proveedore-equipamiento (No sus documentos)
   */
  updProveedorEquipamiento() {
    const data = {
      rfcEmpresa: this.provedoresForm.controls.rfcEmpresa.value,
      idCliente: this.provedoresForm.controls.idCliente.value,
      numeroContrato: this.provedoresForm.controls.numeroContrato.value,
      idActividad: this.provedoresForm.controls.idActividad.value,
      rfcProveedor: this.provedoresForm.controls.rfcProveedor.value,
      nombre: this.provedoresForm.controls.nombre.value,
      cotizacion: this.provedoresForm.controls.cotizacion.value,
      idMoneda: this.provedoresForm.controls.idMoneda.value,
      // idUsuario: this.provedoresForm.controls.idUsuario.value,
      idFileCotizacion: this.provedoresForm.controls.idFileCotizacion.value,
      idFileFactura: this.provedoresForm.controls.idFileFactura.value
    };
    this.updateData(`contrato/actividad/actualiza/unidad`, data);
  }


  /**
   * @description Carga de archivo
   * @param $event Detalle del archivo cargado
   * @param index Posición de la propiedad
   * @returns Resultado de la carga del archivo
   * @author Edgar Mendoza Gómez
   */

  ResultUploadFileCotizacion($event) {
    if ($event.recordsets.length > 0) {
      this.provedoresForm.controls.idFileCotizacion.setValue($event.recordsets[0].idDocumento);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  ResultUploadFileFactura($event) {
    if ($event.recordsets.length > 0) {
      this.provedoresForm.controls.idFileFactura.setValue($event.recordsets[0].idDocumento);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  /*
  Abre el dialog update-alert
  */
  // tslint:disable-next-line:max-line-length
  updateData(url: any, datos: { rfcEmpresa: any; idCliente: any; numeroContrato: any; idActividad: any; rfcProveedor: any; nombre: any; cotizacion: any; idMoneda: any; }) {
    try {
      const dialogRef = this.dialog.open(UpdateAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.ngOnInit();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  excepciones(error: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'upd-proveedor-equipamiento.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) { }
  }

}
