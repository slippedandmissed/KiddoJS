import { Serializable } from "../serializer";

export class Constraint extends Serializable {

    constructor(className: string) {
        super(className);
    }

    public getContainer(): HTMLElement {
        throw new Error("Unimplemented method");
    }

    public initializeContainer(): void {
        throw new Error("Unimplemented method");
    }

    public violates(grid: string[][]): boolean {
        throw new Error("Unimplemented method");
    }

    public friendlyName(): string {
        throw new Error("Unimplemented method");
    }


}