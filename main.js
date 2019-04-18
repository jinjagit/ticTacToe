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

  updateMinimaxStatus();
  if (game.getWin() != false) { renderWin(); }
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

function updateMinimaxStatus() {
  if (toggle.checked == true) {
    minimaxStatus.innerHTML = '[ON: computer plays best moves]';
  } else {
    minimaxStatus.innerHTML = '[OFF: computer plays random moves]';
  }
}

// Board module:
const board = (() => {
  let state = ['', '', '', '', '', '', '', '', ''];
  const addPiece = (piece, index) => { state[index] = piece; };
  const reset = () => { state.fill(''); };
  return { addPiece, state, reset };
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
  let wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
              [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let win = false;
  let gameOver = '';
  let thinking = false;
  let minimaxMoves = [];
  const getWin = () => win;
  const getGameOver = () => gameOver;
  const getThinking = () => thinking;
  const playRound = (index) => {
    if (moves < 9 && gameOver == '') {
      board.addPiece(human.piece, index);
      moves++;
      render();
      if (moves > 2) { checkForResult(); }
    }
    if (moves < 9  && gameOver == '') {
      compMove();
      if (moves > 2) { setTimeout(checkForResult, 1000); }
    }
  };
  const compMove = () => {
    message.innerHTML = 'I am thinking...';
    let choice = 0;

    if (toggle.checked == true) { // minimax ON
      choice = (minimax(board.state, computer.piece));
      let best = [minimaxMoves[0].index];
      for (i = 1; i < minimaxMoves.length; i++) {
        if (minimaxMoves[i].score > minimaxMoves[0].score) {
          best = [minimaxMoves[i].index];
        } else if (minimaxMoves[i].score == minimaxMoves[0].score) {
          best.push(minimaxMoves[i].index);
        }
      }
      random = Math.floor((Math.random() * best.length));
      choice = best[random];
      board.addPiece(computer.piece, choice);
    } else { // minimax OFF
      let placed = false;
      let index = Math.floor((Math.random() * 8));

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
    }

    moves++;
    thinking = true;
    setTimeout(render, 1000);
    setTimeout(yourMove, 1000);
    setTimeout(blinkPieceStart, 1000, choice);
    return choice;
  };
  const checkForResult = () => {
    win = checkForWin(board.state);
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
      if (computerFirst == 0) {
        setTimeout(showDraw, 1000);
      } else {
        showDraw();
      }
    }
  };
  const checkForWin = (array) => {
    result = false;
    for (i = 0; i < 8; i++) {
      if ((array[wins[i][0]] != '') &&
        (array[wins[i][0]] == array[wins[i][1]]) &&
        (array[wins[i][1]] == array[wins[i][2]])) {
        result = wins[i];; // NAH! this causes win every round for minimax :(
      }
    }
    return result;
  };
  const emptyIndexies = (array) => {
    let blanks = [];
    for (i = 0; i < 9; i++) {
      if (array[i] == '') { blanks.push(i); }
    }
    return blanks;
  };
  const minimax = (newBoard, player) => {

    //available spots
    var availSpots = emptyIndexies(newBoard);

    // check for the terminal states of win, lose, or tie
    // and return a value accordingly
    if (availSpots.length === 0) {
      return { score: 0 };
    } else if (newBoard[checkForWin(newBoard)[0]] == computer.piece) {
      return { score: 10 };
    } else if (newBoard[checkForWin(newBoard)[0]] == human.piece) {
      return { score: -10 };
    }

    var moves = [];

    // loop through available spots
    for (var i = 0; i < availSpots.length; i++){
      //create an object for each and store the index of that spot that was stored as a number in the object's index key
      var move = {};
    	move.index = availSpots[i];

      // set the empty spot to the current player
      newBoard[availSpots[i]] = player;

      //if collect the score resulted from calling minimax on the opponent of the current player
      if (player == computer.piece){
        var result = minimax(newBoard, human.piece);
        move.score = result.score;
      }
      else {
        var result = minimax(newBoard, computer.piece);
        move.score = result.score;
      }

      //reset the spot to empty
      newBoard[availSpots[i]] = '';

      // push the object to the array
      moves.push(move);
    }

    // if it is the computer's turn loop over the moves and choose the move with the highest score
    var bestMove;
    if(player == computer.piece) {
      var bestScore = -10000;
      for(var i = 0; i < moves.length; i++) {
        if(moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {

    // else loop over the moves and choose the move with the lowest score
      var bestScore = 10000;
      for(var i = 0; i < moves.length; i++) {
        if(moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    minimaxMoves = moves;

    // return the chosen move (object) from the array to the higher depth
    return moves[bestMove];

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
let minimaxStatus = document.getElementById('minimaxStatus');

newGame.addEventListener("click", function() {
  newGame.style.display = 'none';
  board.reset();
  computerFirst == true ? computerFirst = false : computerFirst = true;
  game = gameFactory(computerFirst);
  render();
  game.start();
});

toggle.addEventListener("click", function() {
  updateMinimaxStatus();
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
