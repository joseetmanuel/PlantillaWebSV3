import { NgNotFoundTemplateDirective } from '@ng-select/ng-select/ng-select/ng-templates.directive';
import { AlarmaUnidad } from './alarmaUnidad.model';

export class Coordenada {
   /**
    * Latitud de la coordenada
    */
   latitud: number;
   /**
    * Longitud de la coordenada
    */
   longitud: number;

   /**
    * Fecha de las coordenadas
    */
   fecha: Date;

   /**
    * Identificador de la coordenada.
    */
   id: number;

   /**
    * Direccion de la coordenada
    */
   direccion: string;

   /**
    * Si dentro de la coordenada hay alarmas
    */
   alarma: AlarmaUnidad;

   /**
    * Guarda el estatus del alarma, para saber que icono mostrar
    */
   estatus: string;

   /**
    * Guarda el estado de conexion
    */
   desconexion: number;

   /**
    * icono del marker
    */
   icon: string;

   /**
    * Crea una nueva instancia de Coordinate
    * @param latitude Latitud de la coordenada
    * @param longitude Longitud de la coordenada
    */
   constructor() {
      this.latitud = null;
      this.longitud = null;
      this.direccion = null;
   }
}
