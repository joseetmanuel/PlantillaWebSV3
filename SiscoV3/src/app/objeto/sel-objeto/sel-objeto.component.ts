import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IGridOptions,
  IColumns,
  ICheckbox,
  IEditing,
  IColumnchooser,
  IColumnHiding,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  TiposdeDato,
  TiposdeFormato
} from '../../interfaces';
import { SiscoV3Service } from '../../services/siscov3.service';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { AppState, selectContratoState } from '../../store/app.states';
import { Negocio } from 'src/app/models/negocio.model';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { BaseService } from '../../services/base.service';
import { SessionInitializer } from '../../services/session-initializer';
export let dataObjetos = [];

@Component({
  selector: 'app-sel-objeto',
  templateUrl: './sel-objeto.component.html',
  styleUrls: ['../../app.component.sass'],
  providers: [SiscoV3Service]
})

export class SelObjetoComponent implements OnInit, OnDestroy {
  claveModulo = 'app-sel-objeto';
  idClase: string;
  titleClase: string;
  logo: string;
  modulo: any = {};
  breadcrumb: any;
  ruta: string;
  /** valores de orden de  compra temporales */
  ordenCompra: any;

  datosevent: any;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  objetos = [];
  tipoObjetos: any;
  tipoObjetosColumns: any;
  public numero = 0;
  /*variables para el contrato activo*/
  sinMantenimiento: boolean;
  contratoActual: any;
  numeroContrato: string;
  idCliente: number;
  subsNegocio: Subscription;
  stateNegocio: Observable<any>;
  rfcEmpresa: string;

  /**
   *
   * @param dialog instancia  para generar un Mat dialog
   * @param router instancia para redireccionar o ir a otras rutas
   * @param siscoV3Service instancia para llamar los servicios
   */
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
    private baseService: BaseService,
    private sessionInitializer: SessionInitializer
  ) { }

  ngOnInit() {
    this.stateNegocio = this.store.select(selectContratoState);
    this.ordenCompra = {
      urlImagen: '../../../assets/images/iconos-utilerias/home.png',
      estado: 'Ciudad de México',
      ordenCompra: '10514'
    };
    try {
      if (this.sessionInitializer.state) {
        const usuario = this.baseService.getUserData();
        this.subsNegocio = this.stateNegocio.subscribe(state => {
          const negocio = state;
          if (negocio.claseActual) {
            this.contratoActual = negocio.contratoActual;
            this.idClase = negocio.claseActual;
            this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
            if (this.modulo.breadcrumb) {
              this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
            }

            if (this.modulo.camposClase) {
              this.modulo.camposClase.forEach(campos => {
                if (campos.nombre == 'LogoCard') {
                  this.titleClase = campos.label;
                  this.logo = campos.path;
                }
              });
            }

            if (this.contratoActual !== null) {
              this.numeroContrato = this.contratoActual.numeroContrato;
              this.idCliente = this.contratoActual.idCliente;
              this.Grid();
              this.LoadData();
            }

            if (negocio.contratoActual && this.modulo.contratoObligatorio) {
              this.ConfigurarFooter(false);
            } else {
              this.ConfigurarFooter(true);
            }
          }
        });
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
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

  Grid() {
    this.exportExcel = { enabled: true, fileName: this.titleClase };
    this.columnHiding = { hide: true };
    this.Checkbox = { checkboxmode: 'multiple' };
    this.Editing = { allowupdate: false };
    this.Columnchooser = { columnchooser: true };
    this.scroll = { mode: 'standard' };
    /* Parametros de Search */
    this.searchPanel = {
      visible: true,
      width: 200,
      placeholder: 'Buscar...',
      filterRow: true
    };
    /* Parametros de Toolbar */
    this.toolbar = [];
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

    if (this.modulo.camposClase.find(x => x.nombre === 'Carga Masiva')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 120,
            text: 'Carga masiva',
            onClick: this.receiveMessage.bind(this, 'cargaMasiva')
          },
          visible: true
        }
      )
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'Documentos')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 116,
            text: 'Documentos',
            onClick: this.receiveMessage.bind(this, 'document')
          },
          visible: false,
          name: 'simple',
          name2: 'multiple'
        }
      )
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
        }
      )
    }

    if (this.modulo.camposClase.find(x => x.nombre === 'FichaTecnica')) {
      this.toolbar.push(
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            text: 'Ficha técnica',
            onClick: this.receiveMessage.bind(this, 'ficha')
          },
          visible: false,
          name: 'simple',
          name2: 'multiple'
        }
      )
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
      )
    }
    /** personalizando Footer dependiendo de la clase (Automovil) */
    if (this.idClase === 'Automovil') {
      this.toolbar.push({
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 120,
          text: 'Asignar operador',
          onClick: this.receiveMessage.bind(this, 'operador')
        },
        visible: false,
        name: 'simple',
        name2: 'multiple'
      },
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 120,
            text: 'Operadores',
            onClick: this.receiveMessage.bind(this, 'operadores')
          },
          visible: true
        });

    }

  }


  /**
   * Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar.
   * @param $event  evento lanzado en el  html
   */
  receiveMessage($event) {
    try {
      this.evento = $event.event;
      if ($event === 'add') {
        const senddata = {
          event: $event
        };
        this.Add(senddata);
      } else if ($event === 'cargaMasiva') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.CargaMasiva(senddata);
      } else if ($event === 'document') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Document(senddata);
      } else if ($event === 'edit') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Edit(senddata);
      } else if ($event === 'delete') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Delete(senddata);
      } else if ($event === 'ficha') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.FichaTecnica(senddata);
      } else if ($event === 'operador' && this.idClase === 'Automovil') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Operador(senddata);
      } else if ($event === 'operadores' && this.idClase === 'Automovil') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.Operadores(senddata);
      }
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Obtenemos la data del componente "grid-component".
   * @param $event evento lanzado en el  html
   */
  DatosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  LoadData() {
    try {
      this.numero = 0;
      this.siscoV3Service.getService('objeto/getObjetoId?idClase=' + this.idClase + '&&numeroContrato='
        + this.numeroContrato + '&&idCliente=' + this.idCliente)
        .subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              res.recordsets[0].forEach(object => {
                for (const key in object) {
                  if (object.hasOwnProperty(key)) {
                    const element = object[key];
                    if (element === null) {
                      object[key] = '';
                    }
                  }
                }
              });
              this.tipoObjetos = res.recordsets[0];
            } else {
              this.tipoObjetos = [];
            }

            this.siscoV3Service.getService('objeto/GetObjetosColumns?idClase=' + this.idClase
              + '&numeroContrato=' + this.numeroContrato + '&idCliente=' + this.idCliente)
              .subscribe((res2: any) => {
                this.numero = 1;
                this.tipoObjetosColumns = res2.recordsets[0];

                if (this.tipoObjetosColumns.length > 0) {
                  this.columns = [];

                  for (const data in this.tipoObjetosColumns[0]) {
                    /* En grid se cambia nombre de propiedad pero en sp se mantiene el campo idPartida para mantener integridad*/
                    if (data !== 'Foto') {
                      if (data !== 'idTipoObjeto') {
                        if (data === 'idObjeto') {
                          this.columns.push({ caption: 'Id', dataField: data });
                        } else if (this.tipoObjetosColumns[0][data] === 'Bit') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, dataType: TiposdeDato.boolean
                          });
                        } else if (this.tipoObjetosColumns[0][data] === 'Datetime' || this.tipoObjetosColumns[0][data] === 'Date') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, dataType: TiposdeDato.datetime, format: TiposdeFormato.dmy
                          });
                        } else if (this.tipoObjetosColumns[0][data] === 'Color') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, cellTemplate: 'color'
                          });
                        } else if (this.tipoObjetosColumns[0][data] === 'File' || this.tipoObjetosColumns[0][data] === 'Image') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, cellTemplate: 'foto'
                          });
                        } else {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data
                          });
                        }
                      }
                    }
                  }
                }
              });
          }
        }, (error: any) => {
          this.numero = 1;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /*
  Función Agregar para ir a la pagina de insertar objetos
  */
  Add(data) {
    try {
      this.router.navigateByUrl(
        '/upd-objeto/' + '0/'
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description  Función para hacer carga masiva de objetos.
   * @param datos eventos que se van a pasar a la otra pantalla
   * @returns Devuelve exito o error
   * @author Sandra Gil Rosales
   */

  CargaMasiva(data) {
    try {
      this.router.navigateByUrl(
        '/ins-objeto-carga-masiva'
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Funcion para acceder al modulo de documentos (agregar,  ver y editar)
   * @param data datos de el objeto a editar
   */
  Document(data) {
    let idObjeto;
    let idTipoObjeto;
    data.data.forEach(element => {
      idObjeto = element.idObjeto;
      idTipoObjeto = element.idTipoObjeto[0];
    });
    try {
      this.router.navigateByUrl(
        '/sel-objeto-documento/' + idObjeto + '/' + idTipoObjeto
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  /**
   * Funcion para redirigir a la pagina de editar campos
   * @param data datos de el objeto a editar
   */
  Edit(data) {
    let idObjeto;
    let idTipoObjeto;
    data.data.forEach(element => {
      idObjeto = element.idObjeto;
      idTipoObjeto = element.idTipoObjeto[0];
    });
    try {
      this.router.navigateByUrl(
        '/upd-objeto/' + idObjeto + '/' + idTipoObjeto
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Funcion para redirigir a la pagina de editar campos
   * @param data datos de el objeto a editar
   */
  Operador(data) {

    try {
      let idObjeto;
      let idTipoObjeto;
      data.data.forEach(element => {
        idObjeto = element.idObjeto;
        idTipoObjeto = element.idTipoObjeto[0];
      });
      this.router.navigateByUrl('/asignar-operador/' + idObjeto + '/' + idTipoObjeto);
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Funcion para redirigir a la pagina de editar campos
   * @param data datos de el objeto a editar
   */
  Operadores(data) {
    try {
      this.router.navigateByUrl(
        '/sel-operador'
      );
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
   * @param data datos de el objeto a borrar
   */
  Delete(data) {
    try {
      let borrar = '';
      let cont = 0;
      data.data.forEach((element, index, array) => {
        borrar += '<Ids><idObjeto>' + element.idObjeto + '</idObjeto>';
        borrar += '<idClase>' + this.idClase + '</idClase>';
        borrar += '<idTipo>' + element.idTipoObjeto[0] + '</idTipo></Ids>';
        cont++;
        if (cont === array.length) {
          this.DeleteData('objeto/deleteObjeto', 'data=' + borrar);

        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }


  FichaTecnica(data) {
    this.rfcEmpresa = this.contratoActual.rfcEmpresa;
    this.router.navigateByUrl(`sel-ficha-tecnica/${data.data[0].idObjeto}/${data.data[0].idTipoObjeto[0]}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`);
  }


  /**
   * funcion de un segundo borrado
   * @param borrar parametro xmlpara ser borrado
   */
  DeletePropiedades(borrar) {
    this.siscoV3Service.deleteService('objeto/deleteObjetoPropiedades?idPropiedades=', borrar).subscribe(
      (res: any) => {
      }, (error: any) => {
        console.log(error);
      }
    );
  }


  /**
   * Abre el dialog delete-alert
   * @param direccion ruta a la cual se va a direccionar despues dde la accion
   * @param datos parametro de seguimiento
   */
  DeleteData(direccion: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '60%',
        data: {
          ruta: direccion,
          data: datos
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.LoadData();
        }
      });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de la escecpción lanzada
   */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'objeto.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }
}
