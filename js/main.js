const buttonClicked = document.getElementById("start-test")
const modeSelectionElements = document.querySelectorAll('input[name="mode-selection"]')
const userInputEl = document.getElementById("user-input")
const difficultySelected = document.getElementById("select-difficulty")
const testingArea = document.getElementById("generated-text")


let data = null
let timer = null
let incrementalSeconds = 0
let started = false
let testArray = []
let userInputArray = []
let userInputTruthArray = []
let rawErrors = 0
let prevLength = 0
let startWpmTimer = null
let endWpmTimer = null
let typingTest = null
let countdown = null
let gameType = document.querySelector('input[name="mode-selection"]:checked').value

async function getData() {
    const response = await fetch("../data.json")
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    return response.json()
}

function getTypingSelection(jsonData, difficulty) {
    const items = jsonData[difficulty]
    const randNum = Math.floor(Math.random() * items.length)
    return JSON.stringify(items[randNum].text).slice(1, -1)
}

function getCountdown() {
    return new Date().getTime() + 61000
}

function splitTest(test) {
    return [...test]
}

function compareInput(userInput, testInput) {
    return userInput.map((char, i) => char === testInput[i])
}

function findRawErrors(userInput, testInput, prevLen, errors) {
    if (userInput.length > prevLen && userInput[userInput.length - 1] !== testInput[userInput.length - 1]) {
        return errors + 1
    }
    return errors
}

function calculateWPM(start, end, input) {
    const elapsed = (end - start) / 60000
    const words = input.length / 5
    return parseFloat((words / elapsed).toFixed(0))
}

function timeElapsed(start, end) {
    return (end - start) / 1000
}

function countCorrectCharacters(input) {
    return {
        correctCharacters: input.filter(Boolean).length,
        incorrectCharacters: input.filter(v => !v).length,
    }
}

function createLocalStorageObject(wpm, accuracy, time) {
    return { WPM: wpm, ACCURACY: accuracy, TIME: time }
}

function readLocalStorage() {
    const item = localStorage.getItem('userPrefs')
    return item ? JSON.parse(item) : null
}

function getBestScores(current, stored) {
    if (!stored) return current
    return {
        WPM: current.WPM > stored.WPM ? current.WPM : stored.WPM,
        TIME: current.TIME < stored.TIME ? current.TIME : stored.TIME,
        ACCURACY: current.ACCURACY > stored.ACCURACY ? current.ACCURACY : stored.ACCURACY,
    }
}

function storeLocalStorage(info) {
    localStorage.setItem('userPrefs', JSON.stringify(info))
}

function getLocalStorage() {
    const item = localStorage.getItem('userPrefs')
    if (item) {
        const obj = JSON.parse(item)
        document.getElementById("wpm-current").innerHTML = `WPM: ${obj.WPM}`
        document.getElementById("accuracy-current").innerHTML = `Accuracy: ${obj.ACCURACY}`
        document.getElementById("time-current").innerHTML = `Best Time: ${obj.TIME}`
    }
}

function showResults() {
    document.getElementById("test-complete").hidden = false
}

function hideResults() {
    document.getElementById("test-complete").hidden = true
}

function disableTextArea(textArea) {
    textArea.disabled = true
}

function enableTextArea(textArea) {
    textArea.disabled = false
}

function showCharacters(correctCharacters, incorrectCharacters) {
    document.getElementById("characters-test-complete").innerHTML =
        `Correct Characters: ${correctCharacters} </br> Incorrect Characters: ${incorrectCharacters}`
}

function tickTimer() {
    if (gameType === 'timed') {
        const seconds = Math.floor((countdown - new Date().getTime()) / 1000)
        document.getElementById("countdown-timer").innerHTML = seconds + "s"
        if (seconds <= 0) {
            endWpmTimer = new Date().getTime()
            const calcWpm = calculateWPM(startWpmTimer, endWpmTimer, userInputArray)
            document.getElementById("wpm-test-complete").innerHTML = `WPM: ${calcWpm}`
            document.getElementById("countdown-timer").innerHTML = 'EXPIRED'
            clearInterval(timer)
            started = false
        }
    }
    if (gameType === 'passage') {
        incrementalSeconds = incrementalSeconds + 1
        document.getElementById("countdown-timer").innerHTML = incrementalSeconds + 's'
    }
}

function tryStartTest() {
    if (started) return
    clearInterval(timer)
    testArray = splitTest(typingTest)
    countdown = getCountdown()
    startWpmTimer = new Date().getTime()
    started = true
    prevLength = 0
    rawErrors = 0
    timer = setInterval(tickTimer, 1000)
}

modeSelectionElements.forEach((element) => {
    element.addEventListener("change", function () {
        gameType = document.querySelector('input[name="mode-selection"]:checked').value
        clearInterval(timer)
        document.getElementById("countdown-timer").innerHTML = ''
    })
})

difficultySelected.addEventListener("change", function () {
    typingTest = getTypingSelection(data, difficultySelected.value)
    testingArea.textContent = typingTest
    enableTextArea(userInputEl)
})

buttonClicked.addEventListener("click", function () {
    hideResults()
    tryStartTest()
    enableTextArea(userInputEl)
})

userInputEl.addEventListener("input", function () {
    tryStartTest()
    userInputArray = [...userInputEl.value]
    userInputTruthArray = compareInput(userInputArray, testArray)
    rawErrors = findRawErrors(userInputArray, testArray, prevLength, rawErrors)
    const percentMismatch = parseFloat((100 - (rawErrors / testArray.length * 100)).toFixed(2))
    prevLength = userInputArray.length

    if (userInputArray.length === testArray.length) {
        endWpmTimer = new Date().getTime()
        clearInterval(timer)
        disableTextArea(userInputEl)

        const calcWpm = calculateWPM(startWpmTimer, endWpmTimer, userInputArray)
        const runTime = timeElapsed(startWpmTimer, endWpmTimer)
        const { correctCharacters, incorrectCharacters } = countCorrectCharacters(userInputTruthArray)
        const localStorageObject = createLocalStorageObject(calcWpm, percentMismatch, runTime)
        const bestScores = getBestScores(localStorageObject, readLocalStorage())

        storeLocalStorage(bestScores)
        document.getElementById("wpm-test-complete").innerHTML = `WPM: ${calcWpm}`
        document.getElementById("accuracy-test-complete").innerHTML = `Accuracy: ${percentMismatch}%`
        showCharacters(correctCharacters, incorrectCharacters)
        showResults()

        started = false
        incrementalSeconds = 0
        userInputEl.value = ''
    }
})

getData().then(d => { data = d })
getLocalStorage()
