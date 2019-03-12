// ************************** PARAMETROS QUE RECIBIRA **************************

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
