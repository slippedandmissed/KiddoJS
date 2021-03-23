import { GivenCell } from "./cell";
import { Puzzle } from "./puzzle";
import { Sudoku } from "./sudoku";
import { Thermometer } from "./constraints/thermometer";

const title = "My Sudoku";
const sudoku = Sudoku.CreateStandard();

sudoku.setCell({x: 2, y: 2}, new GivenCell("5"));

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
    document.getElementById("sudoku-wrapper").appendChild(
        puzzle.getSudokuElement()
    );

    const solveButton = document.getElementById("solve-button") as HTMLInputElement;
    const cancelSolveButton = document.getElementById("cancel-solve-button") as HTMLInputElement;
    const logElement = document.getElementById("solve-log");

    cancelSolveButton.onclick = () => {
        puzzle.cancelSolve();
    }

    solveButton.onclick = async () => {
        solveButton.disabled = true;
        cancelSolveButton.disabled = false;
        logElement.innerHTML = "";
        const solutions = await puzzle.solve((x) => {
            // console.log(x);
        });
        solveButton.disabled = false;
        cancelSolveButton.disabled = true;
        if (solutions) {
            puzzle.setValuesFromNotes(solutions.notes);
        }
    };
};