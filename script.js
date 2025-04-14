// script.js (Versjon 8 - Større Hero-kort, fargekodede motstanderkort, fold logging)

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
    let firstActionPlayerLogicalIndex = -1;

    const HERO_LOGICAL_SEAT_INDEX = 0;
    let VISUAL_HERO_SEAT_INDEX = -1;

    // --- DOM Elementer ---
    const gameTypeSelect = document.getElementById('gameType');
    const stackDepthSelect = document.getElementById('stackDepth');
    const trainingModeSelect = document.getElementById('trainingMode');
    const positionLabel = document.getElementById('positionLabel');
    const positionSelect = document.getElementById('positionSelect');
    const newHandBtn = document.getElementById('newHandBtn');
    const pokerTable = document.querySelector('.poker-table');
    const heroPositionSpan = document.getElementById('heroPosition');
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

    function calculateVisualHeroSeatIndex() { /* ... (uendret) ... */
        VISUAL_HERO_SEAT_INDEX = Math.floor(numPlayers / 2);
        console.log(`Visual Hero Seat Index set to: ${VISUAL_HERO_SEAT_INDEX} for ${numPlayers} players.`);
    }

    function createDeck() { /* ... (uendret) ... */
        const deck = [];
        for (const suit of suits) { for (const rank of ranks) { deck.push(rank + suit); } }
        return deck;
    }

    function shuffleDeck(deck) { /* ... (uendret) ... */
        for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[deck[i], deck[j]] = [deck[j], deck[i]]; }
        return deck;
    }

    function getHandKey(cards) { /* ... (uendret) ... */
        if (!cards || cards.length !== 2) return null;
        const card1Rank = cards[0][0], card1Suit = cards[0][1]; const card2Rank = cards[1][0], card2Suit = cards[1][1];
        const rankOrder = ranks.slice().reverse();
        const rank1Index = rankOrder.indexOf(card1Rank), rank2Index = rankOrder.indexOf(card2Rank);
        const highRank = rank1Index < rank2Index ? card1Rank : card2Rank; const lowRank = rank1Index < rank2Index ? card2Rank : card1Rank;
        const suited = card1Suit === card2Suit;
        if (highRank === lowRank) return highRank + lowRank; else return highRank + lowRank + (suited ? 's' : 'o');
    }

    function calculatePositionName(logicalSeatIndex, dealerIndex, numPlayers) { /* ... (uendret) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions || positions.length !== numPlayers) { console.error("Error in calculatePositionName", logicalSeatIndex, dealerIndex, numPlayers); return "??"; }
        const relativeIndex = (logicalSeatIndex - dealerIndex + numPlayers) % numPlayers;
        const btnListIndex = positions.indexOf("BTN");
        if (btnListIndex === -1) { console.error("BTN not found", numPlayers); return "??"; }
        const adjustedListIndex = (btnListIndex + relativeIndex) % numPlayers;
        return positions[adjustedListIndex] || "??";
    }

    function getActualSeatIndex(positionName, dealerIndex, numPlayers) { /* ... (uendret) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions || positions.length !== numPlayers) { console.error("Error in getActualSeatIndex", positionName, dealerIndex, numPlayers); return -1; }
        const listIndex = positions.indexOf(positionName);
        if (listIndex === -1) { console.warn(`Could not find position '${positionName}'`, numPlayers); return -1; }
        const btnListIndex = positions.indexOf("BTN");
        if (btnListIndex === -1) { console.error("BTN not found", numPlayers); return -1; }
        const stepsFromBtnInList = (listIndex - btnListIndex + numPlayers) % numPlayers;
        const actualSeatIndex = (dealerIndex + stepsFromBtnInList) % numPlayers;
        return actualSeatIndex;
    }

    function populatePositionSelect() { /* ... (uendret) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = ''; positions.forEach(pos => { const option = document.createElement('option'); option.value = pos; option.textContent = pos; positionSelect.appendChild(option); });
        let defaultPos = "CO"; if (!positions.includes(defaultPos)) defaultPos = "BTN"; if (!positions.includes(defaultPos)) defaultPos = positions[Math.floor(positions.length / 2)];
        positionSelect.value = defaultPos; currentFixedPosition = positionSelect.value;
    }

    function getSeatPosition(logicalSeatIndex, totalPlayers) { /* ... (uendret) ... */
        if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex();
        const angleOffset = -90; const angleIncrement = 360 / totalPlayers;
        const visualIndexOffset = (logicalSeatIndex - HERO_LOGICAL_SEAT_INDEX + totalPlayers) % totalPlayers;
        const targetVisualIndex = (VISUAL_HERO_SEAT_INDEX + visualIndexOffset) % totalPlayers;
        const angle = angleOffset + targetVisualIndex * angleIncrement;
        const angleRad = angle * (Math.PI / 180); const radiusX = 45; const radiusY = 42;
        const left = 50 + radiusX * Math.cos(angleRad); const top = 50 + radiusY * Math.sin(angleRad);
        return { top: `${top}%`, left: `${left}%` };
    }

    function getButtonPosition(dealerVisualSeatElement) { /* ... (uendret) ... */
        if (!dealerVisualSeatElement) return { top: '50%', left: '50%' };
        const tableRect = pokerTable.getBoundingClientRect(); const seatRect = dealerVisualSeatElement.getBoundingClientRect();
        const seatCenterX = (seatRect.left + seatRect.width / 2) - tableRect.left; const seatCenterY = (seatRect.top + seatRect.height / 2) - tableRect.top;
        const tableCenterX = tableRect.width / 2; const tableCenterY = tableRect.height / 2;
        const angleRad = Math.atan2(seatCenterY - tableCenterY, seatCenterX - tableCenterX); const buttonOffset = 25;
        const btnLeft = seatCenterX + buttonOffset * Math.cos(angleRad) - dealerButtonElement.offsetWidth / 2; const btnTop = seatCenterY + buttonOffset * Math.sin(angleRad) - dealerButtonElement.offsetHeight / 2;
        return { top: `${btnTop}px`, left: `${btnLeft}px` };
    }

    // Setter opp det visuelle bordet
    function setupTableUI() { /* ... (uendret) ... */
        if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex();
        pokerTable.innerHTML = ''; pokerTable.appendChild(dealerButtonElement); pokerTable.appendChild(potDisplaySpan.parentNode); pokerTable.appendChild(scenarioDescriptionElement);
        let opponentCounter = 1;
        for (let i = 0; i < numPlayers; i++) { // i is LOGICAL seat index
            const seatDiv = document.createElement('div'); seatDiv.classList.add('seat'); seatDiv.dataset.seatId = i;
            const pos = getSeatPosition(i, numPlayers); seatDiv.style.left = pos.left; seatDiv.style.top = pos.top;
            let playerName;
            if (i === HERO_LOGICAL_SEAT_INDEX) { playerName = "Hero"; seatDiv.classList.add('hero-seat'); }
            else { playerName = `Spiller ${opponentCounter++}`; }
            seatDiv.innerHTML = `
                <div class="seat-content">
                    <div class="player-info"><span class="player-name">${playerName}</span><span class="player-position">--</span></div>
                    <div class="player-cards"><div class="card card-placeholder"></div><div class="card card-placeholder"></div></div>
                     <span class="player-action"></span>
                 </div>`;
            pokerTable.appendChild(seatDiv);
        }
    }

    // Oppdaterer logiske posisjonsnavn
    function updatePlayerPositionsRelativeToButton() { /* ... (uendret) ... */
        if (currentDealerPositionIndex < 0) { console.error("Dealer pos not set"); return; }
        const seats = pokerTable.querySelectorAll('.seat');
        seats.forEach((seat) => {
            const logicalSeatIndex = parseInt(seat.dataset.seatId);
            const positionName = calculatePositionName(logicalSeatIndex, currentDealerPositionIndex, numPlayers);
            const positionSpan = seat.querySelector('.player-position'); if (positionSpan) positionSpan.textContent = positionName;
            updateSeatActionVisuals(seat, null); seat.classList.remove('action-on');
        });
        heroPositionSpan.textContent = currentHeroPositionName; // Already calculated in setupNewHand
        const dealerVisualSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if (dealerVisualSeatElement) { const btnPos = getButtonPosition(dealerVisualSeatElement); dealerButtonElement.style.top = btnPos.top; dealerButtonElement.style.left = btnPos.left; }
        else { dealerButtonElement.style.top = '10%'; dealerButtonElement.style.left = '10%'; }
        if (firstActionPlayerLogicalIndex !== -1) { const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerLogicalIndex}"]`); if (actionSeatElement) actionSeatElement.classList.add('action-on'); }
    }


    function getCardComponents(cardString) { /* ... (uendret) ... */
        if (!cardString || cardString.length < 2) return { rank: '?', suit: '', suitClass: '' };
        const rank = cardString.slice(0, -1), suitCode = cardString.slice(-1); let suitSymbol = '', suitClass = '';
        switch (suitCode) { case 's': suitSymbol = '♠'; suitClass = 'spades'; break; case 'h': suitSymbol = '♥'; suitClass = 'hearts'; break; case 'd': suitSymbol = '♦'; suitClass = 'diamonds'; break; case 'c': suitSymbol = '♣'; suitClass = 'clubs'; break; default: suitSymbol = '?'; }
        let displayRank = rank === 'T' ? '10' : rank; return { rank: displayRank, suit: suitSymbol, suitClass: suitClass };
    }


    // Viser Hero sine kort (alltid logisk sete 0)
    function displayHeroCards() { /* ... (uendret - bruker HERO_LOGICAL_SEAT_INDEX) ... */
        const heroVisualSeat = pokerTable.querySelector(`.seat[data-seat-id="${HERO_LOGICAL_SEAT_INDEX}"]`);
        if (!heroVisualSeat) { console.error("Could not find Hero seat element."); return; }
        const cardsContainer = heroVisualSeat.querySelector('.player-cards');
        if (!cardsContainer) { console.error("Could not find player-cards container in Hero seat."); return; }
        cardsContainer.innerHTML = '';
        if (heroHand.length === 2) {
            heroHand.forEach(card => {
                const components = getCardComponents(card); const cardDiv = document.createElement('div');
                cardDiv.classList.add('card', components.suitClass); // Bruker .hero-seat .card CSS
                cardDiv.innerHTML = `
                    <div class="card-rank card-top-left"><div>${components.rank}</div><div>${components.suit}</div></div>
                    <div class="card-suit card-suit-center">${components.suit}</div>
                    <div class="card-rank card-bottom-right"><div>${components.rank}</div><div>${components.suit}</div></div>`;
                cardsContainer.appendChild(cardDiv);
            });
        } else { cardsContainer.innerHTML = `<div class="card card-placeholder"></div><div class="card card-placeholder"></div>`; }
    }

    // Oppdaterer visuell stil og tekst for en handling PÅ ET SETE
    function updateSeatActionVisuals(seatElement, actionInfo) {
        if (!seatElement) return;

        const actionSpan = seatElement.querySelector('.player-action');
        const playerCardsDiv = seatElement.querySelector('.player-cards');
        const isHero = seatElement.classList.contains('hero-seat');

        // --- Reset Først ---
        seatElement.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind');
        if (actionSpan) { actionSpan.className = 'player-action'; actionSpan.textContent = ''; }

        // Reset kort for MOTSTANDERE (tilbake til placeholder)
        if (playerCardsDiv && !isHero) {
            playerCardsDiv.style.opacity = '1';
            playerCardsDiv.innerHTML = ''; // Tøm gamle fargede kort
            // Lag nye placeholders
            const placeholder1 = document.createElement('div');
            placeholder1.classList.add('card', 'card-placeholder');
            const placeholder2 = document.createElement('div');
            placeholder2.classList.add('card', 'card-placeholder');
            playerCardsDiv.appendChild(placeholder1);
            playerCardsDiv.appendChild(placeholder2);
        }
        // For Hero, ikke rør kortene her, de settes av displayHeroCards

        // --- Bruk ny actionInfo ---
        if (!actionInfo) return; // Kun reset hvis ingen info

        let actionText = '';
        let actionClassSuffix = ''; // For tekst-span farge
        let seatClassSuffix = '';   // For sete-bakgrunn
        let cardClassSuffix = '';   // For kort-bakgrunn (motstander)

        switch (actionInfo.actionType.toUpperCase()) {
            case 'FOLD':
                actionText = 'Fold'; actionClassSuffix = 'fold'; seatClassSuffix = 'folded'; cardClassSuffix = 'folded';
                // Fjern kort helt visuelt for foldet motstander
                 if (playerCardsDiv && !isHero) { playerCardsDiv.innerHTML = ''; }
                break;
            case 'CALL':
                actionText = `Call ${actionInfo.amount} BB`; actionClassSuffix = 'call'; seatClassSuffix = 'called'; cardClassSuffix = 'called';
                break;
            case 'RAISE':
                actionText = `Raise ${actionInfo.amount} BB`; actionClassSuffix = 'raise'; seatClassSuffix = 'raised'; cardClassSuffix = 'raised';
                break;
            case '3B':
                actionText = `3-Bet ${actionInfo.amount} BB`; actionClassSuffix = '3bet'; seatClassSuffix = 'raised'; cardClassSuffix = '3bet'; // Egen kortfarge
                break;
            case 'PUSH':
                actionText = `Push ${actionInfo.amount} BB`; actionClassSuffix = 'push'; seatClassSuffix = 'pushed'; cardClassSuffix = 'pushed'; // Egen kortfarge
                break;
            case 'POST_SB': case 'POST_BB':
                actionText = `Post ${actionInfo.amount} BB`; actionClassSuffix = 'post'; seatClassSuffix = 'posted-blind'; // Ingen kortfarge
                break;
            default: actionText = actionInfo.actionType;
        }

        // Sett tekst og klasse for handling
        if (actionSpan) {
            actionSpan.textContent = actionText;
            if (actionClassSuffix) actionSpan.classList.add(`action-${actionClassSuffix}`);
        }
        // Sett klasse for sete-bakgrunn
        if (seatClassSuffix) seatElement.classList.add(`seat-${seatClassSuffix}`);

        // Sett klasse for MOTSTANDER-kort bakgrunn
        if (cardClassSuffix && playerCardsDiv && !isHero) {
            playerCardsDiv.querySelectorAll('.card.card-placeholder').forEach(card => {
                card.classList.remove('card-placeholder'); // Fjern placeholder-klasse
                card.classList.add(`card-${cardClassSuffix}`); // Legg til fargeklasse
            });
        }
    }


    // Viser handlingene som skjedde før Hero
    function displayPrecedingActions() {
        // Reset alle seter UNNTATT Hero sine kort
        pokerTable.querySelectorAll('.seat').forEach(seat => {
            if (!seat.classList.contains('hero-seat')) {
                 updateSeatActionVisuals(seat, null); // Full reset for motstandere
            } else { // Bare reset action-tekst/stil for Hero
                const actionSpan = seat.querySelector('.player-action');
                 if (actionSpan) { actionSpan.className = 'player-action'; actionSpan.textContent = ''; }
                 seat.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind');
            }
             seat.classList.remove('action-on'); // Fjern action-markering fra alle
        });

        // Vis faktiske handlinger
        console.log("Actions before display:", JSON.stringify(actionsPrecedingHero)); // DEBUG LOG
        actionsPrecedingHero.forEach(actionInfo => {
             const logicalSeatIndex = getActualSeatIndex(actionInfo.position, currentDealerPositionIndex, numPlayers);
             if (logicalSeatIndex === -1) { console.warn(`Skipping display for unknown pos: ${actionInfo.position}`); return; }
             const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${logicalSeatIndex}"]`);
             if (seatElement) { updateSeatActionVisuals(seatElement, actionInfo); }
             else { console.warn(`Could not find seat element for logical index ${logicalSeatIndex}`); }
         });

        // Marker hvem som har handlingen
        if (firstActionPlayerLogicalIndex !== -1) {
            const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerLogicalIndex}"]`);
            if (actionSeatElement) actionSeatElement.classList.add('action-on');
            else { console.warn(`Could not find action seat element for logical index ${firstActionPlayerLogicalIndex}`); }
        }
    }

    function updateActionButtons() { /* ... (uendret) ... */
        const buttons = actionButtonsContainer.querySelectorAll('button'); buttons.forEach(btn => btn.disabled = true);
        if (currentScenario === 'RFI') {
            actionButtonsContainer.querySelector('[data-action="F"]').disabled = false; actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
            if (currentStackDepth === '10bb') { actionButtonsContainer.querySelector('[data-action="P"]').disabled = false; actionButtonsContainer.querySelector('[data-action="R"]').disabled = true; }
        } else if (currentScenario.startsWith('vs_')) {
            actionButtonsContainer.querySelector('[data-action="F"]').disabled = false; actionButtonsContainer.querySelector('[data-action="C"]').disabled = false; actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false;
             if (currentStackDepth === '10bb') { actionButtonsContainer.querySelector('[data-action="P"]').disabled = false; actionButtonsContainer.querySelector('[data-action="3B"]').disabled = true; }
        }
    }

    // Setter opp en ny hånd
    function setupNewHand() { /* ... (uendret logikk, bruker nå HERO_LOGICAL_SEAT_INDEX) ... */
        console.log("--- Starting setupNewHand ---");
        // 1. Reset state & UI elements
        feedbackText.textContent = ''; feedbackText.className = ''; correctActionText.textContent = ''; rangeDisplayContainer.style.display = 'none'; rangeGrid.innerHTML = '';
        currentDeck = shuffleDeck(createDeck()); heroHand = [currentDeck.pop(), currentDeck.pop()];
        actionsPrecedingHero = []; currentPotSizeBB = 1.5; firstActionPlayerLogicalIndex = -1;
        currentScenario = 'RFI'; currentScenarioDescription = ''; currentHeroPositionName = '';
        pokerTable.querySelectorAll('.seat').forEach(seat => { updateSeatActionVisuals(seat, null); seat.classList.remove('action-on'); const posSpan = seat.querySelector('.player-position'); if (posSpan) posSpan.textContent = '--'; });

        // 2. Set LOGICAL dealer index
        const positions = numPlayers === 9 ? positions9max : positions6max; const btnListIndex = positions.indexOf("BTN");
        if (currentTrainingMode === 'standard' || !currentFixedPosition) {
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
            console.log(`Standard mode: Dealer LOGICAL seat index ${currentDealerPositionIndex}`);
        } else {
            const heroTargetPos = currentFixedPosition; const heroTargetPosIndexInList = positions.indexOf(heroTargetPos);
            if (heroTargetPosIndexInList === -1) { console.error(`Invalid fixed pos: ${heroTargetPos}. Fallback.`); currentFixedPosition = positions.includes("CO") ? "CO" : "BTN"; positionSelect.value = currentFixedPosition; heroTargetPosIndexInList = positions.indexOf(currentFixedPosition); }
            const targetStepsFromBtnInList = (heroTargetPosIndexInList - btnListIndex + numPlayers) % numPlayers;
            currentDealerPositionIndex = (HERO_LOGICAL_SEAT_INDEX - targetStepsFromBtnInList + numPlayers) % numPlayers; // Calculate dealer for Hero (logical 0)
            console.log(`Trainer mode: Target ${heroTargetPos} for logical seat ${HERO_LOGICAL_SEAT_INDEX}. Dealer LOGICAL seat index set to ${currentDealerPositionIndex}.`);
        }

        // 3. Calculate Hero's LOGICAL position name
        currentHeroPositionName = calculatePositionName(HERO_LOGICAL_SEAT_INDEX, currentDealerPositionIndex, numPlayers);
        if (!currentHeroPositionName || currentHeroPositionName === '??') { console.error("FATAL: Could not determine Hero Position Name!"); alert("Position calc error."); return; }
        console.log(`Hero's calculated LOGICAL position: ${currentHeroPositionName}`);
        heroPositionSpan.textContent = currentHeroPositionName;

        // 4. Generate Scenario (RFI or vs RFI)
        const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers; const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
        const sbPos = calculatePositionName(sbSeatIndex, currentDealerPositionIndex, numPlayers); const bbPos = calculatePositionName(bbSeatIndex, currentDealerPositionIndex, numPlayers);
        actionsPrecedingHero.push({ position: sbPos, actionType: "POST_SB", amount: 0.5 }); actionsPrecedingHero.push({ position: bbPos, actionType: "POST_BB", amount: 1 });
        let scenarioGenerated = false; let potentialScenario = 'RFI'; const canFaceRFI = !['UTG', 'UTG+1', 'SB', 'BB'].includes(currentHeroPositionName); const tryVsRFI = Math.random() < 0.6;
        if (canFaceRFI && (currentTrainingMode === 'standard' || tryVsRFI)) {
            const heroListIndex = positions.indexOf(currentHeroPositionName); const possibleRaiserPositions = [];
            for (let i = 0; i < heroListIndex; i++) { const posName = positions[i]; if (!['SB', 'BB'].includes(posName) && GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[posName]) possibleRaiserPositions.push(posName); }
            if (possibleRaiserPositions.length > 0) {
                const raiserPosition = possibleRaiserPositions[Math.floor(Math.random() * possibleRaiserPositions.length)]; potentialScenario = `vs_${raiserPosition}_RFI`; console.log(`Attempting scenario: ${potentialScenario}`);
                const rangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[potentialScenario];
                if (rangeExists) {
                    currentScenario = potentialScenario; let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3);
                    actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount }); currentPotSizeBB += raiseAmount; currentScenarioDescription = `${raiserPosition} -> ${raiseAmount} BB. Din tur.`;
                    const raiserListIndex = positions.indexOf(raiserPosition);
                    for (let i = raiserListIndex + 1; i < heroListIndex; i++) { const foldPosName = positions[i]; if (!['SB', 'BB'].includes(foldPosName)) actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" }); }
                    firstActionPlayerLogicalIndex = HERO_LOGICAL_SEAT_INDEX; scenarioGenerated = true; console.log(`Scenario: ${currentScenario}. Action on logical seat ${firstActionPlayerLogicalIndex}`);
                } else { console.warn(`Range missing for Hero (${currentHeroPositionName}) vs ${potentialScenario}. Fallback RFI.`); }
            }
        }
        if (!scenarioGenerated) {
            currentScenario = 'RFI'; currentScenarioDescription = `Foldet til deg. Din tur.`;
            const heroListIndex = positions.indexOf(currentHeroPositionName); const firstPossibleActorListIndex = positions.findIndex(p => !['SB', 'BB'].includes(p));
            for (let i = firstPossibleActorListIndex; i < heroListIndex; i++) { const foldPosName = positions[i]; if (!['SB', 'BB'].includes(foldPosName)) actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" }); }
            firstActionPlayerLogicalIndex = HERO_LOGICAL_SEAT_INDEX; console.log(`Scenario: ${currentScenario}. Action on logical seat ${firstActionPlayerLogicalIndex}`);
        }

        // 5. Update UI
        scenarioDescriptionElement.textContent = currentScenarioDescription;
        updatePlayerPositionsRelativeToButton(); // Updates visual names/dealer btn
        displayHeroCards(); // Shows hero cards in hero seat
        displayPrecedingActions(); // Shows opponent actions/cards
        potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
        updateActionButtons(); // Enables/disables buttons

        // 6. Show Range if trainer mode
        if (currentTrainingMode === 'trainer') displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
        else rangeDisplayContainer.style.display = 'none';
        console.log("--- setupNewHand Finished ---");
    }

    function handleUserAction(userActionCode) { /* ... (uendret) ... */
        const handKey = getHandKey(heroHand); if (!handKey || !currentHeroPositionName || currentHeroPositionName === '??') { console.error("Invalid state for handleUserAction", {handKey, currentHeroPositionName}); return; }
        console.log(`Handling: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}, Hand: ${handKey}, Action: ${userActionCode}`);
        const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey); if (!gtoActionObject) { console.error("Failed GTO action obj."); feedbackText.textContent = "Error: No GTO data."; feedbackText.className = 'incorrect'; return; }
        const actions = Object.keys(gtoActionObject); const frequencies = Object.values(gtoActionObject); let feedback = '', correctActionDescription = '', isCorrect = false, primaryAction = 'F', primaryFreq = 0;
        if (actions.length > 0) { actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } }); } else { primaryAction = 'F'; primaryFreq = 1.0; gtoActionObject['F'] = 1.0; actions.push('F'); frequencies.push(1.0); }
        let normalizedUserAction = userActionCode;
        if (currentScenario === 'RFI' && currentStackDepth === '10bb' && userActionCode === 'P') normalizedUserAction = 'P'; else if (currentScenario === 'RFI' && userActionCode === 'R') normalizedUserAction = 'R'; else if (currentScenario.startsWith('vs_') && currentStackDepth === '10bb' && userActionCode === 'P') normalizedUserAction = 'P'; else if (currentScenario.startsWith('vs_') && userActionCode === '3B') normalizedUserAction = '3B'; else if (currentScenario.startsWith('vs_') && userActionCode === 'C') normalizedUserAction = 'C'; else if (userActionCode === 'F') normalizedUserAction = 'F'; else normalizedUserAction = userActionCode;
        if (gtoActionObject[normalizedUserAction] && gtoActionObject[normalizedUserAction] > 0) { isCorrect = true; if (normalizedUserAction === primaryAction && gtoActionObject[normalizedUserAction] >= 0.85) { feedback = "Korrekt!"; feedbackText.className = 'correct'; } else if (actions.length > 1 && frequencies.filter(f => f > 0).length > 1) { feedback = "OK (Mixed Strategi)"; feedbackText.className = 'correct'; } else { feedback = "Korrekt!"; feedbackText.className = 'correct'; } } else { feedback = "Feil!"; feedbackText.className = 'incorrect'; isCorrect = false; }
        correctActionDescription = "Anbefalt GTO: "; let actionStrings = [];
        Object.entries(gtoActionObject).forEach(([act, freq]) => { if (freq > 0) { let percentage = (freq * 100).toFixed(0); if (actions.length === 1 || freq === 1.0) percentage = "100"; actionStrings.push(`${act} (${percentage}%)`); } });
        if (actionStrings.length === 0) actionStrings.push("F (100%)"); correctActionDescription += actionStrings.join(', ');
        if (!isCorrect && actions.length > 1 && frequencies.filter(f => f > 0).length > 1) correctActionDescription += ` (Primær: ${primaryAction})`; else if (!isCorrect && actions.length >= 1 && primaryAction !== 'F') { if (gtoActionObject[primaryAction] === 1.0) correctActionDescription += ` (Du burde valgt ${primaryAction})`; else correctActionDescription += ` (Primær: ${primaryAction})`; }
        feedbackText.textContent = feedback; correctActionText.textContent = correctActionDescription;
        if (currentTrainingMode === 'standard' || !isCorrect) displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
        actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    }

    function displayRangeGridForSituation(stack, players, pos, scenario) { /* ... (uendret) ... */
        rangeGrid.innerHTML = ''; const fullRange = getFullRange(stack, players, pos, scenario); rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} - Scenario: ${scenario}`;
        if (!fullRange || Object.keys(fullRange).length === 0) { rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center; color: red;">Error: Could not load range for ${pos} ${scenario} (${stack}, ${players}max).</p>`; rangeDisplayContainer.style.display = 'block'; return; }
        const ranksRev = ranks.slice().reverse(); ranksRev.forEach((rank1, index1) => { ranksRev.forEach((rank2, index2) => { const cell = document.createElement('div'); cell.classList.add('range-cell'); let handKey; if (index1 === index2) handKey = rank1 + rank2; else if (index1 < index2) handKey = rank1 + rank2 + 's'; else handKey = rank2 + rank1 + 'o'; let displayText = '', displayRank1 = rank1 === 'T' ? '10' : rank1, displayRank2 = rank2 === 'T' ? '10' : rank2; if (index1 === index2) displayText = displayRank1 + displayRank2; else if (index1 < index2) displayText = displayRank1 + displayRank2; else displayText = displayRank2 + displayRank1; cell.textContent = displayText; const gtoAction = fullRange[handKey] || { "F": 1.0 }; const actions = Object.keys(gtoAction); const frequencies = Object.values(gtoAction); let tooltipText = `${handKey}:\n`, primaryAction = 'F', isMixed = false, primaryFreq = 0; if (actions.length > 0) { actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } }); isMixed = frequencies.filter(f => f > 0).length > 1; } else { primaryAction = 'F'; gtoAction['F'] = 1.0; } let actionStrings = []; Object.entries(gtoAction).forEach(([act, freq]) => { if (freq > 0) actionStrings.push(`${act}: ${(freq * 100).toFixed(0)}%`); }); if (actionStrings.length === 0) actionStrings.push("F: 100%"); tooltipText += actionStrings.join('\n'); if (isMixed) cell.classList.add('range-mixed'); else if (['R', '3B', 'P'].includes(primaryAction)) cell.classList.add('range-raise'); else if (primaryAction === 'C') cell.classList.add('range-call'); else cell.classList.add('range-fold'); const tooltipSpan = document.createElement('span'); tooltipSpan.classList.add('tooltiptext'); tooltipSpan.textContent = tooltipText; cell.appendChild(tooltipSpan); rangeGrid.appendChild(cell); }); }); rangeDisplayContainer.style.display = 'block';
    }


    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
        numPlayers = parseInt(e.target.value.slice(0,1)); calculateVisualHeroSeatIndex(); setupTableUI(); populatePositionSelect(); setupNewHand();
    });
    stackDepthSelect.addEventListener('change', (e) => { /* ... (uendret) ... */ currentStackDepth = e.target.value; setupNewHand(); });
    trainingModeSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
        currentTrainingMode = e.target.value; if (currentTrainingMode === 'trainer') { positionLabel.style.display = 'inline'; positionSelect.style.display = 'inline'; populatePositionSelect(); currentFixedPosition = positionSelect.value; } else { positionLabel.style.display = 'none'; positionSelect.style.display = 'none'; currentFixedPosition = null; } setupNewHand();
    });
     positionSelect.addEventListener('change', (e) => { /* ... (uendret) ... */ if (currentTrainingMode === 'trainer') { currentFixedPosition = e.target.value; setupNewHand(); } });
    newHandBtn.addEventListener('click', setupNewHand);
    actionButtonsContainer.addEventListener('click', (e) => { /* ... (uendret) ... */ if (e.target.tagName === 'BUTTON' && !e.target.disabled) { actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true); handleUserAction(e.target.dataset.action); } });

    // --- Initialisering ---
    console.log("Initializing Poker Trainer V2.1...");
    calculateVisualHeroSeatIndex(); setupTableUI(); populatePositionSelect(); setupNewHand();
    console.log("Initialization complete.");
});
