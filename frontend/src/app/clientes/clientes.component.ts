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
import { Router } from '../../../node_modules/@angular/router';
import { DeleteAlertComponent } from '../delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.sass', '../app.component.sass'],
  providers: [SiscoV3Service]
})
export class ClientesComponent implements OnInit {
  datosevent;
  gridOptions: IGridOptions;
  columns: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  clientes = [];
  public numero = 1;

  // #region
    /*
    Evaluamos a que tipo de evento nos vamos a dirigir.
    */
    // #endregion
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

  // #region
    /*
    Obtenemos la data del componente "grid-component".
    */
    // #endregion
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

  // #region documentación
  /*
  Fincion Agregar
  */
  // #endregion
  add(data) {
    try {
      this.router.navigateByUrl('/ins-cliente');
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  // #region documentación
  /*
  Funcion Editar
  */
  // #endregion
  edit(data) {
    try {
      this.router.navigateByUrl(
        '/upd-cliente/' + this.datosevent[0]['idCliente']
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  // #region documentación
  /*
  Funcion Borrar
  */
  // #endregion
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
          _this.deleteData(borrar, '1');
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  ngOnInit() {
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

      // #region documentación
      /*
    Parametros de Sumaries
    */
      // #endregion
      this.summaries = [
        {
          column: 'idCliente',
          summaryType: 'custom',
          displayFormat: 'Check: {0}',
          name: 'SelectedRowsSummary'
        }
      ];

      // #region documentación
      /*
    Parametros de Paginacion de Grit
    */
      // #endregion
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      // #region documentación
      /*
    Parametros de Exploracion
    */
      // #endregion
      this.exportExcel = { enabled: true, fileName: 'prueba2' };

      // #region documentación
      /*
    Parametros de Search
    */
      // #endregion
      this.searchPanel = {
        visible: true,
        width: 200,
        placeholder: 'Buscar...',
        filterRow: true
      };

      // #region documentación
      /*
    Parametros de Scroll
    */
      // #endregion
      this.scroll = { mode: 'standard' };

      // #region documentación
      /*
    Parametros de Toolbar
    */
      // #endregion
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

  deleteData(data: any, tipo) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '60%',
        data: {
          data: data,
          tipo: tipo
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
      console.log(error);
    }
  }
}
