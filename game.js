const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const faseEl = document.getElementById("fase");
const statusEl = document.getElementById("status");

let pacmanPos = 21;
let direction = null;
let map = [];
let dots = 0;
let score = 0;
let fase = 1;

// Novo labirinto com caminhos abertos
const layout = [
  // 0 = vazio, 1 = parede, 2 = ponto
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,
  1,2,1,2,2,2,2,1,2,2,2,1,2,2,2,2,1,2,2,1,
  1,2,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,2,2,1,
  1,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,1,
  1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,
  1,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,1,2,2,1,
  1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,1,1,
  1,2,2,1,2,2,2,2,2,1,2,1,2,2,2,2,1,2,2,1,
  1,2,1,1,1,1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,
  1,2,2,2,2,2,2,1,2,1,2,2,2,1,2,2,2,2,2,1,
  1,2,1,1,1,1,2,1,2,1,1,1,2,1,1,1,1,1,2,1,
  1,2,1,2,2,2,2,1,2,2,2,1,2,2,2,2,1,2,2,1,
  1,2,1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1,1,
  1,2,2,2,1,2,2,2,2,1,2,2,2,1,2,2,2,2,2,1,
  1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
];

function buildMap() {
  game.innerHTML = "";
  map = [];
  dots = 0;

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

  map[pacmanPos].classList.add("pacman");
}

function movePacman() {
  if (!direction) return;

  const next = getNextPosition();
  if (!map[next] || map[next].classList.contains("wall")) return;

  map[pacmanPos].classList.remove("pacman");

  pacmanPos = next;

  if (map[pacmanPos].classList.contains("dot")) {
    map[pacmanPos].classList.remove("dot");
    score++;
    dots--;
    scoreEl.textContent = "Pontos: " + score;
    if (dots === 0) nextFase();
  }

  map[pacmanPos].classList.add("pacman");
}

function getNextPosition() {
  if (direction === "up") return pacmanPos - 20;
  if (direction === "down") return pacmanPos + 20;
  if (direction === "left") return pacmanPos - 1;
  if (direction === "right") return pacmanPos + 1;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") direction = "up";
  if (e.key === "ArrowDown") direction = "down";
  if (e.key === "ArrowLeft") direction = "left";
  if (e.key === "ArrowRight") direction = "right";
});

function nextFase() {
  fase++;
  statusEl.textContent = `✨ Fase ${fase}`;
  pacmanPos = 21;
  buildMap();
  setTimeout(() => (statusEl.textContent = ""), 2000);
}

function startGame() {
  pacmanPos = 21;
  direction = null;
  score = 0;
  fase = 1;
  scoreEl.textContent = "Pontos: 0";
  faseEl.textContent = "Fase: 1";
  statusEl.textContent = "";
  buildMap();
  setInterval(movePacman, 150); // movimento contínuo
}

startGame();
