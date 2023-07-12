const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
document.addEventListener("keydown", onKeyDown.bind(this));

context.scale(30, 30);

let direction = 1
let playerTurn = 1;

let playerOneLeft = 65;
let playerOneRight = 68;
let playerOneUp = 87;
let playerOneDown = 83;

let playerTwoLeft = 37;
let playerTwoRight = 39;
let playerTwoUp = 38;
let playerTwoDown = 40;

var play = false;

function scanColumn() {
    let rowCount = 1;
    outer: for (let y = field.length - 1; y >= 0; --y) {
        for (let x = 0; x < field[y].length; ++x) {
            if (field[y][x] === 0) {
                continue outer;
            }
        }

        const row = field.splice(y, 1)[0].fill(0);
        field.splice(12, 0, row);
        ++y;

        if (direction === playerTurn) {
            stat.playerOne++;
            updateScores();
        } else {
            stat.playerTwo++;
            updateScores();
        }

        rowCount *= 2;
    }
}

function onCollider(field, stat) {
    const [m, o] = [stat.matrix, stat.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (field[y + o.y] && field[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(field, {x: 0, y: 0});
    drawMatrix(stat.matrix, stat.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1 - 0.05, 1 - 0.05);
            }
        });
    });
}

function merge(field, stat) {
    stat.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                field[y + stat.pos.y][x + stat.pos.x] = value;
            }
        });
    });
}

function pieceDrop() {
    stat.pos.y += direction;
    if (onCollider(field, stat)) {
        stat.pos.y -= direction;
        merge(field, stat);
        pieceReset();
        scanColumn();
        togglePlayerTurn();

        direction = -direction;
    }
    dropCounter = 0;
}

function playerMove(dir) {
    stat.pos.x += dir;
    if (onCollider(field, stat)) {
        stat.pos.x -= dir;
    }
}

function pieceReset() {
    const pieces = "ILJOTSZ";
    stat.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    stat.pos.y = ((field.length / 2) | 0) - ((stat.matrix.length / 2) | 0);
    stat.pos.x =
        ((field[0].length / 2) | 0) - ((stat.matrix[0].length / 2) | 0);

    if (onCollider(field, stat)) {
        field.forEach(row => row.fill(0));
        playerTurn = -playerTurn;
        gameOver();
    }
}

function playerRotate(dir) {
    const pos = stat.pos.x;
    let offset = 1;
    rotate(stat.matrix, dir);
    while (onCollider(field, stat)) {
        stat.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > stat.matrix[0].length) {
            rotate(stat.matrix, -dir);
            stat.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    if (play === false)
        return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        pieceDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const colors = [
    null,
    "red",
    "blue",
    "violet",
    "green",
    "purple",
    "orange",
    "pink"
];

const field = createMatrix(12, 24);

const stat = {
    pos: {x: 0, y: 0},
    matrix: null,
    playerOne: 0,
    playerTwo: 0
};

function onKeyDown(event) {
    if (direction === playerTurn) {
        if (event.keyCode === playerOneLeft) {
            playerMove(-1);
        }
        if (event.keyCode === playerOneRight) {
            playerMove(1);
        }
        if (event.keyCode === playerOneUp) {
            playerRotate(1);
        }
        if (event.keyCode === playerOneDown) {
            pieceDrop();
        }
    }

    if (direction === -playerTurn) {
        if (event.keyCode === playerTwoLeft) {
            playerMove(-1);
        }
        if (event.keyCode === playerTwoRight) {
            playerMove(1);
        }
        if (event.keyCode === playerTwoUp) {
            playerRotate(1);
        }
        if (event.keyCode === playerTwoDown) {
            pieceDrop();
        }
    }
}

function left(turn) {
    if (direction === turn)  playerMove(-1);
}

function right(turn) {
    if (direction === turn)  playerMove(1);
}

function up(turn) {
    if (direction === turn)  playerRotate(1);
}

function down(turn) {
    if (direction === turn)  pieceDrop();
}

function gameOver() {
    play = false;
    document.getElementById("winner-parent").classList.remove("hidden");
    if (stat.playerTwo > stat.playerOne) {
        document.getElementById("winner").innerText = "Two";
    } else if (stat.playerOne > stat.playerTwo) {
        document.getElementById("winner").innerText = "One";
    } else {
        document.getElementById("draw").innerText = "Draw";
        document.getElementById("winner-parent").classList.add("hidden");
    }

    document.getElementById("score").innerText = stat.playerOne + " - " + stat.playerTwo;

    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("game").classList.add("hidden");
}

function updateScores() {
    document.getElementById("playerone").innerText = stat.playerOne;
    document.getElementById("playertwo").innerText = stat.playerTwo;
}

function togglePlayerTurn() {
    if (direction === -playerTurn) {
        document.getElementById("player-one-name").classList.add("underline");
        document.getElementById("player-two-name").classList.remove("underline");
    } else if (direction === playerTurn) {
        document.getElementById("player-one-name").classList.remove("underline");
        document.getElementById("player-two-name").classList.add("underline");
    }
}

function playGame() {
    document.getElementById("play").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    document.getElementById("game-over").classList.add("hidden");

    stat.playerOne = 0;
    stat.playerTwo = 0;

    play = true;

    pieceReset();
    update();
    updateScores();
}
