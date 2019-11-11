import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { selectContratoState, selectAuthState, AppState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { Negocio } from 'src/app/models/negocio.model';
import { IGridGeneralConfiguration, TiposdeDato, TiposdeFormato, TipoBusqueda } from 'src/app/interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-upd-solicitud-cotizacion',
  templateUrl: './upd-solicitud-cotizacion.component.html',
  styleUrls: ['./upd-solicitud-cotizacion.component.scss']
})
export class UpdSolicitudCotizacionComponent implements OnInit {
  // tslint:disable: triple-equals
  idClase = '';
  idUsuario = 0;
  spinner = false;
  spinnerPartidas = false;
  claveModulo = 'app-upd-solicitud-cotizacion';
  modulo: any = {};
  breadcrumb: any;
  numeroContrato: string;
  idTipoObjeto: number;
  idObjeto: number;
  idTipoSolicitud: string;
  idProveedorEntidad: number;
  rfcProveedor: string;
  numeroSolicitud: any;
  rfcEmpresa: string;
  idCliente: number;
  sumaPrecios = {
    subTotal: null,
    IVA: null,
    Total: null
  };
  sumaTotal = {
    subTotal: null,
    IVA: null,
    Total: null
  };
  IObjeto: any;
  showAppBanner = false;

  /** Grid data sources. */
  partidasGridDatos: any = [];
  columnsdetail: any = [];
  toolbardetail: any = [];
  datosevent: any = [];
  datosCotizacionSel: any = [];
  partidasPorCotizacionData: any = [];
  amountType = 1;
  muestraPartidas = false;

  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  /**
   * Propiedades de grids.
   */
  partidasSolicitudGrid: IGridGeneralConfiguration;
  customerGridConfiguration: IGridGeneralConfiguration;
  partidasGridConfiguration: IGridGeneralConfiguration;
  partidaColumns = [];

  /**
   * Constructor
   */
  constructor(
    public dialog: MatDialog,
    private siscoV3Service: SiscoV3Service,
    private store: Store<AppState>,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAutenticacion.subscribe((stateAutenticacion) => {
      this.activatedRoute.params.subscribe(parametros => {
        this.numeroSolicitud = parametros.idSolicitud;
        this.idTipoSolicitud = parametros.idTipoSolicitud;
        this.idClase = parametros.idClase;
        this.rfcEmpresa = parametros.rfcEmpresa;
        this.idCliente = parametros.idCliente;
        this.numeroContrato = parametros.numeroContrato;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [
            {
              idSolicitud: this.numeroSolicitud,
              idTipoSolicitud: this.idTipoSolicitud,
              idClase: this.idClase,
              rfcEmpresa: this.rfcEmpresa,
              idCliente: this.idCliente,
              numeroContrato: this.numeroContrato
            }
          ]);
        }
      });
    });
    this.ConfiguracionesGrid();
    this.obtieneObjeto();
  }

  ngOnInit() {
    this.sumaTotal.IVA = 0;
    this.sumaTotal.Total = 0;
    this.sumaTotal.subTotal = 0;
    this.sumaPrecios.IVA = 0;
    this.sumaPrecios.Total = 0;
    this.sumaPrecios.subTotal = 0;
  }

  obtienePartidas() {
    try {
      this.spinner = true;
      this.siscoV3Service.getService('solicitud/getCotizacionPartidasDetalle/' + this.rfcEmpresa +
        '/' + this.idCliente +
        '/' + this.numeroContrato +
        '/' + this.idClase +
        '/' + this.numeroSolicitud).subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.spinner = false;
            this.partidasGridDatos = this.transformaArray(res.recordsets[0]);
          }
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  obtienePartidasPorTipoObjeto() {
    try {
      this.spinnerPartidas = true;
      this.siscoV3Service.getService('proveedor/GetPartidas?idTipoObjeto=' + this.idTipoObjeto + '&&numeroContrato='
        + this.numeroContrato + '&&idCliente=' + this.idCliente + '&&idClase=' + this.idClase
        + '&&rfcProveedor=' + this.rfcProveedor).subscribe((res: any) => {
          if (res.err) {
            this.spinnerPartidas = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.spinnerPartidas = false;
            const arrIndex = res.recordsets[0].length;
            const arrayResult = res.recordsets[0];
            for (let index = 0; index < arrIndex; index++) {
              arrayResult[index].cant = 1;
              let cantidadTotal = 0;
              if (this.amountType === 1) {
                cantidadTotal = cantidadTotal + (Number(arrayResult[index].Costo) * arrayResult[index].cant);
              } else if (this.amountType === 2) {
                cantidadTotal = cantidadTotal + (Number(arrayResult[index].Venta) * arrayResult[index].cant);
              }
              arrayResult[index].Total = cantidadTotal;
            }
            this.partidasPorCotizacionData = res.recordsets[0];
            this.siscoV3Service.getService('partida/GetPartidaColumns?idTipoObjeto=' +
              this.idTipoObjeto + '&&numeroContrato=' +
              this.numeroContrato + '&&idCliente=' +
              this.idCliente + '&&idClase=' +
              this.idClase).subscribe((res2: any) => {
                this.spinnerPartidas = false;
                this.partidasGridConfiguration.Columns = [];
                if (res2.recordsets.length > 0) {
                  this.partidaColumns = res2.recordsets[0];
                  if (this.partidaColumns.length > 0) {
                    for (const data of Object.keys(this.partidaColumns[0])) {
                      let tipoDato = '';
                      if (this.partidaColumns[0][data] === 'File' || this.partidaColumns[0][data] === 'Image') {
                        tipoDato = 'foto';
                      }
                      if (data === 'Partida') {
                        this.partidasGridConfiguration.Columns.push(
                          {
                            caption: 'Cantidad',
                            dataField: 'cant',
                            dataType: TiposdeDato.number
                          });
                      }
                      if (data === 'idPartida') {
                        this.partidasGridConfiguration.Columns.push({
                          caption: 'Id',
                          dataField: data
                        });
                      } else {
                        this.partidasGridConfiguration.Columns.push({
                          caption: data.charAt(0).toUpperCase() + data.slice(1),
                          dataField: data, cellTemplate: tipoDato
                        });
                      }
                    }
                    this.partidasGridConfiguration.Columns.push(
                      {
                        caption: 'Costo',
                        dataField: 'Costo',
                        dataType: TiposdeDato.number,
                        format: TiposdeFormato.currency,
                        allowEditing: false
                      },
                      {
                        caption: 'Total',
                        dataField: 'Total',
                        dataType: TiposdeDato.number,
                        format: TiposdeFormato.currency,
                        allowEditing: false,
                        width: 120
                      }
                    );
                  }
                }
              });
          }
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  transformaArray(array: any): Array<any> {
    const resultado = [];
    if (array != null) {
      const tamano = array.length;
      for (let index = 0; index < tamano; index++) {
        const numeroCotizacion = array[index].numeroCotizacion;
        if (resultado.find((el) => el.numeroCotizacion == numeroCotizacion) === undefined) {
          const arrayItem = {
            numeroCotizacion: array[index].numeroCotizacion,
            nombreComercial: array[index].nombreComercial,
            personaContacto: array[index].personaContacto,
            telefono: array[index].telefono,
            email: array[index].email,
            rfcProveedor: array[index].rfcProveedor,
            idProveedorEntidad: array[index].idProveedorEntidad,
            detalle: []
          };
          resultado.push(arrayItem);
        }
        const volArray = resultado.findIndex(item => item.numeroCotizacion == array[index].numeroCotizacion);
        if (volArray >= 0) {
          const parametros = {
            numeroCotizacion: array[index].numeroCotizacion,
            Id: array[index].idPartida,
            cant: array[index].cantidad,
            Partida: array[index].nombrePartida,
            NoParte: array[index].NoParte,
            Descripcion: array[index].descripcionPartida,
            Costo: array[index].costo,
            Venta: array[index].venta,
            Estatus: array[index].Estatus,
            TotalCosto: array[index].costo * array[index].cantidad,
            TotalVenta: array[index].venta * array[index].cantidad
          };
          resultado[volArray].detalle.push(parametros);
        }
      }
      const resLenght = resultado.length;
      let suma = 0;
      for (let indexR = 0; indexR < resLenght; indexR++) {
        let contador = 0;
        let contadorVenta = 0;
        const detalleLength = resultado[indexR].detalle.length;
        for (let indexZ = 0; indexZ < detalleLength; indexZ++) {
          contador = contador + resultado[indexR].detalle[indexZ].TotalCosto;
          contadorVenta = contadorVenta + resultado[indexR].detalle[indexZ].TotalVenta;
        }
        resultado[indexR].TotalCosto = contador;
        resultado[indexR].TotalVenta = contadorVenta;
        suma = suma + contador;
      }
      this.sumaPrecios.subTotal = suma.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      this.sumaPrecios.IVA = (suma * 0.16).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      this.sumaPrecios.Total = (suma + (suma * 0.16)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
    return resultado;
  }

  obtieneObjeto() {
    const uri = `${this.numeroSolicitud}/${this.idClase}/${this.rfcEmpresa}/${this.idCliente}/${this.numeroContrato}`;
    this.siscoV3Service.getService('solicitud/GetObjetoPorSolicitud/' + uri)
      .subscribe((res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excecion) {
          this.Excepciones(res.err, 3);
        } else {
          this.idObjeto = res.recordsets[0][0].idObjeto;
          this.idTipoObjeto = res.recordsets[0][0].idTipoObjeto;
          this.IObjeto = [
            {
              idClase: this.idClase,
              idObjeto: this.idObjeto,
              idCliente: this.idCliente,
              numeroContrato: this.numeroContrato,
              idTipoObjeto: this.idTipoObjeto,
              rfcEmpresa: this.rfcEmpresa
            }];
          this.showAppBanner = true;
          this.obtienePartidas();
        }
      });
  }

  ConfiguracionesGrid() {
    this.partidasSolicitudGrid = {
      GridOptions: { paginacion: 100, pageSize: ['100', '300', '500', '1000'] },
      ExportExcel: { enabled: true, fileName: 'solicitud' },
      ColumnHiding: { hide: true },
      Checkbox: { checkboxmode: 'multiple' },
      Editing: { allowupdate: true, mode: 'cell' },
      Columnchooser: { columnchooser: false },
      SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
      Scroll: { mode: 'standard' },
      Color: {
        color: 'gris',
        columnas: true,
        alternar: true,
        filas: true
      },
      Detail: { detail: true },
      ToolbarDetail: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 150,
            text: 'Rechazar partida',
            onClick: this.gridDetalleAcciones.bind(this, 'fnEliminaSeleccion')
          },
          visible: false,
          name: 'simple',
        }],
      ToolBox: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 150,
            text: 'Agregar partida',
            onClick: this.gridDetalleAcciones.bind(this, 'fnMuestraGridPartidas')
          },
          visible: false,
          name: 'simple',
        }],
      Columns: [
        {
          caption: 'Numero de cotizacion',
          dataField: 'numeroCotizacion',
          allowEditing: false
        },
        {
          caption: 'Taller',
          dataField: 'nombreComercial',
          allowEditing: false
        },
        {
          caption: 'Contacto',
          dataField: 'personaContacto',
          allowEditing: false
        },
        {
          caption: 'Telefono',
          dataField: 'telefono',
          allowEditing: false
        },
        {
          caption: 'Correo electronico',
          dataField: 'email',
          allowEditing: false
        },
        {
          caption: 'Total',
          dataField: 'TotalCosto',
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency,
          allowEditing: false
        }
      ]
    };
    this.toolbardetail = [
      {
        location: 'after',
        widget: 'dxButton',
        locateInMenu: 'auto',
        options: {
          width: 200,
          text: 'Eliminar',
          onClick: null
        },
        visible: true
      }];
    this.columnsdetail = [
      {
        caption: 'Id',
        dataField: 'Id',
        allowEditing: false
      },
      {
        caption: 'Foto',
        dataField: 'Foto',
        cellTemplate: 'foto'
      },
      {
        caption: 'Cantidad',
        dataField: 'cant',
        dataType: TiposdeDato.number,
        allowEditing: true
      },
      {
        caption: 'Partida',
        dataField: 'Partida',
        allowEditing: false
      },
      {
        caption: 'Numero de parte',
        dataField: 'NoParte',
        allowEditing: false
      },
      {
        caption: 'Descripcion',
        dataField: 'Descripcion',
        allowEditing: false,
        width: 300
      },
      {
        caption: 'Tipo',
        dataField: 'Tipo de partida',
        allowEditing: false
      },
      {
        caption: 'Especialidad',
        dataField: 'Especialidad',
        allowEditing: false
      },
      {
        caption: 'Clasificacion',
        dataField: 'Clasificacion',
        allowEditing: false
      },
      {
        caption: 'Marca',
        dataField: 'Marca',
        allowEditing: false
      },
      {
        caption: 'Grupo',
        dataField: 'Grupo',
        allowEditing: false
      },
      {
        caption: 'Estatus',
        dataField: 'Estatus',
        allowEditing: false
      },
      {
        caption: 'Costo',
        dataField: 'Costo',
        dataType: TiposdeDato.number,
        format: TiposdeFormato.currency,
        allowEditing: false
      },
      {
        caption: 'Total',
        dataField: 'TotalCosto',
        dataType: TiposdeDato.number,
        format: TiposdeFormato.currency,
        allowEditing: false
      }
    ];
    this.partidasGridConfiguration = {
      GridOptions: { paginacion: 100, pageSize: ['100', '300', '500', '1000'] },
      ExportExcel: { enabled: true, fileName: 'solicitud' },
      ColumnHiding: { hide: true },
      Checkbox: { checkboxmode: 'multiple' },
      Editing: { allowupdate: true, mode: 'cell' },
      Columnchooser: { columnchooser: false },
      SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
      Scroll: { mode: 'standard' },
      Color: {
        color: 'gris',
        columnas: true,
        alternar: true,
        filas: true
      },
      Detail: { detail: false },
      ToolbarDetail: null,
      ToolBox: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            width: 150,
            text: 'Agregar',
            onClick: this.gridDetalleAcciones.bind(this, 'fnAgregaPartidaACotizacion')
          },
          visible: false,
          name: 'simple',
        }],
      Columns: null
    };
  }

  gridDetalleAcciones($event) {
    if ($event === 'fnEliminaSeleccion') {
      const senddata = {
        event: $event,
        data: this.datosevent
      };
      this.eliminaHijoArrayPadre(senddata.data);
    } else if ($event === 'fnMuestraGridPartidas') {
      const data = {
        array: this.datosevent
      };
      this.fnMuestraGridPartidas(data);
    } else if ($event === 'fnAgregaPartidaACotizacion') {
      const data = {
        array: this.datosevent
      };
      this.fnAgregaPartidaACotizacion(data);
    }
  }

  fnMuestraGridPartidas(data) {
    this.datosCotizacionSel = data;
    this.muestraPartidas = true;
    this.obtienePartidasPorTipoObjeto();
  }

  fnAgregaPartidaACotizacion(data) {
    if (data.array != null) {
      const partida = this.fnCreatePartidasXML(data.array);
      const parametros = {
        idSolicitud: this.numeroSolicitud,
        rfcEmpresa: this.rfcEmpresa,
        idCliente: this.idCliente,
        idClase: this.idClase,
        numeroContrato: this.numeroContrato,
        idTipoSolicitud: this.idTipoSolicitud,
        Cotizacion: this.datosCotizacionSel.array[0].numeroCotizacion,
        idProveedorEntidad: this.datosCotizacionSel.array[0].idProveedorEntidad,
        rfcProveedor: this.datosCotizacionSel.array[0].rfcProveedor,
        Data: partida
      };
      this.siscoV3Service.postService('solicitud/PostEditaPartidasCotizacion', parametros)
        .subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.muestraPartidas = false;
            this.obtienePartidas();
          }
        });
    }
  }

  datosDetailMessage($event) {
    this.datosevent = [];
    this.datosevent = $event.data;
  }

  datosMessage($event) {
    this.datosevent = [];
    this.datosevent = $event.data;
  }

  fnAmountType($event) {
    if ($event == 2) {
      this.amountType = 2;
      this.columnsdetail = this.columnsdetail.filter((item) => item.dataField !== 'Costo' && item.dataField !== 'TotalCosto');
      this.columnsdetail.push(
        {
          caption: 'Venta',
          dataField: 'Venta',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'Total',
          dataField: 'TotalVenta',
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency,
          width: 120
        });
      this.partidasSolicitudGrid.Columns = this.partidasSolicitudGrid.Columns
        .filter((item) => item.dataField !== 'Costo' && item.dataField !== 'TotalCosto');
      this.partidasSolicitudGrid.Columns.push(
        {
          caption: 'Total',
          dataField: 'TotalVenta',
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency,
          width: 120
        });
    } else if ($event == 1) {
      this.amountType = 1;
      this.columnsdetail = this.columnsdetail.filter((item) => item.dataField !== 'Venta' && item.dataField !== 'TotalVenta');
      this.columnsdetail.push(
        {
          caption: 'Costo',
          dataField: 'Costo',
          allowEditing: false,
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency
        },
        {
          caption: 'Total',
          dataField: 'TotalCosto',
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency,
          width: 120
        });
      this.partidasSolicitudGrid.Columns = this.partidasSolicitudGrid.Columns
        .filter((item) => item.dataField !== 'Venta' && item.dataField !== 'TotalVenta');
      this.partidasSolicitudGrid.Columns.push(
        {
          caption: 'Total',
          dataField: 'TotalCosto',
          dataType: TiposdeDato.number,
          format: TiposdeFormato.currency,
          width: 120
        });
    }
    this.calculaMontos($event);
  }

  fnCreatePartidasXML(array): string {
    let resultado = '';
    let cadena = '';
    if (array !== null) {
      array.forEach(item => {
        cadena +=
          '<partida>' +
          '<idPartida>' + item.idPartida + '</idPartida>' +
          '<cantidad>' + item.cant + '</cantidad>' +
          '<idProveedorEntidad>' + item.idProveedorEntidad + '</idProveedorEntidad>' +
          '<rfcProveedor>' + item.rfcProveedor + '</rfcProveedor>' +
          '<costo>' + item.Costo + '</costo>' +
          '<venta>' + item.Venta + '</venta>' +
          '</partida>';
      });
    }
    resultado =
      '<Partidas>' +
      cadena +
      '</Partidas>';
    return resultado;
  }

  calculaMontos(tipo: number) {
    let suma = 0;
    const arrayLenght = this.partidasGridDatos.length;
    if (tipo == 1) {
      for (let index = 0; index < arrayLenght; index++) {
        suma = suma + this.partidasGridDatos[index].TotalCosto;
      }
    } else {
      for (let index = 0; index < arrayLenght; index++) {
        suma = suma + this.partidasGridDatos[index].TotalVenta;
      }
    }
    this.sumaPrecios.subTotal = suma.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    this.sumaPrecios.IVA = (suma * 0.16).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    this.sumaPrecios.Total = (suma + (suma * 0.16)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }

  eliminaHijoArrayPadre(array) {
    const resultado = [];
    const arrayLength = array.length;
    for (let index = 0; index < arrayLength; index++) {
      const numeroCotizacion = array[index].numeroCotizacion;
      if (resultado.find((el) => el.numeroCotizacion == numeroCotizacion) === undefined) {
        const arrayItem = {
          numeroCotizacion: array[index].numeroCotizacion,
          Partidas: [{
            Id: array[index].Id
          }]
        };
        resultado.push(arrayItem);
      } else {
        resultado[0].Partidas.push({
          Id: array[index].Id
        });
      }
    }
    const xml = this.creaEliminaPartidasXML(resultado);
    if (xml != '') {
      const parametros = {
        idSolicitud: this.numeroSolicitud,
        Data: xml
      };
      this.siscoV3Service.postService('solicitud/PostDelPartidaCotizacion', parametros)
        .subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.snackBar.open('Las partidas seleccionadas fueron canceladas.', 'Ok', {
              duration: 2000
            });
            this.obtienePartidas();
          }
        });
    }
  }

  editevent($event) {
    if ($event != null) {
      let suma = 0;
      const arrayLenght = this.partidasGridDatos.length;
      if (this.amountType == 1) {
        $event.editdata.key.TotalCosto = Number($event.editdata.key.Costo) * Number($event.editdata.newData.cant);
        for (let index = 0; index < arrayLenght; index++) {
          suma = suma + this.partidasGridDatos[index].TotalCosto;
        }
      } else if (this.amountType == 2) {
        $event.editdata.key.TotalVenta = Number($event.editdata.key.Venta) * Number($event.editdata.newData.cant);
        for (let index = 0; index < arrayLenght; index++) {
          suma = suma + this.partidasGridDatos[index].TotalVenta;
        }
      }
      this.sumaPrecios.subTotal = suma.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      this.sumaPrecios.IVA = (suma * 0.16).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      this.sumaPrecios.Total = (suma + (suma * 0.16)).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
  }

  creaEliminaPartidasXML(array): string {
    let resultado = '';
    let cadena = '';
    if (array !== null) {
      const arrayLenngth = array.length;
      for (let index = 0; index < arrayLenngth; index++) {
        cadena +=
          '<Orden>' +
          '<NumeroOrden>' + array[index].numeroCotizacion + '</NumeroOrden>' +
          '<Partidas>';
        const childArrayLength = array[index].Partidas.length;
        for (let childrenIndex = 0; childrenIndex < childArrayLength; childrenIndex++) {
          cadena += '<Id>' + array[index].Partidas[childrenIndex].Id + '</Id>';
        }
        cadena +=
          '</Partidas>' +
          '</Orden>';
      }
    }
    resultado =
      '<Ordenes>' +
      cadena +
      '</Ordenes>';
    return resultado;
  }

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'app-upd-solicitud-cotizacion',
          mensajeExcepcion: '',
          stack
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) { }
  }
}
