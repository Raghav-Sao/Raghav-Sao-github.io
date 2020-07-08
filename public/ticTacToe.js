const grid = document.getElementById("tik-tok-toe-grid");
const resultElement = document.querySelector(".gameResult");
grid.addEventListener('click', handleBoardClick);
context = grid.getContext('2d');
const HUMAN = 1;
const AI = 2;
const TIE = -1;
let winningPlayer = null;
let currentPlayer = HUMAN;
let size = 3;
let cellDiamension = 100;
let boardWidth = 300;
let boardHeight = 300;
let filledCell = new Array(size*size).fill('');


function delay(delayTime = 500) {
    const promise = new Promise((resolve, reject) => {
        setTimeout(resolve, delayTime);
    })
    return promise;
}

async function drawBoard({boardSize = 3, animation = false} = {}) {
    size = boardSize >= 5 ? boardSize * 2 : boardSize;
    cellDiamension = boardSize >= 5 ? 50 : 100;
    boardWidth = size * cellDiamension;
    boardHeight = size * cellDiamension;
    context.canvas.width = boardWidth;
    context.canvas.height = boardHeight;
    animation && await delay(200);
    /* to draw H line */
    for(let row = 1; row < size; row++) {
        context.beginPath();
        context.moveTo(0, row * cellDiamension);
        context.lineTo(size * cellDiamension, row * cellDiamension);
        context.strokeStyle ="blue";
        context.lineWidth = 2;
        context.stroke();
        animation && await delay(200);
    }

    /* to draw V line */
    for(let column = 1; column < size; column++) {
        context.beginPath();
        context.moveTo(column * cellDiamension, 0);
        context.lineTo(column * cellDiamension, size * cellDiamension);
        context.stroke();
        animation && await delay(200);
    }
}

function updateWinner  (winner) {
    winningPlayer = winner;
    const background = {
        [AI]: '#ff0021',
        [TIE]: '#ff9c00'
    }
    context.canvas.style.border = `1em solid ${background[winningPlayer]}`;
    context.canvas.style.opacity = 0.8;
    const winnerText = {
        [AI]: 'Better Luck Next Time!',
        [HUMAN]: 'Nice, You Win.',
        [TIE]: 'Tie!',
    }
    resultElement.innerText = winnerText[winner];
    resultElement.style.visibility = 'visible';

}

function handleBoardClick(e = {}) {
    window.navigator && window.navigator.vibrate && window.navigator.vibrate(50);
    
    if(currentPlayer === AI || winningPlayer) {
        return;
    }

    const {clientX, clientY} = e;
    const {x: startX, y: startY} = grid.getBoundingClientRect();
    const x = Math.floor((clientX - startX)/cellDiamension);
    const y = Math.floor((clientY - startY)/cellDiamension);
    const index = x + y * size;
    if(filledCell[index]) {
        return;
    }
    filledCell[index] = currentPlayer;
    updateBoard(HUMAN, x, y);
    const winner = checkWinnerStatus();
    if(winner) {
        updateWinner(winner);
    }
    handoverToAI();
}

async function handoverToAI() {
    currentPlayer = AI;
    
    if(winningPlayer) {
        return;
    }
   
    const bestMove = getBestMove();
    const x = Math.floor(bestMove % size);
    const y = Math.floor(bestMove / size);
    filledCell[bestMove] = currentPlayer;
    await delay(500);
    updateBoard(AI, x, y);
    const winner = checkWinnerStatus();
    if(winner) {
        updateWinner(winner);
    }
    currentPlayer = HUMAN;
}

function getBestMove() {
    let bestScore = -Infinity;
    let cell = '';
    for(let i = 0; i < size*size; i++) {
        if(!filledCell[i]) {
            filledCell[i] = AI;
            const isMaximizing = false;
            const score = miniMax(filledCell, isMaximizing);
            filledCell[i] = '';
            if(bestScore < score) {
                bestScore = Math.max(bestScore, score);
                cell = i;
            }
        }
    }
    return cell;
}

function checkWinnerStatus() {
    let filledCellCount = 0;
    /* check for all row */
    for (let row = 0; row < size; row++) {
        let prevType = null;
        let count = 0;
        for(let column = 0; column < size; column++) {
            const index = row * size + column;
            if(prevType && prevType === filledCell[index]) {
                count++;
            } else {
                prevType = filledCell[index];
                count = 1;
            }

            if(count === size) {
                return prevType;
            }

            if(filledCell[index]) {
                filledCellCount++;
            }
        }
    }

    /* check for all column */
    for (let column = 0; column < size; column++) {
        let prevType = null;
        let count = 0;
        for(let row = 0; row < size; row++) {
            const index = row * size + column;
            if(prevType && prevType === filledCell[index]) {
                count++;
            } else {
                prevType = filledCell[index];
                count = 1;
            }

            if(count === size) {
                return prevType;
            }
        }
    }

    /* check for diagonal */
    let prevType = null;
    let count = 0;
    for(let i = 0; i < size; i++) {
        const index = i * size + i;
        if(prevType && prevType === filledCell[index]) {
            count++;
        } else {
            prevType = filledCell[index];
            count = 1;
        }

        if(count === size) {
            return prevType;
        }
    }

    /* check for inverse diagonal */
    prevType = null;
    count = 0;
    for(let i = 1; i <= size; i++) {
        const index = i * size - i;
        if(prevType && prevType === filledCell[index]) {
            count++;
        } else {
            prevType = filledCell[index];
            count = 1;
        }

        if(count === size) {
            return prevType;
        }
    }
    if(filledCellCount === size * size) {
        return -1;
    }
}

const winnerScore = {
    "1": -1,
    "2": 1,
    "-1": 0
}
function miniMax (filledCell, isMaximizing) {
    const winner = checkWinnerStatus();
    if(winner) {
        return winnerScore[winner];
    }
    if(isMaximizing) { /* will try to maximize the AI score */
        let bestScore = -Infinity;
        for(let i = 0; i < size * size; i++) {
            if(!filledCell[i]) {
                filledCell[i] = AI;
                const score = miniMax(filledCell, false);
                filledCell[i] = '';
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        /* will try to minimise the AI score */

        let bestScore = Infinity;
        for(let i = 0; i < size * size; i++) {
            if(!filledCell[i]) {
                filledCell[i] = HUMAN;
                const score = miniMax(filledCell,true);
                filledCell[i] = '';
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
}

function drawCircle(x, y) {
    const radious = cellDiamension / 4;
    const startDeg = 0;
    const endDeg = 360;

    const startX = x * cellDiamension;
    const startY = y * cellDiamension;
    const cellCenter = cellDiamension / 2;

    const centerX = startX + cellCenter; 
    const centerY = startY + cellCenter; 

    context.beginPath();
    context.arc(centerX, centerY, radious, startDeg, endDeg);
    context.lineWidth = 5;
    context.strokeStyle ="#9c27b0";
    context.stroke();
}

function updateBoard(player, x, y) {
    player === HUMAN ? drawCross(x, y) : drawCircle(x, y);
}

function drawCross(x, y) {
    const startX = x * cellDiamension;
    const startY = y * cellDiamension;

    const startLineX = startX + cellDiamension / 4;
    const startLineY = startY + cellDiamension / 4;
    const endLineX = startX + cellDiamension * 3 / 4;
    const endLineY = startY + cellDiamension * 3 / 4;
    context.beginPath();
    context.moveTo(startLineX, startLineY);
    context.lineTo(endLineX, endLineY);
    context.strokeStyle ="#ff5722";
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    context.moveTo(startLineX, startLineY + cellDiamension/2);
    context.lineTo(startLineX + cellDiamension/2, startLineY);
    context.strokeStyle ="#ff5722";
    context.stroke();
}

function restartGame() {
    const animation = false;
    drawBoard({animation});
    winningPlayer = null;
    filledCell = [];
    resultElement.innerText = '';
    resultElement.style.visibility = 'hidden';
    context.canvas.style.border = 'transparent';
    context.canvas.style.opacity = 1;

}



function fillBoard () {
    filledCell.forEach((currentPlayer, i) => {
        if(currentPlayer) {
            const y = Math.floor(i / size);
            const x = i % size;
            currentPlayer === HUMAN ? drawCross(x, y) : drawCircle(x, y);
        }
    });
}

/* get randome cell for AI */
const index = Math.floor(Math.random()*9)
filledCell[index] = AI;

drawBoard();
fillBoard()
