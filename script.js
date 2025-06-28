const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const faseEl = document.getElementById("fase");
const statusEl = document.getElementById("status");

let map = [];
let pacmanPos = 21;
let ghosts = [];
let dots = 0;
let score = 0;
let fase = 1;

function buildMap() {
  game.innerHTML = "";
  map = [];

  const layout = [
    // 0 = vazio, 1 = parede, 2 = ponto
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,1,
    1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,2,1,
    1,2,1,2,1,2,2,2,2,2,2,1,2,1,2,2,2,1,2,1,
    1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,
    1,2,2,2,2,2,2,2,2,1,2,1,2,2,2,1,2,2,2,1,
    1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,
    1,2,2,2,2,2,2,1,2,1,2,2,2,1,2,2,2,2,2,1,
    1,2,1,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,2,1,
    1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,1,2,1,
    1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,
    1,2,2,2,2,1,2,2,2,1,2,1,2,2,2,1,2,2,2,1,
    1,2,1,1,2,1,1,1,2,1,2,1,2,1,2,1,1,1,2,1,
    1,2,1,2,2,2,2,1,2,1,2,2,2,1,2,2,2,1,2,1,
    1,2,1,2,1,1,2,1,2,1,1,1,2,1,1,1,2,1,2,1,
    1,2,1,2,1,2,2,1,2,2,2,1,2,2,2,1,2,2,2,1,
    1,2,1,2,1,2,1,1,1,1,2,1,1,1,2,1,1,1,2,1,
    1,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,1,
    1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  ];

  layout.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    if (val === 1) {
      cell.classList.add("wall");
    } else if (val === 2) {
      cell.classList.add("dot");
      dots++;
    }

    game.appendChild(cell);
    map.push(cell);
  });

  // Add Pac-Man
  map[pacmanPos].classList.add("pacman");

  // Add ghosts
  ghosts.forEach(pos => map[pos].classList.add("ghost"));
}

function movePacman(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    map[pacmanPos].classList.remove("pacman");

    let next = pacmanPos;
    if (e.key === "ArrowUp") next -= 20;
    if (e.key === "ArrowDown") next += 20;
    if (e.key === "ArrowLeft") next -= 1;
    if (e.key === "ArrowRight") next += 1;

    if (!map[next].classList.contains("wall")) {
      pacmanPos = next;
    }

    if (map[pacmanPos].classList.contains("dot")) {
      map[pacmanPos].classList.remove("dot");
      score++;
      dots--;
      scoreEl.textContent = "Pontos: " + score;
      if (dots === 0) nextFase();
    }

    map[pacmanPos].classList.add("pacman");

    checkCollision();
  }
}

function moveGhosts() {
  ghosts.forEach((g, i) => {
    map[g].classList.remove("ghost");

    let options = [g - 1, g + 1, g - 20, g + 20];
    options = options.filter(
      (o) =>
        o >= 0 &&
        o < 400 &&
        !map[o].classList.contains("wall") &&
        !ghosts.includes(o)
    );

    // perseguir pacman
    options.sort((a, b) => {
      const da = Math.abs(a % 20 - pacmanPos % 20) + Math.abs(Math.floor(a / 20) - Math.floor(pacmanPos / 20));
      const db = Math.abs(b % 20 - pacmanPos % 20) + Math.abs(Math.floor(b / 20) - Math.floor(pacmanPos / 20));
      return da - db;
    });

    ghosts[i] = options[0] || g;
    map[ghosts[i]].classList.add("ghost");
  });

  checkCollision();
}

function checkCollision() {
  if (ghosts.includes(pacmanPos)) {
    statusEl.textContent = "💀 Game Over!";
    clearInterval(ghostInterval);
    document.removeEventListener("keydown", movePacman);
  }
}

function nextFase() {
  fase++;
  if (fase > 3) {
    statusEl.textContent = "🏆 Você venceu todas as fases!";
    return;
  }

  pacmanPos = 21;
  ghosts = fase === 2 ? [358, 61] : [358, 61, 280, 110, 140];
  dots = 0;
  score = 0;
  faseEl.textContent = "Fase: " + fase;
  scoreEl.textContent = "Pontos: 0";
  buildMap();
}

document.addEventListener("keydown", movePacman);
let ghostInterval;

function startGame() {
  pacmanPos = 21;
  ghosts = [358]; // 1 fantasma na fase 1
  dots = 0;
  score = 0;
  fase = 1;
  statusEl.textContent = "";
  faseEl.textContent = "Fase: 1";
  scoreEl.textContent = "Pontos: 0";
  buildMap();
  ghostInterval = setInterval(moveGhosts, 500);
}

startGame();
