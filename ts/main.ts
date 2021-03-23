import { GivenCell } from "./cell";
import { Puzzle } from "./puzzle";
import { Sudoku } from "./sudoku";
import { Thermometer } from "./constraints/thermometer";
import { numerals } from "./tools";

const title = "My Sudoku";
const sudoku = Sudoku.CreateStandard();

for (let y=0; y<9;y++) {
    for (let x=0; x<9; x++) {
        if (y >= 6) {
            continue;
        }
        sudoku.setCell({x, y}, new GivenCell(numerals[(x+3*y+Math.floor(y/3))%9]));
    }
}

// sudoku.addConstraint(new Thermometer([
//     {x: 2, y: 2},
//     {x: 3, y: 3},
//     {x: 4, y: 2},
//     {x: 4, y: 1},
//     {x: 3, y: 0},
// ]));

// sudoku.addConstraint(new Thermometer([
//     {x: 2, y: 2},
//     {x: 1, y: 2},
// ]));

const puzzle = new Puzzle(title, sudoku);

window.onload = () => {
    document.getElementById("sudoku-wrapper").appendChild(
        puzzle.getSudokuElement()
    );

    document.getElementById("solve-button").onclick = async () => {
        const logElement = document.getElementById("solve-log");
        logElement.innerHTML = "";
        const solutions  = await puzzle.solve((x) => {
            // logElement.innerText += x
            // logElement.scrollTop = logElement.scrollHeight;
        });
        console.log(solutions);
        puzzle.getSudoku().setValuesFromGrid(solutions);
    };
};