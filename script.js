console.log("script loaded")

/////////////////////////////////////////////////////////////////////////////
//////////////////////         GLOBALS         //////////////////////////////
/////////////////////////////////////////////////////////////////////////////
const gameBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
let gameBoardDiv = document.querySelector('.gameBoard')

// time globals
const defaultFPS = 3
const maxFPS = 10
const quickDropFPS = 30
let normalFPS = defaultFPS // increases as the game progresses
let frameTime = 1000 / normalFPS
let frameNr = 0
let PrevUpdateTime = performance.now()
let animationFrameRequestID
let isPaused = false
let score = 0
let highScore = 0
// rotation globals: rotation state är en int från 1->4 som håller koll på blockens snurr. Nollställs varje freeze
let blockNr = 1 + Math.floor(Math.random() * 7)
rotationState = 1
// controls
let moveLeftToggle = false
let moveRightToggle = false
document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)

// start stop button
document.getElementById("new game").onclick = function () {
  startNewGame();
}
// pause button
document.getElementById("pause").onclick = function () {
     isPaused ? document.getElementById("pause").innerText = "Pause" : document.getElementById("pause").innerText = "Resume";  
    pauseGame();

}

/////////////////////////////////////////////////////////////////////////////
// GAME LOGIC
function startNewGame() {
    if (score > highScore) {
        highScore = score
    }
    frameNr = 0
    score = 0
    normalFPS = defaultFPS
    destroyBlocks()
    createBlocks()
    setGameBoard()
    animationFrameRequestID = requestAnimationFrame(gameLoop)
}
function pauseGame(){
     if (!isPaused) {
        isPaused = true;
        cancelAnimationFrame(animationFrameRequestID);
        animationFrameRequestID = null;
      } else {
        isPaused = false;
        animationFrameRequestID = requestAnimationFrame(gameLoop);
      }
}
function isGameOver() {
    for (let i = 1; i < gameBoard[0].length - 1; i++) {
        if (gameBoard[3][i] === -1) {
            return true
        }
    }
    return false
}
function isNoBlockInPlay() {
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 1; j < gameBoard[0].length - 1; j++) {
            if (gameBoard[i][j] === 1) {
                return false
            }
        }
    }
    return true
}
function isSpawnFieldEmpty() {
    for (i = 1; i < gameBoard[0].length - 1; i++) {
        if (
            gameBoard[0][i] === 1 ||
            gameBoard[1][i] === 1 ||
            gameBoard[2][i] === 1
        ) {
            return false
        }
    }
    return true
}
function blockCollidedDownward() {
    for (let i = 0; i < gameBoard.length - 1; i++) {
        for (let j = 1; j < gameBoard[0].length - 1; j++) {
            if (gameBoard[i][j] === 1 && gameBoard[i + 1][j] === -1) {
                return true
            }
        }
    }
    return false
}
function freezeBlocks() {
    for (let i = 3; i < gameBoard.length; i++) {
        for (let j = 1; j < gameBoard[0].length - 1; j++) {
            if (gameBoard[i][j] === 1) {
                gameBoard[i][j] = -1
            }
        }
    }
}
function rotateBlockClockwise() {
    // Checkar också så att det inte är supernära tills att blocken ska freeza.
    // Kunde bugga ibland om man pepprade rotate nära botten.
    // Block 2 = T-block
    // !blockCollidedDownward();
    if (blockNr == 2) {
        if (rotationState == 1) {
            for (let x = 1; x < gameBoard[0].length - 1; x++) {
                for (let y = 0; y < gameBoard.length - 1; y++) {
                    if (gameBoard[y][x] === 1) {
                        if (gameBoard[y + 1][x + 1] === 0) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 1][x + 1] = 1
                            rotationState = 2
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 2) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (gameBoard[y + 1][x - 1] === 0) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 1][x - 1] = 1
                            rotationState = 3
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 3) {
            for (let x = gameBoard[0].length - 1; x >= 1; x--) {
                for (let y = 0; y < gameBoard.length - 1; y++) {
                    if (gameBoard[y][x] === 1) {
                        if (gameBoard[y - 1][x - 1] === 0) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 1][x - 1] = 1
                            rotationState = 4
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 4) {
            for (let x = gameBoard[0].length - 1; x >= 1; x--) {
                for (let y = gameBoard.length - 1; y >= 0; y--) {
                    if (gameBoard[y][x] === 1) {
                        if (gameBoard[y - 1][x + 1] === 0) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 1][x + 1] = 1
                            rotationState = 1
                        }
                        return
                    }
                }
            }
        }
    }
    // Block 3 = S-block
    if (blockNr == 3) {
        if (rotationState == 1) {
            for (let x = gameBoard[0].length - 1; x >= 1; x--) {
                for (let y = 0; y < gameBoard.length - 1; y++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 1][x] === 0 &&
                            gameBoard[y + 2][x] === 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 1][x] = 1
                            gameBoard[y + 1][x - 2] = 0
                            gameBoard[y + 2][x] = 1
                            rotationState = 2
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 2) {
            for (let y = 0; y < gameBoard.length; y++) {
                for (let x = 1; x < gameBoard[0].length; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 2][x] === 0 &&
                            gameBoard[y + 2][x - 1] === 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 2][x] = 1

                            gameBoard[y + 2][x + 1] = 0
                            gameBoard[y + 2][x - 1] = 1
                            rotationState = 3
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 3) {
            for (let x = gameBoard[0].length - 1; x > 0; x--) {
                for (let y = 0; y < gameBoard.length - 1; y++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y][x - 2] === 0 &&
                            gameBoard[y - 1][x - 2] === 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y][x - 2] = 1
                            gameBoard[y + 1][x - 2] = 0
                            gameBoard[y - 1][x - 2] = 1
                            rotationState = 4
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 4) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y][x + 2] === 0 &&
                            gameBoard[y][x + 1] === 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y][x + 2] = 1
                            gameBoard[y + 2][x + 1] = 0
                            gameBoard[y][x + 1] = 1
                            rotationState = 1
                        }
                        return
                    }
                }
            }
        }
    }
    // Block 4 = Z-block
    if (blockNr == 4) {
        if (rotationState == 1) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y][x + 2] == 0 &&
                            gameBoard[y + 2][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y][x + 2] = 1
                            gameBoard[y][x + 1] = 0
                            gameBoard[y + 2][x + 1] = 1
                            rotationState = 2
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 2) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 2][x] == 0 &&
                            gameBoard[y + 1][x - 2] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 2][x] = 1
                            gameBoard[y + 1][x] = 0
                            gameBoard[y + 1][x - 2] = 1
                            rotationState = 3
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 3) {
            for (let y = gameBoard.length - 1; y >= 0; y--) {
                for (let x = gameBoard[0].length - 1; x >= 0; x--) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y][x - 2] == 0 &&
                            gameBoard[y - 2][x - 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y][x - 2] = 1
                            gameBoard[y][x - 1] = 0
                            gameBoard[y - 2][x - 1] = 1
                            rotationState = 4
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 4) {
            for (let y = gameBoard.length - 1; y >= 0; y--) {
                for (let x = gameBoard[0].length - 1; x >= 0; x--) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 2][x] == 0 &&
                            gameBoard[y - 1][x + 2] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 2][x] = 1
                            gameBoard[y - 1][x] = 0
                            gameBoard[y - 1][x + 2] = 1
                            rotationState = 1
                        }
                        return
                    }
                }
            }
        }
    }
    // Block 5 = L-block
    if (blockNr == 5) {
        if (rotationState == 1) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 2][x] == 0 &&
                            gameBoard[y + 2][x - 1] == 0 &&
                            gameBoard[y][x - 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 2][x] = 1
                            gameBoard[y + 1][x] = 0
                            gameBoard[y + 2][x - 1] = 1
                            gameBoard[y + 1][x - 2] = 0
                            gameBoard[y][x - 1] = 1
                            rotationState = 2
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 2) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 1][x + 1] == 0 &&
                            gameBoard[y + 1][x - 1] == 0 &&
                            gameBoard[y + 2][x - 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 1][x + 1] = 1
                            gameBoard[y + 2][x] = 0
                            gameBoard[y + 1][x - 1] = 1
                            gameBoard[y + 2][x + 1] = 0
                            gameBoard[y + 2][x - 1] = 1
                            rotationState = 3
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 3) {
            for (let y = gameBoard.length - 1; y >= 0; y--) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 2][x] == 0 &&
                            gameBoard[y - 2][x + 1] == 0 &&
                            gameBoard[y][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 2][x] = 1
                            gameBoard[y - 1][x] = 0
                            gameBoard[y - 2][x + 1] = 1
                            gameBoard[y - 1][x + 2] = 0
                            gameBoard[y][x + 1] = 1
                            rotationState = 4
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 4) {
            for (let y = gameBoard.length - 1; y >= 0; y--) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 1][x - 1] == 0 &&
                            gameBoard[y - 1][x + 1] == 0 &&
                            gameBoard[y - 2][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 1][x - 1] = 1
                            gameBoard[y - 2][x] = 0
                            gameBoard[y - 1][x + 1] = 1
                            gameBoard[y - 2][x - 1] = 0
                            gameBoard[y - 2][x + 1] = 1
                            rotationState = 1
                        }
                        return
                    }
                }
            }
        }
    }
    // block 6 = J-block
    if (blockNr == 6) {
        if (rotationState == 1) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y][x + 2] == 0 &&
                            gameBoard[y][x + 1] == 0 &&
                            gameBoard[y + 2][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y][x + 2] = 1
                            gameBoard[y + 1][x] = 0
                            gameBoard[y][x + 1] = 1
                            gameBoard[y + 1][x + 2] = 0
                            gameBoard[y + 2][x + 1] = 1
                            rotationState = 2
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 2) {
            for (let y = gameBoard.length - 1; y >= 0; y--) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 1][x - 1] == 0 &&
                            gameBoard[y - 1][x + 1] == 0 &&
                            gameBoard[y][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 1][x - 1] = 1
                            gameBoard[y - 2][x] = 0
                            gameBoard[y - 1][x + 1] = 1
                            gameBoard[y - 2][x + 1] = 0
                            gameBoard[y][x + 1] = 1
                            rotationState = 3
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 3) {
            for (let y = gameBoard.length - 1; y >= 0; y--) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y][x - 2] == 0 &&
                            gameBoard[y][x - 1] == 0 &&
                            gameBoard[y - 2][x - 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y][x - 2] = 1
                            gameBoard[y - 1][x] = 0
                            gameBoard[y][x - 1] = 1
                            gameBoard[y - 1][x - 2] = 0
                            gameBoard[y - 2][x - 1] = 1
                            rotationState = 4
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 4) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 1][x + 1] == 0 &&
                            gameBoard[y + 1][x - 1] == 0 &&
                            gameBoard[y][x - 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 1][x + 1] = 1
                            gameBoard[y + 2][x] = 0
                            gameBoard[y + 1][x - 1] = 1
                            gameBoard[y + 2][x - 1] = 0
                            gameBoard[y][x - 1] = 1
                            rotationState = 1
                        }
                        return
                    }
                }
            }
        }
    }
    // block nr 7 = I-block
    if (blockNr == 7) {
        if (rotationState == 1) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 1][x + 2] == 0 &&
                            gameBoard[y + 1][x + 2] == 0 &&
                            gameBoard[y + 2][x + 2] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 1][x + 2] = 1
                            gameBoard[y][x + 1] = 0
                            gameBoard[y + 1][x + 2] = 1
                            gameBoard[y][x + 3] = 0
                            gameBoard[y + 2][x + 2] = 1
                            rotationState = 2
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 2) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 2][x - 2] == 0 &&
                            gameBoard[y + 2][x - 1] == 0 &&
                            gameBoard[y + 2][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 2][x - 2] = 1
                            gameBoard[y + 1][x] = 0
                            gameBoard[y + 2][x - 1] = 1
                            gameBoard[y + 3][x] = 0
                            gameBoard[y + 2][x + 1] = 1
                            rotationState = 3
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 3) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y - 2][x + 1] == 0 &&
                            gameBoard[y + 1][x + 1] == 0 &&
                            gameBoard[y - 1][x + 1] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y - 2][x + 1] = 1
                            gameBoard[y][x + 2] = 0
                            gameBoard[y + 1][x + 1] = 1
                            gameBoard[y][x + 3] = 0
                            gameBoard[y - 1][x + 1] = 1
                            rotationState = 4
                        }
                        return
                    }
                }
            }
        }
        if (rotationState == 4) {
            for (let y = 0; y < gameBoard.length - 1; y++) {
                for (let x = 1; x < gameBoard[0].length - 1; x++) {
                    if (gameBoard[y][x] === 1) {
                        if (
                            gameBoard[y + 1][x - 1] == 0 &&
                            gameBoard[y + 1][x + 1] == 0 &&
                            gameBoard[y + 1][x + 2] == 0
                        ) {
                            gameBoard[y][x] = 0
                            gameBoard[y + 1][x - 1] = 1
                            gameBoard[y + 2][x] = 0
                            gameBoard[y + 1][x + 1] = 1
                            gameBoard[y + 3][x] = 0
                            gameBoard[y + 1][x + 2] = 1
                            rotationState = 1
                        }
                        return
                    }
                }
            }
        }
    }
}
function spawnRandomBlock() {
    blockNr = 1 + Math.floor(Math.random() * 7)
    // spawn O-block
    if (blockNr == 1) {
        gameBoard[0][5] = 1
        gameBoard[0][6] = 1
        gameBoard[1][5] = 1
        gameBoard[1][6] = 1
    }
    // spawn T-block
    if (blockNr == 2) {
        gameBoard[0][5] = 1
        gameBoard[1][5] = 1
        gameBoard[1][4] = 1
        gameBoard[1][6] = 1
    }
    // spawn S-block
    if (blockNr == 3) {
        gameBoard[0][5] = 1
        gameBoard[1][5] = 1
        gameBoard[1][4] = 1
        gameBoard[0][6] = 1
    }
    // spawn Z-block
    if (blockNr == 4) {
        gameBoard[0][4] = 1
        gameBoard[0][5] = 1
        gameBoard[1][5] = 1
        gameBoard[1][6] = 1
    } // spawn L-block
    if (blockNr == 5) {
        gameBoard[0][6] = 1
        gameBoard[1][4] = 1
        gameBoard[1][5] = 1
        gameBoard[1][6] = 1
    }
    if (blockNr == 6) {
        gameBoard[0][4] = 1
        gameBoard[1][4] = 1
        gameBoard[1][5] = 1
        gameBoard[1][6] = 1
    }
    if (blockNr == 7) {
        gameBoard[1][3] = 1
        gameBoard[1][4] = 1
        gameBoard[1][5] = 1
        gameBoard[1][6] = 1
    }
}
function moveDown() {
    // loop backwards so next row is not over written
    for (let i = gameBoard.length - 2; i >= 0; i--) {
        for (let j = 1; j < gameBoard[0].length - 1; j++) {
            if (gameBoard[i][j] === 1) {
                gameBoard[i + 1][j] = 1
                gameBoard[i][j] = 0
            }
        }
    }
}
function moveLeft() {
    // Loop backwards so that gameBoard can be any length
    for (let i = gameBoard.length - 1; i >= 0; i--) {
        // loop --> LEFT to RIGHT to not write over blocks
        for (let j = 1; j <= 10; j++) {
            if (gameBoard[i][j] === 1) {
                gameBoard[i][j] = 0
                gameBoard[i][j - 1] = 1
            }
        }
    }
}
function moveRight() {
    // Loop backwards so that gameBoard can be any length
    for (let i = gameBoard.length - 1; i >= 0; i--) {
        // loop <-- RIGHT to LEFT  to not write over blocks
        for (let j = gameBoard[0].length - 2; j >= 1; j--) {
            if (gameBoard[i][j] === 1) {
                gameBoard[i][j] = 0
                gameBoard[i][j + 1] = 1
            }
        }
    }
}
function collideLeft() {
    for (let i = gameBoard.length - 2; i >= 0; i--) {
        for (let j = 0; j <= gameBoard[0].length - 2; j++) {
            // checking left
            if (gameBoard[i][j] === 1 && gameBoard[i][j - 1] === -1) {
                return true
            }
        }
    }
    return false
}
function collideRight() {
    for (let i = gameBoard.length - 2; i >= 0; i--) {
        for (let j = gameBoard[0].length - 2; j >= 1; j--) {
            // checking RIGHT
            if (gameBoard[i][j] === 1 && gameBoard[i][j + 1] === -1) {
                return true
            }
        }
    }
    return false
}
function removeFullRow() {
    for (let y = 0; y < gameBoard.length - 1; y++) {
        let counter = 0
        for (let x = gameBoard[0].length - 2; x >= 1; x--) {
            if (gameBoard[y][x] === -1) {
                counter += 1
                if (counter == 10) {
                    for (let xx = gameBoard[0].length - 2; xx >= 1; xx--) {
                        gameBoard[y][xx] = 0
                    }
                    score += 100
                    moveFrozenDown(y)
                    return true
                }
            }
        }
    }
    false
}
function moveFrozenDown(row) {
    for (row; row >= 1; row--) {
        for (let x = gameBoard[0].length - 2; x >= 1; x--) {
            if (gameBoard[row][x] == -1) {
                gameBoard[row][x] = 0
                gameBoard[row + 1][x] = -1
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////
// GAME LOOP
function gameLoop() {
    frameNr += 1

    if (isGameOver()) {
        startNewGame()
        return
    }
    // Only update game logic if enough time have passed
    if (performance.now() - PrevUpdateTime >= frameTime) {
        document.querySelector('.score').innerHTML = `${score} (${highScore})`

        if (normalFPS <= maxFPS) {
            normalFPS += 0.005
        }

        if (blockCollidedDownward()) {
            freezeBlocks()
            score += 10

            rotationState = 1
            while (removeFullRow()) {
                removeFullRow()
            }
        } else {
            moveDown()
        }

        if (isNoBlockInPlay()) {
            spawnRandomBlock()
        }

        PrevUpdateTime = performance.now()
    }
    if (isSpawnFieldEmpty() && frameNr % 4 === 0) {
        if (moveLeftToggle && !collideLeft()) {
            moveLeft()
        }
        if (moveRightToggle && !collideRight()) {
            moveRight()
        }
    }
    render()
    if (!isPaused) {
        requestAnimationFrame(gameLoop)
    }
}
/////////////////////////////////////////////////////////////////////////////
// CONTROLS
function keyDown(key) {
    if (key.key == 'a') {
        moveLeftToggle = true
    }
    if (key.key == 'd') {
        moveRightToggle = true
    }
    if (key.key == 'w') {
        if (isSpawnFieldEmpty()) {
            rotateBlockClockwise()
        }
    }
    if (key.key == 's') {
        frameTime = 1000 / quickDropFPS
    }
   
    
}

function keyUp(key) {
    if (key.key == 'a') {
        moveLeftToggle = false
    }
    if (key.key == 'd') {
        moveRightToggle = false
    }
    if (key.key == 's') {
        frameTime = 1000 / normalFPS
    }
}
/////////////////////////////////////////////////////////////////////////////
// GRAPHICS
function blockColor() {
    if (blockNr == 1) {
        return 'oBlock'
    }
    if (blockNr == 2) {
        return 'tBlock'
    }
    if (blockNr == 3) {
        return 'sBlock'
    }
    if (blockNr == 4) {
        return 'zBlock'
    }
    if (blockNr == 5) {
        return 'lBlock'
    }
    if (blockNr == 6) {
        return 'jBlock'
    }
    if (blockNr == 7) {
        return 'iBlock'
    }
}
function render() {
    for (let i = 0; i < gameBoard.length - 1; i++) {
        for (let j = 1; j < gameBoard[0].length - 1; j++) {
            if (gameBoard[i][j] === 1) {
                document.getElementById(`${j},${i}`).removeAttribute('class')
                document
                    .getElementById(`${j},${i}`)
                    .classList.add('block', 'liveBlock', blockColor())
            }
            if (gameBoard[i][j] === 0) {
                document.getElementById(`${j},${i}`).removeAttribute('class')
                document
                    .getElementById(`${j},${i}`)
                    .classList.add('block', 'backgroundBlock')
            }
            if (gameBoard[i][j] === -1) {
                document.getElementById(`${j},${i}`).removeAttribute('class')
                document
                    .getElementById(`${j},${i}`)
                    .classList.add('block', 'frozenBlock')
            }
            if (i <= 2) {
                document.getElementById(`${j},${i}`).removeAttribute('class')
                document
                    .getElementById(`${j},${i}`)
                    .classList.add('block', 'spawnAreaBlock')
            }
        }
    }
}
function createBlocks() {
    for (let i = gameBoard.length - 1; i >= 0; i--) {
        for (let j = gameBoard[0].length - 1; j >= 0; j--) {
            tmpDiv = document.createElement('div')
            tmpDiv.classList.add('block')
            tmpDiv.id = `${j},${i}`
            tmpDiv.style.transform = `translate(${j * 20}px,${i * 20}px)`
            gameBoardDiv.appendChild(tmpDiv)
        }
    }
}
function destroyBlocks() {
    gameBoardDiv.innerHTML = ''
}
function setGameBoard() {
    for (let y = 0; gameBoard.length - 1 > y; y++) {
        for (let x = 0; gameBoard[0].length - 1 > x; x++) {
            gameBoard[y][x] = 0
        }
    }
    // bottom
    for (let i = 0; i < gameBoard[i].length; i++) {
        gameBoard[gameBoard.length - 1][i] = -1
        //document.getElementById(`${i},${gameBoard.length - 1}`).style.backgroundColor = "red";
        document
            .getElementById(`${i},${gameBoard.length - 1}`)
            .classList.add('bottomEdge')
    }
    // sides
    for (let i = 0; i < gameBoard.length; i++) {
        gameBoard[i][0] = -1
        gameBoard[i][gameBoard[0].length - 1] = -1
        document.getElementById(`${0},${i}`).classList.add('sideEdge')
        document
            .getElementById(`${gameBoard[0].length - 1},${i}`)
            .classList.add('sideEdge')
    }
}
/////////////////////////////////////////////////////////////////////////////
// INIT GAMEBOARD AND WAIT FOR BUTTONPRESS
createBlocks();
setGameBoard();
 document.querySelector('.score').innerHTML = `${0} (${0})`