import { Cell } from "./cell";
import { HistoryStack } from "./historystack";
import { Serializer } from "./serializer";
import { Sudoku } from "./sudoku";
import { classes, numerals } from "./tools";

export class Puzzle {

    private sudoku: Sudoku;
    private title: string;
    private alphabet: string[];
    private selected: Cell[] = [];
    private serializer: Serializer;
    private historyStack: HistoryStack<string>;

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

    private pushState(): void {
        const state = this.serializer.serialize(this.sudoku);
        this.historyStack.push(state);
    }

    private loadState(state: string): void {
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

}