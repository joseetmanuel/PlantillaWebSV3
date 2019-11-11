import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { AppState, selectContratoState } from 'src/app/store/app.states';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { ViewerComponent } from 'src/app/utilerias/viewer/viewer.component';
import { IFileUpload, IObjeto } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';
import { DeleteAlertComponent } from 'src/app/utilerias/delete-alert/delete-alert.component';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import * as FileSaver from 'file-saver';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-objeto-documento',
  templateUrl: './objeto-documento.component.html',
  styleUrls: ['../objeto.component.scss', './objeto-documento.component.scss']
})
export class ObjetoDocumentoComponent implements OnInit, OnDestroy {
  @ViewChild(ViewerComponent) childIViewer: ViewerComponent;
  @ViewChild('Gridlightbox') Gridlightbox: TemplateRef<any>;

  IUploadFile: IFileUpload;
  spinner = false;
  IObjeto: IObjeto[];
  IViewer: IViewer[];
  IViewerVersion: IViewer[];
  url: string;
  datosevent;
  idObjeto: number;
  idTipoObjeto: number;
  // Variables para Redux
  getStateNegocio: Observable<any>;
  claveModulo = 'app-objeto-documento';
  idUsuario: number;
  idClase: string;
  idCliente: number;
  titleClase: string;
  modulo: any = {};
  breadcrumb: any;
  campos: any;
  ruta: string;
  /*variables para el contrato activo*/
  negocioSubscribe: Subscription;
  contratos: any[];
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  rfcEmpresa: string;
  numero = 1;

  archivos = [];
  agrupador = [];
  documentos = [];
  valoresInsert = [
    {
      vigencia: null,
      valor: null,
      costo: null,
      estado: null,
      comentario: null,
      costoPagado: null
    }
  ];

  validarCampos = [
    {
      idFileNumber: null,
      vigencia: null,
      requeridoV: null,
      valor: null,
      requeridoVal: null,
      costo: null,
      requeridoC: null,
      estado: null,
      requeridoE: null,
      comentario: null,
      requeridoCom: null,
      archivo: null
    }
  ];
  estados: any;
  panel: string;
  accion = false;
  /** variables para estilos */
  mostrarArchivo: number;
  tipoSelected: string;
  idSelected: number;
  disabled: boolean;
  disabledGuardar: boolean;

  /** versiones */
  pruebaFile;
  versionesActivas = [];
  nameChange: string;
  versionActiva: number;
  vigenciaActiva;
  valorActivo;
  costoActivo;
  estadoActivo;
  idFileActivo;
  fechaModificacionActiva;
  /** multas */
  docIViewer: any;
  pathFile: string;


  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>,
    private siscoV3Service: SiscoV3Service,
    private baseService: BaseService,
    private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idObjeto = parametros.idObjeto;
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.spinner = true;
    const usuario = this.baseService.getUserData();

    this.idUsuario = usuario.user.id;
    this.negocioSubscribe = this.getStateNegocio.subscribe((stateN) => {
      if (stateN && stateN.claseActual) {
        this.contratoActual = stateN.contratoActual;
        this.idClase = stateN.claseActual;
        if (this.modulo.contratoObligatorio) {
          if (this.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;
          this.AllDocumentos();
        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
        }
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
            [{ idObjeto: this.idObjeto }, { idTipoObjeto: this.idTipoObjeto }]);
          this.modulo.breadcrumb.logo.forEach(element => {
            if (element.idClase === this.idClase) {
              this.ruta = '../../.' + element.path;
            }
          });
        }
        /*** campos variables entre clase */
        if (this.modulo.camposClase) {
          this.campos = this.modulo.camposClase;
        }

      }
      this.IObjeto = [{
        idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente, numeroContrato: this.numeroContrato,
        idTipoObjeto: this.idTipoObjeto, rfcEmpresa: this.rfcEmpresa
      }];
    });
    /** variables de los archivos */
    this.mostrarArchivo = 0;
    this.disabledGuardar = true;

  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  downloadimage(path, titulo) {
    FileSaver.saveAs(path, titulo);
  }

  /**
   * @description función para mostrar todos los documentos
   * @author Sandra Gil Rosales
   * @returns array
   */
  AllDocumentos() {
    this.disabled = true;
    this.nameChange = '';
    this.versionesActivas = [];

    this.url = environment.fileServerUrl;
    this.siscoV3Service.getService(
      'documento/getAllDocumentos?idObjeto=' + this.idObjeto + '&idClase=' + this.idClase
      + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato)
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.Estados();
          this.documentos = [];
          for (const key in res.data.documentos) {
            if (res.data.documentos.hasOwnProperty(key)) {
              const element = res.data.documentos[key];
              this.documentos.push(element);
            }
          }
          this.documentos.forEach(e => {
            let ext = [];
            ext = e.parametros.tiposPermitidos.split(',');
            e.IUploadFile = {
              path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
              idModuloSeguridad: 1, multiple: false, soloProcesar: false
              , extension: ext, titulo: e.parametros.nombre
              , descripcion: '', previsualizacion: true,
              tipodecarga: 'instantly'
            };
            e.IViewer = [
              {
                idDocumento: e.valores.idFileServer,
                tipo: IViewertipo.avatar,
                descarga: false,
                size: IViewersize.md
              }
            ];

            /**avatar y nombre de usuario */
            if (e.valores.uAvatar) {
              this.httpClient.get(environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + e.valores.uAvatar)
                .subscribe((data: any) => {
                  e.valores.urlAvatar = data.recordsets[0].path;
                }, (error: any) => {
                  console.log(error);
                });
            }
            if (e.versiones.length > 0) {
              e.versiones.forEach(v => {
                if (v.uAvatar) {
                  this.httpClient.get(environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + v.uAvatar)
                    .subscribe((data: any) => {
                      v.urlAvatar = data.recordsets[0].path;
                    }, (error: any) => {
                      console.log(error);
                    });
                }
                const primN = v.uPrimerNombre === '' ? '' : v.uPrimerNombre.substr(0,1);
                const segN = v.uSegundoNombre === '' ? '' : '.' + v.uSegundoNombre.substr(0,1);
                const primA = v.uPrimerApellido === '' ? '' : '.' + v.uPrimerApellido.substr(0,1) ;
                const segA = v.uSegundoApellido === '' ? '' : '.' + v.uSegundoApellido.substr(0,1);
                v.uNombre = primN  + segN + primA + segA ;
              });
            }

            /** cambiar el texto solo  en caso de que sea multa  */
            if (e.parametros.nombre === 'Multa') {
              e.titulos = {
                textoVigencia: 'Fecha Infracción',
                textoValor: 'Folio Infracción',
                textoCosto: 'Monto',
                textoEstado: 'Estado',
                textoComentario: 'Motivo'
              };
              /** agregar los IUpload de los 3 tipos de archivos a subir */
              e.valores.IUploadLineaCaptura = {
                path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
                idModuloSeguridad: 1, multiple: false, soloProcesar: false
                , extension: ext, titulo: 'lineaCaptura'
                , descripcion: '', previsualizacion: true,
                tipodecarga: 'instantly'
              };
              e.valores.IUploadFacturaPDF = {
                path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
                idModuloSeguridad: 1, multiple: false, soloProcesar: false
                , extension: ['.pdf'], titulo: 'facturaPDF'
                , descripcion: '', previsualizacion: true,
                tipodecarga: 'instantly'
              };

              e.valores.IUploadFacturaXML = {
                path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
                idModuloSeguridad: 1, multiple: false, soloProcesar: false
                , extension: ['.xml'], titulo: 'facturaXML'
                , descripcion: '', previsualizacion: true,
                tipodecarga: 'instantly'
              };

              /** agregar si es multa un array con  Iviewer */
              if (e.versiones.length > 0) {
                e.versiones.forEach(v => {

                  v.IViewerVersion = [
                    {
                      idDocumento: v.idFileServer,
                      tipo: IViewertipo.avatar,
                      descarga: false,
                      size: IViewersize.md
                    }
                  ];
                  /** agregar la URL de el archivo  */
                  if (v.lineaCaptura > 0) {
                    this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + v.lineaCaptura)
                      .subscribe((data: any) => {
                        v.lineaCapturaUrl = data.recordsets[0].path;
                      }, (error: any) => {
                        this.spinner = false;
                        this.Excepciones(error, 2);
                      });

                  }
                  if (v.facturaPDF > 0) {
                    this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + v.facturaPDF)
                      .subscribe((data: any) => {
                        v.facturaPDFUrl = data.recordsets[0].path;
                      }, (error: any) => {
                        this.spinner = false;
                        this.Excepciones(error, 2);
                      });

                  }

                  if (v.facturaXML > 0) {
                    this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + v.facturaXML)
                      .subscribe((data: any) => {
                        v.facturaXMLUrl = data.recordsets[0].path;
                      }, (error: any) => {
                        this.spinner = false;
                        this.Excepciones(error, 2);
                      });

                  }


                });
              }

            } else {
              e.titulos = {
                textoVigencia: 'Indica Vigencia',
                textoValor: 'Indica Valor',
                textoCosto: 'Indica Costo',
                textoEstado: 'Indica Estado',
                textoComentario: 'Comentario'

              };
            }
          });

          this.agrupador = [];
          for (const key in res.data.agrupadores) {
            if (res.data.agrupadores.hasOwnProperty(key)) {
              const element = res.data.agrupadores[key];
              this.agrupador.push(element);
            }
          }

          this.agrupador.forEach(element => {

            this.campos.forEach(campo => {
              if (element.idAgrupador === 'general') {
                element.orden = 1;
                if (campo.nombre === 'TituloCardGral') {
                  element.titulo = campo.label;
                }
                if (campo.nombre === 'LogoCardGral') {
                  element.icono = campo.path;
                }

              } else if (element.idAgrupador === 'documentacion') {
                element.orden = 2;
                if (campo.nombre === 'TituloCardCla') {
                  element.titulo = campo.label;
                }
                if (campo.nombre === 'LogoCardCla') {
                  element.icono = campo.path;
                }

              } else if (element.idAgrupador === 'entrega') {
                element.orden = 3;
                if (campo.nombre === 'TituloCardCon') {
                  element.titulo = campo.label;
                }

                if (campo.nombre === 'LogoCardCon') {
                  element.icono = campo.path;
                }
              } else if (element.idAgrupador === 'multas') {
                element.orden = 4;
                if (campo.nombre === 'TituloCard4') {
                  element.titulo = campo.label;
                }
                if (campo.nombre === 'LogoCard4') {
                  element.icono = campo.path;
                }
              }
            });
          });
          this.agrupador.sort((b, a) => {
            return (b.orden - a.orden);
          });
        }
      },
        (error: any) => {
          this.spinner = false;
        });
  }

  Estados() {
    try {
      this.siscoV3Service.getService('common/GetEstados')
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.estados = res.recordsets[0];
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  getDocumentos(idFileServer) {
    this.httpClient.get(this.url + 'documento/GetDocumentoById?idDocumento=' + idFileServer)
      .subscribe((data: any) => {
        this.pathFile = data.recordsets[0].path;
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
  }

  MostrarVersiones($event: any, nameDoc, doc) {
    this.versionActiva = $event.version;
    this.nameChange = nameDoc;
    this.vigenciaActiva = $event.vigencia;
    this.valorActivo = $event.valor;
    this.costoActivo = $event.costo;
    this.estadoActivo = $event.estado;
    this.idFileActivo = $event.idFileServer;
    this.fechaModificacionActiva = $event.fechaModificacion;
    let viewer: any = JSON.stringify(doc.IViewer);
    viewer = JSON.parse(viewer);
    viewer[0].idDocumento = $event.idFileServer;
    doc.IViewer = viewer;

  }

  AsignarValor(nombreBase) {
    this.valorActivo = nombreBase;

  }

  HabilitarEdicion(id: number, tipoA: string) {

    this.vigenciaActiva = '';
    this.valorActivo = '';
    this.costoActivo = '';
    this.estadoActivo = '';
    this.mostrarArchivo = 1;
    this.disabled = true;
    this.tipoSelected = tipoA;
    this.idSelected = id;
  }

  DeshabilitarEdicion() {
    this.AllDocumentos();
    this.mostrarArchivo = 0;
  }

  // #region ResultUploadFile
  /**
   * @description Carga de archivo
   * @param $event Detalle del archivo cargado
   * @param index Posición de la propiedad
   * @returns Resultado de la carga del archivo
   * @author Edgar Mendoza Gómez
   */

  ResultUploadFile($event, tipoA: string, index: number, nombreA: string) {
    const countValorSelected = 0;
    if ($event.recordsets.length > 0) {
      this.ValidacionParam($event.recordsets[0].idDocumento, 'archivo', index, 'true');

      this.archivos.push({
        id: index,
        nombre: nombreA,
        tipo: tipoA,
        idDocumento: $event.recordsets[0].idDocumento,
        tipoDocumento: $event.recordsets[0].titulo.split('.')[$event.recordsets[0].titulo.split('.').length - 1]
      }
      );

      this.IObjeto = [{
        idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente, numeroContrato: this.numeroContrato,
        idTipoObjeto: this.idTipoObjeto, rfcEmpresa: this.rfcEmpresa
      }];

      this.HabilitarEdicion(index, tipoA);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok');
    }
  }

  SetStep(nombre: string) {
    this.panel = nombre;
  }

  PanelOpen(idPanel, accion) {
    this.panel = idPanel;
    this.accion = !accion;
  }

  ActivarEdicion(idFileServer) {
    this.documentos.map(d => {
      if (idFileServer === d.valores.idFileServer) {
      }
    });
  }

  /**
   * @description eliminar un documento de objetos
   * @param direccion ruta para direccionar una vez realizado el borrado
   * @param datos parametros
   * @return array
   * @author Sandra Gil Rosales
   */
  DeleteData(direccion: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '50%',
        data: {
          ruta: direccion,
          data: datos
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.DeshabilitarEdicion();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description Abre el dialog del delete-alert, para eliminar un documento
   * @param data datos de el elemento que se va a borrar
   * @returns true o false
   * @author Sandra Gil Rosales
   */
  BorrarArchivo(idArchivo, tipoA, nombreA, versionA) {
    try {
      let versionado;
      if (nombreA === this.nameChange) {
        versionado = this.versionActiva;

      } else {
        versionado = versionA;
      }
      const borrar = [];
      borrar.push({
        tipo: tipoA,
        idDocumento: idArchivo,
        idObjeto: this.idObjeto,
        idUsuario: this.idUsuario,
        version: versionado
      });

      const data = 'idClase=' + this.idClase + '&idTipoObjeto=' + this.idTipoObjeto + '&idObjeto=' + this.idObjeto +
        '&tipo=' + tipoA + '&idDocumento=' + idArchivo + '&version=' + versionado;

      this.DeleteData('documento/deleteDelDocumento', data);

    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  ValidacionParam($event: any, valorProp: string, index, obligatorio) {
    this.vigenciaActiva = '';

    /** ValidacionParam */
    this.valoresInsert.forEach(value => {
      if (valorProp === 'vigencia') {
        value.vigencia = $event;
      } else if (valorProp === 'valor') {
        value.valor = $event.target.value;
      } else if (valorProp === 'costo') {
        value.costo = $event.target.value;
      } else if (valorProp === 'estado') {
        value.estado = $event.value;
      } else if (valorProp === 'comentario') {
        value.comentario = $event.target.value;
      } else if (valorProp === 'costoPagado') {
        value.costoPagado = $event.checked;
      }
    });

    this.validarCampos.forEach(value => {
      if (valorProp === 'vigencia') {
        value.vigencia = $event;
        value.requeridoV = obligatorio;
      } else if (valorProp === 'valor') {
        value.valor = $event.target.value;
        value.requeridoVal = obligatorio;
      } else if (valorProp === 'costo') {
        value.costo = $event.target.value;
        value.requeridoC = obligatorio;
      } else if (valorProp === 'estado') {
        value.estado = $event.value;
        value.requeridoE = obligatorio;
      } else if (valorProp === 'comentario') {
        value.comentario = $event.target.value;
        value.requeridoCom = obligatorio;
      } else if (valorProp === 'archivo') {
        value.archivo = $event;
      }
    });

    if (this.validarCampos[0].archivo !== null) {

      if (this.validarCampos[0].requeridoV === true && this.validarCampos[0].vigencia === null) {
        this.disabledGuardar = true;

      } else if (
        this.validarCampos[0].requeridoVal === true && this.validarCampos[0].valor === null) {
        this.disabledGuardar = true;
      } else if (this.validarCampos[0].requeridoC === true && this.validarCampos[0].costo === null) {
        this.disabledGuardar = true;
      } else {
        this.disabledGuardar = false;
      }
    } else {
      this.disabledGuardar = true;
    }
  }

  GuardarArchivo(idArchivo, tipoA, concepto) {
    const data = [];
    let fileServer: number;
    let tipoDoc: string;
    let lineaCaptura: number;
    let facturaPDF: number;
    let facturaXML: number;

    this.archivos.forEach(element => {
      switch (element.nombre) {
        case 'lineaCaptura':
          lineaCaptura = element.idDocumento;
          break;
        case 'facturaPDF':
          facturaPDF = element.idDocumento;
          break;
        case 'facturaXML':
          facturaXML = element.idDocumento;
          break;
        default:
          fileServer = element.idDocumento;
          tipoDoc = element.tipoDocumento;
      }
    });

    this.valoresInsert.forEach(element => {
      data.push({
        tipo: tipoA,
        idClase: this.idClase,
        idTipoObjeto: this.idTipoObjeto,
        idDocumento: idArchivo,
        idObjeto: this.idObjeto,
        idTipoDocumento: '.' + tipoDoc.toLowerCase(),
        idConcepto: concepto,
        idFileServer: fileServer,
        idLineaCaptura: lineaCaptura,
        idFacturaPDF: facturaPDF,
        idFacturaXML: facturaXML,
        vigencia: element.vigencia,
        valor: element.valor,
        costo: element.costo,
        costoPagado: element.costoPagado,
        idEstado: element.estado,
        comentario: element.comentario,
        idUsuario: this.idUsuario
      });
    });

    this.spinner = true;
    this.siscoV3Service.postService('documento/postInsObjetoDocumento', data[0])
      .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha actualizado correctamente el tipo de objeto.', 'Ok', {
            duration: 2000
          });
          this.DeshabilitarEdicion();
          this.ngOnInit();
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });
  }

  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de  la escepción ocurrida
   * @returns exception
   * @author Sandra Gil Rosales
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'objeto-documento.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.negocioSubscribe.unsubscribe();
  }

}
