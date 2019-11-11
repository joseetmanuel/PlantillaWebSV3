import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ThemeOptions } from '../../../../../theme-options';
import { SiscoV3Service } from '../../../../../services/siscov3.service';
import { BehaviorSubject } from 'rxjs';
import { MessagingService } from '../../../../../services/messaging.service';
import { BaseService } from 'src/app/services/base.service';
import { EstatusTarea } from '../../../../../interfaces';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
})
export class DrawerComponent implements OnInit, OnDestroy {
  tareas = new BehaviorSubject([]);
  private lastPage: number;

  toggleDrawer() {
    this.globals.toggleDrawer = !this.globals.toggleDrawer;
  }

  constructor(public globals: ThemeOptions, private siscoV3Service: SiscoV3Service, private messagingService: MessagingService, private baseService: BaseService) {
    this.lastPage = 1;
  }

  ngOnInit() { }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: any) {
    if (event.fromElement) {
      this.getTareas();
    }
  }

  private getTareas(): void {
    const modulosSeg = this.baseService.getSecurityData();
    const modulosPadre = modulosSeg.modulos.map(m => {
      return { id: m.id }
    });
    const data = {
      Page: this.lastPage,
      PageSize: 5,
      idEstatusTarea: EstatusTarea.PENDIENTE,
      idModulos: modulosPadre,
      idModulo: null
    }
    this.siscoV3Service.postService(`tarea/Tareas`, data).toPromise().then((res: any) => {
      if (res.err) {
        this.excepciones(res.err, 4);
      } else if (res.excepcion) {
        this.excepciones(res.excepcion, 3);
      } else {
        this.tareas.next(res.recordsets[0]);
      }
    }, (error: any) => {
      this.excepciones(error, 1);
    }
    );
  }

  private excepciones(error: any, tipo: number) {
    console.log(error + ' ' + tipo);
  }

  ngOnDestroy() { }
}
