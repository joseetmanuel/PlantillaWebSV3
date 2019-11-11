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

@Component({
  selector: 'app-upd-partida-propia',
  templateUrl: './upd-partida-propia.component.html',
  providers: [SiscoV3Service]
})
export class UpdPartidaPropiaComponent extends FormularioDinamico implements OnInit {
  claveModulo = 'app-upd-partida-propia';
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
  rfc: string;

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

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [{idTipoObjeto: this.idTipoObjeto},
                                                                {idPartida: this.idPartida}]);
        }

        this.numeroContrato = this.contratoActual.numeroContrato;
        this.idCliente = this.contratoActual.idCliente;
        this.rfc = this.contratoActual.rfcEmpresa;

      });

      this.store.dispatch(new CambiaConfiguracionFooter(new FooterConfiguracion(ContratoMantenimientoEstatus.sinMantenimiento,
        this.modulo.contratoObligatorio, this.modulo.multicontrato, false, true)));

      this.GetPartidas();
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
            this.siscoV3Service.getService('partida/GetPartidaPropiaValor?idPartida=' + this.idPartida + '&&idClase=' + this.idClase
            + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato + '&&rfc=' + this.rfc )
            .subscribe((res2: any) => {
              if (res.err2) {
                this.Excepciones(res2.err, 4);
              } else if (res2.excepcion) {
                this.Excepciones(res2.excepcion, 3);
              } else {
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
              }
            });
          }
        }, (error: any) => {
          this.spinner = false;
        }
      );
  }

  // #endregion

  // #region ActualizarPartida
  /**
   * @description Actualiza partida por su id.
   * @returns Devuelve éxito o error al modificar
   * @author Edgar Mendoza Gómez
   */

  ActualizarPartida() {

    this.ValuesFormUpd(this.tipoObjetoPropiedades, this.idPartida);

    if (this.formDinamico.length > 0) {
      this.spinner = true;

      this.siscoV3Service.putService('partida/PutActualizaPartidaPropia', {formDinamico: this.formDinamico, idClase: this.idClase,
        idCliente: this.idCliente, numeroContrato: this.numeroContrato, rfc: this.rfc, idTipoObjeto: this.idTipoObjeto})
        .subscribe((res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se ha actualizado correctamente la partida propia.', 'Ok', {
            duration: 2000
          });
          this.router.navigateByUrl('/sel-partida-propia/' + this.idTipoObjeto);
        }
      },
        (error: any) => {
          this.Excepciones(error, 2);
          this.spinner = false;
        });
    } else {
      this.snackBar.open('Los campos con * son obligatorios.', 'Ok', {
        duration: 2000
      });
    }
  }

  // #endregion


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

}
