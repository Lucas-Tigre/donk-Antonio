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

// Variáveis para controle do joystick
let serialPort;
let reader;
let isJoystickConnected = false;

function iniciarJogo() {
  fase = 0;
  pontos = 0;
  carregarFase();
  intervaloPacman = setInterval(moverPacman, 150);
  intervaloFantasmas = setInterval(moverFantasmas, 400);
  document.addEventListener("keydown", mudarDirecao);
  
  // Adiciona botão de conexão do joystick
  adicionarBotaoJoystick();
}

function adicionarBotaoJoystick() {
  if (!('serial' in navigator)) return;
  
  const btn = document.createElement('button');
  btn.textContent = 'Conectar Joystick';
  btn.style.position = 'absolute';
  btn.style.top = '10px';
  btn.style.left = '10px';
  btn.style.padding = '5px 10px';
  btn.style.zIndex = '1000';
  document.body.appendChild(btn);
  
  btn.addEventListener('click', async () => {
    if (!isJoystickConnected) {
      await conectarJoystick();
      btn.textContent = 'Desconectar Joystick';
    } else {
      await desconectarJoystick();
      btn.textContent = 'Conectar Joystick';
    }
  });
}

async function conectarJoystick() {
  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 9600 });
    reader = serialPort.readable.getReader();
    isJoystickConnected = true;
    statusEl.textContent = 'Joystick conectado!';
    
    // Loop de leitura dos dados
    while (isJoystickConnected) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const data = new TextDecoder().decode(value).trim();
      processarDadosJoystick(data);
    }
  } catch (error) {
    console.error('Erro:', error);
    statusEl.textContent = 'Erro ao conectar joystick';
    isJoystickConnected = false;
  }
}

function processarDadosJoystick(data) {
  const parts = data.split(',');
  if (parts.length < 4) return;
  
  const dirPart = parts.find(part => part.startsWith('DIR:'));
  if (!dirPart) return;
  
  const direction = dirPart.split(':')[1];
  
  // Mapeia as direções do joystick
  if (direction.includes('U')) direcao = -18;    // Cima
  else if (direction.includes('D')) direcao = 18; // Baixo
  else if (direction.includes('L')) direcao = -1; // Esquerda
  else if (direction.includes('R')) direcao = 1;  // Direita
  
  // Verifica botão pressionado (para reiniciar)
  const btnPart = parts.find(part => part.startsWith('BTN:'));
  if (btnPart && btnPart.split(':')[1] === '1') {
    if (statusEl.textContent.includes("Game Over") || statusEl.textContent.includes("Você venceu")) {
      iniciarJogo();
    }
  }
}

async function desconectarJoystick() {
  if (reader) {
    await reader.cancel();
    await serialPort.close();
  }
  isJoystickConnected = false;
  statusEl.textContent = '';
}

function carregarFase() {
  if (fase >= fases.length) {
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
    scoreEl.textContent = "Pontos: " + (parseInt(scoreEl.textContent.split(" ")[1]) + 1);
    
    // Verifica se coletou todos os pontos
    const dotsLeft = document.querySelectorAll('.dot').length;
    if (dotsLeft === 0) {
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