import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { Router } from '@angular/router';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import {
  IColumn,
  TypeData,
  IGridOptions,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  IColumnHiding,
  ICheckbox,
  IEditing,
  IColumnchooser,
  TipoAccionCargaMasiva
} from '../../interfaces';
import { AppState, selectContratoState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Negocio } from 'src/app/models/negocio.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-objeto-carga-masiva',
  templateUrl: './objeto-carga-masiva.component.html',
  styleUrls: ['../objeto.component.scss']
})
export class ObjetoCargaMasivaComponent implements OnInit, OnDestroy {

  claveModulo = 'app-objeto-carga-masiva';
  datosevent;
  datos = [];

  idTipoObjeto: number;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;

  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  toolbar: Toolbar[];
  valid = false;
  formDinamico: any;
  spinner = false;
  evento: string;
  headers = [];
  headersColumns = [];
  idClase: string;
  idCliente: number;
  idUsuario: number;
  numeroContrato: string;
  breadcrumb: any;
  negocioSubscribe: Subscription;
  getStateNegocio: Observable<any>;
  contratoActual: any;
  modulo: any = {};
  rfcEmpresa: string;
  contratos: any[];

  public columnas: IColumn[] = [];
  parametrosSP = {
    rfcEmpresa: '',
    idCliente: 0,
    numeroContrato: '',
    idUsuario: 0
  };
  sp = '[objeto].[INS_OBJETO_MASIVO_SP]';
  urlApi = 'objeto/postCargaMasivaObj';
  acciones = [TipoAccionCargaMasiva.ACTUALIZAR, TipoAccionCargaMasiva.CONCATENAR, TipoAccionCargaMasiva.REEMPLAZAR];

  constructor(private siscoV3Service: SiscoV3Service,
              public dialog: MatDialog,
              private location: Location,
              private router: Router,
              private store: Store<AppState>,
              private baseService: BaseService,
              private snackBar: MatSnackBar) {
    this.formDinamico = [];

    this.getStateNegocio = this.store.select(selectContratoState);

  }

  datosMessage($event) {
    this.datosevent = $event.data;
  }

  ngOnInit() {
    this.negocioSubscribe = this.getStateNegocio.subscribe((stateNegocio) => {
        this.idClase = stateNegocio.claseActual;
        this.contratoActual = stateNegocio.contratoActual;
        const usuario = this.baseService.getUserData();
        this.idUsuario = usuario.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (this.modulo.contratoObligatorio) {
          if (this.contratoActual) {
            this.ConfigurarFooter(false);
          } else {
            this.ConfigurarFooter(true);
          }
        } else {
          this.ConfigurarFooter(false);
        }
        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;
          this.parametrosSP.numeroContrato = this.numeroContrato;
          this.parametrosSP.idCliente = this.idCliente;
          this.parametrosSP.idUsuario = this.idUsuario;
          this.parametrosSP.rfcEmpresa = this.rfcEmpresa;

          this.GetHeaders();
          this.Grid();

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
        }
    });
  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer,
   * en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }


  Grid() {
    const pageSizes = ['100', '300', '500', '1000'];
    this.gridOptions = { paginacion: 100, pageSize: pageSizes };
    this.exportExcel = { enabled: true, fileName: this.idClase };
    this.columnHiding = { hide: true };
    this.Checkbox = { checkboxmode: 'none' };
    this.Editing = { allowupdate: false };
    this.Columnchooser = { columnchooser: true };
    this.searchPanel = { visible: true, width: 200, placeholder: 'Buscar', filterRow: true };
    this.scroll = { mode: 'standard' };

    this.toolbar = [];

  }


  /**
   * @description Muestra los campos que se requieren para la inserción masiva de objetos.
   * @returns Regresa los nombres de las propiedades de los campos.
   * @author Sandra Gil Rosales
   */

  GetHeaders() {
    try {
      this.siscoV3Service.getService(
        'objeto/getObjetoAllProp?idClase=' + this.idClase
        + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato).subscribe((res: any) => {
          if (res.err) {
            this.spinner = false;
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.spinner = false;
            if (res.recordsets.length > 0) {
              this.headers = res.recordsets[0];
              this.columnas = [];

              if (this.headers.length > 0) {
                this.headers.forEach(element => {
                  let type: string;

                  switch (element.idTipoDato) {
                    case 'String': {
                      type = TypeData.STRING;
                      break;
                    }
                    case 'Numeric': {
                      type = TypeData.NUMBER;
                      break;
                    }
                    case 'Decimal': {
                      type = TypeData.FLOAT;
                      break;
                    }
                    case 'Date' || 'DateTime': {
                      type = TypeData.DATE;
                      break;
                    }
                    case 'Bit': {
                      type = TypeData.NUMBER;
                      break;
                    }
                    case 'Color': {
                      type = TypeData.COLOR;
                      break;
                    }
                    default: {
                      type = TypeData.STRING;
                      break;
                    }
                  }

                  if (element.idTipoDato !== 'File' && element.idTipoDato !== 'Image'
                    && element.idPadre === 0
                    && element.idTipoDato !== null
                    && element.idTipoDato !== undefined) {
                    /** Estándar ISO 3779 - 1983 y para placas : NOM-001-SCT-2-2016  */
                    switch (element.valor) {
                      case 'VIN':
                        this.columnas.push({
                          nombre: element.propiedad + '|' + element.id, tipo: type, longitud: 18, obligatorio: element.obligatorio,
                          descripcion: element.valor
                        });
                        break;
                      case 'Placa':
                        /** la placa se sube en el apartado de documentos por lo que no se puede subir en la carga masiva */
                        break;

                      default:
                        this.columnas.push({
                          nombre: element.propiedad + '|' + element.id, tipo: type, longitud: 50, obligatorio: element.obligatorio,
                          descripcion: element.valor
                        });
                    }
                  }
                });
                /** parametro para la insercion en la tabla objeto */
                this.columnas.unshift(
                  {
                    nombre: 'idZona', tipo: TypeData.NUMBER, longitud: 50, obligatorio: true,
                    descripcion: 'Id zona'
                  }, {
                    nombre: 'Tipo Objeto', tipo: TypeData.NUMBER, longitud: 50, obligatorio: true,
                    descripcion: 'Tipo objeto'
                  },
                  {
                    nombre: 'idCosto', tipo: TypeData.NUMBER, longitud: 20, obligatorio: true,
                    descripcion: 'Id centro costo'
                  }
                );
              }
            }
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  /**
   * @description Resultado de carga de excel
   * @param resp Respuesta de la carga de archivo
   * @returns Devuelve los valores con los que es cargado el excel
   * @author Sandra Gil Rosales
   *
   */
  responseFileUpload(resp) {
    this.datos = [];
    this.valid = false;
  }

  response(resp) {
    this.location.back();
  }

  // #endregion

  // #region InserciónPartidas

  /**
   * @description Inserción masiva de los objetos
   * @returns Devuelve error o exito de inserción masiva
   * @author Sandra Gil Rosales
   */

  Guardar() {
    this.spinner = true;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.datos.length; i++) {
      Object.keys(this.datos[i]).forEach(key => {
        const value = this.datos[i][key];
        this.formDinamico.push({ idClase: this.idClase, propiedadDesc: key, valor: value, fechaCaducidad: null });

      });

    }
    this.formDinamico.push({ idTipoObjeto: this.idTipoObjeto });

    this.siscoV3Service.postService('partida/PostInsPartidaMasiva', this.formDinamico).subscribe((res: any) => {
      this.spinner = false;
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        this.spinner = false;
        this.valid = false;
        this.snackBar.open('Se han guardado correctamente', 'Ok', {
          duration: 2000
        });
        this.router.navigateByUrl('/sel-objeto');
      }
    },
      (error: any) => {
        this.Excepciones(error, 2);
        this.spinner = false;
        this.router.navigateByUrl('/sel-objeto');
      });
  }

  // #endregion

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  Excepciones(stack, tipoExcepcion: number) {
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
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }



  ngOnDestroy() {
    this.negocioSubscribe.unsubscribe();
  }

}
