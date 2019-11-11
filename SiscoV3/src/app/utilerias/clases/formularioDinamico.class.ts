import * as moment from 'moment';
import { isArray } from 'util';
import { IViewertipo } from '../../interfaces';

class Nodos {
    idPadre: number;
    valor: string;
    id: number;

    constructor(ip: number, v: string, i: number) {
        this.idPadre = ip;
        this.id = i;
        this.valor = v;
    }
}


export class FormularioDinamico {
    formDinamico: any;
    tipoObjetoPropiedades: any;
    setValuesForm: any = [];
    valorTipoObjeto: any = {};
    valid = true;
    valido = true;
    formValid: boolean;
    labelAgrupador = [];

    // #region recursividad
    /*
    Nombre:         GetPropiedades
    Autor:          Edgar Mendoza Gómez
    Fecha:          01/04/2019
    Descripción:    Función recursiva para devolver propiedades generales y de clase con sus hijos
    Parametros:     propiedades: propiedades que pertenecen al idClase
    Output:
    */

    GetPropiedades(propiedades) {
        this.tipoObjetoPropiedades = propiedades.filter(idPadre => idPadre.idPadre === 0);

        if (this.tipoObjetoPropiedades.length > 0) {
            // tslint:disable-next-line: prefer-for-of
            for (let index = 0; index < this.tipoObjetoPropiedades.length; index++) {
                this.tipoObjetoPropiedades[index].valorSelected = '';
                this.tipoObjetoPropiedades[index].valid = true;
                if (this.tipoObjetoPropiedades[index].idTipoDato === 'Date' ||
                    this.tipoObjetoPropiedades[index].idTipoDato === 'DateTime') {
                    this.tipoObjetoPropiedades[index].valorSelected = new Date();
                }
            }
        }
        propiedades.forEach(o => {
            o.arreglo = this.BuscaHijos(propiedades, o.id, o.propiedad);
        });
    }

    /*
    Nombre:         BuscaHijos
    Autor:          Edgar Mendoza Gómez
    Fecha:          25/03/2019
    Descripción:    Construye hijos de combos en Form
    Output:
    */
    BuscaHijos(arreglo: any, padre: number, prop: any): Nodos[] {
        let p = [];
        arreglo.forEach(n => {
            if (prop !== '') {
                if (n.idPadre === padre && n.propiedad === prop) {
                    p.push(new Nodos(0, n.valor, n.id));
                    p = this.Busca(arreglo, n.id, p);
                }
            } else {
                if (n.idPadre === padre) {
                    p.push(new Nodos(0, n.valor, n.id));
                    p = this.Busca(arreglo, n.id, p);
                }
            }
        });
        return p;
    }


    /*
    Nombre:         Busca
    Autor:          Edgar Mendoza Gómez
    Fecha:          25/03/2019
    Descripción:    Construye nietos de combos en Form
    Output:
    */
    Busca(arreglo: any, padre: number, p: Nodos[]): Nodos[] {
        arreglo.forEach(h => {
            if (h.idPadre === padre) {
                p.push(h);
                p = this.Busca(arreglo, h.id, p);
            }
        });
        return p;
    }

    // #endregion

    // #region setValues
    /*
    Nombre:         TreeView_itemSelectionChanged
    Autor:          Edgar Mendoza Gómez
    Fecha:          25/03/2019
    Descripción:    Función de Devex de cambio de valor en los combo recursivos.
    Output:
    */

    TreeView_itemSelectionChanged(e, tipoObjeto) {
        const item = e.node;
        if (!item.children.length) {
            const nodes = e.component.getNodes();
            const valores = this.GetSelectedItemsKeys(nodes);

            tipoObjeto.valorPropiedad = valores.map((val) => val.key);
            if (tipoObjeto.idTipoValor === 'Agrupador') {
                // Buscamos los labes de los padres para armar el label final.
                this.labelAgrupador = [];
                this.generarLabelAgrupador(tipoObjeto.arreglo, tipoObjeto.valorPropiedad[0]);
                tipoObjeto.label = this.labelAgrupador.reverse().join('/');
            } else {
                tipoObjeto.label = valores.map((val) => val.label).join('/');
            }

            this.ValidForm();
            this.ValidFormTipo();
        }
    }

    /**
     * @description Concatena los labels del hijo con el padre para mostrar en cada input.
     * @param tipoObjeto tipoobjeto que se está seleccionando
     * @author Andres Farias
     */
    generarLabelAgrupador(nodo, id) {
        if (id) {
            const foundNodo = nodo.find(propiedad => propiedad.id === id);
            if (foundNodo.idPadre > 0) {
                this.labelAgrupador.push(foundNodo.valor);
                this.generarLabelAgrupador(nodo, foundNodo.idPadre);
            } else {
                this.labelAgrupador.push(foundNodo.valor);
            }
        }
    }

    GetSelectedItemsKeys(items) {
        let result = [];
        const that = this;

        items.forEach((item) => {
            if (item.selected) {
                result.push({ key: item.key, label: item.text });
            }
            if (item.items.length) {
                result = result.concat(that.GetSelectedItemsKeys(item.items));
            }
        });
        return result;
    }


    /*
    Nombre:         ChangeInput
    Autor:          Edgar Mendoza Gómez
    Fecha:          25/03/2019
    Descripción:    Cambia variable cuando se cambia valor de un input
    Output:
    */

    ChangeInput($event: any, index: number) {
        this.ValidForm();
        this.tipoObjetoPropiedades[index].valorPropiedad = [$event.target.value];
    }

    ChangePropiedad($event: any, index: number) {
        this.ValidForm();
        if ($event.target) {
            this.tipoObjetoPropiedades[index].valorPropiedad = [$event.target.value];
            if (this.tipoObjetoPropiedades[index].obligatorio) {
                this.tipoObjetoPropiedades[index].valid = $event.target.value === '' ? false : true;
            } else {
                this.tipoObjetoPropiedades[index].valid = true;
            }
        }
    }

    //funcion para validar el tipo de propiedad a el valor seleccionado propropiedad de objeto
    ChangePropiedadTipo($event: any, valorProp: string) {
        let evento: any;
        for (var i = 0; i < this.tipoObjetoPropiedades.length; i++) {

            if (this.tipoObjetoPropiedades[i].valorPropiedad === '' || this.tipoObjetoPropiedades[i].valorPropiedad === undefined) {
                this.tipoObjetoPropiedades[i].valorPropiedad = this.tipoObjetoPropiedades[i].label;
            }

            if (valorProp == this.tipoObjetoPropiedades[i].valor) {
                evento = $event;
                this.tipoObjetoPropiedades[i].valorPropiedad = [evento];
                if (this.tipoObjetoPropiedades[i].obligatorio) {
                    this.tipoObjetoPropiedades[i].valid = evento == '' ? false : true;
                } else {
                    this.tipoObjetoPropiedades[i].valid = true;
                }
            }
        }
        this.ValidFormTipo();
    }


    ChangeInputTipo($event: any, valorProp: string) {
        for (var i = 0; i < this.tipoObjetoPropiedades.length; i++) {
            if (valorProp == this.tipoObjetoPropiedades[i].valor) {
                this.tipoObjetoPropiedades[i].valorSelected = $event.target.value;
            }
        }
    }

    ValidFormTipo() {
        this.valido = true;
        let countInput = 0;
        let countValorSelected = 0;
        for (var i = 0; i < this.tipoObjetoPropiedades.length; i++) {
            if (this.tipoObjetoPropiedades[i].obligatorio === true) {
                countInput++;
            }
            if (this.tipoObjetoPropiedades[i].obligatorio === true
                && this.tipoObjetoPropiedades[i].valorPropiedad[0] != ''
                && this.tipoObjetoPropiedades[i].valorPropiedad[0] != null) {
                countValorSelected++;
            }
        }
        if (countInput === countValorSelected) {
            this.valid = false;
            this.valido = false;
        }

    }

    // #endregion

    ValidForm() {
        this.valido = true;
        this.valid = true;
        let countInput = 0;
        let countValorSelected = 0;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.tipoObjetoPropiedades.length; i++) {
            if (this.tipoObjetoPropiedades[i].obligatorio === true) {
                countInput++;
            }
            if (this.tipoObjetoPropiedades[i].valorPropiedad) {
                if (this.tipoObjetoPropiedades[i].obligatorio === true
                    && this.tipoObjetoPropiedades[i].valorPropiedad[0] !== ''
                    && this.tipoObjetoPropiedades[i].valorPropiedad[0] !== 0) {
                    countValorSelected++;
                }
            }
        }
        if (countInput === countValorSelected) {
            this.valid = false;
            this.valido = false;
        }
    }

    // #region Insertar
    /*
    Nombre:         ValuesFormIns
    Autor:          Edgar Mendoza Gómez
    Fecha:          01/04/2019
    Descripción:    Llena objeto valor con las propiedades para insertar tipo objeto
    Parametros:     tipoObjetoPropiedades: arreglo de propiedades, idTipoObjeto, setValuesForm: valores que se seleccionaron en form
    Output:
    */

    ValuesFormIns() {
        this.formDinamico = [];
        this.formValid = true;
        /**
         * Nos aseguramos que las propiedades obligatorias tengan un valor
         */
        let formVa = true;
        this.tipoObjetoPropiedades.forEach((propiedad) => {
            if (propiedad.obligatorio) {
                if (propiedad.valorPropiedad) {
                    if (propiedad.valorPropiedad[0] === '' || propiedad.valorPropiedad.length === 0) {
                        formVa = false;
                    }
                } else {
                    formVa = false;
                }
            }
        });
        if (formVa) {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.tipoObjetoPropiedades.length; i++) {
                if (this.formValid) {
                    /**
                     * A los valores del campo se parsea al tipo de dato que está configurado.
                     */
                    if (this.tipoObjetoPropiedades[i].valorPropiedad) {
                        const values = this.tipoObjetoPropiedades[i].valorPropiedad.map((valor) => {
                            return this.validateForm(this.tipoObjetoPropiedades[i].id, valor, this.tipoObjetoPropiedades[i].propiedad);
                        });
                        if (this.tipoObjetoPropiedades[i].valorPropiedad.length > 0) {
                            const valor = {
                                valor: values,
                                propiedadDesc: this.tipoObjetoPropiedades[i].propiedad,
                                idPropiedad: this.tipoObjetoPropiedades[i].id,
                                fechaCaducidad: null,
                                idTipoValor: this.tipoObjetoPropiedades[i].idTipoValor
                            };
                            this.formDinamico.push(valor);
                        }
                    }
                    else {
                        const valor = {
                            valor: [''],
                            propiedadDesc: this.tipoObjetoPropiedades[i].propiedad,
                            idPropiedad: this.tipoObjetoPropiedades[i].id,
                            fechaCaducidad: null,
                            idTipoValor: this.tipoObjetoPropiedades[i].idTipoValor
                        };
                        this.formDinamico.push(valor);
                    }



                }
            }
        }
    }


    // #region Update
    /*
    Nombre:         SetValuesUpd
    Autor:          Edgar Mendoza Gómez
    Fecha:          01/04/2019
    Descripción:    Setea valores del tipo objeto
    Parametros:     values
    Output:
    */

    SetValuesUpd(values) {
        /**
         * Buscamos los valores a cada propiedad
         */
        this.tipoObjetoPropiedades.forEach((propiedad, index) => {
            const valorPropiedad = values.filter(valorP => valorP.propiedad === propiedad.valor);
            if (valorPropiedad) {
                if (isArray(valorPropiedad)) {
                    this.tipoObjetoPropiedades[index].valorPropiedad = valorPropiedad.map((prop) => prop.idPropiedad);
                    this.tipoObjetoPropiedades[index].label = valorPropiedad.map((prop) => prop.valor).join('/');
                } else {
                    this.tipoObjetoPropiedades[index].valorPropiedad = [valorPropiedad];
                }
            }
        });
        this.labelAgrupador = [];
        this.tipoObjetoPropiedades.forEach((prop, index) => {
            if (this.tipoObjetoPropiedades[index].idTipoValor === 'Agrupador'
                && parseInt(this.tipoObjetoPropiedades[index].valorPropiedad[0], 0)) {

                this.generarLabelAgrupador(this.tipoObjetoPropiedades[index].arreglo,
                    parseInt(this.tipoObjetoPropiedades[index].valorPropiedad[0], 0));
                this.tipoObjetoPropiedades[index].label = this.labelAgrupador.reverse().join('/');
            }
        });
        // Validamos los campos obligatorios.
        this.ValidForm();
    }

    /**
     * @description Da formato al contenido del formulario dinamico para mandarlo a al server.
     * @param tipoObjetoPropiedades Objeto completos del formulario.
     * @param id id del tipo de objeto que se está editando
     * @author Andres Farias
     */
    ValuesFormUpd(tipoObjetoPropiedades, id, val?: any) {
        this.formDinamico = [];
        this.formValid = true;
        /**
         * Nos aseguramos que las propiedades obligatorias tengan un valor
         */
        let formVa = true;

        tipoObjetoPropiedades.forEach((propiedad) => {
            if (propiedad.obligatorio) {
                if (propiedad.valorPropiedad[0] === '' || propiedad.valorPropiedad.length === 0) {
                    formVa = false;
                }
            }
        });
        if (formVa) {
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < tipoObjetoPropiedades.length; i++) {
                if (this.formValid) {
                    if (tipoObjetoPropiedades[i].valorPropiedad.length > 0) {
                        /**
                         * A los valores del campo se parsea al tipo de dato que está configurado.
                         */
                        const values = this.tipoObjetoPropiedades[i].valorPropiedad.map((valorP) => {
                            return this.validateForm(this.tipoObjetoPropiedades[i].id, valorP, this.tipoObjetoPropiedades[i].propiedad);
                        });
                        const valor = {
                            id,
                            valor: values,
                            propiedadDesc: tipoObjetoPropiedades[i].propiedad,
                            idPropiedad: tipoObjetoPropiedades[i].id,
                            fechaCaducidad: null,
                            idTipoValor: tipoObjetoPropiedades[i].idTipoValor
                        };
                        this.formDinamico.push(valor);
                    }
                }
            }
        }
    }


    /**
     * funcion para validar los valores a insertar
     * @param id identificador de tipo de clase
     * @param valor valor a setear por el tipo de dato y tipo de valor correcto
     */
    validateForm(id, valor, propiedad) {
        let tipoDato: string;
        let tipoValor: string;
        let valorSet;

        for (const i in this.tipoObjetoPropiedades) {
            if (id === this.tipoObjetoPropiedades[i].id && propiedad === this.tipoObjetoPropiedades[i].propiedad) {
                tipoDato = this.tipoObjetoPropiedades[i].idTipoDato;
                tipoValor = this.tipoObjetoPropiedades[i].idTipoValor;
                if (tipoValor === 'Unico') {
                    switch (tipoDato) {
                        case 'Date':
                            var d = moment(valor, 'YYYY-MM-DD', true).format();
                            if (d == 'Invalid date') {
                                d = moment(new Date(), 'YYYY-MM-DD', true).format();
                            }
                            valorSet = d;
                            break;
                        case 'Datetime':
                            var d = moment(valor, 'YYYY-MM-DD', true).format();
                            if (d == 'Invalid date') {
                                d = moment(new Date(), 'YYYY-MM-DD', true).format();
                            }
                            valorSet = d;
                            break;
                        case 'Decimal':
                            valorSet = parseFloat(valor);
                            break;
                        case 'File':
                            valorSet = valor;
                            break;
                        case 'Image':
                            valorSet = valor;
                            break;
                        case 'Numeric':
                            valorSet = parseInt(valor);
                            break;
                        case 'String':
                            valorSet = valor;
                            break;
                        case 'bit':
                            if (valor == '1' || valor == '0') {
                                valorSet = parseInt(valor);
                            } else {
                                valorSet = 1;
                            }
                            break;
                        default:
                            valorSet = valor;
                            break;
                    }
                } else {
                    valorSet = valor;
                }
            }
        }
        return valorSet;
    }
    // #endregion

    /**
     * @description Selecciona el item seleccionado desde la base de datos, si el valor seleccionado es un hijo entonces expande el padre.
     * @param $event Objeto que se ejecuta al inicializar la lista.
     * @author Andres Farias
     */
    initializedDxTreeView($event) {
        const nodes = $event.component.getNodes();
        // array para guardar los key de etiquetas
        const listaEtiquetas = [];

        this.tipoObjetoPropiedades.forEach((propiedad) => {
            // tslint:disable-next-line: prefer-for-of
            for (let indexNodo = 0; indexNodo < nodes.length; indexNodo++) {
                // Buscamos si el nodo tiene hijos
                if (nodes[indexNodo].children.length > 0) {

                    // Si tiene hijos entonces buscamos el id del padre para agregar el display item
                    nodes[indexNodo].children.forEach((child, indexChild) => {
                        // tslint:disable-next-line: triple-equals
                        if (child.key == propiedad.valorPropiedad[0]) {
                            nodes[indexNodo].children[indexChild].selected = true;
                            this.modificarDOMLista($event, nodes[indexNodo].children[indexChild].key,
                                nodes[indexNodo].children[indexChild].parent.key);
                        }
                    });
                } else {
                    if (nodes[indexNodo].key && propiedad.valorPropiedad && propiedad.idTipoValor !== 'Etiqueta') {
                        if (propiedad.valorPropiedad.length > 0) {
                            if (nodes[indexNodo].key == propiedad.valorPropiedad[0]) {
                                nodes[indexNodo].selected = true;
                                this.modificarDOMLista($event, nodes[indexNodo].key, nodes[indexNodo].key);
                            }
                        }
                    } else if (propiedad.idTipoValor === 'Etiqueta') {
                        propiedad.valorPropiedad.forEach((value: string) => {
                            if (value == nodes[indexNodo].key) {
                                listaEtiquetas.push({ key: nodes[indexNodo].key, node: nodes[indexNodo].key });
                            }
                        });
                    }
                }
            }
        });
        // Seleccionamos los items que están seleccionados desde la DB
        listaEtiquetas.forEach((etiqueta) => {
            this.modificarDOMLista($event, etiqueta.key, etiqueta.node);
        });

    }

    /**
     * 
     * @param $event DOM de la lista dx-tree-view
     * @param keySelect Key del nodo para seleccionar de la lista
     * @param keyExpand Key del padre para expandir sus items
     * @author Andres Farias
     */
    modificarDOMLista($event: any, keySelect: number, keyExpand: number): void {
        $event.component.selectItem(keySelect);
        $event.component.expandItem(keyExpand);
    }

    /**
     * @description Cierra en automatico al seleccionar un item de la lista dinamica
     * @param $event Objeto de la lista
     * @param etiqueta Tipo de valor que pertenece la lista, en caso de ser etiqueta la lista no debe de cerrarse en automatico.
     * @author Andres Farias
     */
    closeWindow($event: any, etiqueta?: boolean) {
        if ($event && !etiqueta) {
            $event.instance.close();
        }
    }
}