import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppState, selectContratoState, selectPermisosState } from '../../../../../store/app.states';
import { Store } from '@ngrx/store';
import { SeleccionarClase, SeleccionarContratoActual, SeleccionarContratos } from '../../../../../store/actions/contrato.actions';
import { Negocio } from '../../../../../models/negocio.model';
import { NgxIndexedDB } from 'ngx-indexed-db';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from 'src/app/models/footerConfiguracion.model';
import { Router } from '@angular/router';
import { SessionInitializer } from '../../../../../services/session-initializer';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer-menu',
  templateUrl: './footer-menu.component.html',
  styleUrls: ['./footer-menu.component.scss']
})
export class FooterMenuComponent implements OnInit, OnDestroy {
  /**
   * Pop up donde se muestra la selección de contratos
   */
  @ViewChild('contratosDropDown') contratosDropDown: NgbDropdown;
  /**
   * Contratos de la clase seleccionada
   */
  contratosClase: Array<any> = [];
  /**
   * Contratos filtrados
   */
  contratosFiltrados: Array<any> = [];
  /**
   * Estados
   */
  estados: Array<any> = [];
  /**
   * Estados
   */
  estadosFiltrando: Array<any> = [];
  /**
   * Clases a las que tiene acceso el usuario
   */
  clases: Array<any> = [];
  /**
   * Las gerencias asociadas al usuario
   */
  gerencias: Array<any> = [];
  /**
   * Base de datos indexada para actualizar la clase seleccionada por el usuario
   */
  indexedDB: NgxIndexedDB;
  /**
   * Todos los contratos disponibles
   */
  contratos: any;
  /**
   * Clase seleccionada por el usuario
   */
  claseSeleccionada: any;
  /**
   * Define si debe exluirse contratos con mantenimiento
   */
  private mantenimientoEstatus: ContratoMantenimientoEstatus = ContratoMantenimientoEstatus.todos;
  /**
   * Define si la selección de contratos se debe permitir de forma multiple
   */
  multicontrato = true;
  /**
   * Define el contrato seleccionado cuando es selección de un solo contrato
   */
  contratoActual: any = null;
  /**
   * Define si el DropDown de contratos se debe de poder cerrar automaticamente
   */
  autoClose: boolean | 'outside' = 'outside';
  /**
   * Define el estado seleccionado
   */
  estadosSeleccionados: Array<string> = [];
  /**
   * Define si está seleccionado el filtro por gerencia
   */
  gerenciasSeleccionadas: Array<any> = [];
  /**
   * Configuración del multiselect de estados
   */
  estadosSettings = {};
  /**
   * Configuración del multiselect de gerencias
   */
  gerenciasSettings = {};
  /**
   * Contrato buscado
   */
  contratoBuscado = '';
  /**
   * Bloquea el cierre del dropdown
   */
  bloquearCierre = false;
  /**
   * Bloquea la apertura del dropdown
   */
  bloquearApertura = false;
  /**
   * Define si el footer de mobil esta activado o no
   */
  togglemobilefooter = false;

  /**
   * Definicion de subscripciones para limitar la persistencia
   */
  negocioSubscribe: Subscription;
  configuracionSubscribe: Subscription;

  /*variablePrueba*/
  seleccionado = false;

  /**
   * Crea una nueva instancia del tipo FooterMenuComponent
   * @param store Es el almacen de comunicación entre modulos.
   * @param router Enrutador de angular
   * @author Arturo López Corona
   */
  constructor(
    private store: Store<AppState>,
    private router: Router,
    private httpClient: HttpClient,
    private sessionInitializer: SessionInitializer) {
  }

  /**
   * Se ejecuta una vez que el componente está listo inicializado.
   * @author Arturo López Corona
   */

  ngOnInit() {
    if (this.sessionInitializer && this.sessionInitializer.state) {
      this.indexedDB = new NgxIndexedDB('SISCO', 1);
      const getStateNegocio: Observable<any> = this.store.select(selectContratoState);
      const getStatePermisos: Observable<any> = this.store.select(selectPermisosState);
      // Se suscribe a negocio para obtener las clases y contratos de la clase a mostrar en el footer.
      this.ObtenerCambiosNegocio(getStateNegocio);
      // Se suscribe a permisos para obtener cambios en la configuración de los contratos.
      this.ObtenerCambiaConfiguracion(getStatePermisos);
    }
  }

  /**
   * Obtiene los cambios en las propiedades de negocio
   * @param store Store al cual se suscribirá para obtener los cambios
   * @author Arturo López Corona
   */
  private ObtenerCambiosNegocio(store: Observable<any>) {
    this.negocioSubscribe = store.subscribe(state => {
      this.contratos = state;
      this.contratosClase = state.contratosPorClase || [];
      this.clases = state.clases || [];
      this.estados = state.estados || [];
      if (state.gerencia && Array.isArray(state.gerencia)) {
        this.gerencias = state.gerencia;
      } else {
        this.gerencias = state.gerencia ? [state.gerencia] : [];
      }
      this.InicializarCombos();
      this.FiltraContratos();
      // En caso de que no haya una clase seleccionada se selecciona por default la primera obtenida.
      if (this.clases && this.clases.length > 0 && !this.claseSeleccionada) {
        this.RecuperaValores();
      }
    });
  }

  /**
   * Recupera los valores establecidos antes de recargar la página.
   */
  private RecuperaValores() {
    this.indexedDB.openDatabase(1).then(() => {
      this.indexedDB.getByKey('seguridad', 1).then(resultado => {
        const filteredClase = this.clases.filter(f => f === (resultado.idClase || ''));
        if (filteredClase.length > 0) {
          this.claseSeleccionada = filteredClase[0];
        } else {
          this.claseSeleccionada = this.clases[0];
        }

        this.SeleccionaContratosPorClase(this.claseSeleccionada);
        if (resultado.contratoActual) {
          const contrato = this.contratosFiltrados.filter(f => f.numeroContrato === resultado.contratoActual.numeroContrato);
          if (contrato.length > 0) {
            this.contratoActual = contrato[0];
          }
        }
        if (resultado.contratosSeleccionados) {
          resultado.contratosSeleccionados.forEach((el: any) => {
            const contrato = this.contratosFiltrados.filter(f => f.numeroContrato === el.numeroContrato);
            contrato.forEach(con => {
              con.seleccionadoCheck = true;
            })
            /*if (contrato.length > 0) {
              contrato[0].seleccionadoCheck = true;
            }*/
          });
        }

        this.store.dispatch(new SeleccionarContratos({ contratosSeleccionados: this.contratosFiltrados.filter(f => f.seleccionadoCheck) }));
        this.store.dispatch(new SeleccionarContratoActual({ contratoActual: this.contratoActual }));
      });
    });
  }

  /**
   * Obtiene los cambios en la configuración del popover de contratos
   * @param store Store al cual se suscribirá para obtener la configuración del popover de contratos
   * @author Arturo López Corona
   */
  private ObtenerCambiaConfiguracion(store: Observable<any>) {
    this.configuracionSubscribe = store.subscribe(state => {
      const footerConfiguracion: FooterConfiguracion = state.footer;
      if (footerConfiguracion) {
        this.mantenimientoEstatus = footerConfiguracion.mantenimientoEstatus;
        this.multicontrato = footerConfiguracion.multicontrato;
        this.FiltraContratos();
        this.bloquearApertura = footerConfiguracion.bloquearApertura;
        this.bloquearCierre = footerConfiguracion.bloquearCierre;
        if (footerConfiguracion.bloquearCierre) {
          this.autoClose = false;
        } else {
          this.autoClose = 'outside';
        }

        setTimeout(() => {
          if (footerConfiguracion.abrirModal) {
            this.AbrirPopover();
          }
        }, 500);
      }
    });
  }

  /**
   * Inicializa la configuración de los combos multiselect
   * @author Arturo López Corona
   */
  private InicializarCombos() {
    this.estadosSettings = {
      singleSelection: false,
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar...',
    };
    this.gerenciasSettings = {
      textField: 'nombre',
      idField: 'idGerencia',
      singleSelection: false,
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar...',
    };
  }

  /**
   * Cambia los contratos mostrados dependiendo si incluye o no mantenimiento
   * @param estatus Estatus de mantenimiento de los contratos a mostrar
   * @author Arturo López Corona
   */
  private CambiaContratosEstatusMantenimiento(contratos: Array<any>) {
    switch (this.mantenimientoEstatus) {
      case ContratoMantenimientoEstatus.todos:
        return contratos;
      case ContratoMantenimientoEstatus.conMantemiento:
        return contratos.filter(f => f.incluyeMantenimiento === true);
      case ContratoMantenimientoEstatus.sinMantenimiento:
        return contratos.filter(f => f.incluyeMantenimiento === false);
      default:
        return contratos;
    }
  }

  /**
   * Cambia los contratos de acuerdo a la selección de estado
   * @param contratos Contratos sobre los que va a filtrar
   * @author Arturo López Corona
   */
  private CambiaContratosEstados(contratos: Array<any>) {
    if (this.estadosSeleccionados && this.estadosSeleccionados.length > 0) {
      return contratos.filter(f => (f.zonas || []).some((s: any) =>
        this.estadosSeleccionados.some(es => es.toUpperCase() === (s.estado || '').toUpperCase())));
    }
    return contratos;
  }

  /**
   * Filtra los contratos de acuerdo a las selecciones actuales
   * @author Arturo López Corona
   */
  FiltraContratos() {

    if (this.gerenciasSeleccionadas && this.gerenciasSeleccionadas.length > 0) {
      //this.contratosFiltrados = [];
      this.gerenciasSeleccionadas.forEach(m => {
        const gerencia = this.gerencias.filter(f => f.idGerencia === m.idGerencia);
        if (gerencia.length > 0) {
          this.contratosFiltrados.forEach(cf => {
            if (cf.avatar) {
              this.httpClient.get(environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + cf.avatar)
                .subscribe((data: any) => {
                  cf.urlAvatar = data.recordsets[0].path;
                }, (error: any) => {
                  console.log(error);
                });
            }
          });
          this.contratosFiltrados.push.apply(this.contratosFiltrados, gerencia[0].contratos);
        }
      });
    } else {
      this.contratosFiltrados = [];
      this.contratosFiltrados = this.contratosClase;
      this.contratosFiltrados.forEach(cf => {
        if (cf.avatar) {
          this.httpClient.get(environment.fileServerUrl + 'documento/GetDocumentoById?idDocumento=' + cf.avatar)
            .subscribe((data: any) => {
              cf.urlAvatar = data.recordsets[0].path;
            }, (error: any) => {
              console.log(error);
            });
        }
      });
    }
    this.contratosFiltrados = this.CambiaContratosEstatusMantenimiento(this.contratosFiltrados);
    this.contratosFiltrados = this.CambiaContratosEstados(this.contratosFiltrados);
  }

  /**
   * Hace el cambio de contratos cuando hay un cambio de clase.
   * @param clase Es la clase por la cual se va a cambiar.
   * @author Arturo López Corona
   */
  SeleccionaContratosPorClase(clase) {
    this.claseSeleccionada = clase;
    const contratosPorClase = this.contratos.contratos.filter(c => c.idClase === clase);
    contratosPorClase.forEach(con => {
      con.seleccionadoCheck = true;
    })
    this.indexedDB.openDatabase(1).then(() => {
      this.indexedDB.getByKey('seguridad', 1).then(resultado => {
        if (resultado.idClase !== clase) {
          this.router.navigateByUrl(
            '/'
          );
          this.contratoActual = null;
          resultado.contratosSeleccionados = [];
          resultado.contratoActual = null;
          this.store.dispatch(new SeleccionarContratoActual({ contratoActual: null }));
        }
        this.indexedDB.update('seguridad', {
          ...resultado,
          idClase: clase
        });
      });
    });

    // CADA QUE SE CAMBIA DE CLASE SE SELECCIONAN LOS CONTRATOS POR CLASE, Y POR DEFA SE ASIGNAN TODOS COMO 'SELECCIONADOS'
    this.store.dispatch(new SeleccionarClase({
      claseActual: clase,
      contratosPorClase
    }));
    this.store.dispatch(new SeleccionarContratos({
      contratosSeleccionados: contratosPorClase
    }));
  }

  /**
   * Notifica a Negocio el cambio de contratos seleccionados.
   * @author Arturo López Corona
   */
  AceptarContratos() {
    // Evalua si es selección multiple o única de contrato
    if (this.multicontrato) {
      this.MultiContratoAceptar();
    } else {
      this.ContratoUnicoAceptar();
    }

    // Cierra el popover despues de que se acepta.
    this.contratosDropDown.close();
  }

  /**
   * Acepta y notifica con los contratos seleccionados
   * @author Arturo López Corona
   */
  private MultiContratoAceptar() {
    let contratosSeleccionados = this.contratosFiltrados.filter(f => f.seleccionadoCheck);
    let contratosFiltradosAux = []

    if (this.estadosSeleccionados.length === 0)
      contratosFiltradosAux = contratosSeleccionados;
    else {
      contratosSeleccionados.forEach(element => {
        contratosFiltradosAux.push({
          numeroContrato: element.numeroContrato,
          idCliente: element.idCliente,
          rfcEmpresa: element.rfcEmpresa,
          nombre: element.nombre,
          descripcion: element.descripcion,
          fechaInicio: element.fechaInicio,
          fechaFin: element.fechaFin,
          fechaRegistro: element.fechaRegistro,
          idClase: element.idClase,
          activo: element.activo,
          incluyeMantenimiento: element.incluyeMantenimiento,
          avatar: element.avatar,
          nombreCliente: element.nombreCliente,
          totalObjetos: element.totalObjetos,
          seleccionadoCheck: true,
          urlAvatar: element.urlAvatar,
          zonas: element.zonas.filter(s => this.estadosSeleccionados.some(es => es === s.estado))
        })

      });
    }

    if (contratosFiltradosAux.length > 0) {
      // Notifica el cambio en los contratos seleccionados.
      this.store.dispatch(new SeleccionarContratos({ contratosSeleccionados: contratosFiltradosAux }));
      this.indexedDB.openDatabase(1).then(() => {
        this.indexedDB.getByKey('seguridad', 1).then(resultado => {
          this.indexedDB.update('seguridad', {
            ...resultado,
            contratosFiltradosAux,
          });
        });
      });
    }
  }

  /**
   * Acepta y notifica el cambio en el contrato actual
   * @author Arturo López Corona
   */
  private ContratoUnicoAceptar() {
    if (this.contratoActual) {
      let contratosFiltradosAux: any = {}
      if (this.estadosSeleccionados.length === 0)
        contratosFiltradosAux = this.contratoActual;
      else {
        contratosFiltradosAux.numeroContrato = this.contratoActual.numeroContrato;
        contratosFiltradosAux.idCliente = this.contratoActual.idCliente;
        contratosFiltradosAux.rfcEmpresa = this.contratoActual.rfcEmpresa;
        contratosFiltradosAux.nombre = this.contratoActual.nombre;
        contratosFiltradosAux.descripcion = this.contratoActual.descripcion;
        contratosFiltradosAux.fechaInicio = this.contratoActual.fechaInicio;
        contratosFiltradosAux.fechaFin = this.contratoActual.fechaFin;
        contratosFiltradosAux.fechaRegistro = this.contratoActual.fechaRegistro;
        contratosFiltradosAux.idClase = this.contratoActual.idClase;
        contratosFiltradosAux.activo = this.contratoActual.activo;
        contratosFiltradosAux.incluyeMantenimiento = this.contratoActual.incluyeMantenimiento;
        contratosFiltradosAux.avatar = this.contratoActual.avatar;
        contratosFiltradosAux.nombreCliente = this.contratoActual.nombreCliente;
        contratosFiltradosAux.totalObjetos = this.contratoActual.totalObjetos;
        contratosFiltradosAux.seleccionadoCheck = true;
        contratosFiltradosAux.urlAvatar = this.contratoActual.urlAvatar;
        contratosFiltradosAux.zonas = this.contratoActual.zonas.filter(x => x.estado.includes(this.estadosSeleccionados));
      }


      // Notifica el cambio en el contrato actual.
      this.store.dispatch(new SeleccionarContratoActual({ contratoActual: contratosFiltradosAux }));
      this.indexedDB.openDatabase(1).then(() => {
        this.indexedDB.getByKey('seguridad', 1).then(resultado => {
          this.indexedDB.update('seguridad', {
            ...resultado,
            contratoActual: this.contratoActual
          });
        });
      });
    }
  }

  /**
   * Regresa la leyenda que debe de mostrar el Footer de acuerdo a los contratos, estaods y gerencias seleccionados.
   * @returns La leyenda a mostrar en el footer.
   * @author Arturo López Corona
   */
  LeyendaFooter() {
    const count = this.contratosFiltrados.filter(f => f.seleccionadoCheck).length;
    // Si no existe ningún contrato seleccionado o la clase seleccionada no tiene contratos
    // se regresa el mensaje por default
    const contratosLabel = this.LeyendaContratos();
    const estadosLabel = this.LeyendaEstados();
    const gerenciasLabel = this.LeyendaGerencias();

    return { label: `${estadosLabel} ${gerenciasLabel} ${contratosLabel}`, count };
  }

  /**
   * Leyenda mostrada de acuerdo a los contratos seleccionados
   * @returns Leyenda de los contratos seleccionados
   * @author Arturo López Corona
   */
  LeyendaContratos(): any {
    let label = '';
    let count = 0;
    if (this.contratosFiltrados && Array.isArray(this.contratosFiltrados)) {
      if (this.multicontrato) {
        const contratosSeleccionados = this.contratosFiltrados.filter(f => f.seleccionadoCheck);
        // Si hay solo un contrato seleccionado se muestra el nombre de dicho contrato
        if (contratosSeleccionados.length === 1) {
          label = contratosSeleccionados[0].nombre;
          count = 1;
        }

        // Si hay mas de un contrato seleccionado se muestra el número de contratos seleccionados.
        if (contratosSeleccionados.length > 1) {
          label = '';
          count = contratosSeleccionados.length;
        }
      } else {
        if (this.contratoActual) {
          label = this.contratoActual.nombre;
          count = 1;
        }
      }
    }

    return { label, count };
  }

  /**
   * Leyenda mostrada de acuerdo a los estados seleccionados
   * @returns Leyenda de los estados seleccionados
   * @author Arturo López Corona
   */
  LeyendaEstados(): any {
    let label = '';
    if (this.estadosSeleccionados.length > 0) {
      label = this.estadosSeleccionados.length === 1 ? this.estadosSeleccionados[0]
        : '';
    }
    return { label, count: this.estadosSeleccionados.length };
  }

  /**
   * Leyenda mostrada de acuerdo a las gerencias seleccionadas
   * @returns Leyenda de las gerencias seleccionadas
   * @author Arturo López Corona
   */
  LeyendaGerencias(): any {
    let label = '';
    if (this.gerenciasSeleccionadas.length > 0) {
      label = this.gerenciasSeleccionadas.length === 1 ? this.gerenciasSeleccionadas[0].nombre
        : '';
    }

    return { label, count: this.gerenciasSeleccionadas.length };
  }

  /**
   * Abre el popover cuando se dispara desde el Store su apertura.
   * @author Arturo López Corona
   */
  AbrirPopover() {
    this.contratosDropDown.open();
  }

  /**
   * Detecta cambios en la seleccion de contratos y revisa si debe estar deshabilitado el botón de Aceptar
   * @author Arturo López Corona
   */
  DeshabilitaAceptar() {
    if (!this.contratosFiltrados || !Array.isArray(this.contratosFiltrados)) {
      return true;
    }

    if (this.multicontrato) {
      return !this.contratosFiltrados.some((s: any) => s.seleccionadoCheck);
    } else {
      return !this.contratoActual;
    }
  }

  /**
   * Funcion para seleccionar todos los contratos, solo si es multicontrato 
   */
  Seleccionar() {
    this.contratosFiltrados.forEach(element => {
      element.seleccionadoCheck = !this.seleccionado;
    });

    this.seleccionado = !this.seleccionado;

  }

  /**
   * Detecta si el footer esta abierto o no y cambiara su estado al contrario
   * @author Ricardo David Hernández Ramírez
   */
  toggleMobileFooter() {
    this.togglemobilefooter = !this.togglemobilefooter;
  }

  ngOnDestroy() {
    this.configuracionSubscribe.unsubscribe();
    this.negocioSubscribe.unsubscribe();

  }
}
