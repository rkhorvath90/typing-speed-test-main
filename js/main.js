let data;

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
let startWpmTimer
let endWpmTimer;
let calculatedWpm;
let difficultyValue;
let typingTest
let countdown
let correctCharacters;
let incorrectCharacters;
let storageObject
let runTime
let calculatedWpmRounded
let localStorageObject;

const buttonClicked = document.getElementById("start-test")
const modeSelectionElements = document.querySelectorAll('input[name="mode-selection"]')
const userInput = document.getElementById("user-input")
const difficultySelected = document.getElementById("select-difficulty")
const testingArea = document.getElementById("generated-text")
let gameType = document.querySelector('input[name="mode-selection"]:checked').value

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

function endTimer(){
    endSpeedTimer()
    calculateWPM(startWpmTimer, endWpmTimer, userInputArray)
    document.getElementById("countdown-timer").innerHTML = 'EXPIRED'
    clearInterval(timer)
    started = false
}

function startTimer (gameType, endTime) {
    console.log(`gameType: ${gameType}`)
    if (gameType == 'timed'){
        startSpeedTimer()
        let startTimercountdown = endTime - new Date().getTime()
        seconds = Math.floor(startTimercountdown / 1000)
        document.getElementById("countdown-timer").innerHTML = seconds + "s"
        if (seconds <= 0){
            endTimer()
        }
    }

    if (gameType =='passage'){
        updateCounter()
        startSpeedTimer()
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

function startSpeedTimer() {
    if (startWpmTimer == null) {
        startWpmTimer = new Date().getTime()
        return startWpmTimer
    }
}

function endSpeedTimer (){
    if (started === true){
        endWpmTimer = new Date().getTime()
        return endWpmTimer
    }
}

function timeElapsed (start, end){
    runTime = (end - start) / 1000
    return runTime
}

function calculateWPM (start, end, input) {
    console.log(`start: ${start}`)
    console.log(`end: ${end}`)
    let elapsed = (end - start) / 60000;
    console.log(`Elapsed: ${elapsed}`)
    let words = input.length / 5
    console.log(`Words: ${words}`)
    calculatedWpm = words / elapsed
    calculatedWpmRounded = parseFloat(calculatedWpm.toFixed(0))
    console.log(`calculatedWpmRounded: ${calculatedWpmRounded}`)
    document.getElementById("wpm-test-complete").innerHTML = `WPM: ${calculatedWpmRounded}`
}

function showResults (){
    if (started === true) document.getElementById("test-complete").hidden = false
}

function hideResults(){
    if (started === false) document.getElementById("test-complete").hidden = true
}

function startTest(){
    if (started !== true){
        clearInterval(timer)
        started = true
        prevLength = 0
        rawErrors = 0
        console.log(testingArea)
        testArray = splitTest(typingTest)
        console.log(testArray)
        startWpmTimer = null
        startSpeedTimer()
        countdown = getCountdown()
        timer = setInterval(() => startTimer(gameType, countdown), 1000)
    }
}

function disableTextArea(textArea){
    textArea.disabled = true
}

function enableTextArea(textArea){
    textArea.disabled = false
}

function countCorrectCharacters(input){
    correctCharacters = input.filter(i => i === true).length;
    incorrectCharacters = input.filter(i => i === false).length;
    console.log(`correctCharacters: ${correctCharacters}`)
    console.log(`incorrectCharacters: ${incorrectCharacters}`)
    return {correctCharacters, incorrectCharacters}
}

function showCharacters(correctCharacters, incorrectCharacters){
    document.getElementById("characters-test-complete").innerHTML = `Correct Characters: ${correctCharacters} </br> Incorrect Characters: ${incorrectCharacters}`

}

function storeLocalStorage(info){
    const userPreferencesString = JSON.stringify(info);
    localStorage.setItem('userPrefs', userPreferencesString);
}

function createLocalStorageObject(wpm, accuracy, time){
    storageObject = {WPM: wpm, ACCURACY: accuracy, TIME: time}
    return storageObject
}

function getLocalStorage(){
    const localStorageObjectItem = localStorage.getItem('userPrefs')
    if (localStorageObjectItem){
        localStorageObject = JSON.parse(localStorageObjectItem)
        document.getElementById("wpm-current").innerHTML = `WPM: ${localStorageObject.WPM}`
        document.getElementById("accuracy-current").innerHTML = `Accuracy: ${localStorageObject.ACCURACY}`
        document.getElementById("time-current").innerHTML = `Best Time: ${localStorageObject.TIME}`
    }
}


modeSelectionElements.forEach((element)=> {
    element.addEventListener("change", function(){
        gameType = document.querySelector('input[name="mode-selection"]:checked').value
        clearInterval(timer)   
        document.getElementById("countdown-timer").innerHTML = ''
    })
});

difficultySelected.addEventListener("change", function(){
    difficultyValue = difficultySelected.value
    enableTextArea(userInput)
    typingTest = getTypingSelection(difficultyValue)
    testingArea.textContent = typingTest
    
})

buttonClicked.addEventListener("click", function (){
    hideResults()
    startTest()
    enableTextArea(userInput)
    
})

userInput.addEventListener("input", function(){
    startTest()
    console.log(`User input changed to: ${userInput.value}`)
    userInputArray = [...userInput.value]
    console.log(`userInputArray: ${userInputArray}`)
    console.log(`userInputArray Array length: ${userInputArray.length}`)
    console.log(`testarray array length: ${testArray.length}`)
    const comparison = compareInput(userInputArray, testArray)
    console.log(`Raw Errors: ${rawErrors}`)
    findRawErrors(userInputArray,testArray,prevLength)
    console.log(`comparison: ${comparison}`)
    percentMismatch = 100 - (rawErrors / testArray.length * 100)
    const percentMismatchRounded = parseFloat(percentMismatch.toFixed(2))
    console.log(`percentMismatch: ${percentMismatchRounded}`)
    console.log(`userInputTruthArray: ${JSON.stringify(userInputTruthArray)}`)
    prevLength = userInputArray.length
    if (userInputArray.length === testArray.length){
        endSpeedTimer()
        disableTextArea(userInput)
        countCorrectCharacters(userInputTruthArray)
        clearInterval(timer)
        calculateWPM(startWpmTimer, endWpmTimer, userInputArray)
        timeElapsed(startWpmTimer, endWpmTimer)
        createLocalStorageObject(calculatedWpmRounded, percentMismatchRounded, runTime)
        storeLocalStorage(storageObject)
        showResults()
        showCharacters(correctCharacters, incorrectCharacters)
        document.getElementById("accuracy-test-complete").innerHTML = `Accuracy: ${percentMismatchRounded}%`
        started = false
        incrementalSeconds = 0
        userInput.value = ''
        
    }
})

getData()
getLocalStorage()

