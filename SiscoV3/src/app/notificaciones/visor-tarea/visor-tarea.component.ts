import { Component, OnInit, OnDestroy } from '@angular/core';
import { IViewertipo } from 'src/app/interfaces';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SiscoV3Service } from '../../services/siscov3.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Negocio } from 'src/app/models/negocio.model';
import { BaseService } from 'src/app/services/base.service';

@Component({
  selector: 'app-visor-tarea',
  templateUrl: './visor-tarea.component.html',
  styleUrls: ['./visor-tarea.component.sass']
})
export class VisorTareaComponent implements OnInit, OnDestroy {
  IViewer: any;
  documento: any = {};
  subsParams: Subscription;
  documentos: [any];
  idTarea: number;
  total: number;
  plantillaProcesada: string;
  urlImagen: string;
  idClase: string;
  public breadcrumb: any;
  constructor(private activatedRoute: ActivatedRoute, private siscoService: SiscoV3Service, private httpClient: HttpClient, private baseService: BaseService) {
    this.urlImagen = `../../assets/images/iconos-tarea/solicitante.png`;
  }

  ngOnInit() {
    const stateContrato = this.baseService.getContractData();
    this.idClase = stateContrato.claseActual;
    this.iniciaVisor();
    this.subsParams = this.activatedRoute.params.subscribe(parametros => {
      try {
        this.idTarea = parametros.idTarea;
      } catch (err) {
        console.log(err);
      }
    });
    this.cargarDatos(this.idTarea);
    this.ConstruyeBread(this.urlImagen);
  }

  private ConstruyeBread(pathUser) {
    const rutaBreadcrumb = {
      logo: [{ idClase: 'Automovil', path: pathUser },
      { idClase: 'Papeleria', path: pathUser }],
      route: [{ label: 'home', url: `/user-profile/${0}` }, { label: [{ idClase: 'Automovil', label: 'Tarea' }, { idClase: 'Papeleria', label: 'Tarea' }], url: `/visor-tarea/${this.idTarea}` }]
    };
    this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(rutaBreadcrumb, this.idClase);
  }

  private cargarDatos(idTarea: number) {
    this.siscoService.getService(`tarea/InfoTarea?idTarea=${idTarea}`).toPromise().then((res:any) => {
      if(res.err) {
        console.log(res.err);
      } else if(res.excepcion){
        console.log(res.excepcion)
      } else {
        this.plantillaProcesada = res.recordsets[0][0].plantillaProcesada;
      }
    }, (error:any) => {
      console.log(error);
    })
    this.siscoService.getService(`tarea/DocumentosTarea?idTarea=${idTarea}`).toPromise().then((res: any) => {
      if (res.err) {
        console.log(res.err);
      } else if (res.excepcion) {
        console.log(res.excepcion);
      } else {
        let docs = res.recordsets[0].map(d => {
          return d.idDocumento
        })
        console.log(docs);
        let ruta = `${environment.fileServerUrl}documento/GetDocumentosById`
        this.httpClient.post(ruta,{documentos: docs}).toPromise().then((res:any) => {
          this.documentos = res.recordsets ? res.recordsets.map(d => {
            let exten = d.path.split('.');
            return {
              extencion: exten.slice(-1)[0],
              activo: d.activo,
              descripcion: d.descripcion,
              fechaCreacion: d.fechaCreacion,
              idAplicacion: d.idAplicacion,
              idDocumento: d.idDocumento,
              idModulo: d.idModulo,
              idUsuario: d.idUsuario,
              nombre: d.nombre,
              nombreOriginal: d.nombreOriginal,
              path: d.path,
              size: d.size,
              tipo: d.tipo,
              titulo: d.titulo,
              ultimaActualizacion: d.ultimaActualizacion
            }
          }) : [];
        }, (reason:any) => {
          console.log(reason);
        })
      }
    }, (err: any) => {
      console.log(err);
    })
  }

  private iniciaVisor() {
    this.IViewer = [{ tipo: IViewertipo.gridimagenes }];
  }

  ngOnDestroy() {
    this.subsParams.unsubscribe();
  }
}
