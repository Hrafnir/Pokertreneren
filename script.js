// Inni script.js

    // ... (andre funksjoner forblir stort sett de samme) ...

     // OPPDATERT setupNewHand for å håndtere manglende data bedre
     function setupNewHand() {
         feedbackText.textContent = '';
         correctActionText.textContent = '';
         rangeDisplayContainer.style.display = 'none';
         rangeGrid.innerHTML = ''; // Tøm gridet
         currentDeck = shuffleDeck(createDeck());
         heroHand = [currentDeck.pop(), currentDeck.pop()];
         actionsPrecedingHero = [];
         currentPotSizeBB = 1.5;
         firstActionPlayerIndex = -1;

         // --- Sett Knappen ---
          if (currentTrainingMode === 'standard') {
               currentDealerPositionIndex = Math.floor(Math.random() * numPlayers);
           } else {
               const positions = numPlayers === 9 ? positions9max : positions6max;
               const heroTargetPosIndex = positions.indexOf(currentFixedPosition);
               if(heroTargetPosIndex === -1) { // Fallback hvis posisjonen ikke finnes
                   console.warn(`Fixed position ${currentFixedPosition} not valid for ${numPlayers}max. Defaulting.`);
                   currentFixedPosition = numPlayers === 9 ? "BTN" : "BTN"; // Default til BTN
                   positionSelect.value = currentFixedPosition;
                   // Rekalkuler heroTargetPosIndex med default
                    heroTargetPosIndex = positions.indexOf(currentFixedPosition);
               }

                const btnIndexInList = positions.indexOf("BTN");
                let targetRelIndex = (heroTargetPosIndex - btnIndexInList + numPlayers) % numPlayers;
                currentDealerPositionIndex = (HERO_SEAT_INDEX - targetRelIndex + numPlayers) % numPlayers;
            }


         // --- Scenario Oppsett (V1 - RFI eller vs UTG RFI) ---
         scenarioDescription.textContent = '';
         const positions = numPlayers === 9 ? positions9max : positions6max;
         currentHeroPositionName = getPositionName(HERO_SEAT_INDEX, numPlayers);
         if (!currentHeroPositionName || currentHeroPositionName === "??") {
              console.error("Could not determine Hero Position!");
              // Håndter feil, kanskje vis en melding og prøv på nytt
              alert("Feil ved bestemming av posisjon. Prøv ny hånd.");
              return; // Avbryt
         }
         heroPositionSpan.textContent = currentHeroPositionName;

         // Post blinds
         const sbSeatIndex = (currentDealerPositionIndex + 1) % numPlayers;
         const bbSeatIndex = (currentDealerPositionIndex + 2) % numPlayers;
         actionsPrecedingHero.push({ position: getPositionName(sbSeatIndex, numPlayers), actionType: "POST_SB", amount: 0.5 });
         actionsPrecedingHero.push({ position: getPositionName(bbSeatIndex, numPlayers), actionType: "POST_BB", amount: 1 });

         // Scenario Bestemmelse
         const heroListIndex = positions.indexOf(currentHeroPositionName);
         const randomScenarioChoice = Math.random();
         let scenarioGenerated = false;

          // Prøv vs RFI først hvis mulig
         if (randomScenarioChoice >= 0.5 && !['SB', 'BB', 'UTG'].includes(currentHeroPositionName)) {
              // Forenklet: La oss si UTG alltid høyner i dette scenarioet for V1
              const raiserPosition = "UTG";
              const raiserListIndex = positions.indexOf(raiserPosition);

              if (raiserListIndex < heroListIndex) { // Sjekk at UTG faktisk er *før* Hero
                  let raiseAmount = currentStackDepth === '10bb' ? 2 : (numPlayers === 6 ? 2.5 : 3);
                  actionsPrecedingHero.push({ position: raiserPosition, actionType: "Raise", amount: raiseAmount });
                  currentPotSizeBB += raiseAmount;
                  currentScenario = `vs_${raiserPosition}_RFI`;
                  scenarioDescription.textContent = `${raiserPosition} høyner til ${raiseAmount} BB. Din tur.`;

                  // Anta fold fra mellomliggende
                  for(let i = raiserListIndex + 1; i < heroListIndex; i++) {
                       actionsPrecedingHero.push({position: positions[i], actionType: "Fold"});
                  }
                  firstActionPlayerIndex = HERO_SEAT_INDEX;
                   scenarioGenerated = true;
              }
         }

          // Hvis vs RFI ikke ble generert, default til RFI
         if (!scenarioGenerated) {
              currentScenario = 'RFI';
              scenarioDescription.textContent = `Det foldes til deg. Din tur.`;
               // Anta at alle før Hero har foldet (unntatt blinds)
                const bbListIndex = positions.indexOf("BB");
                for (let i = (bbListIndex + 1) % numPlayers; i !== heroListIndex; i = (i + 1) % numPlayers) {
                    // Finn den faktiske posisjonen til sete i
                    const posName = getPositionName(getActualSeatIndex(positions[i], numPlayers), numPlayers);
                     if (!['SB', 'BB'].includes(posName)) { // Ikke legg til fold for blinds
                          actionsPrecedingHero.push({ position: posName, actionType: "Fold" });
                     }
                }
                firstActionPlayerIndex = HERO_SEAT_INDEX;
         }

          // Sjekk om vi faktisk HAR en range for det genererte scenarioet
          const testRangeExists = GTO_RANGES[currentStackDepth]?.[`${numPlayers}max`]?.[currentHeroPositionName]?.[currentScenario];
          if (!testRangeExists) {
               console.warn(`Mangler range data for: ${currentStackDepth}, ${numPlayers}max, ${currentHeroPositionName}, ${currentScenario}. Genererer nytt scenario.`);
               // Forsøk å generere et nytt scenario (kunne loopet, men enklere å bare kjøre setupNewHand på nytt)
               // For å unngå evig loop ved manglende data, bare vis en feil her.
               feedbackText.textContent = "Feil: Kunne ikke finne range for scenario. Prøv 'Ny Hånd'.";
                correctActionText.textContent = `Mangler: ${currentStackDepth} ${numPlayers}max ${currentHeroPositionName} ${currentScenario}`;
               actionButtonsContainer.querySelectorAll('button').forEach(b => b.disabled = true); // Deaktiver knapper
               return; // Stopp videre prosessering for denne hånden
          }
         // ------------------------------------

         updatePlayerPositionsRelativeToButton(); // Viktig å kalle ETTER scenario er satt
         displayHeroCards();
         displayPrecedingActions();
         potDisplaySpan.textContent = currentPotSizeBB.toFixed(1);
         updateActionButtons(); // Oppdater knapper basert på scenario

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

     // --- (resten av script.js som før, inkludert handleUserAction og displayRangeGridForSituation) ---

    // --- Initialisering ---
    setupTableUI();
    populatePositionSelect();
    setupNewHand();
});
