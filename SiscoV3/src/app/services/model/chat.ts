export interface Chat {
    idOrden: number;
    fecha: Date;
    mensaje: [{
        idUsuario: number;
        mensaje: string;
        fecha: Date;
    }];
}
