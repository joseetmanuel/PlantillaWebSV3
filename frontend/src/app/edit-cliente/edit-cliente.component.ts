import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '../../../node_modules/@angular/router';
import { SiscoV3Service } from '../services/siscov3.service';
import { MDCDialog } from '@material/dialog';
import {
  IGridOptions,
  IColumns,
  IColButtons,
  IExportExcel,
  ISummaries,
  ISearchPanel,
  IScroll,
  Toolbar
} from '../interfaces';
import {
  FormGroup,
  FormControl,
  Validators
} from '../../../node_modules/@angular/forms';
import { MatDialog } from '@angular/material';
import { DeleteAlertComponent } from '../delete-alert/delete-alert.component';
import { ExcepcionComponent } from '../excepcion/excepcion.component';

@Component({
  selector: 'app-edit-cliente',
  templateUrl: './edit-cliente.component.html',
  styleUrls: ['./edit-cliente.component.sass'],
  providers: [SiscoV3Service]
})
export class EditClienteComponent implements OnInit {
  public idCliente;
  public cliente;
  datosevent;
  gridOptions: IGridOptions;
  columns: IColumns[];
  columDoc: IColumns[];
  colButtons: IColButtons[];
  exportExcel: IExportExcel;
  summaries: ISummaries[];
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  cienteEntidad = [];
  documentos = [];
  public numero = 1;
  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required])
  });

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

  datosMessage($event) {
    try {
      this.datosevent = $event.data;
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  //******************FUNCION AGREGAR**************** */
  add(data) {
    try {
      this.router.navigateByUrl('/add-clienteEntidad/' + this.idCliente);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  //******************FUNCION EDITAR**************** */
  edit(data) {
    try {
      const rfcClienteEntidad = this.datosevent[0].rfcClienteEntidad;
      this.router.navigateByUrl('/edit-clienteEntidad/' + rfcClienteEntidad);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  // ******************FUNCION BORRAR**************** */
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
          _this.deleteData(borrar, '2');
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(parametros => {
      this.idCliente = parametros.idCliente;
    });
    this.loadData();
  }

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

  agregarCliente() {
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
      this.columns = [
        {
          caption: 'Check',
          dataField: 'check',
          cellTemplate: 'checkbox',
          hiddingPriority: '2'
        },
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

      this.columDoc = [
        {
          caption: 'Check',
          dataField: 'check',
          cellTemplate: 'checkbox',
          hiddingPriority: '2'
        },
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

      //******************PARAMETROS DE TEMPLATE DE BOTONES**************** */

      //******************PARAMETROS DE SUMMARIES**************** */
      this.summaries = [
        {
          column: 'idCliente',
          summaryType: 'custom',
          displayFormat: 'Check: {0}',
          name: 'SelectedRowsSummary'
        }
      ];

      //******************PARAMETROS DE PAGINACION DE GRID**************** */
      let pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      //this.gridOptions = { paginacion: 10, pageSize:pageSizes}

      //******************PARAMETROS DE EXPORTACION**************** */
      this.exportExcel = { enabled: true, fileName: 'prueba2' };

      //******************PARAMETROS DE SEARCH**************** */
      this.searchPanel = {
        visible: true,
        width: 200,
        placeholder: 'Buscar...',
        filterRow: true
      };

      //******************PARAMETROS DE SCROLL**************** */
      this.scroll = { mode: 'standard' };

      //******************PARAMETROS DE TOOLBAR**************** */
      this.toolbar = [
        {
          location: 'before',
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
          location: 'before',
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
          location: 'before',
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
          moduloExcepcion: 'edit-cliente.component',
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
