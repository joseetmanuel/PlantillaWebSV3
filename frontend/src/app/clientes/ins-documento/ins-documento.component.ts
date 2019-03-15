import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-ins-doccumento',
  templateUrl: './ins-documento.component.html',
  styleUrls: ['./ins-documento.component.sass'],
  providers: [SiscoV3Service]
})
export class AddDoctoComponent implements OnInit {
  documentoForm = new FormGroup({
    idTipoDocumento: new FormControl('', [Validators.required])
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

  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('1')
  });

  constructor(
    private snackBar: MatSnackBar,
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private _siscoV3Service: SiscoV3Service
  ) {
    try {
      this.url = environment.urlFileServer;
      this.loadData();
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /*
  Obtenemos la data del componente 'grid-component'.
  */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar (documento).
  */
  receiveMessageDoc($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.addDoc(senddata);
      } else if ($event === 'delete') {
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
  addDoc(data) {}

  deleteDoc(data) {
    try {
      let borrar = '<Ids>';
      let cont = 0;
      const _this = this;
      data.data.forEach(function(element, index, array) {
        // tslint:disable-next-line:max-line-length
        borrar +=
          '<idClienteDocumento>' +
          element.idClienteDocumento +
          '</idClienteDocumento>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          _this.deleteData('cliente/deleteClienteDocumento', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  loadData() {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        /*
        Obtenemos los datos del Cliente
        */
        this._siscoV3Service
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
                /*
                Obtenemos los Tipos de documentos disponibles de la base de datos
                */
                this._siscoV3Service
                  .getService('cliente/getTipoDocumento')
                  .subscribe(
                    // tslint:disable-next-line:no-shadowed-variable
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
                        /*
                        Obtenemos los Documentos del Cliente
                        */
                        this._siscoV3Service
                          .getService(
                            'cliente/getClienteDocumentoPorIdCliente?idCliente=' +
                              this.idCliente
                          )
                          .subscribe(
                            // tslint:disable-next-line:no-shadowed-variable
                            (res: any) => {
                              if (res.err) {
                                this.numero = 1;
                                this.excepciones(res.err, 4);
                              } else if (res.excepcion) {
                                this.numero = 1;
                                this.excepciones(res.excepcion, 3);
                              } else {
                                this.doctosName = [];
                                let con = 0;
                                this.clienteDocumento = res.recordsets[0];
                                /*
                                Recorremos el arreglo de clienteDocumento para agregar el tipoDocumento a la tabla
                                Y despues concatenarle el titulo (nombre de la imagen) y path (Ruta donde esta la imagen)
                                */
                                this.clienteDocumento.forEach(d => {
                                  this.doctosName[con] = {
                                    idClienteDocumento: d.idClienteDocumento,
                                    tipo: d.tipo,
                                    titulo: '',
                                    path: ''
                                  };
                                  con++;
                                });
                                const getDocumentos = [];
                                /*
                                Mapeaamos para enviar la data en el formato correcto
                                */
                                res.recordsets[0].map(doc =>
                                  getDocumentos.push({
                                    idDocumento: doc.idDocumento
                                  })
                                );
                                /*
                                Obtenemos los documentos del cliente para llenar la tabla
                                */
                                this.httpClient
                                  .get(
                                    this.url +
                                      'GetDocumentosById?documentos=' +
                                      JSON.stringify(getDocumentos)
                                  )
                                  .subscribe(
                                    // tslint:disable-next-line:no-shadowed-variable
                                    (res: any) => {
                                      // tslint:disable-next-line:no-unused-expression
                                      // tslint:disable-next-line:no-shadowed-variable
                                      // tslint:disable-next-line:no-shadowed-variable
                                      let con = 0;
                                      this.documentos = res.recordsets;
                                      /*
                                      Concatenamos el path y el titulo conforme al Arreglo anterior
                                      */
                                      this.documentos.forEach(d => {
                                        this.doctosName[con].titulo = d.titulo;
                                        this.doctosName[con].path = d.path;
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
                            },
                            (error: any) => {
                              this.numero = 1;
                              this.excepciones(error, 2);
                            }
                          );
                      }
                    },
                    (error: any) => {
                      this.numero = 1;
                      this.excepciones(error, 1);
                    }
                  );
              }
            },
            (error: any) => {
              this.numero = 1;
              this.excepciones(error, 2);
            }
          );
      });
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /*
  Cambiamos el valor de Disable para habilitar el botón de agregar un documento
  */
  test(data) {
    this.disabled = false;
  }

  ngOnInit() {
    try {
      const ext = [];
      ext.push('.jpg', '.jpeg', '.png', '.pdf');

      // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
      this.IUploadFile = {
        path: '1',
        idUsuario: 181,
        idAplicacionSeguridad: 1,
        idModuloSeguridad: 1,
        multiple: false,
        soloProcesar: false,
        extension: ext
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
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Inserta un documento
  */
  insDocto(fileUploader: DxFileUploaderComponent) {
    try {
      this.numero = 0;
      const formData = new FormData();
      formData.append('path', this.IUploadFile.path);
      for (let i = 0; i < fileUploader.value.length; i++) {
        formData.append('files', fileUploader.value[i]);
      }
      // ************************** Se llena formData **************************
      formData.append(
        'idAplicacionSeguridad',
        this.IUploadFile.idAplicacionSeguridad + ''
      );
      formData.append(
        'idModuloSeguridad',
        this.IUploadFile.idModuloSeguridad + ''
      );
      formData.append('idUsuario', this.IUploadFile.idUsuario + '');

      // ******* Se consume servicio y si tuvo exito regresa id del o los documentos subidos  ***************

      this.httpClient.post(this.url + 'UploadFiles', formData).subscribe(
        (res: any) => {
          /*if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              this.excepciones(res.excepcion, 3);
            } else {*/
          console.log(res);
          const data = {
            idCliente: this.idCliente,
            idTipoDocumento: this.documentoForm.controls['idTipoDocumento']
              .value,
            idDocumento: res.recordsets[0].idDocumento,
            idUsuario: 1
          };
          this._siscoV3Service
            .postService('cliente/postInsClienteDocumento', data)
            .subscribe(
              (resp: any) => {
                if (resp.err) {
                  this.numero = 1;
                  this.excepciones(res.err, 4);
                } else if (resp.excepcion) {
                  this.numero = 1;
                  this.excepciones(res.excepcion, 3);
                } else {
                  this.numero = 1;
                  this.recarga = 0;
                  this.recarga = 1;
                  this.documentoForm.reset();
                  this.disabled = true;
                  this.loadData();
                  this.ngOnInit();
                  this.snackBar.open('Documento agregado exitosamente.', 'Ok', {
                    duration: 2000
                  });
                }
              },
              (error: any) => {
                this.numero = 1;
                this.excepciones(error, 2);
              }
            );
          // this.idDocumento = res.recordsets[0].idDocumento;
          // console.log(this.idDocumento);
          // }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /*
  Abre el dialog delete-alert
  */
  deleteData(ruta: any, data) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '500px',
        data: {
          ruta: ruta,
          data: data
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

  excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'add-cliente.component',
          mensajeExcepcion: '',
          stack: stack
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
