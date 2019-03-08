import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  TooltipComponent
} from "@angular/material";
import { MatSnackBar } from "@angular/material";
import { NGXLogger } from "ngx-logger";
import { SiscoV3Service } from "../services/siscov3.service";

export interface SendData {
  data: any;
  tipo: string;
}

@Component({
  selector: "app-delete-alert",
  templateUrl: "./delete-alert.component.html",
  styleUrls: ["./delete-alert.component.sass"],
  providers: [SiscoV3Service]
})
export class DeleteAlertComponent implements OnInit {
  public numero = 1;
  constructor(
    private logger: NGXLogger,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service,
    public dialogRef: MatDialogRef<DeleteAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendData
  ) {
    console.log(data);
  }

  ngOnInit() {}

  eliminar() {
    if (this.data.tipo === '1') {
      this._siscoV3Service
        .deleteService('cliente/deleteCliente', this.data.data)
        .subscribe(
          (res: any) => {
            this.numero = 1;
            this.dialogRef.close(1);
          },
          (error: any) => {
            console.log(error);
          }
        );
    } else if (this.data.tipo === '2') {
      this.numero = 0;
      this._siscoV3Service
        .deleteService('cliente/deleteClienteEntidad', this.data.data)
        .subscribe(
          (res: any) => {
            this.numero = 1;
            this.dialogRef.close(1);
            console.log(res);
          },
          (error: any) => {
            this.numero = 1;
            console.log(error);
          }
        );
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
