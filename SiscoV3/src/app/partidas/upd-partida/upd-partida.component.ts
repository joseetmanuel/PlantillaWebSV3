import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { IFileUpload } from 'src/app/interfaces';
import { DxTreeViewComponent } from 'devextreme-angular';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { AppState, selectContratoState, selectAuthState } from 'src/app/store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';

@Component({
  selector: 'app-upd-partida',
  templateUrl: './upd-partida.component.html',
  providers: [SiscoV3Service]
})
export class UpdPartidaComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-upd-partida';
  idPartida: number;
  idTipoObjeto: number;
  spinner = false;
  IUploadFile: IFileUpload;
  public formValid = true;
  idClase: string;
  idCliente: number;
  idUsuario: number;
  numeroContrato: string;
  @ViewChild(DxTreeViewComponent) treeView;
  viewerArray: any;
  breadcrumb: any;
  getStateNegocio: Observable<any>;
  getStateAutenticacion: Observable<any>;
  contratoActual: any;
  modulo: any = {};
  tiposCobro: any[] = [];
  rfc: string;
  tipoSolicitud;
  tipo: any;
  idTipoSolicitud: any = false;
  indexTipoSolicitud: any;
  gridDataSource: any;
  gridBoxValue2 = [];
  showGrid: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: Store<AppState>) {
    super();
    this.spinner = true;
    this.activatedRoute.params.subscribe(parametros => {
      this.idPartida = parametros.idPartida;
      this.idTipoObjeto = parametros.idTipoObjeto;
    });
    this.getStateNegocio = this.store.select(selectContratoState);
    this.getStateAutenticacion = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        this.contratoActual = stateNegocio.contratoActual;
        this.store.dispatch(new CambiaConfiguracionFooter(new FooterConfiguracion(ContratoMantenimientoEstatus.conMantemiento,
          this.modulo.contratoObligatorio, this.modulo.multicontrato, false, true)));

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{ idTipoObjeto: this.idTipoObjeto },
          { idPartida: this.idPartida }]);
        }

        if (this.contratoActual !== null) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          this.rfc = this.contratoActual.rfcEmpresa;

        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
          this.rfc = '';

        }
      });

      this.GetPartidas();
      this.GetTipoSolicitud();
    });


  }

  // #region get partidas
  /**
   * @description Muestra propiedades de partidas.
   * @returns Devuelve propiedades de las partidas
   * @author Edgar Mendoza Gómez
   */
  GetPartidas() {
    this.siscoV3Service.getService('partida/GetPropiedadesAll?idClase='
      + this.idClase + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato).subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.GetPropiedades(res.recordsets[0]);

            this.siscoV3Service.getService('partida/GetPartidaValor?idPartida=' + this.idPartida
              + '&&idClase=' + this.idClase).subscribe((res2: any) => {
                this.SetValuesUpd(res2.recordsets[0]);

                const ext = ['.jpg', '.jpeg', '.png', '.pdf'];
                this.tipoObjetoPropiedades.forEach(e => {
                  if (e.idTipoDato === 'File' || e.idTipoDato === 'Image') {
                    e.IUploadFile = {
                      path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: environment.aplicacionesId,
                      idModuloSeguridad: 1, multiple: false, soloProcesar: false, tipodecarga: 'instantly'
                      , extension: ext, titulo: '', descripcion: '', previsualizacion: true, idDocumento: this.valorTipoObjeto[e.valor]
                    };

                    if (e.valorPropiedad) {
                      e.IUploadFile.idDocumento = e.valorPropiedad[0];
                    }
                  }
                });

                this.GetTipoCobro();
              });
          }
        }, (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        }
      );
  }

  // #endregion

  /**
   * @description Obtiene los valores del tipo de cobro de la partida
   * @author Andres Farias
   */
  GetTIpoCobroPorPartida() {
    this.siscoV3Service.getService('partida/GetTipoCobrosPorPartida?idPartida=' + this.idPartida
      + '&&idClase=' + this.idClase).subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          // this.idTipoSolicitud = res.recordsets[1][0].idTipoSolicitud;
          let sol = res.recordsets[1];
          this.showGrid = false;
          this.LlenaTipoSolicitud(sol);
          const valoresCobro = res.recordsets[0];
          this.tiposCobro.forEach((tipoCobro, index) => {
            const costo = valoresCobro.find((vcobro) => {
              return vcobro.nombre === tipoCobro.nombre;
            });

            if (costo) {
              this.tiposCobro[index].costo = costo.costo;
            } else {
              this.tiposCobro[index].costo = 0;
            }
          });
        }
      }, error => {
        this.Excepciones(error, 2);
        this.spinner = false;
      });
  }

  LlenaTipoSolicitud(tipoSolicitud) {
    this.idTipoSolicitud = [];
    this.tipo.forEach((e, i, ar) => {
      tipoSolicitud.forEach((es, is, ars) => {
        if (e.idTipoSolicitud === es.idTipoSolicitud) {
          this.gridBoxValue2.push(e.idTipoSolicitud);
          this.idTipoSolicitud.push(e)
        }
      })
      if(i + 1 === ar.length) {
        this.showGrid = true;
      }
    });
  }

  /**
   * @description Obtiene los tipos de cobro de la clase para pintar los campos en el formulario
   * @author Andres Farias
   */
  GetTipoCobro() {
    this.siscoV3Service.getService('partida/GetPartidaTipoCobro?idClase=' + this.idClase).subscribe((result: any) => {
      if (result.err) {
        this.Excepciones(result.err, 4);
      } else if (result.excepcion) {
        this.Excepciones(result.excepcion, 3);
      } else {
        this.tiposCobro = result.recordsets[0];
        this.GetTIpoCobroPorPartida();
      }
    });
  }

  insCreateXmlTipoSolicitud() {
    const that = this;
    let xml = ``;
    this.idTipoSolicitud.forEach((e, i, ar) => {
      // tslint:disable-next-line:max-line-length
      xml += `<solicitudes><idTipoSolicitud>${e.idTipoSolicitud}</idTipoSolicitud></solicitudes>`;
      if (i + 1 === ar.length) {
        that.ActualizarPartida(xml);
      }
    });
  }

  // #region ActualizarPartida
  /**
   * @description Actualiza partida por su id.
   * @returns Devuelve éxito o error al modificar
   * @author Edgar Mendoza Gómez
   */

  ActualizarPartida(xml) {
    this.ValuesFormUpd(this.tipoObjetoPropiedades, this.idPartida);
    const found = this.tiposCobro.find((tipoCobro: any) => {
      return tipoCobro.costo > 0;
    });
    if (this.formDinamico.length > 0) {
      if (found) {
        this.spinner = true;
        this.siscoV3Service.putService('partida/PutActualizaPartida', {
          formDinamico: this.formDinamico, idTipoObjeto: this.idTipoObjeto,
          idClase: this.idClase, rfc: this.rfc, idCliente: this.idCliente, numeroContrato: this.numeroContrato, idTipoSolicitud: xml
        }).subscribe((res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.ActualizarTipoCobro();
          }
        },
          (error: any) => {
            this.Excepciones(error, 2);
            this.spinner = false;
          });
      } else {
        this.snackBar.open('Se debe de agregar por lo menos un tipo de cobro.', 'Ok', {
          duration: 2000
        });
      }
    } else {
      this.snackBar.open('Los campos con * son obligatorios.', 'Ok', {
        duration: 2000
      });
    }

  }

  // #endregion

  /**
   * @description Actualiza tipo de cobro
   * @author Andres Farias
   */
  ActualizarTipoCobro() {
    let tipoCostos = '<tiposCostos>';
    this.tiposCobro.forEach((tipocosto: any) => {
      const precio = tipocosto.costo === undefined ? 0 : tipocosto.costo;
      tipoCostos += '<tipocosto>';
      tipoCostos += '<costo>' + precio + '</costo>';
      tipoCostos += '<idPartida>' + this.idPartida + '</idPartida>';
      tipoCostos += '<idTipoCobro>' + tipocosto.idTipoCobro + '</idTipoCobro>';
      tipoCostos += '</tipocosto>';
    });
    tipoCostos += '</tiposCostos>';

    this.spinner = true;
    this.siscoV3Service.putService('partida/PutActualizarPartidaTipoCobro',
      { idClase: this.idClase, costos: tipoCostos, idTipoObjeto: this.idTipoObjeto }).subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha actualizado correctamente el tipo de objeto.', 'Ok', {
            duration: 2000
          });
          this.router.navigateByUrl('/sel-partida/' + this.idTipoObjeto);
        }
      }, (error: any) => {
        this.Excepciones(error, 2);
        this.spinner = false;
      });
  }


  // #region ResultUploadFile
  /**
   * @description Carga de archivo
   * @param $event Detalle del archivo cargado
   * @param index Posición de la propiedad
   * @returns Resultado de la carga del archivo
   * @author Edgar Mendoza Gómez
   */

  ResultUploadFile($event, index: number) {
    if ($event.recordsets.length > 0) {
      this.tipoObjetoPropiedades[index].valorPropiedad = [$event.recordsets[0].idDocumento];
      this.ValidForm();
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok', {
        duration: 2000
      });
    }
  }

  // #endregion

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

      dialogRef.afterClosed().subscribe((result: any) => {
      });

    } catch (err) {
    }
  }

  CambioInputCosto($event, index) {
    this.tiposCobro[index].costo = $event.value;
  }

  GetTipoSolicitud() {
    this.siscoV3Service.getService(`solicitud/getSolicitudTipoSolicitud?idClase=${this.idClase}`).subscribe(
      (res: any) => {
        if (res.error) {
          this.Excepciones(res.error, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.tipo = res.recordsets[0];
          // this.tipoSolicitud = new ArrayStore({
          //   data: this.tipo,
          //   key: 'idTipoSolicitud'
          // });
          this.selectFillData(this.tipo);
        }
      }, (error: any) => {
        this.Excepciones(error, 2);
      }
    );
  }

  closeSelect($event) {
    this.idTipoSolicitud = $event.value
  }


  /**
  * @description Metodo de Debex para que el select se vea como una tabla
  * @param proveedores Todos los proveedores
  * @author Gerardo Zamudio González
  */
  selectFillData(tipoSolicitud) {
    this.gridDataSource = new CustomStore({
      loadMode: 'raw',
      key: 'idTipoSolicitud',
      load() {
        const json = tipoSolicitud;
        return json;
      }
    });
  }

  get gridBoxValue(): string[] {
    return this.gridBoxValue2;
  }

  set gridBoxValue(value: string[]) {
    this.gridBoxValue2 = value || [];
  }

  /**
   * @description Asigna  el valor seleccionado al proveedorContratoForm
   * @param $event fila seleccionada
   * @author Gerardo Zamudio González
   */
  onSelectionChanged($event) {
    this.idTipoSolicitud = $event.selectedRowsData
  }

}
