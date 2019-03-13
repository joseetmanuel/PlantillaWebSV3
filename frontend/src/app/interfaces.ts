export interface IGridOptions {
  paginacion?: number;
  pageSize?: any;
}

export interface ISearchPanel {
  visible: boolean;
  width?: number;
  placeholder?: string;
  filterRow?: boolean;
}
export interface IColumns {
  dataField?: string;
  caption?: string;
  dataType?: string;
  width?: number;
  fixed?: boolean;
  type?: string;
  name?: string;
  groupIndex?: string;
  cellTemplate?: string;
  hiddingPriority?: string;
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
  options: object;
  visible: boolean;
  name?: string;
  name2?: string;
}

export interface IFileUpload {
  path: string;
  idUsuario: number;
  idAplicacionSeguridad: number;
  idModuloSeguridad: number;
  multiple: boolean;
  soloProcesar?: boolean;
  extension: any ;
  titulo?: string;
  descripcion?: string;
}