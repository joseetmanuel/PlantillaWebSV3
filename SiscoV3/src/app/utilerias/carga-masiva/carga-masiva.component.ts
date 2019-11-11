import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import {
    IColumn, IProcess, IColumnExcel, IRowsExcel, TypeData,
    IGridOptions, IColumns, IExportExcel, ISearchPanel, IScroll, Toolbar, IColumnHiding,
    ICheckbox, IEditing, IColumnchooser, TiposdeDato, TiposdeFormato, Template,
    IFileUpload, IFileUploadLabels, TipoAccionCargaMasiva
} from '../../interfaces';
import { ExcelService } from './excel.service';
import { CargaMasivaService } from './carga-masiva.service';
import { template } from '@angular/core/src/render3';

import { FuncionColor } from '../clases/funcionColor';


@Component({
    selector: 'carga-masiva',
    templateUrl: './carga-masiva.component.html',
    styleUrls: ['./carga-masiva.component.scss'],
    providers: [CargaMasivaService]
})
export class CargaMasivaComponent implements OnInit {
    isLinear = false;
    public btnNextEnable: boolean;
    public indexActive: number = 0;
    public filename: string;
    message: string;
    private arrayContentFile: any[] = [];
    columnasExcel: IColumnExcel[] = [];
    Editing: IEditing;
    arrayRowsFinal = [];
    arrayRowsFinalErrors = [];
    arrayProcesado = [];
    arrayProcesadoErrors = [];
    arrayProcesadoColumns = [];
    formDinamico = []
    objectKeys = Object.keys;
    uploadFile = false;
    stgNext = 'Siguiente';
    msgErrorId = '';

    datosevent;
    title = 'components';
    gridOptions: IGridOptions;
    columns: IColumns[];
    exportExcel: IExportExcel;
    searchPanel: ISearchPanel;
    scroll: IScroll;
    evento: string;
    toolbar: Toolbar[];
    data: [];
    spinner = false;


    public process: IProcess[] = [{
        active: true,
        finish: false,
        enabled: true
    }, {
        active: false,
        finish: false,
        enabled: false
    }, {
        active: false,
        finish: false,
        enabled: false
    }, {
        active: false,
        finish: false,
        enabled: false
    }];

    private headerExcel: any[] = [];

    // tslint:disable-next-line: no-input-rename
    @Input('columnas') columnasTemplate: IColumn[];
    // tslint:disable-next-line: no-input-rename
    @Input('parametrosSP') parametrosSP: IColumn[];
    // tslint:disable-next-line: no-input-rename
    @Input('sp') sp: string;
    // tslint:disable-next-line: no-input-rename
    @Input('idClase') idClase: string;
    // tslint:disable-next-line: no-input-rename
    @Input('urlApi') urlApi: string;
    // tslint:disable-next-line: no-input-rename
    @Input('acciones') acciones: Array<any> = null;
    // tslint:disable-next-line: no-output-rename
    @Output('response') reponse = new EventEmitter<{}>();


    IUploadFile: IFileUpload;
    IFileUploadLabels: IFileUploadLabels = {
        btnSubmit: 'Cargar'
    };
    reload: boolean;
    Checkbox: { checkboxmode: string; };
    msgErrorServidor = '';
    idTipoAccion: string;

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private codigoColor: FuncionColor,
                private excelService: ExcelService, private _service: CargaMasivaService) {
        iconRegistry.addSvgIcon(
            'download',
            sanitizer.bypassSecurityTrustResourceUrl('assets/cloud_download.svg'));

    }
    /**
     * Obtener un objetos json de las columnas de template.
     * @param columnas las columnas del template para hacer el binding con el excel
     */
    parseHeaderExcel(columnas: IColumn[]): Object {
        let obj = '{';
        const length = columnas.length;
        columnas.forEach((columna: IColumn, index: number) => {
            obj += '"' + columna.descripcion + '":' + 'null' + (index < length - 1 ? ',' : '')
        });
        obj += '}';

        try {
            return JSON.parse(obj);
        } catch (error) {
            this.reponse.emit({ "error": {}, "excepcion": [error], recordsets: [] });
            return error;
        }
    }

    ngOnInit() {

        const headerExcel = this.parseHeaderExcel(this.columnasTemplate);
        this.headerExcel.push(headerExcel);

        //************************** DEFINIR EXTENSIONES QUE VA A PERMITIR **************************
        let ext = []
        ext.push(".xlsx")
        this.IUploadFile = {
            path: "1", idUsuario: 181, idAplicacionSeguridad: 2, idModuloSeguridad: 1, multiple: false, soloProcesar: true
            , extension: ext
        }

        //******************PARAMETROS DE COLUMNA**************** */
        this.columns = [
            {
                dataField: 'fila',
                caption: 'Fila'
            },
            {
                dataField: 'error',
                caption: 'Detalle del error'
            }
        ];


        //******************PARAMETROS DE PAGINACION DE GRID**************** */
        let pageSizes = [];
        pageSizes.push("5", "10", "25", "100")

        this.Checkbox = { checkboxmode: 'none' }; // *desactivar con none*/

        //******************PARAMETROS DE EXPORTACION**************** */
        this.exportExcel = { enabled: true, fileName: "errores" }

        //******************PARAMETROS DE SEARCH**************** */
        this.searchPanel = { visible: true, width: 200, placeholder: "Buscar...", filterRow: true }

        //******************PARAMETROS DE SCROLL**************** */
        this.scroll = { mode: "standard" }

        this.Editing = { allowupdate: false }; // *cambiar a batch para editar varias celdas a la vez*/

        //******************PARAMETROS DE TOOLBAR**************** */
        this.toolbar = [];

        //Cuando solo hay un tipo de accion
        if (this.acciones.length) {
            this.idTipoAccion = this.acciones[0];
        }
    }
    /**
     * Para descargar el template, contiene las columnas con la descripcion de las columnas del template.
     */
    downloadTemplate(): void {
        this.excelService.exportAsExcelFile(this.headerExcel, 'template');
    }

    /**
     * Si se cambia el excel cargado, aplicamos un reload del html para quitar los datos seleccionados.
     */
    refreshSelected() {
        if (this.uploadFile) {
            this.reload = false;
            setTimeout(() => {
                this.reload = true;
                this.uploadFile = false;
            }, 50);
        }
    }

    next(): void {
        this.refreshSelected();
        this.btnNextEnable = false;
        if (this.indexActive < this.process.length) {

            this.process[this.indexActive].active = this.indexActive < (this.process.length - 1) ? false : true;
            this.process[this.indexActive].finish = true;
            this.indexActive++;
            if (this.indexActive < (this.process.length)) {
                this.process[this.indexActive].active = true;
                this.process[this.indexActive].enabled = true;

                this.validateInputsRequired();
                if (this.indexActive === 2) {
                    this.spinner = true;
                    this.bindigColTemplateColExcel();
                    // GENERAMOS EL ARRAY DE SALIDA FINAL
                    this.ResponseArray(this.arrayRowsFinal);
                    this.validateInputsRequired();
                    this.spinner = false;
                }
                if (this.indexActive === 3) {
                    this.ValidarTipoAccion();
                }
            }

        }
    }

    previous(): void {
        this.refreshSelected();
        this.indexActive = this.indexActive == this.process.length ? (this.process.length - 1) : this.indexActive;
        if (this.indexActive > 0) {
            this.process[this.indexActive].active = false;
            this.indexActive--;
            this.process[this.indexActive].active = true;

            this.validateInputsRequired();

        }
    }

    active(index: number) {
        this.refreshSelected();
        if ((this.process[index].enabled)) {
            if (index < this.process.length) {
                this.indexActive = index;
                this.process.forEach((element, i) => {
                    this.process[i].active = false;
                });
                this.process[this.indexActive].active = true;

                this.validateInputsRequired();

            }
        }
    }

    bindigColTemplateColExcel() {
        this.arrayRowsFinal = [];
        this.arrayRowsFinalErrors = [];
        let arrayRows = [];
        const arrayContent = this.arrayContentFile;
        /**
         * Validamos si el tipo de acccion es actualizar, entonces agregamos la columna id por defecto.
         */
        this.msgErrorId = '';
        if (this.idTipoAccion === 'Actualizar' && this.columnasExcel[0].descripcion === 'Id') {
            if (this.columnasExcel[0].descripcion === 'Id') {
                if (this.columnasTemplate[0].descripcion !== 'Id') {
                    this.columnasTemplate.unshift({
                        descripcion: 'Id',
                        longitud: 200,
                        nombre: 'Id',
                        obligatorio: true,
                        tipo: 'string'
                    });

                    // Agregamos incrementamos un indice a cada columna de excel
                    this.columnasExcel.map((colum) => {
                        if (colum.indexColumnaTemplate !== null && colum.indexColumnaTemplate !== undefined) {
                            colum.indexColumnaTemplate = colum.indexColumnaTemplate + 1;
                        }
                        return colum;
                    });
                    this.columnasExcel[0].seleccionado = true;
                    this.columnasExcel[0].indexColumnaTemplate = 0;
                }
            } else {
                this.msgErrorId = 'Para la acción Actualizar es necesario tener un Id en la primera columna del excel.';
                this.limpiarSeleccionados();
            }
        }

        /**
         * Recorremos las columnas del excel para buscar y validar las columnas seleccionadas.
         */
        this.columnasExcel.forEach((columnaExcel: IColumnExcel) => {
            arrayRows = [];
            if (columnaExcel.indexColumnaTemplate != null && columnaExcel.seleccionado) {

                const colTemplate = this.columnasTemplate[columnaExcel.indexColumnaTemplate].nombre;

                let arrayColumn: IRowsExcel[] = [];
                /**
                 * Empezamos a recorrer las filas del excel, en el indice 0 están los titulos de columna, entonces empezamos desde la fila 1
                 */
                for (let index = 1; index < arrayContent.length; index++) {

                    const rowValuesExcel = arrayContent[index];

                    /**
                     * Validamos si vacios y tipo de dato
                     */
                    const responseValidate = this.validateDatas(this.columnasTemplate[columnaExcel.indexColumnaTemplate],
                        rowValuesExcel[columnaExcel.indexExcel], columnaExcel.descripcion);

                    if (responseValidate.isValid) {
                        const row: IRowsExcel = {
                            error: null, value: responseValidate.value, fila: index + 1, columnExcel: columnaExcel.indexExcel + 1
                        };
                        arrayColumn.push(row);
                    } else {
                        const row: IRowsExcel =
                            { error: responseValidate.error, value: null, fila: index + 1, columnExcel: columnaExcel.indexExcel + 1 };
                        arrayColumn.push(row);
                        this.arrayRowsFinalErrors.push(row);
                    }

                }
                /**
                 * Guardamos las columnas con las validaciones, esto se hace columna por columna
                 */
                if (arrayColumn.length > 0) {
                    const columnJson = '{ "' + colTemplate + '": ' + JSON.stringify(arrayColumn) + ' }';
                    arrayRows.push(JSON.parse(columnJson));
                }
            }
            /**
             * Guardamos la fila con las columnas en el arrayRowFinal.
             */
            if (arrayRows.length > 0) {
                this.arrayRowsFinal.push(arrayRows[0]);
            }

        });

        this.clearRowError(this.arrayRowsFinal, this.arrayRowsFinalErrors);
    }

    /**
     * Quitamos las filas que tienen al menos un error en una columna
     * @param arrayRowsFinal lista de registros del excel, incluye los datos erroneos
     * @param arrayRowsFinalErrors lista de los datos erroneos
     */
    clearRowError(arrayRowsFinal: any[], arrayRowsFinalErrors: any[]) {
        /** Obtenemos las filas con error */
        const arrayIndexErrorUnique = Array.from(new Set(arrayRowsFinalErrors.map(e => e.fila)))
            .map(rowExcel => {
                return { fila: rowExcel }
            });

        let arrayFinal = [];
        /** Quitamos las filas con error de la lista del excel */
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < arrayRowsFinal.length; index++) {
            const ele = arrayRowsFinal[index];
            let key = '';
            for (key in ele);
            let rows = ele[key];

            let tmp = rows;
            rows.forEach((element, ind) => {
                for (let index = 0; index < arrayIndexErrorUnique.length; index++) {
                    if (element.fila == arrayIndexErrorUnique[index].fila) {
                        tmp.splice(ind, 1);
                    }
                };

            });

            arrayFinal.push(JSON.parse('{ "' + key + '": ' + JSON.stringify(tmp) + ' }'));

            tmp = [];
        }
        this.arrayRowsFinalErrors = this.groupByKey(this.arrayRowsFinalErrors, 'fila');
    }

    /**
     * Metodo para el tipo de dato, si es obligatorio o aceptamos null.
     * @param columnasTemplate configuracion de la columna que se recibe desde el componente padre.
     * @param valuesExcel valor de la columna del excel, para validar con la configuracion del template.
     * @param columnaExcel nombre de la columna del excel ligado a la columna del template.
     */
    validateDatas(columnasTemplate: IColumn, valuesExcel: any, columnaExcel: string) {

        try {
            /**Validar cuando es obligatorio */
            if (columnasTemplate.obligatorio && (valuesExcel != undefined && valuesExcel != null && valuesExcel !== "")) {
                /** Validar tipo de dato */
                const type = typeof valuesExcel;
                /**
                 * Validamos si se puede convertir el valor al tipo de dato que esperamos en el template
                 */
                const parseData: any = this.parseData(columnasTemplate, type, valuesExcel, columnaExcel, columnasTemplate.obligatorio);
                if (parseData.isValid) {
                    return { isValid: true, value: parseData.value, error: null };
                } else {
                    return { isValid: false, value: null, error: parseData.value };
                }
                /**Cuando no es obligatorio */
            } else if (!columnasTemplate.obligatorio) {
                const type = null;
                const parseData: any = this.parseData(columnasTemplate, type, valuesExcel, columnaExcel, columnasTemplate.obligatorio);
                if (parseData.isValid) {
                    return { isValid: true, value: parseData.value, error: null };
                } else {
                    return { isValid: false, value: null, error: parseData.value };
                }
            } else {
                return { isValid: false, error: 'Error al intentar asignar valor a ' + columnasTemplate.descripcion + ', este campo es obligatorio, revisar la columna ' + columnaExcel + ' del excel cargado.' };
            }
        } catch (error) {
            if (!valuesExcel && !columnasTemplate.obligatorio) {
                return { isValid: true, value: valuesExcel, error: null };;
            } else {
                return { isValid: false, error: 'Error al intentar asignar valor a ' + columnasTemplate.descripcion + ', este campo es obligatorio, revisar la columna ' + columnaExcel + ' del excel cargado.' };
            }
        }
    }

    /**
     * Metodo para habilitar el botone "siguiente"
     */
    validateInputsRequired() {
        this.msgErrorId = '';
        switch (this.indexActive) {
            case 0:
                this.btnNextEnable = this.filename == '' ? false : true;
                break;
            case 1:
                this.btnNextEnable = true;
                if (this.idTipoAccion === TipoAccionCargaMasiva.ACTUALIZAR) {
                    this.columnasExcel[0].indexColumnaTemplate = 0;
                    this.columnasExcel[0].seleccionado = true;
                }
                this.columnasTemplate.forEach((template, index) => {
                    if (template.obligatorio) {
                        const found = this.columnasExcel.find(element => element.indexColumnaTemplate == index);

                        if (!found || !this.idTipoAccion) {
                            this.btnNextEnable = false;
                        }
                    }
                });
                if (this.idTipoAccion === TipoAccionCargaMasiva.ACTUALIZAR) {
                    if (this.columnasExcel[0].descripcion === 'Id') {
                        this.btnNextEnable = this.btnNextEnable ? true : false;
                        this.msgErrorId = '';
                    } else {
                        this.msgErrorId = 'Cuando el tipo de acción es ACTUALIZAR la primer columna del Layout deberá de llamarse Id';
                        this.btnNextEnable = false;
                    }
                }
                break;
            case 2:
                this.btnNextEnable = this.arrayRowsFinalErrors.length === 0 ? true : false;
                break;
        }

    }

    /**
     * Se hace un parse al valor del excel para convertirlo al tipo de dato esperado del template
     * @param column configuracion del template.
     * @param type tipo de dato de la columna del excel.
     * @param valueExcel valor del la columna del excel.
     */
    parseData(column: IColumn, type, valueExcel, columnaExcel, obligatorio) {

        if (column.tipo == type) {
            if (type == TypeData.STRING) {
                return valueExcel.length <= column.longitud ? { isValid: true, value: valueExcel } : { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera una cadena con longitud (' + column.longitud + ') y (' + valueExcel + ') excede lo maximo permitido, revisar la columna ' + columnaExcel + ' del excel cargado.' };
            } else {
                return { isValid: true, value: valueExcel };
            }
        } else {
            try {
                switch (column.tipo) {
                    case TypeData.STRING:
                        if (obligatorio || valueExcel) {
                            if (String(valueExcel)) {
                                return String(valueExcel).length <= column.longitud ? { isValid: true, value: String(valueExcel) } : { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera una cadena con longitud (' + column.longitud + ') y (' + valueExcel + ') excede lo maximo permitido, revisar la columna ' + columnaExcel + ' del excel cargado.' };
                            } else {
                                return { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera una cadena y no es posible asignar(' + valueExcel + ') como valor, revisar la columna ' + columnaExcel + ' del excel cargado.' };
                            }
                        } else {
                            return { isValid: true, value: null }
                        }
                    case TypeData.NUMBER:
                        if (obligatorio || valueExcel) {
                            return parseInt(valueExcel) ? { isValid: true, value: parseInt(valueExcel) } : { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera un numero y no es posible asignar(' + valueExcel + ') como valor, revisar la columna ' + columnaExcel + ' del excel cargado.' };
                        } else {
                            return { isValid: true, value: null }
                        }
                    case TypeData.FLOAT:
                        if (obligatorio || valueExcel) {
                            let valInt = type == TypeData.NUMBER ? valueExcel + '.00' : valueExcel;
    
                            return parseFloat(valInt) >= 0 ? { isValid: true, value: parseFloat(valInt) } : { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera un numero decimal y no es posible asignar(' + valInt + ') como valor, revisar la columna ' + columnaExcel + ' del excel cargado.' };
                        } else {
                            return { isValid: true, value: null }
                        }
                    case TypeData.DATE:
                        if (obligatorio || valueExcel) {
                            const date = this.parseDateExcel(valueExcel);
                            return date ? { isValid: true, value: date } : { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera una fecha y no es posible asignar(' + valueExcel + ') como valor, revisar la columna ' + columnaExcel + ' del excel cargado.' }
                        } else {
                            return { isValid: true, value: null }
                        }
                        case TypeData.COLOR:
                            if (obligatorio || valueExcel) {
                                const parseColor = this.codigoColor.colourNameToRgb(valueExcel);
                                return parseColor ? { isValid: true, value: parseColor } :
                                { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera un color y no es posible asignar(' + valueExcel + ') como valor, revisar la columna ' + columnaExcel + ' del excel cargado.' }
                            } else {
                                return { isValid: true, value: null }
                            }
                    default:
                        return { isValid: false, value: null };
                        break;
                }
            } catch (error) {
                return { isValid: false, value: 'Error al intentar asignar valor a ' + column.descripcion + ': Para esta columna se espera una fecha y no es posible asignar(' + valueExcel + ') como valor, revisar la columna ' + columnaExcel + ' del excel cargado.' }
            }
        }
    }


    //**************************RECIBE RESPUESTA DE SERVICIO ********************************/
    receiveMessage($event: any): void {
        this.btnNextEnable = false;
        this.message = '';
        this.reload = false;

        this.columnasExcel = [];
        this.uploadFile = true;

        if ($event.recordsets[1].length > 0) {
            /**
             * Quitamos las filas vacias
             */
            this.arrayContentFile = $event.recordsets[1].filter((row) => {
                return (row.length > 0);
            });

            const readExcel = $event.recordsets[1];
            readExcel[0].forEach((element, index) => {
                this.columnasExcel.push({ descripcion: element, seleccionado: false, indexColumnaTemplate: null, indexExcel: index });
            });

            let arrayObligatorios: any = this.columnasTemplate.filter(col => col.obligatorio);

            let arrayNoObligatorios = this.columnasTemplate.filter(col => !col.obligatorio);

            this.columnasTemplate = arrayObligatorios.concat(arrayNoObligatorios);
            this.btnNextEnable = this.columnasExcel.length > 0 ? true : false;
            this.filename = $event.recordsets[0];
            this.message = 'Documento Cargado ' + this.filename;

            this.reload = true;
        }
    }

    changeSelectColumnaExcel($event: any, indexColumnaTemplate: number): void {
        if ($event !== undefined) {
            const indexColumnaExcel = $event;
            for (let index = 0; index < this.columnasExcel.length; index++) {
                if (this.columnasExcel[index].indexColumnaTemplate == indexColumnaTemplate) {
                    this.columnasExcel[index].seleccionado = false;
                    this.columnasExcel[index].indexColumnaTemplate = null;
                }
            }
            this.columnasExcel[indexColumnaExcel].indexColumnaTemplate = indexColumnaTemplate;
            this.columnasExcel[indexColumnaExcel].seleccionado = true;
            this.validateInputsRequired();
        } else {
            for (let index = 0; index < this.columnasExcel.length; index++) {
                if (this.columnasExcel[index].indexColumnaTemplate == indexColumnaTemplate && this.columnasExcel[index].seleccionado == true) {
                    this.columnasExcel[index].indexColumnaTemplate = null;
                    this.columnasExcel[index].seleccionado = false;
                    this.validateInputsRequired();
                    break;
                }
            }
        }
    }

    limpiarSeleccionados() {
        this.reload = false;
        this.columnasExcel.forEach((element, index) => {
            this.columnasExcel[index].seleccionado = false;
            this.columnasExcel[index].indexColumnaTemplate = null;
        });
        this.idTipoAccion = null;

        setTimeout(() => {
            this.reload = true;
            this.validateInputsRequired()
        }, 50);
    }

    /**
     * Methodo para convertir a date el tipo de dato fecha en excel.
     * @param excelTimestamp tipo numerico, valor obtenido de una fecha en excel.
     */
    parseDateExcel(excelTimestamp) {
        const secondsInDay = 24 * 60 * 60;
        const excelEpoch = new Date(1899, 11, 31);
        const excelEpochAsUnixTimestamp = excelEpoch.getTime();
        const missingLeapYearDay = secondsInDay * 1000;
        const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
        const excelTimestampAsUnixTimestamp = excelTimestamp * secondsInDay * 1000;
        const parsed = excelTimestampAsUnixTimestamp + delta;

        return isNaN(parsed) ? null : new Date(parsed);
    };

    groupByKey(array, key): any {
        const groupBy = key => array =>
            array.reduce(
                (objectsByKeyValue, obj) => ({
                    ...objectsByKeyValue,
                    [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
                }),
                {}
            );

        let group = groupBy(key);
        let obj = group(array);

        let arr = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                arr.push(element)
            }
        }

        return arr.map((error: any) => {
            if (error.length > 0) {
                let concat = { error: '', fila: 0 };
                error.forEach((e) => {
                    concat.error += e.error;
                    concat.fila = e.fila;
                });

                return concat;
            } else {
                return error[0];
            }
        })
    }

    finalizar() {
        this.process[3].finish = true;
        this.reponse.emit({ error: null, excepciones: null, recordsets: this.arrayRowsFinal });
    }

    ResponseArray(resp): any {
        this.arrayProcesado = [];
        this.arrayProcesadoColumns = [];
        resp.forEach((f) => {
            // tslint:disable-next-line: forin
            for (const key in f) {
                f[key].forEach((item, index) => {
                    const cur = this.arrayProcesado.filter(filtro => filtro.index === index);
                    if (cur.length > 0) {
                        cur[0][key] = item.value;
                    } else {
                        const tmp = { index };
                        tmp[key] = item.value;
                        this.arrayProcesado.push(tmp);
                    }
                });
            }
        });
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < resp.length; i++) {
            Object.keys(resp[i]).forEach(key => {
                //Buscamos la descripcion de la propiedad en las columnas del template para agregar como descripcion en el datagrid
                const descripcion = this.columnasTemplate.find((columna: IColumn) => columna.nombre === key ).descripcion;
                this.arrayProcesadoColumns.push({ caption: descripcion, dataField: key });
            });

        }
        
    }

    ValidarTipoAccion() {
        this.msgErrorId = '';
        this.formDinamico = [];
        this.Guardar();
    }

    Guardar() {
        this.formDinamico = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.arrayProcesado.length; i++) {
            let id = 0;
            Object.keys(this.arrayProcesado[i]).forEach(key => {
                const value = this.arrayProcesado[i][key];
                if (key !== 'Id') {
                    this.formDinamico.push({ idClase: this.idClase, propiedadDesc: key, valor: value, fechaCaducidad: null, id });
                } else {
                    id = value;
                }
            });

        }

        this._service.postService(this.urlApi, {
            formDinamico: this.formDinamico,
            sp: this.sp,
            parametrosSP: this.parametrosSP,
            idTipoAccion: this.idTipoAccion
        }).subscribe((res: any) => {
            this.spinner = false;
            if (res.error === '') {
                this.arrayProcesadoErrors = [];
                this.msgErrorServidor = '';
            } else {
                this.arrayProcesadoErrors = res.recordsets[0];
                this.msgErrorServidor = res.error;
            }
        }, error => {
            this.msgErrorServidor = '';
            // this.reponse.emit({ error, excepciones: null, recordsets: null });
        });
    }
}