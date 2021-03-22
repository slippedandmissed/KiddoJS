import { Serializable } from "./serializer";
import { Position } from "./tools";

export class Cell extends Serializable{

    private value: string;
    private selectable: boolean = true;
    private selected: boolean = false;
    private container: HTMLElement;
    private pos: Position;
    private valueElement: HTMLElement;
    private notesElement: HTMLElement;
    private notes: string[] = [];
    private notesInnerElements: {[key: string]: HTMLElement} = {};

    constructor(value: string, notes: string[], container: HTMLElement=null) {
        super("Cell")
        if (container) {
            container.innerHTML = "";
        } else {
            container = document.createElement("div");
        }
        this.container = container;
        this.container.classList.add("cell");
        this.container.classList.add("selectable");
        
        this.valueElement = document.createElement("div");
        this.valueElement.classList.add("value");
        this.container.appendChild(this.valueElement);

        this.notesElement = document.createElement("div");
        this.notesElement.classList.add("notes");
        this.container.appendChild(this.notesElement);
        
        this.setValue(value);
        for (const note of notes) {
            this.addNote(note);
        }
    }

    static deserialize(obj: any) {
        const cell = new Cell(obj.value, obj.notes, document.querySelector(`#c${obj.pos.x}-${obj.pos.y}`));
        cell.selectable = obj.selectable;
        cell.setSelected(obj.selected);
        cell.pos = obj.pos;
        return cell;
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    getValue(): string {
        return this.value;
    }

    getPos(): Position {
        return this.pos;
    }

    setPos(pos: Position) {
        this.pos = pos;
        this.container.id=`c${pos.x}-${pos.y}`;
    }

    setValue(value: string): void {
        this.value = value;
        this.valueElement.innerText = value;
    }

    getNotes(): string[] {
        return Object.keys(this.notesInnerElements);
    }

    addNote(note: string): void {
        if (!this.hasNote(note)) {
            this.notes.push(note);
            const elt = document.createElement("span");
            elt.innerText = note;
            elt.classList.add("note-element");
            this.notesInnerElements[note] = elt;
            let added = false;
            for (let i=0; i < this.notesElement.children.length; i++) {
                const node = this.notesElement.children[i];
                if (note < node.textContent) {
                    node.before(elt);
                    added = true;
                    break;
                }
            }
            if (!added) {
                this.notesElement.appendChild(elt);
            }
        }
    }

    removeNote(note: string): void {
        if (this.hasNote(note)) {
            this.notes.splice(this.notes.indexOf(note), 1);
            this.notesInnerElements[note].remove();
            delete this.notesInnerElements[note];
        }
    }

    hasNote(note: string): boolean {
        return this.notesInnerElements.hasOwnProperty(note);
    }

    setNote(note: string, add: boolean): void {
        if (add) {
            this.addNote(note);
        } else {
            this.removeNote(note);
        }
    }

    clearNotes(): void {
        for (const note of this.getNotes()) {
            this.notesInnerElements[note].remove();
            delete this.notesInnerElements[note];
            this.notes.length = 0;
        }
    }

    isSelectable(): boolean {
        return this.selectable;
    }

    setSelectable(selectable: boolean): void {
        this.selectable = selectable;
        this.container.classList[selectable? "add": "remove"]("selectable");
    }

    isSelected(): boolean {
        return this.selected;
    }

    setSelected(selected: boolean): void {
        if (this.selectable) {
            this.selected = selected;
            this.container.classList[selected? "add": "remove"]("selected");
        }
    }

}

export class GivenCell extends Cell {

    constructor(value: string, container: HTMLElement=null) {
        super(value, [], container);
        this.className = "GivenCell";
        this.setSelectable(false);
        this.getContainer().classList.add("given");
    }

    static deserialize(obj: any) {
        const cell = new GivenCell(obj.value, document.querySelector(`#c${obj.pos.x}-${obj.pos.y}`));
        cell.setPos(obj.pos);
        return cell;
    }

}