// script.js (Versjon 13 / V2.5 - Korrigert posisjonering + Statistikk)

document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variabler & Tilstand ---
    let currentDeck = []; let heroHand = []; let currentHeroPositionName = '';
    let currentDealerPositionIndex = -1; let currentScenario = 'RFI';
    let currentScenarioDescription = ''; let actionsPrecedingHero = [];
    let numPlayers = 9; let currentStackDepth = '40bb'; let currentTrainingMode = 'standard';
    let currentFixedPosition = null; let currentPotSizeBB = 1.5;
    let firstActionPlayerLogicalIndex = -1; let autoNewHandTimer = null;
    const HERO_LOGICAL_SEAT_INDEX = 0; let VISUAL_HERO_SEAT_INDEX = -1;
    let lastHandPlayedInfo = {};
    let statistics = {}; // NY: For statistikk

    // --- DOM Elementer ---
    const gameTypeSelect = document.getElementById('gameType'); const stackDepthSelect = document.getElementById('stackDepth'); const trainingModeSelect = document.getElementById('trainingMode'); const positionLabel = document.getElementById('positionLabel'); const positionSelect = document.getElementById('positionSelect'); const delayInput = document.getElementById('delayInput'); const newHandBtn = document.getElementById('newHandBtn'); const pokerTable = document.querySelector('.poker-table'); const heroPositionSpan = document.getElementById('heroPosition'); const actionButtonsContainer = document.querySelector('.action-buttons'); const feedbackText = document.getElementById('feedbackText'); const correctActionText = document.getElementById('correctActionText'); const rangeDisplayContainer = document.getElementById('rangeDisplayContainer'); const rangeTitleElement = document.getElementById('rangeTitle'); const rangeGrid = document.getElementById('rangeGrid'); const potDisplaySpan = document.querySelector('.pot-display span'); const dealerButtonElement = document.querySelector('.dealer-button'); const scenarioDescriptionElement = document.getElementById('scenarioDescription'); const rangeSituationInfo = document.getElementById('rangeSituationInfo');
    const statsTableBody = document.querySelector('#statsTable tbody'); // NY: Tabellkropp for statistikk
    const resetStatsBtn = document.getElementById('resetStatsBtn'); // NY: Knapp for å nullstille

    // --- Konstanter ---
    const suits = ['c', 'd', 'h', 's']; const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const positions9max = ["UTG", "UTG+1", "MP", "MP+1", "HJ", "CO", "BTN", "SB", "BB"]; const positions6max = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
    const ALL_POSITIONS = [...new Set([...positions9max, ...positions6max])]; // Samle alle unike posisjonsnavn

    // --- Funksjoner ---
    function calculateVisualHeroSeatIndex() { VISUAL_HERO_SEAT_INDEX = Math.floor(numPlayers / 2); console.log(`Visual Hero Seat Index: ${VISUAL_HERO_SEAT_INDEX} for ${numPlayers}p`); }
    function createDeck() { const deck = []; for (const suit of suits) { for (const rank of ranks) { deck.push(rank + suit); } } return deck; }
    function shuffleDeck(deck) { for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } return deck; }
    function getHandKey(cards) { if (!cards || cards.length !== 2) return null; const c1r = cards[0][0], c1s = cards[0][1]; const c2r = cards[1][0], c2s = cards[1][1]; const order = ranks.slice().reverse(); const i1 = order.indexOf(c1r), i2 = order.indexOf(c2r); const hR = i1 < i2 ? c1r : c2r; const lR = i1 < i2 ? c2r : c1r; const suited = c1s === c2s; if (hR === lR) return hR + lR; else return hR + lR + (suited ? 's' : 'o'); }
    function calculatePositionName(logicalSeatIndex, dealerIndex, numPlayers) { const positions = numPlayers === 9 ? positions9max : positions6max; if (dealerIndex < 0 || !positions || positions.length !== numPlayers) { console.error("Err calcPosName", logicalSeatIndex, dealerIndex, numPlayers); return "??"; } const relativeIndex = (logicalSeatIndex - dealerIndex + numPlayers) % numPlayers; const btnListIndex = positions.indexOf("BTN"); if (btnListIndex === -1) { console.error("BTN not found", numPlayers); return "??"; } const adjustedListIndex = (btnListIndex + relativeIndex) % numPlayers; return positions[adjustedListIndex] || "??"; }
    function getActualSeatIndex(positionName, dealerIndex, numPlayers) { const positions = numPlayers === 9 ? positions9max : positions6max; if (dealerIndex < 0 || !positions || positions.length !== numPlayers) { console.error("Err getActualSeatIdx", positionName, dealerIndex, numPlayers); return -1; } const listIndex = positions.indexOf(positionName); if (listIndex === -1) { /*console.warn(`Pos not found '${positionName}'`, numPlayers);*/ return -1; } const btnListIndex = positions.indexOf("BTN"); if (btnListIndex === -1) { console.error("BTN not found", numPlayers); return -1; } const stepsFromBtnInList = (listIndex - btnListIndex + numPlayers) % numPlayers; const actualSeatIndex = (dealerIndex + stepsFromBtnInList) % numPlayers; return actualSeatIndex; }
    function populatePositionSelect() { const positions = numPlayers === 9 ? positions9max : positions6max; positionSelect.innerHTML = ''; positions.forEach(pos => { const option = document.createElement('option'); option.value = pos; option.textContent = pos; positionSelect.appendChild(option); }); let defaultPos = "CO"; if (!positions.includes(defaultPos)) defaultPos = "BTN"; if (!positions.includes(defaultPos)) defaultPos = positions[Math.floor(positions.length / 2)]; positionSelect.value = defaultPos; currentFixedPosition = positionSelect.value; }
    function getSeatPosition(logicalSeatIndex, totalPlayers) { /* ... (Som V12 / V2.4 - Korrigert) ... */ if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex(); const angleOffset = 90; const angleIncrement = 360 / totalPlayers; const targetVisualSlot = (VISUAL_HERO_SEAT_INDEX + logicalSeatIndex) % totalPlayers; const angle = angleOffset + targetVisualSlot * angleIncrement; const angleRad = angle * (Math.PI / 180); const radiusX = 45; const radiusY = 42; const left = 50 + radiusX * Math.cos(angleRad); const top = 50 + radiusY * Math.sin(angleRad); return { top: `${top}%`, left: `${left}%` }; }
    function getButtonPosition(dealerVisualSeatElement) { if (!dealerVisualSeatElement) return { top: '50%', left: '50%' }; const tableRect = pokerTable.getBoundingClientRect(); const seatRect = dealerVisualSeatElement.getBoundingClientRect(); const seatCenterX = (seatRect.left + seatRect.width / 2) - tableRect.left; const seatCenterY = (seatRect.top + seatRect.height / 2) - tableRect.top; const tableCenterX = tableRect.width / 2; const tableCenterY = tableRect.height / 2; const angleRad = Math.atan2(seatCenterY - tableCenterY, seatCenterX - tableCenterX); const buttonOffset = 25; const btnLeft = seatCenterX + buttonOffset * Math.cos(angleRad) - dealerButtonElement.offsetWidth / 2; const btnTop = seatCenterY + buttonOffset * Math.sin(angleRad) - dealerButtonElement.offsetHeight / 2; return { top: `${btnTop}px`, left: `${btnLeft}px` }; }
    function setupTableUI() { if (VISUAL_HERO_SEAT_INDEX === -1) calculateVisualHeroSeatIndex(); pokerTable.innerHTML = ''; pokerTable.appendChild(dealerButtonElement); pokerTable.appendChild(potDisplaySpan.parentNode); pokerTable.appendChild(scenarioDescriptionElement); let opponentCounter = 1; for (let i = 0; i < numPlayers; i++) { const seatDiv = document.createElement('div'); seatDiv.classList.add('seat'); seatDiv.dataset.seatId = i; const pos = getSeatPosition(i, numPlayers); seatDiv.style.left = pos.left; seatDiv.style.top = pos.top; let playerInfoHTML = ''; if (i === HERO_LOGICAL_SEAT_INDEX) { seatDiv.classList.add('hero-seat'); playerInfoHTML = `<div class="player-cards"></div>`; } else { const playerName = `Spiller ${opponentCounter++}`; playerInfoHTML = `<div class="player-info"><span class="player-name">${playerName}</span><span class="player-position">--</span></div><div class="player-cards"><div class="card card-placeholder"></div><div class="card card-placeholder"></div></div><span class="player-action"></span>`; } seatDiv.innerHTML = `<div class="seat-content">${playerInfoHTML}</div>`; pokerTable.appendChild(seatDiv); } }
    function updatePlayerPositionsRelativeToButton() { if (currentDealerPositionIndex < 0) { console.error("Dealer pos not set"); return; } const seats = pokerTable.querySelectorAll('.seat'); seats.forEach((seat) => { const logicalSeatIndex = parseInt(seat.dataset.seatId); const positionName = calculatePositionName(logicalSeatIndex, currentDealerPositionIndex, numPlayers); const positionSpan = seat.querySelector('.player-position'); if (positionSpan) positionSpan.textContent = positionName; updateSeatActionVisuals(seat, null); seat.classList.remove('action-on'); }); heroPositionSpan.textContent = currentHeroPositionName; const dealerVisualSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`); if (dealerVisualSeatElement) { const btnPos = getButtonPosition(dealerVisualSeatElement); dealerButtonElement.style.top = btnPos.top; dealerButtonElement.style.left = btnPos.left; } else { dealerButtonElement.style.top = '10%'; dealerButtonElement.style.left = '10%'; } if (firstActionPlayerLogicalIndex !== -1) { const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerLogicalIndex}"]`); if (actionSeatElement) actionSeatElement.classList.add('action-on'); } }
    function getCardComponents(cardString) { if (!cardString || cardString.length < 2) return { rank: '?', suit: '', suitClass: '' }; const rank = cardString.slice(0, -1), suitCode = cardString.slice(-1); let suitSymbol = '', suitClass = ''; switch (suitCode) { case 's': suitSymbol = '♠'; suitClass = 'spades'; break; case 'h': suitSymbol = '♥'; suitClass = 'hearts'; break; case 'd': suitSymbol = '♦'; suitClass = 'diamonds'; break; case 'c': suitSymbol = '♣'; suitClass = 'clubs'; break; default: suitSymbol = '?'; } let displayRank = rank === 'T' ? '10' : rank; return { rank: displayRank, suit: suitSymbol, suitClass: suitClass }; }
    function displayHeroCards() { const heroVisualSeat = pokerTable.querySelector(`.seat[data-seat-id="${HERO_LOGICAL_SEAT_INDEX}"]`); if (!heroVisualSeat) { console.error("No Hero seat"); return; } const cardsContainer = heroVisualSeat.querySelector('.player-cards'); if (!cardsContainer) { console.error("No cards container in Hero seat"); return; } cardsContainer.innerHTML = ''; if (heroHand.length === 2) { heroHand.forEach(card => { const components = getCardComponents(card); const cardDiv = document.createElement('div'); cardDiv.classList.add('card', components.suitClass); cardDiv.innerHTML = `<div class="card-rank-overlay card-top-left-rank">${components.rank}</div><div class="card-suit card-suit-center">${components.suit}</div><div class="card-rank-overlay card-bottom-right-rank">${components.rank}</div>`; cardsContainer.appendChild(cardDiv); }); } else { cardsContainer.innerHTML = `<div class="card card-placeholder"></div><div class="card card-placeholder"></div>`; } }
    function updateSeatActionVisuals(seatElement, actionInfo) { if (!seatElement) return; const actionSpan = seatElement.querySelector('.player-action'); const playerCardsDiv = seatElement.querySelector('.player-cards'); const isHero = seatElement.classList.contains('hero-seat'); seatElement.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind'); if (actionSpan) { actionSpan.className = 'player-action'; actionSpan.textContent = ''; } if (playerCardsDiv && !isHero) { playerCardsDiv.style.opacity = '1'; playerCardsDiv.innerHTML = `<div class="card card-placeholder"></div><div class="card card-placeholder"></div>`; } if (!actionInfo) return; let actionText = '', actionClassSuffix = '', seatClassSuffix = '', cardClassSuffix = ''; switch (actionInfo.actionType.toUpperCase()) { case 'FOLD': actionText = 'Fold'; actionClassSuffix = 'fold'; seatClassSuffix = 'folded'; cardClassSuffix = 'folded'; if (playerCardsDiv && !isHero) { playerCardsDiv.innerHTML = ''; } break; case 'CALL': actionText = `Call ${actionInfo.amount} BB`; actionClassSuffix = 'call'; seatClassSuffix = 'called'; cardClassSuffix = 'called'; break; case 'RAISE': actionText = `Raise ${actionInfo.amount} BB`; actionClassSuffix = 'raise'; seatClassSuffix = 'raised'; cardClassSuffix = 'raised'; break; case '3B': actionText = `3-Bet ${actionInfo.amount} BB`; actionClassSuffix = '3bet'; seatClassSuffix = 'raised'; cardClassSuffix = '3bet'; break; case 'PUSH': actionText = `Push ${actionInfo.amount} BB`; actionClassSuffix = 'push'; seatClassSuffix = 'pushed'; cardClassSuffix = 'pushed'; break; case 'POST_SB': case 'POST_BB': actionText = `Post ${actionInfo.amount} BB`; actionClassSuffix = 'post'; seatClassSuffix = 'posted-blind'; break; default: actionText = actionInfo.actionType; } if (actionSpan) { actionSpan.textContent = actionText; if (actionClassSuffix) actionSpan.classList.add(`action-${actionClassSuffix}`); } if (seatClassSuffix) seatElement.classList.add(`seat-${seatClassSuffix}`); if (cardClassSuffix && playerCardsDiv && !isHero && cardClassSuffix !== 'folded') { playerCardsDiv.querySelectorAll('.card').forEach(card => { card.classList.remove('card-placeholder'); card.classList.remove('card-folded', 'card-called', 'card-raised', 'card-3bet', 'card-pushed'); card.classList.add(`card-${cardClassSuffix}`); card.innerHTML = ''; }); } }
    function displayPrecedingActions() { /*console.log("[displayPrecedingActions] Called. Actions:", JSON.stringify(actionsPrecedingHero));*/ pokerTable.querySelectorAll('.seat:not(.hero-seat)').forEach(seat => { updateSeatActionVisuals(seat, null); seat.classList.remove('action-on'); }); const heroSeat = pokerTable.querySelector('.hero-seat'); if (heroSeat) { const actionSpan = heroSeat.querySelector('.player-action'); if (actionSpan) { actionSpan.className = 'player-action'; actionSpan.textContent = ''; } heroSeat.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind', 'action-on'); } actionsPrecedingHero.forEach(actionInfo => { const logicalSeatIndex = getActualSeatIndex(actionInfo.position, currentDealerPositionIndex, numPlayers); if (logicalSeatIndex === -1) { console.warn(`Skipping unknown pos: ${actionInfo.position}`); return; } const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${logicalSeatIndex}"]`); if (seatElement) { /*console.log(`Updating seat ${logicalSeatIndex} (${actionInfo.position}) with action: ${actionInfo.actionType}`);*/ updateSeatActionVisuals(seatElement, actionInfo); } else { console.warn(`No seat element for logical index ${logicalSeatIndex}`); } }); if (firstActionPlayerLogicalIndex !== -1) { const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerLogicalIndex}"]`); if (actionSeatElement) { /*console.log(`Setting action-on for logical seat ${firstActionPlayerLogicalIndex}`);*/ actionSeatElement.classList.add('action-on'); } else { console.warn(`No action seat element for logical index ${firstActionPlayerLogicalIndex}`); } } else { console.warn("No action player index set."); } }
    function updateActionButtons() { const buttons = actionButtonsContainer.querySelectorAll('button'); buttons.forEach(btn => btn.disabled = true); if (currentScenario === 'RFI') { actionButtonsContainer.querySelector('[data-action="F"]').disabled = false; actionButtonsContainer.querySelector('[data-action="R"]').disabled = false; if (currentStackDepth === '10bb') { actionButtonsContainer.querySelector('[data-action="P"]').disabled = false; actionButtonsContainer.querySelector('[data-action="R"]').disabled = true; } } else if (currentScenario.startsWith('vs_')) { actionButtonsContainer.querySelector('[data-action="F"]').disabled = false; actionButtonsContainer.querySelector('[data-action="C"]').disabled = false; actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false; if (currentStackDepth === '10bb') { actionButtonsContainer.querySelector('[data-action="P"]').disabled = false; actionButtonsContainer.querySelector('[data-action="3B"]').disabled = true; } } }
    function setupNewHand() { /* ... (uendret logikk fra V11 - bruker while loop etc.) ... */ clearTimeout(autoNewHandTimer); console.log("--- Starting setupNewHand ---"); let validScenarioGenerated = false; let attemptCounter = 0; const MAX_ATTEMPTS = 10; while (!validScenarioGenerated && attemptCounter < MAX_ATTEMPTS) { attemptCounter++; console.log(`Scenario Gen Attempt #${attemptCounter}`); feedbackText.textContent = ''; feedbackText.className = ''; correctActionText.textContent = ''; currentDeck = shuffleDeck(createDeck()); heroHand = [currentDeck.pop(), currentDeck.pop()]; actionsPrecedingHero = []; currentPotSizeBB = 1.5; firstActionPlayerLogicalIndex = -1; currentScenario = 'RFI'; currentScenarioDescription = ''; currentHeroPositionName = ''; pokerTable.querySelectorAll('.seat').forEach(seat => { updateSeatActionVisuals(seat, null); seat.classList.remove('action-on'); const posSpan = seat.querySelector('.player-position'); if (posSpan) posSpan.textContent = '--'; }); const positions = numPlayers === 9 ? positions9max : positions6max; const btnListIndex = positions.indexOf("BTN"); if (currentTrainingMode === 'standard' || !currentFixedPosition) { currentDealerPositionIndex = Math.floor(Math.random() * numPlayers); } else { const heroTargetPos = currentFixedPosition; const heroTargetPosIndexInList = positions.indexOf(heroTargetPos); if (heroTargetPosIndexInList === -1) { console.error(`Invalid fixed pos: ${heroTargetPos}. Fallback.`); currentFixedPosition = positions.includes("CO") ? "CO" : "BTN"; positionSelect.value = currentFixedPosition; heroTargetPosIndexInList = positions.indexOf(currentFixedPosition); } const targetStepsFromBtnInList = (heroTargetPosIndexInList - btnListIndex + numPlayers) % numPlayers; currentDealerPositionIndex = (HERO_LOGICAL_SEAT_INDEX - targetStepsFromBtnInList + numPlayers) % numPlayers; } console.log(`Attempt ${attemptCounter}: Dealer Index: ${currentDealerPositionIndex}`); currentHeroPositionName = calculatePositionName(HERO_LOGICAL_SEAT_INDEX, currentDealerPositionIndex, numPlayers); if (!currentHeroPositionName || currentHeroPositionName === '??') { console.error("FATAL: Pos Name Calc Error!"); alert("Pos calc error."); return; } console.log(`Attempt ${attemptCounter}: Hero Pos: ${currentHeroPositionName}`); actionsPrecedingHero = []; const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers; const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers; const sbPos = calculatePositionName(sbSeatIndex, currentDealerPositionIndex, numPlayers); const bbPos = calculatePositionName(bbSeatIndex, currentDealerPositionIndex, numPlayers); actionsPrecedingHero.push({ position: sbPos, actionType: "POST_SB", amount: 0.5 }); actionsPrecedingHero.push({ position: bbPos, actionType: "POST_BB", amount: 1 }); let scenarioGenerated = false; let potentialScenario = 'RFI'; const canFaceVsRFI = !['UTG', 'UTG+1', 'SB', 'BB'].includes(currentHeroPositionName); const tryVsRFI = Math.random() < 0.6; if (canFaceVsRFI && (currentTrainingMode === 'standard' || tryVsRFI)) { const heroListIndex = positions.indexOf(currentHeroPositionName); const possibleRaiserPositions = []; for (let i = 0; i < heroListIndex; i++) { const posName = positions[i]; if (!['SB', 'BB'].includes(posName) && GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[posName]) possibleRaiserPositions.push(posName); } if (possibleRaiserPositions.length > 0) { const raiserPosition = possibleRaiserPositions[Math.floor(Math.random() * possibleRaiserPositions.length)]; potentialScenario = `vs_${raiserPosition}_RFI`; console.log(`Attempting: ${potentialScenario}`); const rangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[potentialScenario]; if (rangeExists) { currentScenario = potentialScenario; let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3); actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount }); currentPotSizeBB = 1.5 + raiseAmount; currentScenarioDescription = `${raiserPosition} -> ${raiseAmount} BB. Din tur.`; const raiserListIndex = positions.indexOf(raiserPosition); for (let i = raiserListIndex + 1; i < heroListIndex; i++) { const foldPosName = positions[i]; if (!['SB', 'BB'].includes(foldPosName)) actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" }); } firstActionPlayerLogicalIndex = HERO_LOGICAL_SEAT_INDEX; scenarioGenerated = true; } else { console.warn(`Range missing Hero(${currentHeroPositionName}) vs ${potentialScenario}. Fallback RFI.`); } } } if (!scenarioGenerated) { currentScenario = 'RFI'; currentScenarioDescription = `Foldet til deg. Din tur.`; currentPotSizeBB = 1.5; const heroListIndex = positions.indexOf(currentHeroPositionName); const firstPossibleActorIndex = (bbSeatIndex + 1) % numPlayers; let currentLogicalIndex = firstPossibleActorIndex; let safety = 0; while (currentLogicalIndex !== HERO_LOGICAL_SEAT_INDEX && safety < numPlayers) { const foldPosName = calculatePositionName(currentLogicalIndex, currentDealerPositionIndex, numPlayers); if (!['SB', 'BB'].includes(foldPosName)) { actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" }); } currentLogicalIndex = (currentLogicalIndex + 1) % numPlayers; safety++; } if (safety >= numPlayers) console.error("RFI fold loop error!"); firstActionPlayerLogicalIndex = HERO_LOGICAL_SEAT_INDEX; } console.log(`Attempt ${attemptCounter}: Scenario: ${currentScenario}, Action Index: ${firstActionPlayerLogicalIndex}`); if (currentHeroPositionName === 'BB' && currentScenario === 'RFI') { console.warn(`Attempt ${attemptCounter}: Invalid Scenario (Fold to BB). Retrying...`); validScenarioGenerated = false; } else { validScenarioGenerated = true; } } if (!validScenarioGenerated) { console.error("FATAL: Failed valid scenario gen!"); alert("Klarte ikke generere gyldig scenario."); return; } heroPositionSpan.textContent = currentHeroPositionName; scenarioDescriptionElement.textContent = currentScenarioDescription; updatePlayerPositionsRelativeToButton(); displayHeroCards(); displayPrecedingActions(); potDisplaySpan.textContent = currentPotSizeBB.toFixed(1); updateActionButtons(); lastHandPlayedInfo = { stack: currentStackDepth, players: numPlayers, pos: currentHeroPositionName, scenario: currentScenario }; if (currentTrainingMode === 'trainer') { rangeTitleElement.textContent = `Anbefalt Range (${currentHeroPositionName}):`; displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario); } else if (rangeDisplayContainer.style.display === 'block' && lastHandPlayedInfo.pos) { rangeTitleElement.textContent = `Range for Forrige Hånd (${lastHandPlayedInfo.pos}):`; } else { rangeDisplayContainer.style.display = 'none'; } console.log("--- setupNewHand Finished (Valid Scenario) ---"); }

    // NYTT: Statistikk Funksjoner
    function initializeStatistics() {
        statistics = { Total: { total: 0, correct: 0, incorrect: 0 } };
        ALL_POSITIONS.forEach(pos => {
            statistics[pos] = { total: 0, correct: 0, incorrect: 0 };
        });
        console.log("Statistics initialized.");
    }

    function loadStatistics() {
        const savedStats = localStorage.getItem('pokerTrainerStats');
        if (savedStats) {
            try {
                statistics = JSON.parse(savedStats);
                // Sørg for at alle posisjoner og Total finnes, selv om de ikke var i lagret data
                initializeStatistics(); // Start med blankt object
                const parsedStats = JSON.parse(savedStats); // Parse på nytt
                for(const pos in parsedStats) { // Kopier over lagrede data
                    if(statistics[pos]) { // Bare hvis posisjonen er gyldig
                        statistics[pos] = parsedStats[pos];
                    }
                }
                console.log("Statistics loaded from localStorage.");
            } catch (e) {
                console.error("Error loading statistics from localStorage:", e);
                initializeStatistics(); // Fallback to default if parsing fails
            }
        } else {
            initializeStatistics(); // Initialize if no saved data
        }
    }

    function saveStatistics() {
        try {
            localStorage.setItem('pokerTrainerStats', JSON.stringify(statistics));
        } catch (e) {
            console.error("Error saving statistics to localStorage:", e);
        }
    }

    function updateStatistics(position, isCorrect) {
        if (!position || position === '??') {
            console.warn("Attempted to update stats for invalid position:", position);
            return;
        }
        // Sørg for at posisjonen eksisterer (bør være initialisert, men for sikkerhets skyld)
        if (!statistics[position]) {
            statistics[position] = { total: 0, correct: 0, incorrect: 0 };
        }

        statistics[position].total++;
        statistics.Total.total++;

        if (isCorrect) {
            statistics[position].correct++;
            statistics.Total.correct++;
        } else {
            statistics[position].incorrect++;
            statistics.Total.incorrect++;
        }
        // console.log("Stats updated:", position, statistics[position], "Total:", statistics.Total);
    }

    function displayStatistics() {
        if (!statsTableBody) return; // Sjekk om elementet finnes
        statsTableBody.innerHTML = ''; // Tøm tabellen

        // Få en sortert liste over posisjoner + Total
        const sortedPositions = [...ALL_POSITIONS].sort((a, b) => {
             // Egendefinert sortering (f.eks. etter standard rekkefølge)
             const order = positions9max; // Bruk 9max som basis
             return order.indexOf(a) - order.indexOf(b);
        });
        const displayOrder = [...sortedPositions, 'Total']; // Legg til Total til slutt

        displayOrder.forEach(pos => {
            const stats = statistics[pos];
            if (!stats || stats.total === 0) return; // Hopp over posisjoner uten data

            const percentage = (stats.total > 0) ? ((stats.correct / stats.total) * 100).toFixed(1) : '0.0';

            const row = statsTableBody.insertRow();
            row.insertCell().textContent = pos;
            row.insertCell().textContent = stats.total;
            row.insertCell().textContent = stats.correct;
            row.insertCell().textContent = stats.incorrect;
            row.insertCell().textContent = `${percentage}%`;
        });
    }

    function resetStatistics() {
         if (confirm("Er du sikker på at du vil nullstille all statistikk? Dette kan ikke angres.")) {
             initializeStatistics(); // Reset internal object
             saveStatistics();      // Save the empty object
             displayStatistics();   // Update the table display
             console.log("Statistics reset.");
         }
    }


    function handleUserAction(userActionCode) { /* ... (Legg til stats-oppdatering) ... */
        clearTimeout(autoNewHandTimer);
        const handKey = getHandKey(heroHand); if (!handKey || !currentHeroPositionName || currentHeroPositionName === '??') { console.error("Invalid state handleUserAction", {handKey, currentHeroPositionName}); return; }
        console.log(`Handling: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}, Hand: ${handKey}, Action: ${userActionCode}`);

        const infoForRangeDisplay = { ...lastHandPlayedInfo }; // Lagre før feedback/ny hånd
        const gtoActionObject = getGtoAction(infoForRangeDisplay.stack, infoForRangeDisplay.players, infoForRangeDisplay.pos, infoForRangeDisplay.scenario, handKey); if (!gtoActionObject) { console.error("Failed GTO obj."); feedbackText.textContent = "Error: No GTO data."; feedbackText.className = 'incorrect'; return; }

        // --- Feedback Logic ---
        const actions = Object.keys(gtoActionObject); const frequencies = Object.values(gtoActionObject); let feedback = '', correctActionDescription = '', isCorrect = false, primaryAction = 'F', primaryFreq = 0; if (actions.length > 0) { actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } }); } else { primaryAction = 'F'; primaryFreq = 1.0; gtoActionObject['F'] = 1.0; actions.push('F'); frequencies.push(1.0); } let normalizedUserAction = userActionCode; if (currentScenario === 'RFI' && currentStackDepth === '10bb' && userActionCode === 'P') normalizedUserAction = 'P'; else if (currentScenario === 'RFI' && userActionCode === 'R') normalizedUserAction = 'R'; else if (currentScenario.startsWith('vs_') && currentStackDepth === '10bb' && userActionCode === 'P') normalizedUserAction = 'P'; else if (currentScenario.startsWith('vs_') && userActionCode === '3B') normalizedUserAction = '3B'; else if (currentScenario.startsWith('vs_') && userActionCode === 'C') normalizedUserAction = 'C'; else if (userActionCode === 'F') normalizedUserAction = 'F'; else normalizedUserAction = userActionCode; if (gtoActionObject[normalizedUserAction] && gtoActionObject[normalizedUserAction] > 0) { isCorrect = true; if (normalizedUserAction === primaryAction && gtoActionObject[normalizedUserAction] >= 0.85) { feedback = "Korrekt!"; feedbackText.className = 'correct'; } else if (actions.length > 1 && frequencies.filter(f => f > 0).length > 1) { feedback = "OK (Mixed Strategi)"; feedbackText.className = 'correct'; } else { feedback = "Korrekt!"; feedbackText.className = 'correct'; } } else { feedback = "Feil!"; feedbackText.className = 'incorrect'; isCorrect = false; } correctActionDescription = "Anbefalt GTO: "; let actionStrings = []; Object.entries(gtoActionObject).forEach(([act, freq]) => { if (freq > 0) { let percentage = (freq * 100).toFixed(0); if (actions.length === 1 || freq === 1.0) percentage = "100"; actionStrings.push(`${act} (${percentage}%)`); } }); if (actionStrings.length === 0) actionStrings.push("F (100%)"); correctActionDescription += actionStrings.join(', '); if (!isCorrect && actions.length > 1 && frequencies.filter(f => f > 0).length > 1) correctActionDescription += ` (Primær: ${primaryAction})`; else if (!isCorrect && actions.length >= 1 && primaryAction !== 'F') { if (gtoActionObject[primaryAction] === 1.0) correctActionDescription += ` (Du burde valgt ${primaryAction})`; else correctActionDescription += ` (Primær: ${primaryAction})`; }
        feedbackText.textContent = feedback; correctActionText.textContent = correctActionDescription;

        // --- NYTT: Oppdater statistikk ---
        updateStatistics(infoForRangeDisplay.pos, isCorrect); // Bruk pos fra forrige hånd
        saveStatistics(); // Lagre til localStorage
        displayStatistics(); // Vis oppdatert tabell
        // -----------------------------

        // --- Vis Range & Start Timer ---
        displayRangeGridForSituation(infoForRangeDisplay.stack, infoForRangeDisplay.players, infoForRangeDisplay.pos, infoForRangeDisplay.scenario);
        rangeTitleElement.textContent = `Range for Forrige Hånd (${infoForRangeDisplay.pos || '--'}):`;

        const delaySeconds = parseInt(delayInput.value, 10);
        if (!isNaN(delaySeconds) && delaySeconds >= 0) { console.log(`Starting ${delaySeconds}s timer...`); autoNewHandTimer = setTimeout(() => { console.log("Auto-starting new hand."); setupNewHand(); }, delaySeconds * 1000); }
        else { console.log("Invalid delay, auto new hand disabled."); }
        actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    }
    function displayRangeGridForSituation(stack, players, pos, scenario) { /* ... (uendret fra V11) ... */ rangeGrid.innerHTML = ''; const fullRange = getFullRange(stack, players, pos, scenario); rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} - Scenario: ${scenario}`; if (!fullRange || Object.keys(fullRange).length === 0) { rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center; color: red;">Error: Range not loaded for ${pos} ${scenario} (${stack}, ${players}max).</p>`; rangeDisplayContainer.style.display = 'block'; return; } const ranksRev = ranks.slice().reverse(); ranksRev.forEach((rank1, index1) => { ranksRev.forEach((rank2, index2) => { const cell = document.createElement('div'); cell.classList.add('range-cell'); let handKey; if (index1 === index2) handKey = rank1 + rank2; else if (index1 < index2) handKey = rank1 + rank2 + 's'; else handKey = rank2 + rank1 + 'o'; let displayText = '', displayRank1 = rank1 === 'T' ? '10' : rank1, displayRank2 = rank2 === 'T' ? '10' : rank2; if (index1 === index2) displayText = displayRank1 + displayRank2; else if (index1 < index2) displayText = displayRank1 + displayRank2; else displayText = displayRank2 + displayRank1; cell.textContent = displayText; const gtoAction = fullRange[handKey] || { "F": 1.0 }; const actions = Object.keys(gtoAction); const frequencies = Object.values(gtoAction); let tooltipText = `${handKey}:\n`, primaryAction = 'F', isMixed = false, primaryFreq = 0; if (actions.length > 0) { actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } }); isMixed = frequencies.filter(f => f > 0).length > 1; } else { primaryAction = 'F'; gtoAction['F'] = 1.0; } let actionStrings = []; Object.entries(gtoAction).forEach(([act, freq]) => { if (freq > 0) actionStrings.push(`${act}: ${(freq * 100).toFixed(0)}%`); }); if (actionStrings.length === 0) actionStrings.push("F: 100%"); tooltipText += actionStrings.join('\n'); if (isMixed) cell.classList.add('range-mixed'); else if (['R', '3B', 'P'].includes(primaryAction)) cell.classList.add('range-raise'); else if (primaryAction === 'C') cell.classList.add('range-call'); else cell.classList.add('range-fold'); const tooltipSpan = document.createElement('span'); tooltipSpan.classList.add('tooltiptext'); tooltipSpan.textContent = tooltipText; cell.appendChild(tooltipSpan); rangeGrid.appendChild(cell); }); }); rangeDisplayContainer.style.display = 'block'; }

    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => { clearTimeout(autoNewHandTimer); numPlayers = parseInt(e.target.value.slice(0,1)); calculateVisualHeroSeatIndex(); setupTableUI(); populatePositionSelect(); setupNewHand(); });
    stackDepthSelect.addEventListener('change', (e) => { clearTimeout(autoNewHandTimer); currentStackDepth = e.target.value; setupNewHand(); });
    trainingModeSelect.addEventListener('change', (e) => { clearTimeout(autoNewHandTimer); currentTrainingMode = e.target.value; if (currentTrainingMode === 'trainer') { positionLabel.style.display = 'inline'; positionSelect.style.display = 'inline'; populatePositionSelect(); currentFixedPosition = positionSelect.value; } else { positionLabel.style.display = 'none'; positionSelect.style.display = 'none'; currentFixedPosition = null; } setupNewHand(); });
    positionSelect.addEventListener('change', (e) => { clearTimeout(autoNewHandTimer); if (currentTrainingMode === 'trainer') { currentFixedPosition = e.target.value; setupNewHand(); } });
    newHandBtn.addEventListener('click', () => { clearTimeout(autoNewHandTimer); setupNewHand(); });
    actionButtonsContainer.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' && !e.target.disabled) { actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true); handleUserAction(e.target.dataset.action); } });
    resetStatsBtn.addEventListener('click', resetStatistics); // NYTT

    // --- Initialisering ---
    console.log("Initializing Poker Trainer V2.5 + Stats...");
    calculateVisualHeroSeatIndex();
    initializeStatistics(); // Opprett stats-objektet
    loadStatistics();       // Last evt. lagrede data
    setupTableUI();
    populatePositionSelect();
    setupNewHand();
    displayStatistics();    // Vis statistikk ved start
    console.log("Initialization complete.");
});
