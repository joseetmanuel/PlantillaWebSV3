import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SiscoV3Service } from '../../services/siscov3.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment.prod';
import { Negocio } from 'src/app/models/negocio.model';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { ReseteaFooter, CambiaConfiguracionFooter } from 'src/app/store/actions/permisos.actions';
import { DxDataGridComponent } from 'devextreme-angular';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-sel-reporte-integra-autoexpress',
  templateUrl: './sel-reporte-integra-autoexpress.component.html',
  styleUrls: ['./sel-reporte-integra-autoexpress.component.scss'],
  providers: [SiscoV3Service]
})
export class SelReporteIntegraAutoexpressComponent implements OnInit {

  // VARIABLES PARA SEGURIDAD
  claveModulo = 'app-sel-reporte-integra-autoexpress';
  idClase = '';
  modulo: any = {};
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  public loading: boolean;
  breadcrumb: any[];
  reporte: string;
  htmlData: any;

  constructor(private router: Router, public dialog: MatDialog,
    private snackBar: MatSnackBar, private _siscoV3Service: SiscoV3Service,
    private httpClient: HttpClient, private sanitizer: DomSanitizer,
    private store: Store<AppState>) {

      this.getStateAutenticacion = this.store.select(selectAuthState);
      this.getStateNegocio = this.store.select(selectContratoState);
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
          // this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(this.modulo.breadcrumb, this.idClase);
        }

        this.obtenerReporteIndicadores()
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

  obtenerReporteIndicadores() {
    this.loading = true;
    this.httpClient.get( environment.reportUrl + 'api/reporteIndicadores/obtenerReporteOperaciones?tipo=1' ).subscribe(
      (res: any) => {
        this.loading = false
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        }else{
          this.reporte = res.recordsets[0][0];
          this.htmlData = this.sanitizer.bypassSecurityTrustHtml(this.reporte)

          setTimeout(() => {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(res.recordsets[0][0], "text/xml");
            xmlDoc.getElementsByTagName('script')
            for( var i = 0; i < xmlDoc.getElementsByTagName('script').length; i++ ){
                this.agregarScripts( xmlDoc.getElementsByTagName('script').item(i) )
            }
          }, 1000);
        }
      }, (error: any) => {
        this.loading = false
        this.Excepciones(error, 2);
      }
    )

  }

  agregarScripts(script){
    if(script.childNodes.length > 0){
      script.childNodes.forEach(function(element){
        var head = document.getElementsByTagName('head')[0]
        head.childNodes.forEach(function(elemento){
          if( elemento.nodeName == 'SCRIPT' && elemento.textContent.indexOf('google.charts') != -1 ){
            elemento.parentNode.removeChild( elemento )
          }
        })
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = element.nodeValue
        head.appendChild(s)        
      })
    }
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
          moduloExcepcion: 'sel-reporte-integra-autoexpress.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

  imprimirExcel(){
    this.loading = true;
    var data = { }

    var jsonData = {
      "template":{
        "name" : "ReporteOperaciones"
      }, 
      data: data,
      nombre: "ReporteOperaciones"
    }


    this._siscoV3Service.postService("reporte/PostNewReport", {"jsonData": jsonData} ).subscribe(
      (res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {      
          this.snackBar.open('El archivo ha sido generado correctamente.', 'Ok', {
            duration: 3000
          });
          
          this.httpClient.get( environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + res.recordsets[0].idDocumento ).subscribe((data: any) =>{
            this.loading = false;
            FileSaver.saveAs(data.recordsets[0].path, jsonData.nombre)
          }, (error: any) =>{
            this.loading = false;
            this.Excepciones(error, 2);
          })

          
        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    )    
  }

  imprimirPDF(){
    this.loading = true;
    var data = { }

    var jsonData = {
      "template":{
        "name" : "Reporte de Operaciones v2"
      }, 
      data: data,
      nombre: "ReporteOperaciones"
    }


    this._siscoV3Service.postService("reporte/PostNewReport", {"jsonData": jsonData} ).subscribe(
      (res: any) => {
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {      
          this.snackBar.open('El archivo ha sido generado correctamente.', 'Ok', {
            duration: 3000
          });
          
          this.httpClient.get( environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + res.recordsets[0].idDocumento ).subscribe((data: any) =>{
            this.loading = false;
            FileSaver.saveAs(data.recordsets[0].path, jsonData.nombre)
          }, (error: any) =>{
            this.loading = false;
            this.Excepciones(error, 2);
          })

          
        }
      }, (error: any) => {
        this.loading = false;
        this.Excepciones(error, 2);
      }
    )
  }
}
