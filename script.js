const pacman = document.getElementById("pacman");
const dot = document.getElementById("dot");
const scoreEl = document.getElementById("score");
let score = 0;

let position = { top: 0, left: 0 };

document.addEventListener("keydown", (e) => {
  const step = 20;
  if (e.key === "ArrowUp" && position.top > 0) position.top -= step;
  if (e.key === "ArrowDown" && position.top < 360) position.top += step;
  if (e.key === "ArrowLeft" && position.left > 0) position.left -= step;
  if (e.key === "ArrowRight" && position.left < 360) position.left += step;

  pacman.style.top = position.top + "px";
  pacman.style.left = position.left + "px";

  checkCollision();
});

function checkCollision() {
  const pacmanRect = pacman.getBoundingClientRect();
  const dotRect = dot.getBoundingClientRect();

  if (
    pacmanRect.left < dotRect.right &&
    pacmanRect.right > dotRect.left &&
    pacmanRect.top < dotRect.bottom &&
    pacmanRect.bottom > dotRect.top
  ) {
    score++;
    scoreEl.textContent = "Pontos: " + score;

    // Mover o ponto para um novo lugar aleatório
    const newLeft = Math.floor(Math.random() * 18) * 20;
    const newTop = Math.floor(Math.random() * 18) * 20;

    dot.style.left = newLeft + "px";
    dot.style.top = newTop + "px";
  }
}

