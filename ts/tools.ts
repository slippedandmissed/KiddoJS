import { Box } from "./constraints/box";
import { Cell, GivenCell } from "./cell";
import { Sudoku } from "./sudoku";
import { SerializableClasses } from "./serializer";

export const numerals: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const classes: SerializableClasses = {
    "Sudoku": Sudoku,
    "Box": Box,
    "Cell": Cell,
    "GivenCell": GivenCell
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