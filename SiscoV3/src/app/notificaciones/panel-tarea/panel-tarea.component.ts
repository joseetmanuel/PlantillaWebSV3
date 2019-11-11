import { Component, OnInit } from '@angular/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as _ from 'lodash-es';
import { SessionInitializer } from '../../services/session-initializer';
import { BaseService } from 'src/app/services/base.service';

@Component({
  selector: 'app-panel-tarea',
  templateUrl: './panel-tarea.component.html',
  styleUrls: ['./panel-tarea.component.sass']
})
export class PanelTareaComponent implements OnInit {
  toggleMobileSidebar: any;
  tareas = new BehaviorSubject([]);

  batch = 2;
  lastKey = 0;
  lastPage = 1;
  finished = false;
  idEstatusTarea: number = null;
  idModulo: number = null;
  totalTareas: number = 0;
  modulosSeg: any;
  public categorias: any;
  public solicitantes: any;
  public statusTarea: any;
  constructor(private siscoV3Service: SiscoV3Service
    , private sessionInitializer: SessionInitializer
    , private baseService: BaseService) { }

  ngOnInit() {
    if (this.sessionInitializer.state) {
      this.modulosSeg = this.baseService.getSecurityData();
      this.getCatalogos();
      this.getTareas();
    }
  }

  public buscarCategoria(categoria: any): void {
    this.idEstatusTarea = null
    this.lastKey = 0;
    this.lastPage = 1;
    this.finished = false;
    this.idModulo = categoria.id;
    this.getTareas();
  }

  public buscarSolicitante(solicitante: any): void {
    console.log(solicitante);
  }

  public buscarStatus(status: any): void {
    this.idEstatusTarea = status.id
    this.lastKey = 0;
    this.lastPage = 1;
    this.finished = false;
    this.idModulo = null;
    this.getTareas();
  }

  onScrollTarea() {
    this.getTareas();
  }

  private getCatalogos(): void {
    this.siscoV3Service.getService('tarea/UsuariosTarea').toPromise().then((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else {
        this.solicitantes = res.recordsets[0].map((sol: any) => {
          return {
            nombre: sol.nombreUsuario,
            id: sol.userId,
            urlAvatar: sol.urlAvatar
          };
        });
      }
    }, (error: any) => {
      this.Excepciones(error, 1);
    });

    this.siscoV3Service.getService('tarea/EstatusTarea').toPromise().then((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else {
        this.statusTarea = res.recordsets[0].map((et: any) => {
          return {
            nombre: et.estatusTarea,
            id: et.id,
            total: et.total,
            colorTexto: et.colorTexto,
            colorStatus: et.colorEstatus,
            rutaImagen: et.rutaImagen,
            mostrarPildora: et.total > 0 ? true : false
          };
        });
      }
    }, (error: any) => {
      this.Excepciones(error, 1);
    });
    this.categorias = this.modulosSeg.modulos.map(m => {
      return { id: m.id, color: m.caption.color, titulo: m.name }
    });
    this.siscoV3Service.getService('tarea/Modulos').toPromise().then((res: any) => {
      if (res.error) {
        this.Excepciones(res.err, 4);
      } else {
        this.categorias.forEach(cat => {
          let tc = res.recordsets[0].find(m => m.idModuloPadre === cat.id);
          cat.tareas = tc && tc.totalTareas ? tc.totalTareas : 0;
        });
        this.totalTareas = this.categorias.map(c => c.tareas).reduce((ant, act) => {
          return ant + act;
        })
        this.categorias = this.categorias.filter(m => m.tareas > 0);
      }
    }, (error: any) => {
      this.Excepciones(error, 1);
    });
  }

  private getTareas() {
    if (this.finished) {
      return;
    }
    const modulosPadre = this.modulosSeg.modulos.map(m => {
      return { id: m.id }
    });

    const data = {
      Page: this.lastPage,
      PageSize: 10,
      idEstatusTarea: this.idEstatusTarea,
      idModulos: modulosPadre,
      idModulo: this.idModulo
    }
    this.siscoV3Service.postService(`tarea/Tareas`, data).toPromise().then((res: any) => {
      if (res.err) {
        this.Excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.Excepciones(res.excepcion, 3);
      } else {
        const tareasNuevas = res.recordsets[0];
        this.lastKey = tareasNuevas.length > 0 ? tareasNuevas[(tareasNuevas.length - 1)].id : this.lastKey;
        const tareasActuales = this.tareas.getValue();
        if (this.lastPage === 1) {
          this.tareas.next(tareasNuevas);
        } else {
          this.tareas.next(_.concat(tareasActuales, tareasNuevas));
        }
        if (this.lastKey === (tareasActuales.length > 0 ? tareasActuales[(tareasActuales.length - 1)].id : 0)) {
          this.finished = true;
          return;
        }
        this.lastPage++;
      }
    }, (error: any) => {
      this.Excepciones(error, 1);
    });
  }

  tareaActualizada($event) {
    if ($event) {
      this.lastKey = 0;
      this.lastPage = 1;
      this.finished = false;
      this.getCatalogos();
      this.getTareas();
    }
  }

  Excepciones(stack, tipoExcepcion: number) {
    console.log(tipoExcepcion);
    console.log(stack);
  }
}
