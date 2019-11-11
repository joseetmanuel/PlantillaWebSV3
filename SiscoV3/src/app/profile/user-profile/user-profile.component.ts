import { Component, OnInit, ViewChild } from '@angular/core';
import { IViewer, IViewersize, IViewertipo, IFileUpload } from '../../interfaces';
import { TokenService } from '../../services/token.service';
import { Negocio } from 'src/app/models/negocio.model';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';
import { AppState, selectContratoState } from '../../store/app.states';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass']
})
export class UserProfileComponent implements OnInit {
  iViewer: IViewer[];
  public getStateNegocio: Observable<any>;
  public breadcrumb: any;
  private idClase: string;
  public IUploadFile: IFileUpload;
  public idDocumento: number;
  public solicitudList: any[];
  private userP: any;
  private urlImagen: string;
  private indexTab: number;
  public tokenSolicitud: Observable<any>;
  public idSolicitud: Observable<any>;
  public numeroOrden: Observable<any>;
  activachat: boolean;
  @ViewChild('tabs') tabGroup: MatTabGroup;
  userForm = new FormGroup({
    apellidoP: new FormControl('', [Validators.required]),
    apellidoM: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required])
  });
  constructor(private tokenService: TokenService,
    private activatedRoute: ActivatedRoute,
    private siscoService: SiscoV3Service,
    private snackBar: MatSnackBar,
    private store: Store<AppState>) {
    this.getStateNegocio = this.store.select(selectContratoState);
    this.userP = this.tokenService.getUserId();
    this.urlImagen = `../../assets/images/iconos-tarea/solicitante.png`;
  }

  ngOnInit() {
    this.getStateNegocio.subscribe((stateContrato) => {
      if (stateContrato) {
        this.idClase = stateContrato.claseActual;
      }
    });
    this.idDocumento = this.userP.idAvatar;
    this.iViewer = [{
      idDocumento: this.idDocumento,
      tipo: IViewertipo.avatar,
      descarga: false,
      size: IViewersize.md
    }];

    const ext = ['.jpg', '.jpeg', '.png', '.pdf'];
    this.IUploadFile = {
      path: this.idClase,
      idUsuario: this.userP.idUsuario,
      idAplicacionSeguridad: environment.aplicacionesId,
      idModuloSeguridad: 1,
      multiple: false,
      soloProcesar: false,
      extension: ext,
      titulo: '',
      descripcion: '',
      previsualizacion: false,
      tipodecarga: 'instantly'
    };

    this.activatedRoute.params.subscribe(parametros => {
      this.indexTab = parametros.tab && parametros.tab > 0 ? parametros.tab : 0;
      this.indexTab = Number(this.indexTab);
      if(this.indexTab === 2){
        this.marcarLeido();
      }
      this.tabGroup.selectedIndex = this.indexTab;
    });
    this.ConstruyeBread(this.urlImagen);
    this.cargarDatosUsuario(this.userP);
  }

  private cargarDatosUsuario(up: any) {
    this.userForm.controls.correo.setValue(up.email);
    this.userForm.controls.nombre.setValue(up.name);
    this.userForm.controls.telefono.setValue(up.phone);
    this.userForm.controls.apellidoP.setValue(up.firstName);
    this.userForm.controls.apellidoM.setValue(up.lastName);
  }

  clickTab(event: any) {
    if(event.index === 2) {
      this.marcarLeido();
    }
  }

  private marcarLeido() {
    this.siscoService.postService('notificacion/MarcarTodoLeido').toPromise().then(() => {
    });
  }

  ResultUploadFile($event) {
    if ($event.recordsets.length > 0) {
      $event.recordsets.forEach(doc => {
        this.idDocumento = doc.idDocumento
      });
      this.iViewer = [{
        idDocumento: this.idDocumento,
        tipo: IViewertipo.avatar,
        descarga: false,
        size: IViewersize.md
      }];
    } else {
      console.log('no se cargaron datos');
    }
  }

  private ConstruyeBread(pathUser) {
    const rutaBreadcrumb = {
      logo: [{ idClase: 'Automovil', path: pathUser },
      { idClase: 'Papeleria', path: pathUser }],
      route: [{ label: 'home', url: '/' }, { label: [{ idClase: 'Automovil', label: 'Mi cuenta' }, { idClase: 'Papeleria', label: 'Mi cuenta' }], url: `/user-profile/${this.indexTab}` }]
    };
    this.breadcrumb = Negocio.GetConfiguracionBreadCrumb(rutaBreadcrumb, this.idClase);
  }

  solicitudSeleccionada($event) {
    if ($event) {
      this.tokenSolicitud = $event.tokenSolicitud;
      this.idSolicitud = $event.idSolicitud;
      this.numeroOrden = $event.numeroOrden;
    }
  }

  ActualizarDatos() {
    const body = {
      email: this.userForm.value.correo,
      nombre: this.userForm.value.nombre,
      telefono: this.userForm.value.telefono,
      apellidoP: this.userForm.value.apellidoP,
      apellidoM: this.userForm.value.apellidoM,
      avatar: this.idDocumento,
      idUsuario: this.userP.idUsuario
    };
    const guardado = this.siscoService.postService('seguridad/updateUsuario', body).toPromise();
    guardado.then(res => {
      this.tokenService.updateDataUser(body);
      this.snackBar.open('Se han actualizado correctamente los datos', 'Ok', {
        duration: 2000
      });
    }).catch(reason => {
      console.log(reason);
    })
  }

  clickchat() {
    this.activachat = true;

  }

  regresar() {
    this.activachat = false;
  }
}
