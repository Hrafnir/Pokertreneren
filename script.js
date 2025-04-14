// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variabler & Tilstand ---
    let currentDeck = [];
    let heroHand = [];
    let heroPosition = '';
    let dealerPositionIndex = -1; // Indeks for knappen
    let smallBlindIndex = -1;
    let bigBlindIndex = -1;
    let currentScenario = 'RFI'; // Start med RFI
    let actionsPrecedingHero = []; // Holder styr på handlinger før Hero
    let numPlayers = 9; // Default 9max
    let stackDepth = '40bb'; // Default 40bb
    let trainingMode = 'standard'; // Default
    let fixedPosition = null; // For Posisjonstrener modus

    // --- DOM Elementer ---
    const gameTypeSelect = document.getElementById('gameType');
    const stackDepthSelect = document.getElementById('stackDepth');
    const trainingModeSelect = document.getElementById('trainingMode');
    const positionLabel = document.getElementById('positionLabel');
    const positionSelect = document.getElementById('positionSelect');
    const newHandBtn = document.getElementById('newHandBtn');
    const pokerTable = document.querySelector('.poker-table');
    const heroPositionSpan = document.getElementById('heroPosition');
    const heroCardsContainer = document.querySelector('.hero-cards');
    const actionButtons = document.querySelectorAll('.action-buttons button');
    const feedbackText = document.getElementById('feedbackText');
    const correctActionText = document.getElementById('correctActionText');
    const rangeDisplayContainer = document.getElementById('rangeDisplayContainer');
    const rangeGrid = document.getElementById('rangeGrid');
    const potDisplaySpan = document.querySelector('.pot-display span');
    const dealerButtonElement = document.querySelector('.dealer-button');

    // --- Konstanter ---
    const suits = ['c', 'd', 'h', 's']; // Clubs, Diamonds, Hearts, Spades
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const positions9max = ["BTN", "SB", "BB", "UTG", "UTG+1", "MP", "MP+1", "HJ", "CO"];
    const positions6max = ["BTN", "SB", "BB", "UTG", "MP", "CO"];

    // --- Funksjoner ---

    function createDeck() {
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(rank + suit);
            }
        }
        return deck;
    }

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
        }
        return deck;
    }

    // Konverterer ['Ac', 'Ks'] til 'AKs' eller 'AKo' etc.
    function getHandKey(cards) {
        if (!cards || cards.length !== 2) return null;

        const card1Rank = cards[0][0];
        const card1Suit = cards[0][1];
        const card2Rank = cards[1][0];
        const card2Suit = cards[1][1];

        const rankOrder = ranks.slice().reverse(); // A, K, Q... 2
        const rank1Index = rankOrder.indexOf(card1Rank);
        const rank2Index = rankOrder.indexOf(card2Rank);

        const highRank = rank1Index < rank2Index ? card1Rank : card2Rank;
        const lowRank = rank1Index < rank2Index ? card2Rank : card1Rank;
        const suited = card1Suit === card2Suit;

        if (highRank === lowRank) { // Pair
            return highRank + lowRank;
        } else {
            return highRank + lowRank + (suited ? 's' : 'o');
        }
    }

    // Hjelpefunksjon for å få posisjonsnavn
    function getPositionName(index, numPlayers) {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        return positions[index];
    }

    // Fyll ut dropdown for posisjonsvelger
    function populatePositionSelect() {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = ''; // Tøm eksisterende
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        // Velg BTN som default hvis den finnes
         if (positionSelect.querySelector('option[value="BTN"]')) {
             positionSelect.value = "BTN";
         } else if (positions.length > 0) {
              positionSelect.value = positions[0];
         }
         fixedPosition = positionSelect.value; // Oppdater fixedPosition
    }

    // Plasserer seter og knapp visuelt
    function setupTableUI() {
        pokerTable.innerHTML = ''; // Tøm gamle seter
         pokerTable.appendChild(dealerButtonElement); // Legg til knappen på nytt
         pokerTable.appendChild(potDisplaySpan.parentNode); // Legg til pot-display på nytt

        const positions = numPlayers === 9 ? positions9max : positions6max;
        const angleIncrement = 360 / numPlayers;
        const tableWidth = pokerTable.offsetWidth;
        const tableHeight = pokerTable.offsetHeight;
        const radiusX = tableWidth / 2 - 50; // Juster for setebredde/padding
        const radiusY = tableHeight / 2 - 60; // Juster for setehøyde/padding

        positions.forEach((pos, index) => {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat');
            seatDiv.dataset.seatId = index; // Bruker indeks som ID her

            const playerNameSpan = document.createElement('span');
            playerNameSpan.classList.add('player-name');
            playerNameSpan.textContent = `Spiller ${index+1}`;

            const positionSpan = document.createElement('span');
            positionSpan.classList.add('player-position');
            positionSpan.textContent = pos; // Dette vil bli oppdatert relativt til knappen

             const actionSpan = document.createElement('span');
             actionSpan.classList.add('player-action');
             actionSpan.textContent = ''; // Tom i starten

             const cardsDiv = document.createElement('div');
             cardsDiv.classList.add('player-cards');
             // Legg til kortplassholdere hvis du vil vise motstanderkort (ikke vanlig pre-flop)
             // const card1 = document.createElement('div'); card1.classList.add('card', 'card-back');
             // const card2 = document.createElement('div'); card2.classList.add('card', 'card-back');
             // cardsDiv.appendChild(card1); cardsDiv.appendChild(card2);


            seatDiv.appendChild(playerNameSpan);
            seatDiv.appendChild(positionSpan);
             seatDiv.appendChild(cardsDiv); // Tom kortvisning for motstandere
             seatDiv.appendChild(actionSpan);


            // Kalkuler posisjon (litt forenklet sirkulær layout)
            // Starter fra bunnen (index 0 = Hero) og går mot klokka
             let angle;
             if (numPlayers === 9) {
                  // Manuell justering for 9max for bedre visuell spredning
                  const angles9max = [270, 220, 180, 140, 90, 40, 0, 320, 290]; // Ca. vinkler i grader
                  angle = angles9max[index] * (Math.PI / 180); // Konverter til radianer
             } else { // 6max
                  const angles6max = [270, 190, 120, 60, 0, 300];
                  angle = angles6max[index] * (Math.PI / 180);
             }


            const x = (tableWidth / 2) + radiusX * Math.cos(angle) - 40; // Juster for halv bredde av sete
            const y = (tableHeight / 2) + radiusY * Math.sin(angle) - 50; // Juster for halv høyde av sete

            seatDiv.style.left = `${x}px`;
            seatDiv.style.top = `${y}px`;

            pokerTable.appendChild(seatDiv);
        });
         updatePlayerPositionsRelativeToButton(); // Kall etter seter er lagt til
    }

     // Oppdaterer posisjonsnavn basert på dealer button
     function updatePlayerPositionsRelativeToButton() {
         if (dealerPositionIndex < 0) return;

         const positions = numPlayers === 9 ? positions9max : positions6max;
         const seats = pokerTable.querySelectorAll('.seat');

         seats.forEach((seat, realIndex) => {
            const relativeIndex = (realIndex - dealerPositionIndex + numPlayers) % numPlayers;
            const positionName = positions[relativeIndex];
            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) {
                 positionSpan.textContent = positionName;
            }
            // Nullstill action for alle seter
             const actionSpan = seat.querySelector('.player-action');
             if(actionSpan) actionSpan.textContent = '';

             // Marker Hero
             const heroIndex = getHeroSeatIndex();
             if (realIndex === heroIndex) {
                 seat.classList.add('hero-seat');
                 heroPosition = positionName; // Oppdater global heroPosition
                 heroPositionSpan.textContent = heroPosition;
             } else {
                 seat.classList.remove('hero-seat');
             }
         });

         // Plasser dealer button
         const dealerSeat = seats[dealerPositionIndex];
         if (dealerSeat) {
              const dealerRect = dealerSeat.getBoundingClientRect();
              const tableRect = pokerTable.getBoundingClientRect();
              // Plasser knappen litt utenfor setet for synlighet
              // Juster disse verdiene for å få ønsket plassering
              dealerButtonElement.style.top = `${dealerSeat.offsetTop + dealerSeat.offsetHeight / 2 - 12}px`; // Sentrer vertikalt, litt opp
              dealerButtonElement.style.left = `${dealerSeat.offsetLeft + dealerSeat.offsetWidth + 5}px`; // Til høyre for setet
         }
     }

    // Finner setet som er Hero (kan forenkles hvis Hero alltid er sete 0)
    function getHeroSeatIndex() {
        // Antar at Hero alltid er i "nederste" sete, som vi gir indeks 0 i setupTableUI
        return 0;
    }

     // Konverterer kortnavn ('As') til Unicode-symbol
     function getCardSymbol(cardString) {
         if (!cardString) return '';
         const rank = cardString[0];
         const suit = cardString[1];
         let suitSymbol = '';
         switch (suit) {
             case 's': suitSymbol = '♠'; break;
             case 'h': suitSymbol = '♥'; break;
             case 'd': suitSymbol = '♦'; break;
             case 'c': suitSymbol = '♣'; break;
         }
          // Returnerer bare symbol for enkelhet, kan utvides til Rank + Symbol
         // return rank + suitSymbol;
          let displayRank = rank;
          if (rank === 'T') displayRank = '10'; // Vis 10 for Ten
          return displayRank + suitSymbol;
     }

     // Oppdaterer UI for Hero sine kort
     function displayHeroCards() {
          heroCardsContainer.innerHTML = ''; // Tøm gamle kort
          if (heroHand.length === 2) {
               heroHand.forEach(card => {
                   const cardDiv = document.createElement('div');
                   cardDiv.classList.add('card');
                   const cardTextSpan = document.createElement('span');
                   cardTextSpan.classList.add('card-text');
                   cardTextSpan.textContent = getCardSymbol(card);
                   if (['h', 'd'].includes(card[1])) {
                       cardTextSpan.classList.add('hearts'); // Eller 'diamonds'
                   } else {
                       cardTextSpan.classList.add('spades'); // Eller 'clubs'
                   }
                   cardDiv.appendChild(cardTextSpan);
                   // Fjern placeholder-klassen hvis vi viser ekte kort
                   cardDiv.classList.remove('card-placeholder');
                   heroCardsContainer.appendChild(cardDiv);
               });
          } else {
               // Vis placeholders hvis ingen kort er delt
               heroCardsContainer.innerHTML = `
                   <div class="card card-placeholder"></div>
                   <div class="card card-placeholder"></div>
               `;
          }
     }

      // Viser handlinger for spillere før Hero
      function displayPrecedingActions() {
          // Gå gjennom actionsPrecedingHero og oppdater UI for de relevante setene
          actionsPrecedingHero.forEach(actionInfo => {
              const seatIndex = (dealerPositionIndex + positions9max.indexOf(actionInfo.position) + numPlayers) % numPlayers; // Finn setets faktiske indeks
              const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${seatIndex}"]`);
              if (seatElement) {
                  const actionSpan = seatElement.querySelector('.player-action');
                  if(actionSpan) {
                     actionSpan.textContent = `${actionInfo.actionType} ${actionInfo.amount ? actionInfo.amount + ' BB' : ''}`;
                     // Style basert på action? F.eks. grønt for raise, blått for call, grått for fold?
                  }
              }
          });
      }

     // Håndterer hva som skjer når en ny hånd skal startes
     function setupNewHand() {
         feedbackText.textContent = '';
         correctActionText.textContent = '';
         rangeDisplayContainer.style.display = 'none'; // Skjul range
         potDisplaySpan.textContent = '0'; // Nullstill pot
         actionsPrecedingHero = []; // Nullstill handlinger

         currentDeck = shuffleDeck(createDeck());
         heroHand = [currentDeck.pop(), currentDeck.pop()]; // Del 2 kort til Hero

         const heroSeatIndex = getHeroSeatIndex(); // Hero er alltid på samme plass i UI

         if (trainingMode === 'standard') {
             // Roter knappen tilfeldig (eller sekvensielt)
             dealerPositionIndex = Math.floor(Math.random() * numPlayers);
             updatePlayerPositionsRelativeToButton(); // Finner Hero sin posisjon her
         } else { // Posisjonstrener
             heroPosition = fixedPosition; // Bruk valgt fast posisjon
             heroPositionSpan.textContent = heroPosition;
             // Finn knappens posisjon basert på Hero sin faste posisjon
             const positions = numPlayers === 9 ? positions9max : positions6max;
             const heroPosIndexInList = positions.indexOf(heroPosition);
              // Plasser knappen slik at Hero får ønsket posisjon
             dealerPositionIndex = (heroSeatIndex - heroPosIndexInList + numPlayers) % numPlayers;
             updatePlayerPositionsRelativeToButton();
         }

         // --- Scenario Logic (Forenklet V1) ---
         const randomScenario = Math.random();
         if (randomScenario < 0.6 || heroPosition === 'SB' || heroPosition === 'BB') { // 60% RFI, eller hvis i blinds
             currentScenario = 'RFI';
             potDisplaySpan.textContent = '1.5'; // Bare blinds
             // Sett blinds-actions visuelt (kan utvides)
             const sbSeat = pokerTable.querySelector(`.seat[data-seat-id="${(dealerPositionIndex + 1) % numPlayers}"]`);
             const bbSeat = pokerTable.querySelector(`.seat[data-seat-id="${(dealerPositionIndex + 2) % numPlayers}"]`);
              if(sbSeat) sbSeat.querySelector('.player-action').textContent = "Post 0.5 BB";
              if(bbSeat) bbSeat.querySelector('.player-action').textContent = "Post 1 BB";

         } else { // 40% vs RFI
             currentScenario = 'vs_UTG_RFI'; // Eksempel: Alltid UTG som høyner
              const positions = numPlayers === 9 ? positions9max : positions6max;
              const utgIndexInList = positions.indexOf("UTG"); // Finn UTGs relative posisjon
              const utgSeatIndex = (dealerPositionIndex + utgIndexInList) % numPlayers; // Finn UTGs faktiske seteindeks
              const utgSeat = pokerTable.querySelector(`.seat[data-seat-id="${utgSeatIndex}"]`);
              if(utgSeat) {
                 utgSeat.querySelector('.player-action').textContent = "Raise 3 BB"; // Eksempel raise size
                 actionsPrecedingHero.push({position: "UTG", actionType: "Raise", amount: 3});
              }
               potDisplaySpan.textContent = '4.5'; // 1.5 blinds + 3 BB raise

             // TODO: Logikk for å folde spillere mellom UTG og Hero
             // TODO: Mer avansert scenario-generering (hvem høyner, hvem syner etc.)
         }
         // ------------------------------------

         displayHeroCards(); // Vis Hero sine kort
         displayPrecedingActions(); // Vis handlinger som skjedde før Hero

         // Vis range *før* handling i trener-modus
         if (trainingMode === 'trainer') {
             const handKey = getHandKey(heroHand);
             if (handKey) {
                 displayRangeGridForSituation(stackDepth, numPlayers, heroPosition, currentScenario);
                 rangeDisplayContainer.style.display = 'block';
             }
         }
     }


     // Håndterer brukerens valg
     function handleUserAction(userActionCode) {
         const handKey = getHandKey(heroHand);
         if (!handKey) return; // Bør ikke skje

         const gtoActionObject = getGtoAction(stackDepth, numPlayers, heroPosition, currentScenario, handKey);
         const actions = Object.keys(gtoActionObject);
         const frequencies = Object.values(gtoActionObject);

         let feedback = '';
         let correctAction = '';
         let isCorrect = false;

         // Bestem primær GTO-handling (den med høyest frekvens)
         let primaryAction = 'F'; // Default til Fold
         let maxFreq = 0;
         for (const action in gtoActionObject) {
             if (gtoActionObject[action] > maxFreq) {
                 maxFreq = gtoActionObject[action];
                 primaryAction = action;
             }
         }

          // TODO: Raffiner denne logikken for å matche knapper/scenarier
          // Forenklet sjekk: Matcher brukerens handling *noen* GTO-handling?
          // For mer nøyaktighet: Matcher det primærhandlingen? Eller er det en gyldig mixed action?
          if (gtoActionObject[userActionCode] && gtoActionObject[userActionCode] > 0) {
             // Enkel sjekk: Hvis handlingen er *en del* av GTO-strategien
             isCorrect = true;
             feedback = "OK!"; // Eller mer detaljert basert på frekvens
          } else {
              isCorrect = false;
              feedback = "Feil!";
          }


         // Bygg streng for korrekt handling (inkludert mixed)
         correctAction = "Anbefalt: ";
         let actionStrings = [];
         for (let i = 0; i < actions.length; i++) {
             actionStrings.push(`${actions[i]} (${(frequencies[i] * 100).toFixed(0)}%)`);
         }
         correctAction += actionStrings.join(', ');


         feedbackText.textContent = feedback;
         correctActionText.textContent = correctAction;

         // Vis range grid i standard modus *etter* handling
         if (trainingMode === 'standard') {
             displayRangeGridForSituation(stackDepth, numPlayers, heroPosition, currentScenario);
             rangeDisplayContainer.style.display = 'block';
         }

         // Vent litt eller til knappetrykk før neste hånd? For nå: Krever knappetrykk
         // setupNewHand(); // Kan kalles her for automatisk ny hånd
     }

    // Viser range grid for gitt situasjon
     function displayRangeGridForSituation(stack, players, pos, scenario) {
         rangeGrid.innerHTML = ''; // Tøm grid
         const fullRange = getFullRange(stack, players, pos, scenario);
          if (!fullRange) {
               rangeGrid.textContent = "Range ikke funnet for denne situasjonen.";
               return;
          }

         const ranksRev = ranks.slice().reverse(); // A, K, Q... 2

         ranksRev.forEach(rank1 => {
             ranksRev.forEach(rank2 => {
                 const cell = document.createElement('div');
                 cell.classList.add('range-cell');

                 let handKey;
                 const index1 = ranksRev.indexOf(rank1);
                 const index2 = ranksRev.indexOf(rank2);

                 if (index1 === index2) { // Pair
                     handKey = rank1 + rank2;
                 } else if (index1 < index2) { // Suited (øvre triangel)
                     handKey = rank1 + rank2 + 's';
                 } else { // Offsuit (nedre triangel)
                     handKey = rank2 + rank1 + 'o';
                 }
                 cell.textContent = handKey.substring(0, 2); // Vis f.eks. AK, T9, 22

                 const gtoAction = fullRange[handKey] || { "F": 1.0 }; // Hent action, default Fold
                 const actions = Object.keys(gtoAction);
                 const frequencies = Object.values(gtoAction);

                 let tooltip = '';
                 let primaryAction = 'F';
                 let isMixed = false;

                 if (actions.length > 1) {
                     isMixed = true;
                     let actionStrings = [];
                     actions.forEach((act, i) => actionStrings.push(`${act}: ${(frequencies[i]*100).toFixed(0)}%`));
                     tooltip = actionStrings.join('\n');
                      // Finn primær handling for fargelegging
                     let maxFreq = 0;
                     actions.forEach((act, i) => {
                         if(frequencies[i] > maxFreq) {
                             maxFreq = frequencies[i];
                             primaryAction = act;
                         }
                     });

                 } else if (actions.length === 1) {
                     primaryAction = actions[0];
                     tooltip = `${primaryAction}: 100%`;
                 } else {
                     tooltip = "Fold: 100%"; // Bør ikke skje hvis default F er satt
                 }

                // Sett farge basert på primær handling (eller "mixed" hvis > 1 handling)
                 if (isMixed) {
                     cell.classList.add('range-mixed');
                 } else if (primaryAction === 'R' || primaryAction === '3B' || primaryAction === 'P') {
                     cell.classList.add('range-raise');
                 } else if (primaryAction === 'C') {
                     cell.classList.add('range-call');
                 } else { // Fold
                     cell.classList.add('range-fold');
                 }

                 // Legg til tooltip
                 const tooltipSpan = document.createElement('span');
                 tooltipSpan.classList.add('tooltiptext');
                 tooltipSpan.textContent = tooltip;
                 cell.appendChild(tooltipSpan);

                 rangeGrid.appendChild(cell);
             });
         });
     }


    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => {
        numPlayers = parseInt(e.target.value);
        setupTableUI();
         populatePositionSelect(); // Oppdater posisjonsvalg
        setupNewHand(); // Start ny hånd med nye innstillinger
    });

    stackDepthSelect.addEventListener('change', (e) => {
        stackDepth = e.target.value;
        setupNewHand();
    });

    trainingModeSelect.addEventListener('change', (e) => {
        trainingMode = e.target.value;
        if (trainingMode === 'trainer') {
            positionLabel.style.display = 'inline';
            positionSelect.style.display = 'inline';
            populatePositionSelect(); // Sørg for at den er fylt ut
            fixedPosition = positionSelect.value; // Sett startposisjon
        } else {
            positionLabel.style.display = 'none';
            positionSelect.style.display = 'none';
            fixedPosition = null;
        }
        setupNewHand();
    });

     positionSelect.addEventListener('change', (e) => {
          if (trainingMode === 'trainer') {
               fixedPosition = e.target.value;
               setupNewHand(); // Start ny hånd i valgt posisjon
          }
     });

    newHandBtn.addEventListener('click', setupNewHand);

    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            handleUserAction(e.target.dataset.action);
        });
    });

    // --- Initialisering ---
    setupTableUI(); // Sett opp bordet visuelt første gang
    populatePositionSelect(); // Fyll posisjonslisten
    setupNewHand(); // Del første hånd
});
