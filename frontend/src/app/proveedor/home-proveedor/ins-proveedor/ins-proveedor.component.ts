import { Component } from '@angular/core';

import { SiscoV3Service } from '../../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../../utilerias/excepcion/excepcion.component'
import { ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../interfaces';
import { ITEM_STORAGE } from '../enums';


@Component({
  selector: 'app-ins-proveedor',
  templateUrl: './ins-proveedor.component.html',
  styleUrls: ['./ins-proveedor.component.sass'],
  providers: [SiscoV3Service]
})
export class InsProveedorComponent{
  public rfcProveedor: string;
  public rfcProveedorEntidad: string;
  public tipo = 2;
  public numero = 1;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service
  ) {
    this.activatedRoute.params.subscribe(parametros => {

      this.rfcProveedor = parametros.rfcProveedor;
      this.rfcProveedorEntidad = parametros.rfcClienteEntidad;

    });
  }

  agregarProveedor($event) {
    try {
      this.numero = 0;
      const proveedor: IProveedor = $event.data;
      this._siscoV3Service
        .postService('proveedor/postInsProveedor', proveedor)
        .subscribe(
          (res: any) => {
            // console.log(res);
            if (res.err) {
              this.numero = 1;
              // error tipo base de datos
              this.excepciones(res.err, 4)

            } else if (res.excepcion) {
              this.numero = 1;
              // excepcion de conexion a la base de datos
              this.excepciones(res.excepcion, 3);
            } else {
              this.numero = 1;
              const proveedor:IProveedor = res.recordsets[0][0];
              localStorage.setItem(ITEM_STORAGE.ITEM_DATOS_PROVEEDOR, JSON.stringify(proveedor));
              this.router.navigateByUrl("/upd-proveedor/" + proveedor.rfcProveedor);
              this.snackBar.open('Se a guardado el proveedor.', 'Ok', {
                duration: 2000
              });
            }
          },
          (error: any) => {
            // error de no conexion al servicio
            this.excepciones(error, 2);
            this.numero = 1;
            console.log(error);
          }
        );
    } catch (error) {
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

      dialogRef.afterClosed().subscribe((result: any) => {
        // console.log('The dialog was closed');
      });

    } catch (err) {
      console.log(err)
    }
  }
}


