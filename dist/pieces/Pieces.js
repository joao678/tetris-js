class Shapes {
}
Shapes.T_Shape = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
];
Shapes.L_Shape = [
    [0, 0, 2],
    [2, 2, 2],
    [0, 0, 0]
];
Shapes.J_Shape = [
    [3, 0, 0],
    [3, 3, 3],
    [0, 0, 0]
];
Shapes.O_Shape = [
    [0, 4, 4],
    [0, 4, 4],
    [0, 0, 0]
];
Shapes.S_Shape = [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
];
Shapes.Z_Shape = [
    [6, 6, 0],
    [0, 6, 6],
    [0, 0, 0]
];
Shapes.I_Shape = [
    [0, 0, 0, 0],
    [7, 7, 7, 7],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];
export class Colors {
    static getColor(index, isTransparent) {
        return `${isTransparent ? 'rgba(' : 'rgb('}${this.colorList[index]}${isTransparent ? ',0.5' : ')'}`;
    }
}
Colors.colorList = [
    '0,0,0',
    '255,34,195',
    '255,128,44',
    '46,85,255',
    '255,193,44',
    '129,255,6',
    '255,45,89',
    '45,193,255'
];
export class Pieces {
    static getShapeListLength() {
        return this._shapeList.length - 1;
    }
    static getPiece(index) {
        return this._shapeList[index];
    }
    static rotateBlock(block, counterClockWise) {
        let rotatedShape = [];
        let firstRow = block[0];
        for (let x = 0; x < firstRow.length; x++) {
            let newRow = [];
            (counterClockWise ? Array.from(block).reverse() : block).forEach(function (row) {
                newRow.push(counterClockWise ? row[x] : Array.from(row).reverse()[x]);
            });
            rotatedShape.push(newRow);
        }
        return rotatedShape;
    }
}
Pieces._shapeList = [
    Shapes.T_Shape,
    Shapes.L_Shape,
    Shapes.J_Shape,
    Shapes.S_Shape,
    Shapes.Z_Shape,
    Shapes.O_Shape,
    Shapes.I_Shape
];
//# sourceMappingURL=Pieces.js.map