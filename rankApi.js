import {score} from './setUp.js';

const rankContainer = document.getElementById('rank-container');
const storedNameArray = [];
const storedScoreArray = [];
const playerInfo = [];
let orderedPlayerInfo = [];
let minScore = 0;
//record score for different users

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


//after get userName and userScore arrays, combine items into object and into one array


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

const inputText = document.getElementById('input-text');

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

function reload() {
  window.location.reload();
}

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

window.addEventListener('load', showRank);

export {updateRecord, minScore}





//get playerCount function for future use
// async function getPlayerCount () {
//   try {
//       const getKeyValueUrl = "https://keyvalue.immanuel.co/api/KeyVal/GetValue/f8l1xbm6/playerCount";
//       const keyValueResponse = await fetch (getKeyValueUrl);
//       const playerCount = await keyValueResponse.json();
//       return playerCount;
//     } catch (error) {
//     console.log(error);
//   }
// }









//to update player count after player input name then hit submit button
/*async function updatePlayerCount () {
  let updatePlayerCountUrl='';
  try {
  await playerCountPromise.then((count)=> {
    updatePlayerCountUrl = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/f8l1xbm6/playerCount/${parseInt(count)+1}`;
  })  
  await fetch(updatePlayerCountUrl, {method: 'POST'})
  } catch (error) {
    console.log(error);
  };
};*/





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