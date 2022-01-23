export type Shape = number[][];
type ShapeList = Shape[];
type Row = number[];

class Shapes {
    public static T_Shape:Shape = [
        [0,1,0],
        [1,1,1],
        [0,0,0]
    ];

    public static L_Shape:Shape = [
        [0,0,2],
        [2,2,2],
        [0,0,0]
    ];

    public static J_Shape:Shape = [
        [3,0,0],
        [3,3,3],
        [0,0,0]
    ];

    public static O_Shape:Shape = [
        [0,4,4],
        [0,4,4],
        [0,0,0]
    ];

    public static S_Shape:Shape = [
        [0,5,5],
        [5,5,0],
        [0,0,0]
    ];

    public static Z_Shape:Shape = [
        [6,6,0],
        [0,6,6],
        [0,0,0]
    ];

    public static I_Shape:Shape = [
        [0,0,0,0],
        [7,7,7,7],
        [0,0,0,0],
        [0,0,0,0]
    ];
}

export class Colors {
    private static colorList:string[] = [
        '0,0,0',
        '255,34,195',
        '255,128,44',
        '46,85,255',
        '255,193,44',
        '129,255,6',
        '255,45,89',
        '45,193,255'
    ];

    public static getColor(index:number, isTransparent: boolean): string {
        return `${isTransparent ? 'rgba(' : 'rgb('}${this.colorList[index]}${isTransparent ? ',0.5' : ')'}`
    }
}

export class Pieces {
    private static _shapeList: ShapeList = [
        Shapes.T_Shape,
        Shapes.L_Shape,
        Shapes.J_Shape,
        Shapes.S_Shape,
        Shapes.Z_Shape,
        Shapes.O_Shape,
        Shapes.I_Shape
    ];

    public static getShapeListLength(): number {
        return this._shapeList.length - 1;
    }

    public static getPiece(index: number): Shape {
        return this._shapeList[index];
    }

    public static rotateBlock(block: Shape, counterClockWise: boolean):Shape {
        let rotatedShape: Shape = [];

        let firstRow = block[0];
        for (let x = 0; x < firstRow.length; x++) {
            let newRow: Row = [];
            (counterClockWise ? Array.from(block).reverse(): block).forEach(function(row) {
                newRow.push(counterClockWise ? row[x]: Array.from(row).reverse()[x]);
            });
            rotatedShape.push(newRow);
        }

        return rotatedShape;
    }
}