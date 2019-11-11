import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IViewer, IViewertipo, IViewersize } from '../../interfaces';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import {
  FormGroup,
  Validators,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../../interfaces';
import { IFileUpload } from '../../interfaces';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ins-doccumento',
  templateUrl: './ins-documento.component.html',
  styleUrls: ['./ins-documento.component.scss'],
  providers: [SiscoV3Service]
})
export class AddDoctoComponent implements OnInit, OnDestroy {

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  state;
  breadcrumb: any[];
  claveModulo = 'app-ins-doccumento';
  modulo: any = {};

  IViewer: IViewer[];
  public total = 0;
  public doc = [];
  documentoForm = new FormGroup({
    idTipoDocumento: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    idDocumento: new FormControl('', [Validators.required])
  });

  gridOptions: IGridOptions;
  columns: IColumns[];
  columDoc: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  toolbarDoc: Toolbar[];
  cienteEntidad = [];
  documentos = [];
  public doctosName = [];
  clienteDocumento;

  bandAgregar = false;
  band = false;
  desactivaragregar = true;

  ruta: any;

  IUploadFile: IFileUpload;
  public idCliente;
  public datos;
  public numero = 1;
  public documentosLoad;
  url;
  public idDocumento;
  public disabled = true;
  public recarga = 1;
  public datosevent;
  public titulo;
  subsNegocio: Subscription;

  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('1')
  });

  constructor(
    private snackBar: MatSnackBar,
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
  ) {
    try {
      this.getStateUser = this.store.select(selectAuthState);
      this.getStateNegocio = this.store.select(selectContratoState);
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  ngOnInit() {
    try {
      this.getStateUser.subscribe((state) => {
        if (state && state.seguridad) {
          this.idUsuario = state.seguridad.user.id;
          this.documentoForm.controls.idUsuario.setValue(this.idUsuario);
          this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
            if (state2 && state2.claseActual) {
              this.state = state;
              this.idClase = state2.claseActual;
              this.url = environment.fileServerUrl;
              this.loadData(this.state);
              this.table();
            }
          });
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  table() {
    const ext = [];
    ext.push('.jpg', '.jpeg', '.png', '.pdf', '.JPG', '.JPEG', '.PNG', '.PDF');

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
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
      tipodecarga: 'instantly'
    };
    /*
    Columnas de la tabla Documentos
    */
    this.columDoc = [
      {
        caption: 'Tipo documento',
        dataField: 'tipo',
        hiddingPriority: '1'
      },
      {
        caption: 'Nombre Documento',
        dataField: 'titulo',
        hiddingPriority: '1'
      },
      {
        caption: 'Documento',
        dataField: 'path',
        cellTemplate: 'foto',
        hiddingPriority: '1'
      }
    ];

    /*
    Parametros de Paginacion de Grit
    */
    const pageSizes = [];
    pageSizes.push('10', '25', '50', '100');

    /*
    Parametros de Exploracion
    */
    this.exportExcel = { enabled: true, fileName: 'prueba2' };

    /*
    Parametros de Search
    */
    this.searchPanel = {
      visible: true,
      width: 200,
      placeholder: 'Buscar...',
      filterRow: true
    };

    /*
    Parametros de Scroll
    */
    this.scroll = { mode: 'standard' };

    /*
    Parametros de Toolbar Documentos
    */
    this.toolbarDoc = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 90,
          text: 'Eliminar',
          onClick: this.receiveMessageDoc.bind(this, 'delete')
        },
        visible: false,
        name: 'simple'
      }
    ];
  }

  /**
   * @description Obtenemos la data del componente 'grid-component'
   * @param $event Data del 'grid-component'
   * @returns Data en formato Json
   * @author Gerardo Zamudio González
   */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessageDoc($event) {
    try {
      this.evento = $event.event;
      if (this.evento === 'delete') {
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


  /**
   * @description Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @returns Abre el deleteDialog para eliminar el dato
   * @author Gerardo Zamudio González
   */
  deleteDoc(data) {
    try {
      let borrar = '<Ids>';
      let cont = 0;
      const that = this;
      data.data.forEach((element, index, array) => {
        // tslint:disable-next-line:max-line-length
        borrar +=
          '<idDocumento>' +
          element.idDocumento +
          '</idDocumento>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          that.deleteData('cliente/deleteClienteDocumento', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Carga Toda la data que se va a mostrar en la pagina
   * @returns Llena las variables globales para mostrarlas en la pagina
   * @author Gerardo Zamudio González
   */
  loadData(state) {
    try {
      this.band = false;
      this.IViewer = [
        {
          idDocumento: this.idUsuario,
          tipo: IViewertipo.gridimagenes,
          descarga: false,
          size: IViewersize.md
        }
      ];
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idCliente: this.idCliente }]);
        }
        if (this.modulo.camposClase.find(x => x.nombre === 'Agregar')) {
          this.bandAgregar = true;
        }
        this.getCliente();
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Carga de archivo
   * @param $event Detalle del archivo cargado
   * @param index Posición de la propiedad
   * @returns Resultado de la carga del archivo
   * @author Edgar Mendoza Gómez
   */
  ResultUploadFile($event) {
    if ($event.recordsets.length > 0) {
      this.documentoForm.controls.idDocumento.setValue($event.recordsets[0].idDocumento);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  /**
   * @description Obtenemos los datos del Cliente
   * @returns Llena la variable datos con los datos del cliente para mostrarlos en la página
   * @author Gerardo Zamudio González
   */
  getCliente() {
    this.siscoV3Service
      .getService('cliente/getClientePorId?idCliente=' + this.idCliente)
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.datos = res.recordsets[0][0];
            this.getTipoDocumentos();
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }


  /**
   * @description Obtenemos los Tipos de documentos disponibles de la base de datos
   * @author Gerardo Zamudio González
   */
  getTipoDocumentos() {
    this.siscoV3Service
      .getService('cliente/getTipoDocumento')
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.documentosLoad = res.recordsets[0];
            this.cienteEntidad = res.recordsets[0];
            this.getDocumentosCliente();
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 1);
        }
      );
  }


  /**
   * @description Obtenemos los Documentos del Cliente
   * @returns MUestra los documentos del cliente en la página
   * @author Gerardo Zamudio González
   */
  getDocumentosCliente() {
    this.siscoV3Service
      .getService(
        'cliente/getClienteDocumentoPorIdCliente?idCliente=' +
        this.idCliente
      )
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            // this.doctosName = [];
            const getDocumentos = [];
            /*
            Mapeaamos para enviar la data en el formato correcto
            */
            res.recordsets[0].map(doc =>
              getDocumentos.push(
                doc.idDocumento
              )
            );
            this.total = getDocumentos.length;
            this.getDocumentos(getDocumentos);
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Obtenemos los documentos del cliente para llenar la tabla
   * @param getDocumentos Id's de los documentos
   * @returns Todos los documentos disponibles del cliente
   * @author Gerardo Zamudio González
   */
  getDocumentos(getDocumentos) {
    const data = {
      documentos: getDocumentos
    }

    console.log(data);
    this.httpClient
      .post(
        this.url +
        'documento/GetDocumentosById', data)
      .subscribe(
        (res: any) => {
          this.doc = [];
          this.documentos = res.recordsets;
          let exten;
          let con = 0;
          this.documentos.forEach((d: any) => {
            exten = d.path.split('.');
            this.doc[con] = {
              extencion: exten.slice(-1)[0],
              activo: d.activo,
              descripcion: d.descripcion,
              fechaCreacion: d.fechaCreacion,
              idAplicacion: d.idAplicacion,
              idDocumento: d.idDocumento,
              idModulo: d.idModulo,
              idUsuario: d.idUsuario,
              nombre: d.nombre,
              nombreOriginal: d.nombreOriginal,
              path: d.path,
              size: d.size,
              tipo: d.tipo,
              titulo: d.titulo,
              ultimaActualizacion:
                d.ultimaActualizacion
            };
            con++;
          });
          this.numero = 1;
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Cambiamos el valor de Disable para habilitar el botón de agregar un documento
   * @returns Activa el boton de agregar
   * @author Gerardo Zamudio González
   */
  test() {
    this.disabled = false;
  }

  /**
   * @description Prepara el documento para ser insertado
   * @param fileUploader Datos del documento
   * @returns Ejecuta el metodo insDocumento()
   * @author Gerardo Zamudio González
   */
  insDocto() {
    try {
      const documento = this.documentoForm.controls.idTipoDocumento.value;
      const desc = documento.descripcion;
      const idTipoDocumento = documento.idTipoDocumento;
      this.insDocumento(idTipoDocumento);
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  onSelectionChanged(e) {
    this.IUploadFile.titulo = e.descripcion;
    this.IUploadFile.descripcion = e.descripcion;
    this.band = true;
  }


  /**
   * @description Inserta un documento en el FileServer
   * @param idTipoDocumento El id del Tipo de documento
   * @returns Ejecuta el metodo insClienteDocumento()
   * @author Gerardo Zamudio González
   */
  insDocumento(idTipoDocumento) {
    const data = {
      idCliente: this.idCliente,
      idTipoDocumento,
      idDocumento: this.documentoForm.controls.idDocumento.value,
      idUsuario: this.idUsuario
    };
    this.insClienteDocumento(data);
  }

  /**
   * @description Insertamos el documento en la tabla ClienteDocumento
   * @param data Los datos que vamos a insertar en la tabla ClienteDocumento
   * @returns Regarca la página
   * @author Gerardo Zamudio González
   */
  insClienteDocumento(data) {
    this.siscoV3Service
      .postService('cliente/postInsClienteDocumento', data)
      .subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.snackBar.open(
              'Documento agregado exitosamente.',
              'Ok',
              {
                duration: 2000
              }
            );
            this.numero = 1;
            this.recarga = 0;
            this.recarga = 1;
            this.documentoForm.reset();
            this.disabled = true;
            this.documentoForm.controls.idUsuario.setValue(this.idUsuario);
            this.loadData(this.state);
            this.ngOnInit();
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Abre el dialog delete-alert
   * @param url La Url para eliminar un documento
   * @param datos Los datos que se van a eliminar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
  deleteData(url: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '500px',
        data: {
          ruta: url,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.loadData(this.state);
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ins-documento.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        this.numero = 1;
      });
    } catch (error) {
      this.numero = 1;
      console.error(error);
    }
  }
}
