//this file is the main file for the game
//first make a table
let table = new Table();
//use the buildStandardDeck method to create a deck and load it into the shoe
let deck = new Deck(2); //create a deck with 2 decks
deck.buildStandardDeck(); //assembles the deck of standard cards

//add text to the screen
let text = document.createElement("p");
//make a string to display the deck
let deckDisplay = "";
//loop through the deck and add the cards to the string
for (let i = 0; i < deck.cards.length; i++) {
  deckDisplay += deck.cards[i].value + " of " + deck.cards[i].suit + " | ";
}
//add the string to the text element
text.innerHTML = deckDisplay;
//add the text element to the body
document.body.appendChild(text);

table.shoe.loadCards(deck);
console.log(table);
