import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import {
  FormGroup,
  Validators,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { IFileUpload } from '../../interfaces';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DxFileUploaderComponent } from 'devextreme-angular';

@Component({
  selector: 'app-ins-doccumento',
  templateUrl: './ins-documento.component.html',
  styleUrls: ['./ins-documento.component.sass'],
  providers: [SiscoV3Service]
})
export class AddDoctoComponent implements OnInit {
  documentoForm = new FormGroup({
    idTipoDocumento: new FormControl('', [Validators.required])
  });

  IUploadFile: IFileUpload;
  public idCliente;
  public datos;
  public numero = 1;
  public documentos;
  url;
  public idDocumento;
  public disabled = true;
  public recarga = 1;

  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('1')
  });

  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private _siscoV3Service: SiscoV3Service
  ) {
    try {
      this.url = environment.urlFileServer;
      this.loadData();
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  loadData() {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        this._siscoV3Service
          .getService('cliente/getClientePorId?idCliente=' + this.idCliente)
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3);
              } else {
                this.datos = res.recordsets[0][0];
                this._siscoV3Service
                  .getService('cliente/getTipoDocumento')
                  .subscribe(
                    // tslint:disable-next-line:no-shadowed-variable
                    (res: any) => {
                      if (res.err) {
                        this.numero = 1;
                        this.excepciones(res.err, 4);
                      } else if (res.excepcion) {
                        this.numero = 1;
                        this.excepciones(res.excepcion, 3);
                      } else {
                        this.numero = 1;
                        this.documentos = res.recordsets[0];
                      }
                    },
                    (error: any) => {
                      this.excepciones(error, 1);
                    }
                  );
              }
            },
            (error: any) => {
              this.numero = 1;
              this.excepciones(error, 2);
            }
          );
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  test(data) {
    this.disabled = false;
  }

  ngOnInit() {
    const ext = [];
    ext.push('.jpg', '.jpeg', '.png', '.pdf');

    // ****** Se llena interface para ser enviada como parametros para componente de  carga de archivo ******
    this.IUploadFile = {
      path: '1',
      idUsuario: 181,
      idAplicacionSeguridad: 1,
      idModuloSeguridad: 1,
      multiple: false,
      soloProcesar: false,
      extension: ext
    };
  }

  insDocto(fileUploader: DxFileUploaderComponent) {
    try {
      this.numero = 0;
      const formData = new FormData();
      formData.append('path', this.IUploadFile.path);
      for (let i = 0; i < fileUploader.value.length; i++) {
        formData.append('files', fileUploader.value[i]);
      }
      // ************************** Se llena formData **************************
      formData.append(
        'idAplicacionSeguridad',
        this.IUploadFile.idAplicacionSeguridad + ''
      );
      formData.append(
        'idModuloSeguridad',
        this.IUploadFile.idModuloSeguridad + ''
      );
      formData.append('idUsuario', this.IUploadFile.idUsuario + '');

      // ******* Se consume servicio y si tuvo exito regresa id del o los documentos subidos  ***************

      this.httpClient.post(this.url, formData).subscribe(
        (res: any) => {
          /*if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              this.excepciones(res.excepcion, 3);
            } else {*/
          const data = {
            idCliente: this.idCliente,
            idTipoDocumento: this.documentoForm.controls['idTipoDocumento']
              .value,
            idDocumento: res.recordsets[0].idDocumento,
            idUsuario: 1
          };
          this._siscoV3Service
            .postService('cliente/postInsClienteDocumento', data)
            .subscribe(
              (resp: any) => {
                if (resp.err) {
                  this.numero = 1;
                  this.excepciones(res.err, 4);
                } else if (resp.excepcion) {
                  this.numero = 1;
                  this.excepciones(res.excepcion, 3);
                } else {
                  this.numero = 1;
                  this.recarga = 0;
                  this.recarga = 1;
                  this.documentoForm.reset();
                  this.disabled = true;
                  this.loadData();
                  this.ngOnInit();
                }
              },
              (error: any) => {
                this.numero = 1;
                this.excepciones(error, 2);
              }
            );
          // this.idDocumento = res.recordsets[0].idDocumento;
          // console.log(this.idDocumento);
          // }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
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
          moduloExcepcion: 'add-cliente.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {
      console.error(error);
    }
  }
}
