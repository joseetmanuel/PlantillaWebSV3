import { Component, OnInit, Input } from '@angular/core';
import { IViewer, IViewertipo, IViewersize } from 'src/app/interfaces';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';

@Component({
  selector: 'app-banner-generico',
  templateUrl: './banner-generico.component.html',
  styleUrls: ['./banner-generico.component.scss'],
  providers: [SiscoV3Service]
})
export class BannerGenericoComponent implements OnInit {

  constructor(private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog, ) { }

  IViewer: IViewer[];
  url: string;
  tipoObjetos: any;
  objetos: any;
  idFile: number;
  color: string;
  @Input() IObjeto: any;

  ngOnInit() {
    this.url = environment.fileServerUrl;
    this.LoadData();
  }

  LoadData() {
    try {
      this.siscoV3Service.getService('objeto/GetBannerGenerico?idClase=' + this.IObjeto[0].idClase +
        '&&numeroContrato=' + this.IObjeto[0].numeroContrato + '&&idCliente=' + this.IObjeto[0].idCliente +
        '&&rfcEmpresa=' + this.IObjeto[0].rfcEmpresa + '&&idObjeto=' + this.IObjeto[0].idObjeto +
        '&&idTipoObjeto=' + this.IObjeto[0].idTipoObjeto)
        .subscribe((res: any) => {
          if (res.err) {
            this.Excepciones(res.err, 4);
          } else if (res.excecion) {
            this.Excepciones(res.err, 3);
          } else {
            if (res.recordsets.length > 0) {
              const tipoObjetos = res.recordsets[0];
              const objetos = res.recordsets[1];

              if (res.recordsets[2].length > 0) {
                this.idFile = res.recordsets[2][0].idFileServer;
                
              }

              this.tipoObjetos = [];
              this.objetos = [];

              tipoObjetos.forEach(element => {
                if (element.campo === 'Foto') {
                  if (this.idFile) {
                    this.CrearView(this.idFile)
                  } else {
                    this.CrearView(element.valor);
                  }
                }
                if (element.campo !== 'Foto') {
                  this.tipoObjetos.push({ campo: element.campo, valor: element.valor })
                }
              });

              objetos.forEach(element => {
                if (element.campo === 'Color') {
                  this.color = element.valor;
                }
                if (element.campo !== 'Color') {
                  this.objetos.push({ campo: element.campo, valor: element.valor })
                }
              });

            } else {
              this.tipoObjetos = [];
              this.objetos = [];

            }

          }
        }, (error: any) => {
          this.Excepciones(error, 2);
        });
    } catch (error) {
      this.Excepciones(error, 1);
    }

  }

  CrearView(idArchivo) {

    if (idArchivo !== null) {
      this.IViewer = [
        {
          idDocumento: idArchivo,
          tipo: IViewertipo.avatar,
          descarga: false,
          size: IViewersize.lg
        }
      ];
    }
  }


  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
  Excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'clientes.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => { });
    } catch (error) {
    }
  }

}
