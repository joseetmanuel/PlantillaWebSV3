import { Injectable } from '@angular/core';
import { isArray } from 'util';

@Injectable()
export class Negocio {
    /**
     * @description     Función para obtener las clases a las que tiene acceso el usuario.
     * @param data      Arreglo que contiene el Nodo 'modules' de seguridad V2
     * @returns         Array con las clases a las que puede acceder el usuario
     * @author          Alan Rosales Chávez
     */
    public static GetClases(data: any) {
        const clases = data.map((x: any) => x.idClase);
        return clases.filter((item, i, ar) => ar.indexOf(item) === i);
    }
    /**
     * @description     Función para obtener los contratos a los que tiene acceso el usuario.
     * @param data      Arreglo que contiene el Nodo 'contratos' devueltos por el backend
     * @returns         Array con los contratos a las que puede acceder el usuario
     * @author          Alan Rosales Chávez
     */
    public static GetContratos(data: any) {
        const contrato: any = [];
        data.forEach((element: any) => {
            if (contrato.find((x: any) => x.numeroContrato === element.numeroContrato)) {
                contrato.find((x: any) => x.numeroContrato === element.numeroContrato).zonas.push(
                    {
                        idContratoNnivel: element.idContratoNivel,
                        nivelDescripcion: element.nivelDescripcion,
                        idContratoZona: element.idContratoZona,
                        zonaDescripcion: element.zonaDescripcion,
                        idPadre: element.idPadre,
                        estado: element.estado
                    }
                );
            } else {
                contrato.push(
                    {
                        numeroContrato: element.numeroContrato,
                        idCliente: element.idCliente,
                        rfcEmpresa: element.rfcEmpresa,
                        idClase: element.idClase,
                        nombre: element.nombreContrato,
                        descripcion: element.descripcionContrato,
                        fechaInicio: element.fechaInicioContrato,
                        fechaFin: element.fechaFinContrato,
                        fechaRegistro: element.fechaRegistroContrato,
                        incluyeMantenimiento: element.incluyeMantenimiento,
                        activo: element.activoContrato,
                        avatar: element.avatar,
                        nombreCliente: element.nombreCliente,
                        totalObjetos: element.totalObjetos,
                        zonas: [
                            {
                                idContratoNnivel: element.idContratoNivel,
                                nivelDescripcion: element.nivelDescripcion,
                                idContratoZona: element.idContratoZona,
                                zonaDescripcion: element.zonaDescripcion,
                                idPadre: element.idPadre,
                                estado: element.estado
                            }

                        ]
                    });
            }
        });
        return contrato;
    }
    /**
     * @description     Función para filtrar los contratos por clase
     * @param data      Arreglo que contiene el Nodo 'contratos' devueltos por el backend
     * @param clase     Valor de la clase para filtrar contratos
     * @returns         Array con los contratos a las que puede acceder el usuario filtrados por la clase seleccionada
     * @author          Alan Rosales Chávez
     */
    public static GetContratosByClase(data: any, clase: string) {
        const contrato: any = [];
        data.filter(x => x.idClase === clase).forEach(element => {
            if (!contrato.find(x => x.numeroContrato === element.numeroContrato)) {
                contrato.push(
                    {
                        numeroContrato: element.numeroContrato,
                        idCliente: element.idCliente,
                        rfcEmpresa: element.rfcEmpresa,
                        idClase: element.idClase,
                        nombre: element.nombre,
                        descripcion: element.descripcion,
                        fechaInicio: element.fechaInicio,
                        fechaFin: element.fechaFin,
                        incluyeMantenimiento: element.incluyeMantenimiento,
                        activo: element.activo,
                        avatar: element.avatar,
                        nombreCliente: element.nombreCliente,
                        totalObjetos: element.totalObjetos,
                        zonas: element.zonas
                    });
            }
        });
        return contrato;
    }
    /**
     * @description         Función para obtener el nodo Modulo de Seguridad V2
     * @param claveModulo   Key del módulo
     * @param modulos       Nodo 'modules' de seguridad V2
     * @param idClase       Id de la clase que deseamos filtrar
     * @author              Alan Rosales Chávez
     */
    public static GetModulo(claveModulo: string, modulos: any, idClase: string) {
        const modulo: any = modulos.find((mod: any) => mod.key === claveModulo);
        if (!modulo) {
            return [];
        }
        modulo.camposClase = [];
        const m = modulos.find((mod: any) => mod.key === claveModulo);
        // POR CADA OBJETO BUSCAMOS DENTRO DE CAPTIO POR CLASE
        m.objects.forEach(obj => {
            if (obj.caption && obj.caption !== '') {
                const aux = JSON.parse(obj.caption).clase.find(x => x.idClase === idClase);
                if (aux) {
                    modulo.camposClase.push({
                        nombre: obj.name,
                        label: aux.label,
                        path: aux.path
                    });
                } else {
                    modulo.camposClase.push({
                        nombre: obj.name,
                        label: '',
                        path: ''
                    });
                }
            } else {
                modulo.camposClase.push({
                    nombre: obj.name,
                    label: '',
                    path: ''
                });
            }
        });
        // AGREGAMOS PROPIEDADES MULTICONTRATO Y CONTRATOOBLIGATORIO
        modulo.multicontrato = JSON.parse(modulos.find((mod: any) => mod.key === claveModulo).caption).multicontrato;
        modulo.contratoObligatorio = JSON.parse(modulos.find((mod: any) => mod.key === claveModulo).caption).contratoObligatorio;
        modulo.breadcrumb = JSON.parse(modulos.find((mod: any) => mod.key === claveModulo).caption).breadcrumb;
        return modulo;
    }
    /**
     * @description         Función para obtener las gerencias a los que tiene acceso el usuario.
     * @param data          Arreglo que contiene el Nodo 'gerencia' devueltos por el backend
     * @author              Alan Rosales Chávez
     */
    public static GetGerencia(data: any) {
        const gerencias: any = [];
        data.forEach(g => {
            gerencias.push({
                idGerencia: g.idGerencia,
                nombre: g.nombre,
                descripcion: g.descripcion,
                contratos: this.GetContratosByGerencia(data, g.idGerencia)
            });
        });
        return gerencias;
    }
    /**
     * @description         Función para obtener los estados a los que tiene acceso el usuario.
     * @param data          Arreglo que contiene el Nodo 'estados' devueltos por el backend
     * @author              Alan Rosales Chávez
     */
    public static GetEstados(data: any) {
        return data.map((x: any) => x.estado);
    }

    /**
     * @description     Función para filtrar los contratos por gerencia
     * @param data      Arreglo que contiene el Nodo 'contratos' devueltos por el backend
     * @param gerencia  Id de la Gerencia
     * @returns         Array con los contratos a las que puede acceder el usuario filtrados por la clase seleccionada
     * @author          Alan Rosales Chávez
     */
    public static GetContratosByGerencia(data: any, gerencia: string) {
        const contrato: any = [];
        data.filter(x => x.idGerencia === gerencia).forEach(element => {
            if (!contrato.find(x => x.numeroContrato === element.numeroContrato)) {
                contrato.push(
                    {
                        numeroContrato: element.numeroContrato,
                        idCliente: element.idCliente,
                        rfcEmpresa: element.rfcEmpresa,
                        idClase: element.idClase,
                        nombre: element.nombre,
                        descripcion: element.descripcion,
                        fechaInicio: element.fechaInicio,
                        fechaFin: element.fechaFin,
                        incluyeMantenimiento: element.incluyeMantenimiento,
                        activo: element.activo,
                        zonas: element.zonas
                    });
            }
        });
        return contrato;
    }

    /**
     * Metodo para generar la configuracion adecuada del BreadcrumbsComponent.
     * @param breadcrumbs Array del breadcrumb configurada desde la base de datos.
     * @param idClase La configuracion final de BreadcrumbsComponent se obtiene mediante el id de la clase.
     * @param parametros Lista de parametros que se agregarán en las url.
     * @returns Array de la configuracion final.
     * @author Andres Farias
     */
    public static GetConfiguracionBreadCrumb(breadcrumbs: any, idClase: string, parametros?: any[]): any[] {
        const breadcrumb = breadcrumbs.route.map((b: any) => {
            if (isArray(b.label)) {
                const labelFound = b.label.find((label) => {
                    return label.idClase === idClase;
                });
                labelFound.url = b.url;
                return labelFound;
            } else {
                return b;
            }
        });
        breadcrumb.push({ label: 'Logo', url: breadcrumbs.logo.find((x: any) => x.idClase == idClase).path });
        if (parametros) {
            // Reemplazamos los parametros de la url con los valores recibidos en la variable parametros.
            parametros.forEach((parametro) => {
                for (const key in parametro) {
                    if (parametro.hasOwnProperty(key)) {
                        const clave = '{' + key + '}';
                        breadcrumb.forEach((bread, index) => {
                            const breadcrumbConParametros = bread.url.split('/');
                            breadcrumbConParametros.forEach((elem, indexParametros) => {
                                if (elem === clave) {
                                    breadcrumbConParametros[indexParametros] = parametro[key];
                                }
                            });
                            breadcrumb[index].url = breadcrumbConParametros.join('/');
                        });
                    }
                }
            });
            return breadcrumb;
        } else {
            return breadcrumb;
        }

    }
}
