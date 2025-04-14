// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variabler & Tilstand ---
    let currentDeck = [];
    let heroHand = [];
    let currentHeroPositionName = ''; // Navnet på Hero sin nåværende posisjon
    let currentDealerPositionIndex = -1; // Faktisk indeks (0 til N-1) for knappen
    let currentScenario = 'RFI'; // 'RFI', 'vs RFI', etc.
    let actionsPrecedingHero = [];
    let numPlayers = 9;
    let currentStackDepth = '40bb';
    let currentTrainingMode = 'standard';
    let currentFixedPosition = null; // Kun for Posisjonstrener
    let currentPotSizeBB = 1.5; // Starter med blinds
    let firstActionPlayerIndex = -1; // Hvem starter bettingrunden

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
    const actionButtonsContainer = document.querySelector('.action-buttons'); // Container
    const feedbackText = document.getElementById('feedbackText');
    const correctActionText = document.getElementById('correctActionText');
    const rangeDisplayContainer = document.getElementById('rangeDisplayContainer');
    const rangeGrid = document.getElementById('rangeGrid');
    const potDisplaySpan = document.querySelector('.pot-display span');
    const dealerButtonElement = document.querySelector('.dealer-button');
    const scenarioDescription = document.getElementById('scenarioDescription');
    const rangeSituationInfo = document.getElementById('rangeSituationInfo');


    // --- Konstanter ---
    const suits = ['c', 'd', 'h', 's'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const positions9max = ["UTG", "UTG+1", "MP", "MP+1", "HJ", "CO", "BTN", "SB", "BB"];
    const positions6max = ["UTG", "MP", "CO", "BTN", "SB", "BB"]; // Standard 6-max rekkefølge
    const HERO_SEAT_INDEX = 0; // Visuell plassering av Hero (nederst)

    // --- Funksjoner ---

    function createDeck() { /* ... (samme som før) ... */
         const deck = [];
         for (const suit of suits) {
             for (const rank of ranks) {
                 deck.push(rank + suit);
             }
         }
         return deck;
    }

    function shuffleDeck(deck) { /* ... (samme som før) ... */
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
        }
        return deck;
    }

    function getHandKey(cards) { /* ... (samme som før) ... */
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
         if (highRank === lowRank) { return highRank + lowRank; }
         else { return highRank + lowRank + (suited ? 's' : 'o'); }
    }

    function getPositionName(index, numPlayers) { /* ... (samme som før) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        // Beregn posisjon relativt til KNAPPEN (index 0 = BTN, 1 = SB, 2 = BB osv i listen)
        // Vi må vite knappens posisjon for å gjøre dette riktig for *alle* seter
        if (currentDealerPositionIndex < 0) return "??"; // Knapp ikke satt

        const relativeIndex = (index - currentDealerPositionIndex + numPlayers) % numPlayers;
        const adjustedIndex = (relativeIndex + (numPlayers === 9 ? 6 : 3)) % numPlayers; // Juster så BTN er på riktig plass i *listene*

        return positions[adjustedIndex] || "??"; // Returner navn
    }

     function getActualSeatIndex(positionName, numPlayers) {
         if (currentDealerPositionIndex < 0) return -1;
         const positions = numPlayers === 9 ? positions9max : positions6max;
         const listIndex = positions.indexOf(positionName);
         if (listIndex === -1) return -1;

         // Juster basert på knappens posisjon i listene
         const btnIndexInList = positions.indexOf("BTN");
         const adjustedIndex = (listIndex - btnIndexInList + numPlayers) % numPlayers;

          // Returner den faktiske seteindeksen
         return (currentDealerPositionIndex + adjustedIndex) % numPlayers;
     }


    function populatePositionSelect() { /* ... (samme som før, men bruker riktig liste) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = '';
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        // Velg en fornuftig default, f.eks. CO eller BTN
        positionSelect.value = positions.includes("CO") ? "CO" : (positions.includes("BTN") ? "BTN" : positions[0]);
        currentFixedPosition = positionSelect.value;
    }

     // --- Forbedret Posisjonering ---
     function getSeatPosition(seatIndex, totalPlayers) {
         const angleOffset = -90; // Start nederst (270 grader)
         const angleIncrement = 360 / totalPlayers;
         const angle = angleOffset + seatIndex * angleIncrement;
         const angleRad = angle * (Math.PI / 180);

         // Juster radius basert på bordstørrelse (litt mindre enn halvparten)
         const radiusX = 45; // Prosent av bredde
         const radiusY = 42; // Prosent av høyde

         const left = 50 + radiusX * Math.cos(angleRad);
         const top = 50 + radiusY * Math.sin(angleRad);

         return { top: `${top}%`, left: `${left}%` };
     }

     function getButtonPosition(dealerSeatElement) {
        if (!dealerSeatElement) return { top: '50%', left: '50%' }; // Default senter
        const seatTop = dealerSeatElement.offsetTop;
        const seatLeft = dealerSeatElement.offsetLeft;
        const seatHeight = dealerSeatElement.offsetHeight;
        const seatWidth = dealerSeatElement.offsetWidth;

        // Plasser litt utenfor og mot midten av setet (juster etter smak)
        const top = seatTop + seatHeight / 2 - dealerButtonElement.offsetHeight / 2;
        const left = seatLeft + seatWidth + 5; // Litt til høyre for setet

        return { top: `${top}px`, left: `${left}px` };
     }
     // ----------------------------

    function setupTableUI() {
        pokerTable.innerHTML = ''; // Tøm gamle seter
        pokerTable.appendChild(dealerButtonElement);
        pokerTable.appendChild(potDisplaySpan.parentNode);

        for (let i = 0; i < numPlayers; i++) {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat');
            seatDiv.dataset.seatId = i; // Bruker faktisk indeks 0 til N-1

            const pos = getSeatPosition(i, numPlayers);
            seatDiv.style.left = pos.left;
            seatDiv.style.top = pos.top;

            // Legg til standard innhold (vil bli oppdatert av updatePlayerPositions)
            seatDiv.innerHTML = `
                <span class="player-name">Spiller ${i + 1}</span>
                <span class="player-position">--</span>
                <div class="player-cards"></div>
                <span class="player-action"></span>
            `;
            pokerTable.appendChild(seatDiv);
        }
        // updatePlayerPositionsRelativeToButton(); // Kalles fra setupNewHand når knapp er satt
    }

    function updatePlayerPositionsRelativeToButton() {
        if (currentDealerPositionIndex < 0) return;

        const positions = numPlayers === 9 ? positions9max : positions6max;
        const seats = pokerTable.querySelectorAll('.seat');
        let heroPosIndex = -1;

        seats.forEach((seat) => {
            const actualIndex = parseInt(seat.dataset.seatId);
            // Beregn posisjon relativt til KNAPPEN
            const relativeIndex = (actualIndex - currentDealerPositionIndex + numPlayers) % numPlayers;

            // Finn navnet i listene våre. BTN = siste element i arrayen før SB/BB
            let positionName = "??";
             if (numPlayers === 9) {
                  if (relativeIndex === (numPlayers - 3) % numPlayers) positionName = "CO";
                  else if (relativeIndex === (numPlayers - 2) % numPlayers) positionName = "BTN";
                  else if (relativeIndex === (numPlayers - 1) % numPlayers) positionName = "SB";
                  else if (relativeIndex === 0) positionName = "BB"; // BB er rett etter knappen i spillrekkefølge, men indeks 0 relativt til knappen
                  else if (relativeIndex === 1) positionName = "UTG";
                  else if (relativeIndex === 2) positionName = "UTG+1";
                  else if (relativeIndex === 3) positionName = "MP";
                  else if (relativeIndex === 4) positionName = "MP+1";
                  else if (relativeIndex === 5) positionName = "HJ";
             } else { // 6max
                  if (relativeIndex === (numPlayers - 3) % numPlayers) positionName = "CO";
                  else if (relativeIndex === (numPlayers - 2) % numPlayers) positionName = "BTN";
                  else if (relativeIndex === (numPlayers - 1) % numPlayers) positionName = "SB";
                  else if (relativeIndex === 0) positionName = "BB";
                  else if (relativeIndex === 1) positionName = "UTG";
                  else if (relativeIndex === 2) positionName = "MP";
             }


            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) {
                positionSpan.textContent = positionName;
            }
            // Nullstill action
            const actionSpan = seat.querySelector('.player-action');
             if(actionSpan) actionSpan.textContent = '';
            seat.classList.remove('hero-seat', 'action-on'); // Nullstill styling

            if (actualIndex === HERO_SEAT_INDEX) {
                seat.classList.add('hero-seat');
                currentHeroPositionName = positionName; // Oppdater global state
                heroPositionSpan.textContent = currentHeroPositionName;
                heroPosIndex = actualIndex;
            }
        });

        // Plasser dealer button ved siden av riktig sete
        const dealerSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if(dealerSeatElement) {
            const btnPos = getButtonPosition(dealerSeatElement);
            dealerButtonElement.style.top = btnPos.top;
            dealerButtonElement.style.left = btnPos.left;
        } else {
             // Skjul eller plasser default hvis dealer-setet ikke finnes
             dealerButtonElement.style.top = '50%';
             dealerButtonElement.style.left = '50%';
        }

         // Merk hvem som har handlingen (første etter BB som ikke har handlet)
          if (firstActionPlayerIndex !== -1) {
               const actionSeat = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
               if (actionSeat) actionSeat.classList.add('action-on');
          } else if (heroPosIndex !== -1) {
                // Hvis ingen handling før, og det er Hero sin tur
                const heroSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${heroPosIndex}"]`);
                if(heroSeatElement) heroSeatElement.classList.add('action-on');
          }
    }


    function getCardComponents(cardString) { /* ... (samme som før) ... */
         if (!cardString || cardString.length < 2) return { rank: '?', suit: '', suitClass: '' };
         const rank = cardString.slice(0, -1);
         const suitCode = cardString.slice(-1);
         let suitSymbol = '';
         let suitClass = '';
         switch (suitCode) {
             case 's': suitSymbol = '♠'; suitClass = 'spades'; break;
             case 'h': suitSymbol = '♥'; suitClass = 'hearts'; break;
             case 'd': suitSymbol = '♦'; suitClass = 'diamonds'; break;
             case 'c': suitSymbol = '♣'; suitClass = 'clubs'; break;
         }
         let displayRank = rank === 'T' ? '10' : rank;
         return { rank: displayRank, suit: suitSymbol, suitClass: suitClass };
    }


    function displayHeroCards() { /* ... (samme som før, bruker getCardComponents) ... */
         heroCardsContainer.innerHTML = '';
         if (heroHand.length === 2) {
             heroHand.forEach(card => {
                 const components = getCardComponents(card);
                 const cardDiv = document.createElement('div');
                 cardDiv.classList.add('card', components.suitClass);
                 cardDiv.innerHTML = `
                     <div class="card-rank card-top-left">
                         <div>${components.rank}</div>
                         <div>${components.suit}</div>
                     </div>
                     <div class="card-suit card-suit-center">${components.suit}</div>
                     <div class="card-rank card-bottom-right">
                         <div>${components.rank}</div>
                         <div>${components.suit}</div>
                     </div>
                 `;
                 heroCardsContainer.appendChild(cardDiv);
             });
         } else {
             heroCardsContainer.innerHTML = `
                 <div class="card card-placeholder"></div>
                 <div class="card card-placeholder"></div>`;
         }
    }

    function displayPrecedingActions() { /* ... (samme som før) ... */
        const seats = pokerTable.querySelectorAll('.seat');
         // Nullstill gamle handlinger først
         seats.forEach(seat => {
            const actionSpan = seat.querySelector('.player-action');
            if (actionSpan) actionSpan.textContent = '';
         });

        actionsPrecedingHero.forEach(actionInfo => {
             const seatIndex = getActualSeatIndex(actionInfo.position, numPlayers);
             const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${seatIndex}"]`);
             if (seatElement) {
                 const actionSpan = seatElement.querySelector('.player-action');
                 if(actionSpan) {
                     let actionText = '';
                     let actionClass = '';
                     switch (actionInfo.actionType.toUpperCase()) {
                         case 'FOLD': actionText = 'Fold'; actionClass = 'fold'; break;
                         case 'CALL': actionText = `Call ${actionInfo.amount} BB`; actionClass = 'call'; break;
                         case 'RAISE': actionText = `Raise ${actionInfo.amount} BB`; actionClass = 'raise'; break;
                         case 'PUSH': actionText = `Push ${actionInfo.amount} BB`; actionClass = 'push'; break;
                         case 'POST_SB': actionText = `Post 0.5 BB`; actionClass = ''; break; // Ingen spesiell farge
                         case 'POST_BB': actionText = `Post 1 BB`; actionClass = ''; break; // Ingen spesiell farge
                         default: actionText = actionInfo.actionType; // Fallback
                     }
                     actionSpan.textContent = actionText;
                     actionSpan.className = 'player-action'; // Reset classes
                     if (actionClass) actionSpan.classList.add(actionClass);
                 }
             }
         });
    }

     // Styrer hvilke knapper som er aktive
     function updateActionButtons() {
         const buttons = actionButtonsContainer.querySelectorAll('button');
         buttons.forEach(btn => btn.disabled = true); // Deaktiver alle først

         if (currentScenario === 'RFI') {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
             if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false; // Tillat push short
             }
         } else if (currentScenario.startsWith('vs_')) { // vs RFI, vs 3bet etc.
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="C"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false; // Antar 3bet som "høyne" i denne konteksten
              if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
             }
             // TODO: Deaktiver call hvis det ikke er noen raise før etc. Mer logikk trengs.
         }
          // TODO: Mer avansert logikk for å deaktivere/aktivere basert på spesifikt scenario
     }


    function setupNewHand() {
        feedbackText.textContent = '';
        correctActionText.textContent = '';
        rangeDisplayContainer.style.display = 'none';
        currentDeck = shuffleDeck(createDeck());
        heroHand = [currentDeck.pop(), currentDeck.pop()];
        actionsPrecedingHero = [];
        currentPotSizeBB = 1.5; // Reset pot (SB + BB)
        firstActionPlayerIndex = -1; // Reset first actor

        // --- Sett Knappen (Dealer Position) ---
        if (currentTrainingMode === 'standard') {
            // Roter knappen tilfeldig
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
        } else { // Posisjonstrener
            const positions = numPlayers === 9 ? positions9max : positions6max;
            const heroTargetPosIndex = positions.indexOf(currentFixedPosition);
             // BTN er siste i "handlingsrekkefølge" før blinds, men indeks 6 (9max) / 3 (6max) i listene våre
            const btnIndexInList = positions.indexOf("BTN"); // 6 for 9max, 3 for 6max
            // Beregn hvor knappen må være for at Hero (sete 0) skal få *sin* posisjon
            // (SeteIndex - DealerIndex + AntSpillere) % AntSpillere = RelativPosisjonsIndeks
            // For å få Hero (0) til å ha targetPosIndex relativt til knapp, trenger vi dealerIndex slik at:
            // (0 - dealerIndex + numPlayers) % numPlayers = targetRelIndex
            // Vi må finne targetRelIndex basert på listene:
            let targetRelIndex = (heroTargetPosIndex - btnIndexInList + numPlayers) % numPlayers;


            currentDealerPositionIndex = (HERO_SEAT_INDEX - targetRelIndex + numPlayers) % numPlayers;

        }
         //-----------------------------------------

          // --- Scenario Oppsett (Forenklet V1) ---
          scenarioDescription.textContent = ''; // Tøm gammel beskrivelse
          const positions = numPlayers === 9 ? positions9max : positions6max;
          currentHeroPositionName = getPositionName(HERO_SEAT_INDEX, numPlayers); // Finn Hero sin posisjon *etter* knapp er satt
          heroPositionSpan.textContent = currentHeroPositionName;

         // Finn SB og BB seter
          const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers;
          const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;

         // Post blinds (visuelt og logisk)
          actionsPrecedingHero.push({ position: getPositionName(sbSeatIndex, numPlayers), actionType: "POST_SB", amount: 0.5 });
          actionsPrecedingHero.push({ position: getPositionName(bbSeatIndex, numPlayers), actionType: "POST_BB", amount: 1 });
          currentPotSizeBB = 1.5;

          // Bestem scenario: RFI eller vs RFI (forenklet 50/50 for test)
          // Kun spillere før Hero kan ha handlet
          const heroListIndex = positions.indexOf(currentHeroPositionName);
          const randomScenarioChoice = Math.random();
          let raiserPosition = null;
          let raiserSeatIndex = -1;

          if (randomScenarioChoice < 0.5 && !['SB', 'BB', 'UTG'].includes(currentHeroPositionName)) { // Scenario: vs RFI
              // Velg en tilfeldig posisjon FØR hero til å høyne
              const possibleRaisers = [];
              for (let i = 0; i < heroListIndex; i++) {
                   // Vi hopper over SB/BB for RFI her for enkelhets skyld
                   if (!['SB', 'BB'].includes(positions[i])) {
                        possibleRaisers.push(positions[i]);
                   }
              }

              if (possibleRaisers.length > 0) {
                  const raiserIndexInPossible = Math.floor(Math.random() * possibleRaisers.length);
                  raiserPosition = possibleRaisers[raiserIndexInPossible];
                  raiserSeatIndex = getActualSeatIndex(raiserPosition, numPlayers);

                   // Anta en standard raise size (f.eks. 2.5x eller 3x)
                   let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3); // Litt variasjon
                   actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount });
                   currentPotSizeBB += raiseAmount; // Legg raisen til potten
                   currentScenario = `vs_${raiserPosition}_RFI`;
                   scenarioDescription.textContent = `${raiserPosition} høyner til ${raiseAmount} BB. Din tur.`;

                  // Anta at alle mellom raiser og hero kaster (forenkling!)
                  const raiserListIndex = positions.indexOf(raiserPosition);
                   for(let i = raiserListIndex + 1; i < heroListIndex; i++) {
                        actionsPrecedingHero.push({position: positions[i], actionType: "Fold"});
                   }
                     // Hvem er neste til å handle? Hero.
                     firstActionPlayerIndex = HERO_SEAT_INDEX;

              } else { // Ingen før Hero kan RFI, så det blir RFI for Hero
                  currentScenario = 'RFI';
                   scenarioDescription.textContent = `Det foldes til deg. Din tur.`;
                    firstActionPlayerIndex = HERO_SEAT_INDEX;
              }

          } else { // Scenario: RFI
              currentScenario = 'RFI';
               scenarioDescription.textContent = `Det foldes til deg. Din tur.`;
               // Anta at alle før Hero har foldet
               for(let i = 0; i < heroListIndex; i++) {
                  // Vi hopper over SB/BB som poster blinds
                  if (!['SB', 'BB'].includes(positions[i])) {
                     actionsPrecedingHero.push({position: positions[i], actionType: "Fold"});
                   }
               }
                firstActionPlayerIndex = HERO_SEAT_INDEX;
          }
          // ------------------------------------

          updatePlayerPositionsRelativeToButton(); // Oppdater alle labels/styling
          displayHeroCards();
          displayPrecedingActions();
          potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
          updateActionButtons();

          // Vis range *før* handling i trener-modus
          if (currentTrainingMode === 'trainer') {
              const handKey = getHandKey(heroHand);
              if (handKey) {
                  displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
                  rangeDisplayContainer.style.display = 'block';
              }
          } else {
              rangeDisplayContainer.style.display = 'none'; // Skjul i standard modus
          }
    }


    function handleUserAction(userActionCode) { /* ... (samme som før, men med bedre feedback) ... */
        const handKey = getHandKey(heroHand);
        if (!handKey) return;

        const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey);
        const actions = Object.keys(gtoActionObject);
        const frequencies = Object.values(gtoActionObject);

        let feedback = '';
        let correctAction = '';
        let isCorrect = false;
         let primaryAction = 'F'; // Default
         let primaryFreq = 0;

          if (actions.length > 0) {
               actions.forEach((act, i) => {
                   if (frequencies[i] > primaryFreq) {
                       primaryFreq = frequencies[i];
                       primaryAction = act;
                   }
               });
          }


        // Mer presis sjekk
        if (gtoActionObject[userActionCode] && gtoActionObject[userActionCode] > 0) {
            if(userActionCode === primaryAction && gtoActionObject[userActionCode] > 0.6) { // Hovedsaklig korrekt
                 feedback = "Korrekt!";
                 feedbackText.className = 'correct';
                 isCorrect = true;
            } else { // Gyldig mixed action, men kanskje ikke den vanligste
                 feedback = "OK (Mixed Strategi)";
                 feedbackText.className = 'correct'; // Fortsatt "korrekt" i GTO-forstand
                 isCorrect = true;
            }
        } else {
            feedback = "Feil!";
            feedbackText.className = 'incorrect';
            isCorrect = false;
        }

         // Bygg streng for korrekt handling
         correctAction = "Anbefalt GTO: ";
         let actionStrings = [];
         actions.forEach((act, i) => actionStrings.push(`${act} (${(frequencies[i] * 100).toFixed(0)}%)`));
         correctAction += actionStrings.join(', ');
         // Hvis brukeren tok feil, vis den anbefalte handlingen tydeligere
         if (!isCorrect) {
             correctAction += ` (Primær: ${primaryAction})`;
         }


        feedbackText.textContent = feedback;
        correctActionText.textContent = correctAction;

         // Vis range grid i standard modus eller hvis feil i trener modus
        if (currentTrainingMode === 'standard' || (currentTrainingMode === 'trainer' && !isCorrect)) {
            displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
            rangeDisplayContainer.style.display = 'block';
        }
    }

    function displayRangeGridForSituation(stack, players, pos, scenario) { /* ... (samme som før) ... */
         rangeGrid.innerHTML = '';
         const fullRange = getFullRange(stack, players, pos, scenario);
         rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} ${scenario}`; // Info til brukeren

          if (!fullRange || Object.keys(fullRange).length === 0) {
              rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center;">Range ikke funnet for ${pos} i scenario ${scenario} (${stack}, ${players}max).</p>`;
              return;
          }

         const ranksRev = ranks.slice().reverse();
         ranksRev.forEach(rank1 => {
             ranksRev.forEach(rank2 => {
                 const cell = document.createElement('div');
                 cell.classList.add('range-cell');
                 let handKey;
                 const index1 = ranksRev.indexOf(rank1);
                 const index2 = ranksRev.indexOf(rank2);

                 if (index1 === index2) { handKey = rank1 + rank2; }
                 else if (index1 < index2) { handKey = rank1 + rank2 + 's'; }
                 else { handKey = rank2 + rank1 + 'o'; }

                 cell.textContent = handKey.substring(0, handKey.length > 2 && !handKey.endsWith('o') && !handKey.endsWith('s') ? 2 : (rank1 === rank2 ? 2 : (handKey.includes('s') || handKey.includes('o') ? 2 : 2) )); // Viser f.eks AK, TT, T9


                 const gtoAction = fullRange[handKey] || { "F": 1.0 };
                 const actions = Object.keys(gtoAction);
                 const frequencies = Object.values(gtoAction);
                 let tooltip = '';
                 let primaryAction = 'F';
                 let isMixed = false;
                  let primaryFreq = 0;

                 if (actions.length > 0) {
                     actions.forEach((act, i) => {
                         if (frequencies[i] > primaryFreq) {
                             primaryFreq = frequencies[i];
                             primaryAction = act;
                         }
                     });
                 }

                 if (actions.length > 1) {
                     isMixed = true;
                     let actionStrings = [];
                      actions.forEach((act, i) => actionStrings.push(`${act}: ${(frequencies[i] * 100).toFixed(0)}%`));
                     tooltip = actionStrings.join('\n');
                 } else if (actions.length === 1) {
                     tooltip = `${primaryAction}: 100%`;
                 } else {
                     tooltip = "Fold: 100%";
                 }

                  if (isMixed) { cell.classList.add('range-mixed'); }
                  else if (['R', '3B', 'P'].includes(primaryAction)) { cell.classList.add('range-raise'); }
                  else if (primaryAction === 'C') { cell.classList.add('range-call'); }
                  else { cell.classList.add('range-fold'); }

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
        setupTableUI(); // Lag nye seter
        populatePositionSelect(); // Oppdater posisjonsvalg
        setupNewHand();
    });

    stackDepthSelect.addEventListener('change', (e) => {
        currentStackDepth = e.target.value;
        setupNewHand();
    });

    trainingModeSelect.addEventListener('change', (e) => {
        currentTrainingMode = e.target.value;
        if (currentTrainingMode === 'trainer') {
            positionLabel.style.display = 'inline';
            positionSelect.style.display = 'inline';
            populatePositionSelect();
            currentFixedPosition = positionSelect.value;
        } else {
            positionLabel.style.display = 'none';
            positionSelect.style.display = 'none';
            currentFixedPosition = null;
        }
        setupNewHand();
    });

     positionSelect.addEventListener('change', (e) => {
          if (currentTrainingMode === 'trainer') {
               currentFixedPosition = e.target.value;
               setupNewHand();
          }
     });

    newHandBtn.addEventListener('click', setupNewHand);

    actionButtonsContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            handleUserAction(e.target.dataset.action);
        });
    });

    // --- Initialisering ---
    setupTableUI();
    populatePositionSelect();
    setupNewHand();
});
