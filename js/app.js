/*
 * CSS Classes
 */
const OPEN = 'open';
const SHOW = 'show';
const MATCH = 'match';
const MISMATCH = 'mismatch';
const STAR_FULL = 'fa-star';
const STAR_EMPTY = 'fa-star-o';

/*
 * 8 pairs of cards, each with a state corresponding to a Font Awesome icon
 */
const cards =
    ['fa fa-diamond', 'fa fa-diamond',
    'fa fa-paper-plane-o', 'fa fa-paper-plane-o',
    'fa fa-anchor', 'fa fa-anchor',
    'fa fa-bolt', 'fa fa-bolt',
    'fa fa-cube', 'fa fa-cube',
    'fa fa-leaf', 'fa fa-leaf',
    'fa fa-bicycle', 'fa fa-bicycle',
    'fa fa-bomb', 'fa fa-bomb'];

/*
 * Game state
 */
let numMatches;
let openedCard;
let moveCounter;
let timerSeconds;
let timerHandle;
let timerString;
let starRating;
let isCheckingForMatch;

/*
 * HTML DOM elements
 */
let timerElement;
let starElements;
let movesElement;
let deckElement;
let cardElements;
let modalGameOverElement;
let gameSummaryElement;
let playAgainElement;

/*
 * @description Update the star rating based on the number of moves made.
 */
function updateStarRating() {
    if (moveCounter === 0)
        starRating = 3;
    else if (moveCounter === 9)
        starRating = 2;
    else if (moveCounter === 15)
        starRating = 1;

    for (let i = 0; i < starElements.length; i++) {
        if (i < starRating) {
            starElements[i].firstChild.classList.remove(STAR_EMPTY);
            starElements[i].firstChild.classList.add(STAR_FULL);
        }
        else {
            starElements[i].firstChild.classList.remove(STAR_FULL);
            starElements[i].firstChild.classList.add(STAR_EMPTY);
        }
    }
}

/*
 * @description Update the moves HTML element content.
 */
function updateMovesElement(moves) {
    movesElement.textContent = moves;
}

/*
 * @description Increment the moves counter.
 */
function incrementMovesCounter() {
    moveCounter++;
    updateMovesElement(moveCounter);
    updateStarRating();
}

/*
 * @description Reset the moves counter.
 */
function resetMovesCounter() {
    moveCounter = 0;
    updateMovesElement(0);
}

/*
 * @description Increment the timer by a second.
 */
function incrementTimerSeconds() {
    updateTimer(timerSeconds + 1);
}

/*
 * @description Start the timer.
 */
function startTimer() {
    timerHandle = setInterval(incrementTimerSeconds, 1000);
}

/*
 * @description Get a HH:string represent. Code modified from some found at https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
 */
function getTimerText(timerSeconds) {
    let hours = Math.floor(timerSeconds / 3600);
    let minutes = Math.floor((timerSeconds - (hours * 3600)) / 60);
    let seconds = timerSeconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }

    return `${hours}:${minutes}:${seconds}`;
}

/*
 * @description Update the timer HTML elment.
 */
function updateTimer(timeInSeconds) {
    timerSeconds = timeInSeconds;
    timerString = getTimerText(timerSeconds);
    timerElement.innerHTML = timerString;
}

/*
 * @description Stop the timer.
 */
function stopTimer() {
    clearInterval(timerHandle);
    timerHandle = 0;
}

/*
 * @description Reset the timer.
 */
function resetTimer() {
    stopTimer();
    updateTimer(0);
}

/*
 * @description Open a card.
 */
function openCard(card) {
    card.classList.add(OPEN);
}

/*
 * @description Close a card.
 */
function closeCard(card) {
    card.classList.remove(OPEN);
}

/*
 * @description Show a cards content.
 */
function showCard(card) {
    card.classList.add(SHOW);
}

/*
 * @description Hide a cards content.
 */
function hideCard(card) {
    card.classList.remove(SHOW);
}

/*
 * @description Match a card.
 */
function matchCard(card) {
    card.classList.add(MATCH);
}

/*
 * @description Unmatch a card.
 */
function unmatchCard(card) {
    card.classList.remove(MATCH);
}

/*
 * @description Show that a card does not match.
 */
function mismatchCard(card) {
    card.classList.add(MISMATCH);
}

/*
 * @description Show that a card does not not match.
 */
function unmismatchCard(card) {
    card.classList.remove(MISMATCH);
}

/*
 * @description Handle click event on the Restart element.
 */

function restartElementClicked() {
    shuffleCards();
}

/*
 * @description Handle click event on the Play Again element.
 */
function playAgainElementClicked() {
    modalGameOverElement.style.display = 'none';
    shuffleCards();
}

/*
 * @description Update the game summary text.
 */
function updateGameSummary() {
    gameSummaryElement.textContent = `You made ${moveCounter} moves and earned ${starRating} out of 3 stars in a time of ${timerString}!`;
}

/*
 * @description Check if the game is over.
 */
function checkGameOver() {
    if (numMatches === 8) {
        stopTimer();
        updateGameSummary();
        modalGameOverElement.style.display = 'block';
    }
}

/*
 * @description Hide a mismatched card.
 */
function hideMismatchedCard(card) {
    unmismatchCard(card);
    closeCard(card);
    hideCard(card);
}

/*
 * @description Check if a card matches an open card in play.
 */
function checkForMatch(cardElement) {
    incrementMovesCounter();
    const iElement = cardElement.getElementsByTagName('i').item(0);
    const openedCardIElement = openedCard.getElementsByTagName('i').item(0);

    if (Array.prototype.every.call(iElement.classList, function (v) {
        return openedCardIElement.classList.contains(v);
    })
    ) {
        matchCard(cardElement);
        matchCard(openedCard);
        openedCard = undefined;
        numMatches++;
        checkGameOver();
    }
    else {
        isCheckingForMatch = true;
        mismatchCard(cardElement);
        mismatchCard(openedCard);

        // Allow player to see the mismatched cards for 1 second before hiding them
        setTimeout(function () {
            hideMismatchedCard(cardElement);
            hideMismatchedCard(openedCard);
            openedCard = undefined;
            isCheckingForMatch = false;
        }, (1000));
    }
}

/*
 * @description Handle a click event on the deck. We're only interested in clicks on cards.
 */
function deckElementClicked(event) {
    if (event.target.nodeName !== 'LI'
        || event.target.classList.contains(MATCH)
        || event.target.classList.contains(OPEN)
        || isCheckingForMatch === true) {
        return;
    }

    if (moveCounter === 0
        && openedCard === undefined) {
        startTimer();
    }

    const card = event.target;

    if (!card.classList.contains(OPEN)) {
        openCard(card);
        showCard(card);
    }

    if (openedCard === undefined) {
        openedCard = card;
    }
    else {
        checkForMatch(card);
    }
}

/*
 * @description Remove all cards from the deck.
 */
function clearDeck() {
    while (deckElement.firstChild) {
        deckElement.removeChild(deckElement.firstChild);
    }
}

/*
 * @description Populate the deck by creating an HTML element for each card.
 */
function populateDeck() {
    openedCard = undefined;
    clearDeck();

    for (let card of cards) {
        const liElement = document.createElement('li');
        liElement.setAttribute('class', 'card');

        const iElement = document.createElement('i');
        iElement.setAttribute('class', card);

        liElement.appendChild(iElement);
        deckElement.appendChild(liElement);
    }

    cardElements = document.getElementsByClassName('card');
}

/*
 * @description Shuffle an array. Code borrowed from http://stackoverflow.com/a/2450976
 */
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/*
 * @description Shuffle the cards and update game state for the start of a new game.
 */
function shuffleCards() {
    isCheckingForMatch = false;
    numMatches = 0;
    shuffle(cards);
    populateDeck();
    resetTimer();
    resetMovesCounter();
    updateStarRating();
}

/*
 * @description Start the Matching Game. Retrieve HTML DOM elements to be manipulated, shuffle the cards and set up event listeners.
 */
function startGame() {
    timerElement = document.getElementsByClassName('timer').item(0);
    starElements = document.getElementsByClassName('stars').item(0).children;
    movesElement = document.getElementsByClassName('moves').item(0);
    deckElement = document.getElementsByClassName('deck').item(0);
    modalGameOverElement = document.getElementsByClassName('game-over').item(0);
    gameSummaryElement = document.getElementById('game-summary');
    playAgainElement = document.getElementsByClassName('play-again').item(0);
    
    shuffleCards();

    deckElement.addEventListener('click', function (e) { deckElementClicked(e) }, false);
    document.getElementsByClassName('restart').item(0).addEventListener('click', restartElementClicked, false);
    playAgainElement.addEventListener('click', playAgainElementClicked, false);
}

document.addEventListener('DOMContentLoaded', startGame, false);