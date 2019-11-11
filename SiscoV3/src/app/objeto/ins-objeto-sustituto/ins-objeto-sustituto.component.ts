import { Component, OnInit } from '@angular/core';
import { IObjeto } from 'src/app/interfaces';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Negocio } from '../../models/negocio.model';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ContratoMantenimientoEstatus, FooterConfiguracion } from 'src/app/models/footerConfiguracion.model';
import { CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { AppState, selectAuthState, selectContratoState } from 'src/app/store/app.states';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import {
  IColumns,
  IProcess,
  IGridOptions,
  IExportExcel,
  ISearchPanel,
  IScroll,
  Toolbar,
  IColumnHiding,
  ICheckbox,
  IEditing,
  IColumnchooser,
  TiposdeDato
} from '../../interfaces';

@Component({
  selector: 'app-ins-objeto-sustituto',
  templateUrl: './ins-objeto-sustituto.component.html',
  styleUrls: ['./ins-objeto-sustituto.component.scss'],
  providers: [SiscoV3Service]
})
export class InsObjetoSustitutoComponent implements OnInit {
  IObjeto: IObjeto[];
  spinner = false;
  public indexActive = 0;
  public btnNextEnable: boolean;
  claveModulo = 'app-ins-objeto-sustituto';
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;
  numeroContrato: string;
  idCliente: number;
  rfcEmpresa: string;
  idClase: string;
  modulo: any = {};
  breadcrumb: any;
  tipoObjetos: any;
  tipoObjetosColumns: any;
  gridOptions: IGridOptions;
  columnHiding: IColumnHiding;
  Checkbox: ICheckbox;
  Editing: IEditing;
  Columnchooser: IColumnchooser;
  columns: IColumns[];
  exportExcel: IExportExcel;
  searchPanel: ISearchPanel;
  scroll: IScroll;
  evento: string;
  toolbar: Toolbar[];
  idObjeto: number;
  idTipoObjeto: number;
  motivos: any;
  objetosSelected: any;
  dateCita = moment();
  numeroOrden: string;

  sustitutoForm = new FormGroup({
    motivoSustituto: new FormControl('', [Validators.required]),
    comentarios: new FormControl('', [Validators.required]),
    fecha: new FormControl(this.dateCita, [Validators.required]),
    hora: new FormControl(this.dateCita, [Validators.required]),
  });

  public process: IProcess[] = [{
    active: true,
    finish: false,
    enabled: true
  }, {
    active: false,
    finish: false,
    enabled: false
  }, {
    active: false,
    finish: false,
    enabled: false
  }];

  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<AppState>) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

    this.activatedRoute.params.subscribe(parametros => {
      this.idObjeto = parametros.idObjeto;
      this.idTipoObjeto = parametros.idTipoObjeto;
      this.rfcEmpresa = parametros.rfcEmpresa;
      this.idCliente = parametros.idCliente;
      this.numeroContrato = parametros.numeroContrato;
      this.numeroOrden = parametros.numeroOrden;
    });


  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) => {
      this.getStateAutenticacion.subscribe((stateAutenticacion) => {
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);
        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        this.store.dispatch(new CambiaConfiguracionFooter(new FooterConfiguracion(ContratoMantenimientoEstatus.conMantemiento,
          this.modulo.contratoObligatorio, this.modulo.multicontrato, false, true)));

        if (this.modulo.breadcrumb) {
          this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [
            { idObjeto: this.idObjeto }, { idTipoObjeto: this.idTipoObjeto }, { rfcEmpresa: this.rfcEmpresa },
            { idCliente: this.idCliente }, { numeroContrato: this.numeroContrato }, { numeroOrden: this.numeroOrden }]);
        }

        this.IObjeto = [{
          idClase: this.idClase, idObjeto: this.idObjeto, idCliente: this.idCliente, numeroContrato: this.numeroContrato,
          idTipoObjeto: this.idTipoObjeto, rfcEmpresa: this.rfcEmpresa
        }];

        this.Grid();
        this.LoadData();
        this.Motivos();
      });
    });

  }

  LoadData() {
    try {
      this.spinner = true;

      this.siscoV3Service.getService('objeto/getObjetoId?idClase=' + this.idClase + '&&numeroContrato='
        + this.numeroContrato + '&&idCliente=' + this.idCliente)
        .subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              res.recordsets[0].forEach(object => {
                for (const key in object) {
                  if (object.hasOwnProperty(key)) {
                    const element = object[key];
                    if (element === null) {
                      object[key] = '';
                    }
                  }
                }
              });

              this.tipoObjetos = res.recordsets[0].filter(f => f.Sustituto !== '' && f.idObjeto !== this.idObjeto && f.sustitutoAsignado === 0);
            } else {
              this.tipoObjetos = [];
            }
            this.siscoV3Service.getService('objeto/GetObjetosColumns?idClase=' + this.idClase
              + '&numeroContrato=' + this.numeroContrato + '&idCliente=' + this.idCliente)
              .subscribe((res2: any) => {
                this.spinner = false;
                this.tipoObjetosColumns = res2.recordsets[0];
                if (this.tipoObjetosColumns.length > 0) {
                  this.columns = [];
                  for (const data in this.tipoObjetosColumns[0]) {
                    /* En grid se cambia nombre de propiedad pero en sp se mantiene el campo idPartida para mantener integridad*/
                    if (data !== 'Foto') {
                      if (data !== 'idTipoObjeto') {
                        if (data === 'idObjeto') {
                          this.columns.push({ caption: 'Id', dataField: data });
                        } else if (this.tipoObjetosColumns[0][data] === 'Bit') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, dataType: TiposdeDato.boolean
                          });
                        } else if (this.tipoObjetosColumns[0][data] === 'Datetime' || this.tipoObjetosColumns[0][data] === 'Date') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, dataType: TiposdeDato.datetime
                          });
                        } else if (this.tipoObjetosColumns[0][data] === 'Color') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, cellTemplate: 'color'
                          });
                        } else if (this.tipoObjetosColumns[0][data] === 'File' || this.tipoObjetosColumns[0][data] === 'Image') {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data, cellTemplate: 'foto'
                          });
                        } else {
                          this.columns.push({
                            caption: data.charAt(0).toUpperCase() + data.slice(1),
                            dataField: data
                          });
                        }
                      }
                    }
                  }
                }
              });
          }
        }, (error: any) => {
          this.spinner = false;
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }
  }

  Grid() {
    this.exportExcel = { enabled: true, fileName: 'datos' };
    this.columnHiding = { hide: true };
    this.Checkbox = { checkboxmode: 'single' };
    this.Editing = { allowupdate: false };
    this.Columnchooser = { columnchooser: true };
    this.scroll = { mode: 'standard' };
    /* Parametros de Search */
    this.searchPanel = {
      visible: true,
      width: 200,
      placeholder: 'Buscar...',
      filterRow: true
    };
    /* Parametros de Toolbar */
    this.toolbar = [];

  }

  Motivos() {
    try {
      this.spinner = true;

      this.siscoV3Service.getService('objeto/getMotivo')
        .subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            this.motivos = res.recordsets[0];
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
   * @description  Funcíon de boton siguiente
   * @returns Acción de botón siguiente
   * @author Edgar Mendoza Gómez
   */
  next(): void {
    this.btnNextEnable = false;
    if (this.indexActive < this.process.length) {

      this.process[this.indexActive].active = this.indexActive < (this.process.length - 1) ? false : true;
      this.process[this.indexActive].finish = true;
      this.indexActive++;
      if (this.indexActive < (this.process.length)) {
        this.process[this.indexActive].active = true;
        this.process[this.indexActive].enabled = true;
      }

    }
  }

  /**
   * @description  Funcíon de boton atras
   * @returns Acción de botón atras
   * @author Edgar Mendoza Gómez
   */

  previous(): void {
    this.btnNextEnable = false;
    this.indexActive = this.indexActive === this.process.length ? (this.process.length - 1) : this.indexActive;
    if (this.indexActive > 0) {
      this.process[this.indexActive].active = false;
      this.indexActive--;
      this.process[this.indexActive].active = true;

    }

    if (this.indexActive === 0) {
      this.valida(1);
    }
  }

  datosMessage(e) {
    this.objetosSelected = e.data;
    this.valida(1);
  }

  /**
  * @description  Valida la activación del boton next
  * @returns Activa botón
  * @author Edgar Mendoza Gómez
  * @param grid En que grid se encuentra
  */

  valida(step) {
    if (step === 1) {
      if (this.objetosSelected) {
        if (this.objetosSelected.length > 0) {
          this.btnNextEnable = true;
        } else {
          this.btnNextEnable = false;
        }
      }
    }
  }

  insSustituto() {
    const fechaCita = new Date(this.sustitutoForm.controls.fecha.value);
    const horaCita = new Date(this.sustitutoForm.controls.hora.value);

    let xml = `<objetosSustituto>`;
    this.objetosSelected.forEach((e, i, ar) => {
      xml += `<objetoSustituto><idObjetoSustituto>${e.idObjeto}</idObjetoSustituto><idTipoObjetoSustituto>${e.idTipoObjeto[0]}</idTipoObjetoSustituto></objetoSustituto>`

      if (i + 1 === ar.length) {
        xml += `</objetosSustituto>`;
      }

    });

    const data = {
      motivo: this.sustitutoForm.controls.motivoSustituto.value,
      noOrden: this.numeroOrden,
      comentarios: this.sustitutoForm.controls.comentarios.value,
      fecha: new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate(), horaCita.getHours(), horaCita.getMinutes()),
      idClase: this.idClase,
      xmlObjetoSustituto: xml,
      idObjeto: this.idObjeto,
      idTipoObjeto: this.idTipoObjeto
    }

    this.siscoV3Service.postService('objeto/PostInsSustituto', data).subscribe((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excecion) {
        this.Excepciones(res.err, 3);
      } else {
        this.snackBar.open('Se han agregado los sustitutos correctamente.', 'Ok', {
          duration: 2000
        });
        this.router.navigateByUrl('/sel-solicitud');

      }
    }, (error: any) => {
      this.spinner = false;
      this.Excepciones(error, 2);
    });

  }


  active(index: number) {
    if ((this.process[index].enabled)) {
      if (index < this.process.length) {
        this.indexActive = index;
        this.process.forEach((element, i) => {
          this.process[i].active = false;
        });
        this.process[this.indexActive].active = true;

      }
    }
  }


  /**
   * En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
   * @param pila stack
   * @param tipoExcepcion numero de la escecpción lanzada
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
          moduloExcepcion: 'objeto.component',
          mensajeExcepcion: '',
          stack: pila
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
      console.error(error);
    }
  }


}
