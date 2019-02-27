const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
document.addEventListener("keydown", onKeyDown.bind(this));

context.scale(30, 30);

let direction = 1;

function scanColumn() {
  let rowCount = 1;
  outer: for (let y = field.length - 1; y >= 0; --y) {
    for (let x = 0; x < field[y].length; ++x) {
      if (field[y][x] === 0) {
        continue outer;
      }
    }

    const row = field.splice(y, 1)[0].fill(0);
    field.splice(15, 0, row);
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function onCollider(field, player) {
  const [m, o] = [player.matrix, player.pos];
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

  drawMatrix(field, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(y + offset.y, x + offset.x, 1 - 0.05, 1 - 0.05);
      }
    });
  });
}

function merge(field, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        field[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}
function pieceDrop() {
  player.pos.y += direction;
  if (onCollider(field, player)) {
    player.pos.y -= direction;
    merge(field, player);
    pieceReset();
    scanColumn();
    updateScore();

    direction = -direction;
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (onCollider(field, player)) {
    player.pos.x -= dir;
  }
}

function pieceReset() {
  const pieces = "ILJOTSZ";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = ((field.length / 2) | 0) - ((player.matrix.length / 2) | 0);
  player.pos.x =
    ((field[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  if (onCollider(field, player)) {
    field.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (onCollider(field, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
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
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    pieceDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById("score").innerText = player.score;
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

const field = createMatrix(12, 30);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0
};

function onKeyDown(event) {
  if (event.keyCode === 38) {
    playerMove(-1);
  } else if (event.keyCode === 40) {
    playerMove(1);
  } else if (event.keyCode === 32) {
    playerRotate(1);
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    pieceDrop();
  }
}

function up() {
  playerMove(-1);
}
function down() {
  playerMove(1);
}
function rotateButton() {
  playerRotate(1);
}
function drop() {
  pieceDrop();
}

pieceReset();
updateScore();
update();
