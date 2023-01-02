let bankroll = 1000;

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }
}

class Deck {
  constructor(numDecks) {
    this.cards = [];
    this.numDecks = numDecks;
  }

  buildStandardDeck() {
    // Create a new set of cards for each deck specified...
    for (let i = 0; i < this.numDecks; i++) {
      const suits = ["hearts", "diamonds", "clubs", "spades"];
      for (let suit of suits) {
        for (let value = 1; value <= 13; value++) {
          this.cards.push(new Card(suit, value));
        }
      }
    }
  }
}

class Shoe {
  constructor(numDecks) {
    this.cards = [];
    this.numDecks = numDecks;
  }

  loadCards(deck) {
    //if numDecks is 1, then load the cards from the deck
    this.cards = deck.cards;
    //if numDecks is greater than 1, then load the cards from the deck
    //and repeat the process for the number of decks specified
    for (let i = 0; i < this.numDecks - 1; i++) {
      this.cards = this.cards.concat(deck.cards);
    }
    this.cut = false;
  }

  getCard() {
    return this.cards.shift();
  }
}

class Hand {
  constructor(wager, dealer = false) {
    this.cards = [];
    this.wager = wager;
    this.dealer = dealer;
  }

  addCard(card) {
    this.cards.push(card);
  }
}

class Table {
  constructor(shuffleType, numDecks) {
    this.hands = [];

    this.shoe = new Shoe(numDecks);
    this.discard = [];
    this.shuffleSequence = [
      "wash",
      "riffle",
      "riffle",
      "riffle",
      "strip",
      "riffle",
      "cut",
    ];
  }

  dealCards() {
    //add a hand for the dealer
    this.hands.push(new Hand(0, true));
    // Deal two cards to each hand, in sequence starting with the first hand...
    for (let i = 0; i < 2; i++) {
      for (let hand of this.hands) {
        hand.addCard(this.shoe.getCard());
      }
    }
    //check the hands for blackjack
    for (let hand of this.hands) {
      if (hand.cards[0].value === 1 && hand.cards[1].value === 10) {
        hand.blackjack = true;
      } else if (hand.cards[0].value === 10 && hand.cards[1].value === 1) {
        hand.blackjack = true;
      }
    }
    //if the dealer has blackjack, then resolve the hands
    //the dealers hand will be the last hand in the array
    if (this.hands[this.hands.length - 1].blackjack) {
      this.resolveHands();
    }
  }
  resolveHands() {
    //get the dealers hand by checking for hands.dealer = true
    let dealerHand = this.hands.find((hand) => hand.dealer === true);
    //if the dealer has a blackjack, then check the other hands for blackjack
    if (dealerHand.blackjack) {
      for (let hand of this.hands) {
        if (hand.blackjack) {
          hand.payout = hand.wager;
        } else {
          hand.payout = 0;
        }
      }
    } else {
      //otherwise check the dealers hand. if it's below 17, then hit
      while (this.getHandValue(dealerHand) < 17) {
        dealerHand.addCard(this.shoe.getCard());
      }
      //compare the dealers hand to the other hands
      for (let hand of this.hands) {
        if (hand.dealer === false) {
          if (this.getHandValue(hand) > 21) {
            hand.payout = 0;
          } else if (
            this.getHandValue(hand) === this.getHandValue(dealerHand)
          ) {
            hand.payout = hand.wager;
          } else if (this.getHandValue(hand) > this.getHandValue(dealerHand)) {
            hand.payout = hand.wager * 2;
          } else if (this.getHandValue(hand) < this.getHandValue(dealerHand)) {
            hand.payout = 0;
          }
        }
      }
      //call a payout function. it will manage paying out the hands, and then reset the table
      this.payout();
    }
  }
  payout() {
    //add the payouts to the bankrolls associated with each hand
    for (let hand of this.hands) {
      //for now just add the payout to the bankroll, unless the hand is dealer hand
      if (hand.dealer === false) {
        bankroll += hand.payout;
      }
    }
    //reset the table
    //push all the cards from the hands into the discard pile
    for (let hand of this.hands) {
      this.discard = this.discard.concat(hand.cards);
    }
    //reset the hands array
    this.hands = [];
    //check the shoe to see if it needs to be reshuffled
    if (this.shoe.cards.length < 52) {
      //if the shoe is less than 52 cards, then push the cards into the discard pile
      this.discard = this.discard.concat(this.shoe.cards);
      //push the discard into the shoe then shuffle
      this.shoe.cards = this.discard;
      this.shuffle();
      //reset the discard pile
      this.discard = [];
    }
  }

  shuffle() {
    for (const operation of shuffleSequence) {
      if (operation === "wash") {
        // for now just do nothing for a wash
      } else if (operation === "riffle") {
        this.shoe.cards = riffleShuffle(this.shoe.cards);
      } else if (operation === "strip") {
        this.shoe.cards = stripShuffle(this.shoe.cards);
      } else if (operation === "cut") {
        this.shoe.cards = cut(this.shoe.cards);
      }
    }
  }
}
function riffleShuffle(cards) {
  //split the deck in half
  let half1 = cards.slice(0, cards.length / 2);
  let half2 = cards.slice(cards.length / 2);
  //create a new array to hold the shuffled cards
  let shufflePile = [];
  //while there are still cards in both halves, take a card from each half and add it to the shuffle pile
  while (half1.length > 0 && half2.length > 0) {
    shufflePile.push(half1.shift());
    shufflePile.push(half2.shift());
  }
  // Add remaining cards from whichever half has cards left
  shufflePile.push(...half1, ...half2);
  cards = shufflePile;
  return cards;
}

//a strip shuffle is a shuffle where you split the deck in half,
//then take small piles of cards from each half and riffle shuffle them together
function stripShuffle(cards) {
  //split the deck in half
  let half1 = cards.slice(0, cards.length / 2);
  let half2 = cards.slice(cards.length / 2);
  //create a new array to hold the shuffled cards
  let shufflePile = [];
  //create a variable to hold the number of cards to take from each half
  //this will be a random number between 11 and 28 cards
  let numCards = Math.floor(Math.random() * 18) + 11;
  //while there are still cards in both halves, take a pile of cards from each half and riffle shuffle them together
  while (half1.length > 0 && half2.length > 0) {
    //take a pile of cards from each half
    let pile1 = half1.splice(0, numCards);
    let pile2 = half2.splice(0, numCards);
    //riffle shuffle the piles together
    let pile = riffleShuffle(pile1.concat(pile2));
    //add the shuffled pile to the shuffle pile
    shufflePile.push(...pile);
  }
  //riffle shuffle the remaining cards together
  let pile = riffleShuffle(half1.concat(half2));
  //add the shuffled pile to the shuffle pile
  shufflePile.push(...pile);
  //set the cards to the shuffled pile
  cards = shufflePile;
  return cards;
}
function cut(cards) {
  //TODO: add player interaction to allow the player to cut the deck
  //for now, just cut the deck at a random point
  let cutPoint = Math.floor(Math.random() * cards.length);
  let half1 = cards.slice(0, cutPoint);
  let half2 = cards.slice(cutPoint);
  cards = half2.concat(half1);
  return cards;
}
