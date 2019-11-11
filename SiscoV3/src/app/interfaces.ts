export interface IGridOptions {
  paginacion?: number;
  pageSize?: any;
}

export interface IDetail {
  detail?: boolean;
}

export interface IColumnHiding {
  hide?: boolean;
}

export interface ICheckbox {
  checkboxmode?: string;
}

export interface IEditing {
  allowupdate?: boolean;
  mode?: string;
}

export interface IColumnchooser {
  columnchooser?: boolean;
}

export interface ISearchPanel {
  visible?: boolean;
  width?: number;
  placeholder?: string;
  filterRow?: boolean;
  filterHeader?: boolean;
}
export interface IColumns {
  dataField?: string;
  caption?: string;
  dataType?: TiposdeDato;
  format?: TiposdeFormato;
  width?: number;
  fixed?: boolean;
  type?: string;
  name?: string;
  groupIndex?: string;
  cellTemplate?: string;
  hiddingPriority?: string;
  allowEditing?: boolean;
  validationRules?: any;
}

export interface IExportExcel {
  enabled?: boolean;
  fileName?: string;
}

export interface IScroll {
  mode: string;

}

export interface Toolbar {
  location: string;
  widget: string;
  locateInMenu: string;
  options?: object;
  visible: boolean;
  name?: string;
  name2?: string;
  selected?: object;
}

export interface Color {
  filas?: boolean;
  columnas?: boolean;
  alternar?: boolean;
  color?: string;
}

export interface IFileUpload {
  path: string;
  idUsuario: number;
  idAplicacionSeguridad: number;
  idModuloSeguridad: number;
  multiple: boolean;
  soloProcesar?: boolean;
  extension: any;
  titulo?: string;
  descripcion?: string;
  previsualizacion?: boolean;
  idDocumento?: number;
  tipodecarga?: string;
  tipoDocumento?: string;
}

// Interfaces para carga Masiva

export interface IColumn {
  nombre: string,
  tipo: string,
  longitud?: Number,
  obligatorio: boolean,
  descripcion: string,
  disabled?: boolean
}

export interface IProcess {
  active: boolean,
  finish: boolean,
  enabled: boolean
}

export interface IColumnExcel {
  descripcion: string,
  seleccionado: boolean,
  indexColumnaTemplate: number,
  indexExcel: number
}

export interface IRowsExcel {
  error: string,
  value: any,
  fila: number,
  columnExcel: number
}

export enum TypeData {
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
  FLOAT = 'Float',
  DATE = 'Date',
  COLOR = 'Color'
}

export interface IFileUploadLabels {
  btnSubmit: string;
}

export interface IBreadCrumb {
  label: string,
  url: string
}

export enum TiposdeDato {
  string = 'string',
  number = 'number',
  date = 'date',
  boolean = 'boolean',
  object = 'object',
  datetime = 'datetime'
}


export enum TiposdeFormato {
  billions = 'billions',
  currency = 'currency',
  day = 'day',
  decimal = 'decimal',
  exponential = 'exponential',
  fixedPoint = 'fixedPoint',
  largeNumber = 'largerNumber',
  longDate = 'longDate',
  longTime = 'longTime',
  millions = 'millions',
  millisecond = 'millisecond',
  month = 'month',
  monthAndDay = 'monthAndDay',
  monthAndYear = 'monthAndYear',
  percent = 'percent',
  quarter = 'quarter',
  quarterAndYear = 'quarterAndYear',
  shortDate = 'shortDate',
  shortTime = 'shortTime',
  thousands = 'thousands',
  trillions = 'trillions',
  year = 'year',
  dayOfWeek = 'dayOfWeek',
  hour = 'hour',
  longDateLongTime = 'longDateLongTime',
  minute = 'minute',
  second = 'second',
  shortDateShortTime = 'shortDateShortTime',
  dmy = 'dd/MM/yyyy',
  dmyt = 'dd/MM/yyyy HH:mm:ss',
  moneda = '$#,##0.00'
}

export enum Template {
  foto = 'foto',
  pdf = 'pdf',
  excel = 'excel',
  word = 'word',
  powerpoint = 'powerpoint',
  txt = 'txt',
  xml = 'xml',
  color = 'color'
}

export interface IObjeto {
  idClase: string;
  idObjeto: number;
  numeroContrato: string;
  idCliente: number;
  rfcEmpresa: string;
  idTipoObjeto: number;
}

export enum TipoBusqueda {
  parqueVehicular = 'Parque Vehicular',
  usuario = 'Usuarios',
  proveedor = 'Proveedor',
  general = 'General',
  operador = 'Operador',
  objeto = 'Objeto'
}

export interface IBuscador {
  parametros: any;
  tipoBusqueda: string;
  isActive: boolean;
}

export interface IGridGeneralConfiguration {
  GridOptions: any;
  ExportExcel: any;
  ColumnHiding: any;
  Checkbox: any;
  Editing: any;
  Columnchooser: any;
  SearchPanel: any;
  Scroll: any;
  Color: Color;
  Detail: IDetail;
  Columns: IColumns[];
  ToolBox: Toolbar[];
  ToolbarDetail: Toolbar[];
}

export interface IViewer {
  idDocumento: number;
  tipo: IViewertipo;
  descarga: boolean;
  size: IViewersize;
  idUsuario?: number;
  url?: string;
  urlNI?: string;
}

export enum IViewertipo {
  'avatar',
  'imagen',
  'documento',
  'carrusel',
  'gridimagenes',
  'gridavatar'
}

export enum IViewersize {
  lg = 'foto-avatar',
  md = 'foto-avatar-m',
  sm = 'foto-avatar-s',
  xs = 'foto-avatar-xs'
}

export enum EstatusTarea {
  PENDIENTE = 1,
  ENPROGRESO = 2,
  TERMINADA = 3,
  RECHAZADA = 4
}

export enum TipoAccionCargaMasiva {
  CONCATENAR = 'Concatenar',
  ACTUALIZAR = 'Actualizar',
  REEMPLAZAR = 'Reemplazar'
}

export enum TareaPredefinida {
  MANUAL = 210,
  SOLICITUD = 190
}

export enum AccionNotificacion {
  INSERCION = 1,
  ACTUALIZACION = 2,
  ELIMINACION = 3,
  MANUAL = 4,
  CHAT = 5,
  APROBACION = 6,
  ENTREGA = 7,
  TERMINOTRABAJO = 8,
  PROCESARCOMPRA = 9,
  SINTALLER = 10,
  PLANACCIONAPROBACION = 11,
  PLANACCIONENTREGA = 12,
  PLANACCIONTERMINOTRABAJO = 13,
  PLANACCIONPROCESARCOMPRA = 14,
  PLANACCIONSINTALLER = 15,
  PACITACONFIRMADA = 16,
  PAENTALLER = 17,
  PAENPROCESO = 18,
  PAPROVISIONADA = 19,
  PAPROVISIONAPROBADA = 20
}

export enum GerenciaNotificacion {
  COBRANZA = 1
}