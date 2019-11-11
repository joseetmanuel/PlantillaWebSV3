import { Injectable } from '@angular/core';

@Injectable()
export class FuncionColor {
    constructor() { }

    /**
     * @description             Funcion par aobtener el color en rgb o hexadecimal
     * @param colour             string de color
     * @author                  Sandra Gil Rosales
     */
    public colourNameToRgb(colour) {
        const color = this.quitarAcentos (colour.toLowerCase());
        /** expresion para validar si es un color RGB aceptado */
        const RegRgb = /^(rgb|RGB)\([0-9]{1,3}[,][0-9]{1,3}[,][0-9]{1,3}\)$/g;
        const RegHex = /^\#[a-z0-9]{6}$/g;

        const colours = {
            'aqua': 'rgb(0,255,255)'
            , 'purpura': 'rgb(128,0,128)'
            , 'teal': 'rgb(0,128,128)'
            , 'marina de guerra': 'rgb(0,0,128)'
            , 'granate': 'rgb(128,0,0)'
            , 'rojo obscuro': 'rgb(139,0,0)'
            , 'rojo murano': 'rgb(84,16,4)'
            , 'marron': 'rgb(165,42,42)'
            , 'ladrillo refractario': 'rgb(178,34,34)'
            , 'carmesi': 'rgb(220,20,60)'
            , 'rojo': 'rgb(255,0,0)'
            , 'tomate': 'rgb(255,99,71)'
            , 'coral': 'rgb(255,127,80)'
            , 'indio rojo': 'rgb(205,92,92)'
            , 'luz coral': 'rgb(240,128,128)'
            , 'salmon oscuro': 'rgb(233,150,122)'
            , 'salmon': 'rgb(250,128,114)'
            , 'salmon luz': 'rgb(255,160,122)'
            , 'naranja rojo': 'rgb(255,69,0)'
            , 'naranja obscuro': 'rgb(255,140,0)'
            , 'naranja': 'rgb(255,165,0)'
            , 'oro': 'rgb(255,215,0)'
            , 'oscuro vara de oro': 'rgb(184,134,11)'
            , 'vara de oro': 'rgb(218,165,32)'
            , 'vara de oro pálido': 'rgb(238,232,170)'
            , 'caqui oscuro': 'rgb(189,183,107)'
            , 'caqui': 'rgb(240,230,140)'
            , 'oliva': 'rgb(128,128,0)'
            , 'amarillo': 'rgb(255,255,0)'
            , 'amarillo verde': 'rgb(154,205,50)'
            , 'oscuro verde oliva': 'rgb(85,107,47)'
            , 'verde oliva': 'rgb(107,142,35)'
            , 'cesped verde': 'rgb(124,252,0)'
            , 'verde amarillo': 'rgb(173,255,47)'
            , 'verde oscuro': 'rgb(0,100,0)'
            , 'verde': 'rgb(0,128,0)'
            , 'bosque verde': 'rgb(34,139,34)'
            , 'cal': 'rgb(0,255,0)'
            , 'cafe': 'rgb(75,54,33)'
            , 'verde lima': 'rgb(50,205,50)'
            , 'luz verde': 'rgb(144,238,144)'
            , 'verde palido': 'rgb(152,251,152)'
            , 'verde obscuro mar': 'rgb(143,188,143)'
            , 'medio verde primavera': 'rgb(0,250,154)'
            , 'verde de la primavera': 'rgb(0,255,127)'
            , 'mar verde': 'rgb(46,139,87)'
            , 'medio acuatico marino': 'rgb(102,205,170)'
            , 'verde medio del mar': 'rgb(60,179,113)'
            , 'luz verde de mar': 'rgb(32,178,170)'
            , 'pizarra gris oscuro': 'rgb(47,79,79)'
            , 'cerceta': 'rgb(0,128,128)'
            , 'cyan oscuro': 'rgb(0,139,139)'
            , 'agua': 'rgb(0,255,255)'
            , 'cian': 'rgb(0,255,255)'
            , 'cian claro': 'rgb(224,255,255)'
            , 'turquesa oscuro': 'rgb(0,206,209)'
            , 'turquesa': 'rgb(64,224,208)'
            , 'turquesa medio': 'rgb(72,209,204)'
            , 'turquesa palido': 'rgb(175,238,238)'
            , 'aqua marina': 'rgb(127,255,212)'
            , 'azul pálido': 'rgb(176,224,230)'
            , 'cadete azul': 'rgb(95,158,160)'
            , 'acero azul': 'rgb(70,130,180)'
            , 'maíz flor azul': 'rgb(100,149,237)'
            , 'cielo azul profundo': 'rgb(0,191,255)'
            , 'dodger azul': 'rgb(30,144,255)'
            , 'luz azul': 'rgb(173,216,230)'
            , 'cielo azul': 'rgb(135,206,235)'
            , 'luz azul cielo': 'rgb(135,206,250)'
            , 'azul medianoche': 'rgb(25,25,112)'
            , 'azul oscuro': 'rgb(0,0,139)'
            , 'azul medio': 'rgb(0,0,205)'
            , 'azul': 'rgb(0,0,255)'
            , 'azul real': 'rgb(65,105,225)'
            , 'azul violeta': 'rgb(138,43,226)'
            , 'anil': 'rgb(75,0,130)'
            , 'azul pizarra oscuro': 'rgb(72,61,139)'
            , 'azul pizarra': 'rgb(106,90,205)'
            , 'medio azul pizarra': 'rgb(123,104,238)'
            , 'medio púrpura': 'rgb(147,112,219)'
            , 'magenta oscuro': 'rgb(139,0,139)'
            , 'violeta oscuro': 'rgb(148,0,211)'
            , 'orquídea oscuro': 'rgb(153,50,204)'
            , 'medio orquídea': 'rgb(186,85,211)'
            , 'cardo': 'rgb(216,191,216)'
            , 'ciruela': 'rgb(221,160,221)'
            , 'violeta': 'rgb(238,130,238)'
            , 'magenta': 'rgb(255,0,255)'
            , 'fucsia': 'rgb(255,0,255)'
            , 'orquidea': 'rgb(218,112,214)'
            , 'rojo violeta': 'rgb(199,21,133)'
            , 'rojo palido violeta': 'rgb(219,112,147)'
            , 'rosa oscuro': 'rgb(255,20,147)'
            , 'rosa claro': 'rgb(255,182,193)'
            , 'rosa': 'rgb(255,192,203)'
            , 'blanco antiguo': 'rgb(250,235,215)'
            , 'beige': 'rgb(245,245,220)'
            , 'blanqueadas almendra': 'rgb(255,235,205)'
            , 'trigo': 'rgb(245,222,179)'
            , 'maiz seda': 'rgb(255,248,220)'
            , 'limon': 'rgb(255,250,205)'
            , 'luz dorada barra amarilla': 'rgb(250,250,210)'
            , 'luz amarilla': 'rgb(255,255,224)'
            , 'saddle brown': 'rgb(139,69,19)'
            , 'tierra de siena': 'rgb(160,82,45)'
            , 'chocolate': 'rgb(210,105,30)'
            , 'arena marrón': 'rgb(244,164,96)'
            , 'madera fornido': 'rgb(222,184,135)'
            , 'bronceado': 'rgb(210,180,140)'
            , 'rosado marrón': 'rgb(188,143,143)'
            , 'mocasin': 'rgb(255,228,181)'
            , 'navajo blanco': 'rgb(255,222,173)'
            , 'peach puff': 'rgb(255,218,185)'
            , 'Misty Rose': 'rgb(255,228,225)'
            , 'lavanda se ruboriza': 'rgb(255,240,245)'
            , 'lino': 'rgb(250,240,230)'
            , 'encaje antiguo': 'rgb(253,245,230)'
            , 'papaya látigo': 'rgb(255,239,213)'
            , 'concha de mar': 'rgb(255,245,238)'
            , 'crema de menta': 'rgb(245,255,250)'
            , 'gris pizarra': 'rgb(112,128,144)'
            , 'luz gris pizarra': 'rgb(119,136,153)'
            , 'la luz azul de acero': 'rgb(176,196,222)'
            , 'lavanda': 'rgb(230,230,250)'
            , 'floral blanco': 'rgb(255,250,240)'
            , 'alice azul': 'rgb(240,248,255)'
            , 'fantasma blanco': 'rgb(248,248,255)'
            , 'honeydew': 'rgb(240,255,240)'
            , 'marfil': 'rgb(255,255,240)'
            , 'azur': 'rgb(240,255,255)'
            , 'nieve': 'rgb(255,250,250)'
            , 'negro': 'rgb(0,0,0)'
            , 'oscuro gris': 'rgb(105,105,105)'
            , 'gris': 'rgb(128,128,128)'
            , 'gris oscuro': 'rgb(169,169,169)'
            , 'plata': 'rgb(192,192,192)'
            , 'gris plata': 'rgb(192,192,192)'
            , 'gris humo': 'rgb(47,50,50)'
            , 'gris claro': 'rgb(211,211,211)'
            , 'Gainsboro': 'rgb(220,220,220)'
            , 'humo blanco': 'rgb(245,245,245)'
            , 'blanco': 'rgb(255,255,255)'
            , 'perla': 'rgb(252,242,255)'
            ,
        };

        if (RegRgb.test(color)) {
            return color;
        } else if (RegHex.test(color)) {
            return color;
        } else if (typeof colours[color] !== 'undefined') {
            return colours[color];
        } else if (typeof colours[color] === 'undefined') {
            const colores = color.split(' ');
            if (colores.length > 1) {
                return this.colourNameToRgb(colores[0]);
            } else {
                return 'rgb(73,73,73)';
            }
        }
    }

    quitarAcentos(text) {
        const acentos = 'ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç';
        const original = 'AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc';
        for (let i = 0; i < acentos.length; i++) {
            text = text.replace(new RegExp(acentos.charAt(i), 'g'), original.charAt(i));
        }
        return text;
    }
}
