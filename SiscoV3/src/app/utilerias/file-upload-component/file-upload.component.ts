import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { IFileUpload, IFileUploadLabels } from '../../interfaces';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-file-upload-component',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  // ********* Se reciben parametros de carga de archivo y se regresa la respuesta del servicio de carga **************************
  @Input() IUploadFile: IFileUpload;
  @Output() messageEvent = new EventEmitter<{}>();
  @ViewChild('Gridlightbox') Gridlightbox: TemplateRef<any>;
  @Input() IFileUploadLabels: IFileUploadLabels;

  titulo: string;
  descripcion: string;
  disabled: boolean;
  frmCarga: FormGroup;
  btnUpload: boolean;
  documento: any = {};
  public imagePath;
  imgURL: any;
  public doc = [];
  onvalueextension;
  viewer: boolean;
  btnSubmitLabel = 'Subir Archivo(s)';

  constructor(private httpClient: HttpClient, private fb: FormBuilder, public dialog: MatDialog, public domSanitizer: DomSanitizer,
              private snackBar: MatSnackBar) {

    this.fb = new FormBuilder();
    this.frmCarga = this.fb.group({
      'titulo': [null, Validators.required],
      'descripcion': [null],
    });

  }

  ngOnInit() {
    this.disabled = true;
    this.btnUpload = true;
    this.viewer = true;
    if (!this.IUploadFile.tipodecarga) {
      this.IUploadFile.tipodecarga = 'useForm';
    }

    if (this.IUploadFile.idDocumento !== undefined && this.IUploadFile.idDocumento !== 0 && this.IUploadFile.idDocumento !== null) {
      this.httpClient.get(environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento='
        + this.IUploadFile.idDocumento).subscribe((data: any) => {
          this.documento = data.recordsets;
          let exten;
          let con = 0;
          this.documento.forEach((d: any) => {
            exten = d['path'].split('.');
            this.doc[con] = {
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
            };
            con++;
          });
          this.viewer = true;
        });
    } else {
      this.doc[0] = {
      };
    }

    // Si titulo y descripcion son recibidas como parametros, se asignan a las variables que seran enviadas al servicio de carga
    if (this.IUploadFile.titulo !== undefined && this.IUploadFile.descripcion !== undefined) {
      this.titulo = this.IUploadFile.titulo;
      this.descripcion = this.IUploadFile.descripcion;
      this.disabled = false;
    }

    // Si es carga masiva o solo se procesara el archivo se desactivan Inputs poniendo variable disabled en false
    if (this.IUploadFile.multiple === true || this.IUploadFile.soloProcesar === true) {
      this.disabled = false;
    }
  }
  // #region ValidaInputs
  /*
  Nombre:         ValidaInputs
  Autor:          Edgar Mendoza Gómez
  Fecha:          25/02/2019
  Descripción:    Valida que input de titulo se haya llenado.
  Parametros:
  Output:
  */
  // #endregion

  ValidaInputs() {
    // *********************** Valida que Input de titulo se haya llenado *********************
    this.titulo = this.frmCarga.controls.titulo.value;

    if (this.titulo != null || this.titulo !== undefined) {
      // **** Si Input se ha llenado cambia variable disbaled a false para activar boton de subir archivo *****
      this.disabled = false;

    }
  }

  // #region SubmitInputFile
  /*
  Nombre:         SubmitInputFile
  Autor:          Edgar Mendoza Gómez
  Fecha:          25/02/2019
  Descripción:    Con esta función se carga archivo o archivos.
  Parametros:     fileUploader
  Output:
  */
  // #endregion

  SubmitInputFile(fileUploader: DxFileUploaderComponent) {

    if (this.IUploadFile.soloProcesar) {

      let file = fileUploader.value[0];

      var reader = new FileReader();

      reader.onload = (e: any) => {
        /* read workbook */
        let bstr = e.target.result;

        const wb = XLSX.read(bstr, { type: 'binary' });
        /* grab first sheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        /* save data */
        let data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        this.messageEvent.emit({ error: '', excepcion: '', recordsets: [file.name, data] });
      };

      reader.readAsBinaryString(file);

    }

    else if (this.IUploadFile.tipoDocumento === 'Factura') {
      const xml = fileUploader.value.filter((documento: any) => {
        if (documento.type === 'text/xml') {
          return documento;
        }
      });
      const pdf = fileUploader.value.filter((documento: any) => {
        if (documento.type === 'application/pdf') {
          return documento;
        }
      });

      if ((xml.length === 1) && (pdf.length === 1)) {
        this.GuardarDocumento(fileUploader);
      } else {
        this.messageEvent.emit({
          error: [{ error: 'Favor de subir un PDF y un documento XML forzosamente.' }],
          excepcion: [],
          recordsets: []
        });
      }
    } else {
      this.GuardarDocumento(fileUploader);
    }
  }

  /**
   * @description Sube el documento al file server
   * @param fileUploader Datos del o los documentos a subir.
   * @author Andres Farias
   */
  GuardarDocumento(fileUploader: DxFileUploaderComponent) {
    
    
    const formData = new FormData();
    formData.append('path', this.IUploadFile.path);
    for (let i = 0; i < fileUploader.value.length; i++) {
      formData.append('files', fileUploader.value[i]);
    }
    // ************************** Se llena formData **************************
    formData.append('idAplicacionSeguridad', this.IUploadFile.idAplicacionSeguridad + '');
    formData.append('idModuloSeguridad', this.IUploadFile.idModuloSeguridad + '');
    formData.append('idUsuario', this.IUploadFile.idUsuario + '');
    formData.append('titulo', this.titulo + '');
    formData.append('descripcion', this.descripcion + '');
    // ******* Se consume servicio y si tuvo exito regresa id del o los documentos subidos  ***************
    this.httpClient.post(environment.fileServerUrl + 'documento/UploadFiles', formData).subscribe(data => {
      this.messageEvent.emit(data);
    }, error => error);
  }


  onValueChanged(e, fileUploader: DxFileUploaderComponent) {
    this.onvalueextension = `.${e.value[0].name.split('.')[e.value[0].name.split('.').length - 1]}`;
    this.viewer = true;

    if (this.IUploadFile.extension.includes(this.onvalueextension.toLowerCase())) {
      this.btnUpload = false;
    } else {
      this.btnUpload = true;
      this.snackBar.open('Extension invalida', 'Ok');
    }

    if (e.value[0]) {
      const reader = new FileReader();
      this.imagePath = e.value;
      reader.readAsDataURL(e.value[0]);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
        const element = document.querySelectorAll('[name="actual"]');
        [].forEach.call(element, function (el) {
          el.remove('actual');
        });
      };
      if (this.IUploadFile.titulo === '') {
        this.IUploadFile.titulo = e.value[0].name;
        this.titulo = e.value[0].name;
      }
      if (!this.IUploadFile.tipodecarga) {
        this.IUploadFile.tipodecarga = 'useForm';
      } else {
        if (this.IUploadFile.tipodecarga === 'instantly') {
          if (this.IUploadFile.extension.includes(this.onvalueextension.toLowerCase())) {
            this.SubmitInputFile(fileUploader);
           } else {
             this.snackBar.open('Extension invalida', 'Ok');
           }
        } else {
          this.IUploadFile.tipodecarga = 'useForm';
        }
      }

      this.doc[0].extencion = e.value[0].name.split('.')[e.value[0].name.split('.').length - 1];
    }
  }
}
