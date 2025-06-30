const gameContainer = document.getElementById('game-container');
const pacman = document.getElementById('pacman');
const scoreElement = document.getElementById('score');
const statusElement = document.getElementById('status');
const restartButton = document.getElementById('restart');
const pauseButton = document.getElementById('pause');

let gamePaused = false;
let gameInterval = null;

pauseButton.addEventListener('click', () => {
  if (gamePaused) {
    if (!gameInterval) {
      gameInterval = setInterval(updateGame, 100);
    }
    pauseButton.textContent = 'Pausar';
    gamePaused = false;
  } else {
    clearInterval(gameInterval);
    gameInterval = null;
    pauseButton.textContent = 'Continuar';
    gamePaused = true;
  }
});

const tileSize = 20;
const powerUpDuration = 8000;

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
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,3,1,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,1],
    [1,2,1,1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,3,1,2,2,2,2,2,1,2,1],
    [1,1,1,1,1,1,2,1,1,1,2,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
 [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
  [1,3,1,0,0,1,2,1,2,1,3,1,2,1,2,1,0,1,2,1],
  [1,2,1,0,0,1,2,2,2,1,2,2,2,1,2,1,0,1,3,1],
  [1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,0,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,2,1,1,1,1,2,1,1,1,1,2,1,1],
  [1,2,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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
let coins = [];
let walls = [];
let ghosts = [];
let currentPhase = 1;
let lives = 3;
let powerUpActive = false;
let powerUpTimeout = null;

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
  coin.style.left = (x + tileSize / 2 - 3) + 'px';
  coin.style.top = (y + tileSize / 2 - 3) + 'px';
  gameContainer.appendChild(coin);
  coins.push({ element: coin, x: x + tileSize / 2 - 3, y: y + tileSize / 2 - 3, collected: false, powerUp: false });
}

function createPowerUp(x, y) {
  const powerup = document.createElement('div');
  powerup.className = 'coin';
  powerup.style.width = '10px';
  powerup.style.height = '10px';
  powerup.style.backgroundColor = '#0F0';
  powerup.style.left = (x + tileSize / 2 - 5) + 'px';
  powerup.style.top = (y + tileSize / 2 - 5) + 'px';
  gameContainer.appendChild(powerup);
  coins.push({ element: powerup, x: x + tileSize / 2 - 5, y: y + tileSize / 2 - 5, collected: false, powerUp: true });
}

function createMap() {
  walls.forEach(w => w.element.remove());
  coins.forEach(c => c.element.remove());
  walls = [];
  coins = [];
  totalCoins = 0;

  map = maps[currentPhase - 1];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const cell = map[row][col];
      const x = col * tileSize;
      const y = row * tileSize;
      if (cell === 1) createWall(x, y, tileSize, tileSize);
      else if (cell === 2) {
        createCoin(x, y);
        totalCoins++;
      } else if (cell === 3) {
        createPowerUp(x, y);
        totalCoins++;
      }
    }
  }
}

function isCollisionWithWalls(x, y, width, height) {
  return walls.some(wall =>
    x < wall.x + wall.width &&
    x + width > wall.x &&
    y < wall.y + wall.height &&
    y + height > wall.y
  );
}

function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 <= x2 || x1 >= x2 + w2 || y1 + h1 <= y2 || y1 >= y2 + h2);
}

function handleKeyPress(e) {
  switch (e.key) {
    case 'ArrowUp': nextDirection = 1; break;
    case 'ArrowRight': nextDirection = 2; break;
    case 'ArrowDown': nextDirection = 3; break;
    case 'ArrowLeft': nextDirection = 4; break;
  }
}
function updateDirection() {
  if (nextDirection === 0) return;

  let newX = pacmanX;
  let newY = pacmanY;

  switch (nextDirection) {
    case 1: newY -= 5; break;
    case 2: newX += 5; break;
    case 3: newY += 5; break;
    case 4: newX -= 5; break;
  }

  if (!isCollisionWithWalls(newX, newY, tileSize, tileSize)) {
    direction = nextDirection;
  }
}

function movePacman() {
  let newX = pacmanX;
  let newY = pacmanY;

  switch (direction) {
    case 1: newY -= 5; break;
    case 2: newX += 5; break;
    case 3: newY += 5; break;
    case 4: newX -= 5; break;
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
  gameContainer.appendChild(ghost);
  ghosts.push({ element: ghost, x, y, dirX: 0, dirY: 0 });
}

function createGhosts() {
  ghosts.forEach(g => g.element.remove());
  ghosts = [];

  if (currentPhase === 1) {
    createGhost(360, 40, '#F00'); // 1 fantasma vermelho
  } else if (currentPhase === 2) {
    createGhost(360, 40, '#F00'); // vermelho
    createGhost(340, 140, '#0FF'); // azul
  } else if (currentPhase === 3) {
    createGhost(360, 40, '#F00'); // vermelho
    createGhost(340, 140, '#0FF'); // azul
    createGhost(140, 140, '#FF0'); // amarelo
  }
}

function moveGhosts() {
  const directions = [
    { x: 0, y: -5 },
    { x: 5, y: 0 },
    { x: 0, y: 5 },
    { x: -5, y: 0 }
  ];

  ghosts.forEach(ghost => {
    // Se não tem direção, escolhe aleatória
    if (ghost.dirX === 0 && ghost.dirY === 0) {
      const d = directions[Math.floor(Math.random() * directions.length)];
      ghost.dirX = d.x;
      ghost.dirY = d.y;
      ghost.prevDirX = 0;
      ghost.prevDirY = 0;
    }

    let newX = ghost.x + ghost.dirX;
    let newY = ghost.y + ghost.dirY;

    if (isCollisionWithWalls(newX, newY, tileSize, tileSize)) {
      // Tenta escolher nova direção diferente da oposta da atual
      let possibleDirs = directions.filter(d =>
        !(d.x === -ghost.dirX && d.y === -ghost.dirY)
      );

      // Escolhe uma direção válida que não bata na parede
      let found = false;
      for (let i = 0; i < possibleDirs.length; i++) {
        const d = possibleDirs[i];
        if (!isCollisionWithWalls(ghost.x + d.x, ghost.y + d.y, tileSize, tileSize)) {
          ghost.dirX = d.x;
          ghost.dirY = d.y;
          found = true;
          break;
        }
      }

      // Se nenhuma direção válida, inverte
      if (!found) {
        ghost.dirX = -ghost.dirX;
        ghost.dirY = -ghost.dirY;
      }

      newX = ghost.x + ghost.dirX;
      newY = ghost.y + ghost.dirY;
    }

    ghost.x = newX;
    ghost.y = newY;
    ghost.element.style.left = ghost.x + 'px';
    ghost.element.style.top = ghost.y + 'px';
  });
}

function checkGhostCollision() {
  ghosts.forEach((ghost, index) => {
    if (isColliding(pacmanX, pacmanY, tileSize, tileSize,
                    ghost.x, ghost.y, tileSize, tileSize)) {
      if (powerUpActive) {
        // "Comer" fantasma: remove ele e reaparece na posição inicial
        ghost.element.remove();
        ghosts.splice(index, 1);
        // Opcional: pode criar um novo fantasma na posição inicial depois de um tempo
        setTimeout(() => {
          if (currentPhase === 1) {
            createGhost(360, 40, '#F00');
          } else if (currentPhase === 2) {
            // recria os fantasmas conforme a fase (ajuste conforme sua lógica)
            createGhost(360, 40, '#F00');
            createGhost(340, 140, '#0FF');
          } else if (currentPhase === 3) {
            createGhost(360, 40, '#F00');
            createGhost(340, 140, '#0FF');
            createGhost(140, 140, '#FF0');
          }
        }, 3000); // reaparece após 3 segundos
      } else {
        // Pac-Man leva dano
        lives--;
        updateScoreAndLives();
        if (lives <= 0) {
          endGame(false);
        } else {
          resetPositions();
        }
      }
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
        if (coin.powerUp) {
          activatePowerUp();
        }
      }
    }
  });

  updateScoreAndLives();

  if (collectedCoins >= totalCoins) {
    endGame(true);
  }
}

function activatePowerUp() {
  powerUpActive = true;
  if (powerUpTimeout) clearTimeout(powerUpTimeout);
  powerUpTimeout = setTimeout(() => {
    powerUpActive = false;
    updateScoreAndLives();
  }, powerUpDuration);
}

function updateScoreAndLives() {
  scoreElement.textContent = `Pontos: ${score} | Vidas: ${lives}` + (powerUpActive ? ' | Soro da HYDRA!' : '');
}

function resetPositions() {
  pacmanX = tileSize;
  pacmanY = tileSize;
  direction = 0;
  nextDirection = 0;
  pacman.style.left = pacmanX + 'px';
  pacman.style.top = pacmanY + 'px';
  createGhosts();
}

function updateGame() {
  updateDirection();
  movePacman();
  moveGhosts();
  checkCoinCollision();
  checkGhostCollision();  
}

function endGame(won) {
  clearInterval(gameInterval);
  statusElement.style.display = 'block';
  restartButton.style.display = 'block';

  if (won) {
    statusElement.textContent = `Você venceu a fase ${currentPhase}!`;
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

  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

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
  gameInterval = setInterval(updateGame, 100);
  gamePaused = false;
  pauseButton.textContent = 'Pausar';
}

restartButton.addEventListener('click', () => {
  if (restartButton.textContent === 'Próxima fase') {
    currentPhase++;
  } else {
    currentPhase = 1;
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
};
