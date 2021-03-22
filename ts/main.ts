import { GivenCell } from "./cell";
import { Puzzle } from "./puzzle";
import { Sudoku } from "./sudoku";
import { Thermometer } from "./constraints/thermometer";

const title = "My Sudoku";
const sudoku = Sudoku.CreateStandard();

sudoku.setCell({x: 2, y: 3}, new GivenCell("5"));

sudoku.addConstraint(new Thermometer([
    {x: 2, y: 2},
    {x: 3, y: 3},
    {x: 4, y: 2},
    {x: 4, y: 1},
    {x: 3, y: 0},
]));

sudoku.addConstraint(new Thermometer([
    {x: 2, y: 2},
    {x: 1, y: 2},
]));

const puzzle = new Puzzle(title, sudoku);

window.onload = () => {
    document.body.appendChild(
        puzzle.getSudokuElement()
    );
};