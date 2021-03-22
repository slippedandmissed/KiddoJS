import { Box } from "./constraints/box";
import { Cell, GivenCell } from "./cell";
import { Sudoku } from "./sudoku";
import { SerializableClasses } from "./serializer";
import { Thermometer } from "./constraints/thermometer";

export const numerals: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const classes: SerializableClasses = {
    "Sudoku": Sudoku,
    "Cell": Cell,
    "GivenCell": GivenCell,
    "Box": Box,
    "Thermometer": Thermometer
};

export interface Position {
    x: number;
    y: number
}

export interface Size {
    width: number;
    height: number;
}

export function createSVGElement(tag: string) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

export function randomString(length: number=10) {
    const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = "";
    for (let i=0; i<length; i++) {
        result += alph.charAt(Math.floor(Math.random() * alph.length));
    }
    return result;
}