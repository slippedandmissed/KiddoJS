/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./ts/serializer.ts
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var Serializable = (function () {
    function Serializable(className) {
        this.className = className;
    }
    Serializable.prototype.serialize = function () {
        return this;
    };
    Serializable.prototype.deserialize = function (obj) {
        throw new Error("Abstract method must be implemented");
    };
    return Serializable;
}());

var Serializer = (function () {
    function Serializer(types) {
        this.types = {};
        this.types = types;
    }
    Serializer.prototype.dfs = function (obj, replacements) {
        var copy;
        if (obj instanceof Array) {
            copy = __spreadArray([], obj);
        }
        else if (obj instanceof Object) {
            copy = __assign({}, obj);
        }
        else {
            copy = obj;
        }
        for (var key in obj) {
            var c = true;
            var satisfies = null;
            for (var _i = 0, replacements_1 = replacements; _i < replacements_1.length; _i++) {
                var r = replacements_1[_i];
                var pred = r.predicate(copy[key]);
                if (pred.satisfies) {
                    satisfies = r;
                    if (!pred["continue"]) {
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
    };
    Serializer.prototype.serialize = function (object) {
        return JSON.stringify(object);
    };
    Serializer.prototype.deserialize = function (serialized) {
        var _this = this;
        var replacements = [
            {
                predicate: function (obj) { return { satisfies: typeof (obj) === "string", "continue": false }; },
                replacement: function (obj) { return obj; }
            },
            {
                predicate: function (obj) { return { satisfies: Object.keys(_this.types).includes(obj === null || obj === void 0 ? void 0 : obj.className), "continue": true }; },
                replacement: function (obj) {
                    var des = _this.types[obj.className].deserialize(obj);
                    return des;
                }
            }
        ];
        return this.dfs({ object: JSON.parse(serialized) }, replacements).object;
    };
    return Serializer;
}());


;// CONCATENATED MODULE: ./ts/cell.ts
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var Cell = (function (_super) {
    __extends(Cell, _super);
    function Cell(value, notes, container) {
        if (container === void 0) { container = null; }
        var _this = _super.call(this, "Cell") || this;
        _this.selectable = true;
        _this.selected = false;
        _this.notes = [];
        _this.notesInnerElements = {};
        if (container) {
            container.innerHTML = "";
        }
        else {
            container = document.createElement("div");
        }
        _this.container = container;
        _this.container.classList.add("cell");
        _this.container.classList.add("selectable");
        _this.valueElement = document.createElement("div");
        _this.valueElement.classList.add("value");
        _this.container.appendChild(_this.valueElement);
        _this.notesElement = document.createElement("div");
        _this.notesElement.classList.add("notes");
        _this.container.appendChild(_this.notesElement);
        _this.setValue(value);
        for (var _i = 0, notes_1 = notes; _i < notes_1.length; _i++) {
            var note = notes_1[_i];
            _this.addNote(note);
        }
        return _this;
    }
    Cell.deserialize = function (obj) {
        var cell = new Cell(obj.value, obj.notes, document.querySelector("#c" + obj.pos.x + "-" + obj.pos.y));
        cell.selectable = obj.selectable;
        cell.setSelected(obj.selected);
        cell.pos = obj.pos;
        return cell;
    };
    Cell.prototype.getContainer = function () {
        return this.container;
    };
    Cell.prototype.getValue = function () {
        return this.value;
    };
    Cell.prototype.getPos = function () {
        return this.pos;
    };
    Cell.prototype.setPos = function (pos) {
        this.pos = pos;
        this.container.id = "c" + pos.x + "-" + pos.y;
    };
    Cell.prototype.setValue = function (value) {
        this.value = value;
        this.valueElement.innerText = value;
    };
    Cell.prototype.getNotes = function () {
        return Object.keys(this.notesInnerElements);
    };
    Cell.prototype.addNote = function (note) {
        if (!this.hasNote(note)) {
            this.notes.push(note);
            var elt = document.createElement("span");
            elt.innerText = note;
            elt.classList.add("note-element");
            this.notesInnerElements[note] = elt;
            var added = false;
            for (var i = 0; i < this.notesElement.children.length; i++) {
                var node = this.notesElement.children[i];
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
    };
    Cell.prototype.removeNote = function (note) {
        if (this.hasNote(note)) {
            this.notes.splice(this.notes.indexOf(note), 1);
            this.notesInnerElements[note].remove();
            delete this.notesInnerElements[note];
        }
    };
    Cell.prototype.hasNote = function (note) {
        return this.notesInnerElements.hasOwnProperty(note);
    };
    Cell.prototype.setNote = function (note, add) {
        if (add) {
            this.addNote(note);
        }
        else {
            this.removeNote(note);
        }
    };
    Cell.prototype.clearNotes = function () {
        for (var _i = 0, _a = this.getNotes(); _i < _a.length; _i++) {
            var note = _a[_i];
            this.notesInnerElements[note].remove();
            delete this.notesInnerElements[note];
            this.notes.length = 0;
        }
    };
    Cell.prototype.isSelectable = function () {
        return this.selectable;
    };
    Cell.prototype.setSelectable = function (selectable) {
        this.selectable = selectable;
        this.container.classList[selectable ? "add" : "remove"]("selectable");
    };
    Cell.prototype.isSelected = function () {
        return this.selected;
    };
    Cell.prototype.setSelected = function (selected) {
        if (this.selectable) {
            this.selected = selected;
            this.container.classList[selected ? "add" : "remove"]("selected");
        }
    };
    return Cell;
}(Serializable));

var GivenCell = (function (_super) {
    __extends(GivenCell, _super);
    function GivenCell(value, container) {
        if (container === void 0) { container = null; }
        var _this = _super.call(this, value, [], container) || this;
        _this.className = "GivenCell";
        _this.setSelectable(false);
        _this.getContainer().classList.add("given");
        return _this;
    }
    GivenCell.deserialize = function (obj) {
        var cell = new GivenCell(obj.value, document.querySelector("#c" + obj.pos.x + "-" + obj.pos.y));
        cell.setPos(obj.pos);
        return cell;
    };
    return GivenCell;
}(Cell));


;// CONCATENATED MODULE: ./ts/historystack.ts
var HistoryStack = (function () {
    function HistoryStack(maxSize) {
        if (maxSize === void 0) { maxSize = Infinity; }
        this.states = [];
        this.pointer = -1;
        this.maxSize = maxSize;
    }
    HistoryStack.prototype.push = function (state) {
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
    };
    HistoryStack.prototype.undo = function () {
        if (this.pointer > 0) {
            this.pointer--;
        }
        if (this.pointer < this.states.length) {
            return this.states[this.pointer];
        }
        return null;
    };
    HistoryStack.prototype.redo = function () {
        if (this.pointer < this.states.length - 1) {
            this.pointer++;
            return this.states[this.pointer];
        }
        return null;
    };
    return HistoryStack;
}());


;// CONCATENATED MODULE: ./ts/constraints/constraint.ts
var constraint_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var Constraint = (function (_super) {
    constraint_extends(Constraint, _super);
    function Constraint(className) {
        return _super.call(this, className) || this;
    }
    Constraint.prototype.getContainer = function () {
        throw new Error("Unimplemented method");
    };
    Constraint.prototype.initializeContainer = function () {
        throw new Error("Unimplemented method");
    };
    Constraint.prototype.violates = function (grid) {
        throw new Error("Unimplemented method");
    };
    Constraint.prototype.friendlyName = function () {
        throw new Error("Unimplemented method");
    };
    return Constraint;
}(Serializable));


;// CONCATENATED MODULE: ./ts/constraints/box.ts
var box_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var Box = (function (_super) {
    box_extends(Box, _super);
    function Box(topLeft, size, container) {
        if (container === void 0) { container = null; }
        var _this = _super.call(this, "Box") || this;
        _this.topLeft = topLeft;
        _this.size = size;
        _this.container = container;
        return _this;
    }
    Box.deserialize = function (obj) {
        return new Box(obj.topLeft, obj.size, document.querySelector(".b" + obj.topLeft.x + "-" + obj.topLeft.y + "-" + obj.size.width + "-" + obj.size.height));
    };
    Box.prototype.getTopLeft = function () {
        return this.topLeft;
    };
    Box.prototype.getSize = function () {
        return this.size;
    };
    Box.prototype.getContainer = function () {
        return this.container;
    };
    Box.prototype.initializeContainer = function () {
        if (this.container) {
            this.container.innerHTML = "";
        }
        else {
            this.container = document.createElement("div");
        }
        this.container.className = "box middleware";
        this.container.classList.add("b" + this.topLeft.x + "-" + this.topLeft.y + "-" + this.size.width + "-" + this.size.height);
        this.container.style.gridColumnStart = "" + (this.topLeft.x + 1);
        this.container.style.gridColumnEnd = "" + (this.topLeft.x + this.size.width + 1);
        this.container.style.gridRowStart = "" + (this.topLeft.y + 1);
        this.container.style.gridRowEnd = "" + (this.topLeft.y + this.size.height + 1);
    };
    Box.prototype.friendlyName = function () {
        return "Box (" + this.topLeft.x + "," + this.topLeft.y + ") to (" + (this.topLeft.x + this.size.width) + "," + (this.topLeft.y + this.size.height) + ")";
    };
    Box.prototype.violates = function (grid) {
        var soFar = [];
        for (var y = this.topLeft.y; y < this.topLeft.y + this.size.height; y++) {
            for (var x = this.topLeft.x; x < this.topLeft.x + this.size.width; x++) {
                var item = grid[y][x];
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
    };
    return Box;
}(Constraint));


;// CONCATENATED MODULE: ./ts/constraints/rowcolumnrepeats.ts
var rowcolumnrepeats_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var RowColumnRepeats = (function (_super) {
    rowcolumnrepeats_extends(RowColumnRepeats, _super);
    function RowColumnRepeats() {
        return _super.call(this, "RowColumnRepeats") || this;
    }
    RowColumnRepeats.deserialize = function (obj) {
        return new RowColumnRepeats();
    };
    RowColumnRepeats.prototype.initializeContainer = function () {
    };
    RowColumnRepeats.prototype.getContainer = function () {
        return null;
    };
    RowColumnRepeats.prototype.friendlyName = function () {
        return "Row and column repeats";
    };
    RowColumnRepeats.prototype.violates = function (grid) {
        for (var _i = 0, grid_1 = grid; _i < grid_1.length; _i++) {
            var row = grid_1[_i];
            var filtered = row.filter(function (x) { return !!x; });
            if ((new Set(filtered)).size !== filtered.length) {
                return true;
            }
        }
        for (var x = 0; x < grid[0].length; x++) {
            var column = [];
            for (var y = 0; y < grid.length; y++) {
                var item = grid[y][x];
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
    };
    return RowColumnRepeats;
}(Constraint));


;// CONCATENATED MODULE: ./ts/sudoku.ts
var sudoku_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var Sudoku = (function (_super) {
    sudoku_extends(Sudoku, _super);
    function Sudoku(grid, constraints, container) {
        if (container === void 0) { container = null; }
        var _this = _super.call(this, "Sudoku") || this;
        _this.constraints = [];
        _this.grid = grid;
        _this.size = {
            width: grid[0].length,
            height: grid.length
        };
        if (!container) {
            container = document.createElement("div");
        }
        _this.container = container;
        _this.container.classList.add("sudoku");
        _this.initializeGrid();
        for (var _i = 0, constraints_1 = constraints; _i < constraints_1.length; _i++) {
            var constraint = constraints_1[_i];
            _this.addConstraint(constraint);
        }
        return _this;
    }
    Sudoku.deserialize = function (obj) {
        return new Sudoku(obj.grid, obj.constraints, document.querySelector(".sudoku"));
    };
    Sudoku.prototype.initializeGrid = function () {
        this.container.innerHTML = "";
        for (var y = 0; y < this.size.height; y++) {
            for (var x = 0; x < this.size.width; x++) {
                var cell = this.grid[y][x];
                var container = cell.getContainer();
                container.style.gridColumnStart = "" + (x + 1);
                container.style.gridRowStart = "" + (y + 1);
                this.container.appendChild(container);
            }
        }
    };
    Sudoku.prototype.addConstraint = function (constraint) {
        this.constraints.push(constraint);
        constraint.initializeContainer();
        var container = constraint.getContainer();
        if (container) {
            this.container.appendChild(constraint.getContainer());
        }
    };
    Sudoku.CreateStandard = function (major, minor) {
        if (major === void 0) { major = 3; }
        if (minor === void 0) { minor = 3; }
        var cells = [];
        var constraints = [];
        var size = major * minor;
        for (var i = 0; i < major; i++) {
            for (var j = 0; j < major; j++) {
                constraints.push(new Box({
                    x: i * minor,
                    y: j * minor
                }, {
                    width: minor,
                    height: minor
                }));
            }
        }
        constraints.push(new RowColumnRepeats());
        for (var y = 0; y < size; y++) {
            cells[y] = [];
            for (var x = 0; x < size; x++) {
                var cell = new Cell(null, []);
                cell.setPos({ x: x, y: y });
                cells[y].push(cell);
            }
        }
        return new Sudoku(cells, constraints);
    };
    Sudoku.prototype.getSize = function () {
        return this.size;
    };
    Sudoku.prototype.getConstraints = function () {
        return this.constraints;
    };
    Sudoku.prototype.getContainer = function () {
        return this.container;
    };
    Sudoku.prototype.setCell = function (pos, cell) {
        this.grid[pos.y][pos.x].getContainer().remove();
        delete this.grid[pos.y][pos.x];
        ;
        cell.setPos(pos);
        this.grid[pos.y][pos.x] = cell;
        var container = cell.getContainer();
        container.style.gridColumnStart = "" + (pos.x + 1);
        container.style.gridRowStart = "" + (pos.y + 1);
        this.container.appendChild(container);
    };
    Sudoku.prototype.getCell = function (pos) {
        return this.grid[pos.y][pos.x];
    };
    return Sudoku;
}(Serializable));


;// CONCATENATED MODULE: ./ts/constraints/thermometer.ts
var thermometer_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var Thermometer = (function (_super) {
    thermometer_extends(Thermometer, _super);
    function Thermometer(coords, container) {
        if (container === void 0) { container = null; }
        var _this = _super.call(this, "Thermometer") || this;
        _this.coords = coords;
        _this.container = container;
        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;
        for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
            var coord = coords_1[_i];
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
        _this.topLeft = { x: left, y: top };
        _this.size = { width: right - left + 1, height: bottom - top + 1 };
        _this.relativeCoords = [];
        for (var _a = 0, coords_2 = coords; _a < coords_2.length; _a++) {
            var coord = coords_2[_a];
            _this.relativeCoords.push({
                x: coord.x - left,
                y: coord.y - top
            });
        }
        return _this;
    }
    Thermometer.deserialize = function (obj) {
        return new Thermometer(obj.coords, document.querySelector(Thermometer.generateID.bind(obj)()));
    };
    Thermometer.prototype.getContainer = function () {
        return this.container;
    };
    Thermometer.generateID = function () {
        var id = "th";
        for (var _i = 0, _a = this.coords; _i < _a.length; _i++) {
            var point = _a[_i];
            id += point.x + "-" + point.y + "-";
        }
        return id.slice(0, -1);
    };
    Thermometer.prototype.initializeContainer = function () {
        var _this = this;
        if (this.container) {
            this.container.innerHTML = "";
        }
        else {
            this.container = document.createElement("div");
        }
        this.container.className = "thermometer middleware";
        this.container.classList.add(Thermometer.generateID.bind(this)());
        this.container.style.gridColumnStart = "" + (this.topLeft.x + 1);
        this.container.style.gridColumnEnd = "" + (this.topLeft.x + this.size.width + 1);
        this.container.style.gridRowStart = "" + (this.topLeft.y + 1);
        this.container.style.gridRowEnd = "" + (this.topLeft.y + this.size.height + 1);
        var createBulb = function () {
            var bulb = createSVGElement("circle");
            bulb.setAttribute("cx", "" + (_this.relativeCoords[0].x + 0.5));
            bulb.setAttribute("cy", "" + (_this.relativeCoords[0].y + 0.5));
            bulb.setAttribute("r", "0.42");
            return bulb;
        };
        var maskID = "mask" + randomString();
        while (document.getElementById(maskID)) {
            maskID = "mask" + randomString();
        }
        var svg = createSVGElement("svg");
        svg.setAttribute("viewBox", "0 0 " + this.size.width + " " + this.size.height);
        svg.setAttribute("preserveAspectRatio", "none");
        var polyline = createSVGElement("polyline");
        svg.appendChild(polyline);
        var defs = createSVGElement("defs");
        var mask = createSVGElement("mask");
        mask.setAttribute("id", maskID);
        defs.appendChild(mask);
        var bg = createSVGElement("rect");
        bg.setAttribute("x", "0");
        bg.setAttribute("y", "0");
        bg.setAttribute("width", "" + this.size.width);
        bg.setAttribute("height", "" + this.size.height);
        bg.setAttribute("stroke", "none");
        bg.setAttribute("fill", "white");
        mask.appendChild(bg);
        var inner = createSVGElement("polyline");
        inner.classList.add("inner");
        inner.setAttribute("stroke", "black");
        mask.appendChild(inner);
        var bulbMask = createBulb();
        bulbMask.classList.add("mask");
        mask.appendChild(bulbMask);
        svg.appendChild(defs);
        var points = [];
        for (var _i = 0, _a = this.relativeCoords; _i < _a.length; _i++) {
            var pos = _a[_i];
            points.push((pos.x + 0.5) + "," + (pos.y + 0.5));
        }
        polyline.setAttribute("mask", "url(#" + maskID + ")");
        polyline.setAttribute("points", points.join(" "));
        inner.setAttribute("points", points.join(" "));
        svg.appendChild(createBulb());
        this.container.appendChild(svg);
    };
    Thermometer.prototype.friendlyName = function () {
        var points = this.coords.map(function (x) { return "(" + (x.x, x.y) + ")"; });
        return "Thermometer through " + points.join(", ");
    };
    Thermometer.prototype.violates = function (grid) {
        var min = -Infinity;
        for (var _i = 0, _a = this.coords; _i < _a.length; _i++) {
            var coord = _a[_i];
            var val = grid[coord.y][coord.x];
            if (val) {
                if (+val <= min) {
                    return true;
                }
                min = +val;
            }
            else {
                min++;
            }
        }
        return false;
    };
    return Thermometer;
}(Constraint));


;// CONCATENATED MODULE: ./ts/tools.ts





var numerals = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var classes = {
    "Sudoku": Sudoku,
    "Cell": Cell,
    "GivenCell": GivenCell,
    "Box": Box,
    "Thermometer": Thermometer,
    "RowColumnRepeats": RowColumnRepeats
};
function createSVGElement(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
}
function randomString(length) {
    if (length === void 0) { length = 10; }
    var alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = "";
    for (var i = 0; i < length; i++) {
        result += alph.charAt(Math.floor(Math.random() * alph.length));
    }
    return result;
}

;// CONCATENATED MODULE: ./ts/puzzle.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var puzzle_spreadArray = (undefined && undefined.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};



;
var Puzzle = (function () {
    function Puzzle(title, sudoku, alphabet, serializer) {
        if (alphabet === void 0) { alphabet = numerals; }
        if (serializer === void 0) { serializer = null; }
        this.selected = [];
        this.solveCancelled = false;
        this.title = title;
        this.sudoku = sudoku;
        this.alphabet = alphabet;
        if (!serializer) {
            serializer = new Serializer(classes);
        }
        this.serializer = serializer;
        this.historyStack = new HistoryStack();
        this.pushState();
        this.getSudokuElement().addEventListener("click", this.onClick.bind(this));
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }
    Puzzle.prototype.getState = function () {
        return this.serializer.serialize(this.sudoku);
    };
    Puzzle.prototype.pushState = function () {
        this.historyStack.push(this.getState());
    };
    Puzzle.prototype.loadState = function (state) {
        var _this = this;
        if (state) {
            this.sudoku = this.serializer.deserialize(state);
            this.selected = [];
            document.querySelectorAll(".cell.selected").forEach(function (element) {
                var idParts = element.id.slice(1).split("-");
                var pos = {
                    x: +idParts[0],
                    y: +idParts[1]
                };
                _this.selected.push(_this.sudoku.getCell(pos));
            });
        }
    };
    Puzzle.prototype.onClick = function (event) {
        if (this.preSolveState) {
            return;
        }
        var target = event.target;
        var oldSelected = puzzle_spreadArray([], this.selected);
        if (!event.shiftKey) {
            for (var _i = 0, _a = this.selected; _i < _a.length; _i++) {
                var cell = _a[_i];
                cell.setSelected(false);
            }
            this.selected.length = 0;
        }
        if (target.classList.contains("cell")) {
            var idParts = target.id.slice(1).split("-");
            var pos = {
                x: +idParts[0],
                y: +idParts[1]
            };
            var cell = this.sudoku.getCell(pos);
            cell.setSelected(!oldSelected.includes(cell) || oldSelected.length > 1);
            if (cell.isSelected()) {
                this.selected.push(cell);
            }
            else {
                var index = this.selected.indexOf(cell);
                if (index >= 0) {
                    this.selected.splice(index, 1);
                }
            }
        }
        this.pushState();
    };
    Puzzle.prototype.onKeyDown = function (event) {
        if (this.preSolveState) {
            return;
        }
        var key = String.fromCharCode(event.keyCode).toUpperCase();
        if (event.ctrlKey) {
            if (key === "Z") {
                this.loadState(this.historyStack.undo());
            }
            if (key === "Y") {
                this.loadState(this.historyStack.redo());
            }
        }
        else {
            if (this.alphabet.includes(key)) {
                if (event.shiftKey) {
                    var allHave = true;
                    for (var _i = 0, _a = this.selected; _i < _a.length; _i++) {
                        var cell = _a[_i];
                        if (!cell.hasNote(key)) {
                            allHave = false;
                            break;
                        }
                    }
                    for (var _b = 0, _c = this.selected; _b < _c.length; _b++) {
                        var cell = _c[_b];
                        cell.setNote(key, !allHave);
                    }
                }
                else {
                    for (var _d = 0, _e = this.selected; _d < _e.length; _d++) {
                        var cell = _e[_d];
                        cell.setValue(key);
                    }
                }
                this.pushState();
            }
            else if (event.key === "Backspace") {
                if (event.shiftKey) {
                    for (var _f = 0, _g = this.selected; _f < _g.length; _f++) {
                        var cell = _g[_f];
                        cell.clearNotes();
                    }
                }
                else {
                    for (var _h = 0, _j = this.selected; _h < _j.length; _h++) {
                        var cell = _j[_h];
                        cell.setValue(null);
                    }
                }
                this.pushState();
            }
        }
    };
    Puzzle.prototype.getTitle = function () {
        return this.title;
    };
    Puzzle.prototype.setTitle = function (title) {
        this.title = title;
    };
    Puzzle.prototype.getSudoku = function () {
        return this.sudoku;
    };
    Puzzle.prototype.getSudokuElement = function () {
        return this.sudoku.getContainer();
    };
    Puzzle.prototype.cancelSolve = function () {
        this.solveCancelled = true;
    };
    Puzzle.prototype.isBroken = function (log) {
        if (log === void 0) { log = function (_) { }; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.solve(log, true)];
                    case 1: return [2, !(_a.sent())];
                }
            });
        });
    };
    Puzzle.prototype.solve = function (log, onlyFirstSolution) {
        if (log === void 0) { log = function (_) { }; }
        if (onlyFirstSolution === void 0) { onlyFirstSolution = false; }
        return __awaiter(this, void 0, void 0, function () {
            var tempGrid, sudokuSize, y, row, x, pos, cell, val, notes_1, y, x, notes, y, row, x, allSolutions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.solveCancelled = false;
                        this.preSolveState = this.getState();
                        log("Starting solve");
                        tempGrid = [];
                        sudokuSize = this.sudoku.getSize();
                        for (y = 0; y < sudokuSize.height; y++) {
                            row = [];
                            tempGrid.push(row);
                            for (x = 0; x < sudokuSize.width; x++) {
                                pos = { x: x, y: y };
                                cell = this.sudoku.getCell(pos);
                                val = cell.getValue();
                                if (val) {
                                    row.push([val]);
                                }
                                else {
                                    notes_1 = cell.getNotes();
                                    if (notes_1.length > 0) {
                                        row.push(notes_1);
                                    }
                                    else {
                                        row.push(puzzle_spreadArray([], this.alphabet));
                                    }
                                }
                            }
                        }
                        for (y = 0; y < sudokuSize.height; y++) {
                            for (x = 0; x < sudokuSize.width; x++) {
                                this.sudoku.getCell({ x: x, y: y }).clearNotes();
                            }
                        }
                        notes = [];
                        for (y = 0; y < sudokuSize.height; y++) {
                            row = [];
                            notes.push(row);
                            for (x = 0; x < sudokuSize.width; x++) {
                                row.push([]);
                            }
                        }
                        return [4, this.solveFrom(tempGrid, notes, log, onlyFirstSolution)];
                    case 1:
                        allSolutions = _a.sent();
                        if (allSolutions.length === 0) {
                            log("No solutions...");
                            this.loadState(this.preSolveState);
                            this.pushState();
                            this.preSolveState = null;
                            return [2, { solutions: [], notes: null, cancelled: this.solveCancelled }];
                        }
                        this.loadState(this.preSolveState);
                        this.pushState();
                        this.preSolveState = null;
                        return [2, { solutions: allSolutions, notes: notes, cancelled: this.solveCancelled }];
                }
            });
        });
    };
    Puzzle.prototype.solveFrom = function (tempGrid, notes, log, onlyFirstSolution) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, new Promise(function (resolve) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var sudokuSize, mostConstrained, mostConstrainedOptionCount, knowns, y, row, x, options, y, x, options, i, y, x, currentNotes, option, solutions, currentList, cell, _i, currentList_1, option, copyTempGrid, _a, tempGrid_1, row, copyRow, _b, row_1, cell_1, s;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (this.solveCancelled) {
                                                resolve([]);
                                                return [2];
                                            }
                                            sudokuSize = this.sudoku.getSize();
                                            mostConstrained = null;
                                            mostConstrainedOptionCount = Infinity;
                                            knowns = [];
                                            for (y = 0; y < sudokuSize.height; y++) {
                                                row = [];
                                                knowns.push(row);
                                                for (x = 0; x < sudokuSize.width; x++) {
                                                    options = tempGrid[y][x];
                                                    if (options.length === 1) {
                                                        row.push(options[0]);
                                                        this.sudoku.getCell({ x: x, y: y }).setValue(options[0]);
                                                    }
                                                    else {
                                                        row.push(null);
                                                    }
                                                }
                                            }
                                            for (y = 0; y < sudokuSize.height; y++) {
                                                for (x = 0; x < sudokuSize.width; x++) {
                                                    if (!knowns[y][x]) {
                                                        options = tempGrid[y][x];
                                                        for (i = options.length - 1; i >= 0; i--) {
                                                            knowns[y][x] = options[i];
                                                            if (!this.isValidSolution(knowns, log)) {
                                                                options.splice(i, 1);
                                                            }
                                                        }
                                                        if (options.length === 0) {
                                                            log("No candidates for " + x + "," + y);
                                                            resolve([]);
                                                            return [2];
                                                        }
                                                        else if (options.length === 1) {
                                                            knowns[y][x] = options[0];
                                                        }
                                                        else {
                                                            knowns[y][x] = null;
                                                            if (options.length < mostConstrainedOptionCount) {
                                                                mostConstrained = { x: x, y: y };
                                                                mostConstrainedOptionCount = options.length;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if (!mostConstrained) {
                                                log("Reached end of dfs");
                                                if (this.isValidSolution(knowns, log)) {
                                                    for (y = 0; y < tempGrid.length; y++) {
                                                        for (x = 0; x < tempGrid[y].length; x++) {
                                                            currentNotes = notes[y][x];
                                                            option = tempGrid[y][x][0];
                                                            if (!currentNotes.includes(option)) {
                                                                currentNotes.push(option);
                                                            }
                                                        }
                                                    }
                                                    resolve([knowns]);
                                                }
                                                else {
                                                    resolve([]);
                                                }
                                                return [2];
                                            }
                                            solutions = [];
                                            currentList = tempGrid[mostConstrained.y][mostConstrained.x];
                                            cell = this.sudoku.getCell(mostConstrained);
                                            _i = 0, currentList_1 = currentList;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < currentList_1.length)) return [3, 4];
                                            option = currentList_1[_i];
                                            log("Trying \"" + option + "\" for " + mostConstrained.x + "," + mostConstrained.y);
                                            tempGrid[mostConstrained.y][mostConstrained.x] = [option];
                                            knowns[mostConstrained.y][mostConstrained.x] = option;
                                            cell.setValue(option);
                                            copyTempGrid = [];
                                            for (_a = 0, tempGrid_1 = tempGrid; _a < tempGrid_1.length; _a++) {
                                                row = tempGrid_1[_a];
                                                copyRow = [];
                                                copyTempGrid.push(copyRow);
                                                for (_b = 0, row_1 = row; _b < row_1.length; _b++) {
                                                    cell_1 = row_1[_b];
                                                    copyRow.push(puzzle_spreadArray([], cell_1));
                                                }
                                            }
                                            return [4, this.solveFrom(copyTempGrid, notes, log, onlyFirstSolution)];
                                        case 2:
                                            s = _c.sent();
                                            if (s.length > 0) {
                                                if (onlyFirstSolution) {
                                                    resolve(s);
                                                    return [2];
                                                }
                                                solutions.push.apply(solutions, s);
                                            }
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3, 1];
                                        case 4:
                                            knowns[mostConstrained.y][mostConstrained.x] = null;
                                            tempGrid[mostConstrained.y][mostConstrained.x] = currentList;
                                            cell.setValue(currentList.length === 1 ? currentList[0] : null);
                                            resolve(solutions);
                                            return [2];
                                    }
                                });
                            }); }, 0);
                        })];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Puzzle.prototype.isValidSolution = function (tempGrid, log) {
        for (var _i = 0, _a = this.sudoku.getConstraints(); _i < _a.length; _i++) {
            var constraint = _a[_i];
            if (constraint.violates(tempGrid)) {
                log("Violated by constraint: " + constraint.friendlyName());
                return false;
            }
        }
        return true;
    };
    Puzzle.prototype.setValuesFromNotes = function (grid) {
        this.pushState();
        var sudokuSize = this.sudoku.getSize();
        for (var y = 0; y < sudokuSize.height; y++) {
            for (var x = 0; x < sudokuSize.width; x++) {
                var options = grid[y][x];
                var cell = this.sudoku.getCell({ x: x, y: y });
                cell.clearNotes();
                if (options.length === 1) {
                    cell.setValue(options[0]);
                }
                else {
                    cell.setValue(null);
                    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                        var note = options_1[_i];
                        cell.addNote(note);
                    }
                }
            }
        }
    };
    return Puzzle;
}());


;// CONCATENATED MODULE: ./ts/main.ts
var main_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var main_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var title = "My Sudoku";
var sudoku = Sudoku.CreateStandard();
sudoku.setCell({ x: 2, y: 2 }, new GivenCell("5"));
sudoku.addConstraint(new Thermometer([
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 2 },
    { x: 4, y: 1 },
    { x: 3, y: 0 },
]));
sudoku.addConstraint(new Thermometer([
    { x: 2, y: 2 },
    { x: 1, y: 2 },
]));
var puzzle = new Puzzle(title, sudoku);
window.onload = function () {
    document.getElementById("sudoku-wrapper").appendChild(puzzle.getSudokuElement());
    var solveButton = document.getElementById("solve-button");
    var cancelSolveButton = document.getElementById("cancel-solve-button");
    var showAllSolutionsButton = document.getElementById("show-all-solutions-button");
    var solutionCount = document.getElementById("solution-count");
    var solutions = null;
    var solveOneButton = document.getElementById("solve-one-button");
    var cancelSolveOneButton = document.getElementById("cancel-solve-one-button");
    var showOneSolutionsButton = document.getElementById("show-one-solution-button");
    var isBroken = document.getElementById("is-broken");
    var oneSolution = null;
    var cancelSolve = function () {
        puzzle.cancelSolve();
    };
    cancelSolveButton.onclick = cancelSolve;
    cancelSolveOneButton.onclick = cancelSolve;
    var solve = function (all) { return main_awaiter(void 0, void 0, void 0, function () {
        var mySolutions;
        return main_generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    solveButton.disabled = true;
                    solveOneButton.disabled = true;
                    cancelSolveButton.disabled = !all;
                    cancelSolveOneButton.disabled = all;
                    showAllSolutionsButton.disabled = true;
                    showOneSolutionsButton.disabled = true;
                    return [4, puzzle.solve(function () { }, !all)];
                case 1:
                    mySolutions = _a.sent();
                    if (all) {
                        solutions = mySolutions;
                    }
                    else {
                        oneSolution = mySolutions;
                    }
                    solveButton.disabled = false;
                    solveOneButton.disabled = false;
                    cancelSolveButton.disabled = true;
                    cancelSolveOneButton.disabled = true;
                    if (all) {
                        solutionCount.innerText = (mySolutions.cancelled ? "At least " : " ") + mySolutions.solutions.length;
                        showAllSolutionsButton.disabled = false;
                    }
                    console.log(mySolutions);
                    if (mySolutions.solutions.length > 0) {
                        isBroken.innerText = "No";
                    }
                    else if (mySolutions.cancelled) {
                        isBroken.innerText = "Unclear";
                    }
                    else {
                        isBroken.innerText = "Yes";
                    }
                    if (all) {
                        showAllSolutionsButton.disabled = mySolutions.solutions.length === 0;
                    }
                    else {
                        showOneSolutionsButton.disabled = mySolutions.solutions.length === 0;
                    }
                    return [2];
            }
        });
    }); };
    solveButton.onclick = function () { return solve(true); };
    solveOneButton.onclick = function () { return solve(false); };
    var loadNotes = function (notes) {
        puzzle.setValuesFromNotes(notes);
    };
    showAllSolutionsButton.onclick = function () { return loadNotes(solutions.notes); };
    showOneSolutionsButton.onclick = function () { return loadNotes(oneSolution.notes); };
};

/******/ })()
;