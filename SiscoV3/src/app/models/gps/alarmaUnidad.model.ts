import { Coordenada } from ".";

export class AlarmaUnidad {
   /**
    * Tipo de alarma
    */
   tipo: string | null;
   /**
    * Fecha de la alarma
    */
   fecha: Date | null;
   /**
    * Ubicación de la alarma
    */
   ubicacion: Coordenada | null;
   /**
    * Descripcion del alarma
    */
   descripcion: string;
   /**
    * si el auto está en movimiento
    */
   motion: number;
   /**
    * Crea una nueva instancia de Coordinate
    */

   constructor() {
      this.tipo = null;
      this.fecha = null;
      this.ubicacion = null;
   }
}