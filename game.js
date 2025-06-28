const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Tamanho dos blocos do labirinto
const blockSize = 20;
const rows = 22;  // linhas no labirinto
const cols = 28;  // colunas no labirinto

// Ajuste o tamanho do canvas para combinar com labirinto
canvas.width = cols * blockSize;  // 560
canvas.height = rows * blockSize; // 440

// Labirinto - 0: caminho vazio, 1: parede azul, 2: ponto para comer
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,1,1,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,2,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,2,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,2,0,0,0,0,0,0],
  [1,1,1,1,1,2,1,1,0,1,1,1,1,0,0,1,1,1,1,0,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,1,0,1,1,1,1,0,1,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,2,1,0,1,1,1,1,0,1,2,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Pac-Man
const pacman = {
    x: 14 * blockSize,
    y: 23 * blockSize,
    size: blockSize,
    dx: 0,
    dy: 0,
    speed: 2,
};

// Função para desenhar o labirinto
function drawMaze() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = maze[r][c];
            if (tile === 1) {
                ctx.fillStyle = "blue";
                ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
            } else if (tile === 2) {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(c * blockSize + blockSize/2, r * blockSize + blockSize/2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Função para desenhar o Pac-Man
function drawPacman() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(pacman.x + pacman.size / 2, pacman.y + pacman.size / 2, pacman.size / 2, 0.25 * Math.PI, 1.75 * Math.PI);
    ctx.lineTo(pacman.x + pacman.size / 2, pacman.y + pacman.size / 2);
    ctx.fill();
}

// Atualizar posição do Pac-Man
function updatePacman() {
    let nextX = pacman.x + pacman.dx * pacman.speed;
    let nextY = pacman.y + pacman.dy * pacman.speed;

    let col = Math.floor((nextX + pacman.size / 2) / blockSize);
    let row = Math.floor((nextY + pacman.size / 2) / blockSize);

    if (maze[row] && maze[row][col] !== 1) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
}

// Controle do teclado
window.addEventListener("keydown", function(e) {
    switch(e.key) {
        case "ArrowUp":
            pacman.dx = 0;
            pacman.dy = -1;
            break;
        case "ArrowDown":
            pacman.dx = 0;
            pacman.dy = 1;
            break;
        case "ArrowLeft":
            pacman.dx = -1;
            pacman.dy = 0;
            break;
        case "ArrowRight":
            pacman.dx = 1;
            pacman.dy = 0;
            break;
    }
});

// Loop principal do jogo
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    updatePacman();
    drawPacman();

    requestAnimationFrame(gameLoop);
}

gameLoop();
