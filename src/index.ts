const canvas = document.querySelector('canvas');
const c = canvas.getContext("2d");

import { Direction } from "./enums/Direction.js";
import { Colors, Pieces, Shape } from "./pieces/Pieces.js";
import { Key } from "./utils/Key.js";

export const _KEYLIST:any = {};
export const _FPS:number = 60;
const _BLOCK_SIZE:number = 30;
const playfield = Array(20).fill(null).map(() => Array(10).fill(0));
const _RIGHT_WALL_LIMIT:number = playfield[0].length-1;
const _LEFT_WALL_LIMIT:number = 0;

const left:Key = new Key('ArrowLeft', () => move(Direction.Left));
const right:Key = new Key('ArrowRight', () => move(Direction.Right));
const up:Key = new Key('ArrowUp', () => rotate() );
const down_once:Key = new Key('ArrowDown', () => resetTimerOnce() );
const down_every_frame:Key = new Key('ArrowDown', () => softDrop() );
const space:Key = new Key(' ', () => hardDrop() );

const preDropState = {
    time: 0,
    isTouching: false
}

let currentPiece:Shape = Pieces.getPiece(0);
let x:number = 0;
let y:number = 0;
let ghostX:number = 0;
let ghostY:number = 0;
let drop_timer:number = 0;
let target_time:number = 45;

canvas.width = _BLOCK_SIZE*10;
canvas.height = _BLOCK_SIZE*20;
canvas.tabIndex = 0;

canvas.onkeydown = canvas.onkeyup = function(e) {
    _KEYLIST[e.key] = e.type === 'keydown';
}

function isPieceCollidingWithLeftWall(): boolean {
    return currentPiece.some((row) => {
        return row.some((col, colIndex) => {
            return col && x+colIndex === _LEFT_WALL_LIMIT;
        });
    });
}

function isPieceCollidingWithRightWall():boolean {
    return currentPiece.some((row) => {
        return row.some((col, colIndex) => {
            return col && x+colIndex === _RIGHT_WALL_LIMIT;
        });
    });
}

function isPieceCollidingWithLeftOfPlayField(): boolean {
    return currentPiece.some((row, rowIndex) => {
        return row.some((col, colIndex) => {
            return col && playfield[y+rowIndex][x+colIndex-1];
        });
    });
}

function isPieceCollidingWithRightOfPlayField(): boolean {
    return currentPiece.some((row, rowIndex) => {
        return row.some((col, colIndex) => {
            return col && playfield[y+rowIndex][x+colIndex+1];
        });
    });
}

function canMoveLeft():boolean {
    return !isPieceCollidingWithLeftWall() && !isPieceCollidingWithLeftOfPlayField();
}

function canMoveRight():boolean {
    return !isPieceCollidingWithRightWall() && !isPieceCollidingWithRightOfPlayField();
}

function resetPreDropState():void {
    preDropState.isTouching = false;
    preDropState.time = 0;
}

function move(direction: Direction):void {
    switch (direction) {
        case Direction.Right:
            if(canMoveRight()) {
                x += 1;
                updateGhostPiece();
                if(hitBottom(false)) return resetPreDropState();
                if(hitOtherBlock(false)) return resetPreDropState();
            };
            break;
        case Direction.Left:
            if(canMoveLeft()) {
                x -= 1;
                updateGhostPiece();
                if(hitBottom(false)) return resetPreDropState();
                if(hitOtherBlock(false)) return resetPreDropState();
            };
            break;
    }
}

function rotate():void {
    let hadToMoveLeft = false;
    let hadToMoveRight = false;

    currentPiece = Pieces.rotateBlock(currentPiece, true);

    if(isPieceCollidingWithLeftWall()) x = 0;
    if(isPieceCollidingWithRightWall()) x = 10 - currentPiece[0].length;

    while(isPieceCollidingWithRightOfPlayField()) {
        hadToMoveLeft = true;
        x -= 1;
    };

    while(isPieceCollidingWithLeftOfPlayField()) {
        hadToMoveRight = true;
        x += 1
    };

    if(hadToMoveLeft) x += 1;
    if(hadToMoveRight) x -= 1;

    updateGhostPiece();
}

function placePiece(x: number, y: number):void {
    currentPiece.forEach((row,row_index) => {
        row.forEach((col,col_index) => {
            if(col) {
                playfield[row_index+y][col_index+x] = col;
            }
        });
    });
}

function drawGrid():void {
    for (let gridColumns = _BLOCK_SIZE; gridColumns < (_BLOCK_SIZE * 10); gridColumns+=_BLOCK_SIZE) {
        c.strokeStyle = 'rgb(0,0,0)';
        c.beginPath();
        c.moveTo(gridColumns,0);
        c.lineTo(gridColumns, _BLOCK_SIZE*20);
        c.stroke();
    }

    for (let gridRows = _BLOCK_SIZE; gridRows < (_BLOCK_SIZE * 20); gridRows+=_BLOCK_SIZE) {
        c.strokeStyle = 'rgb(0,0,0)';
        c.beginPath();
        c.moveTo(0,gridRows);
        c.lineTo(_BLOCK_SIZE*10, gridRows);
        c.stroke();
    }
}

function drawCurrentPiece():void {
    currentPiece.forEach(function(rows,row_index) {
        rows.forEach(function(column,column_index) {
            if(!column) return;
            c.fillStyle = Colors.getColor(column, false);
            c.fillRect((x*_BLOCK_SIZE)+(column_index*_BLOCK_SIZE),(y*_BLOCK_SIZE)+(row_index*_BLOCK_SIZE),_BLOCK_SIZE,_BLOCK_SIZE);
        });
    });
}

function drawGhostPiece():void {
    currentPiece.forEach(function(rows,row_index) {
        rows.forEach(function(column,column_index) {
            if(!column) return;
            c.fillStyle = Colors.getColor(column, true);
            c.fillRect((ghostX*_BLOCK_SIZE)+(column_index*_BLOCK_SIZE),(ghostY*_BLOCK_SIZE)+(row_index*_BLOCK_SIZE),_BLOCK_SIZE,_BLOCK_SIZE);
        });
    });
}

function drawPlayfield():void {
    playfield.forEach((rows,row_index)=>{
        rows.forEach((column,column_index)=>{
            if(!column) return;
            c.fillStyle = Colors.getColor(column, false);
            c.fillRect(column_index*_BLOCK_SIZE,row_index*_BLOCK_SIZE,_BLOCK_SIZE,_BLOCK_SIZE);
        });
    });
}

function checkForLines():void {
    const foundLines = Object.entries(playfield).filter((e) => {
        const [idx, val] = e;
        return val.every(x => x !== 0);
    }).map((e) => parseInt(e[0]));

    if(!foundLines.length) return;

    foundLines.forEach((e) => {
        playfield.splice(e,1);
        playfield.unshift(Array(10).fill(0));
    });
}


function resetCurrentPiece():void {
    placePiece(x,y);
    currentPiece = Pieces.getPiece(Math.floor(Math.random() * (Pieces.getShapeListLength() + 1)));
    y = 0;
    x = 5;
    checkForLines();
    updateGhostPiece();
}

/*function _DEBUG_PRINT_PLAYFIELD_CONSOLE():void {
    console.clear();
    playfield.forEach(e => console.log( `║${e.map(x => x ? '█': ' ').join('')}║` ));
}*/

function hitBottom(ignorePlacementTimer: boolean):boolean {
    let hasHitBottom = false;

    preDropState.isTouching = false;

    currentPiece.forEach(function(rows,row_index) {
        rows.forEach(function(column) {
            if(column && y + row_index === playfield.length - 1) {
                hasHitBottom = true;
                return !ignorePlacementTimer ? preDropState.isTouching = true : resetCurrentPiece();
            }
        });
    });

    return hasHitBottom;
}

function hitOtherBlock(ignorePlacementTimer: boolean):boolean {
    let hasHitOtherBlock = false;

    preDropState.isTouching = false;

    currentPiece.forEach(function(rows,row_index) {
        rows.forEach(function(column,column_index) {
            if(column && playfield[y+row_index+1][x+column_index]) {
                hasHitOtherBlock = true;
                return !ignorePlacementTimer ? preDropState.isTouching = true : resetCurrentPiece();
            }
        });
    });
    return hasHitOtherBlock;
}

function resetTimerOnce():void {
    drop_timer = 0;
}

function softDrop():void {
    target_time = 5;
}

function hardDrop():void {
    while (!hitBottom(true) && !hitOtherBlock(true)) {
        y = y + 1;
    }
}

function ghostHitBottom():boolean {
    let hasHitBottom = false;

    currentPiece.forEach(function(rows,row_index) {
        rows.forEach(function(column) {
            if(column && ghostY + row_index === playfield.length - 1) {
                hasHitBottom = true;
            }
        });
    });

    return hasHitBottom;
}

function ghostHitOtherBlock():boolean {
    let hasHitOtherBlock = false;

    currentPiece.forEach(function(rows,row_index) {
        rows.forEach(function(column,column_index) {
            if(column && playfield[ghostY+row_index+1][x+column_index]) {
                hasHitOtherBlock = true;
            }
        });
    });
    return hasHitOtherBlock;
}

function updateGhostPiece():void {
    ghostX = x;
    ghostY = y;
    while (!ghostHitBottom() && !ghostHitOtherBlock()) {
        ghostY = ghostY + 1;
    }
}

function dropTime():void {
    if(drop_timer === target_time) {
        if(hitBottom(false)) return;
        if(hitOtherBlock(false)) return;
        drop_timer = 0;
        y+=1;
    }
    drop_timer += 1;
}

function checkPreDropState():void {
    if(!preDropState.isTouching) dropTime();
    
    if(preDropState.isTouching) {
        if(preDropState.time === 50) {
            preDropState.time = 0;
            preDropState.isTouching = false;
            resetCurrentPiece();
        } else {
            preDropState.time += 1;
        }
    }
}

function startGame():void {
    updateGhostPiece();
}

startGame();
setInterval(() => {
    c.clearRect(0, 0, _BLOCK_SIZE*10, _BLOCK_SIZE*20);

    target_time = 45;

    space.doOnce();
    up.doOnce();
    left.doOnceRepeat();
    right.doOnceRepeat();
    down_once.doOnce();
    down_every_frame.everyFrame();

    checkPreDropState();

    drawCurrentPiece();
    drawGhostPiece();
    drawPlayfield();
    drawGrid();
},1000/_FPS);