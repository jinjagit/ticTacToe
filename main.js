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
  if (board.state[index] == '') {
    let cell = document.getElementById(`${index}`);
    cell.style.backgroundColor = purpleMedium;
  }
}

function placePiece(index) {
  if (board.state[index] == '') {
    game.playRound(index);
  }
}

function pause(seconds) {
  let now = new Date();
  let end = new Date().setSeconds(now.getSeconds() + seconds);
  while (now < end) {
    now = new Date(); // update the current time
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
  let human = player('X');
  let computer = player('O');
  const playRound = (index) => {
    if (moves < 9) {
      board.addPiece(human.piece, index);
      moves++;
      render();
    }
    if (moves < 9) {
      message.innerHTML = 'I am thinking...';
      compMove();
      moves++;
      setTimeout(render, 1000);
      setTimeout(yourMove, 1000);
    }
  };
  const compMove = () => {
    let placed = false;
    let index = Math.floor((Math.random() * 8));
    while (placed == false) {
      if (board.state[index] == '') {
        if (Math.random() >= 0.5) {
          board.addPiece(computer.piece, index);
          placed = true;
        }
      }
      index++;
      if (index > 8) { index = 0; }
    }
  };
  const start = () => {
    if (first == 0) {
      compMove();
      moves++;
    }
    yourMove();
  };
  const yourMove = () => {
    message.innerHTML = 'Your move, humanoid';
  };
  return { start, playRound };
};

let grid = document.getElementById('grid');
let message = document.getElementById('message');

let purpleDark = "#340059";
let purpleMedium = "#4a0f75";

game = gameFactory(1);
game.start();

render();
