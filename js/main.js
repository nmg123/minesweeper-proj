"use strict";

const MINE = "🧨";
const EMPTY = " ";
const WIN = "🏆";
const LOSE = "😵‍💫";
const FLAG = "🚩";
const LIFE = "❤️";
const NORMAL = "😺";

let gBoard;
let gGame;

const gLevel = {
  SIZE: 4,
  MINES: 2,
};
let gTimeInterval;
const minutesLabel = document.querySelector(".minutes");
const secondsLabel = document.querySelector(".seconds");
let totalSeconds = 0;

function init() {
  gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    livesCount: 3,
  };
  gBoard = buildBoard();
  addRandomMines();
  resetBtn(NORMAL);
  renderBoard(gBoard);
  setMinesNegsCount(gBoard);

  resetTimer();

  renderLifes();
}

function renderLifes() {
  const elLifes = document.querySelector("#lifes");
  elLifes.innerText = "";
  for (let i = 0; i < gGame.livesCount; i++) {
    elLifes.innerText += LIFE;
  }
}

function setLevel(num1, num2) {
  gLevel.SIZE = num1;
  gLevel.MINES = num2;

  init();
}

function buildBoard() {
  const board = [];
  for (let i = 0; i < gLevel.SIZE; i++) {
    board.push([]);
    for (let j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  return board;
}

function renderBoard(board) {
  let strHTML = '<table border="0"><tbody>';
  for (let i = 0; i < board.length; i++) {
    strHTML += "<tr>";
    for (let j = 0; j < board[0].length; j++) {
      const className = "cell cell-" + i + "-" + j;
      strHTML += `<td onclick="cellClicked(${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"class="${className}">${EMPTY}</td>`;
    }
    strHTML += "</tr>";
  }
  strHTML += "</tbody></table>";
  document.querySelector(".board-container").innerHTML = strHTML;
}

function setMinesNegsCount(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      const cell = board[i][j];
      cell.minesAroundCount = countNeighbors(i, j, board);
    }
  }
}

function countNeighbors(cellI, cellJ, mat) {
  let neighborsCount = 0;
  for (let i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (let j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;

      const cell = mat[i][j];
      if (cell.isMine) neighborsCount++;
    }
  }
  return neighborsCount;
}

function cellClicked(i, j) {
  if (!gGame.isOn) return;
  if (!gGame.shownCount && !gGame.markedCount) startTimer();
  // update Model
  const cell = gBoard[i][j];
  if (cell.isMarked) return;
  if (!cell.isShown) {
    let value;
    if (cell.isMine) {
      cell.isShown = true;
      value = MINE;
      gGame.livesCount--;
      renderLifes();
    } else {
      //to not count mines
      cell.isShown = true;
      gGame.shownCount++;
    }

    // update DOM

    if (!cell.isMine && cell.minesAroundCount > 0)
      value = cell.minesAroundCount;
    else if (!cell.isMine && cell.minesAroundCount === 0) {
      value = EMPTY;
      expandShown(gBoard, i, j);
    }
    renderCell({ i, j }, value);
    checkGameOver();
  }
}

function renderCell(location, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  if (gBoard[location.i][location.j].isShown) elCell.classList.add("isShown");

  elCell.innerHTML = value;
}

function addRandomMines() {
  const emptyCells = checkEmptyCells();
  for (var i = 0; i < gLevel.MINES; i++) {
    const randomCell = getRandomCell(emptyCells);
    //update Model
    gBoard[randomCell.i][randomCell.j].isMine = true;
  }
}

function cellMarked(elCell, i, j) {
  removeContextMenu();
  if (!gGame.isOn) return;
  if (!gGame.shownCount && !gGame.markedCount) startTimer();

  const cell = gBoard[i][j];

  if (cell.isShown) return;
  cell.isMarked = !cell.isMarked;
  // cell.isShown = false

  // update DOM

  if (cell.isMarked) {
    var value = FLAG;
    gGame.markedCount++;
  }
  if (!cell.isMarked) {
    var value = EMPTY;
    gGame.markedCount--;
  }

  elCell.classList.toggle("isMarked");
  renderCell({ i, j }, value);
  checkGameOver();
}

function removeContextMenu() {
  const noContext = document.getElementById("noContextMenu");
  noContext.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

function checkGameOver() {
  if (!gGame.livesCount) {
    showAllMines(gBoard);
    resetBtn(LOSE);
    gameOver();
    return;
  }

  const victory = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
  if (victory === gGame.shownCount && gGame.markedCount === gLevel.MINES) {
    resetBtn(WIN);
    gameOver();
  }
}

function showAllMines(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      let value;
      const cell = board[i][j];
      if (cell.isMine) cell.isShown = true;
      if (cell.isShown) {
        if (cell.isMine) value = MINE;
        else if (!cell.isMine && cell.minesAroundCount > 0)
          value = cell.minesAroundCount;
        else if (!cell.isMine && cell.minesAroundCount === 0) value = EMPTY;
        renderCell({ i, j }, value);
      }
    }
  }
}

function expandShown(board, cellI, cellJ) {
  for (let i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (let j = cellJ - 1; j <= cellJ + 1; j++) {
      let value;
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= board[i].length) continue;
      const neighbor = board[i][j];
      if (!neighbor.isShown && !neighbor.isMarked) {
        neighbor.isShown = true;
        gGame.shownCount++;
        if (!neighbor.isMine && neighbor.minesAroundCount > 0)
          value = neighbor.minesAroundCount;
        if (!neighbor.isMine && neighbor.minesAroundCount === 0) value = EMPTY;
        renderCell({ i, j }, value);
      }
    }
  }
}

function gameOver() {
  gGame.isOn = false;
  clearInterval(gTimeInterval);
}

function startTimer() {
  gTimeInterval = setInterval(setTime, 1000);
}

function resetTimer() {
  clearInterval(gTimeInterval);
  totalSeconds = 0;
  setTime();
}

function resetBtn(value) {
  document.querySelector(".reset").innerText = value;
}

function checkEmptyCells() {
  const emptyCells = [];
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      const cell = gBoard[i][j];
      if (!cell.MINE && cell.minesAroundCount === 0) {
        emptyCells.push({ i, j });
      }
    }
  }
  return emptyCells;
}

function getRandomCell(cells) {
  const idx = getRandomInt(0, cells.length);
  const cell = cells[idx];
  cells.splice(idx, 1);
  return cell;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function setTime() {
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
  ++totalSeconds;
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}
