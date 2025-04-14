// script.js (Versjon 4 - Rettet "getPositionName is not defined"-feil)

document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variabler & Tilstand ---
    let currentDeck = [];
    let heroHand = [];
    let currentHeroPositionName = '';
    let currentDealerPositionIndex = -1;
    let currentScenario = 'RFI';
    let currentScenarioDescription = '';
    let actionsPrecedingHero = [];
    let numPlayers = 9;
    let currentStackDepth = '40bb';
    let currentTrainingMode = 'standard';
    let currentFixedPosition = null;
    let currentPotSizeBB = 1.5;
    let firstActionPlayerIndex = -1;

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
    const actionButtonsContainer = document.querySelector('.action-buttons');
    const feedbackText = document.getElementById('feedbackText');
    const correctActionText = document.getElementById('correctActionText');
    const rangeDisplayContainer = document.getElementById('rangeDisplayContainer');
    const rangeGrid = document.getElementById('rangeGrid');
    const potDisplaySpan = document.querySelector('.pot-display span');
    const dealerButtonElement = document.querySelector('.dealer-button');
    const scenarioDescriptionElement = document.getElementById('scenarioDescription');
    const rangeSituationInfo = document.getElementById('rangeSituationInfo');


    // --- Konstanter ---
    const suits = ['c', 'd', 'h', 's'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const positions9max = ["UTG", "UTG+1", "MP", "MP+1", "HJ", "CO", "BTN", "SB", "BB"];
    const positions6max = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
    const HERO_SEAT_INDEX = 0;

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
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function getHandKey(cards) {
         if (!cards || cards.length !== 2) return null;
         const card1Rank = cards[0][0];
         const card1Suit = cards[0][1];
         const card2Rank = cards[1][0];
         const card2Suit = cards[1][1];
         const rankOrder = ranks.slice().reverse();
         const rank1Index = rankOrder.indexOf(card1Rank);
         const rank2Index = rankOrder.indexOf(card2Rank);
         const highRank = rank1Index < rank2Index ? card1Rank : card2Rank;
         const lowRank = rank1Index < rank2Index ? card2Rank : card1Rank;
         const suited = card1Suit === card2Suit;
         if (highRank === lowRank) { return highRank + lowRank; }
         else { return highRank + lowRank + (suited ? 's' : 'o'); }
    }

    // Kalkulerer posisjonsnavn basert på seteindeks og knappindeks
    function calculatePositionName(seatIndex, dealerIndex, numPlayers) {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions) return "??"; // Sikkerhetssjekk

        const relativeIndex = (seatIndex - dealerIndex + numPlayers) % numPlayers;

        // Juster for å matche standard rekkefølge (BTN er nest sist i array før SB/BB)
        let btnListIndex;
        if (numPlayers === 9) btnListIndex = 6; // BTN er index 6 i positions9max
        else btnListIndex = 3; // BTN er index 3 i positions6max

        const adjustedListIndex = (relativeIndex + btnListIndex) % numPlayers;

        return positions[adjustedListIndex] || "??"; // Returner navn
    }

     // Finner setets indeks gitt posisjonsnavn
     function getActualSeatIndex(positionName, dealerIndex, numPlayers) {
         if (dealerIndex < 0) return -1;
         const positions = numPlayers === 9 ? positions9max : positions6max;
         const listIndex = positions.indexOf(positionName);
         if (listIndex === -1) return -1;

          const btnListIndex = positions.indexOf("BTN");
          // Hvor mange steg fra BTN (i listen) er posisjonen vi leter etter?
          const stepsFromBtn = (listIndex - btnListIndex + numPlayers) % numPlayers;

         // Returner den faktiske seteindeksen
         return (dealerIndex + stepsFromBtn) % numPlayers;
     }


    function populatePositionSelect() {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = '';
        const trainablePositions = positions.filter(p => !['SB', 'BB'].includes(p));
        trainablePositions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        positionSelect.value = trainablePositions.includes("CO") ? "CO" : (trainablePositions.includes("BTN") ? "BTN" : trainablePositions[0]);
        currentFixedPosition = positionSelect.value;
    }

    function getSeatPosition(seatIndex, totalPlayers) {
         const angleOffset = -90;
         const angleIncrement = 360 / totalPlayers;
         const angle = angleOffset + seatIndex * angleIncrement;
         const angleRad = angle * (Math.PI / 180);
         const radiusX = 45;
         const radiusY = 42;
         const left = 50 + radiusX * Math.cos(angleRad);
         const top = 50 + radiusY * Math.sin(angleRad);
         return { top: `${top}%`, left: `${left}%` };
    }

     function getButtonPosition(dealerSeatElement) {
        if (!dealerSeatElement) return { top: '50%', left: '50%' };
        const seatTop = dealerSeatElement.offsetTop;
        const seatLeft = dealerSeatElement.offsetLeft;
        const seatHeight = dealerSeatElement.offsetHeight;
        const seatWidth = dealerSeatElement.offsetWidth;
        const top = seatTop + seatHeight / 2 - dealerButtonElement.offsetHeight / 2;
        // Juster knappens horisontale posisjon basert på setets side
        let left = seatLeft + seatWidth + 5; // Default til høyre
         if (seatLeft > pokerTable.offsetWidth / 2) { // Hvis setet er på høyre side
              left = seatLeft - dealerButtonElement.offsetWidth - 5; // Plasser til venstre
         }

        return { top: `${top}px`, left: `${left}px` };
     }

    function setupTableUI() {
        pokerTable.innerHTML = '';
        pokerTable.appendChild(dealerButtonElement);
        pokerTable.appendChild(potDisplaySpan.parentNode);
        for (let i = 0; i < numPlayers; i++) {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat');
            seatDiv.dataset.seatId = i;
            const pos = getSeatPosition(i, numPlayers);
            seatDiv.style.left = pos.left;
            seatDiv.style.top = pos.top;
            seatDiv.innerHTML = `
                <span class="player-name">Spiller ${i + 1}</span>
                <span class="player-position">--</span>
                <div class="player-cards"></div>
                <span class="player-action"></span>`;
            pokerTable.appendChild(seatDiv);
        }
    }

    function updatePlayerPositionsRelativeToButton() {
        if (currentDealerPositionIndex < 0) {
            console.error("Dealer position not set");
            return;
        };

        const seats = pokerTable.querySelectorAll('.seat');
        let heroActualPosition = "??";

        seats.forEach((seat) => {
            const actualIndex = parseInt(seat.dataset.seatId);
            const positionName = calculatePositionName(actualIndex, currentDealerPositionIndex, numPlayers); // BRUK KORRIGERT FUNKSJON

            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) {
                positionSpan.textContent = positionName;
            }
            const actionSpan = seat.querySelector('.player-action');
            if(actionSpan) actionSpan.textContent = '';
            seat.classList.remove('hero-seat', 'action-on');

            if (actualIndex === HERO_SEAT_INDEX) {
                seat.classList.add('hero-seat');
                heroActualPosition = positionName;
            }
        });

         currentHeroPositionName = heroActualPosition; // Oppdater global state
         heroPositionSpan.textContent = currentHeroPositionName;


        const dealerSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if(dealerSeatElement) {
            const btnPos = getButtonPosition(dealerSeatElement);
            dealerButtonElement.style.top = btnPos.top;
            dealerButtonElement.style.left = btnPos.left;
        }

          if (firstActionPlayerIndex !== -1) {
               const actionSeat = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
               if (actionSeat) actionSeat.classList.add('action-on');
          } else if (HERO_SEAT_INDEX !== -1 && currentHeroPositionName !== '??') {
                const heroSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${HERO_SEAT_INDEX}"]`);
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


    function displayHeroCards() { /* ... (samme som før) ... */
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
                     </div>`;
                 heroCardsContainer.appendChild(cardDiv);
             });
         } else {
             heroCardsContainer.innerHTML = `
                 <div class="card card-placeholder"></div>
                 <div class="card card-placeholder"></div>`;
         }
    }

    function displayPrecedingActions() {
        const seats = pokerTable.querySelectorAll('.seat');
        seats.forEach(seat => {
             const actionSpan = seat.querySelector('.player-action');
             if (actionSpan) actionSpan.textContent = '';
             if (parseInt(seat.dataset.seatId) === HERO_SEAT_INDEX) {
                 seat.classList.remove('action-on');
             }
        });

        actionsPrecedingHero.forEach(actionInfo => {
             // BRUK KORRIGERT FUNKSJON her også
             const seatIndex = getActualSeatIndex(actionInfo.position, currentDealerPositionIndex, numPlayers);
             if (seatIndex === -1) {
                 console.warn(`Could not find seat index for position ${actionInfo.position} in displayPrecedingActions`);
                 return;
             }
             const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${seatIndex}"]`);
             if (seatElement) {
                 const actionSpan = seatElement.querySelector('.player-action');
                 if(actionSpan) {
                     let actionText = ''; let actionClass = '';
                     switch (actionInfo.actionType.toUpperCase()) {
                         case 'FOLD': actionText = 'Fold'; actionClass = 'fold'; break;
                         case 'CALL': actionText = `Call ${actionInfo.amount} BB`; actionClass = 'call'; break;
                         case 'RAISE': actionText = `Raise ${actionInfo.amount} BB`; actionClass = 'raise'; break;
                         case 'PUSH': actionText = `Push ${actionInfo.amount} BB`; actionClass = 'push'; break;
                         case 'POST_SB': actionText = `Post 0.5 BB`; actionClass = ''; break;
                         case 'POST_BB': actionText = `Post 1 BB`; actionClass = ''; break;
                         default: actionText = actionInfo.actionType;
                     }
                     actionSpan.textContent = actionText;
                     actionSpan.className = 'player-action';
                     if (actionClass) actionSpan.classList.add(actionClass);
                 }
             }
         });
    }

     function updateActionButtons() { /* ... (samme som før) ... */
         const buttons = actionButtonsContainer.querySelectorAll('button');
         buttons.forEach(btn => btn.disabled = true);

         if (currentScenario === 'RFI') {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
             if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
             }
         } else if (currentScenario.startsWith('vs_')) {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="C"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false;
              if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
             }
         }
     }

    // MER ROBUST setupNewHand
    function setupNewHand() {
        console.log("--- Starting setupNewHand ---"); // Debug log
        // 1. Nullstill state
        feedbackText.textContent = ''; feedbackText.className = '';
        correctActionText.textContent = '';
        rangeDisplayContainer.style.display = 'none'; rangeGrid.innerHTML = '';
        currentDeck = shuffleDeck(createDeck());
        heroHand = [currentDeck.pop(), currentDeck.pop()];
        actionsPrecedingHero = []; currentPotSizeBB = 1.5;
        firstActionPlayerIndex = -1; currentScenario = 'RFI';
        currentScenarioDescription = ''; currentHeroPositionName = '';

        pokerTable.querySelectorAll('.seat').forEach(seat => {
            seat.classList.remove('action-on');
            const actionSpan = seat.querySelector('.player-action');
            if(actionSpan) actionSpan.textContent = '';
        });

        // 2. Sett Knappen
        if (currentTrainingMode === 'standard') {
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
             console.log(`Standard mode: Dealer set to index ${currentDealerPositionIndex}`);
        } else {
            const positions = numPlayers === 9 ? positions9max : positions6max;
            const heroTargetPos = currentFixedPosition || (numPlayers === 9 ? "BTN" : "BTN"); // Fallback
            const heroTargetPosIndex = positions.indexOf(heroTargetPos);
            if (heroTargetPosIndex === -1) {
                console.error(`Invalid fixed position: ${heroTargetPos}`);
                currentFixedPosition = "BTN"; positionSelect.value = currentFixedPosition;
                heroTargetPosIndex = positions.indexOf(currentFixedPosition);
            }
            const btnListIndex = positions.indexOf("BTN");
            let targetRelIndex = (heroTargetPosIndex - btnListIndex + numPlayers) % numPlayers;
            currentDealerPositionIndex = (HERO_SEAT_INDEX - targetRelIndex + numPlayers) % numPlayers;
             console.log(`Trainer mode: Target ${heroTargetPos}. Dealer set to index ${currentDealerPositionIndex}`);
        }

        // 3. Oppdater posisjoner
        updatePlayerPositionsRelativeToButton(); // Setter currentHeroPositionName
        if (!currentHeroPositionName || currentHeroPositionName === '??') {
             console.error("Could not determine Hero Position after update!");
             alert("Feil ved posisjonsberegning. Prøv igjen."); return;
        }
         console.log(`Hero position calculated as: ${currentHeroPositionName}`);


        // 4. Generer Scenario
        const positions = numPlayers === 9 ? positions9max : positions6max;
        const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers;
        const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
        // BRUK calculatePositionName for å få korrekte posisjonsnavn for blinds
        const sbPos = calculatePositionName(sbSeatIndex, currentDealerPositionIndex, numPlayers);
        const bbPos = calculatePositionName(bbSeatIndex, currentDealerPositionIndex, numPlayers);

        actionsPrecedingHero.push({ position: sbPos, actionType: "POST_SB", amount: 0.5 });
        actionsPrecedingHero.push({ position: bbPos, actionType: "POST_BB", amount: 1 });

        const randomScenarioChoice = Math.random();
        let scenarioGenerated = false;
         let potentialScenario = 'RFI'; // Start med RFI

        if (randomScenarioChoice >= 0.5 && !['SB', 'BB', 'UTG'].includes(currentHeroPositionName)) {
            const heroListIndex = positions.indexOf(currentHeroPositionName);
            const possibleRaiserPositions = [];
            for (let i = 0; i < heroListIndex; i++) {
                if (!['SB', 'BB'].includes(positions[i])) {
                    possibleRaiserPositions.push(positions[i]);
                }
            }

            if (possibleRaiserPositions.length > 0) {
                const raiserPosition = possibleRaiserPositions[Math.floor(Math.random() * possibleRaiserPositions.length)];
                potentialScenario = `vs_${raiserPosition}_RFI`;
                const rangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[potentialScenario];

                if (rangeExists) {
                    currentScenario = potentialScenario;
                    let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3);
                    actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount });
                    currentPotSizeBB += raiseAmount;
                    currentScenarioDescription = `${raiserPosition} høyner til ${raiseAmount} BB. Din tur.`;
                    const raiserListIndex = positions.indexOf(raiserPosition);
                    for(let i = raiserListIndex + 1; i < heroListIndex; i++) {
                         const foldPosName = positions[i];
                         if (!['SB', 'BB'].includes(foldPosName)) {
                              actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" });
                         }
                    }
                    firstActionPlayerIndex = HERO_SEAT_INDEX;
                    scenarioGenerated = true;
                     console.log(`Scenario set to: ${currentScenario}`);
                 } else {
                      console.warn(`Mangler range for ${potentialScenario} for ${currentHeroPositionName}. Faller tilbake til RFI.`);
                 }
            }
        }

        if (!scenarioGenerated) {
            currentScenario = 'RFI';
            currentScenarioDescription = `Det foldes til deg. Din tur.`;
             const heroListIndex = positions.indexOf(currentHeroPositionName);
             const bbListIndex = positions.indexOf("BB");
             // Finner første spiller *etter* BB
             let firstPotentialActorIndex = (getActualSeatIndex("BB", currentDealerPositionIndex, numPlayers) + 1) % numPlayers;

             // Gå gjennom seter fra første etter BB opp til Hero
             let currentSeatIndex = firstPotentialActorIndex;
             while(currentSeatIndex !== HERO_SEAT_INDEX) {
                  const posName = calculatePositionName(currentSeatIndex, currentDealerPositionIndex, numPlayers);
                   if (!['SB', 'BB'].includes(posName)) { // Legg til fold for alle unntatt blinds
                        actionsPrecedingHero.push({ position: posName, actionType: "Fold" });
                   }
                  currentSeatIndex = (currentSeatIndex + 1) % numPlayers;
                   if (currentSeatIndex === firstPotentialActorIndex) break; // Unngå evig loop
             }
              firstActionPlayerIndex = HERO_SEAT_INDEX;
              console.log(`Scenario set to: ${currentScenario}`);
        }

        // Siste sjekk for range eksistens
        const finalRangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[currentScenario];
        if (!finalRangeExists) {
             console.error(`FATAL: Range data missing for final scenario: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}`);
             feedbackText.textContent = "Feil: Mangler range data. Prøv 'Ny Hånd'.";
             correctActionText.textContent = `Mangler: ${currentStackDepth} ${numPlayers}max ${currentHeroPositionName} ${currentScenario}`;
             actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
             return;
        }

        // 5. Oppdater UI
        scenarioDescriptionElement.textContent = currentScenarioDescription;
        updatePlayerPositionsRelativeToButton(); // Kalles igjen for å markere hvem som har tur
        displayHeroCards();
        displayPrecedingActions();
        potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
        updateActionButtons();

        // 6. Vis Range i Trener-modus
        if (currentTrainingMode === 'trainer') {
            const handKey = getHandKey(heroHand);
            if (handKey) {
                displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
            }
        } else {
            rangeDisplayContainer.style.display = 'none';
        }
         console.log("--- setupNewHand Finished ---"); // Debug log
    }

    // handleUserAction og displayRangeGridForSituation forblir som i V3/forrige svar
    function handleUserAction(userActionCode) { /* ... (samme som V3) ... */
         const handKey = getHandKey(heroHand);
         if (!handKey || !currentHeroPositionName || currentHeroPositionName === '??') {
              console.error("Kan ikke håndtere handling - ugyldig state", heroHand, currentHeroPositionName);
              return;
         }

         console.log(`Handling for: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}, Hånd: ${handKey}, BrukerValg: ${userActionCode}`);

         const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey);
         if (!gtoActionObject || Object.keys(gtoActionObject).length === 0) {
              console.error("Klarte ikke hente GTO action objekt.");
              feedbackText.textContent = "Feil: Kunne ikke finne GTO data.";
              correctActionText.textContent = "";
              feedbackText.className = 'incorrect';
              return;
         }

         const actions = Object.keys(gtoActionObject);
         const frequencies = Object.values(gtoActionObject);
         let feedback = '';
         let correctAction = '';
         let isCorrect = false;
         let primaryAction = 'F';
         let primaryFreq = 0;

          if (actions.length > 0) {
               actions.forEach((act, i) => {
                   if (frequencies[i] > primaryFreq) {
                       primaryFreq = frequencies[i];
                       primaryAction = act;
                   }
               });
          }

         let normalizedUserAction = userActionCode;
         if (currentScenario === 'RFI' && userActionCode === '3B') { normalizedUserAction = 'R'; console.log("Tolket '3B' som 'R' i RFI"); }
         else if (currentScenario.startsWith('vs_') && userActionCode === 'R') { normalizedUserAction = '3B'; console.log("Tolket 'Raise' som '3B' i vs RFI"); }
         if (currentStackDepth === '10bb' && (normalizedUserAction === 'R' || normalizedUserAction === '3B')) { normalizedUserAction = 'P'; console.log("Tolket 'Raise/3B' som 'Push' ved 10bb"); }

         if (gtoActionObject[normalizedUserAction] && gtoActionObject[normalizedUserAction] > 0) {
             if(normalizedUserAction === primaryAction && gtoActionObject[normalizedUserAction] > 0.7) {
                  feedback = "Korrekt!"; feedbackText.className = 'correct'; isCorrect = true;
             } else {
                  feedback = "OK (Mixed Strategi)"; feedbackText.className = 'correct'; isCorrect = true;
             }
         } else {
             feedback = "Feil!"; feedbackText.className = 'incorrect'; isCorrect = false;
         }

         correctAction = "Anbefalt GTO: ";
         let actionStrings = [];
         actions.forEach((act, i) => actionStrings.push(`${act} (${(frequencies[i] * 100).toFixed(0)}%)`));
         correctAction += actionStrings.join(', ');
         if (!isCorrect) { correctAction += ` (Primær: ${primaryAction})`; }

         feedbackText.textContent = feedback;
         correctActionText.textContent = correctAction;

         if (currentTrainingMode === 'standard' || !isCorrect) {
             displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
         }

         // Deaktiver knapper etter handling
         actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    }

     function displayRangeGridForSituation(stack, players, pos, scenario) { /* ... (samme som V3) ... */
         rangeGrid.innerHTML = '';
         const fullRange = getFullRange(stack, players, pos, scenario);
          rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} ${scenario}`;

          if (!fullRange || Object.keys(fullRange).length === 0) {
              rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center;">Range ikke funnet for ${pos} i scenario ${scenario} (${stack}, ${players}max).</p>`;
              rangeDisplayContainer.style.display = 'block';
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

                 let displayRank1 = rank1 === 'T' ? '10' : rank1;
                 let displayRank2 = rank2 === 'T' ? '10' : rank2;
                 let displayText = '';
                 if (index1 === index2) { displayText = displayRank1; }
                 else if (index1 < index2) { displayText = displayRank1 + displayRank2; }
                 else { displayText = displayRank2 + displayRank1; }
                 cell.textContent = displayText;

                 const gtoAction = fullRange[handKey] || { "F": 1.0 };
                 const actions = Object.keys(gtoAction);
                 const frequencies = Object.values(gtoAction);
                 let tooltip = `${handKey}:\n`;
                 let primaryAction = 'F';
                 let isMixed = false;
                 let primaryFreq = 0;
                 if (actions.length > 0) {
                      actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } });
                  }
                 if (actions.length > 1) {
                     isMixed = true;
                     let actionStrings = [];
                      actions.forEach((act, i) => actionStrings.push(`${act}: ${(frequencies[i] * 100).toFixed(0)}%`));
                     tooltip += actionStrings.join('\n');
                 } else if (actions.length === 1) { tooltip += `${primaryAction}: 100%`; }
                 else { tooltip += "Fold: 100%"; }

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
           rangeDisplayContainer.style.display = 'block';
     }


    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => {
        numPlayers = parseInt(e.target.value);
        setupTableUI();
        populatePositionSelect();
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
             actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
             handleUserAction(e.target.dataset.action);
             // NB: Knapper forblir deaktivert til "Ny Hånd" trykkes
        });
    });

    // --- Initialisering ---
    setupTableUI();
    populatePositionSelect();
    setupNewHand();
});
