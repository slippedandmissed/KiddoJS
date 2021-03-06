import { Constraint } from "./constraint";
import { Position, Size } from "../tools";

export class Box extends Constraint {

    private topLeft: Position;
    private size: Size;

    private container: HTMLElement;

    constructor(topLeft: Position, size: Size, container: HTMLElement=null) {
        super("Box");
        this.topLeft = topLeft;
        this.size = size;
        this.container = container;
    }

    static deserialize(obj: any) {
        return new Box(obj.topLeft, obj.size, document.querySelector(`.b${obj.topLeft.x}-${obj.topLeft.y}-${obj.size.width}-${obj.size.height}`));
    }

    getTopLeft(): Position {
        return this.topLeft;
    }

    getSize(): Size {
        return this.size;
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    initializeContainer(): void {
        if (this.container) {
            this.container.innerHTML = "";
        } else {
            this.container = document.createElement("div");
        }
        this.container.className = "box middleware";
        this.container.classList.add(`b${this.topLeft.x}-${this.topLeft.y}-${this.size.width}-${this.size.height}`);
        this.container.style.gridColumnStart = "" + (this.topLeft.x + 1);
        this.container.style.gridColumnEnd = "" + (this.topLeft.x + this.size.width + 1);
        this.container.style.gridRowStart = "" + (this.topLeft.y + 1);
        this.container.style.gridRowEnd = "" + (this.topLeft.y + this.size.height + 1);
    }

    friendlyName(): string {
        return `Box (${this.topLeft.x},${this.topLeft.y}) to (${this.topLeft.x+this.size.width},${this.topLeft.y+this.size.height})`;
    }

    violates(grid: string[][]) {
        const soFar: string[] = [];
        for (let y=this.topLeft.y; y<this.topLeft.y+this.size.height; y++) {
            for (let x=this.topLeft.x; x<this.topLeft.x+this.size.width; x++) {
                const item = grid[y][x];
                if (!item) {
                    continue;
                }
                if (soFar.includes(item)) {
                    return true;
                }
                soFar.push(item);
            }
        }
        return false;
    }

}