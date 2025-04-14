// ranges.js - V1 Standard Ranges (Representative, not Solver Perfect)
// Forklaringer:
// R: Raise First In (eller bet/raise i senere gater - ikke relevant her)
// C: Call
// F: Fold
// 3B: 3-Bet (Re-raise preflop)
// P: Push / All-in (Brukes for 10bb)
// Tall (f.eks. 0.7) indikerer frekvens (70%)

const GTO_RANGES = {
    "40bb": {
        "9max": {
            // --- Raise First In (RFI) ---
            "UTG": {
                "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 0.7, "F": 0.3}, "77": {"R": 0.5, "F": 0.5},
                "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A5s": {"R": 0.5, "F": 0.5},
                "AKo": {"R": 1.0}, "AQo": {"R": 1.0},
                "KQs": {"R": 1.0}, "KJs": {"R": 0.6, "F": 0.4},
                "QJs": {"R": 0.4, "F": 0.6}
                // Default: Fold
            },
            "UTG+1": { // Litt løsere enn UTG
                "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 0.8, "F": 0.2}, "66": {"R": 0.3, "F": 0.7},
                "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.5, "F": 0.5}, "A5s": {"R": 1.0}, "A4s": {"R": 0.4, "F": 0.6},
                "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 0.5, "F": 0.5},
                "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 0.7, "F": 0.3},
                "QJs": {"R": 1.0}, "QTs": {"R": 0.4, "F": 0.6},
                "JTs": {"R": 0.5, "F": 0.5}
                // Default: Fold
            },
            "MP": { // Enda litt løsere
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 0.7, "F": 0.3}, "55": {"R": 0.2, "F": 0.8},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 0.5, "F": 0.5}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.4, "F": 0.6},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.6, "F": 0.4},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.5, "F": 0.5},
                 "KQo": {"R": 0.8, "F": 0.2}, "KJo": {"R": 0.3, "F": 0.7},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0},
                 "JTs": {"R": 1.0}, "J9s": {"R": 0.3, "F": 0.7},
                 "T9s": {"R": 0.8, "F": 0.2}
                 // Default: Fold
            },
             "CO": { // Ganske løs
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 1.0}, "44": {"R": 0.5, "F": 0.5}, "33": {"R": 0.2, "F": 0.8},"22": {"R": 0.2, "F": 0.8},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 1.0}, "A7s": {"R": 1.0}, "A6s": {"R": 0.7, "F": 0.3}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 1.0}, "A2s": {"R": 1.0},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.6, "F": 0.4},"A8o": {"R": 0.3, "F": 0.7},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 1.0}, "K8s": {"R": 0.6, "F": 0.4},"K7s": {"R": 0.4, "F": 0.6},"K6s": {"R": 0.2, "F": 0.8},
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.8, "F": 0.2},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "Q8s": {"R": 0.3, "F": 0.7},
                 "QJo": {"R": 0.5, "F": 0.5},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.4, "F": 0.6},
                 "T9s": {"R": 1.0}, "T8s": {"R": 0.8, "F": 0.2},
                 "98s": {"R": 1.0}, "97s": {"R": 0.3, "F": 0.7},
                 "87s": {"R": 1.0},
                 "76s": {"R": 0.8, "F": 0.2},
                 "65s": {"R": 0.5, "F": 0.5}
                  // Default: Fold
             },
              "BTN": { // Løsest RFI
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 1.0}, "44": {"R": 1.0}, "33": {"R": 1.0}, "22": {"R": 1.0},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 1.0}, "A7s": {"R": 1.0}, "A6s": {"R": 1.0}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 1.0}, "A2s": {"R": 1.0},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 1.0}, "A8o": {"R": 1.0}, "A7o": {"R": 0.7, "F": 0.3}, "A6o": {"R": 0.4, "F": 0.6},"A5o": {"R": 0.2, "F": 0.8},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 1.0}, "K8s": {"R": 1.0}, "K7s": {"R": 1.0}, "K6s": {"R": 1.0}, "K5s": {"R": 0.5, "F": 0.5},"K4s": {"R": 0.3, "F": 0.7},"K3s": {"R": 0.2, "F": 0.8},"K2s": {"R": 0.2, "F": 0.8},
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 1.0}, "K9o": {"R": 0.5, "F": 0.5},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "Q8s": {"R": 0.7, "F": 0.3},"Q7s": {"R": 0.3, "F": 0.7},
                 "QJo": {"R": 1.0}, "QTo": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 1.0}, "J7s": {"R": 0.4, "F": 0.6},
                 "T9s": {"R": 1.0}, "T8s": {"R": 1.0}, "T7s": {"R": 0.6, "F": 0.4},
                 "98s": {"R": 1.0}, "97s": {"R": 0.8, "F": 0.2},
                 "87s": {"R": 1.0}, "86s": {"R": 0.4, "F": 0.6},
                 "76s": {"R": 1.0}, "75s": {"R": 0.2, "F": 0.8},
                 "65s": {"R": 1.0},
                 "54s": {"R": 0.7, "F": 0.3}
                 // Default: Fold
             },
             // --- Vs RFI Ranges (Eksempel: BTN vs CO Raise) ---
             "BTN": {
                // ... RFI fra ovenfor ...
                "vs_CO_RFI": {
                    "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.8, "C": 0.2}, "JJ": {"C": 1.0}, "TT": {"C": 1.0}, "99": {"C": 1.0}, "88": {"C": 0.7, "F": 0.3},"77": {"C": 0.5, "F": 0.5}, "66": {"C": 0.3, "F": 0.7},"55": {"C": 0.2, "F": 0.8},
                    "AKs": {"3B": 1.0}, "AQs": {"3B": 0.6, "C": 0.4}, "AJs": {"C": 1.0}, "ATs": {"C": 1.0}, "A5s": {"3B": 0.4, "C": 0.6}, // 3B som bløff/semi-bløff
                    "AKo": {"3B": 0.5, "C": 0.5}, "AQo": {"C": 1.0},
                    "KQs": {"C": 1.0}, "KJs": {"C": 1.0}, "KTs": {"C": 0.8, "F": 0.2},
                    "QJs": {"C": 1.0}, "QTs": {"C": 0.6, "F": 0.4},
                    "JTs": {"C": 1.0},
                    "T9s": {"C": 0.8, "F": 0.2},
                    "98s": {"C": 0.6, "F": 0.4},
                    "87s": {"C": 0.4, "F": 0.6}
                    // Default: Fold
                }
                // ... vs andre posisjoner
             },
             // ... Andre posisjoner (SB, BB vil ha defending ranges - mer komplekst)
              "SB": {
                 // SB vs RFI (vs BTN, vs CO etc.) - Typisk mer 3B eller Fold, mindre Call
                 "RFI": { /* Stjelerange lignende BTN, men litt strammere */}
              },
              "BB": {
                  // BB vs RFI (vs BTN, vs CO etc.) - Bredere Call range pga pot odds, men også 3B/Fold
              }
        },
        "6max": {
             // Lignende struktur, men generelt løsere ranges for alle posisjoner
             // Færre posisjoner å definere (UTG, MP, CO, BTN, SB, BB)
              "UTG": { "RFI": { /* Løsere enn 9max UTG */} },
              "BTN": { "RFI": { /* Enda løsere enn 9max BTN */} }
             // ... etc.
        }
    },
    "10bb": {
        // Disse rangene vil være dominert av Push (P) eller Fold (F)
        "9max": {
            "UTG": {
                 "RFI": { "AA": {"P": 1.0}, "KK": {"P": 1.0}, "QQ": {"P": 1.0}, "JJ": {"P": 1.0}, "TT": {"P": 1.0}, "99": {"P": 1.0}, "88": {"P": 0.5, "F": 0.5},
                          "AKs": {"P": 1.0}, "AQs": {"P": 1.0}, "AJs":{"P": 0.6, "F": 0.4},
                          "AKo": {"P": 1.0}
                          // Default: Fold
                         }
            },
             // ... Andre posisjoner (blir gradvis løsere)
             "BTN": {
                 "RFI": { /* Mye bredere push-range her */ }
             }
        },
        "6max": {
             // Lignende push/fold, men løsere enn 9max for tilsvarende posisjon
              "UTG": { "RFI": { /* Løsere enn 10bb 9max UTG */ } },
              "BTN": { "RFI": { /* Veldig bred push-range */ } }
             // ... etc.
        }
    }
};

// Hjelpefunksjoner (samme som før)
function getGtoAction(stackDepth, numPlayers, position, scenario, handKey) { /* ... */
    try {
        const rangeData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario];
        if (rangeData && rangeData[handKey]) {
            return rangeData[handKey];
        }
         // Default til Fold hvis ikke funnet ELLER hvis rangeData er undefined
         const defaultAction = { "F": 1.0 };
         // For RFI, hvis hånden ikke er listet, er det fold
         if (scenario === 'RFI') return defaultAction;

         // For vs_... scenarioer, hvis hånden ikke er listet *i forsvarsrangen*, fold
         if (scenario && scenario.startsWith('vs_')) return defaultAction;

          // Fallback hvis scenario ikke er kjent
         return defaultAction;

    } catch (e) {
        console.error("Error fetching GTO action:", e, stackDepth, numPlayers, position, scenario, handKey);
        return { "F": 1.0 };
    }
}


function getFullRange(stackDepth, numPlayers, position, scenario) { /* ... */
     try {
        const rangeData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario];
         // Legg til default Fold for hender som ikke er spesifisert i RFI/vs RFI
         const completeRange = {};
         const ranksRev = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
         ranksRev.forEach((r1, i) => {
             ranksRev.forEach((r2, j) => {
                 let key;
                 if (i === j) key = r1 + r2; // Pair
                 else if (i < j) key = r1 + r2 + 's'; // Suited
                 else key = r2 + r1 + 'o'; // Offsuit

                 completeRange[key] = rangeData?.[key] || { "F": 1.0 }; // Bruk range data eller default Fold
             });
         });
        return completeRange;

    } catch (e) {
        console.error("Error fetching full range:", e);
        return {};
    }
}
