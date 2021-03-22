import { Constraint } from "./constraint";
import { createSVGElement, Position, Size } from "../tools";

export class Thermometer extends Constraint {

    private container: HTMLElement;
    private coords: Position[];
    private relativeCoords: Position[];
    private topLeft: Position;
    private size: Size;

    constructor(coords: Position[], container:HTMLElement=null) {
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
        this.topLeft = {x: left, y: top};
        // const size = Math.max(right-left+1, bottom-top+1);
        // this.size = {width: size, height: size};
        this.size = {width: right-left+1, height: bottom-top+1};
        this.relativeCoords = [];
        for (const coord of coords) {
            this.relativeCoords.push({
                x: coord.x-left,
                y: coord.y-top
            });
        }
    }

    static deserialize(obj: any) {
        return new Thermometer(obj.coords, document.querySelector(`.th${obj.topLeft.x}-${obj.topLeft.y}-${obj.size.width}-${obj.size.height}`));
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    initializeContainer() {
        if (this.container) {
            this.container.innerHTML = "";
        } else {
            this.container = document.createElement("div");
        }
        this.container.className = "thermometer";
        this.container.classList.add(`th${this.topLeft.x}-${this.topLeft.y}-${this.size.width}-${this.size.height}`);
        this.container.style.gridColumnStart = "" + (this.topLeft.x + 1);
        this.container.style.gridColumnEnd = "" + (this.topLeft.x + this.size.width + 1);
        this.container.style.gridRowStart = "" + (this.topLeft.y + 1);
        this.container.style.gridRowEnd = "" + (this.topLeft.y + this.size.height + 1);
        const svg = createSVGElement("svg");
        svg.setAttribute("viewBox", `0 0 ${this.size.width} ${this.size.height}`);
        svg.setAttribute("preserveAspectRatio", "none");

        const polyline = createSVGElement("polyline");
        svg.appendChild(polyline);

        const inner = createSVGElement("polyline");
        inner.classList.add("inner")
        svg.appendChild(inner);


        const points:string[] = [];
        for (const pos of this.relativeCoords) {
            points.push(
                `${(pos.x+0.5)},${(pos.y+0.5)}`);
        }
        polyline.setAttribute("points", points.join(" "));
        inner.setAttribute("points", points.join(" "));

        const bulb = createSVGElement("circle");
        svg.appendChild(bulb);
        
        bulb.setAttribute("cx", ""+(this.relativeCoords[0].x+0.5));
        bulb.setAttribute("cy", ""+(this.relativeCoords[0].y+0.5));
        bulb.setAttribute("r", "0.4");

        this.container.appendChild(svg);
        

    }

}