//load playground
const playground = document.getElementById('playground-container');
let widthHeight = 20;
let playgroundSize = widthHeight * widthHeight;
const outerPlaygroundIdNum = [];
const innerPlaygroundIdNum = [];

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
getOuterPlaygroundIdNum();

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
setPlayground();

//main 
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const slowbtn = document.getElementById('slow');
const mediumbtn = document.getElementById('medium');
const fastbtn = document.getElementById('fast');
const score = document.getElementById('score-count');
score.textContent = 0;
let scoreNum = 0;
mediumbtn.checked = true;

//helper function to delete after development: create a long snake for testing
const snake = [];
function createLongSnake() {
  for (let i = widthHeight+2; i<=widthHeight+10; i++) {
    let cell = document.getElementById(i.toString());
    snake.push(cell);
    snake[snake.length-1].classList.add('snake-color');
  }
}
createLongSnake();

// global variables
// uncomment: let currentHeadCell = document.getElementById('1');
// Uncomment: const snake = [currentHeadCell];
let targetCell = document.getElementById('1');
// Uncomment: snake[snake.length-1].classList.add('snake-color');
let randomCell = document.getElementById('100')

//why interval has to be global
let interval = null;
let moveSpeed = 600;
let rightMoveStep = 1;
let leftMoveStep = -1;
let upMoveStep = -widthHeight;
let downMoveStep = widthHeight;

let startMove = null;

//setup direction status
const direction = {
  up: false,
  right: false,
  down: false,
  left: false
};

const pauseResume = {
  pause: false
}

function scoreCount () {
  scoreNum++;
  score.textContent = scoreNum;
}

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
  //there are 125 svg icons in the food folder
  const randFoodId = Math.floor(Math.random()*125)
  const randFoodUrl = `url(food/${randFoodId}.svg)`;
  randCell.style.setProperty('--background-url', randFoodUrl);
  randomCell = randCell;
}

getRandomCell();

// refactor to one function
//TODO closure moveTrigger function with its outer scope environment is a 'closure' 
function moveDirection (num) {
  function moveTrigger() {  
    //get tail Id
    const tailId = snake[0];
    //get the Id number of next target cell move 
    const currentHeadCellStr = snake[snake.length-1].id;
    const currentHeadIdNum = parseInt(currentHeadCellStr);
    //get the targetCell id in number
    const targetCellIdNum = (currentHeadIdNum + num);
    //to convert targetCell id number to string
    const targetCellIdStr = targetCellIdNum.toString();
    targetCell = document.getElementById(targetCellIdStr);
   
    //check if hit wall, the wall is the outer cells around the inner-playground
    if (outerPlaygroundIdNum.includes(targetCellIdNum)) {
      clearInterval(interval);
      alert('game over');
    } 
    else {  
      snake[0].classList.remove('snake-color');
      snake.shift();
      snake.push(targetCell);
      //get the array where snake will hit itself, index 0 is tail, end index (snake.length-1) in .slice() means it will slice until but not include the last value in snake array (last value is snake head, which is also the targetCell variable, as the snake already .push() the targetCell) 
      const snakeHitSelfArray = snake.slice(0, snake.length-1);
      //if this 'no-head' array contains any value that is equal to the targetCell which is now the snake's head (snake.length-1), it means snake's head is in its body.
      if(snakeHitSelfArray.indexOf(snake[snake.length-1]) !==-1) {
        clearInterval(interval);
        alert('game over');
      };

      //change the cell behind snake'head' to snake-color, and change the new head to the snake head svg corresponding the current snake moving direction
      snake[snake.length-2].className = 'snake-color';
      if (direction.right) {
        snake[snake.length-1].classList.add('snake-head-right');
      }
      if (direction.left) {
        snake[snake.length-1].classList.add('snake-head-left');
      }
      if (direction.up) {
        snake[snake.length-1].classList.add('snake-head-up');
      }
      if (direction.down) {
        snake[snake.length-1].classList.add('snake-head-down');
      }

      //check if snake eats a 'randomcell'
      if (snake[snake.length-1] === randomCell) {
        randomCell.classList.remove('randomCell');
        snake.unshift(tailId);
        snake[0].classList.add('snake-color');
        scoreCount();
        getRandomCell();     
      };
    };
  };
  return moveTrigger;
};

//arrow keyup event function
function autoMove (event) {
  //TODO event loop of web api setInterval
  if ((event.key === 'ArrowRight') && (!direction.left)) {
    clearInterval(interval);
    interval = setInterval(startMove, moveSpeed);
  }
  if ((event.key === 'ArrowLeft') && (!direction.right)) {
    clearInterval(interval);
    interval = setInterval(startMove, moveSpeed);
  }
  if ((event.key === 'ArrowUp') && (!direction.down)) {
    clearInterval(interval);
    interval = setInterval(startMove, moveSpeed);
  }
  if ((event.key === 'ArrowDown') && (!direction.up)) {
    clearInterval(interval);
    interval = setInterval(startMove, moveSpeed);
  }
}

//arrow keydown event function
function PressDownMove(event) {
  if (event.key === 'ArrowDown') {
    if (direction.up === false) {
      direction.down = true;
      clearInterval(interval);   
      if (direction.up === false) {
        direction.up = false;
        direction.right = false;
        direction.left =false;
        startMove = moveDirection(downMoveStep);
        startMove();
      }
    }
  }
  if (event.key === 'ArrowUp') {
    if (direction.down === false) {
      direction.up = true;
      clearInterval(interval);  
      if (direction.down === false) {
        direction.down = false;
        direction.right = false;
        direction.left =false;
        startMove = moveDirection(upMoveStep);
        startMove();
      }
    }
  }
  if (event.key === 'ArrowRight') {
    if(direction.left === false) {
      direction.right = true;
      clearInterval(interval);
      if (direction.left === false) {
        direction.down = false;
        direction.up = false;
        direction.left =false;
        startMove = moveDirection(rightMoveStep);
        startMove();
      }
    }
  }
  if (event.key === 'ArrowLeft') {
    if(direction.right === false) {
      direction.left =true;
      clearInterval(interval);
      if (direction.right === false) {
        direction.down = false;
        direction.up = false;
        direction.right = false;
        startMove = moveDirection(leftMoveStep);
        startMove();
      }
    }
  }
}

function reload() {
  window.location.reload();
}

function pauseGame() {
  clearInterval(interval);
  pauseResume.pause = true;
}

function resumeGame() {
  // if to prevent click several times resume button adding more startMove intervals
  if (pauseResume.pause) {
    interval = setInterval(startMove, moveSpeed);
    pauseResume.pause = false;
  }
}

function changeSpeed() {
  if (slowbtn.checked) {
    moveSpeed = 1000;
  }
  if (mediumbtn.checked) {
    moveSpeed = 400;
  }
  if (fastbtn.checked) {
    moveSpeed = 100;
  }
}

window.addEventListener('keydown', PressDownMove);
window.addEventListener('keyup', autoMove);
restartBtn.addEventListener('click', reload);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
slowbtn.addEventListener('change',changeSpeed);
mediumbtn.addEventListener('change', changeSpeed);
fastbtn.addEventListener('change', changeSpeed);





