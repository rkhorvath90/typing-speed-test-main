let data;
let gameType;
let timer;
let incrementalSeconds = 0
let started = false;
let splitArray = []
let testArray = []
let userInputArray = []
let userInputTruthArray = []
let percentMismatch;
let rawErrors;
let prevLength;

const buttonClicked = document.getElementById("start-test")
const modeSelectionElements = document.querySelectorAll('input[name="mode-selection"]')
const userInput = document.getElementById("user-input")

async function getData() {
  data = "../data.json";
  try {
    const response = await fetch(data);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    data = await response.json();
    return data
  } catch (error) {
    console.error(error.message);
  }
}

function getTypingSelection(difficulty) {
    const dataLength = data[difficulty].length
    const randNum = Math.floor(Math.random() * dataLength)
    const testValue = JSON.stringify(data[difficulty][randNum].text)
    const returnTest = testValue.slice(1,-1)
    return returnTest
}

function getCountdown(){
    let currentTime = new Date().getTime()
    let stopTimer =  currentTime + 61000
    return stopTimer
}

function updateCounter(){
    incrementalSeconds++
}

function startTimer (gameType, endTime) {
    if (gameType == 'timed'){
        let countdown = endTime - new Date().getTime()
        let seconds = Math.floor(countdown / 1000)
        document.getElementById("countdown-timer").innerHTML = seconds + "s"
        if (seconds <= 0){
            document.getElementById("countdown-timer").innerHTML = 'EXPIRED'
            clearInterval(timer)
        }
    }

    if (gameType =='passage'){
        updateCounter()
        document.getElementById("countdown-timer").innerHTML = incrementalSeconds + 's'
    }
}

function splitTest (test){
    return splitArray = [...test]
}

function compareInput (userInput, testInput) {
    userInputTruthArray = []
    for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] !== testInput[i]) {
            userInputTruthArray.push(false)
        }
        if (userInput[i] === testInput[i]) {
            userInputTruthArray.push(true)
        }
    }

    return userInputTruthArray
}

function findRawErrors (userInput, testInput, prevLength){
    if(userInput.length > prevLength){
        if(userInput[userInput.length-1] !== testInput[userInput.length-1]){
            return rawErrors++
        }
    }
}


modeSelectionElements.forEach((element)=> {
    element.addEventListener("change", function(){
        gameType = document.querySelector('input[name="mode-selection"]:checked').value
        clearInterval(timer)   
        document.getElementById("countdown-timer").innerHTML = ''
    })
});

buttonClicked.addEventListener("click", function (){
    started = true
    prevLength = 0
    rawErrors = 0
    const testingArea = document.getElementById("generated-text")
    const difficultySelected = document.getElementById("select-difficulty").value
    const typingTest = getTypingSelection(difficultySelected)
    testingArea.textContent = typingTest
    //console.log(testingArea)
    testArray = splitTest(typingTest)
    //console.log(testArray)
    const countdown = getCountdown()
    timer = setInterval(() => startTimer(gameType, countdown), 1000)
    
})

userInput.addEventListener("input", function(){
    //console.log(`User input changed to: ${userInput.value}`)
    userInputArray = [...userInput.value]
    //console.log(`userInputArray: ${userInputArray}`)
    //console.log(`userInputArray Array length: ${userInputArray.length}`)
    //console.log(`testarray array length: ${testArray.length}`)
    const comparison = compareInput(userInputArray, testArray)
    findRawErrors(userInputArray,testArray,prevLength)
    //console.log(`comparison: ${comparison}`)
    percentMismatch = rawErrors / testArray.length * 100
    const percentMismatchRounded = parseFloat(percentMismatch.toFixed(2))
    //console.log(`percentMismatch: ${percentMismatchRounded}`)
    //console.log(`comparison.userInputTruthArray: ${JSON.stringify(comparison.userInputTruthArray)}`)

    prevLength = userInputArray.length
})

getData()

