// ranges.js - V1 Standard Ranges (Mer komplett, men fortsatt generalisert)
// R: Raise/Bet, C: Call, F: Fold, 3B: 3-Bet, P: Push/All-in

const GTO_RANGES = {
    "40bb": {
        "9max": {
            // --- RFI (Raise First In) ---
            "UTG": { /* Strammest */
                "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 0.8, "F": 0.2}, "88": {"R": 0.5, "F": 0.5},
                "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 0.7, "F": 0.3}, "A5s": {"R": 0.4, "F": 0.6},
                "AKo": {"R": 1.0}, "AQo": {"R": 0.8, "F": 0.2},
                "KQs": {"R": 1.0}, "KJs": {"R": 0.5, "F": 0.5},
                "QJs": {"R": 0.3, "F": 0.7}
                // Default: F
            },
            "UTG+1": { // Litt løsere
                "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 0.9, "F": 0.1}, "77": {"R": 0.6, "F": 0.4},
                "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.4, "F": 0.6},"A5s": {"R": 1.0}, "A4s": {"R": 0.5, "F": 0.5},
                "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 0.6, "F": 0.4},
                "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 0.8, "F": 0.2},
                "QJs": {"R": 0.9, "F": 0.1}, "QTs": {"R": 0.4, "F": 0.6},
                "JTs": {"R": 0.6, "F": 0.4}
                 // Default: F
            },
            "MP": { // Ligner UTG+1/MP+1
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 0.6, "F": 0.4}, "55": {"R": 0.3, "F": 0.7},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.8, "F": 0.2}, "A8s": {"R": 0.4, "F": 0.6}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.5, "F": 0.5},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.7, "F": 0.3},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.6, "F": 0.4},
                 "KQo": {"R": 0.9, "F": 0.1}, "KJo": {"R": 0.4, "F": 0.6},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 0.4, "F": 0.6},
                 "JTs": {"R": 1.0}, "J9s": {"R": 0.5, "F": 0.5},
                 "T9s": {"R": 0.9, "F": 0.1}
                 // Default: F
            },
            "MP+1": { /* Ligner MP */ ...GTO_RANGES["40bb"]["9max"]["MP"]["RFI"] }, // Kopierer for enkelhets skyld V1
            "HJ": { // Hijack - Løsere
                 "AA": {"R": 1.0}, /*...*/ "66": {"R": 1.0}, "55": {"R": 1.0}, "44": {"R": 0.4, "F": 0.6}, "33": {"R": 0.2, "F": 0.8},"22": {"R": 0.2, "F": 0.8},
                 "Axs": {"R": 1.0}, // Alle suited ess
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.7, "F": 0.3}, "A8o": {"R": 0.4, "F": 0.6},
                 "Kxs": {"R": 1.0}, // Alle suited konger
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.9, "F": 0.1}, "K9o": {"R": 0.3, "F": 0.7},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0},
                 "QJo": {"R": 0.8, "F": 0.2}, "QTo": {"R": 0.5, "F": 0.5},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.5, "F": 0.5},
                 "T9s": {"R": 1.0}, "T8s": {"R": 1.0},
                 "98s": {"R": 1.0},
                 "87s": {"R": 0.9, "F": 0.1},
                 "76s": {"R": 0.7, "F": 0.3}
                  // Default: F
            },
            "CO": { /* ... (Bruk den fra forrige svar, den var ok for CO RFI) ... */
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
            },
            "BTN": { /* ... (Bruk den fra forrige svar, den var ok for BTN RFI) ... */
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
             },
             "SB": { // Small Blind RFI (litt annerledes enn BTN)
                "AA": {"R": 1.0}, /*...*/ "22": {"R": 1.0}, // Inkluderer alle par
                "Axs": {"R": 1.0}, "Kxs": {"R": 1.0}, /*...*/ "65s": {"R": 1.0}, "54s": {"R": 0.8, "F": 0.2},
                "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.7, "F": 0.3},
                "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.8, "F": 0.2}
                 // Default: Fold
             },
             // --- Vs RFI (Facing Raise First In) ---
              "CO": {
                  // ... RFI fra ovenfor ...
                  "vs_UTG_RFI": { // CO mot UTG raise - ganske tight
                       "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.5, "C": 0.5}, "JJ": {"C": 1.0}, "TT": {"C": 1.0},
                       "AKs": {"3B": 1.0}, "AQs": {"C": 1.0},
                       "AKo": {"3B": 0.7, "C": 0.3}
                       // Default: Fold
                  }
                  // ... vs UTG+1, vs MP etc.
              },
             "BTN": {
                // ... RFI fra ovenfor ...
                "vs_CO_RFI": { // BTN mot CO raise - løsere enn CO vs UTG
                    "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.9, "C": 0.1}, "JJ": {"C": 1.0}, "TT": {"C": 1.0}, "99": {"C": 1.0}, "88": {"C": 0.7, "F": 0.3},"77": {"C": 0.5, "F": 0.5}, "66": {"C": 0.3, "F": 0.7},"55": {"C": 0.2, "F": 0.8},
                    "AKs": {"3B": 1.0}, "AQs": {"3B": 0.7, "C": 0.3}, "AJs": {"C": 1.0}, "ATs": {"C": 1.0}, "A9s": {"C": 0.5, "F": 0.5}, "A5s": {"3B": 0.4, "C": 0.6}, "A4s": {"C": 0.8, "F": 0.2},
                    "AKo": {"3B": 0.6, "C": 0.4}, "AQo": {"C": 1.0}, "AJo": {"C": 0.6, "F": 0.4},
                    "KQs": {"C": 1.0}, "KJs": {"C": 1.0}, "KTs": {"C": 0.9, "F": 0.1}, "K9s": {"C": 0.4, "F": 0.6},
                    "KQo": {"C": 0.5, "F": 0.5},
                    "QJs": {"C": 1.0}, "QTs": {"C": 0.8, "F": 0.2},
                    "JTs": {"C": 1.0}, "J9s": {"C": 0.5, "F": 0.5},
                    "T9s": {"C": 1.0},
                    "98s": {"C": 0.8, "F": 0.2},
                    "87s": {"C": 0.6, "F": 0.4},
                    "76s": {"C": 0.3, "F": 0.7}
                    // Default: Fold
                },
                 "vs_UTG_RFI": { // BTN mot UTG raise - tightere enn vs CO
                    "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.4, "C": 0.6}, "JJ": {"C": 1.0}, "TT": {"C": 0.8, "F": 0.2},
                    "AKs": {"3B": 0.8, "C": 0.2}, "AQs": {"C": 1.0},
                    "AKo": {"C": 1.0}
                     // Default: Fold
                 }
                 // ... vs andre posisjoner
             },
             "SB": { // Small Blind Defense - Komplekst, ofte 3B eller Fold
                 "vs_BTN_RFI": {
                      "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 1.0}, "JJ": {"3B": 0.8, "F": 0.2}, "TT": {"3B": 0.5, "F": 0.5},
                      "AKs": {"3B": 1.0}, "AQs": {"3B": 1.0}, "AJs": {"3B": 0.7, "F": 0.3},
                      "AKo": {"3B": 1.0}, "AQo": {"3B": 0.6, "F": 0.4}
                      // Default: Fold
                 }
                 // ... vs andre posisjoner
             },
              "BB": { // Big Blind Defense - Bredere call-range pga odds
                  "vs_BTN_RFI": {
                      "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 1.0}, "JJ": {"3B": 0.5, "C": 0.5}, "TT": {"C": 1.0}, /*...*/ "22": {"C": 1.0}, // Caller alle par
                      "AKs": {"3B": 1.0}, "AQs": {"3B": 1.0}, "AJs": {"3B": 0.5, "C": 0.5}, "ATs": {"C": 1.0}, /*...*/ "A2s": {"C": 1.0}, // Caller mange suited ess
                      "AKo": {"3B": 1.0}, "AQo": {"3B": 0.4, "C": 0.6}, "AJo": {"C": 1.0}, "ATo": {"C": 1.0}, /*...*/ "A2o": {"C": 0.7, "F": 0.3}, // Caller mange offsuit ess
                      "KQs": {"C": 1.0}, /*...*/ "K2s": {"C": 1.0}, // Caller alle suited konger
                      "KQo": {"C": 1.0}, "KJo": {"C": 1.0}, "KTo": {"C": 1.0}, // Caller gode offsuit konger
                      "QJs": {"C": 1.0}, "QTs": {"C": 1.0}, "Q9s": {"C": 1.0}, // Suited Queens
                      "JTs": {"C": 1.0}, "J9s": {"C": 1.0},
                      "T9s": {"C": 1.0}, "T8s": {"C": 1.0},
                      "98s": {"C": 1.0}, "87s": {"C": 1.0}, "76s": {"C": 1.0}, "65s": {"C": 1.0} // Suited connectors
                       // Default: Fold
                  }
                  // ... vs andre posisjoner
              }
        },
         "6max": {
             // Lignende struktur, men generelt løsere
             "UTG": { // 6max UTG ligner mer på 9max MP
                 "RFI": { /*...*/ },
                 "vs_BTN_RFI": { /* tightere enn BTN vs CO */ }
             },
             "BTN": {
                 "RFI": { /* Løsere enn 9max BTN */ },
                 "vs_UTG_RFI": { /* Løsere enn 9max BTN vs UTG */}
             },
             "SB": { /* Mer aggressiv enn 9max SB */ },
             "BB": { /* Bredere enn 9max BB */ }
         }
    },
    "10bb": {
        // --- Push/Fold Ranges ---
         // Disse er svært forenklede eksempler. Ekte 10bb spill er komplekst.
        "9max": {
            "UTG": { "RFI": { "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":0.7,"F":0.3}, "AKs": {"P":1.0}, "AKo": {"P":1.0} } },
            "UTG+1": { "RFI": { "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0}, "99": {"P":0.5,"F":0.5}, "AKs": {"P":1.0}, "AQs": {"P":1.0},"AKo": {"P":1.0}, "AQo":{"P":0.5,"F":0.5} } },
            "CO": { "RFI": { /* Push ~Top 25% */ "22+": {"P":1.0}, "A2s+": {"P":1.0}, "K7s+": {"P":1.0}, "Q9s+": {"P":1.0}, "J9s+":{"P":1.0}, "T9s": {"P":1.0}, "A8o+": {"P":1.0}, "KTo+":{"P":1.0}, "QTo+": {"P":1.0}, "JTo": {"P":1.0} } },
            "BTN": { "RFI": { /* Push ~Top 40-50% */ "22+": {"P":1.0}, "A2s+": {"P":1.0}, "K2s+": {"P":1.0}, "Q2s+": {"P":1.0}, "J5s+": {"P":1.0}, "T7s+": {"P":1.0}, "97s+": {"P":1.0}, "86s+": {"P":1.0}, "76s": {"P":1.0}, "A2o+": {"P":1.0}, "K8o+": {"P":1.0}, "Q9o+": {"P":1.0}, "J9o+": {"P":1.0}, "T9o": {"P":1.0}} },
             // vs Push scenarioer er enda mer komplekse (calling ranges) - utelatt for V1
             "BB": { "vs_BTN_Push": { "AA": {"C":1.0}, "KK": {"C":1.0}, "QQ": {"C":1.0}, "JJ": {"C":1.0}, "TT": {"C":0.8,"F":0.2},"99": {"C":0.5,"F":0.5}, "AKs": {"C":1.0}, "AQs": {"C":1.0}, "AKo": {"C":1.0}, "AQo": {"C":0.7, "F":0.3}}}
        },
        "6max": {
             // Enda løsere push ranges enn 9max
             "UTG": { "RFI": { /* Push ~Top 15-20% */ } },
             "BTN": { "RFI": { /* Push Any Ace, Any Pair, K2s+, K8o+, etc. ~50%+ */ } },
             "BB": { "vs_BTN_Push": { /* Call videre enn 9max */ } }
        }
    }
};

// Hjelpefunksjoner (samme som før)
function getGtoAction(stackDepth, numPlayers, position, scenario, handKey) {
    try {
        const rangeData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario];
        if (rangeData && rangeData[handKey]) {
            return rangeData[handKey];
        }
        return { "F": 1.0 }; // Default til Fold hvis ingenting finnes
    } catch (e) {
        console.error("Error fetching GTO action:", e, stackDepth, numPlayers, position, scenario, handKey);
        return { "F": 1.0 };
    }
}

function getFullRange(stackDepth, numPlayers, position, scenario) {
     try {
        const baseRangeData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario] || {}; // Hent base range eller tom
        const completeRange = {};
        const ranksRev = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
         ranksRev.forEach((r1, i) => {
             ranksRev.forEach((r2, j) => {
                 let key;
                 if (i === j) key = r1 + r2; // Pair
                 else if (i < j) key = r1 + r2 + 's'; // Suited
                 else key = r2 + r1 + 'o'; // Offsuit

                 completeRange[key] = baseRangeData[key] || { "F": 1.0 }; // Bruk range data eller default Fold
             });
         });
        return completeRange;
    } catch (e) {
        console.error("Error fetching full range:", e, stackDepth, numPlayers, position, scenario);
        return {};
    }
}
