function render() {
  if (window.innerWidth > window.innerHeight) {
    side = window.innerHeight * 0.8;
  } else {
    side = window.innerWidth * 0.8;
  }

  if (side > 604) { side = 604; }

  board.style.height = `${side}px`;
  board.style.width = `${side}px`;
  board.style.gap = `${side/70}px`

  let fontSize = side / 5;

  // remove cells from board before (re)creating
  let cells = document.getElementsByClassName('cell');

  for (let i = cells.length - 1; i >= 0; i--) {
    board.removeChild(cells[i]);
  }

  // draw & style; new board cells & content
  for (i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.id = `${i}`;
    cell.classList.add('cell');
    cell.style.lineHeight = `${(side - 4) / 3}px`;
    const data = document.createElement('p');
    data.id = `data${i}`;
    data.classList.add('data');
    data.style.fontSize = `${fontSize}px`;
    data.innerHTML = layout[i];
    cell.appendChild(data);
    board.appendChild(cell);
  }
}

let side = 600;
let board = document.getElementById('board');

let layout = ['O', '', 'X', 'X', 'O', '', 'O', '', 'X'];



render();
