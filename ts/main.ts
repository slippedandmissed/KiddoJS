import { GivenCell } from "./cell";
import { Puzzle, Solutions } from "./puzzle";
import { Sudoku } from "./sudoku";
import { Thermometer } from "./constraints/thermometer";

const title = "My Sudoku";
const sudoku = Sudoku.CreateStandard();

sudoku.setCell({ x: 2, y: 2 }, new GivenCell("5"));

sudoku.addConstraint(new Thermometer([
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 2 },
    { x: 4, y: 1 },
    { x: 3, y: 0 },
]));

sudoku.addConstraint(new Thermometer([
    { x: 2, y: 2 },
    { x: 1, y: 2 },
]));

const puzzle = new Puzzle(title, sudoku);

window.onload = () => {
    document.getElementById("sudoku-wrapper").appendChild(
        puzzle.getSudokuElement()
    );

    const solveButton = document.getElementById("solve-button") as HTMLInputElement;
    const cancelSolveButton = document.getElementById("cancel-solve-button") as HTMLInputElement;
    const showAllSolutionsButton = document.getElementById("show-all-solutions-button") as HTMLInputElement;
    const solutionCount = document.getElementById("solution-count");
    let solutions: Solutions = null;

    const solveOneButton = document.getElementById("solve-one-button") as HTMLInputElement;
    const cancelSolveOneButton = document.getElementById("cancel-solve-one-button") as HTMLInputElement;
    const showOneSolutionsButton = document.getElementById("show-one-solution-button") as HTMLInputElement;
    const isBroken = document.getElementById("is-broken");
    let oneSolution: Solutions = null;

    const cancelSolve = () => {
        puzzle.cancelSolve();
    }
    cancelSolveButton.onclick = cancelSolve;
    cancelSolveOneButton.onclick = cancelSolve;

    const solve = async (all: boolean) => {
        solveButton.disabled = true;
        solveOneButton.disabled = true;
        cancelSolveButton.disabled = !all;
        cancelSolveOneButton.disabled = all;
        showAllSolutionsButton.disabled = true;
        showOneSolutionsButton.disabled = true;

        const mySolutions = await puzzle.solve(() => { }, !all);
        if (all) {
            solutions = mySolutions;
        } else {
            oneSolution = mySolutions;
        }

        solveButton.disabled = false;
        solveOneButton.disabled = false;
        cancelSolveButton.disabled = true;
        cancelSolveOneButton.disabled = true;
        if (all) {
            solutionCount.innerText = (mySolutions.cancelled ? "At least " : " ") + mySolutions.solutions.length;
            showAllSolutionsButton.disabled = false;
        }
        console.log(mySolutions);
        if (mySolutions.solutions.length > 0) {
            isBroken.innerText = "No";
        } else if (mySolutions.cancelled) {
            isBroken.innerText = "Unclear";
        } else {
            isBroken.innerText = "Yes";
        }

        if (all) {
            showAllSolutionsButton.disabled = mySolutions.solutions.length === 0;
        } else {
            showOneSolutionsButton.disabled = mySolutions.solutions.length === 0;
        }


    };

    solveButton.onclick = () => solve(true);
    solveOneButton.onclick = () => solve(false);

    const loadNotes = (notes: string[][][]) => {
        puzzle.setValuesFromNotes(notes);
    }

    showAllSolutionsButton.onclick = () => loadNotes(solutions.notes);

    showOneSolutionsButton.onclick = () => loadNotes(oneSolution.notes);
};