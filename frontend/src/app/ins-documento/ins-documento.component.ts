import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SiscoV3Service } from "../services/siscov3.service";
import { MatDialog } from "@angular/material";
import { ExcepcionComponent } from "../excepcion/excepcion.component";
import { FormGroup, Validators, FormControl } from "@angular/forms";

@Component({
  selector: "app-ins-docto",
  templateUrl: "./ins-documento.component.html",
  styleUrls: ["./ins-documento.component.sass"],
  providers: [SiscoV3Service]
})
export class AddDoctoComponent implements OnInit {
  public idCliente;
  public datos;
  public numero = 1;

  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('1')
  });

  constructor(
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private _siscoV3Service: SiscoV3Service
  ) {
    try {
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        _siscoV3Service
          .getService("cliente/getClientePorId?idCliente=" + this.idCliente)
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3);
              } else {
                this.numero = 1;
                this.datos = res.recordsets[0][0];
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

  ngOnInit() {}

  excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: "60%",
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: "add-cliente.component",
          mensajeExcepcion: "",
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {
      console.error(error);
    }
  }
}
