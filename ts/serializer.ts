interface Replacement {
    predicate: (arg0: any) => {satisfies: boolean, continue: boolean};
    replacement: (arg0: any) => any;
}

export class Serializable {
    public className: string;
    
    constructor(className: string) {
        this.className = className;
    }

    serialize(): Serializable {
        return this;
    }

    deserialize(obj: any) {
        throw new Error("Abstract method must be implemented");
    }
}

export type SerializableClasses = {[key: string]:  {new (..._:any): any; deserialize: Function}};

export class Serializer {

    private types: SerializableClasses = {};

    constructor(types: SerializableClasses) {
        this.types = types;
    }
    
    private dfs (obj: any, replacements: Replacement[]): any {
        let copy: any;
        if (obj instanceof Array) {
            copy = [...obj];
        } else if (obj instanceof Object) {
            copy = {...obj};
        } else {
            copy = obj;
        }
        for (const key in obj) {
            let c = true;
            let satisfies: Replacement = null;
            for (const r of replacements) {
                const pred = r.predicate(copy[key]);
                if (pred.satisfies) {
                    satisfies = r;
                    if (!pred.continue) {
                        c = false;
                    }
                    break;
                }
            }
            if (c) {
                copy[key] = this.dfs(copy[key], replacements);
            }
            if (satisfies) {
                copy[key] = satisfies.replacement(copy[key]);
            }
        }
        return copy;
    }

    serialize(object: object): string {
        return JSON.stringify(object);
    }

    deserialize(serialized: string): any {
        const replacements: Replacement[] = [
            {
                predicate: (obj) => {return {satisfies: typeof(obj) === "string", continue: false}},
                replacement: (obj) => obj
            },
            {
                predicate: (obj) => {return {satisfies: Object.keys(this.types).includes(obj?.className), continue: true}},
                replacement: (obj) => {
                    const des = this.types[obj.className].deserialize(obj);
                    return des;
                }
            }
        ]
        return this.dfs({object: JSON.parse(serialized)}, replacements).object;
    }

}
