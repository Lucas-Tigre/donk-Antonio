const gameContainer = document.getElementById('game-container');
const pacman = document.getElementById('pacman');
const scoreElement = document.getElementById('score');
const statusElement = document.getElementById('status');
const restartButton = document.getElementById('restart');
const pauseButton = document.getElementById('pause');
let gamePaused = false;

pauseButton.addEventListener('click', () => {
  if (gamePaused) {
    // Continuar o jogo
    gameInterval = setInterval(updateGame, 100);
    startPhaseTimer();
    pauseButton.textContent = 'Pausar';
    gamePaused = false;
  } else {
    // Pausar o jogo
    clearInterval(gameInterval);
    clearInterval(phaseTimerInterval);
    pauseButton.textContent = 'Continuar';
    gamePaused = true;
  }
});

const tileSize = 20;
const powerUpDuration = 8000;
const phaseTimeLimit = 60;

const maps = [
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,1,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,1,2,1],
    [1,1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // (Você pode adicionar as outras fases depois)
  [ // Fase 2 (novo mapa)
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,1,2,2,2,2,1,2,2,2,1,2,2,2,3,2,1],
    [1,2,1,2,1,2,1,1,2,1,2,1,2,1,2,1,1,1,2,1],
    [1,2,1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,2,1,1,1,2,1,2,1,2,1],
    [1,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,1,2,1],
    [1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,2,2,2,1,2,2,2,2,2,2,3,2,2,3,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

   [ // Fase 3 - Labirinto mais complexo com mais paredes e power-ups
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,3,2,1,2,2,3,2,2,2,3,1,2,3,2,3,2,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,3,1,2,2,2,3,2,2,1,2,2,2,2,2,3,2,1,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,1,3,1],
    [1,1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,1,1,2,1],
    [1,2,3,2,2,2,2,2,2,1,2,2,3,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,3,2,2,3,2,1,2,2,2,3,2,2,3,2,3,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
];

let map = maps[0];

let score = 0;
let collectedCoins = 0;
let totalCoins = 0;
let pacmanX = tileSize;
let pacmanY = tileSize;
let direction = 0;
let nextDirection = 0;
let gameInterval;
let coins = [];
let walls = [];
let ghosts = [];

let currentPhase = 1;
let lives = 3;
let powerUpActive = false;
let powerUpTimeout = null;
let phaseTimeLeft = phaseTimeLimit;
let phaseTimerInterval = null;

function createWall(x, y, width, height) {
  const wall = document.createElement('div');
  wall.className = 'wall';
  wall.style.left = x + 'px';
  wall.style.top = y + 'px';
  wall.style.width = width + 'px';
  wall.style.height = height + 'px';
  gameContainer.appendChild(wall);
  walls.push({ element: wall, x, y, width, height });
}

function createCoin(x, y) {
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.style.left = x + 'px';
  coin.style.top = y + 'px';
  gameContainer.appendChild(coin);
  coins.push({ element: coin, x, y, collected: false, powerUp: false });
}

function createPowerUp(x, y) {
  const powerup = document.createElement('div');
  powerup.className = 'coin';
  powerup.style.left = x + 'px';
  powerup.style.top = y + 'px';
  powerup.style.width = '10px';
  powerup.style.height = '10px';
  powerup.style.backgroundColor = '#0F0';
  gameContainer.appendChild(powerup);
  coins.push({ element: powerup, x, y, collected: false, powerUp: true });
}

function createMap() {
  walls.forEach(w => w.element.remove());
  coins.forEach(c => c.element.remove());
  walls = [];
  coins = [];
  totalCoins = 0;

  for(let row=0; row < map.length; row++){
    for(let col=0; col < map[row].length; col++){
      const cell = map[row][col];
      const x = col * tileSize;
      const y = row * tileSize;

      if(cell === 1) createWall(x, y, tileSize, tileSize);
      else if(cell === 2){
        createCoin(x + 7, y + 7);
        totalCoins++;
      }
      else if(cell === 3){
        createPowerUp(x + 5, y + 5);
        totalCoins++;
      }
    }
  }
}

function isCollisionWithWalls(x, y, width, height) {
  for (const wall of walls) {
    if (
      x < wall.x + wall.width &&
      x + width > wall.x &&
      y < wall.y + wall.height &&
      y + height > wall.y
    ) {
      return true;
    }
  }
  return false;
}

function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(
    x1 + w1 <= x2 ||
    x1 >= x2 + w2 ||
    y1 + h1 <= y2 ||
    y1 >= y2 + h2
  );
}

function handleKeyPress(e) {
  switch (e.key) {
    case 'ArrowUp':
      nextDirection = 1;
      break;
    case 'ArrowRight':
      nextDirection = 2;
      break;
    case 'ArrowDown':
      nextDirection = 3;
      break;
    case 'ArrowLeft':
      nextDirection = 4;
      break;
  }
}

function updateDirection() {
  if (nextDirection === 0) return;

  let newX = pacmanX;
  let newY = pacmanY;

  switch (nextDirection) {
  case 1: newY -= 8; break;
  case 2: newX += 8; break;
  case 3: newY += 8; break;
  case 4: newX -= 8; break;
  }

  if (!isCollisionWithWalls(newX, newY, tileSize, tileSize)) {
    direction = nextDirection;
  }
}

function movePacman() {
  let newX = pacmanX;
  let newY = pacmanY;

 switch (nextDirection) {
  case 1: newY -= 8; break;
  case 2: newX += 8; break;
  case 3: newY += 8; break;
  case 4: newX -= 8; break;
}

  // Limita dentro dos limites do container
  newX = Math.max(0, Math.min(newX, gameContainer.clientWidth - tileSize));
  newY = Math.max(0, Math.min(newY, gameContainer.clientHeight - tileSize));

  if (!isCollisionWithWalls(newX, newY, tileSize, tileSize)) {
    pacmanX = newX;
    pacmanY = newY;
    pacman.style.left = pacmanX + 'px';
    pacman.style.top = pacmanY + 'px';
  }
}

function createGhost(x, y, color) {
  const ghost = document.createElement('div');
  ghost.className = 'ghost';

  if (color === '#F00') ghost.classList.add('red');
  else if (color === '#0FF') ghost.classList.add('blue');
  else if (color === '#FF0') ghost.classList.add('yellow');

  ghost.style.left = x + 'px';
  ghost.style.top = y + 'px';
  // Remova esta linha para evitar sobrescrever a imagem:
  // ghost.style.backgroundColor = color;
  gameContainer.appendChild(ghost);
  ghosts.push({ element: ghost, x, y, dirX: 0, dirY: 0 });
}

function createGhost(x, y, color) {
  const ghost = document.createElement('div');
  ghost.className = 'ghost';

  if (color === '#F00') ghost.classList.add('red');
  else if (color === '#0FF') ghost.classList.add('blue');
  else if (color === '#FF0') ghost.classList.add('yellow');

  ghost.style.left = x + 'px';
  ghost.style.top = y + 'px';
  gameContainer.appendChild(ghost);
  ghosts.push({ element: ghost, x, y, dirX: 0, dirY: 0 });
}

function moveGhosts() {
  ghosts.forEach(ghost => {
    // Movimento aleatório simples
    if (ghost.dirX === 0 && ghost.dirY === 0) {
      const dirs = [
        { x: 0, y: -5 },
        { x: 5, y: 0 },
        { x: 0, y: 5 },
        { x: -5, y: 0 }
      ];
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      ghost.dirX = d.x;
      ghost.dirY = d.y;
    }

    let newX = ghost.x + ghost.dirX;
    let newY = ghost.y + ghost.dirY;

    // Se colidir com parede, muda direção
    if (isCollisionWithWalls(newX, newY, tileSize, tileSize)) {
      ghost.dirX = 0;
      ghost.dirY = 0;
    } else {
      ghost.x = newX;
      ghost.y = newY;
      ghost.element.style.left = ghost.x + 'px';
      ghost.element.style.top = ghost.y + 'px';
    }
  });
}

function checkCoinCollision() {
  coins.forEach(coin => {
    if (!coin.collected) {
      if (isColliding(pacmanX, pacmanY, tileSize, tileSize,
                      coin.x, coin.y, coin.element.offsetWidth, coin.element.offsetHeight)) {
        coin.collected = true;
        coin.element.style.display = 'none';
        score++;
        collectedCoins++;
        updateScoreAndLives();

        if (coin.powerUp) {
          activatePowerUp();
        }
      }
    }
  });
}

function activatePowerUp() {
  powerUpActive = true;
  updateScoreAndLives();
  if (powerUpTimeout) clearTimeout(powerUpTimeout);

  powerUpTimeout = setTimeout(() => {
    powerUpActive = false;
    updateScoreAndLives();
  }, powerUpDuration);
}

function checkGhostCollision() {
  const collisionSize = 16;
  const offset = (tileSize - collisionSize) / 2;

  for (const ghost of ghosts) {
    if (isColliding(
      pacmanX + offset, pacmanY + offset, collisionSize, collisionSize,
      ghost.x + offset, ghost.y + offset, collisionSize, collisionSize
    )) {
      if (powerUpActive) {
        // Fantasma comido
        ghost.element.style.display = 'none';
        ghosts = ghosts.filter(g => g !== ghost);
        score += 5;
        updateScoreAndLives();
      } else {
        lives--;
        updateScoreAndLives();
        if (lives <= 0) {
          endGame(false);
        } else {
          // Resetar posição e fantasmas
          pacmanX = tileSize;
          pacmanY = tileSize;
          pacman.style.left = pacmanX + 'px';
          pacman.style.top = pacmanY + 'px';
          direction = 0;
          nextDirection = 0;
          createGhosts();
        }
      }
      break;
    }
  }
}

function updateScoreAndLives() {
  scoreElement.textContent = `Pontos: ${score} | Vidas: ${lives}` + (powerUpActive ? ' | POWER-UP ATIVO!' : '');
}

function updateGame() {
  updateDirection();
  movePacman();
  moveGhosts();
  checkCoinCollision();
  checkGhostCollision();

  if (collectedCoins >= totalCoins) {
    endGame(true);
  }
}

function startPhaseTimer() {
  phaseTimeLeft = phaseTimeLimit;
  statusElement.style.display = 'none';

  if (phaseTimerInterval) clearInterval(phaseTimerInterval);

  phaseTimerInterval = setInterval(() => {
    phaseTimeLeft--;
    if (phaseTimeLeft <= 0) {
      clearInterval(phaseTimerInterval);
      endGame(false);
    }
  }, 1000);
}

function endGame(won) {
  clearInterval(gameInterval);
  //clearInterval(phaseTimerInterval);
  statusElement.style.display = 'block';
  restartButton.style.display = 'block';

  if (won) {
    statusElement.textContent = `Você venceu a fase ${currentPhase}!`;
    // Remova a linha abaixo:
    // currentPhase++;

    if (currentPhase >= maps.length) {
      statusElement.textContent = 'Parabéns! Você completou todas as fases!';
      restartButton.textContent = 'Reiniciar Jogo';
    } else {
      restartButton.textContent = 'Próxima fase';
    }
  } else {
    statusElement.textContent = 'Você perdeu!';
    restartButton.textContent = 'Reiniciar Jogo';
  }
}

function restartGame() {
  statusElement.style.display = 'none';
  restartButton.style.display = 'none';
  map = maps[currentPhase - 1];
  createMap();
  createGhosts();
  score = 0;
  collectedCoins = 0;
  lives = 3;
  powerUpActive = false;
  direction = 0;
  nextDirection = 0;
  pacmanX = tileSize;
  pacmanY = tileSize;
  pacman.style.left = pacmanX + 'px';
  pacman.style.top = pacmanY + 'px';
  updateScoreAndLives();
  //startPhaseTimer();

  gameInterval = setInterval(updateGame, 100);
}

restartButton.addEventListener('click', () => {
  if (restartButton.textContent === 'Próxima fase') {
    currentPhase++;
  } else {
    currentPhase = 1; // Reiniciar do começo se perdeu ou reiniciou manualmente
  }
  restartGame();
});

const touchControls = document.getElementById('touch-controls');

touchControls.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    nextDirection = parseInt(e.target.getAttribute('data-dir'));
  }
});

window.onload = () => {
  createMap();
  createGhosts();
  updateScoreAndLives();
  document.addEventListener('keydown', handleKeyPress);
  gameInterval = setInterval(updateGame, 100);
  startPhaseTimer();
};