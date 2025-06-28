const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const faseEl = document.getElementById("fase");
const statusEl = document.getElementById("status");

const fases = [
  {
    cor: "blue",
    fantasmas: 1,
    mapa: [
      "##################",
      "#................#",
      "#.####.####.####.#",
      "#................#",
      "#.##.######.##...#",
      "#.#..........#...#",
      "#.#.##..##..#....#",
      "#.#.#....#..#....#",
      "#...............#",
      "####.##.##.######",
      "#...............#",
      "#.#.#.##.#..#...#",
      "#.#.#....#..#...#",
      "#.#.######..#...#",
      "#............#..#",
      "#.####..####.#..#",
      "#...............#",
      "#.##########.#..#",
      "#............#..#",
      "##################"
    ]
  },
  {
    cor: "purple",
    fantasmas: 2,
    mapa: [
      "##################",
      "#....#....#....#.#",
      "#.##.#.##.#.##.#.#",
      "#................#",
      "#.######.######..#",
      "#.#..........#...#",
      "#.#.##..##..#....#",
      "#.#.#....#..#....#",
      "#...............#",
      "#####.##.##.######",
      "#...............#",
      "#.#.#.##.#..#...#",
      "#.#.#....#..#...#",
      "#.#.######..#...#",
      "#............#..#",
      "#.####..####.#..#",
      "#...............#",
      "#.##########.#..#",
      "#............#..#",
      "##################"
    ]
  },
  {
    cor: "red",
    fantasmas: 5,
    mapa: [
      "##################",
      "#....#....#....#.#",
      "#.##.#.##.#.##.#.#",
      "#................#",
      "#.######.######..#",
      "#.#..........#...#",
      "#.#.##..##..#....#",
      "#.#.#....#..#....#",
      "#...............#",
      "#####.##.##.######",
      "#...............#",
      "#.#.#.##.#..#...#",
      "#.#.#....#..#...#",
      "#.#.######..#...#",
      "#............#..#",
      "#.####..####.#..#",
      "#...............#",
      "#.##########.#..#",
      "#............#..#",
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
  intervaloFantasmas = setInterval(moverFantasmas, 400);
  document.addEventListener("keydown", mudarDirecao);
}

function carregarFase() {
  if (fase > 2) {
    statusEl.textContent = "🏆 Você venceu todas as fases!";
    clearInterval(intervaloPacman);
    clearInterval(intervaloFantasmas);
    return;
  }

  const config = fases[fase];
  game.style.setProperty("--wall-color", config.cor);
  mapaAtual = [];
  game.innerHTML = "";
  fantasmas = [];
  direcao = null;
  pacmanPos = 19; // posição inicial no canto

  config.mapa.forEach((linha, rowIndex) => {
    for (let col = 0; col < linha.length; col++) {
      const index = rowIndex * 18 + col;
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (linha[col] === "#") {
        cell.classList.add("wall");
      } else if (linha[col] === ".") {
        cell.classList.add("dot");
        pontos++; // Incrementa a contagem de pontos
      }

      game.appendChild(cell);
      mapaAtual.push(cell);
    }
  });

  mapaAtual[pacmanPos].classList.add("pacman");

  for (let i = 0; i < config.fantasmas; i++) {
    const gPos = 360 - i * 18 - 2;
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

  // Atalho lateral
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
    pontos++; // Incrementa a pontuação ao coletar um ponto
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

    opcoes.sort((a, b) => distancia(a, pacmanPos) - distancia(b, pacmanPos));

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
