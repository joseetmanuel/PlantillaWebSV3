import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [SiscoV3Service]
})
export class ForgotPasswordComponent implements OnInit {

  urlPassword: string;
  urlCorreo: string;
  correoForm = new FormGroup({
    correo: new FormControl('', [Validators.email, Validators.required])
  })
  spinner: boolean;
  imagen = 0;
  headers;



  constructor(
    private router: Router,
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private siscoV3Service: SiscoV3Service,
  ) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY0MWU3OWQzZjUwOWUyYzdhNjQ1N2ZjOTVmY2U1MGNjOGM3M2VmMDMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9zw6kgRXRtYW51ZWwgIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2dhLXNlY3VyaXR5LWFwaSIsImF1ZCI6ImdhLXNlY3VyaXR5LWFwaSIsImF1dGhfdGltZSI6MTU2NTg4MjM1NCwidXNlcl9pZCI6IjFzQlFwYmczalhnODdEWEw3SWo5N3BLU3laaDIiLCJzdWIiOiIxc0JRcGJnM2pYZzg3RFhMN0lqOTdwS1N5WmgyIiwiaWF0IjoxNTY1ODgyMzU0LCJleHAiOjE1NjU4ODU5NTQsImVtYWlsIjoiam9zZWV0bWFudWVsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfbnVtYmVyIjoiKzUyMTU1ODU3NTE1MTgiLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7InBob25lIjpbIis1MjE1NTg1NzUxNTE4Il0sImVtYWlsIjpbImpvc2VldG1hbnVlbEBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.E6x84eOXZlAfV55ZBStN_JAhwc8np6ShD0DkZGDG0urnjBfW27kgu4bfqKmZ-ARHmfqOOreU4DvIIO0Pa9ttsbT0jP7XJVLGfu3V54jr2RrpIitqOepMPSUnZ4laoF6P2_XoCCI1izmFBaxdQa0rs6Xcq4d6CfTsdB4o1r5Wv8BTenC0ztHH2vA9s_xr5LmSn3_vY9juTGsOiYktotu2CP9GfMT0HQd_sjmLB6re_rKqWOPwPc-vjTGp2pjIiJkvrIvxwxRuxymN6gBQA29o7aTkXb4YjL1SPm_o8ZBd2CFviNQFZxqfsgaPFA2lLs0qNgH_56vUmJDK9pqSsBFpTA'
    })
  }

  ngOnInit() {
    Observable.timer(0, 5000)
      .subscribe(() => {
        this.imagen++;
        if (this.imagen === 4) {
          this.imagen = 1;
        }
      });
    this.urlPassword = environment.seguridadUrl;
    this.urlCorreo = environment.messagingUrl;
  }

  validaUsuario() {
    this.spinner = true;
    const correo = this.correoForm.controls.correo.value;
    this.siscoV3Service.getService(`seguridad/getUsuarioToken?correo=${correo}`, this.headers).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.recordsets[0][0].message) {
          this.snackBar.open(res.recordsets[0][0].message, 'Ok');
        } else {
          const token = res.recordsets[0][0].token;
          const ruta = res.recordsets[1][0].valor;
          this.enviaCorreo(ruta, token);
        }
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  enviaCorreo(ruta, token) {
    this.spinner = true;
    let now = new Date();
    const data = {
      destination: {
        mailTo: [this.correoForm.controls.correo.value],
        mailccTo: [this.correoForm.controls.correo.value],
        mailccbTo: [this.correoForm.controls.correo.value]
      },
      message: {
        attached: [],
        body: `<html lang='es'><head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/><meta http-equiv='X-UA-Compatible' content='ie=edge'/><title>Document</title><style>.margenTop{margin-top:50px}.bordesDiv{width:50%;margin-left:auto;margin-right:auto;font-family:Helvetica;border:1px solid #eceaea;text-align:center}.botonEstilo{width:30%;height:40px;font-size:16px;border-radius:12px;background:#305FDC;color:white;margin-bottom:50px}.colorLetra{color: #6D757D}</style></head><body><div class='margenTop'><img width='150' src='http://189.204.141.199:5114/1/Automovil/34eec2c8d58770a52560492abaaa3e90.png' alt=''/></div><hr size='1' style='border:1px solid #f6f5f5;'/><div class='margenTop'><div class='bordesDiv'><p style='margin-top: 50px;font-size: 24px; color: #696b7f'>Restablecimiento de Contraseña</p><p style='font-size: 20px;' class='colorLetra'>Hola, ${this.correoForm.controls.correo.value}</p><p style='font-size: 16px;' class='colorLetra'>Recientemente hiciste una solicitud para restablecer tu contraseña.<br/>Para hacerlo, haz clic en elsiguiente botón.</p><a href = "${ruta}upd-password/${token}"><button class='botonEstilo'>Restablece contraseña</button></div></div></body></a></html>`,
        title: 'Recuperar contraseña de Sisco'
      },
      push: {
        date: now,
        how: [1],
        idUser: 2,
        type: 1
      },
      source: {
        idAplication: 11
      }
    };
    this.httpClient.post(`${this.urlCorreo}notificacion/postNotifica`, data).subscribe(
      (res: any) => {
        this.spinner = false;
        this.snackBar.open('Se te ha enviado un correo para que puedas restaurar tu contraseña', 'Ok', {
          duration: 2000
        });
        this.correoForm.reset();
        const that = this;
        setTimeout(function () {
          that.router.navigate(['/login']);
        }, 2000);
      }, (error: any) => {
        this.spinner = false;
        this.excepciones(error, 2);
      }
    )
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
