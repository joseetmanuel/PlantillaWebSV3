import { Component, HostBinding, OnInit } from "@angular/core";
import { select } from "@angular-redux/store";
import { Observable } from "rxjs";
import { ThemeOptions } from "../../../theme-options";
import { IBuscador, TipoBusqueda } from "src/app/interfaces";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import {
  AppState,
  selectAuthState,
  selectContratoState
} from "src/app/store/app.states";
import {
  SeleccionarSolicitudes,
  SeleccionarSolicitudActual
} from "src/app/store/actions/contrato.actions";
import { ExcepcionComponent } from "src/app/utilerias/excepcion/excepcion.component";
import {
  MatDialog,
  getMatFormFieldDuplicatedHintError
} from "@angular/material";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  // VARIABLES PARA NGRX
  getStateAutenticacion: Observable<any>;
  getStateNegocio: Observable<any>;

  idUsuario: any;
  idClase: any;
  contratoActual: any;
  numeroContrato: any;
  contratos: any;
  isActive: boolean;
  public buscador: IBuscador;
  busqueda: any;
  widhtInput = "85px";
  logoEmpresa: string;

  constructor(
    public globals: ThemeOptions,
    private router: Router,
    public dialog: MatDialog,
    private store: Store<AppState>
  ) {
    this.getStateAutenticacion = this.store.select(selectAuthState);
    this.getStateNegocio = this.store.select(selectContratoState);
  }

  @HostBinding("class.isActive")
  get isActiveAsGetter() {
    return this.isActive;
  }

  @select("config") public config$: Observable<any>;

  ngOnInit(): void {
    this.getStateNegocio.subscribe(stateNegocio => {
      this.getStateAutenticacion.subscribe(stateAutenticacion => {
        this.idUsuario = stateAutenticacion.seguridad.user.id;
        this.idClase = stateNegocio.claseActual;
        this.contratos = stateNegocio.contratosSeleccionados;
        if (this.contratos) {
          //obtener la imagen de la empresa
          if (this.contratos.length) {
            let imagen = this.contratos[0].imagenEmpresa;
            this.contratos.forEach(contrato => {
              if (imagen != contrato.imagenEmpresa) {
                imagen = null;
              }
            });
            this.logoEmpresa = imagen;
          }

          // General el xml para los contratos
          let contratos = "<contratos>";
          this.contratos.forEach(contrato => {
            contratos += "<contrato>";
            contratos += "<rfcEmpresa>";
            contratos += contrato.rfcEmpresa;
            contratos += "</rfcEmpresa>";
            contratos += "<idCliente>";
            contratos += contrato.idCliente;
            contratos += "</idCliente>";
            contratos += "<numeroContrato>";
            contratos += contrato.numeroContrato;
            contratos += "</numeroContrato>";
            contratos += "</contrato>";
          });

          contratos += "</contratos>";

          this.buscador = {
            isActive: false,
            tipoBusqueda: TipoBusqueda.general,
            parametros: {
              idUsuario: this.idUsuario,
              idClase: this.idClase,
              busqueda: null,
              contratos
            }
          };
          this.widhtInput = "85px";
        }
      });
    });
  }

  toggleSidebarMobile() {
    this.globals.toggleSidebarMobile = !this.globals.toggleSidebarMobile;
  }

  toggleHeaderMobile() {
    this.globals.toggleHeaderMobile = !this.globals.toggleHeaderMobile;
  }

  closeSidebarMobile() {
    this.globals.toggleSidebarMobile = false;
  }

  closeHeaderMobile() {
    this.globals.toggleHeaderMobile = false;
  }

  responseBuscador($event) {
    if ($event.error.length < 1) {
      if ($event.recordsets[0].tipoBusqueda === "orden") {
        const orden = $event.recordsets[0];
        const Solicitudes = [
          {
            idSolicitud: orden.idSolicitud,
            numeroOrden: orden.noOrden,
            idLogoContrato: orden.idLogoContrato,
            rfcEmpresa: orden.rfcEmpresa,
            idCliente: orden.idCliente,
            numeroContrato: orden.numeroContrato,
            idObjeto: orden.idObjeto,
            idTipoObjeto: orden.idTipoObjeto,
            idTipoSolicitud: orden.idTipoSolicitud
          }
        ];
        this.store.dispatch(
          new SeleccionarSolicitudes({ solicitudesSeleccionadas: Solicitudes })
        );
        this.store.dispatch(
          new SeleccionarSolicitudActual({ solicitudActual: Solicitudes[0] })
        );

        this.router.navigateByUrl("/sel-solicitud");
      } else if (
        $event.recordsets[0].tipoBusqueda === "parqueVehicular" ||
        $event.recordsets[0].tipoBusqueda === "generico"
      ) {
        const val = $event.recordsets[0];
        this.router.navigate([
          "/sel-ficha-tecnica/" +
            val.idObjeto +
            "/" +
            val.idTipoObjeto +
            "/" +
            val.rfcEmpresa +
            "/" +
            val.idCliente +
            "/" +
            val.numeroContrato
        ]);
      }
    } else {
      this.Excepciones($event.error, 2);
    }
  }

  closeInput($event) {
    this.widhtInput = $event.close ? "85px" : "420px";
  }

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: "60%",
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: this.idUsuario,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: "header-component",
          mensajeExcepcion: "",
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (err) {}
  }
}
