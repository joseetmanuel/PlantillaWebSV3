import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { SiscoV3Service } from '../services/siscov3.service';
import { GpsUnidad, Coordenada } from '../models/gps';
import { AgmDirection } from 'agm-direction/src/modules/agm-direction.module';
import { AgmMap, LatLng, LatLngBounds, AgmMarker } from '@agm/core';
import { NouisliderComponent } from 'ng2-nouislider';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectContratoState } from '../store/app.states';
import { GPSService } from '../services/gps.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MapStyle } from 'src/assets/maps/mapstyle';
import * as moment from 'moment';
import { CambiaConfiguracionFooter } from '../store/actions/permisos.actions';
import { FooterConfiguracion, ContratoMantenimientoEstatus } from '../models/footerConfiguracion.model';
import { IBuscador } from '../interfaces';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material';
import { Alarms } from './enum/alarms.enum';
import { Negocio } from '../models/negocio.model';
import { Router } from '@angular/router';

@Component({
   selector: 'app-gps',
   templateUrl: './gps.component.html',
   styleUrls: ['./gps.component.scss']
})
export class GpsComponent implements OnInit {
   @ViewChild('busqueda') busquedaElement: ElementRef;
   // VARIABLES PARA NGRX
   getStateAutenticacion: Observable<any>;
   getStateNegocio: Observable<any>;

   // VARIABLES PARA SEGURIDAD
   claveModulo = 'app-gps-home';
   modulo: any = {};
   permisoControlRecorrido: boolean;

   /**
    * Mapa de google
    */
   map: any;
   coordenadas: Array<Coordenada> = [];
   mostrarFiltro: boolean = false;
   periodo
   stop: boolean;
   rutatheme: any;
   scrHeight: any;
   public styles: any[];
   /**
    * Vin a buscar
    */
   vinBuscado: string = '';
   /**
    * Contiene las unidades que se muestran en el mapa
    */
   unidades: any[] = [];
   /**
    * Contiene las unidades que se muestran en el mapa
    */
   unidadesFull: any[] = [];
   /**
    * Paradas en el trayecto a ser mostrada en el mapa
    */
   paradas: any[] = []
   /**
    * Latitud con la cual se centrará el mapa
    */
   latitud: number;
   /**
    * Longitud con la cual se centrará el mapa
    */
   longitud: number;
   /**
    * Zoom al cual se mostrará el mapa
    */
   zoom: number;
   /**
    * Origen de la ruta
    */
   origin: any;
   /**
    * Destino de la ruta
    */
   destination: any;
   /**
    * Oculta las direcciones del vehiculo
    */
   directionVisible: boolean;
   /**
    * Zoom por default
    */
   zoomDefault: number;
   /**
    * Identifica la posición en base al arreglo
    */
   unidadPosicion: number;
   /**
    * Muestra u oculta el carro en ruta
    */
   mostrarRuta: boolean;
   /**
    * Coordenada del carro en el mapa
    */
   carro: Coordenada;
   /**
    * Rango del slider
    */
   range: { start: number, end: number };
   /**
    * Arreglo de coordenadas del carro
    */
   ruta: Array<Coordenada>;
   /**
    * Define si se pausa el recorrido del carro en el mapa
    */
   pause: boolean;
   /**
    * Define si se está reproduciendo la ruta del vehículo
    */
   playing: boolean;
   /**
    * Define si ya se ajusto la pantalla
    */
   sized: boolean;
   /**
    * Define si ya se inicializó el mapa
    */
   mapStarted: boolean;

   contratos: any;
   public fechasForm: FormGroup;
   periodos: any[] = []
   openedWindow = 0;
   contratoActual: any;
   activo = true;
   formBuscar = new FormControl();
   datosFiltrados: any[] = [];
   // Url del file upload, se ocupa para obtener las fotos.
   urlFileServer = environment.fileServerUrl;
   spinner: boolean;
   todasAlarmasUnidad: any[] = [];
   dias: any;
   alarmasUnidad: any[] = [];
   alarmaSeleccionado: any;
   tiposDeAlarmasRuta: any[] = [];
   mostrarAlarmas: boolean;
   mostrarRecorrido: boolean;
   unidad: any;

   @HostListener('window:resize', ['$event'])
   getScreenSize(event?) {
      this.scrHeight = (window.innerHeight - 120) + 'px';
   }

   /**
    * Crea una nueva instancia de GpsComponent
    * @param siscoV3Service Servicio para la consulta de datos
    */
   constructor(private store: Store<AppState>,
      private siscoV3Service: SiscoV3Service,
      private router: Router,
      private snackBar: MatSnackBar,
      private gpsService: GPSService) {
      // this.unidades = new Array<GpsUnidad>();
      this.directionVisible = false;
      this.unidadPosicion = 0;
      this.carro = new Coordenada();
      this.range = { start: 0, end: 1 };
      this.mostrarRuta = false;
      this.pause = true;
      this.sized = false;
      this.mapStarted = false;
      this.playing = false;
      this.getStateAutenticacion = this.store.select(selectAuthState);
      this.getStateNegocio = this.store.select(selectContratoState);
      this.getScreenSize();

      this.fechasForm = new FormGroup({
         frmPeriodo: new FormControl('', Validators.required),
         dia: new FormControl('', Validators.required)
      });

      this.periodos = [
         'Última hora', 'Últimas 6 horas', 'Hoy', 'Ayer', 'Esta semana'
      ]
   }

   /**
    * Método que se ejecuta cuando el componente ha sido inicializado
    */
   ngOnInit(): void {
      this.getStateNegocio.subscribe((stateNegocio) => {
         this.getStateAutenticacion.subscribe((stateAutenticacion) => {
            this.contratoActual = stateNegocio.contratoActual;
            const contrat = stateNegocio.contratosSeleccionados;

            this.modulo = Negocio.GetModulo(this.claveModulo, stateAutenticacion.seguridad.permissions.modules, stateNegocio.claseActual);

            if (this.modulo.length === 0) {
               this.snackBar.open('El usuario no tiene permisos para acceder a este módulo.', 'OK', {
                  duration: 2000
               });
               this.router.navigate(['/home']);
               return;
            }

            this.modulo.camposClase.forEach(element => {
               if (element.nombre === 'controlRecorrido') {
                  this.permisoControlRecorrido = true;
               }
            });

            /**
                 * Si el contrato es obligatorio y no hay contrase seleccionado entonces abrir el
                 * footer por defecto, de lo contrario no se abre el footer.
                 */
            if (this.modulo.contratoObligatorio) {
               if (stateNegocio.contratoActual) {
                  this.ConfigurarFooter(false);
               } else {
                  this.ConfigurarFooter(true);
               }
            } else {
               this.ConfigurarFooter(false);
            }

            if (contrat) {
               this.contratos = '<contratos>';
               contrat.forEach((contrato) => {
                  this.contratos += '<contrato>';
                  this.contratos += '<rfcEmpresa>' + contrato.rfcEmpresa + '</rfcEmpresa>';
                  this.contratos += '<idCliente>' + contrato.idCliente + '</idCliente>';
                  this.contratos += '<numeroContrato>' + contrato.numeroContrato + '</numeroContrato>';
                  this.contratos += '</contrato>';
               });
               this.contratos += '</contratos>';
               this.obtenerUnidades(stateNegocio.claseActual);
               // setTimeout(() => { this.adaptaTamano(); }, 1200);
            }

         })
      })

      this.styles = MapStyle.lightblue[0].maptheme;
      this.rutatheme = MapStyle.lightblue[0].colors[0].ruta;

      this.ConfigurarBusqueda();
   }

   ConfigurarBusqueda() {
      this.formBuscar.valueChanges.subscribe(val => {
         // Si hay mas de 3 letras en el input, se ejecuta el buscador.
         if (val) {
            if (val.length > 3) {
               this.datosFiltrados = this.unidades.filter((unidad: any) => {
                  return unidad.VIN.toUpperCase().indexOf(val.toUpperCase()) > -1;
               });
            } else {
               this.datosFiltrados = [];
            }
         }
      });
   }

   AbreBusqueda() {
      this.activo = true;
      this.busquedaElement.nativeElement.focus();
   }

   /**
   * @description Se ejecuta al seleccionar un item de la lista
   * @author Andres Farias
   */
   changeOption(filtro: any) {
      this.mostrarFiltro = false;
      this.mostrarRecorrido = false;
      this.limpiaRuta();

      this.datosFiltrados = [];
      this.unidad = filtro;

      this.busquedaElement.nativeElement.value = '';

      const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(filtro.latitude, filtro.longitude));

      this.map.fitBounds(bounds);
      this.map.setZoom(this.map.zoom - 2);

      this.isInfoWindowOpen(filtro);
      this.openWindow(filtro);

   }

   mostrarControlRecorrido($event) {
      if (this.permisoControlRecorrido) {
         this.changeOption($event);
         this.mostrarFiltro = true;
         this.mostrarRecorrido = true;
      } else {
         this.snackBar.open('No tiene permisos para ver el recorrido.', 'Ok', {
            duration: 2000
         });
      }
   }

   /**
  * @description Configurar el modal de footer.
  * @param abrir Mandar la configuración del footer, en caso de que ya exista contratoActual no se abre el modal por defecto
  */
   ConfigurarFooter(abrir: boolean) {
      this.store.dispatch(new CambiaConfiguracionFooter(
         new FooterConfiguracion(
            ContratoMantenimientoEstatus.todos, abrir, true, false)));
   }

   /**
    * Método que se ejecuta cuando el mapa se ha cargado
    * @param event Mapa mostrado en home de gps
    */
   mapReady(event: any) {
      this.map = event;
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('ResetBtn'));
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('BusquedaUnidad'));
      this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById('ClearPath'));
      this.mapStarted = true;
      if (this.sized) {
         this.VerificaZoom();
      }
   }

   /**
    * Método que obtiene todas las unidades
    */
   obtenerUnidades(claseActual) {
      this.vinBuscado = '';
      this.mostrarFiltro = false;
      this.mostrarRuta = false;
      this.spinner = true;
      this.gpsService.getService(`vehiculo/GetVehiculosPorContrato?idClase=${claseActual}&contratos=${this.contratos}`).subscribe((t: any) => {
         let unidades = t.recordsets[0] ? t.recordsets[0] : [];
         unidades.forEach((unidad, index) => {
            if (!unidad.tipo) {
               unidades[index].tipo = 'sedan';
            }
         });
         this.unidades = unidades;
         this.spinner = false;
         this.VerificaZoom();
      }, err => {
         this.spinner = false;
         this.unidades = [];
      });
   }

   /**
    * Método que resetea la posición del mapa
    */
   resetMap() {
      this.limpiaRuta();
      this.latitud = 0;
      this.longitud = 0;
      this.zoom = 0;
      setTimeout(() => {
         this.latitud = 24;
         this.longitud = -101;
         this.zoom = this.zoomDefault || 6;
      }, 50);
   }

   /**
    * Método que obtiene la ruta tomada por el vehiculo
    * @param vin vin del vehiculo
    */
   obtieneRuta(inicio: string, fin: string) {
      this.limpiaRuta();
      let deviceId = this.unidad.deviceid;
      this.spinner = true;
      this.gpsService.getService(`vehiculo/GetRecorrido?deviceId=${deviceId}&from=${inicio}&to=${fin}`).subscribe((t: any) => {
         const arrayCoordenadas = t.recordsets[0] ? t.recordsets[0] : [];
         this.coordenadas = [];
         this.todasAlarmasUnidad = [];

         arrayCoordenadas.forEach((element: any, index) => {

            const cor: any = {};
            cor.latitud = element.latitude;
            cor.longitud = element.longitude;
            cor.direccion = element.address;
            cor.fecha = new Date(element.fixTime);
            cor.id = index + 1;
            let alarma = null;
            if (element.attributes) {
               if (element.attributes.alarm) {
                  alarma = {};
                  alarma.tipo = element.attributes.alarm;
                  alarma.fecha = element.fixTime;
                  alarma.descripcion = element.attributes.alarm;
                  alarma.ubicacion = cor;
                  alarma.motion = element.attributes.motion;
                  cor.alarma = alarma;
               }
            }
            this.coordenadas.push(cor);
         });

         if (this.coordenadas.length > 0) {
            this.dias = this.getDias(this.coordenadas);
            if (this.dias.length > 0) {
               this.fechasForm.controls.dia.setValue(this.dias[0].fecha);
               this.fechasForm.controls.frmPeriodo.setValue('Última hora');
               this.dias[0].seleccionado = true;
            }

            const coorPorDia: Coordenada[] = this.coordenadasPorDia(this.coordenadas, this.dias[0].fecha);
            if (coorPorDia) {
               this.cambiaDirecciones(coorPorDia);
            } else {
               this.mostrarRuta = true;
               this.snackBar.open('No hay GPS.', 'Ok', {
                  duration: 2000
               });
            }
         } else {
            // this.finalizarRecorrido();
            this.snackBar.open('No hay GPS para las fechas seleccionadas.', 'Ok', {
               duration: 2000
            });
         }
         this.spinner = false;
      }, err => {
         this.spinner = false;
         console.log(err)
      })
   }

   /**
    * Limpia la ruta trazada en el mapa
    */
   limpiaRuta() {
      this.origin = null;
      this.destination = null;
      this.paradas = [];
      this.directionVisible = false;
      this.mostrarRuta = false;
      this.mostrarAlarmas = false;
   }

   /**
     * Obtiene los dias de las coordenadas
     */
   getDias(coordenadas: Coordenada[]): any {
      return Array.from(new Set(coordenadas.map((coorde: Coordenada) => moment(coorde.fecha).format('YYYY-MM-DD'))))
         .map(fecha => {
            return { fecha, seleccionado: false };
         });
   }

   /**
     * @description Filtra las coordenadas de la fecha tomada del indice recibida
     * @param coordenadas Array de Coordendas entre el rango de fechas
     * @param fechaDia Fecha para filtrar la lista de coordenadas
     * @return Array de Coordenada de un dia para pintar en el mapa.
     */
   coordenadasPorDia(coordenadas: Array<Coordenada>, fechaDia: string): Coordenada[] {
      let coord: Coordenada[] = [];
      this.alarmasUnidad = [];
      coord = coordenadas.filter((c: Coordenada) => {
         const m = moment(c.fecha).format('YYYY-MM-DD');
         return m === fechaDia;
      });
      if (coord.length > 0) {
         return coord;
      }
      return null;
   }

   /**
     * Actualiza la ruta en base a la respuesta del servicio de direcciones
     * @param ruta Coordenadas de la ruta
     */
   cambiaRuta(ruta: Array<Coordenada>) {
      this.ruta = ruta;
      this.getTiposAlarma(ruta);
      this.range = { start: 0, end: ruta.length - 1 };
      this.carro = ruta[0];
      this.mostrarRuta = true;
   }

   /**
     * Crea lo necesario para consumir el servicio de direcciones
     * @param ruta Coordenadas de la ruta
     */
   cambiaDirecciones(ruta: Array<Coordenada>) {
      this.paradas = ruta;
      /**
       * Para centrar el mapa entre las coordenadas
       */
      const bounds = new google.maps.LatLngBounds();
      ruta.forEach((parada: Coordenada) => {
         bounds.extend(new google.maps.LatLng(parada.latitud, parada.longitud));
      });
      this.latitud = bounds.getCenter().lat();
      this.longitud = bounds.getCenter().lng();
      this.map.fitBounds(bounds);
      // this.zoom = 16;
      this.cambiaRuta(this.paradas);

      this.directionVisible = true;
   }

   /**
    * Método que adapta el tamaño del mapa
    */
   // adaptaTamano() {
   //    const elm: any = document.getElementsByClassName('app-main__inner')[0];
   //    const mapElm: any = document.getElementsByClassName('gpscontent')[0];
   //    if (elm && mapElm) {
   //       const height = `${elm.clientHeight - 30}px`;
   //       mapElm.style.height = height;
   //       setTimeout(() => {
   //          if (mapElm.style.height !== height) {
   //             this.adaptaTamano();
   //          } else {
   //             this.sized = true;
   //             if (this.mapStarted) {
   //                this.VerificaZoom();
   //             }
   //          }
   //       }, 200);
   //    } else {
   //       setTimeout(() => { this.adaptaTamano(); }, 100);
   //    }
   // }

   VerificaZoom() {
      this.coordenadas = [];
      this.dias = [];
      this.mostrarRecorrido = false;
      this.mostrarRuta = false;

      const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
      if (this.unidades.length > 0) {
         for (var mm of this.unidades) {
            bounds.extend(new google.maps.LatLng(mm.latitude, mm.longitude));
         }
         this.map.fitBounds(bounds);
         this.map.setZoom(this.map.zoom - 2);
      } else {
         this.obtieneZoomDefault();
      }
   }
   /**
    * Obtiene el zoom por default dependiendo del tamaño de la pantalla
    */
   obtieneZoomDefault() {
      this.map.fitBounds(new google.maps.LatLngBounds(new google.maps.LatLng(33, -118), new google.maps.LatLng(14, -86)));
      setTimeout(() => {
         this.zoomDefault = ++this.zoom;
      }, 100);
   }

   /**
    * Inicia el recorrido del vehículo
    */
   async playRuta() {
      this.pause = false;
      this.stop = false;
      if (!this.playing) {
         this.playing = true;
         for (
            this.unidadPosicion = this.unidadPosicion >= this.ruta.length ? this.unidadPosicion = 0 : this.unidadPosicion;
            this.unidadPosicion < this.ruta.length;
            this.unidadPosicion++
         ) {
            await this.cambiaPosicionAsync();
            if (this.pause || this.stop) {
               break;
            }
         }

         this.playing = false;
      }
   }

   /**
    * Cambia la posición del vehiculo en el mapa asincronamente
    */
   async cambiaPosicionAsync() {
      return new Promise<boolean>((resolve, reject) => {
         this.cambiaPosicion(this.unidadPosicion);
         setTimeout(() => {
            resolve(true);
         }, 100);
      });
   }

   /**
    * Cambia la posición del vehículo en el mapa
    */
   cambiaPosicion(event) {
      if (this.ruta) {
         this.carro = this.ruta[event] || this.carro;
         this.centrarCarro(this.carro);
      }
   }

   centrarCarro(carro: Coordenada) {
      this.latitud = carro.latitud;
      this.longitud = carro.longitud;
   }

   /**
    * Pausa el recorrido del carro
    */
   onPause() {
      this.pause = true;
      this.stop = false;
   }

   /**
    * Detiene el recorrido de la unidad
    */
   onStop() {
      this.playing = false;
      this.pause = false;
      this.stop = true;
      this.unidadPosicion = 0;
      if (this.ruta) {
         if (this.ruta.length > 0) {
            this.carro = this.ruta[0];
         }
      }
   }

   finalizarRecorrido() {
      this.onStop();
      this.limpiaRuta();
      this.coordenadas = [];
      this.dias = [];
      this.mostrarRecorrido = false;
      this.mostrarFiltro = false;
      this.mostrarRuta = false;
      this.openedWindow = null;

      this.VerificaZoom();
   }

   getTiposAlarma(coordenadas: Coordenada[]) {
      this.alarmaSeleccionado = null;
      const AlarmasModel = Alarms;
      this.tiposDeAlarmasRuta = [];

      let Alarmas = Array.from(new Set(coordenadas.map((coorde: Coordenada) => {
         if (coorde.alarma) {
            return coorde.alarma.tipo;
         }
      }))).map(tipo => tipo);

      Alarmas = Alarmas.filter((alarm) => alarm !== undefined && alarm !== null);

      this.tiposDeAlarmasRuta = Alarmas.map((alarm) => {
         const json = '{"tipo": "' + alarm + '", "descripcion": "' + AlarmasModel[alarm] + '"}';
         return JSON.parse(json);
      });

      this.mostrarAlarmas = this.tiposDeAlarmasRuta.length > 0 ? true : false;

   }

   /**
    * 
    * @param event Respuesta del servicio de direcciones para el armado de la ruta a seguir por el vehiculo
    */
   // onResponse(event: any) {
   //    if (event && event.routes) {
   //       const ruta = event.routes[0].overview_path.map((m: LatLng) => {
   //          var coord: Coordenada = {
   //             latitud: m.lat(),
   //             longitud: m.lng()
   //          }

   //          return coord;
   //       });
   //       this.cambiaRuta(ruta);
   //    }
   // }

   /**
    * Método que es ejecutado cada vez que la página se redimensiona
    * @param event Argumentos del evento
    */
   @HostListener('window:resize', ['$event'])
   onResize(event) {
      this.scrHeight = (window.innerHeight - 120) + 'px';
   }


   buscarRecorrido() {
      // this.mostrarRecorrido = true;
      let fechaInicio = new Date();
      let fechaFinal = new Date();
      this.openedWindow = null;

      switch (this.fechasForm.controls['frmPeriodo'].value) {
         case 'Última hora':
            fechaInicio.setUTCHours(fechaFinal.getUTCHours() - 1)
            break;
         case 'Últimas 6 horas':
            fechaInicio.setUTCHours(fechaFinal.getUTCHours() - 6)
            break;
         case 'Hoy':
            fechaInicio.setHours(0, 0, 0, 0)
            break;
         case 'Ayer':
            fechaInicio.setDate(fechaFinal.getDate() - 1)
            fechaInicio.setHours(0, 0, 0, 0)
            break;
         case 'Esta semana':
            fechaInicio.setDate(fechaFinal.getDate() - 7)
            break;
         default:
            fechaInicio.setUTCHours(fechaFinal.getUTCHours() - 1)
            break;
      }


      const fechaNormalDesde = moment(fechaInicio).format('YYYY-MM-DD');
      const fechaNormalHasta = moment(fechaFinal).format('YYYY-MM-DD');
      const horaDesde = moment(fechaInicio);
      const horaHasta = moment(fechaFinal);

      let inicio = moment(fechaNormalDesde + ' ' + horaDesde.hours() + ':' + horaDesde.minutes() + ':' + horaDesde.seconds())
         .toISOString();
      let final = moment(fechaNormalHasta + ' ' + horaHasta.hours() + ':' + horaHasta.minutes() + ':' + horaHasta.seconds())
         .toISOString();

      if (inicio && final) {
         this.limpiaRuta();
         this.obtieneRuta(inicio, final);
      }

   }

   openWindow(vehiculo: any) {
      this.openedWindow = vehiculo.deviceid;
   }

   isInfoWindowOpen(vehiculo) {
      return this.openedWindow === vehiculo.deviceid; // alternative: check if id is in array
   }

   /**
     * se ejecuta cuando se cambia de dia de la lista de dias.
     * @param $event Dia seleccionada de la lista de dias entre las fechas seleccionadas
     */
   cambioRecorridoPorDia($event) {
      this.limpiaRuta();
      const diaFound: any = this.dias.find((dia: any) => {
         return dia.fecha === $event;
      });

      if (diaFound) {
         const coordenadaPorDia: Coordenada[] = this.coordenadasPorDia(this.coordenadas, diaFound.fecha);
         if (coordenadaPorDia) {
            this.cambiaDirecciones(coordenadaPorDia);
         } else {
            this.mostrarRuta = true;
            this.mostrarAlarmas = false;
            this.snackBar.open('No hay GPS.', 'Ok', {
               duration: 2000
            });
         }
      }
   }

   /**
     * Avanza el carro hasta el final del recorrido.
     */
   avanzaFinal() {
      this.unidadPosicion = this.paradas.length;
      this.cambiaPosicion(this.unidadPosicion);
   }

   /**
    * Funcion para regresar al inicio del recorrido del carro.
    */
   regresaInicio() {
      this.unidadPosicion = 1;
      this.cambiaPosicion(this.unidadPosicion);
   }

   /**
     * Motodo que avanza el carro de 10 en 10 de la ruta
     */
   avanzarParadas() {
      if (this.paradas.length > (this.unidadPosicion + 10)) {
         this.unidadPosicion += 10;
      } else {
         this.unidadPosicion = this.paradas.length;
      }
      this.cambiaPosicion(this.unidadPosicion);
   }

   /**
    * Metodo para regresar 10 paradas el carro del recorrido
    */
   regresarParadas() {
      if (this.unidadPosicion > 0) {
         if (1 < (this.unidadPosicion - 10)) {
            this.unidadPosicion -= 10;
         } else {
            this.unidadPosicion = 1;
         }
         this.cambiaPosicion(this.unidadPosicion);
      } else {
         this.unidadPosicion = 1;
         this.cambiaPosicion(this.unidadPosicion);
      }
   }

   detalle($event) {
      console.log($event);
   }

   regresaParque() {
      this.openedWindow = null;
      this.finalizarRecorrido();
   }
}
