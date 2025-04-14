// script.js (Versjon 7 - Korrekt Hero Plassering & z-index fix)

document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variabler & Tilstand ---
    let currentDeck = [];
    let heroHand = [];
    let currentHeroPositionName = ''; // Hero sin *logiske* posisjon (UTG, BTN...)
    let currentDealerPositionIndex = -1; // Dealerens *logiske* seteindeks (0..N-1)
    let currentScenario = 'RFI';
    let currentScenarioDescription = '';
    let actionsPrecedingHero = [];
    let numPlayers = 9;
    let currentStackDepth = '40bb';
    let currentTrainingMode = 'standard';
    let currentFixedPosition = null; // Posisjonen som trenes i Trainer mode
    let currentPotSizeBB = 1.5;
    let firstActionPlayerLogicalIndex = -1; // *Logisk* indeks for spiller med action

    const HERO_LOGICAL_SEAT_INDEX = 0; // Hero er *alltid* logisk sete 0
    let VISUAL_HERO_SEAT_INDEX = -1; // Settes basert på numPlayers (visuelt nederste sete)

    // --- DOM Elementer ---
    const gameTypeSelect = document.getElementById('gameType');
    const stackDepthSelect = document.getElementById('stackDepth');
    const trainingModeSelect = document.getElementById('trainingMode');
    const positionLabel = document.getElementById('positionLabel');
    const positionSelect = document.getElementById('positionSelect');
    const newHandBtn = document.getElementById('newHandBtn');
    const pokerTable = document.querySelector('.poker-table');
    const heroPositionSpan = document.getElementById('heroPosition'); // Viser logisk posisjon
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

    // --- Funksjoner ---

    // Setter indeksen for setet som skal vises nederst
    function calculateVisualHeroSeatIndex() {
        VISUAL_HERO_SEAT_INDEX = Math.floor(numPlayers / 2);
        console.log(`Visual Hero Seat Index set to: ${VISUAL_HERO_SEAT_INDEX} for ${numPlayers} players.`);
    }

    function createDeck() { /* ... (uendret) ... */
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) { deck.push(rank + suit); }
        }
        return deck;
    }

    function shuffleDeck(deck) { /* ... (uendret) ... */
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        } return deck;
    }

    function getHandKey(cards) { /* ... (uendret) ... */
        if (!cards || cards.length !== 2) return null;
        const card1Rank = cards[0][0], card1Suit = cards[0][1];
        const card2Rank = cards[1][0], card2Suit = cards[1][1];
        const rankOrder = ranks.slice().reverse();
        const rank1Index = rankOrder.indexOf(card1Rank), rank2Index = rankOrder.indexOf(card2Rank);
        const highRank = rank1Index < rank2Index ? card1Rank : card2Rank;
        const lowRank = rank1Index < rank2Index ? card2Rank : card1Rank;
        const suited = card1Suit === card2Suit;
        if (highRank === lowRank) return highRank + lowRank;
        else return highRank + lowRank + (suited ? 's' : 'o');
    }

    // Kalkulerer LOGISK posisjonsnavn for en gitt LOGISK seteindeks og dealerindeks
    function calculatePositionName(logicalSeatIndex, dealerIndex, numPlayers) {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions || positions.length !== numPlayers) {
            console.error("Error in calculatePositionName - invalid inputs", logicalSeatIndex, dealerIndex, numPlayers); return "??";
        }
        const relativeIndex = (logicalSeatIndex - dealerIndex + numPlayers) % numPlayers;
        const btnListIndex = positions.indexOf("BTN");
        if (btnListIndex === -1) { console.error("BTN not found in positions array for", numPlayers); return "??"; }
        const adjustedListIndex = (btnListIndex + relativeIndex) % numPlayers;
        return positions[adjustedListIndex] || "??";
    }

    // Finner den LOGISKE seteindeksen for et gitt posisjonsnavn
    function getActualSeatIndex(positionName, dealerIndex, numPlayers) {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions || positions.length !== numPlayers) {
             console.error("Error in getActualSeatIndex - invalid inputs", positionName, dealerIndex, numPlayers); return -1;
        }
        const listIndex = positions.indexOf(positionName);
        if (listIndex === -1) { console.warn(`Could not find position '${positionName}' in list for ${numPlayers}max.`); return -1; }
        const btnListIndex = positions.indexOf("BTN");
        if (btnListIndex === -1) { console.error("BTN not found in positions array for", numPlayers); return -1; }
        const stepsFromBtnInList = (listIndex - btnListIndex + numPlayers) % numPlayers;
        const actualSeatIndex = (dealerIndex + stepsFromBtnInList) % numPlayers;
        return actualSeatIndex;
    }

    function populatePositionSelect() { /* ... (uendret) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = '';
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos; option.textContent = pos;
            positionSelect.appendChild(option);
        });
        let defaultPos = "CO";
        if (!positions.includes(defaultPos)) defaultPos = "BTN";
        if (!positions.includes(defaultPos)) defaultPos = positions[Math.floor(positions.length / 2)];
        positionSelect.value = defaultPos; currentFixedPosition = positionSelect.value;
    }

    // Beregner VISUELL plassering (top/left %) for en gitt LOGISK seteindeks
    function getSeatPosition(logicalSeatIndex, totalPlayers) {
        if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex(); // Ensure it's calculated

        const angleOffset = -90; // Start top
        const angleIncrement = 360 / totalPlayers;

        // Calculate the angle where this logical seat *should* appear visually
        // Hero (logical 0) should appear at VISUAL_HERO_SEAT_INDEX's visual position.
        // Seat 1 should appear one step clockwise from Hero's visual position, etc.
        const visualIndexOffset = (logicalSeatIndex - HERO_LOGICAL_SEAT_INDEX + totalPlayers) % totalPlayers;
        const targetVisualIndex = (VISUAL_HERO_SEAT_INDEX + visualIndexOffset) % totalPlayers;

        const angle = angleOffset + targetVisualIndex * angleIncrement;

        const angleRad = angle * (Math.PI / 180);
        const radiusX = 45; const radiusY = 42;
        const left = 50 + radiusX * Math.cos(angleRad);
        const top = 50 + radiusY * Math.sin(angleRad);
        return { top: `${top}%`, left: `${left}%` };
    }


    function getButtonPosition(dealerVisualSeatElement) { /* ... (uendret - tar et DOM element) ... */
        if (!dealerVisualSeatElement) return { top: '50%', left: '50%' };
        const tableRect = pokerTable.getBoundingClientRect();
        const seatRect = dealerVisualSeatElement.getBoundingClientRect();
        const seatCenterX = (seatRect.left + seatRect.width / 2) - tableRect.left;
        const seatCenterY = (seatRect.top + seatRect.height / 2) - tableRect.top;
        const tableCenterX = tableRect.width / 2; const tableCenterY = tableRect.height / 2;
        const angleRad = Math.atan2(seatCenterY - tableCenterY, seatCenterX - tableCenterX);
        const buttonOffset = 25;
        const btnLeft = seatCenterX + buttonOffset * Math.cos(angleRad) - dealerButtonElement.offsetWidth / 2;
        const btnTop = seatCenterY + buttonOffset * Math.sin(angleRad) - dealerButtonElement.offsetHeight / 2;
        return { top: `${btnTop}px`, left: `${btnLeft}px` };
    }

    // Setter opp det visuelle bordet
    function setupTableUI() {
        if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex();
        pokerTable.innerHTML = '';
        pokerTable.appendChild(dealerButtonElement);
        pokerTable.appendChild(potDisplaySpan.parentNode);
        pokerTable.appendChild(scenarioDescriptionElement);

        let opponentCounter = 1;
        for (let i = 0; i < numPlayers; i++) { // i is the LOGICAL seat index
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat');
            seatDiv.dataset.seatId = i; // Store the LOGICAL index

            const pos = getSeatPosition(i, numPlayers); // Get VISUAL position based on LOGICAL index
            seatDiv.style.left = pos.left;
            seatDiv.style.top = pos.top;

            let playerName;
            if (i === HERO_LOGICAL_SEAT_INDEX) { // Check against logical Hero index
                playerName = "Hero";
                seatDiv.classList.add('hero-seat'); // Add class for visual distinction
            } else {
                playerName = `Spiller ${opponentCounter++}`;
            }

            seatDiv.innerHTML = `
                <div class="seat-content">
                    <div class="player-info">
                        <span class="player-name">${playerName}</span>
                        <span class="player-position">--</span>
                    </div>
                    <div class="player-cards">
                         <div class="card card-placeholder"></div>
                         <div class="card card-placeholder"></div>
                    </div>
                     <span class="player-action"></span>
                 </div>`;
            pokerTable.appendChild(seatDiv);
        }
    }

    // Oppdaterer logiske posisjonsnavn på de visuelle setene
    function updatePlayerPositionsRelativeToButton() {
        if (currentDealerPositionIndex < 0) {
            console.error("Dealer position not set before updating positions"); return;
        }

        const seats = pokerTable.querySelectorAll('.seat');

        seats.forEach((seat) => {
            const logicalSeatIndex = parseInt(seat.dataset.seatId);
            const positionName = calculatePositionName(logicalSeatIndex, currentDealerPositionIndex, numPlayers);

            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) positionSpan.textContent = positionName;

            // Reset visuals (action text/style, action-on glow)
            updateSeatActionVisuals(seat, null);
            seat.classList.remove('action-on');
        });

        // currentHeroPositionName should have been calculated in setupNewHand already
        heroPositionSpan.textContent = currentHeroPositionName; // Update UI text

        // Flytt dealerknappen til riktig *visuelt* sete
        const dealerVisualSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if (dealerVisualSeatElement) {
            const btnPos = getButtonPosition(dealerVisualSeatElement);
            dealerButtonElement.style.top = btnPos.top;
            dealerButtonElement.style.left = btnPos.left;
        } else {
            dealerButtonElement.style.top = '10%'; dealerButtonElement.style.left = '10%'; // Fallback
        }

        // Marker hvem som har handlingen (basert på logisk indeks)
        if (firstActionPlayerLogicalIndex !== -1) {
            const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerLogicalIndex}"]`);
            if (actionSeatElement) actionSeatElement.classList.add('action-on');
        }
         // Ingen 'else' her, da action-on fjernes fra alle seter først
    }


    function getCardComponents(cardString) { /* ... (uendret) ... */
        if (!cardString || cardString.length < 2) return { rank: '?', suit: '', suitClass: '' };
        const rank = cardString.slice(0, -1), suitCode = cardString.slice(-1);
        let suitSymbol = '', suitClass = '';
        switch (suitCode) {
            case 's': suitSymbol = '♠'; suitClass = 'spades'; break;
            case 'h': suitSymbol = '♥'; suitClass = 'hearts'; break;
            case 'd': suitSymbol = '♦'; suitClass = 'diamonds'; break;
            case 'c': suitSymbol = '♣'; suitClass = 'clubs'; break;
            default: suitSymbol = '?';
        }
        let displayRank = rank === 'T' ? '10' : rank;
        return { rank: displayRank, suit: suitSymbol, suitClass: suitClass };
    }


    // Viser Hero sine kort i det dedikerte *visuelle* Hero-setet
    function displayHeroCards() {
        if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex();
        // Finn det visuelle setet basert på LOGISK indeks
        const heroVisualSeat = pokerTable.querySelector(`.seat[data-seat-id="${HERO_LOGICAL_SEAT_INDEX}"]`);
        if (!heroVisualSeat) { console.error("Could not find Hero seat element."); return; }

        const cardsContainer = heroVisualSeat.querySelector('.player-cards');
        if (!cardsContainer) { console.error("Could not find player-cards container in Hero seat."); return; }

        cardsContainer.innerHTML = ''; // Tøm først
        if (heroHand.length === 2) {
            heroHand.forEach(card => {
                const components = getCardComponents(card);
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('card', components.suitClass);
                cardDiv.innerHTML = `
                    <div class="card-rank card-top-left"><div>${components.rank}</div><div>${components.suit}</div></div>
                    <div class="card-suit card-suit-center">${components.suit}</div>
                    <div class="card-rank card-bottom-right"><div>${components.rank}</div><div>${components.suit}</div></div>`;
                cardsContainer.appendChild(cardDiv);
            });
        } else {
            cardsContainer.innerHTML = `<div class="card card-placeholder"></div><div class="card card-placeholder"></div>`;
        }
    }

    // Oppdaterer visuell stil og tekst for en handling på et sete
    function updateSeatActionVisuals(seatElement, actionInfo) { /* ... (uendret) ... */
        if (!seatElement) return;
        const actionSpan = seatElement.querySelector('.player-action');
        const playerCardsDiv = seatElement.querySelector('.player-cards');
        seatElement.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind');
        if (actionSpan) { actionSpan.className = 'player-action'; actionSpan.textContent = ''; }
        // Reset kort for motstandere
        if (playerCardsDiv && !seatElement.classList.contains('hero-seat')) {
             playerCardsDiv.style.opacity = '1';
             playerCardsDiv.innerHTML = `<div class="card card-placeholder"></div><div class="card card-placeholder"></div>`;
        }

        if (!actionInfo) return;
        let actionText = '', actionClassSuffix = '', seatClassSuffix = '';
        switch (actionInfo.actionType.toUpperCase()) {
            case 'FOLD': actionText = 'Fold'; actionClassSuffix = 'fold'; seatClassSuffix = 'folded';
                 if (playerCardsDiv && !seatElement.classList.contains('hero-seat')) { playerCardsDiv.innerHTML = ''; }
                break;
            case 'CALL': actionText = `Call ${actionInfo.amount} BB`; actionClassSuffix = 'call'; seatClassSuffix = 'called'; break;
            case 'RAISE': actionText = `Raise ${actionInfo.amount} BB`; actionClassSuffix = 'raise'; seatClassSuffix = 'raised'; break;
            case '3B': actionText = `3-Bet ${actionInfo.amount} BB`; actionClassSuffix = '3bet'; seatClassSuffix = 'raised'; break;
            case 'PUSH': actionText = `Push ${actionInfo.amount} BB`; actionClassSuffix = 'push'; seatClassSuffix = 'pushed'; break;
            case 'POST_SB': case 'POST_BB': actionText = `Post ${actionInfo.amount} BB`; actionClassSuffix = 'post'; seatClassSuffix = 'posted-blind'; break;
            default: actionText = actionInfo.actionType;
        }
        if (actionSpan) { actionSpan.textContent = actionText; if (actionClassSuffix) actionSpan.classList.add(`action-${actionClassSuffix}`); }
        if (seatClassSuffix) seatElement.classList.add(`seat-${seatClassSuffix}`);
    }


    // Viser handlingene som skjedde før Hero sin tur
    function displayPrecedingActions() {
        // Nullstill alle seter visuelt (unntatt Hero sine kort som settes i displayHeroCards)
        pokerTable.querySelectorAll('.seat').forEach(seat => {
            // updateSeatActionVisuals fjerner også action-klassen for setet
            if (!seat.classList.contains('hero-seat')) { // Ikke rør hero sine kort her
                 updateSeatActionVisuals(seat, null);
            } else { // Bare fjern action text/style for hero
                const actionSpan = seat.querySelector('.player-action');
                 if (actionSpan) { actionSpan.className = 'player-action'; actionSpan.textContent = ''; }
                 seat.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind');
            }
             seat.classList.remove('action-on'); // Fjern action-markering fra alle
        });

        // Vis faktiske handlinger
        actionsPrecedingHero.forEach(actionInfo => {
             // Finn den *logiske* indeksen for posisjonen
             const logicalSeatIndex = getActualSeatIndex(actionInfo.position, currentDealerPositionIndex, numPlayers);
             if (logicalSeatIndex === -1) {
                 console.warn(`Could not find seat index for position ${actionInfo.position} in displayPrecedingActions`); return;
             }
             // Finn det *visuelle* setet som tilsvarer den logiske indeksen
             const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${logicalSeatIndex}"]`);
             if (seatElement) {
                 updateSeatActionVisuals(seatElement, actionInfo);
             }
         });

        // Marker hvem som har handlingen (basert på logisk indeks)
        if (firstActionPlayerLogicalIndex !== -1) {
            const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerLogicalIndex}"]`);
            if (actionSeatElement) actionSeatElement.classList.add('action-on');
        }
    }

    function updateActionButtons() { /* ... (uendret) ... */
        const buttons = actionButtonsContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
        if (currentScenario === 'RFI') {
            actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
            actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
            if (currentStackDepth === '10bb') {
                actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
                actionButtonsContainer.querySelector('[data-action="R"]').disabled = true;
            }
        } else if (currentScenario.startsWith('vs_')) {
            actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
            actionButtonsContainer.querySelector('[data-action="C"]').disabled = false;
            actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false;
             if (currentStackDepth === '10bb') {
                actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
                actionButtonsContainer.querySelector('[data-action="3B"]').disabled = true;
            }
        }
    }

    // Setter opp en ny hånd
    function setupNewHand() {
        console.log("--- Starting setupNewHand ---");
        // 1. Nullstill state og UI
        feedbackText.textContent = ''; feedbackText.className = '';
        correctActionText.textContent = '';
        rangeDisplayContainer.style.display = 'none'; rangeGrid.innerHTML = '';
        currentDeck = shuffleDeck(createDeck());
        heroHand = [currentDeck.pop(), currentDeck.pop()];
        actionsPrecedingHero = []; currentPotSizeBB = 1.5;
        firstActionPlayerLogicalIndex = -1;
        currentScenario = 'RFI'; currentScenarioDescription = '';
        currentHeroPositionName = ''; // Nullstill før beregning

        // Nullstill alle seter visuelt (før posisjoner oppdateres)
        pokerTable.querySelectorAll('.seat').forEach(seat => {
            updateSeatActionVisuals(seat, null);
            seat.classList.remove('action-on');
            const posSpan = seat.querySelector('.player-position');
            if (posSpan) posSpan.textContent = '--';
        });


        // 2. Sett Dealerknappens *logiske* posisjon (seteindeks 0..N-1)
        const positions = numPlayers === 9 ? positions9max : positions6max;
        const btnListIndex = positions.indexOf("BTN");

        if (currentTrainingMode === 'standard' || !currentFixedPosition) {
            // Standard modus: Tilfeldig dealer
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
            // Valgfritt: sørg for at dealer ikke er Hero (logisk 0)
            // while (currentDealerPositionIndex === HERO_LOGICAL_SEAT_INDEX) {
            //     currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
            // }
            console.log(`Standard mode: Dealer LOGICAL seat index ${currentDealerPositionIndex}`);
        } else {
            // Posisjonstrener: Plasser dealer slik at Hero (logisk 0) får den valgte posisjonen
            const heroTargetPos = currentFixedPosition;
            const heroTargetPosIndexInList = positions.indexOf(heroTargetPos);

            if (heroTargetPosIndexInList === -1) { // Fallback
                console.error(`Invalid fixed position: ${heroTargetPos}. Falling back.`);
                currentFixedPosition = positions.includes("CO") ? "CO" : "BTN";
                positionSelect.value = currentFixedPosition;
                heroTargetPosIndexInList = positions.indexOf(currentFixedPosition);
            }

            // Kalkuler dealerens logiske indeks for å oppnå målet for logisk sete 0
            const targetStepsFromBtnInList = (heroTargetPosIndexInList - btnListIndex + numPlayers) % numPlayers;
            currentDealerPositionIndex = (HERO_LOGICAL_SEAT_INDEX - targetStepsFromBtnInList + numPlayers) % numPlayers;

            console.log(`Trainer mode: Target ${heroTargetPos} for logical seat ${HERO_LOGICAL_SEAT_INDEX}. Dealer LOGICAL seat index set to ${currentDealerPositionIndex}.`);
        }

        // 3. Beregn Hero sin *faktiske logiske posisjon* for denne hånden
        currentHeroPositionName = calculatePositionName(HERO_LOGICAL_SEAT_INDEX, currentDealerPositionIndex, numPlayers);
        if (!currentHeroPositionName || currentHeroPositionName === '??') {
             console.error("FATAL: Could not determine Hero Position Name!"); alert("Kritisk feil ved posisjonsberegning."); return;
        }
        console.log(`Hero's calculated LOGICAL position: ${currentHeroPositionName}`);
        heroPositionSpan.textContent = currentHeroPositionName; // Oppdater UI under bordet

        // 4. Generer Scenario (RFI eller vs RFI)
        const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers;
        const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
        const sbPos = calculatePositionName(sbSeatIndex, currentDealerPositionIndex, numPlayers);
        const bbPos = calculatePositionName(bbSeatIndex, currentDealerPositionIndex, numPlayers);
        actionsPrecedingHero.push({ position: sbPos, actionType: "POST_SB", amount: 0.5 });
        actionsPrecedingHero.push({ position: bbPos, actionType: "POST_BB", amount: 1 });

        let scenarioGenerated = false;
        let potentialScenario = 'RFI';
        const canFaceRFI = !['UTG', 'UTG+1', 'SB', 'BB'].includes(currentHeroPositionName);
        const tryVsRFI = Math.random() < 0.6;

        if (canFaceRFI && (currentTrainingMode === 'standard' || tryVsRFI)) {
            const heroListIndex = positions.indexOf(currentHeroPositionName);
            const possibleRaiserPositions = [];
            for (let i = 0; i < heroListIndex; i++) {
                 const posName = positions[i];
                 if (!['SB', 'BB'].includes(posName) && GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[posName]) {
                    possibleRaiserPositions.push(posName);
                 }
            }
            if (possibleRaiserPositions.length > 0) {
                const raiserPosition = possibleRaiserPositions[Math.floor(Math.random() * possibleRaiserPositions.length)];
                potentialScenario = `vs_${raiserPosition}_RFI`;
                 console.log(`Attempting scenario: ${potentialScenario}`);
                const rangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[potentialScenario];

                if (rangeExists) {
                    currentScenario = potentialScenario;
                    let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3);
                    actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount });
                    currentPotSizeBB += raiseAmount;
                    currentScenarioDescription = `${raiserPosition} -> ${raiseAmount} BB. Din tur.`; // Kortere
                    const raiserListIndex = positions.indexOf(raiserPosition);
                    for(let i = raiserListIndex + 1; i < heroListIndex; i++) {
                         const foldPosName = positions[i];
                         if (!['SB', 'BB'].includes(foldPosName)) {
                              actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" });
                         }
                    }
                    firstActionPlayerLogicalIndex = HERO_LOGICAL_SEAT_INDEX; // Hero handler
                    scenarioGenerated = true;
                     console.log(`Scenario: ${currentScenario}. Action on logical seat ${firstActionPlayerLogicalIndex}`);
                 } else { console.warn(`Range missing for Hero (${currentHeroPositionName}) vs ${potentialScenario}. Falling back to RFI.`); }
            }
        }

        if (!scenarioGenerated) {
            currentScenario = 'RFI';
            currentScenarioDescription = `Foldet til deg. Din tur.`;
             const heroListIndex = positions.indexOf(currentHeroPositionName);
             const firstPossibleActorListIndex = positions.findIndex(p => !['SB','BB'].includes(p)); // Første som ikke er blind

             for (let i = firstPossibleActorListIndex; i < heroListIndex; i++) {
                  const foldPosName = positions[i];
                   if (!['SB', 'BB'].includes(foldPosName)) {
                        actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" });
                   }
             }
              firstActionPlayerLogicalIndex = HERO_LOGICAL_SEAT_INDEX; // Hero handler
              console.log(`Scenario: ${currentScenario}. Action on logical seat ${firstActionPlayerLogicalIndex}`);
        }

        // 5. Oppdater UI basert på generert state
        scenarioDescriptionElement.textContent = currentScenarioDescription;
        updatePlayerPositionsRelativeToButton(); // Oppdater posisjonsnavn og dealer-knapp
        displayHeroCards(); // Vis Hero sine kort i bunnsetet
        displayPrecedingActions(); // Vis blinds, folds, raises etc.
        potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
        updateActionButtons(); // Aktiver relevante knapper for Hero

        // 6. Vis Range i Trener-modus
        if (currentTrainingMode === 'trainer') {
            displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
        } else {
            rangeDisplayContainer.style.display = 'none';
        }
         console.log("--- setupNewHand Finished ---");
    }

    function handleUserAction(userActionCode) { /* ... (uendret) ... */
        const handKey = getHandKey(heroHand);
        if (!handKey || !currentHeroPositionName || currentHeroPositionName === '??') { console.error("Invalid state for handleUserAction", {handKey, currentHeroPositionName}); return; }
        console.log(`Handling: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}, Hand: ${handKey}, Action: ${userActionCode}`);
        const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey);
        if (!gtoActionObject) { console.error("Failed to get GTO action object."); feedbackText.textContent = "Error: Could not find GTO data."; feedbackText.className = 'incorrect'; return; }

        const actions = Object.keys(gtoActionObject); const frequencies = Object.values(gtoActionObject);
        let feedback = '', correctActionDescription = '', isCorrect = false, primaryAction = 'F', primaryFreq = 0;
        if (actions.length > 0) { actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } }); }
        else { primaryAction = 'F'; primaryFreq = 1.0; gtoActionObject['F'] = 1.0; actions.push('F'); frequencies.push(1.0); }

        let normalizedUserAction = userActionCode;
        if (currentScenario === 'RFI' && currentStackDepth === '10bb' && userActionCode === 'P') normalizedUserAction = 'P';
        else if (currentScenario === 'RFI' && userActionCode === 'R') normalizedUserAction = 'R';
        else if (currentScenario.startsWith('vs_') && currentStackDepth === '10bb' && userActionCode === 'P') normalizedUserAction = 'P';
        else if (currentScenario.startsWith('vs_') && userActionCode === '3B') normalizedUserAction = '3B';
        else if (currentScenario.startsWith('vs_') && userActionCode === 'C') normalizedUserAction = 'C';
        else if (userActionCode === 'F') normalizedUserAction = 'F';
        else normalizedUserAction = userActionCode;

        if (gtoActionObject[normalizedUserAction] && gtoActionObject[normalizedUserAction] > 0) {
            isCorrect = true;
            if (normalizedUserAction === primaryAction && gtoActionObject[normalizedUserAction] >= 0.85) { feedback = "Korrekt!"; feedbackText.className = 'correct'; }
            else if (actions.length > 1 && frequencies.filter(f => f > 0).length > 1) { feedback = "OK (Mixed Strategi)"; feedbackText.className = 'correct'; }
            else { feedback = "Korrekt!"; feedbackText.className = 'correct'; }
        } else { feedback = "Feil!"; feedbackText.className = 'incorrect'; isCorrect = false; }

        correctActionDescription = "Anbefalt GTO: ";
        let actionStrings = [];
        Object.entries(gtoActionObject).forEach(([act, freq]) => {
            if (freq > 0) {
                let percentage = (freq * 100).toFixed(0);
                if (actions.length === 1 || freq === 1.0) percentage = "100";
                actionStrings.push(`${act} (${percentage}%)`);
            }
        });
        if (actionStrings.length === 0) actionStrings.push("F (100%)");
        correctActionDescription += actionStrings.join(', ');
        if (!isCorrect && actions.length > 1 && frequencies.filter(f => f > 0).length > 1) correctActionDescription += ` (Primær: ${primaryAction})`;
        else if (!isCorrect && actions.length >= 1 && primaryAction !== 'F') {
            if (gtoActionObject[primaryAction] === 1.0) correctActionDescription += ` (Du burde valgt ${primaryAction})`;
            else correctActionDescription += ` (Primær: ${primaryAction})`;
        }
        feedbackText.textContent = feedback; correctActionText.textContent = correctActionDescription;
        if (currentTrainingMode === 'standard' || !isCorrect) displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
        actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    }

    function displayRangeGridForSituation(stack, players, pos, scenario) { /* ... (uendret) ... */
        rangeGrid.innerHTML = '';
        const fullRange = getFullRange(stack, players, pos, scenario);
        rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} - Scenario: ${scenario}`;
        if (!fullRange || Object.keys(fullRange).length === 0) { rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center; color: red;">Error: Could not load range for ${pos} in scenario ${scenario} (${stack}, ${players}max).</p>`; rangeDisplayContainer.style.display = 'block'; return; }
        const ranksRev = ranks.slice().reverse();
        ranksRev.forEach((rank1, index1) => {
            ranksRev.forEach((rank2, index2) => {
                const cell = document.createElement('div'); cell.classList.add('range-cell');
                let handKey;
                if (index1 === index2) handKey = rank1 + rank2; else if (index1 < index2) handKey = rank1 + rank2 + 's'; else handKey = rank2 + rank1 + 'o';
                let displayText = '', displayRank1 = rank1 === 'T' ? '10' : rank1, displayRank2 = rank2 === 'T' ? '10' : rank2;
                if (index1 === index2) displayText = displayRank1 + displayRank2; else if (index1 < index2) displayText = displayRank1 + displayRank2; else displayText = displayRank2 + displayRank1;
                cell.textContent = displayText;
                const gtoAction = fullRange[handKey] || { "F": 1.0 }; const actions = Object.keys(gtoAction); const frequencies = Object.values(gtoAction);
                let tooltipText = `${handKey}:\n`, primaryAction = 'F', isMixed = false, primaryFreq = 0;
                if (actions.length > 0) { actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } }); isMixed = frequencies.filter(f => f > 0).length > 1; } else { primaryAction = 'F'; gtoAction['F'] = 1.0; }
                let actionStrings = [];
                Object.entries(gtoAction).forEach(([act, freq]) => { if (freq > 0) actionStrings.push(`${act}: ${(freq * 100).toFixed(0)}%`); });
                if (actionStrings.length === 0) actionStrings.push("F: 100%"); tooltipText += actionStrings.join('\n');
                if (isMixed) cell.classList.add('range-mixed'); else if (['R', '3B', 'P'].includes(primaryAction)) cell.classList.add('range-raise'); else if (primaryAction === 'C') cell.classList.add('range-call'); else cell.classList.add('range-fold');
                const tooltipSpan = document.createElement('span'); tooltipSpan.classList.add('tooltiptext'); tooltipSpan.textContent = tooltipText; cell.appendChild(tooltipSpan); rangeGrid.appendChild(cell);
            });
        });
        rangeDisplayContainer.style.display = 'block';
    }


    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => {
        numPlayers = parseInt(e.target.value.slice(0,1));
        calculateVisualHeroSeatIndex(); // Oppdater VISUELL hero-plass
        setupTableUI(); // Bygg bordet på nytt
        populatePositionSelect(); // Oppdater posisjonsvalg
        setupNewHand(); // Start ny hånd
    });

    stackDepthSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
        currentStackDepth = e.target.value; setupNewHand();
    });

    trainingModeSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
        currentTrainingMode = e.target.value;
        if (currentTrainingMode === 'trainer') { positionLabel.style.display = 'inline'; positionSelect.style.display = 'inline'; populatePositionSelect(); currentFixedPosition = positionSelect.value; }
        else { positionLabel.style.display = 'none'; positionSelect.style.display = 'none'; currentFixedPosition = null; }
        setupNewHand();
    });

     positionSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
          if (currentTrainingMode === 'trainer') { currentFixedPosition = e.target.value; setupNewHand(); }
     });

    newHandBtn.addEventListener('click', setupNewHand);

    actionButtonsContainer.addEventListener('click', (e) => { /* ... (uendret) ... */
        if (e.target.tagName === 'BUTTON' && !e.target.disabled) { actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true); handleUserAction(e.target.dataset.action); }
    });

    // --- Initialisering ---
    console.log("Initializing Poker Trainer V2.1...");
    calculateVisualHeroSeatIndex(); // Sett initiell VISUELL Hero-plass
    setupTableUI(); // Bygg det initielle bordet
    populatePositionSelect(); // Fyll posisjonsvelgeren
    setupNewHand(); // Sett opp den første hånden
    console.log("Initialization complete.");
});
