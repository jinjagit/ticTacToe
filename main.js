function render() {
  if (window.innerWidth > window.innerHeight) {
    var side = window.innerHeight * 0.8;
  } else {
    var side = window.innerWidth * 0.8;
  }

  if (side > 600) { side = 600; }
  let gap = Math.floor(side / 65);
  let fontSize = side / 4;
  side = Math.floor(side - (2 * gap));

  grid.style.height = `${side}px`;
  grid.style.width = `${side}px`;
  grid.style.gap = `${gap}px`

  // remove cells from grid before (re)creating
  let cells = document.getElementsByClassName('cell');

  for (let i = cells.length - 1; i >= 0; i--) {
    grid.removeChild(cells[i]);
  }

  // Create new grid cells, content & behaviours
  for (i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.id = `${i}`;
    cell.classList.add('cell');
    cell.style.lineHeight = `${(side - (2 * gap)) / 3}px`;
    cell.style.backgroundColor = purpleDark;
    cell.addEventListener("mouseover", function() {
      highlight(this.id);
    });
    cell.addEventListener("mouseout", function() {
      if (game.getGameOver() == '') { cell.style.backgroundColor = purpleDark; }
    });
    cell.addEventListener("click", function() {
      placePiece(this.id);
    });
    const piece = document.createElement('p');
    piece.id = `piece${i}`;
    piece.classList.add('piece');
    piece.style.fontSize = `${fontSize}px`;
    piece.innerHTML = board.state[i];
    cell.appendChild(piece);
    grid.appendChild(cell);
  }

  if (game.getWin() != false) { renderWin(); }
  console.log(toggle.checked);
}

function scoreUpdate() {
  scoreX.innerHTML = `${human.getScore()}`;
  scoreO.innerHTML = `${computer.getScore()}`;
}

function highlight(index) {
  if (board.state[index] == '' && game.getThinking() == false && game.getGameOver() == '') {
    let cell = document.getElementById(`${index}`);
    cell.style.backgroundColor = purpleMedium;
  }
}

function placePiece(index) {
  if (board.state[index] == '' && game.getThinking() == false) {
    clearInterval(blink);
    game.playRound(index);
  }
}
function blinkPieceStart(index){
  blinkStart = new Date().getTime();
  blink = setInterval(blinkPiece, 125, index);
}

function blinkPiece(index) {
  let piece = document.getElementById(`piece${index}`);

    if (piece.innerHTML == "") {
      piece.innerHTML = board.state[index];
    } else {
      piece.innerHTML = "";
    }

  if (blinkStart + 750 < new Date().getTime()) {
    clearInterval(blink);
    piece.innerHTML = board.state[index];
  }
}

function showWinStart() {
  winStart = new Date().getTime();
  animWin = setInterval(showWin, 200);
}

function showWin() {
  for (i = 0; i < 3; i++) {
    let cell = document.getElementById(`${game.getWin()[i]}`);
    if (cell.style.backgroundColor == purpleDark) {
      cell.style.backgroundColor = purpleMedium;
    } else {
      cell.style.backgroundColor = purpleDark;
    }
  }

  if (winStart + 1600 < new Date().getTime()) {
    clearInterval(animWin);
    for (i = 0; i < 3; i++) {
      let cell = document.getElementById(`${game.getWin()[i]}`);
      cell.style.backgroundColor = purpleMedium;
    }
  }
}

function renderWin() {
  for (i = 0; i < 3; i++) {
    let cell = document.getElementById(`${game.getWin()[i]}`);
    cell.style.backgroundColor = purpleMedium;
  }
}

// Board module:
const board = (() => {
  let state = ['', '', '', '', '', '', '', '', ''];
  let wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
              [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const addPiece = (piece, index) => { state[index] = piece; };
  const reset = () => { state.fill(''); };
  const checkForWin = () => {
    let win = false;
    for (i = 0; i < 8; i++) {
      if ((board.state[wins[i][0]] != '') &&
        (board.state[wins[i][0]] == board.state[wins[i][1]]) &&
        (board.state[wins[i][1]] == board.state[wins[i][2]])) {
        win = wins[i];
      }
    }
    return win;
  };
  const countBlanks = () => {
    let count = state.reduce(function(n, val) {
    return n + (val === '');
    }, 0);
    return count;
  };
  return { addPiece, state, reset, checkForWin, countBlanks };
})();

// Player factory function:
const player = (piece) => {
  let score = 0;
  const getScore = () => score;
  const addWin = () => score++;
  return { piece, getScore, addWin };
};

// Game factory function:
const gameFactory = (computerFirst) => {
  let moves = 0;
  let win = false;
  let gameOver = '';
  let thinking = false;
  const getWin= () => win;
  const getGameOver= () => gameOver;
  const getThinking= () => thinking;
  const playRound = (index) => {
    if (moves < 9 && gameOver == '') {
      board.addPiece(human.piece, index);
      moves++;
      render();
      if (moves > 2) { checkForResult(); }
    }
    if (moves < 9  && gameOver == '') {
      index = compMove();
      if (moves > 2) { setTimeout(checkForResult, 1000); }
    }
  };
  const compMove = () => {
    message.innerHTML = 'I am thinking...';
    let placed = false;
    let index = Math.floor((Math.random() * 8));
    let choice = 0;
    while (placed == false) {
      if (board.state[index] == '') {
        if (Math.random() >= 0.5) {
          board.addPiece(computer.piece, index);
          placed = true;
        }
      }
      choice = index;
      index++;
      if (index > 8) { index = 0; }
    }
    moves++;
    thinking = true;
    setTimeout(render, 1000);
    setTimeout(yourMove, 1000);
    setTimeout(blinkPieceStart, 1000, choice);
    return choice;
  };
  const checkForResult = () => {
    win = board.checkForWin();
    if (win != false) {
      if (board.state[win[0]] == human.piece) {
        gameOver = 'Humanoid WINS!';
        human.addWin();
      } else {
        gameOver = 'Computer WINS!';
        computer.addWin();
      }
      showWinStart();
      message.innerHTML = gameOver;
      newGame.style.display = 'inline-block';
      scoreUpdate();
    } else if (moves > 8 && gameOver == '') {
      message.innerHTML = '';
      gameOver = "It's a DRAW!";
      if (first == 0) {
        setTimeout(showDraw, 1000);
      } else {
        showDraw();
      }
    }
  };
  const start = () => {
    if (computerFirst == true) {
      compMove();
    } else {
      yourMove();
    }
  };
  const yourMove = () => {
    if (gameOver == '') { message.innerHTML = 'Your move, humanoid'; }
    thinking = false;
  };
  const showDraw = () => {
    message.innerHTML = gameOver;
    newGame.style.display = 'inline-block';
    scoreUpdate();
  };
  return { start, playRound, getGameOver, getThinking, getWin };
};

// ---------------------------------------------------------------------

let grid = document.getElementById('grid');
let message = document.getElementById('message');
let newGame = document.getElementById('newGame');
let scoreX = document.getElementById('scoreX');
let scoreO = document.getElementById('scoreO');
let toggle = document.getElementById('toggle');

newGame.addEventListener("click", function() {
  newGame.style.display = 'none';
  board.reset();
  computerFirst == true ? computerFirst = false : computerFirst = true;
  game = gameFactory(computerFirst);
  render();
  game.start();
});

let computerFirst = true;
let blinkStart = new Date();
let blink = true;
let winStart = new Date();
let animWin = true;
let purpleDark = "rgb(52, 0, 89)";
let purpleMedium = "rgb(102, 29, 155)";

human = player('X');
computer = player('O');
game = gameFactory(computerFirst);
render();
game.start();
