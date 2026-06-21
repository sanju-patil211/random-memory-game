let cards = [];
let cardTable = document.querySelector(".card-table");
let firstCard = null;
let secondCard = null;
let noFlipping = false; // restrict user from flipping 3 or more cards at same time
let triesRemaining = 10; // set how many times the user can try match all cards, before losing
let winCounter = null; // we will update this win counter on every match

// display the triesRemaining to the user
let counter = document.querySelector(".tries-remaining");
counter.textContent = triesRemaining;

// FETCH JSON DATA
// implement the Fetch API to grab the card JSON file
fetch("./data/card_info.json")
    .then(response => response.json())
    .then((data) => {
        winCounter = data.length; 
        // OPTION 1 using MAP
        // const cardsWithMap = data.map(card => [card, card]).flat();
        // console.log(cardsWithMap);

        // OPTION 2 using flatmap()
        // const cardsWithFlatMap = data.flatMap(card => {
        //     return [card, card];
        // })
        // console.log(cardsWithFlatMap);

        // OPTION 3 (easiest)
        cards = [...data, ...data];

        // shuffle our cards
        let shuffledCards = shuffle();
        // deal our cards
        dealCards(shuffledCards);

    })
    .catch((error) => {
        console.log("Error fetching card data: ", error);
    }); // end Fetch


    // define our shuffle function
    function shuffle() {
        // Create a copy of the cards array to avoid mutating the original array
        let shuffledCardsArray = [...cards];
        let totalCards = shuffledCardsArray.length; 
        let currentIndex = totalCards - 1;

        // use Fisher-Yates (or Knuth) shuffle algorithm. This method is efficient and ensures that each possible permutation of the array has an equal probability of occurring. 

        // OPTION 1
        // Loop through the array from the last element to the first
        // for(currentIndex; currentIndex > 0; currentIndex--) {
            // // Generate a random index between 0 and currentIndex (inclusive)
            // let randomCardIndex = Math.floor(Math.random() * (currentIndex + 1));
        //     console.log("randomCardIndex: ", randomCardIndex);


        //     // Swap the elements at currentIndex and randomIndex using a temporary variable
        //     let randomCard = shuffledCardsArray[randomCardIndex];
        //     console.log("randomCard: ", randomCard);
        //     // replace the randomCard with the card at the currentIndex
        //     shuffledCardsArray[randomCardIndex] = shuffledCardsArray[currentIndex];
        //     console.log("shuffledCardsArrayStep1: ", [...shuffledCardsArray]);

        //     // replace the card at currentIndex with the randomCard 
        //     shuffledCardsArray[currentIndex] = randomCard;
        //     console.log("shuffledCardsArrayStep2: ", [...shuffledCardsArray]);
        // };

        // OPTION 2
        // Swap elements using destructuring assignment in JavaScript
        for(currentIndex; currentIndex > 0; currentIndex--) {
            // Generate a random index between 0 and currentIndex (inclusive)
            let randomCardIndex = Math.floor(Math.random() * (currentIndex + 1));
            // right side of the assignment creates a new array containing the two elements you want to swap
            // The left side of the assignment specifies where those values should go
            [shuffledCardsArray[currentIndex], shuffledCardsArray[randomCardIndex]] = [shuffledCardsArray[randomCardIndex], shuffledCardsArray[currentIndex]];
        };

        return shuffledCardsArray; 
    }; // end shuffle


    // run the dealCards function only once per once per game. 
    function dealCards(cards) {
        console.log('welcome to the random card game');
        // Create a document fragment to minimize reflows (if you append each card one by one, this can be inefficient because each appendChild operation may trigger reflows and repaints in the browser)
        let fragment = document.createDocumentFragment();
        for (const card of cards) {
            // OPTION 1: directly adding created elements to the DOM
            // #1. create the card wrapper
        //     let cardElement = document.createElement("div");
        //     cardElement.classList.add("card");
        //     cardElement.setAttribute("data-name", card.name);
        //     // #2. add the front and back of the card
        //     cardElement.innerHTML = `
        //         <div class="back">
        //             <img class="back-image" src="${card.image}.png"> 
        //         </div>
        //         <div class="front"></div>
        //     `;
        //     cardTable.appendChild(cardElement);
        // }

        // OPTION 2: using fragments
        // create our entire card
        let cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.setAttribute("data-name", card.name);

        // create both the front and back of the cards, seperately 
        // FRONT of card
        let frontCardDiv = document.createElement("div");
        frontCardDiv.classList.add("front");

        // BACK of card
        let backCardDiv = document.createElement("div");
        backCardDiv.classList.add("back");
        // add image to the back of the card
        let img = document.createElement("img");
        img.classList.add("back-image");
        img.src = `${card.image}.png`;
        backCardDiv.appendChild(img);

        // append our front and back of the card, to the card itself
        cardElement.append(backCardDiv, frontCardDiv);
        // attach our card to the fragment 
        fragment.appendChild(cardElement);
    } // end of the for loop

    // append the entire fragment to the live DOM
    cardTable.appendChild(fragment);

    // Attach click event listeners after all cards are added
    let dealtCards = document.querySelectorAll('.card');
    dealtCards.forEach(card => {
        card.addEventListener("click", flipCard);
    });
    
}; // end dealCards

function flipCard() {
    if(noFlipping) return; // check whether flag is set, and if so, exit out of function. user cannot click on more than 2 cards at any given time
    // add a css class to activate the flip effect
    this.classList.add("flipped");
    // prohibit user from clicking on the same card twice
    if(this === firstCard) {
        alert("you must not click on the same card that you flipped over");
        return; 
    };
    // grab first card flipped over (clicked)
    if(!firstCard) {
        firstCard = this; // set the firstCard value to the div with class "card"
        return; // exit out of this flipCard function and wait for user to flip another card;
    };

    secondCard = this; // set the secondCard value to the div with class "card"
    noFlipping = true; // prevent user from clicking on more than 2 cards at once
    checkForMatch();
}; // end flipCard

function checkForMatch() {
    let isMatch = (firstCard.dataset.name === secondCard.dataset.name); // boolean, indicating whether we have a match
    // the ternary operator in JavaScript
    isMatch ? matchCards() : unflipCards();
}; // end checkForMatch

function unflipCards() {
    setTimeout(() => {
        // examine whether the user has lost the game
        --triesRemaining;
        counter.textContent = triesRemaining;
        if(triesRemaining === 0) {
            alert("YOU LOST");
            showImageOverlay();
            return; 
        };
        // flip cards back over by removing CSS class
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetFlags();
    }, 1000);
}; // end unflipCards

function matchCards() {
    // reduce winCounter with Prefix Decrement (note: Postfix Decrement will also work)
    --winCounter;
    console.log(winCounter);
    if(winCounter === 0) {
        setTimeout(() => {
            alert("YOU WIN. PLEASE RESTART THE BROWSER");
            let starInterval = setInterval(createStar, 300); // Create a new star every 300ms
            setTimeout(() => {
                clearInterval(starInterval);
            }, 5000);
        }, 1000);
    };

    // remove the click event listener from our matched cards
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    // add a green color to matched cards
    setCardBackground(firstCard, "greenyellow");
    setCardBackground(secondCard, "greenyellow");
    // reset our variables / flags
    resetFlags();
}; // end matchedCards

function setCardBackground(card, color) {
    card.children[0].style.background = color; 
}; // end setCardBackground

function resetFlags() {
    firstCard = null; 
    secondCard = null;
    noFlipping = false; // open up all unmatched cards to be flipped again
}; // end resetFlags

function showImageOverlay() {
    // create the div wrapper
    let wrapper = document.createElement("div");
    wrapper.classList.add("image-overlay"); // adding this class for CSS styling

    // create the image child
    let img = document.createElement("img");
    img.src = "./images/loser.jpg";

    // append the image as a child to the wrapper div
    wrapper.appendChild(img);

    // finally, attach the wrapper to the DOM
    document.body.appendChild(wrapper);

    // transition the opacity to 1
    requestAnimationFrame(() => {
        wrapper.style.opacity = 1;
    });

}; // end showImageOverlay

// creating STARS ⭐⭐⭐
function createStar() {
    // creating our star div
    let star = document.createElement("div");
    star.classList.add("star");
    // style our stars
    // set random horizontal position 
    let randomX = Math.random() * window.innerWidth;
    star.style.left = `${randomX}px`;
    // set a random duration
    let duration = Math.random()*2 + 3;
    star.style.animationDuration = `${duration}s`;

    // append our star to its wrapper div
    document.getElementsByClassName("star-wrapper")[0].appendChild(star);

    // remove the star from the DOM, when the animation ends
    star.addEventListener('animationend', () => {
        star.remove(); 
    });

}; // end createStars