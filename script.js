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

//main global variables
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const slowbtn = document.getElementById('slow');
const mediumbtn = document.getElementById('medium');
const fastbtn = document.getElementById('fast');
const score = document.getElementById('score-count');
const gameOverLayer = document.getElementById('gameover-layer');
const finalScore = document.getElementById('your-score');
const resetBtn = document.getElementById('reset');
const skipBtn = document.getElementById('skip');
const resetContainer = document.getElementById('reset-container');
const rankContainer = document.getElementById('rank-container');
score.textContent = '0';
let scoreNum = 0;
mediumbtn.checked = true;

const snake = [];
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

function createSnake() {
  let cell = document.getElementById('211');
  snake.push(cell);
  snake[snake.length-1].classList.add('snake-head-down');
}
createSnake();

let randomCell = null;

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

//to update score
function scoreCount () {
  scoreNum++;
  score.textContent = scoreNum;
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
  const randFoodUrl = `url(food/${randFoodId}.svg)`;
  randCell.style.setProperty('--background-url', randFoodUrl);
  randomCell = randCell;
}

getRandomCell();

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
window.addEventListener('load', showRank);

//record score for different users

const submitBtn = document.getElementById('submit');

submitBtn.addEventListener('click', updateRecord);
skipBtn.addEventListener('click', reload);
// const appKeyArray1 = ["f8l1xbm6","yi3lt4dj","39t359no","lf3lcjbv","oqzjyd32","i60cj4d2","flrw85ff"];
// const appKeyArray2 = ["xux3jps6","sj67pazk","jyrnnxpy","sr2quwuy","ddq4ha5r","3u2pkdgx","xiukwrza"];

const rank1 = document.getElementById('rank1');
const rank2 = document.getElementById('rank2');
const rank3 = document.getElementById('rank3');
const rank4 = document.getElementById('rank4');
const rank5 = document.getElementById('rank5');
const rank6 = document.getElementById('rank6');
const rank7 = document.getElementById('rank7');
const rank8 = document.getElementById('rank8');

const storedNameArray = [];
const storedScoreArray = [];

//after get userName and userScore arrays, combine items into object and into one array
const playerInfo = [];
let orderedPlayerInfo = [];
let minScore = 0;
//get playerCount function for future use
async function getPlayerCount () {
  try {
      const getKeyValueUrl = "https://keyvalue.immanuel.co/api/KeyVal/GetValue/f8l1xbm6/playerCount";
      const keyValueResponse = await fetch (getKeyValueUrl);
      const playerCount = await keyValueResponse.json();
      return playerCount;
    } catch (error) {
    console.log(error);
  }
}

//when loaded create a promise resolved with playerCount number assign the promise to playerCountPromise variable
// let playerCountPromise = getPlayerCount();


// async function getNameArray () {
//   let totalPlayerNum = 0;
//   try {
//     await playerCountPromise.then((count) => {
//       totalPlayerNum = parseInt(count)+1;
//     })
//     for (let i=0; i<totalPlayerNum;i++) {
//       let playerName = 'userName'+`${i}`;
//       const getKeyValueUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/yi3lt4dj/${playerName}`;
//       const nameValueResponse = await fetch (getKeyValueUrl);
//       const nameValueResponseData = await nameValueResponse.json();
//       storedNameArray.push(nameValueResponseData);
//     }   
//   } catch (error) {
//     console.log(error);
//   }
// }

// async function getScoreArray () {
//   let totalPlayerNum = 0;
//   try {
//     await playerCountPromise.then((count) => {
//       totalPlayerNum = parseInt(count)+1;
//     })
//     for (let i=0; i<totalPlayerNum;i++) {
//       let playerScore = 'userScore'+`${i}`;
//       const getKeyValueUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/yi3lt4dj/${playerScore}`;
//       const scoreValueResponse = await fetch (getKeyValueUrl);
//       const scoreValueResponseData = await scoreValueResponse.json();
//       storedScoreArray.push(scoreValueResponseData);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

async function getNameArray () {
  try {
    for (let i=0; i<8;i++) {
      let playerName = 'userName'+`${i}`;
      const getKeyValueUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/yi3lt4dj/${playerName}`;
      const nameValueResponse = await fetch (getKeyValueUrl);
      const nameValueResponseData = await nameValueResponse.json();
      storedNameArray.push(nameValueResponseData);
    }   
  } catch (error) {
    console.log(error);
  }
}

async function getScoreArray () {
  try {
    for (let i=0; i<8;i++) {
      let playerScore = 'userScore'+`${i}`;
      const getKeyValueUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/yi3lt4dj/${playerScore}`;
      const scoreValueResponse = await fetch (getKeyValueUrl);
      const scoreValueResponseData = await scoreValueResponse.json();
      storedScoreArray.push(scoreValueResponseData);
    }
  } catch (error) {
    console.log(error);
  }
}

function getPlayerInfoArray () {
  for (let i=0; i<storedNameArray.length;i++) {
    const record = {};
    record.userName = storedNameArray[i];
    record.userScore = storedScoreArray[i];
    playerInfo.push(record);
  } 
  orderedPlayerInfo = playerInfo.slice().sort(function scoreHightToLow (a,b) {
    return b.userScore - a.userScore;
  })
  return parseInt(orderedPlayerInfo[orderedPlayerInfo.length-1].userScore);
}

function presentRankList() {
  rank1.textContent = `#1 ${orderedPlayerInfo[0]['userName']}: ${orderedPlayerInfo[0]['userScore']}`;
  rank2.textContent = `#2 ${orderedPlayerInfo[1]['userName']}: ${orderedPlayerInfo[1]['userScore']}`;
  rank3.textContent = `#3 ${orderedPlayerInfo[2]['userName']}: ${orderedPlayerInfo[2]['userScore']}`;
  rank4.textContent = `#4 ${orderedPlayerInfo[3]['userName']}: ${orderedPlayerInfo[3]['userScore']}`;
  rank5.textContent = `#5 ${orderedPlayerInfo[4]['userName']}: ${orderedPlayerInfo[4]['userScore']}`;
  rank6.textContent = `#6 ${orderedPlayerInfo[5]['userName']}: ${orderedPlayerInfo[5]['userScore']}`;
  rank7.textContent = `#7 ${orderedPlayerInfo[6]['userName']}: ${orderedPlayerInfo[6]['userScore']}`;
  rank8.textContent = `#8 ${orderedPlayerInfo[7]['userName']}: ${orderedPlayerInfo[7]['userScore']}`;
}

//onload, restart, reset call this to get player record from key-value api and show on the rank board
let originalAndOrderedArrayPromise={};

async function generateRank() {
  try {
    const originalAndOrderedArray=[];
    await getNameArray();
    await getScoreArray();
    minScore = getPlayerInfoArray();
    presentRankList();
    loadComplete();
    originalAndOrderedArray.push(playerInfo);
    originalAndOrderedArray.push(orderedPlayerInfo);
    return originalAndOrderedArray;
  } catch (error) {
    console.log(error);
  }
}

// loading()
const loadDone = `rgba(240, 171, 171, 1)`;
function loadComplete () {
  rankContainer.style.setProperty('--rank-container-loading', loadDone);
}

// when load finishes call showRank
function showRank() {
  originalAndOrderedArrayPromise = generateRank();
}


//to update player count after player input name then hit submit button
async function updatePlayerCount () {
  let updatePlayerCountUrl='';
  try {
  await playerCountPromise.then((count)=> {
    updatePlayerCountUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/f8l1xbm6/playerCount/${parseInt(count)+1}`;
  })  
  await fetch(updatePlayerCountUrl, {method: 'POST'})
  } catch (error) {
    console.log(error);
  };
};

const inputText = document.getElementById('input-text');


// async function updateUserName () {
//   let userInputName = inputText.value;
//   let updatePlayerCountUrl = '';
//   try {
//     await playerCountPromise.then((count)=> {
//       const newPlayerName = 'userName'+`${parseInt(count)+1}`
//       updatePlayerCountUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/yi3lt4dj/${newPlayerName}/${userInputName}`;
//     })  
//     console.log(updatePlayerCountUrl);
//     await fetch(updatePlayerCountUrl, {method: 'POST'})
//   } catch (error) {
//     console.log(error);
//   };
// };



// async function updateUserScore () {
//   let updatedScoreUrl = '';
//   try {
//       await playerCountPromise.then((count)=> {
//       const newPlayerScore = 'userScore'+`${parseInt(count)+1}`
//       updatedScoreUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/yi3lt4dj/${newPlayerScore}/${score.textContent}`;
//     })
//     console.log(updatedScoreUrl);
//     await fetch(updatedScoreUrl, {method: 'POST'})
//   } catch (error) {
//     console.log(error);
//   };
// };



//in originalAndOrderedArrayPromise get the two arrays orderedPlayerinfo to find the index of the last item in the playerinfo array, then let the value to be updated on that key-value


async function updateUserName () {
  let userInputName = inputText.value;
  let updateUserNameUrl = '';
  let updateIndex = 0;
  try {
    await originalAndOrderedArrayPromise.then((array)=> {
          let minScoreObj = array[1][array[1].length-1];
          updateIndex = array[0].findIndex((element)=> {
            //TODO need to return the expression
            return ((element.userName === minScoreObj.userName) && (element.userScore === minScoreObj.userScore));
        })
      })
      const newPlayerName = 'userName'+`${parseInt(updateIndex)}`;
      updateUserNameUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/yi3lt4dj/${newPlayerName}/${userInputName}`;
      await fetch(updateUserNameUrl, {method: 'POST'})
  }   catch (error) {
      console.log(error);
  };
};

async function updateUserScore () {
  let updatedScoreUrl = '';
  let updateIndex = 0;
  try {
    await originalAndOrderedArrayPromise.then((array)=> {
        let minScoreObj = array[1][array[1].length-1];
        updateIndex = array[0].findIndex((element)=> {
        return ((element.userName === minScoreObj.userName) && (element.userScore === minScoreObj.userScore));
      })
    })
    const newPlayerScore = 'userScore'+`${parseInt(updateIndex)}`
    updatedScoreUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/yi3lt4dj/${newPlayerScore}/${score.textContent}`;
    await fetch(updatedScoreUrl, {method: 'POST'})
  } catch (error) {
    console.log(error);
  };
};

const inputContainer = document.getElementById('input-container');

async function updateRecord() {
  const text = inputText.value;
  const validInfo = /^[A-Za-z\s]*$/;
  if(!text.match(validInfo)) {
    alert('please only enter letters or space')
  } 
  else if (!text.length > 0) {
    alert('please enter a name')
  }
  else {
  try {
    await updateUserName();
    await updateUserScore();
    reload();
    } catch (error) {
    console.log(error);
    };
  };
};


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
