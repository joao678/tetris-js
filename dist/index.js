const canvas = document.querySelector('canvas');
const c = canvas.getContext("2d");
import { Direction } from "./enums/Direction.js";
import { Colors, Pieces } from "./pieces/Pieces.js";
import { Key } from "./utils/Key.js";
export const _KEYLIST = {};
export const _FPS = 60;
const _BLOCK_SIZE = 30;
const playfield = Array(20).fill(null).map(() => Array(10).fill(0));
const _RIGHT_WALL_LIMIT = playfield[0].length - 1;
const _LEFT_WALL_LIMIT = 0;
const left = new Key('ArrowLeft', () => move(Direction.Left));
const right = new Key('ArrowRight', () => move(Direction.Right));
const up = new Key('ArrowUp', () => rotate());
const down_once = new Key('ArrowDown', () => resetTimerOnce());
const down_every_frame = new Key('ArrowDown', () => softDrop());
const space = new Key(' ', () => hardDrop());
const preDropState = {
    time: 0,
    isTouching: false
};
let currentPiece = Pieces.getPiece(0);
let x = 0;
let y = 0;
let ghostX = 0;
let ghostY = 0;
let drop_timer = 0;
let target_time = 45;
canvas.width = _BLOCK_SIZE * 20;
canvas.height = _BLOCK_SIZE * 20;
canvas.tabIndex = 0;
canvas.onkeydown = canvas.onkeyup = function (e) {
    _KEYLIST[e.key] = e.type === 'keydown';
};
function isPieceCollidingWithLeftWall() {
    return currentPiece.some((row) => {
        return row.some((col, colIndex) => {
            return col && x + colIndex === _LEFT_WALL_LIMIT;
        });
    });
}
function isPieceCollidingWithRightWall() {
    return currentPiece.some((row) => {
        return row.some((col, colIndex) => {
            return col && x + colIndex === _RIGHT_WALL_LIMIT;
        });
    });
}
function isPieceCollidingWithLeftOfPlayField() {
    return currentPiece.some((row, rowIndex) => {
        return row.some((col, colIndex) => {
            return col && playfield[y + rowIndex][x + colIndex - 1];
        });
    });
}
function isPieceCollidingWithRightOfPlayField() {
    return currentPiece.some((row, rowIndex) => {
        return row.some((col, colIndex) => {
            return col && playfield[y + rowIndex][x + colIndex + 1];
        });
    });
}
function canMoveLeft() {
    return !isPieceCollidingWithLeftWall() && !isPieceCollidingWithLeftOfPlayField();
}
function canMoveRight() {
    return !isPieceCollidingWithRightWall() && !isPieceCollidingWithRightOfPlayField();
}
function resetPreDropState() {
    preDropState.isTouching = false;
    preDropState.time = 0;
}
function move(direction) {
    switch (direction) {
        case Direction.Right:
            if (canMoveRight()) {
                x += 1;
                updateGhostPiece();
                if (hitBottom(false))
                    return resetPreDropState();
                if (hitOtherBlock(false))
                    return resetPreDropState();
            }
            ;
            break;
        case Direction.Left:
            if (canMoveLeft()) {
                x -= 1;
                updateGhostPiece();
                if (hitBottom(false))
                    return resetPreDropState();
                if (hitOtherBlock(false))
                    return resetPreDropState();
            }
            ;
            break;
    }
}
function rotate() {
    let hadToMoveLeft = false;
    let hadToMoveRight = false;
    currentPiece = Pieces.rotateBlock(currentPiece, true);
    if (isPieceCollidingWithLeftWall())
        x = 0;
    if (isPieceCollidingWithRightWall())
        x = 10 - currentPiece[0].length;
    while (isPieceCollidingWithRightOfPlayField()) {
        hadToMoveLeft = true;
        x -= 1;
    }
    ;
    while (isPieceCollidingWithLeftOfPlayField()) {
        hadToMoveRight = true;
        x += 1;
    }
    ;
    if (hadToMoveLeft)
        x += 1;
    if (hadToMoveRight)
        x -= 1;
    updateGhostPiece();
}
function placePiece(x, y) {
    currentPiece.forEach((row, row_index) => {
        row.forEach((col, col_index) => {
            if (col) {
                playfield[row_index + y][col_index + x] = col;
            }
        });
    });
}
function drawGrid() {
    c.lineWidth = 1;
    for (let gridColumns = 0; gridColumns <= (_BLOCK_SIZE * 10); gridColumns += _BLOCK_SIZE) {
        c.strokeStyle = 'rgb(128,128,128)';
        c.beginPath();
        c.moveTo(gridColumns, 0);
        c.lineTo(gridColumns, _BLOCK_SIZE * 20);
        c.stroke();
    }
    for (let gridRows = 0; gridRows <= (_BLOCK_SIZE * 20); gridRows += _BLOCK_SIZE) {
        c.strokeStyle = 'rgb(128,128,128)';
        c.beginPath();
        c.moveTo(0, gridRows);
        c.lineTo(_BLOCK_SIZE * 10, gridRows);
        c.stroke();
    }
}
function drawCurrentPiece() {
    currentPiece.forEach(function (rows, row_index) {
        rows.forEach(function (column, column_index) {
            if (!column)
                return;
            c.fillStyle = Colors.getColor(column, false);
            c.fillRect((x * _BLOCK_SIZE) + (column_index * _BLOCK_SIZE), (y * _BLOCK_SIZE) + (row_index * _BLOCK_SIZE), _BLOCK_SIZE, _BLOCK_SIZE);
        });
    });
}
function drawGhostPiece() {
    currentPiece.forEach(function (rows, row_index) {
        rows.forEach(function (column, column_index) {
            if (!column)
                return;
            c.strokeStyle = Colors.getColor(column, false);
            c.lineWidth = 2;
            c.strokeRect((ghostX * _BLOCK_SIZE) + (column_index * _BLOCK_SIZE), (ghostY * _BLOCK_SIZE) + (row_index * _BLOCK_SIZE), _BLOCK_SIZE, _BLOCK_SIZE);
        });
    });
}
function drawPlayfield() {
    playfield.forEach((rows, row_index) => {
        rows.forEach((column, column_index) => {
            if (!column)
                return;
            c.fillStyle = Colors.getColor(column, false);
            c.fillRect(column_index * _BLOCK_SIZE, row_index * _BLOCK_SIZE, _BLOCK_SIZE, _BLOCK_SIZE);
        });
    });
}
function checkForLines() {
    const foundLines = Object.entries(playfield).filter((e) => {
        const [idx, val] = e;
        return val.every(x => x !== 0);
    }).map((e) => parseInt(e[0]));
    if (!foundLines.length)
        return;
    foundLines.forEach((e) => {
        playfield.splice(e, 1);
        playfield.unshift(Array(10).fill(0));
    });
}
function resetCurrentPiece() {
    placePiece(x, y);
    currentPiece = Pieces.getPiece(Math.floor(Math.random() * (Pieces.getShapeListLength() + 1)));
    y = 0;
    x = 5;
    checkForLines();
    updateGhostPiece();
}
function hitBottom(ignorePlacementTimer) {
    let hasHitBottom = false;
    preDropState.isTouching = false;
    currentPiece.forEach(function (rows, row_index) {
        rows.forEach(function (column) {
            if (column && y + row_index === playfield.length - 1) {
                hasHitBottom = true;
                return !ignorePlacementTimer ? preDropState.isTouching = true : resetCurrentPiece();
            }
        });
    });
    return hasHitBottom;
}
function hitOtherBlock(ignorePlacementTimer) {
    let hasHitOtherBlock = false;
    preDropState.isTouching = false;
    currentPiece.forEach(function (rows, row_index) {
        rows.forEach(function (column, column_index) {
            if (column && playfield[y + row_index + 1][x + column_index]) {
                hasHitOtherBlock = true;
                return !ignorePlacementTimer ? preDropState.isTouching = true : resetCurrentPiece();
            }
        });
    });
    return hasHitOtherBlock;
}
function resetTimerOnce() {
    drop_timer = 0;
}
function softDrop() {
    target_time = 5;
}
function hardDrop() {
    while (!hitBottom(true) && !hitOtherBlock(true)) {
        y = y + 1;
    }
}
function ghostHitBottom() {
    let hasHitBottom = false;
    currentPiece.forEach(function (rows, row_index) {
        rows.forEach(function (column) {
            if (column && ghostY + row_index === playfield.length - 1) {
                hasHitBottom = true;
            }
        });
    });
    return hasHitBottom;
}
function ghostHitOtherBlock() {
    let hasHitOtherBlock = false;
    currentPiece.forEach(function (rows, row_index) {
        rows.forEach(function (column, column_index) {
            if (column && playfield[ghostY + row_index + 1][x + column_index]) {
                hasHitOtherBlock = true;
            }
        });
    });
    return hasHitOtherBlock;
}
function updateGhostPiece() {
    ghostX = x;
    ghostY = y;
    while (!ghostHitBottom() && !ghostHitOtherBlock()) {
        ghostY = ghostY + 1;
    }
}
function dropTime() {
    if (drop_timer === target_time) {
        if (hitBottom(false))
            return;
        if (hitOtherBlock(false))
            return;
        drop_timer = 0;
        y += 1;
    }
    drop_timer += 1;
}
function checkPreDropState() {
    if (!preDropState.isTouching)
        dropTime();
    if (preDropState.isTouching) {
        if (preDropState.time === 50) {
            preDropState.time = 0;
            preDropState.isTouching = false;
            resetCurrentPiece();
        }
        else {
            preDropState.time += 1;
        }
    }
}
function startGame() {
    updateGhostPiece();
}
function drawHold(x, y) {
    c.translate(x, y);
    c.strokeStyle = 'rgb(128,128,128)';
    c.strokeRect(0, 0, (_BLOCK_SIZE * 4) + 10, (_BLOCK_SIZE * 4) + 10);
    c.translate(window.pieceX, window.pieceY);
    Pieces.getPiece(window.piece).forEach(function (rows, row_index) {
        rows.forEach(function (column, column_index) {
            if (!column)
                return;
            c.fillStyle = Colors.getColor(column, false);
            c.fillRect((0 * _BLOCK_SIZE) + (column_index * _BLOCK_SIZE), (0 * _BLOCK_SIZE) + (row_index * _BLOCK_SIZE), _BLOCK_SIZE, _BLOCK_SIZE);
        });
    });
    c.resetTransform();
}
function drawBoard(x, y) {
    c.translate(x, y);
    drawCurrentPiece();
    drawPlayfield();
    drawGrid();
    drawGhostPiece();
    c.resetTransform();
}
window.drawHoldX = 10;
window.drawHoldY = 10;
window.pieceX = 0;
window.pieceY = 0;
window.piece = 0;
startGame();
setInterval(() => {
    c.clearRect(0, 0, canvas.width, canvas.height);
    target_time = 45;
    space.doOnce();
    up.doOnce();
    left.doOnceRepeat();
    right.doOnceRepeat();
    down_once.doOnce();
    down_every_frame.everyFrame();
    checkPreDropState();
    drawBoard(((_BLOCK_SIZE * 10) / 2) - 1, 0);
    c.fillStyle = 'rgb(255,0,0)';
    c.font = "30px serif";
    c.fillText('teste', 0, 0);
}, 1000 / _FPS);
//# sourceMappingURL=index.js.map