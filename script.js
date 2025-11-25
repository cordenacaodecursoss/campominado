const SIZE = 10;          // 10x10
const NUM_SHIPS = 5;      // quantidade de navios
const LIVES = 10;         // quantos erros o jogador pode cometer

let board = [];
let ships = [];
let hits = 0;
let lives = LIVES;

const boardDiv = document.getElementById("board");
const shipsLeftSpan = document.getElementById("shipsLeft");
const livesLeftSpan = document.getElementById("livesLeft");
const restartBtn = document.getElementById("restartBtn");

function initGame() {
  board = [];
  ships = [];
  hits = 0;
  lives = LIVES;
  boardDiv.innerHTML = "";

  // Cria matriz vazia
  for (let r = 0; r < SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < SIZE; c++) {
      board[r][c] = {
        hasShip: false,
        revealed: false
      };
    }
  }

  placeShips();
  renderBoard();
  updateInfo();
}

function placeShips() {
  // Navios de vários tamanhos (tipo batalha naval simples)
  const shipSizes = [2, 3, 3, 4, 5]; // 5 navios
  for (let size of shipSizes) {
    placeSingleShip(size);
  }
}

function placeSingleShip(size) {
  let placed = false;

  while (!placed) {
    const horizontal = Math.random() < 0.5;
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    let cells = [];

    if (horizontal) {
      if (col + size > SIZE) continue;
      for (let c = col; c < col + size; c++) {
        cells.push({ r: row, c });
      }
    } else {
      if (row + size > SIZE) continue;
      for (let r = row; r < row + size; r++) {
        cells.push({ r, c: col });
      }
    }

    // Verifica se já tem navio em alguma dessas células
    if (cells.some(cell => board[cell.r][cell.c].hasShip)) {
      continue;
    }

    // Marca as células com navio
    cells.forEach(cell => {
      board[cell.r][cell.c].hasShip = true;
    });

    ships.push({ size, cells, hits: 0 });
    placed = true;
  }
}

function renderBoard() {
  boardDiv.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.dataset.row = r;
      cellDiv.dataset.col = c;
      cellDiv.addEventListener("click", onCellClick);
      boardDiv.appendChild(cellDiv);
    }
  }
}

function onCellClick(e) {
  const cellDiv = e.currentTarget;
  const r = Number(cellDiv.dataset.row);
  const c = Number(cellDiv.dataset.col);
  const cell = board[r][c];

  if (cell.revealed || lives <= 0) return;

  cell.revealed = true;
  cellDiv.classList.add("revealed");

  if (cell.hasShip) {
    cellDiv.classList.add("hit");
    cellDiv.textContent = "X";
    hits++;
    updateShipHits(r, c);
  } else {
    cellDiv.classList.add("miss");
    cellDiv.textContent = "•";
    lives--;
  }

  updateInfo();
  checkEndGame();
}

function updateShipHits(r, c) {
  for (let ship of ships) {
    const part = ship.cells.find(p => p.r === r && p.c === c);
    if (part) {
      ship.hits++;
      // Se o navio afundou, revela todas as partes
      if (ship.hits === ship.size) {
        for (let p of ship.cells) {
          const idx = p.r * SIZE + p.c;
          const cellDiv = boardDiv.children[idx];
          cellDiv.classList.add("hit");
          cellDiv.textContent = "X";
        }
      }
      break;
    }
  }
}

function updateInfo() {
  const totalShipCells = ships.reduce((sum, s) => sum + s.size, 0);
  const remaining = totalShipCells - hits;
  shipsLeftSpan.textContent = "Partes de navios restantes: " + remaining;
  livesLeftSpan.textContent = "Vidas (erros) restantes: " + lives;
}

function checkEndGame() {
  const totalShipCells = ships.reduce((sum, s) => sum + s.size, 0);

  if (hits === totalShipCells) {
    alert("Parabéns! Você encontrou todos os navios!");
    revealAll();
  } else if (lives <= 0) {
    alert("Fim de jogo! Você ficou sem vidas.");
    revealAll();
  }
}

function revealAll() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const idx = r * SIZE + c;
      const cellDiv = boardDiv.children[idx];
      const cell = board[r][c];

      if (!cell.revealed) {
        cell.revealed = true;
        cellDiv.classList.add("revealed");
        if (cell.hasShip) {
          cellDiv.classList.add("hit");
          cellDiv.textContent = "X";
        } else {
          cellDiv.classList.add("miss");
          cellDiv.textContent = "•";
        }
      }
    }
  }
}

restartBtn.addEventListener("click", initGame);

initGame();
