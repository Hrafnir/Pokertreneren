// script.js (Versjon 6 - UI Forbedringer: Hero nederst, actions++)

document.addEventListener('DOMContentLoaded', () => {
    // --- Globale Variabler & Tilstand ---
    let currentDeck = [];
    let heroHand = [];
    let currentHeroPositionName = ''; // Logisk posisjon (UTG, BTN...)
    let currentDealerPositionIndex = -1; // Sete-indeks for dealer
    let currentScenario = 'RFI';
    let currentScenarioDescription = '';
    let actionsPrecedingHero = [];
    let numPlayers = 9;
    let currentStackDepth = '40bb';
    let currentTrainingMode = 'standard';
    let currentFixedPosition = null; // Posisjonen som trenes i Trainer mode
    let currentPotSizeBB = 1.5;
    let firstActionPlayerIndex = -1; // Sete-indeks for første som handler (relativt til Hero)

    // --- DOM Elementer ---
    const gameTypeSelect = document.getElementById('gameType');
    const stackDepthSelect = document.getElementById('stackDepth');
    const trainingModeSelect = document.getElementById('trainingMode');
    const positionLabel = document.getElementById('positionLabel');
    const positionSelect = document.getElementById('positionSelect');
    const newHandBtn = document.getElementById('newHandBtn');
    const pokerTable = document.querySelector('.poker-table');
    const heroPositionSpan = document.getElementById('heroPosition'); // Viser logisk posisjon
    // Fjernet heroCardsContainer, kort vises nå i setet
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
    let VISUAL_HERO_SEAT_INDEX; // Settes basert på numPlayers

    // --- Funksjoner ---

    function calculateVisualHeroSeatIndex() {
        VISUAL_HERO_SEAT_INDEX = Math.floor(numPlayers / 2); // Plasserer Hero nederst
        console.log(`Visual Hero Seat Index set to: ${VISUAL_HERO_SEAT_INDEX} for ${numPlayers} players.`);
    }

    function createDeck() { /* ... (uendret) ... */
         const deck = [];
         for (const suit of suits) {
             for (const rank of ranks) {
                 deck.push(rank + suit);
             }
         }
         return deck;
    }

    function shuffleDeck(deck) { /* ... (uendret) ... */
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function getHandKey(cards) { /* ... (uendret) ... */
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

    function calculatePositionName(seatIndex, dealerIndex, numPlayers) { /* ... (uendret, bruker logiske indekser) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions || positions.length !== numPlayers) {
            console.error("Feil i calculatePositionName - ugyldige input", seatIndex, dealerIndex, numPlayers);
            return "??";
        }
        const relativeIndex = (seatIndex - dealerIndex + numPlayers) % numPlayers;
        const btnListIndex = positions.indexOf("BTN");
        if (btnListIndex === -1) {
            console.error("Fant ikke BTN i positions array for", numPlayers);
            return "??";
        }
        const adjustedListIndex = (btnListIndex + relativeIndex) % numPlayers;
        return positions[adjustedListIndex] || "??";
    }

     function getActualSeatIndex(positionName, dealerIndex, numPlayers) { /* ... (uendret, returnerer logisk seteindeks) ... */
         const positions = numPlayers === 9 ? positions9max : positions6max;
         if (dealerIndex < 0 || !positions || positions.length !== numPlayers) {
             console.error("Feil i getActualSeatIndex - ugyldige input", positionName, dealerIndex, numPlayers);
             return -1;
         }
         const listIndex = positions.indexOf(positionName);
         if (listIndex === -1) {
             // console.warn(`Kunne ikke finne posisjon '${positionName}' i list for ${numPlayers}max.`);
             return -1;
         }
         const btnListIndex = positions.indexOf("BTN");
          if (btnListIndex === -1) {
             console.error("Fant ikke BTN i positions array for", numPlayers);
             return -1;
         }
          const stepsFromBtnInList = (listIndex - btnListIndex + numPlayers) % numPlayers;
         const actualSeatIndex = (dealerIndex + stepsFromBtnInList) % numPlayers;
         return actualSeatIndex;
     }

    function populatePositionSelect() { /* ... (uendret) ... */
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = '';
        const trainablePositions = positions; // La alle være valgbare
        trainablePositions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        let defaultPos = "CO";
        if (!trainablePositions.includes(defaultPos)) defaultPos = "BTN";
        if (!trainablePositions.includes(defaultPos)) defaultPos = positions[Math.floor(positions.length / 2)];
        positionSelect.value = defaultPos;
        currentFixedPosition = positionSelect.value;
    }

    function getSeatPosition(seatIndex, totalPlayers) { /* ... (uendret, plasserer visuelt) ... */
         const angleOffset = -90;
         const angleIncrement = 360 / totalPlayers;
         const targetAngle = angleOffset + seatIndex * angleIncrement;

         // Juster for å få VISUAL_HERO_SEAT_INDEX til å være nederst (ca 90 grader)
         const heroTargetAngle = 90;
         const currentHeroAngle = angleOffset + VISUAL_HERO_SEAT_INDEX * angleIncrement;
         const rotationAdjustment = heroTargetAngle - currentHeroAngle;
         const finalAngle = targetAngle + rotationAdjustment;

         const angleRad = finalAngle * (Math.PI / 180);
         const radiusX = 45;
         const radiusY = 42;
         const left = 50 + radiusX * Math.cos(angleRad);
         const top = 50 + radiusY * Math.sin(angleRad);
         return { top: `${top}%`, left: `${left}%` };
    }

     function getButtonPosition(dealerSeatElement) { /* ... (uendret) ... */
        if (!dealerSeatElement) return { top: '50%', left: '50%' };
        const tableRect = pokerTable.getBoundingClientRect();
        const seatRect = dealerSeatElement.getBoundingClientRect();
        const seatCenterX = (seatRect.left + seatRect.width / 2) - tableRect.left;
        const seatCenterY = (seatRect.top + seatRect.height / 2) - tableRect.top;
        const tableCenterX = tableRect.width / 2;
        const tableCenterY = tableRect.height / 2;
        const angleRad = Math.atan2(seatCenterY - tableCenterY, seatCenterX - tableCenterX);
        const buttonOffset = 25; // Økt litt for synlighet
        const btnLeft = seatCenterX + buttonOffset * Math.cos(angleRad) - dealerButtonElement.offsetWidth / 2;
        const btnTop = seatCenterY + buttonOffset * Math.sin(angleRad) - dealerButtonElement.offsetHeight / 2;
        return { top: `${btnTop}px`, left: `${btnLeft}px` };
     }

    // Setter opp det visuelle bordet med Hero nederst
    function setupTableUI() {
        calculateVisualHeroSeatIndex(); // Bestem Hero sin visuelle plass
        pokerTable.innerHTML = '';
        pokerTable.appendChild(dealerButtonElement);
        pokerTable.appendChild(potDisplaySpan.parentNode);
        pokerTable.appendChild(scenarioDescriptionElement);

        let opponentCounter = 1;
        for (let i = 0; i < numPlayers; i++) {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat');
            seatDiv.dataset.seatId = i; // Lagre den *logiske* seteindeksen
            const pos = getSeatPosition(i, numPlayers); // Få visuell posisjon
            seatDiv.style.left = pos.left;
            seatDiv.style.top = pos.top;

            let playerName;
            if (i === VISUAL_HERO_SEAT_INDEX) {
                playerName = "Hero";
                seatDiv.classList.add('hero-seat'); // Merk Hero visuelt
            } else {
                playerName = `Spiller ${opponentCounter++}`;
            }

            // Bruk en indre div for innhold for bedre kontroll
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
            console.error("Dealer position not set before updating positions");
            return;
        };

        const seats = pokerTable.querySelectorAll('.seat');
        let heroActualPosition = "??";

        seats.forEach((seat) => {
            const logicalSeatIndex = parseInt(seat.dataset.seatId); // Hent den lagrede logiske indeksen
            const positionName = calculatePositionName(logicalSeatIndex, currentDealerPositionIndex, numPlayers);

            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) {
                positionSpan.textContent = positionName;
            }
            // Nullstill handlingstekst og visuelle klasser (unntatt hero-seat)
            updateSeatActionVisuals(seat, null); // Bruk hjelpefunksjon
            seat.classList.remove('action-on');

            if (logicalSeatIndex === VISUAL_HERO_SEAT_INDEX) {
                // Dette er Hero sitt visuelle sete, lagre den logiske posisjonen
                heroActualPosition = positionName;
            }
        });

         currentHeroPositionName = heroActualPosition; // Oppdater global state
         heroPositionSpan.textContent = currentHeroPositionName; // Oppdater UI for posisjon

        // Flytt dealerknappen til riktig *visuelt* sete
        const dealerSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if(dealerSeatElement) {
            const btnPos = getButtonPosition(dealerSeatElement);
            dealerButtonElement.style.top = btnPos.top;
            dealerButtonElement.style.left = btnPos.left;
        } else {
             dealerButtonElement.style.top = '10%'; dealerButtonElement.style.left = '10%'; // Fallback
        }

         // Marker hvem som har handlingen
          if (firstActionPlayerIndex !== -1) {
               // Finn det *visuelle* setet for den som har handlingen
               const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
               if (actionSeatElement) actionSeatElement.classList.add('action-on');
          } else if (VISUAL_HERO_SEAT_INDEX !== -1 && currentHeroPositionName !== '??') {
               // Default til at Hero har action
                const heroSeatElement = pokerTable.querySelector(`.seat.hero-seat`); // Finn via klasse
                if(heroSeatElement) heroSeatElement.classList.add('action-on');
          }
    }


    function getCardComponents(cardString) { /* ... (uendret) ... */
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


    // Viser Hero sine kort i det dedikerte Hero-setet nederst
    function displayHeroCards() {
         const heroSeat = pokerTable.querySelector('.seat.hero-seat'); // Finn Hero sitt sete
         if (!heroSeat) {
             console.error("Could not find Hero seat to display cards.");
             return;
         }
         const cardsContainer = heroSeat.querySelector('.player-cards');
         if (!cardsContainer) {
             console.error("Could not find player-cards container in Hero seat.");
             return;
         }

         cardsContainer.innerHTML = ''; // Tøm først
         if (heroHand.length === 2) {
             heroHand.forEach(card => {
                 const components = getCardComponents(card);
                 const cardDiv = document.createElement('div');
                 // Bruk klasser fra CSS for kort inni seter
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
                 cardsContainer.appendChild(cardDiv);
             });
         } else {
             // Vis kortholdere hvis ingen kort
             cardsContainer.innerHTML = `
                 <div class="card card-placeholder"></div>
                 <div class="card card-placeholder"></div>`;
         }
    }

    // Hjelpefunksjon for å oppdatere visuell stil og tekst for en handling på et sete
    function updateSeatActionVisuals(seatElement, actionInfo) {
        if (!seatElement) return;

        const actionSpan = seatElement.querySelector('.player-action');
        const playerCardsDiv = seatElement.querySelector('.player-cards');

        // Fjern gamle action-klasser fra setet
        seatElement.classList.remove('seat-folded', 'seat-called', 'seat-raised', 'seat-3bet', 'seat-pushed', 'seat-posted-blind');
        // Fjern gamle action-klasser fra tekst-span
        if (actionSpan) {
            actionSpan.className = 'player-action'; // Reset classes
            actionSpan.textContent = ''; // Clear text
        }
        // Vis kort-placeholders som standard (hvis ikke Hero)
        if (playerCardsDiv && !seatElement.classList.contains('hero-seat')) {
             playerCardsDiv.style.opacity = '1'; // Reset opacity
             playerCardsDiv.innerHTML = `
                 <div class="card card-placeholder"></div>
                 <div class="card card-placeholder"></div>`;
        }


        if (!actionInfo) return; // Hvis null, bare nullstill

        let actionText = '';
        let actionClassSuffix = ''; // For span fargelegging
        let seatClassSuffix = ''; // For sete bakgrunn/opacity

        switch (actionInfo.actionType.toUpperCase()) {
            case 'FOLD':
                actionText = 'Fold';
                actionClassSuffix = 'fold';
                seatClassSuffix = 'folded';
                // Skjul kortene helt ved fold
                 if (playerCardsDiv && !seatElement.classList.contains('hero-seat')) {
                    playerCardsDiv.innerHTML = '';
                 }
                break;
            case 'CALL':
                actionText = `Call ${actionInfo.amount} BB`;
                actionClassSuffix = 'call';
                seatClassSuffix = 'called';
                break;
            case 'RAISE':
                actionText = `Raise ${actionInfo.amount} BB`;
                actionClassSuffix = 'raise';
                seatClassSuffix = 'raised';
                break;
            case '3B': // Behandle 3B likt som Raise visuelt her
                actionText = `3-Bet ${actionInfo.amount} BB`;
                actionClassSuffix = '3bet'; // Kan brukes for fargelegging
                seatClassSuffix = 'raised'; // Bruk samme sete-stil
                break;
            case 'PUSH':
                actionText = `Push ${actionInfo.amount} BB`;
                actionClassSuffix = 'push';
                seatClassSuffix = 'pushed'; // Kan ha egen stil
                break;
            case 'POST_SB':
            case 'POST_BB':
                actionText = `Post ${actionInfo.amount} BB`;
                actionClassSuffix = 'post';
                seatClassSuffix = 'posted-blind';
                break;
            default:
                actionText = actionInfo.actionType;
        }

        if (actionSpan) {
            actionSpan.textContent = actionText;
            if (actionClassSuffix) {
                 actionSpan.classList.add(`action-${actionClassSuffix}`);
            }
        }
        if (seatClassSuffix) {
            seatElement.classList.add(`seat-${seatClassSuffix}`);
        }
    }


    // Viser handlingene som skjedde før Hero sin tur
    function displayPrecedingActions() {
        // Nullstill alle seter først (unntatt Hero sine kort)
        pokerTable.querySelectorAll('.seat').forEach(seat => {
            updateSeatActionVisuals(seat, null);
            seat.classList.remove('action-on');
        });

        // Vis faktiske handlinger
        actionsPrecedingHero.forEach(actionInfo => {
             const seatIndex = getActualSeatIndex(actionInfo.position, currentDealerPositionIndex, numPlayers);
             if (seatIndex === -1) {
                 console.warn(`Could not find seat index for position ${actionInfo.position} in displayPrecedingActions`);
                 return;
             }
             // Finn det *visuelle* setet som tilsvarer den logiske indeksen
             const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${seatIndex}"]`);
             if (seatElement) {
                 updateSeatActionVisuals(seatElement, actionInfo);
             }
         });

         // Marker hvem som har handlingen (vanligvis Hero i denne fasen)
         if (firstActionPlayerIndex !== -1) {
             const actionSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
             if (actionSeatElement) actionSeatElement.classList.add('action-on');
         } else {
             // Hvis ingen spesifikk, anta Hero
              const heroSeatElement = pokerTable.querySelector(`.seat.hero-seat`);
                if(heroSeatElement) heroSeatElement.classList.add('action-on');
         }
    }

     function updateActionButtons() { /* ... (uendret, logikken er basert på scenario/stack) ... */
         const buttons = actionButtonsContainer.querySelectorAll('button');
         buttons.forEach(btn => btn.disabled = true); // Start med å deaktivere alle

         if (currentScenario === 'RFI') {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
             if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
                 actionButtonsContainer.querySelector('[data-action="R"]').disabled = true;
             }
         }
         else if (currentScenario.startsWith('vs_')) {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="C"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false;
              if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
                 actionButtonsContainer.querySelector('[data-action="3B"]').disabled = true;
             }
         }
         else { } // Behold alle deaktivert for ukjente scenarioer
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
        firstActionPlayerIndex = -1;
        currentScenario = 'RFI';
        currentScenarioDescription = '';
        currentHeroPositionName = '';

        // Nullstill alle seter visuelt
        pokerTable.querySelectorAll('.seat').forEach(seat => {
            updateSeatActionVisuals(seat, null);
            seat.classList.remove('action-on');
        });


        // 2. Sett Dealerknappens *logiske* posisjon (seteindeks)
        if (currentTrainingMode === 'standard' || !currentFixedPosition) {
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
             console.log(`Standard mode: Dealer set to random seat index ${currentDealerPositionIndex}`);
        } else {
            // Posisjonstrener: Plasser dealer slik at Hero (på VISUAL_HERO_SEAT_INDEX) får den valgte logiske posisjonen
             const positions = numPlayers === 9 ? positions9max : positions6max;
             const heroTargetPos = currentFixedPosition; // Den logiske posisjonen Hero *skal* ha
             const heroTargetPosIndexInList = positions.indexOf(heroTargetPos);

             if (heroTargetPosIndexInList === -1) { // Fallback hvis ugyldig valg
                 console.error(`Invalid fixed position selected: ${heroTargetPos}. Falling back.`);
                 currentFixedPosition = positions.includes("CO") ? "CO" : (positions.includes("BTN") ? "BTN" : positions[0]);
                 positionSelect.value = currentFixedPosition;
                 heroTargetPosIndexInList = positions.indexOf(currentFixedPosition);
             }

             const btnListIndex = positions.indexOf("BTN");
             const targetStepsFromBtnInList = (heroTargetPosIndexInList - btnListIndex + numPlayers) % numPlayers;

             // Vi vil at calculatePositionName(VISUAL_HERO_SEAT_INDEX, D, numPlayers) == heroTargetPos
             // Dette betyr at den *logiske* posisjonen til det *visuelle* hero-setet skal være heroTargetPos.
             // Fra calculatePositionName: (btnListIndex + (VISUAL_HERO_SEAT_INDEX - D + N) % N ) % N = heroTargetPosIndexInList
             // Vi trenger å finne D.
             // La relativeIndex = (VISUAL_HERO_SEAT_INDEX - D + N) % N
             // (btnListIndex + relativeIndex) % N = heroTargetPosIndexInList
             // La `targetListDiff = (heroTargetPosIndexInList - btnListIndex + N) % N`. Dette er `targetStepsFromBtnInList`.
             // Så `relativeIndex` må være lik `targetStepsFromBtnInList`.
             // (VISUAL_HERO_SEAT_INDEX - D + N) % N = targetStepsFromBtnInList
             // La S = VISUAL_HERO_SEAT_INDEX, T = targetStepsFromBtnInList
             // (S - D + N) % N = T
             // S - D kongruent med T (mod N)
             // -D kongruent med T - S (mod N)
             // D kongruent med S - T (mod N)
             currentDealerPositionIndex = (VISUAL_HERO_SEAT_INDEX - targetStepsFromBtnInList + numPlayers) % numPlayers;

             console.log(`Trainer mode: Target ${heroTargetPos}. Visual Hero Seat ${VISUAL_HERO_SEAT_INDEX}. Dealer set to seat index ${currentDealerPositionIndex}.`);
        }

        // 3. Oppdater logiske posisjonsnavn basert på dealer (setter currentHeroPositionName)
        updatePlayerPositionsRelativeToButton();
        if (!currentHeroPositionName || currentHeroPositionName === '??') {
             console.error("FATAL: Could not determine Hero Position after setting dealer!");
             alert("Kritisk feil ved posisjonsberegning."); return;
        }
         console.log(`Hero's logical position is: ${currentHeroPositionName}`);

        // 4. Generer Scenario (RFI eller vs RFI) - Logikk uendret
        const positions = numPlayers === 9 ? positions9max : positions6max;
        const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers;
        const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
        const sbPos = calculatePositionName(sbSeatIndex, currentDealerPositionIndex, numPlayers);
        const bbPos = calculatePositionName(bbSeatIndex, currentDealerPositionIndex, numPlayers);

        actionsPrecedingHero.push({ position: sbPos, actionType: "POST_SB", amount: 0.5 });
        actionsPrecedingHero.push({ position: bbPos, actionType: "POST_BB", amount: 1 });

        let scenarioGenerated = false;
        let potentialScenario = 'RFI';

        const canFaceRFI = !['UTG', 'UTG+1', 'SB', 'BB'].includes(currentHeroPositionName); // Forenklet sjekk
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
                 console.log(`Attempting to generate scenario: ${potentialScenario}`);
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
                    // Hvem handler? Det er Hero sitt *logiske* sete.
                    firstActionPlayerIndex = getActualSeatIndex(currentHeroPositionName, currentDealerPositionIndex, numPlayers);
                    scenarioGenerated = true;
                     console.log(`Scenario successfully set to: ${currentScenario}. Action on seat ${firstActionPlayerIndex}`);
                 } else {
                      console.warn(`Mangler range for Hero (${currentHeroPositionName}) i scenario ${potentialScenario}. Faller tilbake til RFI.`);
                 }
            }
        }

        if (!scenarioGenerated) {
            currentScenario = 'RFI';
            currentScenarioDescription = `Det foldes til deg. Din tur.`;
             const heroListIndex = positions.indexOf(currentHeroPositionName);
             const firstPossibleActorListIndex = positions.indexOf(positions.find(p => !['SB','BB'].includes(p))); // Første etter blinds

             for (let i = firstPossibleActorListIndex; i < heroListIndex; i++) {
                  const foldPosName = positions[i];
                   if (!['SB', 'BB'].includes(foldPosName)) {
                        actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" });
                   }
             }
              // Hvem handler? Det er Hero sitt *logiske* sete.
              firstActionPlayerIndex = getActualSeatIndex(currentHeroPositionName, currentDealerPositionIndex, numPlayers);
              console.log(`Scenario set to: ${currentScenario}. Action on seat ${firstActionPlayerIndex}`);
        }


        // 5. Oppdater resten av UI
        scenarioDescriptionElement.textContent = currentScenarioDescription;
        updatePlayerPositionsRelativeToButton(); // Oppdater logiske posisjonsnavn
        displayHeroCards(); // Vis Hero sine kort i bunnsetet
        displayPrecedingActions(); // Vis blinds, folds, raises etc.
        potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
        updateActionButtons();

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
         if (!handKey || !currentHeroPositionName || currentHeroPositionName === '??') {
              console.error("Kan ikke håndtere handling - ugyldig state", {handKey, currentHeroPositionName, heroHand});
              feedbackText.textContent = "Feil: Ugyldig spilltilstand.";
              feedbackText.className = 'incorrect';
              return;
         }
         console.log(`Handling for: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}, Hånd: ${handKey}, BrukerValg: ${userActionCode}`);
         const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey);
         if (!gtoActionObject) {
             console.error("Klarte ikke hente GTO action objekt (uventet feil).");
             feedbackText.textContent = "Feil: Kunne ikke finne GTO data.";
             correctActionText.textContent = `Mangler data for: ${currentStackDepth} ${numPlayers}max ${currentHeroPositionName} ${currentScenario} ${handKey}`;
             feedbackText.className = 'incorrect';
             return;
         }
         const actions = Object.keys(gtoActionObject);
         const frequencies = Object.values(gtoActionObject);
         let feedback = '';
         let correctActionDescription = '';
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
          } else {
               primaryAction = 'F';
               primaryFreq = 1.0;
               gtoActionObject['F'] = 1.0;
               actions.push('F');
               frequencies.push(1.0);
          }
         let normalizedUserAction = userActionCode;
         if (currentScenario === 'RFI' && currentStackDepth === '10bb' && userActionCode === 'P') { normalizedUserAction = 'P'; }
         else if (currentScenario === 'RFI' && userActionCode === 'R') { normalizedUserAction = 'R'; }
         else if (currentScenario.startsWith('vs_') && currentStackDepth === '10bb' && userActionCode === 'P') { normalizedUserAction = 'P'; }
         else if (currentScenario.startsWith('vs_') && userActionCode === '3B') { normalizedUserAction = '3B'; }
         else if (currentScenario.startsWith('vs_') && userActionCode === 'C') { normalizedUserAction = 'C'; }
         else if (userActionCode === 'F') { normalizedUserAction = 'F'; }
         else { normalizedUserAction = userActionCode; }

         if (gtoActionObject[normalizedUserAction] && gtoActionObject[normalizedUserAction] > 0) {
             isCorrect = true;
             if (normalizedUserAction === primaryAction && gtoActionObject[normalizedUserAction] >= 0.85) {
                  feedback = "Korrekt!"; feedbackText.className = 'correct';
             } else if (actions.length > 1 && frequencies.filter(f => f>0).length > 1) {
                  feedback = "OK (Mixed Strategi)"; feedbackText.className = 'correct';
             } else {
                 feedback = "Korrekt!"; feedbackText.className = 'correct';
             }
         } else {
             feedback = "Feil!"; feedbackText.className = 'incorrect'; isCorrect = false;
         }
         correctActionDescription = "Anbefalt GTO: ";
         let actionStrings = [];
         Object.entries(gtoActionObject).forEach(([act, freq]) => {
              if (freq > 0) {
                  let percentage = (freq * 100).toFixed(0);
                  if (actions.length === 1 || freq === 1.0) percentage = "100"; // Forenkling
                  actionStrings.push(`${act} (${percentage}%)`);
              }
         });
         if (actionStrings.length === 0) actionStrings.push("F (100%)"); // Fallback
         correctActionDescription += actionStrings.join(', ');
         if (!isCorrect && actions.length > 1 && frequencies.filter(f=>f>0).length > 1) {
             correctActionDescription += ` (Primær: ${primaryAction})`;
         } else if (!isCorrect && actions.length >= 1 && primaryAction !== 'F') {
            if(gtoActionObject[primaryAction] === 1.0) correctActionDescription += ` (Du burde valgt ${primaryAction})`;
            else correctActionDescription += ` (Primær: ${primaryAction})`;
         }
         feedbackText.textContent = feedback;
         correctActionText.textContent = correctActionDescription;
         if (currentTrainingMode === 'standard' || !isCorrect) {
             displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
         }
         actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    }

     function displayRangeGridForSituation(stack, players, pos, scenario) { /* ... (uendret) ... */
         rangeGrid.innerHTML = '';
         const fullRange = getFullRange(stack, players, pos, scenario);
          rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} - Scenario: ${scenario}`;
          if (!fullRange || Object.keys(fullRange).length === 0) {
              rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center; color: red;">Kritisk feil: Kunne ikke laste range for ${pos} i scenario ${scenario} (${stack}, ${players}max).</p>`;
              rangeDisplayContainer.style.display = 'block';
              return;
          }
         const ranksRev = ranks.slice().reverse();
         ranksRev.forEach((rank1, index1) => {
             ranksRev.forEach((rank2, index2) => {
                 const cell = document.createElement('div');
                 cell.classList.add('range-cell');
                 let handKey;
                 if (index1 === index2) { handKey = rank1 + rank2; }
                 else if (index1 < index2) { handKey = rank1 + rank2 + 's'; }
                 else { handKey = rank2 + rank1 + 'o'; }
                 let displayText = '';
                 let displayRank1 = rank1 === 'T' ? '10' : rank1;
                 let displayRank2 = rank2 === 'T' ? '10' : rank2;
                 if (index1 === index2) { displayText = displayRank1 + displayRank2; }
                 else if (index1 < index2) { displayText = displayRank1 + displayRank2; }
                 else { displayText = displayRank2 + displayRank1; }
                 cell.textContent = displayText;
                 const gtoAction = fullRange[handKey] || { "F": 1.0 };
                 const actions = Object.keys(gtoAction);
                 const frequencies = Object.values(gtoAction);
                 let tooltipText = `${handKey}:\n`;
                 let primaryAction = 'F';
                 let isMixed = false;
                 let primaryFreq = 0;
                  if (actions.length > 0) {
                      actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } });
                      isMixed = frequencies.filter(f => f > 0).length > 1;
                  } else {
                       primaryAction = 'F';
                       gtoAction['F'] = 1.0;
                  }
                 let actionStrings = [];
                 Object.entries(gtoAction).forEach(([act, freq]) => {
                     if (freq > 0) {
                         actionStrings.push(`${act}: ${(freq * 100).toFixed(0)}%`);
                     }
                 });
                 if (actionStrings.length === 0) actionStrings.push("F: 100%");
                 tooltipText += actionStrings.join('\n');

                  if (isMixed) { cell.classList.add('range-mixed'); }
                  else if (['R', '3B', 'P'].includes(primaryAction)) { cell.classList.add('range-raise'); }
                  else if (primaryAction === 'C') { cell.classList.add('range-call'); }
                  else { cell.classList.add('range-fold'); }
                 const tooltipSpan = document.createElement('span');
                 tooltipSpan.classList.add('tooltiptext');
                 tooltipSpan.textContent = tooltipText;
                 cell.appendChild(tooltipSpan);
                 rangeGrid.appendChild(cell);
             });
         });
           rangeDisplayContainer.style.display = 'block';
     }


    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => {
        numPlayers = parseInt(e.target.value.slice(0,1));
        calculateVisualHeroSeatIndex(); // Oppdater Hero sin visuelle plass
        setupTableUI();
        populatePositionSelect();
        setupNewHand();
    });

    stackDepthSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
        currentStackDepth = e.target.value;
        setupNewHand();
    });

    trainingModeSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
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

     positionSelect.addEventListener('change', (e) => { /* ... (uendret) ... */
          if (currentTrainingMode === 'trainer') {
               currentFixedPosition = e.target.value;
               setupNewHand();
          }
     });

    newHandBtn.addEventListener('click', setupNewHand);

    actionButtonsContainer.addEventListener('click', (e) => { /* ... (uendret) ... */
        if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
             actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
             handleUserAction(e.target.dataset.action);
        }
    });

    // --- Initialisering ---
    console.log("Initializing Poker Trainer V2...");
    calculateVisualHeroSeatIndex(); // Sett initiell Hero-plass
    setupTableUI();
    populatePositionSelect();
    setupNewHand();
    console.log("Initialization complete.");
});
