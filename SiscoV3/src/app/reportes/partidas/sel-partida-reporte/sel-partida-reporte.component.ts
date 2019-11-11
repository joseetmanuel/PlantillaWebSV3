import { Component, OnInit, ViewChild, SimpleChange } from '@angular/core';
import { SiscoV3Service } from '../../../services/siscov3.service';
import { Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from 'src/app/store/app.states';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { IGridGeneralConfiguration, TiposdeDato, IBuscador, TipoBusqueda } from 'src/app/interfaces';
import { Observable } from 'rxjs';
import { Negocio } from 'src/app/models/negocio.model';
@Component({
  selector: 'app-sel-partida-reporte',
  templateUrl: './sel-partida-reporte.component.html',
  styleUrls: ['./sel-partida-reporte.component.scss'],
  providers: [SiscoV3Service]
})

export class SelPartidaReporteComponent implements OnInit {

  /** Variables. */
  claveModulo = 'app-sel-partida-reporte';
  spinner: boolean = false;
  dataGrid: any = [];
  gridConfiguration: IGridGeneralConfiguration;
  buscador: IBuscador = {
    parametros: {
      contratos: '',
      idClase: ''
    },
    tipoBusqueda: TipoBusqueda.parqueVehicular,
    isActive: true
  };
  idClase: string;
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  contratosSeleccionados: any;
  modulo: any = {};
  breadcrumb: any;

  constructor(
    private router: Router,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private store: Store<AppState>) {
    this.spinner = true;
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratosSeleccionados = stateNegocio.contratosSeleccionados;
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(
            this.modulo.breadcrumb,
            this.idClase
          );
        }
        this.buscador.parametros.contratos = this.fnGetBuscadorParameters(this.contratosSeleccionados);
        this.buscador.parametros.idClase = this.idClase;
        this.fnGridInitializer();
      });
    });
    setTimeout(() => {
      this.spinner = false;
    }, 1000);

  }

  /**
   * Funcion para llegar el grid.
   * @param _idClase Representa la clase global del contrato.
   * @param _idTipoObjeto Representa el tipo de objeto.
   */
  fnLlenaGrid(_idClase: string, _idTipoObjeto: number) {
    this.spinner = true;
    const _url = `reporte/GetReportePartidas?idClase=${_idClase}&&idTipoObjeto=${_idTipoObjeto}`;
    this.siscoV3Service.getService(_url).subscribe((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excecion) {
        this.Excepciones(res.err, 3);
      } else {
        this.dataGrid = res.recordsets[0] ? res.recordsets[0] : [];
      }
      this.spinner = false;
    }, (error: any) => {
      this.spinner = false;
      this.Excepciones(error, 2);
    });
  }

  fnGridInitializer() {
    this.gridConfiguration = {
      GridOptions: {
        paginacion: 10,
        pageSize: [10, 30, 50, 100]
      },
      ExportExcel: { enabled: false, fileName: 'reportes' },
      ColumnHiding: { hide: false },
      Checkbox: { checkboxmode: 'multiple' },
      Editing: { allowupdate: false, mode: 'cell' },
      Columnchooser: { columnchooser: false },
      SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
      Scroll: { mode: 'standard' },
      Detail: { detail: false },
      ToolbarDetail: null,
      Color: {
        color: 'gris',
        columnas: true,
        alternar: true,
        filas: true
      },
      ToolBox: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 200,
            text: 'Asignar',
            onClick: this.receiveMessage.bind(this, '.')
          },
          visible: false
        }],
      Columns: [
        {
          caption: 'Id',
          dataField: 'id',
          allowEditing: false
        },
        {
          caption: 'Tipo de objeto',
          dataField: 'idTipoObjeto',
          allowEditing: false
        },
        {
          caption: 'Marca',
          dataField: 'Marca',
          allowEditing: false
        },
        {
          caption: 'Submarca',
          dataField: 'Submarca',
          allowEditing: false
        },
        {
          caption: 'Combustible',
          dataField: 'Combustible',
          allowEditing: false
        },
        {
          caption: 'Clase',
          dataField: 'Clase',
          allowEditing: false
        },
        {
          caption: 'Cilindros',
          dataField: 'Cilindros',
          allowEditing: false
        },
        {
          caption: 'idClase',
          dataField: 'idClase',
          allowEditing: false
        },
        {
          caption: 'Partida',
          dataField: 'Partida',
          allowEditing: false
        },
        {
          caption: 'NoParte',
          dataField: 'NoParte',
          allowEditing: false
        },
        {
          caption: 'Descripción',
          dataField: 'Descripción',
          allowEditing: false
        },
        {
          caption: 'Tipo de partida',
          dataField: 'tipoDePartida',
          allowEditing: false
        },
        {
          caption: 'Especialidad',
          dataField: 'Especialidad',
          allowEditing: false
        },
        {
          caption: 'Clasificación',
          dataField: 'Clasificación',
          allowEditing: false
        },
        {
          caption: 'Costo',
          dataField: 'Costo',
          allowEditing: false
        },
        {
          caption: 'Costo promedio',
          dataField: 'CostoPromedio',
          allowEditing: false
        },
        {
          caption: 'Proveedores venden partida',
          dataField: 'noProveedoresVendenPartida',
          allowEditing: false
        },
        {
          caption: 'Venta',
          dataField: 'Venta',
          allowEditing: false
        },
        {
          caption: 'Venta promedio',
          dataField: 'VentaPromedio',
          allowEditing: false
        },
        {
          caption: 'Partidas vendidas',
          dataField: 'noPartidasVendidas',
          allowEditing: false
        }
      ]
    };
  }

  receiveMessage($event) {

  }

  responseBuscador($event) {
    if ($event != null) {
      this.fnLlenaGrid(this.idClase, $event.recordsets[0].idTipoObjeto);
    }
  }

  fnGetBuscadorParameters(array): string {
    let xml = '';
    let cadena;
    if (array !== null) {
      array.forEach((element: { rfcEmpresa: string; idCliente: string; numeroContrato: string; }) => {
        cadena +=
          '<contrato>' +
          '<rfcEmpresa>' + element.rfcEmpresa + '</rfcEmpresa>' +
          '<idCliente>' + element.idCliente + '</idCliente>' +
          '<numeroContrato>' + element.numeroContrato + '</numeroContrato>' +
          '</contrato>';
      });
    }
    xml =
      '<contratos>' +
      cadena +
      '</contratos>';
    return xml;
  }

  Excepciones(stack, tipoExcepcion: number) {
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
          stack
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (err) {
    }
  }


}
