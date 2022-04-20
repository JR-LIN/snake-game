import {getRandomCell, createSnake, setPlayground, getOuterPlaygroundIdNum, widthHeight, outerPlaygroundIdNum, snake, randomCell, scoreCount, score} from './setUp.js';
import{updateRecord, minScore} from './rankApi.js';

//load playground

getOuterPlaygroundIdNum();
setPlayground();
createSnake();
getRandomCell();
//main global variables
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const slowbtn = document.getElementById('slow');
const mediumbtn = document.getElementById('medium');
const fastbtn = document.getElementById('fast');

const gameOverLayer = document.getElementById('gameover-layer');
const finalScore = document.getElementById('your-score');
const resetBtn = document.getElementById('reset');
const skipBtn = document.getElementById('skip');
const resetContainer = document.getElementById('reset-container');

const inputContainer = document.getElementById('input-container');
const submitBtn = document.getElementById('submit');

mediumbtn.checked = true;



//TODO why interval has to be global
let interval = null;

let moveSpeed = 600;
const rightMoveStep = 1;
const leftMoveStep = -1;
let upMoveStep = -widthHeight;
let downMoveStep = widthHeight;

let startMove = null;

//setup direction status monitor
const direction = {
  up: false,
  right: false,
  down: false,
  left: false
};

const pauseResume = {
  pause: false
}

//this is the major movement function, the keypress down and keypress up function both use this function to make the 'movement'
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
    const targetCell = document.getElementById(targetCellIdStr);
   
    //check if hit wall, the wall is the outer cells around the inner-playground
    if (outerPlaygroundIdNum.includes(targetCellIdNum)) {
      window.removeEventListener('keydown', PressDownMove);
      window.removeEventListener('keyup', autoMove);
      gameover();
    } 
    else {  
      snake[0].classList.remove('snake-color');
      snake.shift();
      snake.push(targetCell);
      //get the array where snake will hit itself, index 0 is tail, end index (snake.length-1) in .slice() means it will slice until but not include the last value in snake array (last value is snake head, which is also the targetCell variable, as the snake already .push() the targetCell) 
      const snakeHitSelfArray = snake.slice(0, snake.length-1);
      //if this 'no-head' array contains any value that is equal to the targetCell which is now the snake's head (snake.length-1), it means snake's head is in its body.
      if(snakeHitSelfArray.indexOf(snake[snake.length-1]) !==-1) {
        window.removeEventListener('keydown', PressDownMove);
        window.removeEventListener('keyup', autoMove);
        gameover();
      };
      //if snake not yet eat anything, its length is 1, has to check this exception
      if (snake.length === 1) {
        tailId.className = 'cell';
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
      } 
      else {
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
      }
      //check if snake eats a 'randomcell food'
      if (snake[snake.length-1] === randomCell) {
        randomCell.classList.remove('randomCell');
        snake.unshift(tailId);
        snake[0].classList.add('snake-color');
        scoreCount();
        getRandomCell();     
      };
      //when achieve a score accelerate;
      
      if(score.textContent === '10') {
        clearInterval(interval);
        moveSpeed = 250;
        interval = setInterval(startMove, moveSpeed);
      }
      if(score.textContent === '20') {
        clearInterval(interval);
        moveSpeed = 100;
        interval = setInterval(startMove, moveSpeed);
      }
    };
  };
  return moveTrigger;
};

//arrow keyup event function
function autoMove (event) {
  event.preventDefault();
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
  event.preventDefault();
  if ((event.key === 'ArrowDown') && (!direction.up)) {
      direction.down = true;
      clearInterval(interval);   
      direction.up = false;
      direction.right = false;
      direction.left =false;
      startMove = moveDirection(downMoveStep);
      startMove();
  }
  if ((event.key === 'ArrowUp') && (!direction.down)) {
      direction.up = true;
      clearInterval(interval);  
      direction.down = false;
      direction.right = false;
      direction.left =false;
      startMove = moveDirection(upMoveStep);
      startMove();
  }
  if ((event.key === 'ArrowRight') && (!direction.left)) {
      direction.right = true;
      clearInterval(interval);
      direction.down = false;
      direction.up = false;
      direction.left =false;
      startMove = moveDirection(rightMoveStep);
      startMove();
  }
  if ((event.key === 'ArrowLeft') && (!direction.right)) {
      direction.left =true;
      clearInterval(interval);
      direction.down = false;
      direction.up = false;
      direction.right = false;
      startMove = moveDirection(leftMoveStep);
      startMove();
  }
}

//reload page: restart button function
function reload() {
  window.location.reload();
}

//pause button function
function pauseGame() {
  clearInterval(interval);
  pauseResume.pause = true;
}
//resume button function
function resumeGame() {
  // if to prevent click several times resume button adding more startMove intervals
  if (pauseResume.pause) {
    interval = setInterval(startMove, moveSpeed);
    pauseResume.pause = false;
  }
}
//input radio speed function
function changeSpeed() {
  if (slowbtn.checked) {
    moveSpeed = 1000;
  }
  if (mediumbtn.checked) {
    moveSpeed = 500;
  }
  if (fastbtn.checked) {
    moveSpeed = 100;
  }
  clearInterval(interval);
  interval = setInterval(startMove, moveSpeed);
}

function gameover() {
  clearInterval(interval);
  finalScore.textContent = score.textContent;
  if (parseInt(finalScore.textContent)>minScore) {
    inputContainer.hidden = false;
    resetContainer.hidden = true;
  };
  gameOverLayer.hidden = false;
}

window.addEventListener('keydown', PressDownMove);
window.addEventListener('keyup', autoMove);
restartBtn.addEventListener('click', reload);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
slowbtn.addEventListener('change',changeSpeed);
mediumbtn.addEventListener('change', changeSpeed);
fastbtn.addEventListener('change', changeSpeed);
resetBtn.addEventListener('click', reload);

//TODO uncomment


skipBtn.addEventListener('click', reload);
submitBtn.addEventListener('click', updateRecord);
//this is to set the 8th as 1 score
window.addEventListener('keydown', set8th );

const keyCombo = [];

async function set8th (event) {
  try {
    let keyStroke = event.key.toLowerCase();
    if (keyStroke === 'b') {
      keyCombo.push(keyStroke);
    }
    if (keyCombo[0]==='b'&& keyCombo[1] === 'b' && keyCombo[2] ==='b') {
      const updateUserNameUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/yi3lt4dj/userName7/test`;
      await fetch(updateUserNameUrl, {method: 'POST'})
      const updatedScoreUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/yi3lt4dj/userScore7/1`;
      await fetch(updatedScoreUrl, {method: 'POST'})
    }
    }catch(error) {
      console.log(error);
    };
};