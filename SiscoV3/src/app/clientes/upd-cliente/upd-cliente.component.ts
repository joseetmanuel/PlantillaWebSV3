import { Component, OnInit, OnDestroy } from '@angular/core';
import { IViewer, IViewertipo, IViewersize } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MDCDialog } from '@material/dialog';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  IColumnHiding,
  ICheckbox,
  IEditing,
  IColumnchooser,
  TiposdeDato,
  TiposdeFormato,
  IFileUpload

} from '../../interfaces';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { Observable } from 'rxjs/Observable';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-upd-cliente',
  templateUrl: './upd-cliente.component.html',
  styleUrls: ['./upd-cliente.component.scss'],
  providers: [SiscoV3Service]
})
export class EditClienteComponent implements OnInit, OnDestroy {
  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  claveModulo = 'app-upd-cliente';
  modulo: any = {};
  breadcrumb: any[];
  ruta: any;
  IUploadFile: IFileUpload;
  IViewer: IViewer[];
  IViewer2;
  idClase;
  public total = 0;
  public doc = [];
  public idCliente;
  public cliente;
  band = false;
  documento: any = {};
  clienteDocumento;
  datosevent;
  gridOptions: IGridOptions;
  columns: IColumns[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columDoc: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  toolbarDoc: Toolbar[];
  cienteEntidad = [];
  documentos = [];
  url;
  public doctosName = [];
  subsNegocio: Subscription;

  public numero = 1;

  /*
  Hace las validaciones para que los datos que inserten del cliente sean correctos
  */
  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    idFileAvatar: new FormControl('')
  });

  /**
   * @description Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar(grid-component)
   * @param $event Tipo de acción
   * @returns Redirige al metodo que se emitio
   * @author Gerardo Zamudio González
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.add(senddata);
      } else if ($event === 'edit') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.edit(senddata);
      } else if ($event === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.delete(senddata);
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
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
   * @description Función Agregar que rdirige a la pagina ins-clienteEntidad
   * @returns Redirige al la pagina ins-clienteEntidad
   * @author Gerardo Zamudio González
   */
  add(data) {
    try {
      this.router.navigateByUrl('/ins-clienteEntidad/' + this.idCliente);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Funcion Editar redirige a la pagina upd-clienteEntidad
   * @returns Redirige al la pagina upd-clienteEntidad
   * @author Gerardo Zamudio González
   */
  edit(data) {
    try {
      const rfcClienteEntidad = this.datosevent[0].rfcClienteEntidad;
      const idCliente = this.datosevent[0].idCliente;
      this.router.navigateByUrl('/upd-clienteEntidad/' + rfcClienteEntidad + '/' + idCliente);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @returns Abre el deleteDialog para eliminar el dato
   * @author Gerardo Zamudio González
   */
  delete(data) {
    try {
      let borrar = '';
      let cont = 0;
      const that = this;
      data.data.forEach((element, index, array) => {
        borrar +=
          '<Ids><idCliente>' +
          element.idCliente +
          '</idCliente><rfcClienteEntidad>' +
          element.rfcClienteEntidad +
          '</rfcClienteEntidad></Ids>';
        cont++;
        if (cont === array.length) {
          that.deleteData('cliente/deleteClienteEntidad', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /*
  Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar (documento).
  */
  receiveMessageDoc($event) {
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
  Función Agregar que redirige a la pagina ins-documento
  */
  addDoc(data) {
    try {
      this.router.navigateByUrl('/ins-documento/' + this.idCliente);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Abre el dialog del delete-alert, para eliminar un documento
  */
  deleteDoc(data) {
    try {
      let borrar = '<Ids>';
      let cont = 0;
      const that = this;
      data.data.forEach((element, index, array) => {
        borrar += '<idDocumento>' + element.idDocumento + '</idDocumento>';
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

  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    try {
      this.getStateUser.subscribe((state) => {
        if (state && state.seguridad) {
          this.clienteForm.controls.idUsuario.setValue(state.seguridad.user.id);
          this.subsNegocio = this.getStateNegocio.subscribe((state2) => {
            if (state2 && state2.claseActual) {
              this.idClase = state2.claseActual;
              this.activatedRoute.params.subscribe(parametros => {
                this.idCliente = parametros.idCliente;
                this.modulo = Negocio.GetModulo(this.claveModulo, state.seguridad.permissions.modules, this.idClase);

                if (this.modulo.breadcrumb) {
                  // tslint:disable-next-line:max-line-length
                  this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idCliente: this.idCliente }]);
                }
                this.documentoExtenciones();
                this.tables();
                this.loadData();
              });
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

  /**
   * @description Llena el IUploadFile con sus respectivos valores
   * @returns Obtiene la variable IUploadFile para poder insertar una foto o documento
   * @author Gerardo Zamudio González
   */
  documentoExtenciones() {
    const ext = [];
    ext.push('.jpg', '.jpeg', '.png', '.pdf');

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: this.idClase,
      idUsuario: this.clienteForm.controls.idUsuario.value,
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
  }

  /**
   * @description Este metodo es el que trae todos los datos inciales del cliente junto con sus datos ficales y sus Documentos
   * @returns Carga los datos del cliente para ser mostrados en la página
   * @author Gerardo Zamudio González
   */
  loadData() {
    try {
      this.IViewer2 = [
        {
          tipo: IViewertipo.gridimagenes
        }
      ];
      this.url = environment.fileServerUrl;
      this.getClienteData();
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Obtenemos los datos del Cliente
   * @returns Muestra los datos del cliente
   * @author Gerardo Zamudio González
   */
  getClienteData() {
    this.numero = 0;
    this.siscoV3Service
      .getService('cliente/getClientePorId?idCliente=' + this.idCliente)
      .subscribe(
        (res: any) => {
          this.numero = 1;
          if (res.err) {
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.cliente = res.recordsets[0][0];
            this.clienteForm.controls.nombre.setValue(this.cliente.nombre);
            if (this.cliente.idFileAvatar > 0) {
              this.band = true;
              const ext = ['.jpg', '.jpeg', '.png', '.pdf'];
              this.IUploadFile = {
                path: this.idClase, idUsuario: 1, idAplicacionSeguridad: environment.aplicacionesId,
                idModuloSeguridad: 1, multiple: false, soloProcesar: false
                // tslint:disable-next-line:max-line-length
                , extension: ext, titulo: '', descripcion: '', previsualizacion: true, idDocumento: this.cliente.idFileAvatar, tipodecarga: 'instantly'
              };
            }
            this.getDatosFiscales();
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
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
      this.cliente.idFileAvatar = $event.recordsets[0].idDocumento;
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
   * @description Obtenemos los Datos Fiscales del Cliente
   * @returns Mostramos los datos discales del cliente
   * @author Gerardo Zamudio González
   */
  getDatosFiscales() {
    this.numero = 0;
    this.siscoV3Service
      .getService(
        'cliente/getClienteEntidadPorIdCliente?idCliente=' +
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
            this.cienteEntidad = res.recordsets[0];
            this.getDocumentoCliente();
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
  }

  /**
   * @description Obtenemos los Documentos del Cliente
   * @returns Ejecuta el metodo fillDocumentosData()
   * @author Gerardo Zamudio González
   */
  getDocumentoCliente() {
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
            const getDocumentos = [];
            /*
            Mapeaamos para enviar la data en el formato correcto
            */
            res.recordsets[0].map(doc =>
              getDocumentos.push(doc.idDocumento)
            );
            this.total = getDocumentos.length;
            this.fillDocumentosData(getDocumentos);
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
   * @returns Muestra los documentos del cliente
   * @author Gerardo Zamudio González
   */
  fillDocumentosData(getDocumentos) {
    const data = {
      documentos: getDocumentos
    }
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
   * @description Prepara la data para mandarla a actualizar
   * @returns Ejecuta el metodo updateData
   * @author Gerardo Zamudio González
   */
  actualizaCliente() {
    try {
      this.cliente.nombre = this.clienteForm.controls.nombre.value;
      this.updateData('cliente/putActualizaCliente', this.cliente);
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Carga los datos en las tablas ClienteEntidad y Documentos
   * @returns MUestra las tablas
   * @author Gerardo Zamudio González
   */
  tables() {
    this.toolbar = [];
    /*
     Columnas de la tabla Datos fiscales
     */
    this.columns = [
      {
        caption: 'RFC cliente entidad',
        dataField: 'rfcClienteEntidad'
      },
      {
        caption: 'Razón social',
        dataField: 'razonSocial'
      },
      {
        caption: 'Teléfono',
        dataField: 'telefono'
      },
      {
        caption: 'Email',
        dataField: 'email'
      }
    ];

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
    this.exportExcel = { enabled: true, fileName: 'Listado de datos fiscales' };
    // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
    this.columnHiding = { hide: true };
    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/
    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };

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
    Parametros de Toolbar Datos fiscales
    */
    if (this.modulo.camposClase.find(x => x.nombre === 'Agregar')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Agregar',
            onClick: this.receiveMessage.bind(this, 'add')
          },
          visible: true
        }
      );
    }
    if (this.modulo.camposClase.find(x => x.nombre === 'Editar')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Editar',
            onClick: this.receiveMessage.bind(this, 'edit')
          },
          visible: false,
          name: 'simple',
          name2: 'multiple'
        },
      );
    }
    if (this.modulo.camposClase.find(x => x.nombre === 'Eliminar')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Eliminar',
            onClick: this.receiveMessage.bind(this, 'delete')
          },
          visible: false,
          name: 'simple'
        }
      );
    }
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
          text: 'Agregar',
          onClick: this.receiveMessageDoc.bind(this, 'add')
        },
        visible: true
      },
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
          this.loadData();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog update-alert
   * @param url La Url para eliminar un documento
   * @param datos Los datos que se van a actualizar
   * @returns Recarga la pagina
   * @author Gerardo Zamudio González
   */
  updateData(url: any, datos) {
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
          this.loadData();
        }
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.clienteForm.controls.idUsuario.value,
          idOperacion: 1,
          idAplicacion: environment.aplicacionesId,
          moduloExcepcion: 'upd-cliente.component',
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
