import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from '../../store/app.states';
import { environment } from 'src/environments/environment';
import { Negocio } from 'src/app/models/negocio.model';
import { SiscoV3Service } from '../../services/siscov3.service';
import { IBuscador, TipoBusqueda, IFileUpload, TareaPredefinida } from 'src/app/interfaces';
import { Router } from '@angular/router';
import { UsuarioTareaComponent } from '../usuario-tarea/usuario-tarea.component';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';
import { MatDialog } from '@angular/material';
import { BaseService } from 'src/app/services/base.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-ins-tarea',
  templateUrl: './ins-tarea.component.html',
  styleUrls: ['./ins-tarea.component.sass']
})
export class InsTareaComponent implements OnInit {
  public usuarioTarea: UsuarioTareaComponent;
  public prioridades: Array<any>;
  public idClase = 'Automovil';
  public getStateUser: Observable<any>;
  public getStateNegocio: Observable<any>;
  public idUsuario = 6083;
  public breadcrumb: any;
  public buscador: IBuscador;
  public usuariosAsignados: Array<any>;
  public urlImagen: string;
  @Input() IUploadFile: IFileUpload;
  @Output() messageEvent = new EventEmitter<{}>();
  tareaForm = new FormGroup({
    titulo: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    fechaVencimiento: new FormControl('', [Validators.required]),
    usuarioSolicitado: new FormControl(''),
    prioridad: new FormControl('', [Validators.required]),
    idArchivos: new FormControl([])
  });
  public spinner = false;

  constructor(private store: Store<AppState>, private snackBar: MatSnackBar, private siscoV3Service: SiscoV3Service, private router: Router, private dialog: MatDialog, private baseService: BaseService) {
    this.prioridades = [];
    this.usuariosAsignados = [];
    this.getStateUser = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
    this.urlImagen = `../../assets/images/iconos-tarea/tareas_azul.png`;
  }

  ngOnInit() {
    this.cargarCatalogos();
    const stateUsuario = this.baseService.getUserData();
    this.idUsuario = stateUsuario.user.id;
    const stateContrato = this.baseService.getContractData();
    this.idClase = stateContrato.claseActual;
    this.ConstruyeBread(this.urlImagen);
    this.buscador = {
      isActive: true,
      tipoBusqueda: TipoBusqueda.usuario,
      parametros: {
        buscarPorJerarquia: false,
        idUsuario: 0,
        busqueda: this.tareaForm.get('usuarioSolicitado').value
      }
    };

    const ext = ['.jpg', '.jpeg', '.png', '.pdf'];
    this.IUploadFile = {
      path: this.idClase,
      idUsuario: this.idUsuario,
      idAplicacionSeguridad: environment.aplicacionesId,
      idModuloSeguridad: 1,
      multiple: true,
      soloProcesar: false,
      extension: ext,
      titulo: '',
      descripcion: '',
      previsualizacion: true,
      tipodecarga: 'instantly'
    };
  }

  private ConstruyeBread(pathUser) {
    const rutaBreadcrumb = {
      logo: [{ idClase: 'Automovil', path: pathUser },
      { idClase: 'Papeleria', path: pathUser }],
      route: [{ label: 'home', url: `/user-profile/${0}` }, { label: [{ idClase: 'Automovil', label: 'Tarea' }, { idClase: 'Papeleria', label: 'Tarea' }], url: `/ins-tarea` }]
    };
    this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(rutaBreadcrumb, this.idClase);
  }

  ResultUploadFile($event) {
    if ($event.recordsets.length > 0) {
      const idArchivos = [];
      $event.recordsets.forEach(doc => {
        idArchivos.push(doc.idDocumento);
      });
      this.tareaForm.controls.idArchivos.setValue(idArchivos);
      this.snackBar.open('Se ha subido correctamente el archivo.', 'Ok', {
        duration: 2000
      });
    } else {
      this.snackBar.open(`Error ${$event.error[0]}`, `Ok`, {
        duration: 2000
      });
    }
  }

  guardarTarea() {
    this.spinner = true;
    const uIdsC = this.usuariosAsignados.map(ua => {
      return ua.Id;
    });
    const uIds = uIdsC && uIdsC.length > 0 ? uIdsC : [this.idUsuario]
    const prioridadId = this.tareaForm.get('prioridad').value;
    const body = {
      titulo: this.tareaForm.get('titulo').value,
      descripcion: this.tareaForm.get('descripcion').value,
      fechaVencimiento: this.tareaForm.get('fechaVencimiento').value,
      periodicidadRecordatorio: 1,
      tags: [prioridadId],
      userIds: uIds,
      idDocumentos: this.tareaForm.get('idArchivos').value,
      idModulo: TareaPredefinida.MANUAL
    };

    this.siscoV3Service.postService('tarea/TareaManual', body).toPromise().then((res: any) => {
      if (res.length > 0 && res[0].status === 0) {
        this.spinner = false;
        this.snackBar.open('Se ha guardado correctamente la tarea', 'Ok', {
          duration: 2000
        });
        this.router.navigate(['/user-profile/0']);
      } else {
        this.spinner = false;
        this.excepciones(res.mensaje, 4);
      }
    }, (error: any) => {
      this.spinner = false;
      this.excepciones(error, 2);
    });
  }

  excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'ins-tarea.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) { }
  }

  responseBuscador($event) {
    if ($event) {
      this.tareaForm.controls.usuarioSolicitado.setValue('');
      this.buscador.parametros.busqueda = '';
      const usuario = this.usuariosAsignados.find(u => {
        return u.Id === $event.recordsets[0].Id;
      });
      if (!usuario) {
        this.usuariosAsignados.push($event.recordsets[0]);
      }
    }
  }

  removerUsuario($event) {
    if ($event) {
      this.tareaForm.controls.usuarioSolicitado.setValue('');
      const usuarios = this.usuariosAsignados.filter(u => u.Id !== $event.Id)
      this.usuariosAsignados = usuarios;
    }
  }

  private cargarCatalogos(): void {
    this.siscoV3Service.getService('tarea/Tag').toPromise().then((res: any) => {
      if (!res.error) {
        this.prioridades = res.recordsets[0];
      } else {
        this.excepciones(res.error, 4)
      }
    }, (error: any) => {
      this.excepciones(error, 2)
    });
  }
}
