import { Component, OnInit } from '@angular/core';
import { IBreadCrumb, IViewertipo, IViewersize, IViewer } from 'src/app/interfaces';
import { IOrdenesComisiones } from 'src/app/Interfaces/iordenes-comisiones';
import { IAcordion } from 'src/app/Interfaces/iacordion';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { Negocio } from '../../models/negocio.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-comisiones-externos',
  templateUrl: './comisiones-externos.component.html',
  styleUrls: ['./comisiones-externos.component.scss']
})
export class ComisionesExternosComponent implements OnInit {
  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-comisiones-externos';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  public loading: boolean;
  spinner = false;
  comisiones: any[] = [];
  comisionesPosibles: any[] = [];
  contenido: any[] = [];
  totales: any[] = [];
  idUsuarioComision: number;
  urlImagen: string;
  usuarioComision: any[] = [];
  
  public breadcrumb: IBreadCrumb[];
  public ordenesDelMes: IOrdenesComisiones[];
  public acordiones: IAcordion[];
  IViewer: IViewer[];
  
  constructor(private store: Store<AppState>, 
    private _siscoV3Service: SiscoV3Service,
    public dialog: MatDialog, 
    private http: HttpClient,
    private activatedRoute: ActivatedRoute) {
    this.spinner = true;
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);

    this.activatedRoute.params.subscribe(parametros => {
      this.idUsuarioComision = parametros.idUsuarioComision;
    });
  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateNegocio) =>{
      this.getStateAutenticacion.subscribe((stateAutenticacion) =>{
        this.idClase = stateNegocio.claseActual;
        this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, this.idClase);

        /**
         * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
         * footer por defecto, de lo contrario no se abre el footer.
         */
        if (stateNegocio.contratoActual && this.modulo.contratoObligatorio) {
            this.ConfigurarFooter(true);
        } else {
            this.ConfigurarFooter(false);
        }

        if (this.modulo.breadcrumb) {
            this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase, [ { idUsuarioComision: this.idUsuarioComision } ]);
        }

        this.obtenerComision();
        this.obtenerComisionesPosibles();
        this.obtenerUsuarioComision();

      })
    })
  }

  /**
   * @description Configurar el modal de footer.
   * @param abrir Mandar la configuración del footer, define si el footer se abre o no por defecto.
   * @author Andres Farias
   */
  ConfigurarFooter(abrir: boolean) {
    this.store.dispatch(new CambiaConfiguracionFooter(
      new FooterConfiguracion(
        ContratoMantenimientoEstatus.todos, abrir, this.modulo.multicontrato, this.modulo.contratoObligatorio)));
  }


  obtenerComision(){
    this.loading = true;
    this._siscoV3Service.getService('comision/GetComisionByUser?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
            this.comisiones = res.recordsets[0].comisiones;
            this.totales = res.recordsets[0];
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    );

    this._siscoV3Service.getService('comision/GetUsuarioById?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          if(res.recordsets[0].length > 0){
            this.usuarioComision = res.recordsets[0][0];
            const data = {
              documentos: res.recordsets[0][0].img
            }
            this.http.post(`${environment.fileServerUrl}documento/GetDocumentosById`, data).subscribe((res: any)=>{
                  if (res.err) {
                    this.Excepciones(res.err, 4);
                  } else if (res.excepcion) {
                    this.Excepciones(res.excepcion, 3);
                  } else {
                    this.urlImagen = res.recordsets[0].path;
                  }
                });
          }
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    );
  }

  obtenerUsuarioComision(){
    this._siscoV3Service.getService('comision/GetUsuarioById?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          if(res.recordsets[0].length > 0){
            this.usuarioComision = res.recordsets[0][0];
            
            this.IViewer = [
              {
                idDocumento: res.recordsets[0][0].avatar,
                tipo: IViewertipo.avatar,
                descarga: false,
                size: IViewersize.xs
              }
            ];
            const data = {
              documentos: res.recordsets[0][0].img
            }
            this.http.post(`${environment.fileServerUrl}documento/GetDocumentosById`, data).subscribe((res: any)=>{
                  if (res.err) {
                    this.Excepciones(res.err, 4);
                  } else if (res.excepcion) {
                    this.Excepciones(res.excepcion, 3);
                  } else {
                    this.urlImagen = res.recordsets[0].path;
                  }
                });
          }
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    );
  }

  obtenerComisionesPosibles(){
    this.loading = true;
    this._siscoV3Service.getService('comision/GetComisionesPosiblesByUser?idUsuarioComision=' + this.idUsuarioComision).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
            this.comisionesPosibles = res.recordsets[0];
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    ) 
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
          moduloExcepcion: 'comisiones-externos.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

  

  ToggleAcordion(acordion: IAcordion, index: number) {
      const valueAct = this.comisiones[index].open;
      this.comisiones.map((ACORDION: IAcordion) => {
          ACORDION.open = false;
      });
      acordion.open = !valueAct;
      this.contenido = this.comisiones.find( (X: any) => X.titulo == acordion.titulo )
  }

}
