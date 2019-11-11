export interface IProveedor {
    rfcProveedor: string;
    razonSocial: string;
    nombreComercial: string;
    idTipoPersona: number;
    tipoPersona?: string;
    idClase: number;
    clase?: string;
    personaContacto: string;
    telefono: string;
    email: string;
    idPais: string;
    pais?: string;
    idEstado: string;
    estado?: string;
    idMunicipio: string;
    municipio: string;
    codigoPostal: number;
    idTipoAsentamiento: string;
    asentamiento: string;
    idTipoVialidad: number;
    vialidad: string;
    numeroExterior?: string;
    numeroInterior?: string;
    idUsuario: number;
    activo?: number;
    lat?: number;
    lng?: number;
    incluyeMantenimiento?: number;
    contrato?: string;
    logo?: number;
    proveedorInterno: boolean;
    disponibilidad : number;
}

export interface IProveedorEntidadDireccion {
    idProveedorEntidadDireccion: number;
    idProveedorEntidad: number;
    rfcProveedor: string;
    idTipoDireccion: number;
    idPais: number;
    pais: string;
    idEstado: number;
    estado: string;
    idMunicipio: number;
    municipio: string;
    codigoPostal: string;
    idTipoAsentamiento: number;
    tipoAsentamiento: string;
    asentamiento: string;
    idTipoVialidad: number;
    tipoVialidad: string;
    vialidad: string;
    numeroExterior?: string;
    numeroInterior?: string;
    lat?: number;
    lng?: number;
}