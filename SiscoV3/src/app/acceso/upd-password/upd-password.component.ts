import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
    FormGroup,
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment';
import { ErrorStateMatcher } from '@angular/material/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateAlertComponent } from 'src/app/utilerias/update-alert/update-alert.component';
import { IFileUpload } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/Observable';
import { Negocio } from '../../models/negocio.model';
import { BaseService } from '../../services/base.service';
import { SessionInitializer } from '../../services/session-initializer';
import { HttpClient, HttpHeaders } from '@angular/common/http';

class CrossFieldErrorMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control.dirty && form.invalid;
    }
}
@Component({
    selector: 'app-upd-password',
    templateUrl: './upd-password.component.html',
    styleUrls: ['./upd-password.component.scss'],
})


export class UpdPasswordComponent implements OnInit {
    imagen = 0;
    spinner = false;
    matcher = new CrossFieldErrorMatcher();
    passwordForm: FormGroup;
    token;
    urlSeguridad: string;
    headers: HttpHeaders;
    correo: any;
    headers2;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private httpClient: HttpClient,
        private snackBar: MatSnackBar,
        private siscoV3Service: SiscoV3Service,
        private sessionInitializer: SessionInitializer,
        private baseService: BaseService,
        private formBuilder: FormBuilder
    ) {
        this.passwordForm = this.formBuilder.group({
            'nuevaPassword': ['', [Validators.required]],
            'confirmaPassword': ['', [Validators.required]]
        }, { validator: this.checkPassword })
    }

    ngOnInit() {
        this.urlSeguridad = environment.seguridadUrl;
        Observable.timer(0, 5000)
            .subscribe(() => {
                this.imagen++;
                if (this.imagen === 4) {
                    this.imagen = 1;
                }
            });
        this.loadData();
    }

    loadData() {
        this.activatedRoute.params.subscribe(parametros => {
            this.token = parametros.token;
        });
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        this.headers2 = {
            'Authorization': this.token
        }
        this.getUsuario();
    }


    getUsuario() {
        this.spinner = true;
        this.siscoV3Service.getService(`seguridad/getUsuarioPorToken?token=${this.token}`, this.headers).subscribe(
            (res: any) => {
                this.spinner = false;
                if (res.recordsets[0][0]) {
                    this.correo = res.recordsets[0][0].Email;
                } else {
                    this.router.navigate(['/home']);
                }
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2)
            }
        );
    }



    checkPassword(form: FormGroup) {
        const condition = form.controls.nuevaPassword.value !== form.controls.confirmaPassword.value;
        return condition ? { passwordsDoNotMatch: true } : null;
    }

    guardarNuevaPassword() {
        this.spinner = true;
        let data = {
            credentials: {
                email: this.correo,
                password: this.passwordForm.controls.nuevaPassword.value
            }
        }
        this.httpClient.post(`${this.urlSeguridad}v2/user/PasswordReset`, data, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token })
        }).subscribe(
            (res: any) => {
                this.spinner = false;
                this.snackBar.open('Contraseña actualizada', 'Ok', {
                    duration: 2000
                });
                this.passwordForm.reset();
                const that = this;
                setTimeout(function () {
                    that.router.navigate(['/login']);
                }, 2000);
            }, (error: any) => {
                this.spinner = false;
                this.excepciones(error, 2)
            })
    }

    excepciones(error, tipoExcepcion: number) {
        try {
            const dialogRef = this.dialog.open(ExcepcionComponent, {
                width: '60%',
                data: {
                    idTipoExcepcion: tipoExcepcion,
                    idUsuario: 1,
                    idOperacion: 1,
                    idAplicacion: 1,
                    moduloExcepcion: 'ins-documento.component',
                    mensajeExcepcion: '',
                    stack: error
                }
            });

            dialogRef.afterClosed().subscribe((result: any) => {
                this.spinner = false;
            });
        } catch (error) {
            this.spinner = false;
            console.error(error);
        }
    }
}