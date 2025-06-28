// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 20;
const rows = 20;
const cols = 20;

let gameState = {
  phase: 1,
  score: 0,
  lives: 3,
  pelletsRemaining: 0,
  pacman: { x: 1, y: 1, dir: null },
  ghosts: [],
  maze: [],
  playing: false,
};

const soundPellet = new Audio('sounds/pellet.wav');
const soundGameOver = new Audio('sounds/gameover.wav');

let mouthOpen = true;

function startPacmanGame() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameOverScreen').style.display = 'none';
  gameState.score = 0;
  gameState.lives = 3;
  initPhase(1);
  if (window.gameInterval) clearInterval(window.gameInterval);
  window.gameInterval = setInterval(gameLoop, 200);
}

function initPhase(phase) {
  gameState.maze = JSON.parse(JSON.stringify(mazeLayouts[0]));
  gameState.phase = phase;
  gameState.pacman = { x: 1, y: 1, dir: null };
  gameState.ghosts = [];
  gameState.pelletsRemaining = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (gameState.maze[y][x] === 2) gameState.pelletsRemaining++;
    }
  }

  let ghostCount = phase === 1 ? 1 : (phase === 2 ? 2 : 5);
  for (let i = 0; i < ghostCount; i++) {
    gameState.ghosts.push({ x: 18, y: 18 - i * 2, dir: 'left' });
  }

  gameState.playing = true;
  updateStatusBar();
}

function updateStatusBar() {
  document.getElementById('statusBar').textContent = `Vidas: ${gameState.lives} | Pontos: ${gameState.score}`;
}

function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cell = gameState.maze[y][x];
      if (cell === 1) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        if (cell === 2) {
          ctx.fillStyle = 'yellow';
          ctx.beginPath();
          ctx.arc(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

function drawPacman() {
  const p = gameState.pacman;
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  const cx = p.x * tileSize + tileSize / 2;
  const cy = p.y * tileSize + tileSize / 2;
  const radius = tileSize / 2 - 2;

  if (!p.dir || !mouthOpen) {
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  } else {
    let startAngle = 0.25 * Math.PI;
    let endAngle = 1.75 * Math.PI;
    switch (p.dir) {
      case 'left': startAngle += Math.PI; endAngle += Math.PI; break;
      case 'up': startAngle += 1.5 * Math.PI; endAngle += 1.5 * Math.PI; break;
      case 'down': startAngle += 0.5 * Math.PI; endAngle += 0.5 * Math.PI; break;
    }
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
  }
  ctx.fill();
}

function drawGhosts() {
  ctx.fillStyle = 'red';
  for (let g of gameState.ghosts) {
    ctx.beginPath();
    ctx.arc(g.x * tileSize + tileSize / 2, g.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function canMove(x, y) {
  return x >= 0 && x < cols && y >= 0 && y < rows && gameState.maze[y][x] !== 1;
}

function movePacman() {
  const p = gameState.pacman;
  if (!p.dir) return;
  let nx = p.x, ny = p.y;
  if (p.dir === 'left') nx--;
  else if (p.dir === 'right') nx++;
  else if (p.dir === 'up') ny--;
  else if (p.dir === 'down') ny++;

  if (canMove(nx, ny)) {
    p.x = nx;
    p.y = ny;
    if (gameState.maze[ny][nx] === 2) {
      gameState.maze[ny][nx] = 0;
      gameState.pelletsRemaining--;
      soundPellet.play();
      gameState.score += 10;
      updateStatusBar();
    }
  }
}

function distanceToPacman(g, dir) {
  let nx = g.x, ny = g.y;
  if (dir === 'left') nx--;
  else if (dir === 'right') nx++;
  else if (dir === 'up') ny--;
  else if (dir === 'down') ny++;
  let dx = gameState.pacman.x - nx;
  let dy = gameState.pacman.y - ny;
  return Math.sqrt(dx * dx + dy * dy);
}

function moveGhosts() {
  for (let g of gameState.ghosts) {
    let dirs = ['left', 'right', 'up', 'down'];
    dirs.sort((a, b) => distanceToPacman(g, a) - distanceToPacman(g, b));
    for (let dir of dirs) {
      let nx = g.x, ny = g.y;
      if (dir === 'left') nx--;
      else if (dir === 'right') nx++;
      else if (dir === 'up') ny--;
      else if (dir === 'down') ny++;
      if (canMove(nx, ny)) {
        g.x = nx;
        g.y = ny;
        g.dir = dir;
        break;
      }
    }
  }
}

function resetPlayerAndGhosts() {
  gameState.pacman = { x: 1, y: 1, dir: null };
  gameState.ghosts.forEach((g, i) => {
    g.x = 18;
    g.y = 18 - i * 2;
    g.dir = 'left';
  });
}

function checkCollision() {
  for (let g of gameState.ghosts) {
    if (g.x === gameState.pacman.x && g.y === gameState.pacman.y) {
      soundGameOver.play();
      gameState.lives--;
      if (gameState.lives <= 0) {
        gameState.playing = false;
        showGameOver();
      } else {
        resetPlayerAndGhosts();
      }
      updateStatusBar();
      return true;
    }
  }
  return false;
}

function checkWin() {
  if (gameState.pelletsRemaining === 0) {
    if (gameState.phase === 3) {
      gameState.playing = false;
      document.getElementById('message').innerHTML = `Parabéns! Você venceu 🏆`;
      updateHighScore();
      return true;
    } else {
      gameState.phase++;
      initPhase(gameState.phase);
      return true;
    }
  }
  return false;
}

function updateHighScore() {
  let old = parseInt(localStorage.getItem('pacmanHighScore') || '0');
  if (gameState.score > old) {
    localStorage.setItem('pacmanHighScore', gameState.score);
    alert('Nova maior pontuação!');
  }
  document.getElementById('finalScore').innerHTML = `Pontuação: ${gameState.score}<br>Recorde: ${localStorage.getItem('pacmanHighScore')}`;
}

function showGameOver() {
  document.getElementById('gameOverScreen').style.display = 'block';
  document.getElementById('message').textContent = '';
  updateHighScore();
}

function gameLoop() {
  if (!gameState.playing) return;
  movePacman();
  moveGhosts();
  if (checkCollision()) return;
  if (checkWin()) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawPacman();
  drawGhosts();
  mouthOpen = !mouthOpen;
}

document.addEventListener('keydown', e => {
  if (!gameState.playing) return;
  if (e.key === 'ArrowLeft') gameState.pacman.dir = 'left';
  else if (e.key === 'ArrowRight') gameState.pacman.dir = 'right';
  else if (e.key === 'ArrowUp') gameState.pacman.dir = 'up';
  else if (e.key === 'ArrowDown') gameState.pacman.dir = 'down';
});

const mazeLayouts = [
  // Uma matriz de 20x20 com 1 = parede, 2 = pellet, 0 = caminho
  // Simplificado para o exemplo (repita se quiser outras fases)
  Array.from({ length: 20 }, (_, y) => Array.from({ length: 20 }, (_, x) => (x === 0 || y === 0 || x === 19 || y === 19) ? 1 : 2))
];
