export class Telemetria {
    /**
     * Kilometrake de la unidad
     */
    kilometraje: number | null;
    /**
     * Temperatura de la unidad
     */
    temperatura: number | null;
    /**
     * Rpm de la unidad
     */
    rpm: number | null;
    /**
     * Voltaje de la unidad
     */
    voltaje: number | null;
 
    /**
     * Crea una nueva instancia de Telemetria
     */
    constructor() {
       this.kilometraje = null;
       this.temperatura = null;
       this.rpm = null;
       this.voltaje = null;
    }
 }
