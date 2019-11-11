export enum ContratoMantenimientoEstatus {
   /**
    * Muestra los contratos que incluyen mantenimiento
    */
   conMantemiento,
   /**
    * Muestra los contratos que no incluyen mantenimiento
    */
   sinMantenimiento,
   /**
    * Muestra todos los contratos
    */
   todos
}

export class FooterConfiguracion {
   /**
    * Define los contratos que se deben de mostrar
    */
   mantenimientoEstatus: ContratoMantenimientoEstatus;
   /**
    * Define si se debe de abrir el modal de contratos
    */
   abrirModal: boolean;
   /**
    * Define si la selección de contratos se hará de forma multiple
    */
   multicontrato: boolean;
   /**
    * Define si se va a deshabilitar el cierre del popover sin haber seleccionado contratos
    */
   bloquearCierre: boolean;
   /**
    * Define si se va a deshabilitar la apertura del dropdown
    */
   bloquearApertura: boolean;

   /**
    * Crea una nueva instancia de ContratosConfiguracion
    * @param mantenimientoEstatus Define si se deben mostrar o no contratos con mantenimiento
    * @param abrirModal Define si se debe de abrir el modal al momento
    * @param multicontrato Define si debe mostrarse multicontrato
    * @param bloquearCierre Define si se puede cerrar el popup sin haber elegido un contrato
    * @param bloquearApertura Define si se puede abrir el dropdown
    */
   constructor(
      mantenimientoEstatus: ContratoMantenimientoEstatus = ContratoMantenimientoEstatus.todos,
      abrirModal: boolean = false,
      multicontrato: boolean = false,
      bloquearCierre: boolean = false,
      bloquearApertura: boolean = false) {
      this.mantenimientoEstatus = mantenimientoEstatus;
      this.abrirModal = abrirModal;
      this.multicontrato = multicontrato;
      this.bloquearCierre = bloquearCierre;
      this.bloquearApertura = bloquearApertura;
   }
}
