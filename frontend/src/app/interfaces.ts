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
  check?: boolean;
}

export interface IColButtons {
  name?: string;
  icon?: string;
  onClick?: string;
  disabled: boolean;
  type: string;
}

export interface IExportExcel {
  enabled?: boolean;
  fileName?: string;

}

export interface ISummaries {
  column: string;
  summaryType: string;
  valueFormat?: string;
  displayFormat?: string;
  name?: string;
}

export interface IScroll {
  mode: string;

}

export interface Toolbar{
  location: string;
  widget: string;
  locateInMenu: string;
  options: object;
}