import { Constraint } from "./constraint";
import { createSVGElement, Position, randomString, Size } from "../tools";

export class Thermometer extends Constraint {

    private container: HTMLElement;
    private coords: Position[];
    private relativeCoords: Position[];
    private topLeft: Position;
    private size: Size;

    constructor(coords: Position[], container: HTMLElement = null) {
        super("Thermometer");
        this.coords = coords;
        this.container = container;
        let top = Infinity;
        let left = Infinity;
        let bottom = -Infinity;
        let right = -Infinity;
        for (const coord of coords) {
            if (coord.x < left) {
                left = coord.x;
            }
            if (coord.x > right) {
                right = coord.x;
            }
            if (coord.y < top) {
                top = coord.y;
            }
            if (coord.y > bottom) {
                bottom = coord.y;
            }
        }
        this.topLeft = { x: left, y: top };
        this.size = { width: right - left + 1, height: bottom - top + 1 };
        this.relativeCoords = [];
        for (const coord of coords) {
            this.relativeCoords.push({
                x: coord.x - left,
                y: coord.y - top
            });
        }
    }

    static deserialize(obj: any) {
        return new Thermometer(obj.coords, document.querySelector(Thermometer.generateID.bind(obj)()));
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    private static generateID(this: any): string {
        let id = "th";
        for (const point of this.coords) {
            id += `${point.x}-${point.y}-`
        }
        return id.slice(0, -1);
    }

    initializeContainer() {
        if (this.container) {
            this.container.innerHTML = "";
        } else {
            this.container = document.createElement("div");
        }
        this.container.className = "thermometer";
        this.container.classList.add(Thermometer.generateID.bind(this)());
        this.container.style.gridColumnStart = "" + (this.topLeft.x + 1);
        this.container.style.gridColumnEnd = "" + (this.topLeft.x + this.size.width + 1);
        this.container.style.gridRowStart = "" + (this.topLeft.y + 1);
        this.container.style.gridRowEnd = "" + (this.topLeft.y + this.size.height + 1);

        const createBulb = () => {
            const bulb = createSVGElement("circle");
            bulb.setAttribute("cx", "" + (this.relativeCoords[0].x + 0.5));
            bulb.setAttribute("cy", "" + (this.relativeCoords[0].y + 0.5));
            bulb.setAttribute("r", "0.42");
            return bulb;
        }

        let maskID = "mask" + randomString();
        while (document.getElementById(maskID)) {
            maskID = "mask" + randomString();
        }

        const svg = createSVGElement("svg");
        svg.setAttribute("viewBox", `0 0 ${this.size.width} ${this.size.height}`);
        svg.setAttribute("preserveAspectRatio", "none");

        const polyline = createSVGElement("polyline");
        svg.appendChild(polyline);

        const defs = createSVGElement("defs");
        const mask = createSVGElement("mask");
        mask.setAttribute("id", maskID);

        defs.appendChild(mask);

        const bg = createSVGElement("rect");
        bg.setAttribute("x", "0");
        bg.setAttribute("y", "0");
        bg.setAttribute("width", "" + this.size.width);
        bg.setAttribute("height", "" + this.size.height);
        bg.setAttribute("stroke", "none");
        bg.setAttribute("fill", "white");
        mask.appendChild(bg);


        const inner = createSVGElement("polyline");
        inner.classList.add("inner")
        inner.setAttribute("stroke", "black");
        mask.appendChild(inner);

        const bulbMask = createBulb();
        bulbMask.classList.add("mask");
        mask.appendChild(bulbMask);

        svg.appendChild(defs);


        const points: string[] = [];
        for (const pos of this.relativeCoords) {
            points.push(
                `${(pos.x + 0.5)},${(pos.y + 0.5)}`);
        }
        polyline.setAttribute("mask", `url(#${maskID})`)
        polyline.setAttribute("points", points.join(" "));
        inner.setAttribute("points", points.join(" "));

        svg.appendChild(createBulb());


        this.container.appendChild(svg);


    }

}