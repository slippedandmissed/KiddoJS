import { Box } from "./constraints/box";
import { Cell } from "./cell";
import { Serializable } from "./serializer";
import { Position, Size } from "./tools";
import { Constraint } from "./constraints/constraint";

export class Sudoku extends Serializable {

    private grid: Cell[][];
    private constraints: Constraint[] = [];

    private size: Size;


    private container: HTMLElement;

    constructor(grid: Cell[][], constraints: Constraint[], container: HTMLElement = null) {
        super("Sudoku");
        this.grid = grid;

        this.size = {
            width: grid[0].length,
            height: grid.length
        };

        if (!container) {
            container = document.createElement("div");
        }
        this.container = container;
        this.container.classList.add("sudoku");

        this.initializeGrid();

        for (const constraint of constraints) {
            this.addConstraint(constraint);
        }
    }

    static deserialize(obj: any) {
        return new Sudoku(obj.grid, obj.constraints, document.querySelector(".sudoku"));
    }

    private initializeGrid() {
        this.container.innerHTML = "";

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {
                const cell = this.grid[y][x];
                const container = cell.getContainer();
                container.style.gridColumnStart = "" + (x + 1);
                container.style.gridRowStart = "" + (y + 1);

                this.container.appendChild(container);
            }
        }
    }

    public addConstraint(constraint: Constraint) {
        this.constraints.push(constraint);
        constraint.initializeContainer();
        this.container.appendChild(constraint.getContainer());
    }

    static CreateStandard(major: number = 3, minor: number = 3): Sudoku {
        const cells: Cell[][] = [];
        const boxes: Box[] = [];

        const size = major * minor;

        for (let i = 0; i < major; i++) {
            for (let j = 0; j < major; j++) {
                boxes.push(new Box(
                    {
                        x: i * minor,
                        y: j * minor
                    },
                    {
                        width: minor,
                        height: minor
                    }
                ));
            }
        }
        for (let y = 0; y < size; y++) {
            cells[y] = [];
            for (let x = 0; x < size; x++) {
                const cell = new Cell(
                    null,
                    []
                );
                cell.setPos({ x, y });
                cells[y].push(cell);
            }
        }

        return new Sudoku(cells, boxes);
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    setCell(pos: Position, cell: Cell) {
        this.grid[pos.y][pos.x].getContainer().remove();
        delete this.grid[pos.y][pos.x];;
        cell.setPos(pos);
        this.grid[pos.y][pos.x] = cell;
        const container = cell.getContainer();
        container.style.gridColumnStart = "" + (pos.x + 1);
        container.style.gridRowStart = "" + (pos.y + 1);

        this.container.appendChild(container);
    }

    getCell(pos: Position) {
        return this.grid[pos.y][pos.x];
    }

}