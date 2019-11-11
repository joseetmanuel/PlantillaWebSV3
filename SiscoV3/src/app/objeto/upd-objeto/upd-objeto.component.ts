import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IFileUpload } from 'src/app/interfaces';
import { DxTreeViewComponent } from 'devextreme-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { AppState, selectContratoState } from '../../store/app.states';
import { Negocio } from 'src/app/models/negocio.model';
import { FormularioDinamico } from 'src/app/utilerias/clases/formularioDinamico.class';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { InsObjetoComponent } from '../ins-objeto/ins-objeto.component';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { IObjeto } from 'src/app/interfaces';
import { equip_upd_objeto_url } from '../../contratos/equipamiento/equipamiento.component';
import { BaseService } from '../../services/base.service';


@Component({
  selector: 'app-upd-objeto',
  templateUrl: './upd-objeto.component.html',
  styleUrls: ['../objeto.component.scss'],
  providers: [SiscoV3Service]
})
export class UpdObjetoComponent extends FormularioDinamico implements OnInit, OnDestroy {
  IUploadFile: IFileUpload;

  getStateNegocio: Observable<any>;
  claveModulo = 'app-upd-objeto';
  idUsuario: number;
  idClase: string;
  idCliente: number;
  rfcEmpresa: string;
  /*variables para el contrato activo*/
  contratoActual: any;
  numeroContrato: string;

  @ViewChild(DxTreeViewComponent) treeView;
  @ViewChild(InsObjetoComponent) insertaObjeto: InsObjetoComponent;
  idObjeto: number;
  idTipoObjeto: number;
  IObjeto: IObjeto[];
  dataGenerales = [];
  dataClase = [];
  dataContrato = [];
  datosAllProp: any;
  documentos = [];
  tipoObjetoGroup: any;
  spinner = false;
  titleClase: string;
  logo: string;
  breadcrumb: any;
  breadcrumbIns: any;
  ruta: string;
  modulo: any = {};
  moduloIns: any = {};
  dateL = Date();
  equipUrl = equip_upd_objeto_url;
  equipDisabled = false;
  negocioSubscribe: Subscription;

  constructor(
    public dialog: MatDialog, private snackBar: MatSnackBar,
    private router: Router, private siscoV3Service: SiscoV3Service,
    private activatedRoute: ActivatedRoute,
    private baseService: BaseService,
    private store: Store<AppState>
  ) {
    super();
    this.activatedRoute.params.subscribe(parametros => {
      this.idObjeto = parametros.idObjeto;
      this.idTipoObjeto = parametros.idTipoObjeto;
    });

    this.getStateNegocio = this.store.select(selectContratoState);

  }

  ngOnInit() {
    this.spinner = true;
    const usuario = this.baseService.getUserData();
    this.idUsuario = usuario.user.id;
    this.negocioSubscribe = this.getStateNegocio.subscribe((stateN) => {
      if (stateN && stateN.claseActual) {
        this.contratoActual = stateN.contratoActual;
        this.idClase = stateN.claseActual;
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

        if (this.contratoActual) {
          this.numeroContrato = this.contratoActual.numeroContrato;
          this.idCliente = this.contratoActual.idCliente;
          this.rfcEmpresa = this.contratoActual.rfcEmpresa;
        } else {
          this.numeroContrato = '';
          this.idCliente = 0;
        }
        this.allPropiedades();
        this.modulo = Negocio.GetModulo(this.claveModulo, usuario.permissions.modules, this.idClase);
        if (this.modulo.breadcrumb && this.idObjeto > 0) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase,
            [{ idObjeto: this.idObjeto }, { idTipoObjeto: this.idTipoObjeto }]);

        } else if (this.idObjeto == 0) {
          this.moduloIns = Negocio.GetModulo(this.insertaObjeto.claveModuloIns,
            usuario.permissions.modules, this.idClase);
          if (this.moduloIns.breadcrumb) {
            this.breadcrumbIns = Negocio.GetConfiguracionBreadCrumb(this.moduloIns.breadcrumb, this.idClase,
              [{ idObjeto: this.idObjeto }, { idTipoObjeto: this.idTipoObjeto }]);
          }
        }        

        if (this.modulo.camposClase) {
          this.modulo.camposClase.forEach(campos => {
            if (campos.nombre === 'LogoCard1') {
              this.titleClase = campos.label;
              this.logo = campos.path;
            }
          });
        }
      }
    });


    /** defiinciones de lso archivos */
    const ext = [];
    ext.push('.jpg', '.jpeg', '.png', '.pdf');
    this.IUploadFile = {
      path: this.idClase, idUsuario: this.idUsuario, idAplicacionSeguridad: 1, idModuloSeguridad: 1, multiple: true, soloProcesar: false
      , extension: ext
    };
  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer,
   * en caso de que ya exista contratoActual no se abre el modal por defecto
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir
        , this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }

  /**
   * funcion para regresar todas las propiedades
   */
  allPropiedades() {
    this.siscoV3Service
      .getService('objeto/getObjetoAllProp?idClase=' + this.idClase
        + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato)
      .subscribe(
        (res: any) => {
          this.spinner = false;
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.Excepciones(res.excepcion, 3);
          } else {
            this.GetPropiedades(res.recordsets[0]);
            this.siscoV3Service.getService(
              'objeto/getObjetoPropDin?idObjeto=' + this.idObjeto + '&idClase=' + this.idClase
              + '&idCliente=' + this.idCliente + '&numeroContrato=' + this.numeroContrato
            ).subscribe((res2: any) => {
              this.SetValuesUpd(res2.recordsets[0]);
            });



            this.tipoObjetoPropiedades.map(d => {

              if (d.idPropiedad === 1) {
                this.dataGenerales.push(d);
              } else if (d.idPropiedad === 2) {
                this.dataClase.push(d);
              } else if (d.idPropiedad === 3) {
                this.dataContrato.push(d);
              }
            });
          }
        },
        (error: any) => {
          this.spinner = false;
        }
      );
  }
  /*
   Modifica las propiedades generales de el objeto
   */
  editPropiedades() {
    this.spinner = true;
    if (this.setValuesForm.length > 0) {

      this.ValuesFormUpd(this.tipoObjetoPropiedades, this.idObjeto, this.setValuesForm);
    } else {
      this.ValuesFormIns();
    }

    this.formDinamico.push({
      idObjeto: this.idObjeto,
      idTipoObjeto: this.idTipoObjeto,
      idClase: this.idClase,
      idUsuario: this.idUsuario,
      rfcEmpresa: this.rfcEmpresa,
      idCliente: this.idCliente,
      numeroContrato: this.numeroContrato
    });
    this.insertaObjeto.AgregarObjeto(this.formDinamico);

  }

  // #region ResultUploadFile
  /*
  Nombre:         ResultUploadFile
  Autor:          Edgar Mendoza Gómez
  Fecha:          25/03/2019
  Descripción:    Regresa respuesta al subir un documento
  Parametros:     $event: variables de el evento  lanzado, index: numbero identificador
  Output:
  */

  ResultUploadFile($event: any, index: number) {
    if ($event.recordsets.length > 0) {
      this.tipoObjetoPropiedades[index].valorPropiedad = $event.recordsets[0].idDocumento;
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Error, intente subir de nuevo.', 'Ok');
    }
  }

  /*
  * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle,
  * se abrira el dialog de excepciones
  */
  Excepciones(pila, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'upd-objeto.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.negocioSubscribe.unsubscribe();
  }
}
