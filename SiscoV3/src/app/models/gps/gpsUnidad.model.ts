import { AlarmaUnidad, Coordenada, Telemetria, AlertaConduccion } from ".";

export class GpsUnidad {
   /**
    * Vin de la unidad
    */
   vin: string | null;
   /**
    * Ubicación de la unidad
    */
   ubicacion: Coordenada | null;
   /**
    * Telemetría de la unidad
    */
   telemetria: Telemetria | null;
   /**
    * Estado del Gps de la unidad
    */
   estado: boolean | null;
   /**
    * Fecha de reporte de la unidad
    */
   fechaReporte: Date | null;
   /**
    * Comportemiento del conductor de la unidad
    */
   comportamientoConductor: Array<AlertaConduccion> | null;
   /**
    * Alarmas de la unidad
    */
   alarmas: Array<AlarmaUnidad> | null;
   /**
    * idCliente
    */
   idCliente: number | null;
   /**
    * numeroContrato
    */
   numeroContrato: string | null;
   /**
    * rfcEmpresa
    */
   rfcEmpresa: string | null;
   /**
    * Crea una nueva instancia de GpsUnidad
    */
   constructor() {
      this.vin = null;
      this.ubicacion = null;
      this.telemetria = null;
      this.estado = null;
      this.fechaReporte = null;
      this.comportamientoConductor = null;
      this.alarmas = null;
      this.idCliente = null;
      this.numeroContrato = null;
      this.rfcEmpresa = null
   }
}