import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MDCDialog } from '@material/dialog';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../../interfaces';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DeleteAlertComponent } from '../../utilerias/delete-alert/delete-alert.component';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';

@Component({
  selector: 'app-upd-cliente',
  templateUrl: './upd-cliente.component.html',
  styleUrls: ['./upd-cliente.component.sass'],
  providers: [SiscoV3Service]
})
export class EditClienteComponent implements OnInit {
  public idCliente;
  public cliente;
  datosevent;
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

  public numero = 1;

  /*
  Hace las validaciones para que los datos que inserten del cliente sean correctos
  */
  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required])
  });

  /*
  Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar (clienteEntidad).
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

  /*
  Obtenemos la data del componente "grid-component".
  */
  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Función Agregar que rdirige a la pagina ins-clienteEntidad
  */
  add(data) {
    try {
      this.router.navigateByUrl('/ins-clienteEntidad/' + this.idCliente);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Funcion Editar redirige a la pagina upd-clienteEntidad para actualizar los datos fiscales del cliente
  */
  edit(data) {
    try {
      const rfcClienteEntidad = this.datosevent[0].rfcClienteEntidad;
      this.router.navigateByUrl('/upd-clienteEntidad/' + rfcClienteEntidad);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
  */
  delete(data) {
    try {
      let borrar = '';
      let cont = 0;
      const _this = this;
      data.data.forEach(function(element, index, array) {
        // tslint:disable-next-line:max-line-length
        borrar +=
          '<Ids><idCliente>' +
          element.idCliente +
          '</idCliente><rfcClienteEntidad>' +
          element.rfcClienteEntidad +
          '</rfcClienteEntidad></Ids>';
        cont++;
        if (cont === array.length) {
          _this.deleteData('cliente/deleteClienteEntidad', 'data=' + borrar);
        }
      });
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
  addDoc(data) {
    try {
      this.router.navigateByUrl('/ins-documento/' + this.idCliente);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  deleteDoc(data) {

  }

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute
  ) {
    /*
    Obtiene el idClinte por los parametros
    */
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
    });
    this.loadData();
  }

  /*
  Este metodo es el que trae todos los datos inciales del cliente junto con sus dtaos ficales
  */
  loadData() {
    try {
      this.numero = 0;
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
              this.cliente = res.recordsets[0][0];
              this.clienteForm.controls['nombre'].setValue(this.cliente.nombre);
              this._siscoV3Service
                .getService(
                  'cliente/getClienteEntidadPorIdCliente?idCliente=' +
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
                      this.numero = 1;
                      this.cienteEntidad = res.recordsets[0];
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
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Este evento actualiza los datos del cliente (Nombre)
  */
 actualizaCliente() {
    try {
      this.cliente.nombre = this.clienteForm.controls['nombre'].value;
      this.numero = 0;
      this._siscoV3Service
        .putService('cliente/putActualizaCliente', this.cliente)
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

  ngOnInit() {
    try {
      /*
      Columnas de la tabla Datos fiscales
      */
      this.columns = [
       {
          caption: 'rfcClienteEntidad',
          dataField: 'rfcClienteEntidad',
          hiddingPriority: '1'
        },
        {
          caption: 'nombreComercial',
          dataField: 'nombreComercial',
          hiddingPriority: '0'
        },
        {
          caption: 'Teléfono',
          dataField: 'telefono',
          hiddingPriority: '0'
        },
        {
          caption: 'Email',
          dataField: 'email',
          hiddingPriority: '0'
        }
      ];

      /*
      Columnas de la tabla Documentos
      */
      this.columDoc = [
        {
          caption: 'idDocumento',
          dataField: 'idDocumento',
          hiddingPriority: '1'
        },
        {
          caption: 'Documento',
          dataField: 'docuemento',
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
      Parametros de Toolbar Datos fiscales
      */
      this.toolbar = [
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
        },
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
      ];


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
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Abre el dialog delete-alert
  */
  deleteData(ruta: any, data) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '60%',
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
      this.excepciones(error, 1);
    }
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'edit-cliente.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {
      console.error(error);
    }
  }
}
