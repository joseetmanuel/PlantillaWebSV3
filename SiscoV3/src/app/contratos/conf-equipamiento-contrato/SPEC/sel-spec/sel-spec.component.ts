import { Component, OnInit, Input } from '@angular/core';
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
  TiposdeDato
} from '../../../../interfaces';
import { SiscoV3Service } from '../../../../services/siscov3.service';
import { Router } from '@angular/router';
import { DeleteAlertComponent } from '../../../../utilerias/delete-alert/delete-alert.component';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../../../utilerias/excepcion/excepcion.component';

@Component({
  selector: 'app-sel-spec',
  templateUrl: './sel-spec.component.html',
  styleUrls: ['../../conf-equipamiento-contrato.component.sass']
})
export class SelSpecComponent implements OnInit {

  @Input() rfcEmpresa;
  @Input() idCliente;
  @Input() numeroContrato;
  @Input() modulo;

  datosevent: any;
  gridOptions: IGridOptions;
  columns = [];
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  public numero = 1;
  spec = [];
  ban = false;


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

  /*
  Función Agregar que rdirige a la pagina ins-contrato
  */
  add(data) {
    try {
      this.router.navigateByUrl(`ins-spec/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}`);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
Funcion Editar redirige a la pagina upd-cliente para actualizar el Contrato
*/
  edit(data) {
    try {
      const datos = data.data[0];
      this.router.navigateByUrl(`upd-spec/${this.rfcEmpresa}/${this.numeroContrato}/${this.idCliente}/${datos.Id}`);
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
Recorre la data con un forEach para armar un xml, el cual se manda al dialog delete-alert
*/
  delete(data) {
    // tslint:disable-next-line:variable-name
    const that = this;
    let con = 0;
    const datos = data.data;
    let borrar = ``;
    // tslint:disable-next-line:only-arrow-functions
    datos.forEach((e, i, a) => {
      borrar += `<Ids><idSpec>${e.Id}</idSpec></Ids>`;
      con++;
      if (con === a.length) {
        that.deleteData('contrato/spec/actividad/elimina', `data=${borrar}`);
      }
    });
    try {
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  constructor(
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog
  ) { }

  llena() {
    this.siscoV3Service.getService(`contrato/spec/actividad/listado/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`).subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3);
        } else {
          this.spec = res.recordsets[0];
          if (res.recordsets.length > 0) {
            this.columns.push(
              {
                caption: 'Nombre',
                dataField: 'Nombre'
              },
              {
                caption: 'Descripción',
                dataField: 'Descripcion'
              }
            );
            this.otro(this.spec);
          } else {
            this.spec = [];
            this.ban = true;
            this.columns.push(
              {
                caption: 'Nombre',
                dataField: ''
              },
              {
                caption: 'Descripción',
                dataField: ''
              },
              {
                caption: '',
                dataField: ''
              }
            );
          }
        }
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  otro(spec) {
    let cont = 0;
    const that = this;
    Object.keys(spec[0]).forEach((k, v, ar) => {
      if (k !== 'Id' && k !== 'Nombre' && k !== 'Descripcion') {
        that.columns.push(
          {
            caption: k,
            dataField: k,
            dataType: TiposdeDato.boolean
          }
        );
      }
      cont++;
      if (cont === ar.length) {
        that.ban = true;
      }
    });
  }

  table() {
    /*
    Columnas de la tabla
    */
    try {
      this.llena();
      /*
  Parametros de Paginacion de Grit
  */
      const pageSizes = [];
      pageSizes.push('10', '25', '50', '100');

      /*
  Parametros de Exploracion
  */
      this.exportExcel = { enabled: true, fileName: 'Listado de SPEC' };
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
      this.toolbar = [];
      if (this.modulo.camposClase.find(x => x.nombre === 'AgregarSpec')) {
        this.toolbar.push({
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 90,
            text: 'Agregar',
            onClick: this.receiveMessage.bind(this, 'add')
          },
          visible: true
        })
      }

      if (this.modulo.camposClase.find(x => x.nombre === 'EditarSpec')) {
        this.toolbar.push({
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
        })
      }

      if (this.modulo.camposClase.find(x => x.nombre === 'EliminarSpec')) {
        this.toolbar.push({
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
        })
      }

    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  ngOnInit() {
    this.table();
  }

  /*
  Abre el dialog delete-alert
  */
  deleteData(ruta: any, datos) {
    try {
      const dialogRef = this.dialog.open(DeleteAlertComponent, {
        width: '500px',
        data: {
          ruta,
          data: datos
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result === 1) {
          this.ngOnInit();
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
          moduloExcepcion: 'sel-spec.component',
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
