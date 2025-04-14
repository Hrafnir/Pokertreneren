// script.js (Versjon 5 - Fjernet fatal range check i setupNewHand)

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
    const HERO_SEAT_INDEX = 0; // Hero sitter alltid i sete 0 visuelt

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

    // Konverterer hånd (['Ac', 'Kd']) til standard nøkkel ('AKs'/'AKo'/'AA')
    function getHandKey(cards) {
         if (!cards || cards.length !== 2) return null;
         const card1Rank = cards[0][0];
         const card1Suit = cards[0][1];
         const card2Rank = cards[1][0];
         const card2Suit = cards[1][1];
         const rankOrder = ranks.slice().reverse(); // ['A', 'K', ..., '2']
         const rank1Index = rankOrder.indexOf(card1Rank);
         const rank2Index = rankOrder.indexOf(card2Rank);

         // Sorter etter rank (A høyest)
         const highRank = rank1Index < rank2Index ? card1Rank : card2Rank;
         const lowRank = rank1Index < rank2Index ? card2Rank : card1Rank;

         const suited = card1Suit === card2Suit;

         if (highRank === lowRank) { // Pocket pair
             return highRank + lowRank;
         } else { // Ikke par
             return highRank + lowRank + (suited ? 's' : 'o');
         }
    }

    // Kalkulerer posisjonsnavn basert på seteindeks, dealerknappens indeks og antall spillere
    function calculatePositionName(seatIndex, dealerIndex, numPlayers) {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        if (dealerIndex < 0 || !positions || positions.length !== numPlayers) {
            console.error("Feil i calculatePositionName - ugyldige input", seatIndex, dealerIndex, numPlayers);
            return "??"; // Sikkerhetssjekk
        }

        // Hvor mange seter er denne spilleren etter dealeren?
        const relativeIndex = (seatIndex - dealerIndex + numPlayers) % numPlayers;

        // Finn standard array-indeks for BTN
        const btnListIndex = positions.indexOf("BTN");
        if (btnListIndex === -1) {
            console.error("Fant ikke BTN i positions array for", numPlayers);
            return "??";
        }

        // Kalkuler posisjonens indeks i arrayet ved å starte fra BTN og telle frem 'relativeIndex' steg
        // Eksempel 9max: BTN er [6]. Hvis sete 0 er 3 plasser etter dealer 6 (relativeIndex=3),
        // så er posisjonen (6 + 3) % 9 = 0, som er UTG.
        // Eksempel 9max: Hvis sete 8 er 2 plasser etter dealer 6 (relativeIndex=2),
        // så er posisjonen (6 + 2) % 9 = 8, som er BB.
        const adjustedListIndex = (btnListIndex + relativeIndex) % numPlayers;

        return positions[adjustedListIndex] || "??"; // Returner navn
    }

     // Finner den faktiske seteindeksen (0 til numPlayers-1) for et gitt posisjonsnavn
     function getActualSeatIndex(positionName, dealerIndex, numPlayers) {
         const positions = numPlayers === 9 ? positions9max : positions6max;
         if (dealerIndex < 0 || !positions || positions.length !== numPlayers) {
             console.error("Feil i getActualSeatIndex - ugyldige input", positionName, dealerIndex, numPlayers);
             return -1; // Sikkerhetssjekk
         }

         const listIndex = positions.indexOf(positionName);
         if (listIndex === -1) {
             console.warn(`Kunne ikke finne posisjon '${positionName}' i list for ${numPlayers}max.`);
             return -1; // Posisjon finnes ikke
         }

         const btnListIndex = positions.indexOf("BTN");
          if (btnListIndex === -1) {
             console.error("Fant ikke BTN i positions array for", numPlayers);
             return -1;
         }

          // Hvor mange steg *er* denne posisjonen forbi BTN i listen?
          // Eksempel 9max: UTG (0) er (0 - 6 + 9) % 9 = 3 steg forbi BTN i listen.
          // Eksempel 9max: BB (8) er (8 - 6 + 9) % 9 = 2 steg forbi BTN i listen.
          const stepsFromBtnInList = (listIndex - btnListIndex + numPlayers) % numPlayers;

         // Den faktiske seteindeksen er dealerens indeks pluss disse stegene.
         // Eksempel 9max: Dealer er 6. UTG er 3 steg forbi BTN. Faktisk sete = (6 + 3) % 9 = 0.
         // Eksempel 9max: Dealer er 6. BB er 2 steg forbi BTN. Faktisk sete = (6 + 2) % 9 = 8.
         const actualSeatIndex = (dealerIndex + stepsFromBtnInList) % numPlayers;

         return actualSeatIndex;
     }


    function populatePositionSelect() {
        const positions = numPlayers === 9 ? positions9max : positions6max;
        positionSelect.innerHTML = '';
        // Lar brukeren trene alle posisjoner, selv blinds (selv om RFI ikke gir mening der)
        // Filtrer ut blinds hvis du kun vil trene RFI/vs RFI:
        // const trainablePositions = positions.filter(p => !['SB', 'BB'].includes(p));
        const trainablePositions = positions;
        trainablePositions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        // Default til en vanlig posisjon
        let defaultPos = "CO";
        if (!trainablePositions.includes(defaultPos)) defaultPos = "BTN";
        if (!trainablePositions.includes(defaultPos)) defaultPos = positions[Math.floor(positions.length / 2)]; // Fallback

        positionSelect.value = defaultPos;
        currentFixedPosition = positionSelect.value; // Sett initielt
    }

    // Beregner x,y-koordinater for et sete rundt bordet
    function getSeatPosition(seatIndex, totalPlayers) {
         const angleOffset = -90; // Start på toppen
         const angleIncrement = 360 / totalPlayers;
         const angle = angleOffset + seatIndex * angleIncrement;
         const angleRad = angle * (Math.PI / 180);
         // Juster radius for å få en mer oval form
         const radiusX = 45; // Bredere enn høy
         const radiusY = 42; // Litt smalere
         const left = 50 + radiusX * Math.cos(angleRad);
         const top = 50 + radiusY * Math.sin(angleRad);
         return { top: `${top}%`, left: `${left}%` };
    }

     // Beregner posisjon for dealerknappen relativt til dealerens sete
     function getButtonPosition(dealerSeatElement) {
        if (!dealerSeatElement) return { top: '50%', left: '50%' }; // Fallback
        const tableRect = pokerTable.getBoundingClientRect();
        const seatRect = dealerSeatElement.getBoundingClientRect();

        // Sentrum av setet relativt til bordet
        const seatCenterX = (seatRect.left + seatRect.width / 2) - tableRect.left;
        const seatCenterY = (seatRect.top + seatRect.height / 2) - tableRect.top;

        // Beregn vinkel fra bordets sentrum til setets sentrum
        const tableCenterX = tableRect.width / 2;
        const tableCenterY = tableRect.height / 2;
        const angleRad = Math.atan2(seatCenterY - tableCenterY, seatCenterX - tableCenterX);

        // Plasser knappen litt utenfor setet i samme retning
        const buttonOffset = 20; // Piksler utenfor setet
        const btnLeft = seatCenterX + buttonOffset * Math.cos(angleRad) - dealerButtonElement.offsetWidth / 2;
        const btnTop = seatCenterY + buttonOffset * Math.sin(angleRad) - dealerButtonElement.offsetHeight / 2;

        return { top: `${btnTop}px`, left: `${btnLeft}px` };
     }

    // Setter opp det visuelle bordet med riktig antall seter
    function setupTableUI() {
        pokerTable.innerHTML = ''; // Tøm bordet først
        // Legg til elementer som skal være *inne* i bordet, men ikke seter
        pokerTable.appendChild(dealerButtonElement);
        pokerTable.appendChild(potDisplaySpan.parentNode); // Legg til pot-diven
        pokerTable.appendChild(scenarioDescriptionElement); // Legg til scenario-beskrivelse

        for (let i = 0; i < numPlayers; i++) {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat');
            seatDiv.dataset.seatId = i; // Lagre seteindeks
            const pos = getSeatPosition(i, numPlayers);
            seatDiv.style.left = pos.left;
            seatDiv.style.top = pos.top;
            // Initialiser innhold for hvert sete
            seatDiv.innerHTML = `
                <span class="player-name">Spiller ${i + 1}</span>
                <span class="player-position">--</span>
                <div class="player-cards"></div>
                <span class="player-action"></span>`;
            pokerTable.appendChild(seatDiv);
        }
    }

    // Oppdaterer posisjonsnavnene på setene basert på dealerens posisjon
    function updatePlayerPositionsRelativeToButton() {
        if (currentDealerPositionIndex < 0) {
            console.error("Dealer position not set before updating positions");
            return;
        };

        const seats = pokerTable.querySelectorAll('.seat');
        let heroActualPosition = "??"; // Tilbakestill før beregning

        seats.forEach((seat) => {
            const actualSeatIndex = parseInt(seat.dataset.seatId);
            // Beregn posisjonsnavnet for dette setet
            const positionName = calculatePositionName(actualSeatIndex, currentDealerPositionIndex, numPlayers);

            const positionSpan = seat.querySelector('.player-position');
            if (positionSpan) {
                positionSpan.textContent = positionName;
            }
            // Nullstill handling og klasser
            const actionSpan = seat.querySelector('.player-action');
            if(actionSpan) actionSpan.textContent = '';
            seat.classList.remove('hero-seat', 'action-on');

            // Marker Hero sitt sete
            if (actualSeatIndex === HERO_SEAT_INDEX) {
                seat.classList.add('hero-seat');
                heroActualPosition = positionName; // Lagre Hero sin beregnede posisjon
            }
        });

         // Oppdater global state og UI for Hero sin posisjon
         currentHeroPositionName = heroActualPosition;
         heroPositionSpan.textContent = currentHeroPositionName;

        // Flytt dealerknappen
        const dealerSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${currentDealerPositionIndex}"]`);
        if(dealerSeatElement) {
            const btnPos = getButtonPosition(dealerSeatElement);
            dealerButtonElement.style.top = btnPos.top;
            dealerButtonElement.style.left = btnPos.left;
        } else {
             console.warn("Could not find dealer seat element for button positioning.");
             dealerButtonElement.style.top = '10%'; dealerButtonElement.style.left = '10%'; // Fallback
        }

         // Marker hvem som har handlingen (hvis bestemt)
          if (firstActionPlayerIndex !== -1) {
               const actionSeat = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
               if (actionSeat) actionSeat.classList.add('action-on');
          } else if (HERO_SEAT_INDEX !== -1 && currentHeroPositionName !== '??') {
              // Default til at Hero har action hvis ingen andre er satt
                const heroSeatElement = pokerTable.querySelector(`.seat[data-seat-id="${HERO_SEAT_INDEX}"]`);
                if(heroSeatElement) heroSeatElement.classList.add('action-on');
          }
    }

    // Hjelpefunksjon for å få rank/suit/klasse fra kortstreng (f.eks. 'Ac')
    function getCardComponents(cardString) {
         if (!cardString || cardString.length < 2) return { rank: '?', suit: '', suitClass: '' };
         const rank = cardString.slice(0, -1); // F.eks. 'A', 'K', 'T', '9'
         const suitCode = cardString.slice(-1); // F.eks. 'c', 'd', 'h', 's'
         let suitSymbol = '';
         let suitClass = '';
         switch (suitCode) {
             case 's': suitSymbol = '♠'; suitClass = 'spades'; break;
             case 'h': suitSymbol = '♥'; suitClass = 'hearts'; break;
             case 'd': suitSymbol = '♦'; suitClass = 'diamonds'; break;
             case 'c': suitSymbol = '♣'; suitClass = 'clubs'; break;
             default: suitSymbol = '?'; // Ukjent suit?
         }
         // Konverter 'T' til '10' for visning
         let displayRank = rank === 'T' ? '10' : rank;
         return { rank: displayRank, suit: suitSymbol, suitClass: suitClass };
    }

    // Viser Hero sine kort i UI
    function displayHeroCards() {
         heroCardsContainer.innerHTML = ''; // Tøm først
         if (heroHand.length === 2) {
             heroHand.forEach(card => {
                 const components = getCardComponents(card);
                 const cardDiv = document.createElement('div');
                 cardDiv.classList.add('card', components.suitClass); // Legg til fargeklasse
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
             // Vis kortholdere hvis ingen kort er delt ut
             heroCardsContainer.innerHTML = `
                 <div class="card card-placeholder"></div>
                 <div class="card card-placeholder"></div>`;
         }
    }

    // Viser handlingene som skjedde før Hero sin tur på bordet
    function displayPrecedingActions() {
        const seats = pokerTable.querySelectorAll('.seat');
        // Først, nullstill handlinger på alle seter unntatt Hero sin 'action-on' (som settes etterpå)
        seats.forEach(seat => {
             const actionSpan = seat.querySelector('.player-action');
             if (actionSpan) actionSpan.textContent = '';
             seat.classList.remove('action-on'); // Fjern action-markering
        });

        actionsPrecedingHero.forEach(actionInfo => {
             // Finn seteindeksen for posisjonen som gjorde handlingen
             const seatIndex = getActualSeatIndex(actionInfo.position, currentDealerPositionIndex, numPlayers);
             if (seatIndex === -1) {
                 console.warn(`Could not find seat index for position ${actionInfo.position} in displayPrecedingActions`);
                 return; // Hopp over denne handlingen hvis posisjonen er ukjent
             }
             const seatElement = pokerTable.querySelector(`.seat[data-seat-id="${seatIndex}"]`);
             if (seatElement) {
                 const actionSpan = seatElement.querySelector('.player-action');
                 if(actionSpan) {
                     let actionText = ''; let actionClass = '';
                     // Formater handlingsteksten
                     switch (actionInfo.actionType.toUpperCase()) {
                         case 'FOLD': actionText = 'Fold'; actionClass = 'fold'; break;
                         case 'CALL': actionText = `Call ${actionInfo.amount} BB`; actionClass = 'call'; break;
                         case 'RAISE': actionText = `Raise ${actionInfo.amount} BB`; actionClass = 'raise'; break;
                         case 'PUSH': actionText = `Push ${actionInfo.amount} BB`; actionClass = 'push'; break;
                         case 'POST_SB': actionText = `Post 0.5 BB`; actionClass = ''; break; // Ingen spesiell klasse for blinds
                         case 'POST_BB': actionText = `Post 1 BB`; actionClass = ''; break;
                         default: actionText = actionInfo.actionType; // Ukjent handlingstype?
                     }
                     actionSpan.textContent = actionText;
                     actionSpan.className = 'player-action'; // Nullstill klasser først
                     if (actionClass) actionSpan.classList.add(actionClass); // Legg til fargeklasse
                 }
             }
         });

         // Sørg for at setet som faktisk har handlingen blir markert
         if (firstActionPlayerIndex !== -1) {
             const actionSeat = pokerTable.querySelector(`.seat[data-seat-id="${firstActionPlayerIndex}"]`);
             if (actionSeat) actionSeat.classList.add('action-on');
         }
    }

     // Aktiverer/deaktiverer handlingsknapper basert på scenario
     function updateActionButtons() {
         const buttons = actionButtonsContainer.querySelectorAll('button');
         buttons.forEach(btn => btn.disabled = true); // Start med å deaktivere alle

         // RFI scenario: Fold, Raise, (Push hvis 10bb)
         if (currentScenario === 'RFI') {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="R"]').disabled = false;
             if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
                 actionButtonsContainer.querySelector('[data-action="R"]').disabled = true; // Bruk Push istedenfor Raise ved 10bb RFI
             }
         }
         // Vs RFI scenario: Fold, Call, 3-Bet, (Push hvis 10bb)
         else if (currentScenario.startsWith('vs_')) {
             actionButtonsContainer.querySelector('[data-action="F"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="C"]').disabled = false;
             actionButtonsContainer.querySelector('[data-action="3B"]').disabled = false;
              if (currentStackDepth === '10bb') {
                 actionButtonsContainer.querySelector('[data-action="P"]').disabled = false;
                 actionButtonsContainer.querySelector('[data-action="3B"]').disabled = true; // Bruk Push istedenfor 3Bet ved 10bb vs RFI
                 // Call kan fortsatt være et alternativ, selv ved 10bb
             }
         }
         // Andre scenarioer (ikke implementert ennå)
         else {
             // Behold alle deaktivert
         }
     }

    // Setter opp en ny hånd: stokker kortstokk, deler ut, setter dealer, genererer scenario etc.
    function setupNewHand() {
        console.log("--- Starting setupNewHand ---");
        // 1. Nullstill state og UI-elementer
        feedbackText.textContent = ''; feedbackText.className = '';
        correctActionText.textContent = '';
        rangeDisplayContainer.style.display = 'none'; rangeGrid.innerHTML = '';
        currentDeck = shuffleDeck(createDeck());
        heroHand = [currentDeck.pop(), currentDeck.pop()];
        actionsPrecedingHero = []; currentPotSizeBB = 1.5; // Startpott SB+BB
        firstActionPlayerIndex = -1; // Hvem starter handlingen (før Hero)?
        currentScenario = 'RFI'; // Default scenario
        currentScenarioDescription = '';
        currentHeroPositionName = ''; // Nullstill før beregning

        // Fjern action-markering og tekst fra alle seter
        pokerTable.querySelectorAll('.seat').forEach(seat => {
            seat.classList.remove('action-on');
            const actionSpan = seat.querySelector('.player-action');
            if(actionSpan) actionSpan.textContent = '';
        });

        // 2. Sett Dealerknappens posisjon (seteindeks)
        if (currentTrainingMode === 'standard' || !currentFixedPosition) {
            // Standard modus: Tilfeldig dealer
            currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
             console.log(`Standard mode: Dealer set to random seat index ${currentDealerPositionIndex}`);
        } else {
            // Posisjonstrener: Plasser dealer slik at Hero (sete 0) får den valgte posisjonen
             const positions = numPlayers === 9 ? positions9max : positions6max;
             const heroTargetPos = currentFixedPosition;
             const heroTargetPosIndexInList = positions.indexOf(heroTargetPos);

             if (heroTargetPosIndexInList === -1) {
                 console.error(`Invalid fixed position selected: ${heroTargetPos}. Falling back.`);
                 // Fallback til en gyldig posisjon hvis noe er galt
                 currentFixedPosition = positions.includes("CO") ? "CO" : (positions.includes("BTN") ? "BTN" : positions[0]);
                 positionSelect.value = currentFixedPosition;
                 heroTargetPosIndexInList = positions.indexOf(currentFixedPosition);
             }

             const btnListIndex = positions.indexOf("BTN");

             // Hvor mange steg er Hero sin *ønskede* posisjon forbi BTN i listen?
             const targetStepsFromBtnInList = (heroTargetPosIndexInList - btnListIndex + numPlayers) % numPlayers;

             // Dealerens seteindeks må være slik at (HERO_SEAT_INDEX - dealerIndex + numPlayers) % numPlayers = targetStepsFromBtnInList
             // La D være dealerIndex. (0 - D + N) % N = Steps => (-D + N) % N = Steps
             // Siden (-D + N) % N er det samme som (-D) % N, og vi vil ha D positiv:
             // Vi leter etter D slik at (0 - D) er kongruent med Steps (mod N)
             // -D === Steps (mod N) => D === -Steps (mod N) => D === (N - Steps) % N
             currentDealerPositionIndex = (numPlayers - targetStepsFromBtnInList) % numPlayers;

             console.log(`Trainer mode: Target ${heroTargetPos}. Dealer set to seat index ${currentDealerPositionIndex} to achieve this for Hero at seat 0.`);
        }

        // 3. Oppdater posisjonsnavn basert på dealer (dette setter også currentHeroPositionName)
        updatePlayerPositionsRelativeToButton();
        if (!currentHeroPositionName || currentHeroPositionName === '??') {
             // Dette skal egentlig ikke skje etter fiksen i calculate/getActual funksjonene
             console.error("FATAL: Could not determine Hero Position after setting dealer!");
             alert("Kritisk feil ved posisjonsberegning. Kan ikke fortsette.");
             return; // Stopp her hvis Hero sin posisjon er ukjent
        }
         console.log(`Hero position calculated as: ${currentHeroPositionName} (Seat ${HERO_SEAT_INDEX})`);


        // 4. Generer Scenario (RFI eller vs RFI)
        const positions = numPlayers === 9 ? positions9max : positions6max;

        // Finn blinds basert på dealer
        const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers;
        const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
        const sbPos = calculatePositionName(sbSeatIndex, currentDealerPositionIndex, numPlayers);
        const bbPos = calculatePositionName(bbSeatIndex, currentDealerPositionIndex, numPlayers);

        // Legg alltid til blinds i handlingene
        actionsPrecedingHero.push({ position: sbPos, actionType: "POST_SB", amount: 0.5 });
        actionsPrecedingHero.push({ position: bbPos, actionType: "POST_BB", amount: 1 });

        let scenarioGenerated = false;
        let potentialScenario = 'RFI'; // Start med RFI

        // Prøv å generere et 'vs RFI' scenario hvis ikke Hero er i tidlig posisjon eller blind
        // Og hvis vi er i standard modus (mer variasjon) eller trener en posisjon som *kan* møte en RFI
        const canFaceRFI = !['UTG', 'UTG+1', 'SB', 'BB'].includes(currentHeroPositionName); // Juster etter behov for 6max UTG
        const tryVsRFI = Math.random() < 0.6; // 60% sjanse for å prøve vs RFI hvis mulig

        if (canFaceRFI && (currentTrainingMode === 'standard' || tryVsRFI)) {
            const heroListIndex = positions.indexOf(currentHeroPositionName);
            const possibleRaiserPositions = [];
            // Finn alle posisjoner *før* Hero (og ikke blinds) som kunne ha åpnet
            for (let i = 0; i < heroListIndex; i++) {
                 const posName = positions[i];
                 // Kun posisjoner som har en RFI-range definert (selv om det bare er placeholder)
                 if (!['SB', 'BB'].includes(posName) && GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[posName]) {
                    possibleRaiserPositions.push(posName);
                 }
            }

            if (possibleRaiserPositions.length > 0) {
                // Velg en tilfeldig åpner fra de mulige
                const raiserPosition = possibleRaiserPositions[Math.floor(Math.random() * possibleRaiserPositions.length)];
                potentialScenario = `vs_${raiserPosition}_RFI`; // Scenario-navn
                console.log(`Attempting to generate scenario: ${potentialScenario}`);

                // Sjekk om Hero *har* en definert range for å møte dette scenarioet
                const rangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[potentialScenario];

                if (rangeExists) {
                    currentScenario = potentialScenario;
                    // Bestem raise-størrelse (forenklet)
                    let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3); // Standard åpning
                    // Legg til raiserens handling
                    actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount });
                    currentPotSizeBB += raiseAmount; // Øk potten
                    currentScenarioDescription = `${raiserPosition} høyner til ${raiseAmount} BB. Din tur.`;

                    // Legg til folds for alle mellom raiser og Hero
                    const raiserListIndex = positions.indexOf(raiserPosition);
                    for(let i = raiserListIndex + 1; i < heroListIndex; i++) {
                         const foldPosName = positions[i];
                         if (!['SB', 'BB'].includes(foldPosName)) { // Ikke legg til fold for blinds som allerede har postet
                              actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" });
                         }
                    }
                    firstActionPlayerIndex = HERO_SEAT_INDEX; // Hero er neste til å handle
                    scenarioGenerated = true;
                     console.log(`Scenario successfully set to: ${currentScenario}`);
                 } else {
                      console.warn(`Mangler range for Hero (${currentHeroPositionName}) i scenario ${potentialScenario}. Faller tilbake til RFI.`);
                      // Gå videre til RFI nedenfor
                 }
            } else {
                console.log("Ingen mulige raisere før Hero, fortsetter med RFI.");
            }
        }

        // Hvis ikke et 'vs RFI' ble generert, sett opp RFI
        if (!scenarioGenerated) {
            currentScenario = 'RFI';
            currentScenarioDescription = `Det foldes til deg. Din tur.`;
             const heroListIndex = positions.indexOf(currentHeroPositionName);
             // Finn indeksen til den første spilleren som *kunne* handlet (etter BB)
             const firstPossibleActorListIndex = positions.indexOf('UTG'); // Eller mer robust: finn den første som ikke er SB/BB

             // Legg til fold for alle spillere mellom første mulige og Hero
             for (let i = firstPossibleActorListIndex; i < heroListIndex; i++) {
                  const foldPosName = positions[i];
                  if (!['SB', 'BB'].includes(foldPosName)) { // Blinds har allerede postet
                       actionsPrecedingHero.push({ position: foldPosName, actionType: "Fold" });
                  }
             }
              firstActionPlayerIndex = HERO_SEAT_INDEX; // Hero er den første som kan handle (etter blinds)
              console.log(`Scenario set to: ${currentScenario}`);
        }

        // !! VIKTIG: Fjernet sjekken for `finalRangeExists` her.
        // Hjelpefunksjonene i ranges.js håndterer nå manglende data.

        // 5. Oppdater resten av UI
        scenarioDescriptionElement.textContent = currentScenarioDescription;
        updatePlayerPositionsRelativeToButton(); // Oppdater posisjonsnavn og dealer-knapp
        displayHeroCards();
        displayPrecedingActions(); // Vis blinds og eventuelle folds/raises før Hero
        potDisplaySpan.textContent = currentPotSizeBB.toFixed(1); // Vis potstørrelse
        updateActionButtons(); // Aktiver relevante knapper for Hero

        // 6. Vis Range i Trener-modus umiddelbart
        if (currentTrainingMode === 'trainer') {
            displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
        } else {
            rangeDisplayContainer.style.display = 'none'; // Skjul range i standard modus
        }
         console.log("--- setupNewHand Finished ---");
    }

    // Håndterer brukerens valg av handling
    function handleUserAction(userActionCode) {
         const handKey = getHandKey(heroHand);
         if (!handKey || !currentHeroPositionName || currentHeroPositionName === '??') {
              console.error("Kan ikke håndtere handling - ugyldig state", {handKey, currentHeroPositionName, heroHand});
              feedbackText.textContent = "Feil: Ugyldig spilltilstand.";
              feedbackText.className = 'incorrect';
              return;
         }

         console.log(`Handling for: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}, Hånd: ${handKey}, BrukerValg: ${userActionCode}`);

         // Bruk hjelpefunksjonen fra ranges.js som nå håndterer RFI/vs RFI struktur
         const gtoActionObject = getGtoAction(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario, handKey);

         // getGtoAction returnerer {"F": 1.0} hvis data mangler, så vi trenger ikke sjekke for null/tomt objekt på samme måte
         if (!gtoActionObject) {
             console.error("Klarte ikke hente GTO action objekt (uventet feil).");
             feedbackText.textContent = "Feil: Kunne ikke finne GTO data.";
             correctActionText.textContent = `Mangler data for: ${currentStackDepth} ${numPlayers}max ${currentHeroPositionName} ${currentScenario} ${handKey}`;
             feedbackText.className = 'incorrect';
             return;
         }

         const actions = Object.keys(gtoActionObject); // F.eks. ['3B', 'C'] eller ['F']
         const frequencies = Object.values(gtoActionObject); // F.eks. [0.7, 0.3] eller [1.0]
         let feedback = '';
         let correctActionDescription = ''; // Endret navn for klarhet
         let isCorrect = false;
         let primaryAction = 'F'; // Default til Fold
         let primaryFreq = 0;

         // Finn den primære handlingen (den med høyest frekvens)
          if (actions.length > 0) {
               actions.forEach((act, i) => {
                   if (frequencies[i] > primaryFreq) {
                       primaryFreq = frequencies[i];
                       primaryAction = act;
                   }
               });
          } else {
               // Hvis gtoActionObject var tom (bør ikke skje nå), behold Fold
               primaryAction = 'F';
               primaryFreq = 1.0; // Anta 100% Fold hvis ingen data
               gtoActionObject['F'] = 1.0; // Sørg for at det er data å vise
               actions.push('F');
               frequencies.push(1.0);
          }


         // Normaliser brukerens handling for å matche GTO-nøklene
         let normalizedUserAction = userActionCode;
         // RFI: Raise-knapp (R) skal sjekkes mot GTO 'R'. 3B-knapp er deaktivert. Push (P) mot 'P'.
         if (currentScenario === 'RFI' && currentStackDepth === '10bb' && userActionCode === 'P') { normalizedUserAction = 'P'; }
         else if (currentScenario === 'RFI' && userActionCode === 'R') { normalizedUserAction = 'R'; }
         // vs RFI: 3-Bet-knapp (3B) skal sjekkes mot GTO '3B'. Call (C) mot 'C'. Push (P) mot 'P'.
         else if (currentScenario.startsWith('vs_') && currentStackDepth === '10bb' && userActionCode === 'P') { normalizedUserAction = 'P'; }
         else if (currentScenario.startsWith('vs_') && userActionCode === '3B') { normalizedUserAction = '3B'; }
         else if (currentScenario.startsWith('vs_') && userActionCode === 'C') { normalizedUserAction = 'C'; }
         // Fold (F) er alltid 'F'
         else if (userActionCode === 'F') { normalizedUserAction = 'F'; }
         else {
             console.warn(`Uventet brukerhandling '${userActionCode}' for scenario '${currentScenario}' og stack '${currentStackDepth}'. Normaliserer til '${userActionCode}'.`);
             normalizedUserAction = userActionCode; // Behold som den er hvis ingen regel matcher
         }


         // Sjekk om brukerens (normaliserte) handling finnes i GTO-objektet med >0% frekvens
         if (gtoActionObject[normalizedUserAction] && gtoActionObject[normalizedUserAction] > 0) {
             isCorrect = true;
             // Er det den primære handlingen og har høy frekvens?
             if (normalizedUserAction === primaryAction && gtoActionObject[normalizedUserAction] >= 0.85) { // Grense for "ren" handling
                  feedback = "Korrekt!"; feedbackText.className = 'correct';
             } else if (actions.length > 1) { // Korrekt, men del av en mixed strategi
                  feedback = "OK (Mixed Strategi)"; feedbackText.className = 'correct'; // Fortsatt grønn
             } else { // Eneste korrekte handling
                 feedback = "Korrekt!"; feedbackText.className = 'correct';
             }
         } else {
             feedback = "Feil!"; feedbackText.className = 'incorrect'; isCorrect = false;
         }

         // Bygg beskrivelsen av GTO-anbefalingen
         correctActionDescription = "Anbefalt GTO: ";
         let actionStrings = [];
         actions.forEach((act, i) => {
             let percentage = (frequencies[i] * 100).toFixed(0);
             // Vis 100% for enkeltstående handlinger
             if (actions.length === 1) percentage = "100";
             actionStrings.push(`${act} (${percentage}%)`);
            });
         correctActionDescription += actionStrings.join(', ');
         // Legg til info om primær handling hvis brukeren tok feil og det var en mix
         if (!isCorrect && actions.length > 1) {
             correctActionDescription += ` (Primær: ${primaryAction})`;
         } else if (!isCorrect && actions.length === 1 && primaryAction !== 'F') {
             // Hvis brukeren valgte Fold feil, og eneste riktige var f.eks. Raise
             correctActionDescription += ` (Du skulle valgt ${primaryAction})`;
         }

         feedbackText.textContent = feedback;
         correctActionText.textContent = correctActionDescription;

         // Vis range grid etter handling i standard modus, eller alltid hvis feil
         if (currentTrainingMode === 'standard' || !isCorrect) {
             displayRangeGridForSituation(currentStackDepth, numPlayers, currentHeroPositionName, currentScenario);
         }

         // Deaktiver knapper etter at handling er utført
         actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    }

     // Viser GTO-rangen i et rutenett
     function displayRangeGridForSituation(stack, players, pos, scenario) {
         rangeGrid.innerHTML = ''; // Tøm griden
         // Bruk hjelpefunksjonen fra ranges.js som håndterer RFI/vs RFI struktur
         const fullRange = getFullRange(stack, players, pos, scenario);
          rangeSituationInfo.textContent = `${stack} ${players}max - ${pos} - Scenario: ${scenario}`; // Mer beskrivende tittel

          if (!fullRange || Object.keys(fullRange).length === 0) {
              // Dette bør kun skje hvis getFullRange hadde en intern feil
              rangeGrid.innerHTML = `<p style="grid-column: span 13; text-align: center; color: red;">Kritisk feil: Kunne ikke laste range for ${pos} i scenario ${scenario} (${stack}, ${players}max).</p>`;
              rangeDisplayContainer.style.display = 'block';
              return;
          }

         const ranksRev = ranks.slice().reverse(); // ['A', 'K', ..., '2']
         ranksRev.forEach((rank1, index1) => { // index1: 0=A, 1=K...
             ranksRev.forEach((rank2, index2) => { // index2: 0=A, 1=K...
                 const cell = document.createElement('div');
                 cell.classList.add('range-cell');
                 let handKey;
                 // Bestem handKey basert på om det er pair, suited eller offsuit
                 if (index1 === index2) { handKey = rank1 + rank2; } // Pair (f.eks. AA)
                 else if (index1 < index2) { handKey = rank1 + rank2 + 's'; } // Suited (f.eks. AKs) - index1 er høyere rank
                 else { handKey = rank2 + rank1 + 'o'; } // Offsuit (f.eks. AKo) - index2 er høyere rank

                 // Lag tekst for cellen (f.eks. AA, AKs, AKo)
                 let displayText = '';
                 let displayRank1 = rank1 === 'T' ? '10' : rank1;
                 let displayRank2 = rank2 === 'T' ? '10' : rank2;
                 if (index1 === index2) { displayText = displayRank1 + displayRank2; } // AA, KK
                 else if (index1 < index2) { displayText = displayRank1 + displayRank2; } // AK, AQ...
                 else { displayText = displayRank2 + displayRank1; } // KA -> AK, QA -> AQ...
                 cell.textContent = displayText;

                 // Hent GTO-handling (default til Fold hvis den mangler i fullRange, selv om det ikke bør skje)
                 const gtoAction = fullRange[handKey] || { "F": 1.0 };
                 const actions = Object.keys(gtoAction);
                 const frequencies = Object.values(gtoAction);
                 let tooltipText = `${handKey}:\n`;
                 let primaryAction = 'F'; // Default
                 let isMixed = false;
                 let primaryFreq = 0;

                 // Finn primær handling og sjekk om det er mixed
                  if (actions.length > 0) {
                      actions.forEach((act, i) => { if (frequencies[i] > primaryFreq) { primaryFreq = frequencies[i]; primaryAction = act; } });
                       if(actions.length > 1) {
                           // Hvis det er mer enn én handling med >0% frekvens, er den mixed
                           isMixed = frequencies.filter(f => f > 0).length > 1;
                       }
                  } else {
                       // Sikkerhetsnett hvis gtoAction var tom
                       primaryAction = 'F';
                       gtoAction['F'] = 1.0; // Sørg for at F vises i tooltip
                  }


                 // Bygg tooltip-tekst
                 let actionStrings = [];
                 Object.entries(gtoAction).forEach(([act, freq]) => {
                     if (freq > 0) { // Vis kun handlinger med > 0%
                         actionStrings.push(`${act}: ${(freq * 100).toFixed(0)}%`);
                     }
                 });
                 if (actionStrings.length === 0) actionStrings.push("F: 100%"); // Fallback
                 tooltipText += actionStrings.join('\n');


                  // Sett bakgrunnsfarge basert på primær handling/mix
                  if (isMixed) { cell.classList.add('range-mixed'); }
                  else if (['R', '3B', 'P'].includes(primaryAction)) { cell.classList.add('range-raise'); } // Grønn for raise/3bet/push
                  else if (primaryAction === 'C') { cell.classList.add('range-call'); } // Blå for call
                  else { cell.classList.add('range-fold'); } // Rød for fold (eller default)

                 // Legg til tooltip
                 const tooltipSpan = document.createElement('span');
                 tooltipSpan.classList.add('tooltiptext');
                 tooltipSpan.textContent = tooltipText;
                 cell.appendChild(tooltipSpan);
                 rangeGrid.appendChild(cell);
             });
         });
           rangeDisplayContainer.style.display = 'block'; // Vis range-containeren
     }


    // --- Event Listeners ---
    gameTypeSelect.addEventListener('change', (e) => {
        numPlayers = parseInt(e.target.value.slice(0,1)); // Hent 9 eller 6
        setupTableUI(); // Bygg bordet på nytt
        populatePositionSelect(); // Oppdater posisjonsvelger
        setupNewHand(); // Start ny hånd med nye innstillinger
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
            populatePositionSelect(); // Sørg for at den er fylt
            currentFixedPosition = positionSelect.value; // Sett valgt posisjon
        } else {
            positionLabel.style.display = 'none';
            positionSelect.style.display = 'none';
            currentFixedPosition = null; // Ingen fast posisjon i standard modus
        }
        setupNewHand(); // Start ny hånd med ny modus
    });

     positionSelect.addEventListener('change', (e) => {
          if (currentTrainingMode === 'trainer') {
               currentFixedPosition = e.target.value;
               setupNewHand(); // Start ny hånd for den valgte posisjonen
          }
     });

    newHandBtn.addEventListener('click', setupNewHand);

    // Legg til én listener på containeren for handlingsknappene (Event Delegation)
    actionButtonsContainer.addEventListener('click', (e) => {
        // Sjekk om det var en knapp som ble klikket og at den ikke er deaktivert
        if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
             // Deaktiver alle knapper umiddelbart for å unngå doble klikk
             actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
             // Håndter handlingen
             handleUserAction(e.target.dataset.action);
        }
    });

    // --- Initialisering ---
    console.log("Initializing Poker Trainer...");
    setupTableUI(); // Bygg det initielle bordet
    populatePositionSelect(); // Fyll posisjonsvelgeren
    setupNewHand(); // Sett opp den første hånden
    console.log("Initialization complete.");
});
