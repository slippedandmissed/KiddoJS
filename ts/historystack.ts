export class HistoryStack<T> {

    private maxSize: number;
    private states: T[] = [];
    private pointer: number = -1;

    constructor(maxSize: number = Infinity) {
        this.maxSize = maxSize;
    }

    push(state: T): boolean {
        if (this.states.length === 0 || this.states[this.pointer] !== state) {
            this.pointer++;
            if (this.pointer < this.states.length) {
                this.states.splice(this.pointer);
            }

            if (this.pointer > this.maxSize) {
                this.pointer--;
                this.states.splice(0, 1);
            }
            this.states.push(state);
            return true;
        }
        return false;
    }

    undo(): T {
        if (this.pointer > 0) {
            this.pointer--;
        }
        if (this.pointer < this.states.length) {
            return this.states[this.pointer];
        }

        return null;
    }

    redo(): T {
        if (this.pointer < this.states.length - 1) {
            this.pointer++;
            return this.states[this.pointer];
        }
        return null;
    }

}