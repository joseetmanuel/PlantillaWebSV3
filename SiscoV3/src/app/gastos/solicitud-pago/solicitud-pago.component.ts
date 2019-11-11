import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IViewer, IViewertipo, IViewersize } from '../../interfaces';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { Subscription } from 'rxjs/Subscription';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
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
  IBuscador,
  TipoBusqueda
} from '../../interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-solicitud-pago',
  templateUrl: './solicitud-pago.component.html'
})
export class SolicitudPagoComponent implements OnInit, OnDestroy {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-solicitud-pago';
  idClase: string;
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  breadcrumb: any[];
  spinner = false;
  numeroContrato: string;
  idUsuario: number;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[] = [];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  pagos = [];
  idEstado: string;
  cargaGrid: boolean;
  estados: any;
  datosevent;
  totalDocumentos = [];
  totales = [];
  disabledEstadistica = true;
  public buscador: IBuscador;
  otrosGastos: number;
  usuariosAsignados: any;
  responsable: number;
  IViewer: IViewer[];
  subsNegocio: Subscription;
  anoFiscal: number;
  idResponsable: number;
  private httpClient: HttpClient;
  editaEnabled = false;

  pagoForm = new FormGroup({
    estado: new FormControl('', [Validators.required]),
    anoFiscal: new FormControl('', [Validators.required])
  });

  tareaForm = new FormGroup({
    usuarioSolicitado: new FormControl('', [Validators.required]),
    otrosGastos: new FormControl()

  });



  constructor(private siscoV3Service: SiscoV3Service,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>) {

    this.activatedRoute.params.subscribe(parametros => {
      if (parametros.idEstado !== '0') { 
        this.pagoForm.controls.estado.setValue(parametros.idEstado);
        this.pagoForm.controls.anoFiscal.setValue(parametros.anoFiscal);
        this.idResponsable = parametros.idResponsable;
        this.otrosGastos = parametros.otrosGastos;
      }
    });


    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.spinner = true;
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */

        if (!stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
          this.ConfigurarFooter(true);
        } else {
          this.ConfigurarFooter(false);
        }


        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idEstado: this.pagoForm.controls.estado.value },
          { anoFiscal: this.pagoForm.controls.anoFiscal.value }, { idResponsable: this.idResponsable }, { otrosGastos: this.otrosGastos }]);
        }

        if (this.contratoActual) {
          this.numeroContrato = this.contratoActual.numeroContrato;
        }
      });
      this.Estados();

      if (this.pagoForm.controls.estado.value !== '') {
        this.setValuesEdit();
      }

      this.buscador = {
        isActive: true,
        tipoBusqueda: TipoBusqueda.usuario,
        parametros: {
          buscarPorJerarquia: false,
          idUsuario: 0,
          busqueda: this.tareaForm.get('usuarioSolicitado').value
        }
      };
    });
  }

  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio, true)));
  }

  setValuesEdit() {
    this.editaEnabled = true;
    this.idEstado = this.pagoForm.controls.estado.value;
    this.anoFiscal = this.pagoForm.controls.anoFiscal.value;

    this.Grid();
    this.LoadData();

    // this.disabledEstadistica = false;

  }

  responseBuscador($event) {
    if ($event !== null) {
      this.responsable = $event.recordsets[0].Id;
      this.tareaForm.controls.usuarioSolicitado.setValue('');
      this.usuariosAsignados = $event.recordsets[0];

      this.IViewer = [
        {
          idDocumento: this.usuariosAsignados.IdAvatar,
          tipo: IViewertipo.avatar,
          descarga: false,
          size: IViewersize.sm
        }
      ];

      let viewer: any = JSON.stringify(this.IViewer);
      viewer = JSON.parse(viewer);
      viewer[0].idDocumento = $event.recordsets[0].IdAvatar;
      this.IViewer = viewer;
    }
  }

  /**
   * @description  Carga los estados de la republica
   * @returns Devuelve los estados
   * @author Edgar Mendoza Gómez
   */

  Estados() {
    try {
      this.spinner = true;
      this.siscoV3Service.getService('common/GetEstados')
        .subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.estados = res.recordsets[0];
            this.spinner = false;

          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  setEstado() {
    this.idEstado = this.pagoForm.controls.estado.value;
    this.cargaGrid = false;

    this.resetValues();
    this.Grid();
    this.LoadData();

  }

  setAnoFiscal() {
    this.anoFiscal = this.pagoForm.controls.anoFiscal.value;
  }

  resetValues() {
    this.tareaForm.reset();

    if (this.totales.length > 0) {
      this.totales[0].valor = 0;
    }

    if (this.usuariosAsignados) {
      this.usuariosAsignados = undefined;
    }

  }

  Grid() {

    // ******************PARAMETROS DE PAGINACION DE GRID**************** */
    const pageSizes = ['10', '30', '50', '100'];
    this.gridOptions = { paginacion: 10, pageSize: pageSizes };
    // ******************PARAMETROS DE EXPORTACION**************** */
    this.exportExcel = { enabled: true, fileName: 'solicitudPago' };
    // ******************PARAMETROS DE COLUMNAS RESPONSIVAS EN CASO DE NO USAR HIDDING PRIORITY**************** */
    this.columnHiding = { hide: true };
    // ******************PARAMETROS DE PARA CHECKBOX**************** */
    this.Checkbox = { checkboxmode: 'multiple' };  // *desactivar con none*/
    // ******************PARAMETROS DE PARA EDITAR GRID**************** */
    this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/
    // ******************PARAMETROS DE PARA SELECCION DE COLUMNAS**************** */
    this.Columnchooser = { columnchooser: true };
    // ******************PARAMETROS DE SEARCH**************** */
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true };
    // ******************PARAMETROS DE SCROLL**************** */
    this.scroll = { mode: 'standard' };

    // ******************PARAMETROS DE TOOLBAR**************** */
    this.toolbar = [];

  }

  getDocs(documentos) {
    this.toolbar = [{
      location: 'after',
      widget: 'dxTagBox',
      locateInMenu: 'auto',
      options: {
        dataSource: documentos,
        displayExpr: 'nombre',
        showSelectionControls: true,
        applyValueMode: 'useButtons',
        width: 200,
        onValueChanged: this.estadistica.bind(this),
        placeholder: 'Documentos'
      }, visible: false,
      name: 'simple'
    }];

  }

  LoadData() {
    this.spinner = true;
    this.columns = [];
    this.pagos = [];

    this.siscoV3Service.getService('solicitud/GetCostoPago?idEstado=' + this.idEstado + '&&idClase=' + this.idClase)
      .subscribe((res: any) => {
        if (res.err) {
          this.spinner = false;
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.pagos = res.recordsets[0];
          const documentos = res.recordsets[1];
          this.cargaGrid = false;
          this.spinner = false;

          this.getDocs(documentos);

        }
      }, (error: any) => {
        this.spinner = false;
        this.Excepciones(error, 2);
      });
  }

  datosMessage($event) {
    this.datosevent = $event.data;
  }

  estadistica($event) {
    this.disabledEstadistica = false;
    this.totalDocumentos = [];

    $event.value.forEach(element => {
      this.datosevent.forEach(e => {
        if (this.totalDocumentos.length > 0) {
          if (this.totalDocumentos.find(f => f.idObjeto === e.idObjeto && f.idDoc === element.idConcepto)) {
          } else {
            this.totalDocumentos.push({
              idObjeto: e.idObjeto, idTipoObjeto: e.idTipoObjeto,
              idDoc: element.idConcepto, doc: element.nombre, valor: e[element.nombre]
            });
          }
        } else {
          this.totalDocumentos.push({
            idObjeto: e.idObjeto, idTipoObjeto: e.idTipoObjeto,
            idDoc: element.idConcepto, doc: element.nombre, valor: e[element.nombre]
          });
        }
      });

    });

    this.totales = this.totalDocumentos.reduce(this.reduceTipos, []);

  }

  reduceTipos(b: any, a: any) {
    if (b.length > 0) {
      b[0].valor += a.valor;
    } else {
      b.push({ valor: a.valor });
    }

    return b;
  }

  solicitarPago() {
    let xmlObjetos = this.CreateObjetoXML(this.totalDocumentos);
    let xmlPartidas = this.CreatePartidaXML(this.totalDocumentos);

    const data = {
      rfcEmpresa: 'DCO',
      idCliente: 78,
      numeroContrato: '123PEMEX',
      idObjeto: xmlObjetos,
      //idTipoObjeto: this.idTipoObjeto,
      idClase: this.idClase,
      //idTipoSolicitud: this.solicitudForm.controls.vTipoSolicitud.value,
      //fecha: this.solicitudForm.controls.vFecha.value,
      idEstatusSolicitud: 0,
      //fechaCaducidad: this.formDinamico[0].fechaCaducidad,
      //idPropiedadClase: this.formDinamico[0].valor[0],
      //comentarios: this.solicitudForm.controls.vComentarios.value,
      //partidas: _xmlPartida
    }

    // this.siscoV3Service.postService('solicitud/PostInsSolicitud', data)
    // .subscribe(
    //   (res: any) => {
    //     if (res.err) {
    //       this.spinner = false;
    //       // error tipo base de datos
    //       this.Excepciones(res.err, 4);
    //     } else if (res.excepcion) {
    //       this.spinner = false;
    //       // excepcion de conexion a la base de datos
    //       this.Excepciones(res.excepcion, 3);
    //     } else {
    //       this.spinner = false;
    //       this.snackBar.open('Registrado exitosamente.', 'Ok', {
    //         duration: 2000
    //       });
    //     }
    //   },
    //   (error: any) => {
    //     // error de no conexion al servicio
    //     this.Excepciones(error, 2);
    //     this.spinner = false;
    //   });
  }

  Guardar() {
    const xmlPartidas = this.CreatePartidaXML(this.totalDocumentos);
    if (this.otrosGastos === undefined) {
      this.otrosGastos = 0;
    }
    const data = {
      idClase: this.idClase,
      idEstado: this.idEstado,
      anoFiscal: this.anoFiscal,
      subTotal: this.totales[0].valor,
      otrosGastos: this.otrosGastos,
      idResponsable: this.usuariosAsignados.Id,
      xmlPartidas
    };

    this.siscoV3Service.postService('solicitud/PostInsGestoria', data).subscribe((res: any) => {
      if (res.err) {
        this.spinner = false;
        this.Excepciones(res.err, 4);
      } else if (res.excecion) {
        this.Excepciones(res.err, 3);
      } else {
        this.snackBar.open('Registrado exitosamente.', 'Ok', {
          duration: 2000
        });
        this.router.navigateByUrl('/sel-gestoria');
      }
    }, (error: any) => {
      this.spinner = false;
      this.Excepciones(error, 2);

    });

  }

  CreateObjetoXML(totalDocumentos) {

    const filteredTotalDocumentos = [];
    let xmlObjetoResult = '';
    let bodyObjetoString = '';


    totalDocumentos.forEach(e => {
      if (!filteredTotalDocumentos.find(docs => docs.idObjeto === e.idObjeto)) {
        filteredTotalDocumentos.push({ idObjeto: e.idObjeto });

        bodyObjetoString +=
          '<objeto>' +
          '<idObjeto>' + e.idObjeto + '</idObjeto>' +
          '</objeto>';
      }

    });
    xmlObjetoResult = '<objetos>' + bodyObjetoString + '</objetos>';
    return xmlObjetoResult;

  }

  CreatePartidaXML(totalDocumentos) {
    let xmlPartidaResult = '';
    let bodyPartidaString = '';
    if (totalDocumentos !== null) {
      totalDocumentos.forEach(element => {
        bodyPartidaString +=
          '<partida>' +
          '<idObjeto>' + element.idObjeto + '</idObjeto>' +
          '<idTipoObjeto>' + element.idTipoObjeto + '</idTipoObjeto>' +
          '<idPartida>' + element.idDoc + '</idPartida>' +
          '<costoInicial>' + element.valor + '</costoInicial>' +
          '</partida>';
      });
    }
    xmlPartidaResult =
      '<partidas>' +
      bodyPartidaString +
      '</partidas>';
    return xmlPartidaResult;

  }

  ngOnDestroy() {
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
          moduloExcepcion: 'solicitud-pago.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
