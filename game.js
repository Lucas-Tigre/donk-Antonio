const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const faseEl = document.getElementById("fase");
const statusEl = document.getElementById("status");

const fases = [
  {
    cor: "blue",
    fantasmas: 1,
    mapa: [ // Mapa 1 - mais aberto
      "##################",
      "#........##........#",
      "#.####.#.##.####.#",
      "#...............#",
      "#.##.######.##.#",
      "#.#..........#.#",
      "#.#.##..##.#.#",
      "#.#.#....#.#.#",
      "#..............#",
      "####.##.##.####",
      "#..............#",
      "#.#.#.##.#.#.#",
      "#.#.#....#.#.#",
      "#.#.######.#.#",
      "#............#",
      "#.####..####.#",
      "#..............#",
      "#.##########.#",
      "#............#",
      "##################"
    ]
  },
  {
    cor: "purple",
    fantasmas: 2,
    mapa: [ // Mapa 2 - mais fechado
      "##################",
      "#........#........#",
      "#.######.#.######.#",
      "#..................#",
      "#.####.####.####.#",
      "#.#..........#.#",
      "#.#.##..##.#.#",
      "#.#.#....#.#.#",
      "#...#....#...#",
      "#####.##.#####",
      "#...#....#...#",
      "#.#.#.##.#.#.#",
      "#.#.#....#.#.#",
      "#.#.######.#.#",
      "#............#",
      "#.####..####.#",
      "#..............#",
      "#.##########.#",
      "#............#",
      "##################"
    ]
  },
  {
    cor: "red",
    fantasmas: 5,
    mapa: [ // Mapa 3 - mais labiríntico
      "##################",
      "#....#....#....#.#",
      "#.##.#.##.#.##.#.#",
      "#................#",
      "#.######.######.#",
      "#.#..........#.#",
      "#.#.##..##.#.#",
      "#.#.#....#.#.#",
      "#..............#",
      "####.##.##.####",
      "#..............#",
      "#.#.#.##.#.#.#",
      "#.#.#....#.#.#",
      "#.#.######.#.#",
      "#............#",
      "#.####..####.#",
      "#..............#",
      "#.##########.#",
      "#............#",
      "##################"
    ]
  }
];

let mapaAtual = [];
let pacmanPos = 0;
let fantasmas = [];
let direcao = null;
let pontos = 0;
let fase = 0;
let intervaloPacman;
let intervaloFantasmas;

function iniciarJogo() {
  fase = 0;
  pontos = 0;
  carregarFase();
  intervaloPacman = setInterval(moverPacman, 150);
  intervaloFantasmas = setInterval(moverFantasmas, 500);
  document.addEventListener("keydown", mudarDirecao);
}

function carregarFase() {
  if (fase > 2) {
    statusEl.textContent = "🏆 Você venceu todas as fases!";
    clearInterval(intervaloPacman);
    clearInterval(intervaloFantasmas);
    return;
  }

  game.style.setProperty("--wall-color", fases[fase].cor);
  mapaAtual = [];
  game.innerHTML = "";
  fantasmas = [];
  direcao = null;
  pacmanPos = 1;

  const mapaTexto = fases[fase].mapa.join("").split("");
  mapaTexto.forEach((c, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    if (c === "#") cell.classList.add("wall");
    else if (c === ".") {
      cell.classList.add("dot");
      pontos++;
    }

    game.appendChild(cell);
    mapaAtual.push(cell);
  });

  mapaAtual[pacmanPos].classList.add("pacman");

  for (let i = 0; i < fases[fase].fantasmas; i++) {
    const gPos = 340 + i;
    mapaAtual[gPos].classList.add("ghost");
    fantasmas.push(gPos);
  }

  faseEl.textContent = "Fase: " + (fase + 1);
  scoreEl.textContent = "Pontos: 0";
}

function mudarDirecao(e) {
  if (e.key === "ArrowUp") direcao = -18;
  if (e.key === "ArrowDown") direcao = 18;
  if (e.key === "ArrowLeft") direcao = -1;
  if (e.key === "ArrowRight") direcao = 1;
}

function moverPacman() {
  if (!direcao) return;
  let destino = pacmanPos + direcao;

  // Teletransporte lateral
  if (pacmanPos % 18 === 0 && direcao === -1) destino = pacmanPos + 17;
  if (pacmanPos % 18 === 17 && direcao === 1) destino = pacmanPos - 17;

  if (
    destino < 0 || destino >= mapaAtual.length ||
    mapaAtual[destino].classList.contains("wall")
  ) return;

  mapaAtual[pacmanPos].classList.remove("pacman");
  pacmanPos = destino;

  if (mapaAtual[pacmanPos].classList.contains("dot")) {
    mapaAtual[pacmanPos].classList.remove("dot");
    pontos--;
    scoreEl.textContent = "Pontos: " + (parseInt(scoreEl.textContent.split(" ")[1]) + 1);
    if (pontos === 0) {
      fase++;
      setTimeout(carregarFase, 1000);
    }
  }

  mapaAtual[pacmanPos].classList.add("pacman");
  verificarColisao();
}

function moverFantasmas() {
  for (let i = 0; i < fantasmas.length; i++) {
    const pos = fantasmas[i];
    mapaAtual[pos].classList.remove("ghost");

    const opcoes = [pos - 1, pos + 1, pos - 18, pos + 18].filter(o =>
      o >= 0 &&
      o < mapaAtual.length &&
      !mapaAtual[o].classList.contains("wall") &&
      !fantasmas.includes(o)
    );

    opcoes.sort((a, b) => {
      const da = distancia(a, pacmanPos);
      const db = distancia(b, pacmanPos);
      return da - db;
    });

    fantasmas[i] = opcoes[0] || pos;
    mapaAtual[fantasmas[i]].classList.add("ghost");
  }

  verificarColisao();
}

function distancia(a, b) {
  const ax = a % 18;
  const ay = Math.floor(a / 18);
  const bx = b % 18;
  const by = Math.floor(b / 18);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function verificarColisao() {
  if (fantasmas.includes(pacmanPos)) {
    statusEl.textContent = "💀 Game Over!";
    clearInterval(intervaloPacman);
    clearInterval(intervaloFantasmas);
    document.removeEventListener("keydown", mudarDirecao);
  }
}

iniciarJogo();
