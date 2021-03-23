import { Constraint } from "./constraint";

export class RowColumnRepeats extends Constraint {

    constructor() {
        super("RowColumnRepeats");
    }

    static deserialize(obj: any): RowColumnRepeats {
        return new RowColumnRepeats();
    }

    initializeContainer(): void {

    }

    getContainer(): HTMLElement {
        return null;
    }

    friendlyName(): string {
        return "Row and column repeats";
    }

    violates(grid: string[][]): boolean {
        for (const row of grid) {
            const filtered = row.filter((x) => !!x);
            if ((new Set(filtered)).size !== filtered.length) {
                return true;
            }
        }

        for (let x = 0; x < grid[0].length; x++) {
            const column: string[] = [];
            for (let y = 0; y < grid.length; y++) {
                const item = grid[y][x];
                if (!item) {
                    continue;
                }
                
                if (column.includes(item)) {
                    return true;
                }
                column.push(item);
            }
        }
        return false;
    }

}