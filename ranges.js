// ranges.js - EKSTREMT FORENKLET EKSEMPEL! MÅ ERSTATTES MED KOMPLETTE RANGER
const GTO_RANGES = {
    "40bb": {
        "9max": {
            "BTN": { // Button Posisjon
                "RFI": { // Raise First In
                    "AA": { "R": 1.0 }, "KK": { "R": 1.0 }, "QQ": { "R": 1.0 }, "JJ": { "R": 1.0 }, "TT": { "R": 1.0 }, "99": { "R": 1.0 }, "88": { "R": 1.0 }, "77": { "R": 1.0 }, "66": { "R": 1.0 }, "55": { "R": 1.0 }, "44": { "R": 1.0 }, "33": { "R": 1.0 }, "22": { "R": 1.0 },
                    "AKs": { "R": 1.0 }, "AQs": { "R": 1.0 }, "AJs": { "R": 1.0 }, "ATs": { "R": 1.0 }, "A9s": { "R": 1.0 }, "A8s": { "R": 1.0 }, "A7s": { "R": 1.0 }, "A6s": { "R": 1.0 }, "A5s": { "R": 1.0 }, "A4s": { "R": 1.0 }, "A3s": { "R": 1.0 }, "A2s": { "R": 1.0 },
                    "AKo": { "R": 1.0 }, "AQo": { "R": 1.0 }, "AJo": { "R": 1.0 }, "ATo": { "R": 1.0 }, "A9o": { "R": 0.5, "F": 0.5 }, "A8o": { "R": 0.3, "F": 0.7 },
                    "KQs": { "R": 1.0 }, "KJs": { "R": 1.0 }, "KTs": { "R": 1.0 }, "K9s": { "R": 1.0 }, "K8s": { "R": 0.6, "F": 0.4 }, "K7s": { "R": 0.4, "F": 0.6 },
                    "KQo": { "R": 1.0 }, "KJo": { "R": 0.8, "F": 0.2 }, "KTo": { "R": 0.5, "F": 0.5 },
                    "QJs": { "R": 1.0 }, "QTs": { "R": 1.0 }, "Q9s": { "R": 0.7, "F": 0.3 },
                    "QJo": { "R": 0.6, "F": 0.4 }, "QTo": { "R": 0.2, "F": 0.8 },
                    "JTs": { "R": 1.0 }, "J9s": { "R": 0.5, "F": 0.5 },
                    "T9s": { "R": 1.0 }, "T8s": { "R": 0.3, "F": 0.7 },
                    "98s": { "R": 0.8, "F": 0.2 },
                    "87s": { "R": 0.6, "F": 0.4 },
                    "76s": { "R": 0.4, "F": 0.6 },
                    "65s": { "R": 0.2, "F": 0.8 },
                    // ... default til Fold for resten
                },
                 "vs_CO_RFI": { // Du er BTN, CO høyner
                     "AA": { "3B": 1.0 }, "KK": { "3B": 1.0 }, "QQ": { "3B": 0.8, "C": 0.2 }, "JJ": { "C": 1.0 }, "TT": { "C": 1.0 },
                     "AKs": { "3B": 1.0 }, "AQs": { "3B": 0.5, "C": 0.5 }, "AJs": { "C": 1.0 }, "ATs": { "C": 1.0 },
                     "AKo": { "3B": 0.6, "C": 0.4 }, "AQo": { "C": 1.0 },
                     "KQs": { "C": 1.0 },
                     // ... default til Fold for resten
                 }
            },
            "CO": { // Cutoff Posisjon
                "RFI": { // Strammere enn BTN
                     "AA": { "R": 1.0 }, "KK": { "R": 1.0 }, "QQ": { "R": 1.0 }, "JJ": { "R": 1.0 }, "TT": { "R": 1.0 }, "99": { "R": 1.0 }, "88": { "R": 1.0 }, "77": { "R": 0.6, "F": 0.4 },
                     "AKs": { "R": 1.0 }, "AQs": { "R": 1.0 }, "AJs": { "R": 1.0 }, "ATs": { "R": 1.0 }, "A9s": { "R": 0.5, "F": 0.5 }, "A5s": { "R": 1.0 },
                     "AKo": { "R": 1.0 }, "AQo": { "R": 1.0 }, "AJo": { "R": 0.3, "F": 0.7 },
                     "KQs": { "R": 1.0 }, "KJs": { "R": 1.0 }, "KTs": { "R": 0.8, "F": 0.2 },
                     "KQo": { "R": 0.5, "F": 0.5 },
                     "QJs": { "R": 1.0 },
                     "JTs": { "R": 0.7, "F": 0.3 },
                     "T9s": { "R": 0.4, "F": 0.6 },
                     // ... default til Fold
                },
                // ... vs MP_RFI, vs UTG_RFI etc.
            },
            // ... Andre posisjoner (UTG, MP, HJ, SB, BB) for 9max 40bb
        },
        "6max": {
            // ... Ranges for 6max 40bb (generelt løsere enn 9max)
        }
    },
    "10bb": {
        // ... Push/Fold orienterte ranges for 10bb
        "9max": { ... },
        "6max": { ... }
    }
};

// Hjelpefunksjon for å finne riktig action
function getGtoAction(stackDepth, numPlayers, position, scenario, handKey) {
    try {
        const rangeData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario];
        if (rangeData && rangeData[handKey]) {
            return rangeData[handKey];
        }
        // Default til Fold hvis ikke funnet
        return { "F": 1.0 };
    } catch (e) {
        console.error("Error fetching GTO action:", e);
        return { "F": 1.0 }; // Default til Fold ved feil
    }
}

// Hjelpefunksjon for å få hele rangen for en situasjon
function getFullRange(stackDepth, numPlayers, position, scenario) {
     try {
        const rangeData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario];
        return rangeData || {}; // Returner tom objekt hvis ikke funnet
    } catch (e) {
        console.error("Error fetching full range:", e);
        return {}; // Returner tom objekt ved feil
    }
}
