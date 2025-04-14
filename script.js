// script.js - V2 (Corrected Syntax Error potential)

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
    const positions6max = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
    const HERO_SEAT_INDEX = 0; // Visuell plassering av Hero (nederst)

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

    function getHandKey(cards) {
        if (!cards || cards.length !== 2) return null;
        const card1Rank = cards[0].slice(0, -1); // Use slice for ranks like '10'
        const card1Suit = cards[0].slice(-1);
        const card2Rank = cards[1].slice(0, -1);
        const card2Suit = cards[1].slice(-1);
        const rankOrder = ranks.slice().reverse();
        const rank1Index = rankOrder.indexOf(card1Rank === 'T' ? 'T' : card1Rank); // Handle 'T' correctly if ranks array uses 'T'
        const rank2Index = rankOrder.indexOf(card2Rank === 'T' ? 'T' : card2Rank);

        let highRank, lowRank;
         if (rank1Index < rank2Index) { // Lower index means higher rank in reversed array
            highRank = card1Rank;
            lowRank = card2Rank;
         } else {
            highRank = card2Rank;
            lowRank = card1Rank;
         }

        const suited = card1Suit === card2Suit;

        if (highRank === lowRank) {
            return highRank + lowRank;
        } else {
            return highRank + lowRank + (suited ? 's' : 'o');
        }
    }

    function getPositionName(seatIndex, numPlayers) {
        if (currentDealerPositionIndex < 0) return "??";
        const positions = numPlayers === 9 ? positions9max : positions6max;
        // Calculate index relative to the BB (which is dealerIndex + 2 for position name list)
        const bbIndex = (currentDealerPositionIndex + 2) % numPlayers;
        const relativePosIndex = (seatIndex - bbIndex + numPlayers) % numPlayers;
        // Now map this relative index to the standard position names list
        // UTG is index 0 in the lists, BB is the last
        return positions[relativePosIndex] || "??";
    }

    function getActualSeatIndex(positionName, numPlayers) {
        if (currentDealerPositionIndex < 0) return -1;
        const positions = numPlayers === 9 ? positions9max : positions6max;
        const listIndex = positions.indexOf(positionName);
        if (listIndex === -1) return -1;

        // Calculate seat index relative to the BB seat
        const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
        return (bbSeatIndex + listIndex) % numPlayers;
    }


    function populatePositionSelect() {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = '';
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        positionSelect.value = positions.includes("CO") ? "CO" : (positions.includes("BTN") ? "BTN" : positions[0]);
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
         // Position slightly different based on seat location for better look
         let left;
         if (seatLeft < pokerTable.offsetWidth / 3) { // Left side
             left = seatLeft - dealerButtonElement.offsetWidth - 5;
         } else if (seatLeft > (pokerTable.offsetWidth * 2 / 3)) { // Right side
            left = seatLeft + seatWidth + 5;
         } else { // Top/Bottom seats
            left = seatLeft + seatWidth / 2 - dealerButtonElement.offsetWidth / 2 + (seatTop < pokerTable.offsetHeight / 2 ? -20 : 20); // Offset slightly left/right
         }
        // Keep button from going off-screen (simple boundary check)
        left = Math.max(0, Math.min(pokerTable.offsetWidth - dealerButtonElement.offsetWidth, left));
        return { top: `${top}px`, left: `${left}px` };
    }


    function setupTableUI() {
        pokerTable.innerHTML = '';
        pokerTable.appendChild(dealerButtonElement);
        pokerTable.appendChild(potDisplaySpan.parentNode); // Re-append pot display

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
                <span class="player-action"></span>
            `;
            pokerTable.appendChild(seatDiv);
        }
    }

    function updatePlayerPositionsRelativeToButton() {
        if (currentDealerPositionIndex < 0) return;
        const seats = pokerTable.querySelectorAll('.seat');
        seats.forEach((seat) => {
            const actualIndex = parseInt(seat.dataset.seatId);
            const positionName = getPositionName(actualIndex, numPlayers); // Use corrected function
            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) {
                positionSpan.textContent = positionName;
            }
            const actionSpan = seat.querySelector('.player-action');
            if(actionSpan) actionSpan.textContent = ''; // Clear old actions
            seat.classList.remove('hero-seat', 'action-on');

            if (actualIndex === HERO_SEAT_INDEX) {
                seat.classList.add('hero-seat');
                currentHeroPositionName = positionName;
                heroPositionSpan.textContent = currentHeroPositionName;
            }
        });

        const dealerSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if(dealerSeatElement) {
            const btnPos = getButtonPosition(dealerSeatElement);
            dealerButtonElement.style.top = btnPos.top;
            dealerButtonElement.style.left = btnPos.left;
        } else {
             dealerButtonElement.style.top = '50%';
             dealerButtonElement.style.left = '50%';
        }

          // Mark whose action it is
          if (firstActionPlayerIndex !== -1) {
               const actionSeat = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
               if (actionSeat) actionSeat.classList.add('action-on');
          }
    }


    function getCardComponents(cardString) {
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

    function displayHeroCards() {
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

    function displayPrecedingActions() {
         const seats = pokerTable.querySelectorAll('.seat');
         seats.forEach(seat => {
             const actionSpan = seat.querySelector('.player-action');
             if (actionSpan) actionSpan.textContent = ''; // Clear old
         });

        actionsPrecedingHero.forEach(actionInfo => {
            const seatIndex = getActualSeatIndex(actionInfo.position, numPlayers);
            if (seatIndex === -1) return; // Skip if position not found
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
                        case 'POST_SB': actionText = `Post 0.5 BB`; actionClass = ''; break;
                        case 'POST_BB': actionText = `Post 1 BB`; actionClass = ''; break;
                        default: actionText = actionInfo.actionType;
                    }
                    actionSpan.textContent = actionText;
                    actionSpan.className = 'player-action'; // Reset
                    if (actionClass) actionSpan.classList.add(actionClass);
                }
            }
        });
    }

    function updateActionButtons() {
        const buttons = actionButtonsContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true); // Disable all

        const isShortStack = currentStackDepth === '10bb';

        if (currentScenario === 'RFI') {
            actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
            actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
            if (isShortStack) {
                actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
            }
        } else if (currentScenario.startsWith('vs_')) {
            actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
            actionButtonsContainer.querySelector('[data-action="C"]').disabled = false;
            actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false;
             if (isShortStack) {
                actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
            }
        }
         // TODO: Add logic for disabling R if no one can raise, C if no bet to call, etc.
    }

    // --- setupNewHand Function (Revised Scenario Logic) ---
    function setupNewHand() {
        feedbackText.textContent = '';
        correctActionText.textContent = '';
        rangeDisplayContainer.style.display = 'none';
        rangeGrid.innerHTML = '';
        currentDeck = shuffleDeck(createDeck());
        heroHand = [currentDeck.pop(), currentDeck.pop()];
        actionsPrecedingHero = [];
        currentPotSizeBB = 1.5;
        firstActionPlayerIndex = -1; // Reset

        // --- Set Dealer Button ---
        if (currentTrainingMode === 'standard') {
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
        } else {
            const positions = numPlayers === 9 ? positions9max : positions6max;
            const heroTargetPosName = currentFixedPosition;
            const heroTargetPosIndex = positions.indexOf(heroTargetPosName);

             if(heroTargetPosIndex === -1) {
                 console.error(`Invalid fixed position: ${heroTargetPosName} for ${numPlayers}max`);
                 currentFixedPosition = "BTN"; // Default fallback
                 populatePositionSelect(); // Update the dropdown visual
                 currentDealerPositionIndex = (HERO_SEAT_INDEX - positions.indexOf("BTN") + numPlayers) % numPlayers; // Recalculate D based on BTN
             } else {
                  // Calculate dealer pos so Hero (seat 0) gets the target position
                   // Relative index = (Seat Index - Dealer Index + N) % N
                   // We want Relative Index for Seat 0 to be heroTargetPosIndex
                   // targetRelIndex = (0 - dealerIndex + N) % N
                   // dealerIndex = (N - targetRelIndex) % N
                   currentDealerPositionIndex = (numPlayers - heroTargetPosIndex) % numPlayers;
             }
        }

        // --- Update UI based on new Dealer Button ---
        updatePlayerPositionsRelativeToButton(); // Set heroPosName and visual positions
        currentHeroPositionName = getPositionName(HERO_SEAT_INDEX, numPlayers); // Confirm hero position name
        heroPositionSpan.textContent = currentHeroPositionName;


        // --- Scenario Setup ---
        scenarioDescription.textContent = '';
        const positions = numPlayers === 9 ? positions9max : positions6max;
        const heroPosListIndex = positions.indexOf(currentHeroPositionName);

        // Post blinds visually
         const sbSeatIndex = getActualSeatIndex("SB", numPlayers);
         const bbSeatIndex = getActualSeatIndex("BB", numPlayers);
         actionsPrecedingHero.push({ position: "SB", actionType: "POST_SB", amount: 0.5 });
         actionsPrecedingHero.push({ position: "BB", actionType: "POST_BB", amount: 1 });

        // Determine who acts first after blinds
        const firstToActPosIndex = positions.indexOf("UTG"); // Index in the position list
        const firstActualSeat = getActualSeatIndex("UTG", numPlayers);


        const randomScenarioChoice = Math.random();
        let scenarioGenerated = false;

        // Try vs RFI (only if Hero isn't UTG, UTG+1, SB, BB)
        if (randomScenarioChoice >= 0.5 && heroPosListIndex > (numPlayers === 9 ? 1 : 0) && !["SB","BB"].includes(currentHeroPositionName)) {
             // Find potential raisers *before* Hero
             let possibleRaisers = [];
             for (let i = firstToActPosIndex; i < heroPosListIndex; i++) {
                 possibleRaisers.push(positions[i]);
             }

             if (possibleRaisers.length > 0) {
                 const raiserPosName = possibleRaisers[Math.floor(Math.random() * possibleRaisers.length)];
                 const raiserSeatIdx = getActualSeatIndex(raiserPosName, numPlayers);
                 let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3); // Standard raise size

                 actionsPrecedingHero.push({ position: raiserPosName, actionType: "Raise", amount: raiseAmount });
                 currentPotSizeBB += raiseAmount;
                 currentScenario = `vs_${raiserPosName}_RFI`; // e.g., vs_UTG_RFI, vs_MP_RFI
                 scenarioDescription.textContent = `${raiserPosName} høyner til ${raiseAmount} BB. Din tur.`;

                  // Fold players between raiser and hero
                 const raiserListIdx = positions.indexOf(raiserPosName);
                  for (let i = raiserListIdx + 1; i < heroPosListIndex; i++) {
                       actionsPrecedingHero.push({ position: positions[i], actionType: "Fold" });
                  }
                 firstActionPlayerIndex = HERO_SEAT_INDEX;
                 scenarioGenerated = true;
             }
        }

        // If no vs RFI was generated, default to RFI
        if (!scenarioGenerated) {
            currentScenario = 'RFI';
            scenarioDescription.textContent = `Det foldes til deg. Din tur.`;
             // Fold players between BB and Hero
             const bbListIndex = positions.indexOf("BB"); // Find BB in the list
             // Iterate from UTG up to Hero's position index in the list
             for (let i = firstToActPosIndex; i < heroPosListIndex; i++) {
                 actionsPrecedingHero.push({ position: positions[i], actionType: "Fold" });
             }
             firstActionPlayerIndex = HERO_SEAT_INDEX;
             scenarioGenerated = true; // Technically it was generated now
        }


        // --- Final Check & Display ---
        const testRangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[currentScenario];
        if (!testRangeExists) {
            console.error(`Mangler range data for: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}.`);
            feedbackText.textContent = "Feil: Mangler range data for scenario.";
            correctActionText.textContent = `Scenario: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}`;
            actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
            return;
        }

        displayHeroCards();
        displayPrecedingActions();
        potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
        updateActionButtons();

        if (currentTrainingMode === 'trainer') {
            const handKey = getHandKey(heroHand);
            if (handKey) {
                displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
                rangeDisplayContainer.style.display = 'block';
            }
        } else {
            rangeDisplayContainer.style.display = 'none';
        }
    }


    function handleUserAction(userActionCode) {
        const handKey = getHandKey(heroHand);
        if (!handKey) return;

        // Få GTO-handling for den *aktuelle* situasjonen
        const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey);
        if (!gtoActionObject) { // Dobbeltsjekk at vi fant noe
             console.error("Kunne ikke finne GTO action i handleUserAction");
             feedbackText.textContent = "Feil ved henting av GTO data.";
             correctActionText.textContent = "";
             return;
        }

        const actions = Object.keys(gtoActionObject);
        const frequencies = Object.values(gtoActionObject);
        let feedback = '';
        let correctActionStr = ''; // Renamed from correctAction
        let isCorrect = false;
        let primaryAction = 'F';
        let primaryFreq = 0;

        // Finn primær handling
        if (actions.length > 0) {
             actions.forEach((act, i) => {
                 if (frequencies[i] > primaryFreq) {
                     primaryFreq = frequencies[i];
                     primaryAction = act;
                 }
             });
        }

        // Logikk for å sjekke brukerens handling
        // Noen handlinger er alias (R kan være RFI, P kan være RFI short stack)
        let effectiveUserAction = userActionCode;
         if (currentScenario === 'RFI' && userActionCode === 'R') effectiveUserAction = 'R'; // OK
         else if (currentScenario === 'RFI' && userActionCode === 'P' && currentStackDepth === '10bb') effectiveUserAction = 'P'; // OK for push
         else if (currentScenario.startsWith('vs_') && userActionCode === 'R') effectiveUserAction = '3B'; // User clicked Raise, means 3Bet here
         else if (currentScenario.startsWith('vs_') && userActionCode === '3B') effectiveUserAction = '3B'; // User clicked 3-Bet button
         else if (currentScenario.startsWith('vs_') && userActionCode === 'P' && currentStackDepth === '10bb') effectiveUserAction = 'P'; // OK for push vs raise short

         // Sjekk om den effektive handlingen er i GTO-objektet
         if (gtoActionObject[effectiveUserAction] && gtoActionObject[effectiveUserAction] > 0) {
             if(effectiveUserAction === primaryAction && gtoActionObject[effectiveUserAction] > 0.6) {
                  feedback = "Korrekt!";
                  feedbackText.className = 'correct';
                  isCorrect = true;
             } else {
                  feedback = "OK (Mixed Strategi)";
                  feedbackText.className = 'correct';
                  isCorrect = true;
             }
         } else {
             feedback = "Feil!";
             feedbackText.className = 'incorrect';
             isCorrect = false;
         }

        // Bygg streng for korrekt handling
        correctActionStr = "Anbefalt GTO: ";
        let actionStrings = [];
        actions.forEach((act, i) => actionStrings.push(`${act} (${(frequencies[i] * 100).toFixed(0)}%)`));
        correctActionStr += actionStrings.join(', ');
        if (!isCorrect) {
            correctActionStr += ` (Primær: ${primaryAction})`;
        }

        feedbackText.textContent = feedback;
        correctActionText.textContent = correctActionStr; // Use the renamed variable

        // Vis range grid
        if (currentTrainingMode === 'standard' || (currentTrainingMode === 'trainer' && !isCorrect)) {
            displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
            rangeDisplayContainer.style.display = 'block';
        }
    }


    function displayRangeGridForSituation(stack, players, pos, scenario) {
        rangeGrid.innerHTML = '';
        const fullRange = getFullRange(stack, players, pos, scenario);
        rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} ${scenario}`;

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

                 // Use display rank (T=10) for cell text
                 let displayRank1 = rank1 === 'T' ? '10' : rank1;
                 let displayRank2 = rank2 === 'T' ? '10' : rank2;
                  if (index1 === index2) cell.textContent = displayRank1 + displayRank2[1]; // F.eks TT, 99
                  else if (index1 < index2) cell.textContent = displayRank1 + displayRank2; // F.eks AK, T9
                  else cell.textContent = displayRank2 + displayRank1; // F.eks KQ, T9

                 const gtoAction = fullRange[handKey] || { "F": 1.0 };
                 const actions = Object.keys(gtoAction);
                 const frequencies = Object.values(gtoAction);
                 let tooltip = `${handKey}:\n`; // Start tooltip med håndnavn
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
                     tooltip += actionStrings.join('\n');
                 } else if (actions.length === 1) {
                     tooltip += `${primaryAction}: 100%`;
                 } else {
                     tooltip += "Fold: 100%";
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
        setupTableUI(); // Redraw table
        populatePositionSelect(); // Update position options
        setupNewHand(); // Deal new hand for new setup
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
            setupNewHand(); // New hand in the newly selected fixed position
        }
    });

    newHandBtn.addEventListener('click', setupNewHand);

    actionButtonsContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            handleUserAction(e.target.dataset.action);
            // Deaktiver knapper etter handling til ny hånd deles ut
             actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
        });
    });

    // --- Initialisering ---
    setupTableUI();
    populatePositionSelect();
    setupNewHand();
});
