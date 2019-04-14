function render() {
  if (window.innerWidth > window.innerHeight) {
    side = window.innerHeight * 0.8;
  } else {
    side = window.innerWidth * 0.8;
  }

  if (side > 600) { side = 600; }
  let gap = Math.floor(side / 70);
  let fontSize = side / 5;
  side = Math.floor(side - ((2 * gap) / 3) * 3);

  grid.style.height = `${side}px`;
  grid.style.width = `${side}px`;
  grid.style.gap = `${gap}px`

  // remove cells from board before (re)creating
  let cells = document.getElementsByClassName('cell');

  for (let i = cells.length - 1; i >= 0; i--) {
    grid.removeChild(cells[i]);
  }

  // Create new board cells & content + behaviours
  for (i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.id = `${i}`;
    cell.classList.add('cell');
    cell.style.lineHeight = `${(side - (2 * gap)) / 3}px`;
    cell.addEventListener("mouseover", function() {
      highlight(this.id);
    });
    cell.addEventListener("mouseout", function() {
      cell.style.backgroundColor = 'white';
    });
    cell.addEventListener("click", function() {
      selectCell(this.id);
    });
    const piece = document.createElement('p');
    piece.id = `piece${i}`;
    piece.classList.add('piece');
    piece.style.fontSize = `${fontSize}px`;
    piece.innerHTML = layout[i];
    cell.appendChild(piece);
    grid.appendChild(cell);
  }
}

function highlight(index) {
  let piece = document.getElementById(`piece${index}`);
  if (piece.innerHTML == '') {
    let cell = document.getElementById(`${index}`);
    cell.style.backgroundColor = 'red';
  }
}

function selectCell(index) {
  console.log(`cell index ${index} clicked`);
}

// Board Module:
const board = (() => {
  var state = ['X', '', 'O', '', '', '', '', '', ''];
  const add = (piece, index) => {
    if (state[index] == '') { state[index] = piece; }
  };
  const reset = () => { state.fill(''); };
  return { add, state, reset };
})();

let side = 600;
let grid = document.getElementById('grid');

let layout = board.state;

render();


board.add('X', 1);
board.add('O', 4);
board.add('X', 2);
board.add('O', 7);

render();
