const playground = document.getElementById('playground-container');
const score = document.getElementById('score-count');
score.textContent = '0';
let widthHeight = 20;
let playgroundSize = widthHeight * widthHeight;
const outerPlaygroundIdNum = [];
const innerPlaygroundIdNum = [];
const snake = [];
let randomCell = null;
let scoreNum = 0;


function getOuterPlaygroundIdNum () {
  for (let i=1; i<=widthHeight; i++) {
    outerPlaygroundIdNum.push(i);
  }
  for (let i=playgroundSize-1; i>=playgroundSize-widthHeight+2; i--) {
    outerPlaygroundIdNum.push(i);
  }
  for (let i= 1+widthHeight; i<=playgroundSize-widthHeight+1; i=i+widthHeight) {
    outerPlaygroundIdNum.push(i);
  }
  for (let i=widthHeight*2; i<=playgroundSize; i=i+widthHeight) {
    outerPlaygroundIdNum.push(i);
  }
}

function setPlayground() {
  for (let i=1; i <= playgroundSize; i++) {
    const division = document.createElement('div');
    if (outerPlaygroundIdNum.includes(i)) {
      division.className = 'outerCell';
    } else {
    innerPlaygroundIdNum.push(i);
    division.className = 'cell'};
    division.id = i.toString();
    playground.append(division);
  }
}

function createSnake() {
  let cell = document.getElementById('211');
  snake.push(cell);
  snake[snake.length-1].classList.add('snake-head-down');
}
// to generate a random target food cell for snake, avoid generated inside snake
function getRandomCell() {
  //TODO when create a variable be careful with the scope it should be, should not expose too much
  const randomCellAreaNum = [];
  const snakeIdNum = [];
  //get the current snake cells in an array with id NUMBER as values
  snake.forEach(function getSnakeIdNumArr(element) {
    snakeIdNum.push(parseInt(element.id));
  })

  //find the array of cells not occupied by snake cells in  innerPlayground: exclude the same cells snake has in the innerPlayground array
  for (let idNum of innerPlaygroundIdNum) {
    if (snakeIdNum.indexOf(idNum) === -1) {
      randomCellAreaNum.push(idNum);
    }
  }

  const numOfRandomCellAreaNum = randomCellAreaNum.length;
  const positionIndex = Math.floor(Math.random()*numOfRandomCellAreaNum);
  const positionIdStr = randomCellAreaNum[positionIndex].toString();
  const randCell = document.getElementById(positionIdStr);
  randCell.classList.add('randomCell');
  //there are 125 svg icons in the food folder random select one as snake's target food
  const randFoodId = Math.floor(Math.random()*125)
  const randFoodUrl = `url(${randFoodId}.svg)`;
  randCell.style.setProperty('--background-url', randFoodUrl);
  randomCell = randCell;
}


//to update score
function scoreCount () {
  scoreNum++;
  score.textContent = scoreNum;
}

export {getRandomCell, createSnake, setPlayground, getOuterPlaygroundIdNum, widthHeight, outerPlaygroundIdNum, snake, randomCell, score, scoreCount};


//helper function to delete after development: create a long snake for testing

// function createLongSnake() {
//   for (let i = widthHeight+2; i<=widthHeight+2; i++) {
//     let cell = document.getElementById(i.toString());
//     snake.push(cell);
//     snake[snake.length-1].classList.add('snake-color');
//   }
//   snake[snake.length-1].classList.add('snake-head-down');
// }
// createLongSnake();