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

  // remove cells from board before (re)creating
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
    cell.addEventListener("mouseover", function() {
      highlight(this.id);
    });
    cell.addEventListener("mouseout", function() {
      cell.style.backgroundColor = purpleDark;
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
}

function highlight(index) {
  if (board.state[index] == '' && thinking == false && game.gameOver == '') {
    let cell = document.getElementById(`${index}`);
    cell.style.backgroundColor = purpleMedium;
  }
}

function placePiece(index) {
  if (board.state[index] == '' && thinking == false) {
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

// Board Module:
const board = (() => {
  let state = ['', '', '', '', '', '', '', '', ''];
  const addPiece = (piece, index) => { state[index] = piece; };
  const reset = () => { state.fill(''); };
  return { addPiece, state, reset };
})();

// Player Factory:
const player = (piece) => {
  let score = 0;
  const getScore = () => score;
  const addWin = () => score++;
  const reset = () => score = 0; // probably not needed (simply create new player)
  return { piece, getScore, addWin, reset };
};

// Game Factory:
const gameFactory = (first) => {
  let moves = 0;
  let wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
              [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let gameOver = '';
  let human = player('X');
  let computer = player('O');
  const playRound = (index) => {
    if (moves < 9 && gameOver == '') {
      board.addPiece(human.piece, index);
      moves++;
      render();
      if (moves > 2) { checkForWin(); }
    }
    if (moves < 9  && gameOver == '') {
      index = compMove();
      if (moves > 2) { setTimeout(checkForWin, 1000); }
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
  const checkForWin = () => {
    for (i = 0; i < 8; i++) {
      if ((board.state[wins[i][0]] != '') &&
        (board.state[wins[i][0]] == board.state[wins[i][1]]) &&
        (board.state[wins[i][1]] == board.state[wins[i][2]])) {
        if (board.state[wins[i][0]] == human.piece) {
          gameOver = 'Human WINS!';
        } else {
          gameOver = 'Computer WINS!';
        }
        message.innerHTML = gameOver;
      } else if (moves > 8) {
        message.innerHTML = '';
        gameOver = "It's a DRAW!";
        if (first == 0) {
          setTimeout(showDraw, 1000);
        } else {
          showDraw();
        }
      }
    }
  };
  const start = () => {
    if (first == 0) {
      compMove();
    } else {
      yourMove();
    }
  };
  const yourMove = () => {
    if (gameOver == '') {message.innerHTML = 'Your move, humanoid';}
    thinking = false;
  };
  const showDraw = () => {
    message.innerHTML = gameOver;
  };
  return { start, playRound, moves };
};

let grid = document.getElementById('grid');
let message = document.getElementById('message');

let purpleDark = "#340059";
let purpleMedium = "#4a0f75";
let blinkStart = new Date();
let blink = true;
let thinking = false;

render();
game = gameFactory(0);
game.start();
