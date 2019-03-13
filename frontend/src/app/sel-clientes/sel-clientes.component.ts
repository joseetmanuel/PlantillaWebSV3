import { Component, OnInit } from '@angular/core';
import {
  IGridOptions,
  IColumns,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../interfaces';
import { SiscoV3Service } from '../services/siscov3.service';
import { Router } from '@angular/router';
import { DeleteAlertComponent } from '../delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

@Component({
  selector: 'app-sel-clientes',
  templateUrl: './sel-clientes.component.html',
  styleUrls: ['./sel-clientes.component.sass', '../app.component.sass'],
  providers: [SiscoV3Service]
})
export class ClientesComponent implements OnInit {
  datosevent: any;
  gridOptions: IGridOptions;
  columns: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  clientes = [];
  public numero = 1;

  /*
  Evaluamos a que tipo de evento nos vamos a dirigir cuando se prieten los botones del Toolbar.
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


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _siscoV3Service: SiscoV3Service
  ) {
    this.loadData();
  }


  /*
  Este metodo es el que trae todos los datos inciales de los clientes
  */
  loadData() {
    try {
      this.numero = 0;
      this._siscoV3Service.getService('cliente/getClientes').subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.clientes = res.recordsets[0];
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

  /*
  Función Agregar que rdirige a la pagina ins-cliente
  */
  add(data) {
    try {
      this.router.navigateByUrl('/ins-cliente');
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Funcion Editar redirige a la pagina upd-cliente para actualizar el nombre del Cliente
  */
  edit(data) {
    try {
      this.router.navigateByUrl(
        '/upd-cliente/' + this.datosevent[0]['idCliente']
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
  */
  delete(data) {
    try {
      const _this = this;
      let borrar = '<Ids>';
      let cont = 0;
      data.data.forEach(function(element, index, array) {
        borrar += '<idCliente>' + element.idCliente + '</idCliente>';
        cont++;
        if (cont === array.length) {
          borrar += '</Ids>';
          _this.deleteData('cliente/deleteCliente', 'data=' + borrar);
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  ngOnInit() {
    /*
    Columnas de la tabla
    */
    try {
      this.columns = [
        {
          caption: 'idCliente',
          dataField: 'idCliente',
          hiddingPriority: '1',
          width: 150
        },
        {
          caption: 'nombreCliente',
          dataField: 'nombre',
          hiddingPriority: '0'
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
      Parametros de Toolbar
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
          moduloExcepcion: 'clientes.component',
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
