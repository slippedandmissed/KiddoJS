import { Cell } from "./cell";
import { HistoryStack } from "./historystack";
import { Serializer, state } from "./serializer";
import { Sudoku } from "./sudoku";
import { classes, numerals, Position } from "./tools";

export interface Solutions {
    solutions: string[][][];
    notes: string[][][];
    cancelled: boolean;
};

export class Puzzle {

    private sudoku: Sudoku;
    private title: string;
    private alphabet: string[];
    private selected: Cell[] = [];
    private serializer: Serializer;
    private historyStack: HistoryStack<state>;
    private preSolveState: state;
    private solveCancelled: boolean = false;

    constructor(title: string, sudoku: Sudoku, alphabet: string[] = numerals, serializer: Serializer = null) {
        this.title = title;
        this.sudoku = sudoku;
        this.alphabet = alphabet;

        if (!serializer) {
            serializer = new Serializer(classes);
        }
        this.serializer = serializer;
        this.historyStack = new HistoryStack<string>();

        this.pushState();

        this.getSudokuElement().addEventListener("click", this.onClick.bind(this));
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    private getState(): state {
        return this.serializer.serialize(this.sudoku);
    }

    private pushState(): void {
        this.historyStack.push(this.getState());
    }

    private loadState(state: state): void {
        if (state) {
            this.sudoku = this.serializer.deserialize(state);
            this.selected = [];
            document.querySelectorAll(".cell.selected").forEach((element) => {
                const idParts = element.id.slice(1).split("-");
                const pos = {
                    x: +idParts[0],
                    y: +idParts[1]
                };
                this.selected.push(this.sudoku.getCell(pos));
            })
        }
    }

    private onClick(event: MouseEvent) {
        if (this.preSolveState) {
            return;
        }
        const target = event.target as HTMLElement;
        const oldSelected = [...this.selected];
        if (!event.shiftKey) {
            for (const cell of this.selected) {
                cell.setSelected(false);
            }
            this.selected.length = 0;
        }
        if (target.classList.contains("cell")) {
            const idParts = target.id.slice(1).split("-");
            const pos = {
                x: +idParts[0],
                y: +idParts[1]
            };
            const cell = this.sudoku.getCell(pos);
            cell.setSelected(!oldSelected.includes(cell) || oldSelected.length > 1);
            if (cell.isSelected()) {
                this.selected.push(cell);
            } else {
                const index = this.selected.indexOf(cell);
                if (index >= 0) {
                    this.selected.splice(index, 1);
                }
            }
        }
        this.pushState();
    }

    private onKeyDown(event: KeyboardEvent) {
        // FIXME
        // Find a way to do this without "event.keyCode" as it is deprecated.

        // FIXME
        // Use CMD instead of CTRL on mac
        if (this.preSolveState) {
            return;
        }
        let key = String.fromCharCode(event.keyCode).toUpperCase();

        if (event.ctrlKey) {
            if (key === "Z") {
                this.loadState(this.historyStack.undo());
            }
            if (key === "Y") {
                this.loadState(this.historyStack.redo());
            }
        } else {
            if (this.alphabet.includes(key)) {
                if (event.shiftKey) {
                    let allHave = true;
                    for (const cell of this.selected) {
                        if (!cell.hasNote(key)) {
                            allHave = false;
                            break;
                        }
                    }
                    for (const cell of this.selected) {
                        cell.setNote(key, !allHave);
                    }
                } else {
                    for (const cell of this.selected) {
                        cell.setValue(key);
                    }
                }
                this.pushState();
            } else if (event.key === "Backspace") {
                if (event.shiftKey) {
                    for (const cell of this.selected) {
                        cell.clearNotes();
                    }
                } else {
                    for (const cell of this.selected) {
                        cell.setValue(null);
                    }
                }
                this.pushState();
            }


        }
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getSudoku(): Sudoku {
        return this.sudoku;
    }

    getSudokuElement(): HTMLElement {
        return this.sudoku.getContainer();
    }

    cancelSolve(): void {
        this.solveCancelled = true;
    }

    async isBroken(log: ((x: string) => any) = (_) => { }): Promise<boolean> {
        return !(await this.solve(log, true));
    }

    async solve(log: ((x: string) => any) = (_) => { }, onlyFirstSolution: boolean = false): Promise<Solutions> {
        this.solveCancelled = false;
        this.preSolveState = this.getState();
        log("Starting solve");
        const tempGrid: string[][][] = [];
        const sudokuSize = this.sudoku.getSize();
        for (let y = 0; y < sudokuSize.height; y++) {
            const row: string[][] = [];
            tempGrid.push(row);
            for (let x = 0; x < sudokuSize.width; x++) {
                const pos = { x, y };
                const cell = this.sudoku.getCell(pos);
                const val = cell.getValue();
                if (val) {
                    row.push([val]);
                } else {
                    const notes = cell.getNotes();
                    if (notes.length > 0) {
                        row.push(notes);
                    } else {
                        row.push([...this.alphabet]);
                    }
                }
            }
        }

        for (let y = 0; y < sudokuSize.height; y++) {
            for (let x = 0; x < sudokuSize.width; x++) {
                this.sudoku.getCell({ x, y }).clearNotes();
            }
        }

        const notes: string[][][] = [];
        for (let y = 0; y < sudokuSize.height; y++) {
            const row: string[][] = [];
            notes.push(row);
            for (let x = 0; x < sudokuSize.width; x++) {
                row.push([]);
            }
        }

        const allSolutions = await this.solveFrom(tempGrid, notes, log, onlyFirstSolution);
        if (allSolutions.length === 0) {
            log("No solutions...");
            this.loadState(this.preSolveState);
            this.pushState();
            this.preSolveState = null;
            return { solutions: [], notes: null, cancelled: this.solveCancelled };
        }

        this.loadState(this.preSolveState);
        this.pushState();
        this.preSolveState = null;
        return { solutions: allSolutions, notes, cancelled: this.solveCancelled };
    }

    private async solveFrom(tempGrid: string[][][], notes: string[][][], log: ((x: string) => any), onlyFirstSolution: boolean): Promise<string[][][]> {
        return await new Promise((resolve) => {
            setTimeout(async () => {
                if (this.solveCancelled) {
                    resolve([]);
                    return;
                }
                const sudokuSize = this.sudoku.getSize();

                let mostConstrained: Position = null;
                let mostConstrainedOptionCount: number = Infinity;

                const knowns: string[][] = [];
                for (let y = 0; y < sudokuSize.height; y++) {
                    const row: string[] = [];
                    knowns.push(row);
                    for (let x = 0; x < sudokuSize.width; x++) {
                        const options = tempGrid[y][x];
                        if (options.length === 1) {
                            row.push(options[0]);
                            this.sudoku.getCell({ x, y }).setValue(options[0]);
                        } else {
                            row.push(null);
                        }
                    }
                }


                for (let y = 0; y < sudokuSize.height; y++) {
                    for (let x = 0; x < sudokuSize.width; x++) {
                        if (!knowns[y][x]) {
                            const options = tempGrid[y][x];
                            for (let i = options.length - 1; i >= 0; i--) {
                                knowns[y][x] = options[i];
                                if (!this.isValidSolution(knowns, log)) {
                                    options.splice(i, 1);
                                }
                            }
                            if (options.length === 0) {
                                log(`No candidates for ${x},${y}`);
                                resolve([]);
                                return;
                            } else if (options.length === 1) {
                                knowns[y][x] = options[0];
                            } else {
                                knowns[y][x] = null;
                                if (options.length < mostConstrainedOptionCount) {
                                    mostConstrained = { x, y };
                                    mostConstrainedOptionCount = options.length;
                                }
                            }
                        }
                    }
                }


                if (!mostConstrained) {
                    log("Reached end of dfs");
                    if (this.isValidSolution(knowns, log)) {

                        for (let y = 0; y < tempGrid.length; y++) {
                            for (let x = 0; x < tempGrid[y].length; x++) {
                                const currentNotes = notes[y][x];
                                const option = tempGrid[y][x][0];
                                if (!currentNotes.includes(option)) {
                                    currentNotes.push(option);
                                }

                            }
                        }
                        resolve([knowns]);
                    } else {
                        resolve([]);
                    }
                    return;
                }


                const solutions: string[][][] = [];
                const currentList = tempGrid[mostConstrained.y][mostConstrained.x];
                const cell = this.sudoku.getCell(mostConstrained);
                for (const option of currentList) {
                    log(`Trying "${option}" for ${mostConstrained.x},${mostConstrained.y}`);
                    tempGrid[mostConstrained.y][mostConstrained.x] = [option];
                    knowns[mostConstrained.y][mostConstrained.x] = option;
                    cell.setValue(option);
                    const copyTempGrid: string[][][] = [];
                    for (const row of tempGrid) {
                        const copyRow: string[][] = [];
                        copyTempGrid.push(copyRow);
                        for (const cell of row) {
                            copyRow.push([...cell]);
                        }
                    }
                    const s = await this.solveFrom(copyTempGrid, notes, log, onlyFirstSolution);
                    if (s.length > 0) {
                        if (onlyFirstSolution) {
                            resolve(s);
                            return;
                        }
                        solutions.push(...s);
                    }
                }
                knowns[mostConstrained.y][mostConstrained.x] = null;

                tempGrid[mostConstrained.y][mostConstrained.x] = currentList;
                cell.setValue(currentList.length === 1 ? currentList[0] : null);
                resolve(solutions);
            }, 0);
        });
    }

    private isValidSolution(tempGrid: string[][], log: (x: string) => any): boolean {
        for (const constraint of this.sudoku.getConstraints()) {
            if (constraint.violates(tempGrid)) {
                log(`Violated by constraint: ${constraint.friendlyName()}`)
                return false;
            }
        }
        return true;
    }

    setValuesFromNotes(grid: string[][][]): void {
        this.pushState();
        const sudokuSize = this.sudoku.getSize();
        for (let y = 0; y < sudokuSize.height; y++) {
            for (let x = 0; x < sudokuSize.width; x++) {
                const options: string[] = grid[y][x];
                const cell = this.sudoku.getCell({ x, y });
                cell.clearNotes();
                if (options.length === 1) {
                    cell.setValue(options[0])
                } else {
                    cell.setValue(null);
                    for (const note of options) {
                        cell.addNote(note);
                    }
                }
            }
        }
    }

}