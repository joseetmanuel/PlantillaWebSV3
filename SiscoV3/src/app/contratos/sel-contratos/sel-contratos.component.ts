import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
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
  TiposdeFormato
} from '../../interfaces';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { AlertDialogComponent } from 'src/app/utilerias/alert-dialog/alert-dialog.component';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectPermisosState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { SeleccionarClase, SeleccionarContratoActual, SeleccionarContratos } from '../../store/actions/contrato.actions';
import { NgxIndexedDB } from 'ngx-indexed-db';
import { Subscription } from 'rxjs';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-sel-contratos',
  templateUrl: './sel-contratos.component.html',
  styleUrls: ['./sel-contratos.component.scss'],
  providers: [SiscoV3Service]
})
export class SelContratosComponent implements OnInit, OnDestroy {

  claveModulo = 'app-sel-contratos';
  modulo: any = {};
  breadcrumb: any[];

  indexedDB: NgxIndexedDB;

  subsNegocio: Subscription;

  getStateUser: Observable<any>;
  getStateNegocio: Observable<any>;
  idUsuario;
  idClase;
  band = false;
  newInnerWidth: number;
  datosevent: any;
  gridOptions: IGridOptions;
  columns: IColumns[];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  contratos = [];
  public numero = 1;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.newInnerWidth = event.target.innerWidth;
    if (this.newInnerWidth <= 768) {
      this.columnHiding = { hide: true };

    } else if (this.newInnerWidth > 768) {
      this.columnHiding = { hide: false };
    }
  }

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
    private baseService: BaseService
  ) {

    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.indexedDB = new NgxIndexedDB('SISCO', 1);

  }

  ngOnInit() {
    this.subsNegocio = this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateUser.subscribe((stateAutenticacion) => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }
        this.ConfigurarFooter();
        this.band = false;
        this.loadData();
      });
    });

  }

  ngOnDestroy() {
    this.subsNegocio.unsubscribe();
  }

  /*
    Se toma la configuración de que se bloquee la apertura y no realice cambios sobre el footer
  */
  ConfigurarFooter() {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, false, this.modulo.multicontrato, this.modulo.contratoObligatorio, false)
    )
    );
  }


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
        this.add();
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
      } else if ($event === 'conf-equip') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.confEquipamiento(senddata);
      } else if ($event === 'equip') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.equipamiento(senddata);

      } else if ($event === 'zonas') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.zonas(senddata);
      } else if ($event === 'costo') {
        const senddata = {
          event: $event,
          data: this.datosevent
        };
        this.costo(senddata);
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
   * @description Este metodo es el que trae todos los datos inciales de los clientes
   * @returns Datos listos para mostratlos en la pantalla
   * @author Gerardo Zamudio González
   */
  loadData() {
    try {
      this.numero = 0;
      this.siscoV3Service.getService(`cliente/getContratos?idClase=${this.idClase}`).subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.contratos = res.recordsets[0];
            this.table();
            this.newInnerWidth = window.innerWidth;
            if (this.newInnerWidth <= 768) {
              this.columnHiding = { hide: true };
            } else if (this.newInnerWidth > 768) {
              this.columnHiding = { hide: false };
            }
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Función Agregar que rdirige a la pagina ins-contrato
   * @returns Redirige al la pagina ins-contrato
   * @author Gerardo Zamudio González
   */
  add() {
    try {
      this.router.navigateByUrl('/ins-contrato');
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Funcion Editar redirige a la pagina upd-contrato
   * @returns Redirige al la pagina upd-contrato
   * @author Gerardo Zamudio González
   */
  edit(data) {
    try {
      const contratoActual = data.data[0];
      this.baseService.setContratoActual(contratoActual).then(res => {
        if (res) {
          this.router.navigateByUrl(`/upd-contrato/${contratoActual.rfcEmpresa}/${contratoActual.numeroContrato}/${contratoActual.idCliente}`);
        }
      })
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
      const that = this;
      let borrar = ``;
      let cont = 0;
      data.data.forEach((element, index, array) => {
        borrar += `<Ids><idCliente>${
          element.idCliente
          }</idCliente><numeroContrato>${
          element.numeroContrato
          }</numeroContrato><rfcEmpresa>${element.rfcEmpresa}</rfcEmpresa></Ids>`;
        cont++;
        if (cont === array.length) {
          that.deleteData('contrato/elimina/listado', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  costo(data) {
    try {
      const contratoActual = data.data[0];
      if (contratoActual.manejoDePresupuesto) {
        this.baseService.setContratoActual(contratoActual).then(res => {
          if (res) {
            this.router.navigateByUrl(`sel-centro-costos/${contratoActual.rfcEmpresa}/${contratoActual.idCliente}/${contratoActual.numeroContrato}`);
          }
        });
      } else {
        this.alertDialog('Este contrato no tiene manejo de presupuesto');
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /**
   * @description Función confEquipamiento que rdirige a la pagina conf-equipamiento-contrato
   * @returns Redirige al la pagina conf-equipamiento-contrato
   * @author Gerardo Zamudio González
   */
  confEquipamiento(data) {
    const contratoActual = data.data[0];
    if (contratoActual.equipamiento) {
      this.baseService.setContratoActual(contratoActual).then(res => {
        if (res) {
          this.router.navigateByUrl(`/conf-equipamiento-contrato/${contratoActual.rfcEmpresa}/${contratoActual.numeroContrato}/${contratoActual.idCliente}`);
        }
      });
    } else {
      this.alertDialog('Este contrato no tiene equipamiento');
    }
  }

  /**
   * @description Función confEquipamiento que rdirige a la pagina sel-equipamiento-contrato
   * @returns Redirige al la pagina sel-equipamiento-contrato
   * @author Gerardo Zamudio González
   */
  equipamiento(data) {
    const contratoActual = data.data[0];
    if (contratoActual.equipamiento) {
      this.baseService.setContratoActual(contratoActual).then(res => {
        if (res) {
          this.router.navigateByUrl(`/sel-equipamiento-contrato/${contratoActual.rfcEmpresa}/${contratoActual.numeroContrato}/${contratoActual.idCliente}`);
        }
      });
    } else {
      this.alertDialog('Este contrato no tiene equipamiento');
    }
  }

  /*
    Funcion para ver zonas de contrato
  */
  zonas(data) {
    try {
      const contratoActual = data.data[0];
      this.baseService.setContratoActual(contratoActual).then(res => {
        if (res) {
          this.router.navigateByUrl(`/upd-zonas`);
        }
      })
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  table() {
    /*
    Columnas de la tabla
    */
    try {
      this.band = false;
      this.toolbar = [];
      this.columns = [
        {
          caption: 'Número contrato',
          dataField: 'numeroContrato',
          width: 150
        },
        {
          caption: 'RFC empresa',
          dataField: 'rfcEmpresa'
        },
        {
          caption: 'Id cliente',
          dataField: 'idCliente'
        },
        {
          caption: 'Nombre contrato',
          dataField: 'nombre'
        },
        {
          caption: 'Descripción',
          dataField: 'descripcion'
        },
        {
          caption: 'Configura equipamiento',
          dataField: 'equipamiento'
        },
        {
          caption: 'Incluye mantenimiento',
          dataField: 'incluyeMantenimiento'
        },
        {
          caption: 'Fecha registro',
          dataField: 'fechaRegistro',
          dataType: TiposdeDato.datetime,
          format: TiposdeFormato.dmy
        },
        {
          caption: 'Fecha inicio',
          dataField: 'fechaInicio',
          dataType: TiposdeDato.datetime,
          format: TiposdeFormato.dmy
        },
        {
          caption: 'Fecha termino',
          dataField: 'fechaTermino',
          dataType: TiposdeDato.datetime,
          format: TiposdeFormato.dmy
        },
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
    Parametros de Toolbar
    */
      this.band = true;
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
          });
      }
      if (this.modulo.camposClase.find(x => x.nombre === 'Centros de costo')) {
        this.toolbar.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              text: 'Centros de costo',
              onClick: this.receiveMessage.bind(this, 'costo')
            },
            visible: false,
            name: 'simple',
            name2: 'multiple'
          });
      }
      if (this.idClase === 'Automovil') {
        if (this.modulo.camposClase.find(x => x.nombre === 'Parque vehícular')) {
          this.toolbar.push(
            {
              location: 'after',
              widget: 'dxButton',
              locateInMenu: 'auto',
              options: {
                width: 150,
                text: 'Parque vehícular',
                onClick: this.asignaContratoActual.bind(this)
              },
              visible: false,
              name: 'simple',
              name2: 'multiple'
            }
          );
        }
        if (this.modulo.camposClase.find(x => x.nombre === 'Equipamiento')) {
          this.toolbar.push(
            {
              location: 'after',
              widget: 'dxButton',
              locateInMenu: 'auto',
              options: {
                width: 150,
                text: 'Equipamiento',
                onClick: this.receiveMessage.bind(this, 'equip')
              },
              visible: false,
              name: 'simple',
              name2: 'multiple'
            }
          );
        }
        if (this.modulo.camposClase.find(x => x.nombre === 'Equipamiento')) {
          this.toolbar.push(
            {
              location: 'after',
              widget: 'dxButton',
              locateInMenu: 'auto',
              options: {
                width: 150,
                text: 'Conf Equipamiento',
                onClick: this.receiveMessage.bind(this, 'conf-equip')
              },
              visible: false,
              name: 'simple',
              name2: 'multiple'
            }
          );
        }
      } else if (this.idClase === 'Papeleria') {
        if (this.modulo.camposClase.find(x => x.nombre === 'Inventario')) {
          this.toolbar.push(
            {
              location: 'after',
              widget: 'dxButton',
              locateInMenu: 'auto',
              options: {
                width: 150,
                text: 'Inventario',
                onClick: this.asignaContratoActual.bind(this)
              },
              visible: false,
              name: 'simple',
              name2: 'multiple'
            }
          );
        }
      }

      if (this.modulo.camposClase.find(x => x.nombre === 'Zonas')) {
        this.toolbar.push(
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              width: 90,
              text: 'Zonas',
              onClick: this.receiveMessage.bind(this, 'zonas')
            },
            visible: false,
            name: 'simple',
            name2: 'multiple'
          });
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

    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /**
   * @description Obtiene el contrato al que se le dio click y asigna a la variable de Redux el contrato alctual
   * @returns Redirige a la pagina sel-objeto
   * @author Gerardo Zamudio González
   */
  asignaContratoActual() {
    const contratoActual = this.datosevent[0];
    if (contratoActual) {
      this.baseService.setContratoActual(contratoActual).then(res => {
        if (res) {
          this.router.navigateByUrl(`/sel-objeto`);
        }
      });
    }
  }

  /**
   * @description Abre el dialog alert-dialog el cual da un Aviso
   * @returns Cierra el dialog
   * @author Gerardo Zamudio González
   */
  alertDialog(message: string) {
    try {
      const dialogRef = this.dialog.open(AlertDialogComponent, {
        width: '500px',
        data: {
          message
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      this.excepciones(error, 1);
    }
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
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'clientes.component',
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
