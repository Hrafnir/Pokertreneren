// ranges.js - V1 Standard Ranges (KOMPLETT FIL - KORRIGERT FOR RFI-STRUKTUR)
// R: Raise/Bet, C: Call, F: Fold, 3B: 3-Bet, P: Push/All-in
// MERK: Representative standard-ranger, ikke solver-perfekte.

const GTO_RANGES = {
    "40bb": {
        "9max": {
            // --- RFI (Raise First In) - Data direkte under posisjonen ---
            "UTG": { /* Strammest */
                "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 0.9, "F": 0.1}, "88": {"R": 0.6, "F": 0.4}, "77": {"R": 0.3, "F": 0.7},
                "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 0.8, "F": 0.2}, "A5s": {"R": 0.5, "F": 0.5}, "A4s": {"R": 0.2, "F": 0.8},
                "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 0.3, "F": 0.7},
                "KQs": {"R": 1.0}, "KJs": {"R": 0.7, "F": 0.3}, "KTs": {"R": 0.4, "F": 0.6},
                "QJs": {"R": 0.6, "F": 0.4}, "QTs": {"R": 0.2, "F": 0.8},
                "JTs": {"R": 0.4, "F": 0.6}
                // Default: F
            },
            "UTG+1": { // Litt løsere
                "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 0.9, "F": 0.1}, "77": {"R": 0.7, "F": 0.3}, "66": {"R": 0.4, "F": 0.6},
                "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.6, "F": 0.4},"A8s": {"R": 0.2, "F": 0.8},"A5s": {"R": 1.0}, "A4s": {"R": 0.8, "F": 0.2},
                "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 0.8, "F": 0.2}, "ATo": {"R": 0.3, "F": 0.7},
                "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 0.9, "F": 0.1}, "K9s": {"R": 0.3, "F": 0.7},
                "KQo": {"R": 0.4, "F": 0.6},
                "QJs": {"R": 1.0}, "QTs": {"R": 0.6, "F": 0.4},
                "JTs": {"R": 0.8, "F": 0.2},
                "T9s": {"R": 0.4, "F": 0.6}
                 // Default: F
            },
            "MP": { // Middle Position 1
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 0.8, "F": 0.2}, "55": {"R": 0.5, "F": 0.5},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 0.6, "F": 0.4}, "A7s": {"R": 0.3, "F": 0.7}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.7, "F": 0.3}, "A2s": {"R": 0.4, "F": 0.6},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.9, "F": 0.1}, "A9o": {"R": 0.2, "F": 0.8},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.8, "F": 0.2},
                 "KQo": {"R": 1.0}, "KJo": {"R": 0.6, "F": 0.4}, "KTo": {"R": 0.3, "F": 0.7},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 0.8, "F": 0.2},
                 "T9s": {"R": 1.0}, "T8s": {"R": 0.4, "F": 0.6},
                 "98s": {"R": 0.6, "F": 0.4}
                 // Default: F
            },
            "MP+1": { // KORRIGERT: Eksplisitt definert (kopi av MP for V1)
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 0.8, "F": 0.2}, "55": {"R": 0.5, "F": 0.5},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 0.6, "F": 0.4}, "A7s": {"R": 0.3, "F": 0.7}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.7, "F": 0.3}, "A2s": {"R": 0.4, "F": 0.6},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.9, "F": 0.1}, "A9o": {"R": 0.2, "F": 0.8},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.8, "F": 0.2},
                 "KQo": {"R": 1.0}, "KJo": {"R": 0.6, "F": 0.4}, "KTo": {"R": 0.3, "F": 0.7},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 0.8, "F": 0.2},
                 "T9s": {"R": 1.0}, "T8s": {"R": 0.4, "F": 0.6},
                 "98s": {"R": 0.6, "F": 0.4}
                 // Default: F
            },
            "HJ": { // Hijack
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 0.8, "F": 0.2}, "44": {"R": 0.5, "F": 0.5}, "33": {"R": 0.3, "F": 0.7},"22": {"R": 0.3, "F": 0.7},
                 "Axs": {"R": 1.0}, // Alle suited ess
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.8, "F": 0.2}, "A8o": {"R": 0.5, "F": 0.5},"A7o": {"R": 0.2, "F": 0.8},
                 "Kxs": {"R": 1.0}, // Alle suited konger
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 1.0}, "K9o": {"R": 0.5, "F": 0.5},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "Q8s": {"R": 0.4, "F": 0.6},
                 "QJo": {"R": 1.0}, "QTo": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.7, "F": 0.3},
                 "T9s": {"R": 1.0}, "T8s": {"R": 1.0}, "T7s": {"R": 0.3, "F": 0.7},
                 "98s": {"R": 1.0}, "97s": {"R": 0.5, "F": 0.5},
                 "87s": {"R": 1.0}, "86s": {"R": 0.2, "F": 0.8},
                 "76s": {"R": 0.9, "F": 0.1},
                 "65s": {"R": 0.6, "F": 0.4}
                  // Default: F
            },
            "CO": { // Cutoff RFI data under "CO", vs RFI data under "CO": { "vs_..." }
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 1.0}, "44": {"R": 0.8, "F": 0.2}, "33": {"R": 0.5, "F": 0.5},"22": {"R": 0.5, "F": 0.5},
                 "Axs": {"R": 1.0},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 1.0}, "A8o": {"R": 0.7, "F": 0.3},"A7o": {"R": 0.4, "F": 0.6},"A6o": {"R": 0.2, "F": 0.8},"A5o": {"R": 0.3, "F": 0.7},"A4o": {"R": 0.2, "F": 0.8},
                 "Kxs": {"R": 1.0},
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 1.0}, "K9o": {"R": 0.8, "F": 0.2}, "K8o": {"R": 0.3, "F": 0.7},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "Q8s": {"R": 0.6, "F": 0.4},"Q7s": {"R": 0.2, "F": 0.8},
                 "QJo": {"R": 1.0}, "QTo": {"R": 1.0}, "Q9o": {"R": 0.3, "F": 0.7},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.9, "F": 0.1}, "J7s": {"R": 0.3, "F": 0.7},
                 "T9s": {"R": 1.0}, "T8s": {"R": 1.0}, "T7s": {"R": 0.7, "F": 0.3},
                 "98s": {"R": 1.0}, "97s": {"R": 1.0}, "96s": {"R": 0.2, "F": 0.8},
                 "87s": {"R": 1.0}, "86s": {"R": 0.7, "F": 0.3},
                 "76s": {"R": 1.0}, "75s": {"R": 0.4, "F": 0.6},
                 "65s": {"R": 1.0},
                 "54s": {"R": 0.8, "F": 0.2},
                 // --- Vs RFI (Eksempler) ---
                 "vs_UTG_RFI": {
                     "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.6, "C": 0.4}, "JJ": {"C": 1.0}, "TT": {"C": 0.9, "F": 0.1}, "99": {"C": 0.5, "F": 0.5}, "88":{"C": 0.2, "F": 0.8},
                     "AKs": {"3B": 1.0}, "AQs": {"3B": 0.3, "C": 0.7}, "AJs": {"C": 1.0}, "ATs":{"C": 0.6, "F": 0.4},
                     "AKo": {"3B": 0.7, "C": 0.3}, "AQo": {"C": 0.8, "F": 0.2},
                     "KQs": {"C": 1.0}, "KJs": {"C": 0.5, "F": 0.5}
                 }
            },
            "BTN": { // Button RFI - Løsest
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 1.0}, "44": {"R": 1.0}, "33": {"R": 1.0}, "22": {"R": 1.0},
                 "Axs": {"R": 1.0},
                 "Axo": {"R": 1.0},
                 "Kxs": {"R": 1.0},
                 "Kxo": {"R": 1.0},
                 "Qxs": {"R": 1.0},
                 "Q5o+": {"R": 1.0}, // Q5o og bedre
                 "Jxs": {"R": 1.0},
                 "J7o+": {"R": 1.0},
                 "Txs": {"R": 1.0},
                 "T8o+": {"R": 1.0},
                 "9xs": {"R": 1.0},
                 "97o+": {"R": 1.0},
                 "86s+": {"R": 1.0}, "87o": {"R": 0.6, "F": 0.4},
                 "75s+": {"R": 1.0}, "76o": {"R": 0.5, "F": 0.5},
                 "65s": {"R": 1.0}, "64s": {"R": 0.7, "F": 0.3},
                 "54s": {"R": 1.0},
                 // --- Vs RFI ---
                 "vs_UTG_RFI": {
                     "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.7, "C": 0.3}, "JJ": {"C": 1.0}, "TT": {"C": 0.9, "F": 0.1}, "99": {"C": 0.6, "F": 0.4}, "88": {"C": 0.3, "F": 0.7},
                     "AKs": {"3B": 0.9, "C": 0.1}, "AQs": {"C": 1.0}, "AJs": {"C": 0.8, "F": 0.2}, "ATs": {"C": 0.5, "F": 0.5}, "A5s": {"3B": 0.3, "F": 0.7}, // 3B bløff
                     "AKo": {"C": 1.0}, "AQo": {"C": 0.6, "F": 0.4},
                     "KQs": {"C": 1.0}, "KJs": {"C": 0.6, "F": 0.4}
                 },
                 "vs_CO_RFI": { // Løsere
                     "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 1.0}, "JJ": {"3B": 0.6, "C": 0.4}, "TT": {"C": 1.0}, "99": {"C": 1.0}, "88": {"C": 0.9, "F": 0.1},"77": {"C": 0.7, "F": 0.3}, "66": {"C": 0.5, "F": 0.5},"55": {"C": 0.4, "F": 0.6},
                     "AKs": {"3B": 1.0}, "AQs": {"3B": 0.8, "C": 0.2}, "AJs": {"3B": 0.2, "C": 0.8}, "ATs": {"C": 1.0}, "A9s": {"C": 0.8, "F": 0.2}, "A8s": {"C": 0.4, "F": 0.6},"A5s": {"3B": 0.6, "C": 0.4}, "A4s": {"C": 1.0},
                     "AKo": {"3B": 0.8, "C": 0.2}, "AQo": {"C": 1.0}, "AJo": {"C": 0.9, "F": 0.1}, "ATo": {"C": 0.6, "F": 0.4},
                     "KQs": {"3B": 0.3, "C": 0.7}, "KJs": {"C": 1.0}, "KTs": {"C": 1.0}, "K9s": {"C": 0.7, "F": 0.3},
                     "KQo": {"C": 0.8, "F": 0.2}, "KJo": {"C": 0.4, "F": 0.6},
                     "QJs": {"C": 1.0}, "QTs": {"C": 1.0}, "Q9s": {"C": 0.5, "F": 0.5},
                     "JTs": {"C": 1.0}, "J9s": {"C": 0.8, "F": 0.2},
                     "T9s": {"C": 1.0}, "T8s": {"C": 0.6, "F": 0.4},
                     "98s": {"C": 1.0},
                     "87s": {"C": 0.8, "F": 0.2},
                     "76s": {"C": 0.6, "F": 0.4},
                     "65s": {"C": 0.4, "F": 0.6}
                 }
            },
            "SB": { // Small Blind RFI
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 0.8, "F": 0.2}, "44": {"R": 0.6, "F": 0.4},"33": {"R": 0.4, "F": 0.6},"22": {"R": 0.4, "F": 0.6},
                 "Axs": {"R": 1.0},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.8, "F": 0.2},"A8o": {"R": 0.5, "F": 0.5},"A7o": {"R": 0.3, "F": 0.7},"A5o": {"R": 0.4, "F": 0.6},"A4o": {"R": 0.2, "F": 0.8},
                 "Kxs": {"R": 1.0},
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.9, "F": 0.1},"K9o": {"R": 0.4, "F": 0.6},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0},
                 "QJo": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.5, "F": 0.5},
                 "T9s": {"R": 1.0}, "T8s": {"R": 0.7, "F": 0.3},
                 "98s": {"R": 1.0},
                 "87s": {"R": 0.8, "F": 0.2},
                 "76s": {"R": 0.6, "F": 0.4},
                 "65s": {"R": 0.4, "F": 0.6}
                 // SB har ingen vs RFI i dette eksempelet (ville vært vs <posisjon> Raise)
            },
             "BB": { // Big Blind Defense vs BTN Raise (Bred)
                 // BB har ingen RFI scenario
                 "vs_BTN_RFI": {
                     "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 1.0}, "JJ": {"3B": 0.7, "C": 0.3}, "TT": {"3B": 0.4, "C": 0.6}, "99": {"C": 1.0}, "88": {"C": 1.0}, "77": {"C": 1.0},"66": {"C": 1.0},"55": {"C": 1.0},"44": {"C": 1.0},"33": {"C": 1.0},"22": {"C": 1.0},
                     "AKs": {"3B": 1.0}, "AQs": {"3B": 1.0}, "AJs": {"3B": 0.8, "C": 0.2}, "ATs": {"3B": 0.5, "C": 0.5}, "A9s": {"C": 1.0}, "A8s": {"C": 1.0},"A7s": {"C": 1.0},"A6s": {"C": 1.0},"A5s": {"3B": 0.3, "C": 0.7},"A4s": {"C": 1.0},"A3s": {"C": 1.0},"A2s": {"C": 1.0},
                     "AKo": {"3B": 1.0}, "AQo": {"3B": 0.7, "C": 0.3}, "AJo": {"C": 1.0}, "ATo": {"C": 1.0}, "A9o": {"C": 1.0},"A8o": {"C": 0.8, "F": 0.2},"A7o": {"C": 0.5, "F": 0.5},"A6o": {"C": 0.3, "F": 0.7},"A5o": {"C": 0.3, "F": 0.7},"A4o": {"C": 0.2, "F": 0.8},"A3o": {"C": 0.2, "F": 0.8},"A2o": {"C": 0.2, "F": 0.8},
                     "KQs": {"3B": 0.4, "C": 0.6}, "KJs": {"C": 1.0}, "KTs": {"C": 1.0}, "K9s": {"C": 1.0}, "K8s": {"C": 1.0},"K7s": {"C": 1.0},"K6s": {"C": 0.7, "F": 0.3},"K5s": {"C": 0.4, "F": 0.6},
                     "KQo": {"C": 1.0}, "KJo": {"C": 1.0}, "KTo": {"C": 1.0}, "K9o": {"C": 0.8, "F": 0.2},
                     "QJs": {"C": 1.0}, "QTs": {"C": 1.0}, "Q9s": {"C": 1.0}, "Q8s": {"C": 0.5, "F": 0.5},
                     "QJo": {"C": 1.0}, "QTo": {"C": 0.9, "F": 0.1},
                     "JTs": {"C": 1.0}, "J9s": {"C": 1.0}, "J8s": {"C": 0.8, "F": 0.2},
                     "T9s": {"C": 1.0}, "T8s": {"C": 1.0}, "T7s": {"C": 0.5, "F": 0.5},
                     "98s": {"C": 1.0}, "97s": {"C": 0.9, "F": 0.1},
                     "87s": {"C": 1.0}, "86s": {"C": 0.7, "F": 0.3},
                     "76s": {"C": 1.0}, "75s": {"C": 0.4, "F": 0.6},
                     "65s": {"C": 1.0},
                     "54s": {"C": 0.9, "F": 0.1}
                 }
                 // ... BB vs andre posisjoner ville vært her
             }
        },
        "6max": {
            // --- RFI ---
            "UTG": { // 6max UTG RFI
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 0.9, "F": 0.1}, "66": {"R": 0.6, "F": 0.4}, "55": {"R": 0.4, "F": 0.6},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.8, "F": 0.2}, "A8s": {"R": 0.5, "F": 0.5},"A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.6, "F": 0.4},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.8, "F": 0.2},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.7, "F": 0.3},
                 "KQo": {"R": 0.8, "F": 0.2}, "KJo": {"R": 0.5, "F": 0.5},
                 "QJs": {"R": 1.0}, "QTs": {"R": 0.9, "F": 0.1},
                 "JTs": {"R": 1.0}, "J9s": {"R": 0.6, "F": 0.4},
                 "T9s": {"R": 0.7, "F": 0.3}
            },
            "MP": { // Placeholder - Copy UTG for now
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 0.9, "F": 0.1}, "66": {"R": 0.6, "F": 0.4}, "55": {"R": 0.4, "F": 0.6},
                 "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.8, "F": 0.2}, "A8s": {"R": 0.5, "F": 0.5},"A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.6, "F": 0.4},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.8, "F": 0.2},
                 "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.7, "F": 0.3},
                 "KQo": {"R": 0.8, "F": 0.2}, "KJo": {"R": 0.5, "F": 0.5},
                 "QJs": {"R": 1.0}, "QTs": {"R": 0.9, "F": 0.1},
                 "JTs": {"R": 1.0}, "J9s": {"R": 0.6, "F": 0.4},
                 "T9s": {"R": 0.7, "F": 0.3}
            },
            "CO": { // Placeholder - Looser than UTG/MP
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 0.8, "F": 0.2},
                 "Axs": {"R": 1.0},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.6, "F": 0.4},
                 "Kxs": {"R": 1.0},
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.8, "F": 0.2},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0},
                 "T9s": {"R": 1.0}, "T8s": {"R": 0.5, "F": 0.5},
                 "98s": {"R": 0.8, "F": 0.2},
                 "87s": {"R": 0.6, "F": 0.4}
            },
            "BTN": { // 6max BTN RFI (Veldig løs)
                 "AA": {"R": 1.0}, /*...*/ "22": {"R": 1.0},
                 "Axs": {"R": 1.0}, "Axo": {"R": 1.0},
                 "Kxs": {"R": 1.0}, "K2o+": {"R": 1.0}, // Any offsuit king
                 "Qxs": {"R": 1.0}, "Q5o+": {"R": 1.0},
                 "Jxs": {"R": 1.0}, "J7o+": {"R": 1.0},
                 "Txs": {"R": 1.0}, "T8o+": {"R": 1.0},
                 "9xs": {"R": 1.0}, "97o+": {"R": 1.0},
                 "8xs": {"R": 1.0}, "87o": {"R": 0.7, "F": 0.3},
                 "75s+": {"R": 1.0}, "76o": {"R": 0.6, "F": 0.4},
                 "64s+": {"R": 1.0},
                 "54s": {"R": 1.0},
                 // --- Vs RFI ---
                 "vs_UTG_RFI": { // BTN vs 6max UTG Raise
                      "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.8, "C": 0.2}, "JJ": {"C": 1.0}, "TT": {"C": 1.0}, "99": {"C": 0.8, "F": 0.2}, "88": {"C": 0.5, "F": 0.5},
                      "AKs": {"3B": 1.0}, "AQs": {"3B": 0.5, "C": 0.5}, "AJs": {"C": 1.0}, "ATs": {"C": 0.9, "F": 0.1}, "A5s": {"3B": 0.4, "C": 0.6},
                      "AKo": {"3B": 0.6, "C": 0.4}, "AQo": {"C": 1.0}, "AJo": {"C": 0.6, "F": 0.4},
                      "KQs": {"C": 1.0}, "KJs": {"C": 1.0}, "KTs": {"C": 0.7, "F": 0.3},
                      "QJs": {"C": 0.9, "F": 0.1}
                 }
             },
            "SB": { // Placeholder - Similar to 9max SB?
                 "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 0.8, "F": 0.2}, "44": {"R": 0.6, "F": 0.4},"33": {"R": 0.4, "F": 0.6},"22": {"R": 0.4, "F": 0.6},
                 "Axs": {"R": 1.0},
                 "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.8, "F": 0.2},"A8o": {"R": 0.5, "F": 0.5},"A7o": {"R": 0.3, "F": 0.7},"A5o": {"R": 0.4, "F": 0.6},"A4o": {"R": 0.2, "F": 0.8},
                 "Kxs": {"R": 1.0},
                 "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.9, "F": 0.1},"K9o": {"R": 0.4, "F": 0.6},
                 "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0},
                 "QJo": {"R": 0.7, "F": 0.3},
                 "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.5, "F": 0.5},
                 "T9s": {"R": 1.0}, "T8s": {"R": 0.7, "F": 0.3},
                 "98s": {"R": 1.0},
                 "87s": {"R": 0.8, "F": 0.2},
                 "76s": {"R": 0.6, "F": 0.4},
                 "65s": {"R": 0.4, "F": 0.6}
            },
            "BB": {
                 // BB RFI not possible
                 "vs_BTN_RFI": { // BB vs 6max BTN Raise (Veldig bred)
                      "AA": {"3B": 1.0}, /*...*/ "22": {"C": 1.0},
                      "Axs": {"3B": 0.4, "C": 0.6}, "Axo": {"3B": 0.2, "C": 0.8}, // Caller nesten alle ess
                      "Kxs": {"C": 1.0}, "Kxo": {"C": 1.0},
                      "Qxs": {"C": 1.0}, "Q5o+": {"C": 1.0},
                      "Jxs": {"C": 1.0}, "J7o+": {"C": 1.0},
                      "Txs": {"C": 1.0}, "T7o+": {"C": 1.0},
                      "96s+": {"C": 1.0}, "97o+": {"C": 1.0},
                      "85s+": {"C": 1.0}, "87o": {"C": 0.7, "F": 0.3},
                      "75s+": {"C": 1.0}, "76o": {"C": 0.6, "F": 0.4},
                      "64s+": {"C": 1.0},
                      "53s+": {"C": 1.0}
                 }
             }
        }
    },
    "10bb": {
        // --- Push/Fold Ranges (Data direkte under posisjon for RFI) ---
        "9max": {
            "UTG": { // RFI PUSH
                "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":0.8,"F":0.2}, "99": {"P":0.6,"F":0.4}, "88": {"P":0.3,"F":0.7},
                "AKs": {"P":1.0}, "AQs": {"P":0.9,"F":0.1}, "AJs":{"P":0.7, "F":0.3}, "ATs": {"P":0.4, "F":0.6},
                "AKo": {"P":1.0}, "AQo": {"P":0.5, "F":0.5}
            },
            "UTG+1": { // Placeholder - Copy UTG
                 "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":0.8,"F":0.2}, "99": {"P":0.6,"F":0.4}, "88": {"P":0.3,"F":0.7},
                 "AKs": {"P":1.0}, "AQs": {"P":0.9,"F":0.1}, "AJs":{"P":0.7, "F":0.3}, "ATs": {"P":0.4, "F":0.6},
                 "AKo": {"P":1.0}, "AQo": {"P":0.5, "F":0.5}
            },
            "MP": { // Placeholder - Looser than UTG
                 "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":0.8,"F":0.2}, "88": {"P":0.5,"F":0.5}, "77": {"P":0.2,"F":0.8},
                 "AKs": {"P":1.0}, "AQs": {"P":1.0}, "AJs":{"P":0.9, "F":0.1}, "ATs": {"P":0.6, "F":0.4},
                 "AKo": {"P":1.0}, "AQo": {"P":0.8, "F":0.2}, "AJo": {"P":0.3,"F":0.7}
            },
             "MP+1": { // Placeholder - Copy MP
                 "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":0.8,"F":0.2}, "88": {"P":0.5,"F":0.5}, "77": {"P":0.2,"F":0.8},
                 "AKs": {"P":1.0}, "AQs": {"P":1.0}, "AJs":{"P":0.9, "F":0.1}, "ATs": {"P":0.6, "F":0.4},
                 "AKo": {"P":1.0}, "AQo": {"P":0.8, "F":0.2}, "AJo": {"P":0.3,"F":0.7}
            },
             "HJ": { // Placeholder - Looser than MP
                 "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":1.0}, "88": {"P":0.8,"F":0.2}, "77": {"P":0.6,"F":0.4}, "66": {"P":0.3, "F":0.7},
                 "Axs": {"P":1.0},
                 "AKo": {"P":1.0}, "AQo": {"P":1.0}, "AJo": {"P":0.9,"F":0.1}, "ATo": {"P":0.5,"F":0.5},
                 "KQs": {"P":1.0}, "KJs": {"P":0.8, "F":0.2}, "KTs": {"P":0.5,"F":0.5},
                 "KQo": {"P":0.6, "F":0.4}
            },
             "CO": { // Placeholder - Looser than HJ
                 "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":1.0}, "88": {"P":1.0}, "77": {"P":0.8,"F":0.2}, "66": {"P":0.6,"F":0.4}, "55": {"P":0.4,"F":0.6},
                 "A2s+": {"P":1.0},
                 "K9s+": {"P":1.0}, "Q9s+": {"P":1.0}, "J9s+":{"P":1.0},
                 "A8o+": {"P":1.0}, "KTo+": {"P":1.0}, "QJo": {"P":0.8, "F":0.2}
            },
            "BTN": { // RFI PUSH
                "AA": {"P":1.0},"KK": {"P":1.0},"QQ": {"P":1.0},"JJ": {"P":1.0},"TT": {"P":1.0},"99": {"P":1.0},"88": {"P":1.0},"77": {"P":1.0},"66": {"P":1.0},"55": {"P":1.0},"44": {"P":0.8,"F":0.2},"33": {"P":0.6,"F":0.4},"22": {"P":0.6,"F":0.4},
                "A2s+": {"P":1.0}, "K7s+": {"P":1.0}, "Q8s+": {"P":1.0}, "J8s+":{"P":1.0}, "T8s+": {"P":1.0}, "98s": {"P":0.7, "F": 0.3},
                "A2o+": {"P":1.0}, "K9o+":{"P":1.0}, "QTo+": {"P":1.0}, "JTo": {"P":0.8, "F": 0.2}
            },
             "SB": { // RFI PUSH
                 "AA": {"P":1.0},"KK": {"P":1.0},"QQ": {"P":1.0},"JJ": {"P":1.0},"TT": {"P":1.0},"99": {"P":1.0},"88": {"P":1.0},"77": {"P":1.0},"66": {"P":1.0},"55": {"P":1.0},"44": {"P":0.9,"F":0.1},"33": {"P":0.7,"F":0.3},"22": {"P":0.7,"F":0.3},
                 "A2s+": {"P":1.0}, "K5s+": {"P":1.0}, "Q7s+": {"P":1.0}, "J8s+":{"P":1.0}, "T8s+": {"P":1.0}, "97s+": {"P":1.0},
                 "A2o+": {"P":1.0}, "K8o+":{"P":1.0}, "Q9o+": {"P":1.0}, "J9o+": {"P":0.8, "F":0.2}, "T9o": {"P":0.6, "F": 0.4}
             },
            "BB": {
                // BB RFI not possible
                "vs_BTN_Push": { // BB CALL vs BTN Push
                    "AA": {"C":1.0}, "KK": {"C":1.0}, "QQ": {"C":1.0}, "JJ": {"C":1.0}, "TT": {"C":0.9,"F":0.1},"99": {"C":0.8,"F":0.2},"88": {"C":0.6,"F":0.4},"77": {"C":0.4,"F":0.6},
                    "AKs": {"C":1.0}, "AQs": {"C":1.0}, "AJs": {"C":1.0}, "ATs": {"C":0.8,"F":0.2},"A9s": {"C":0.5,"F":0.5},
                    "AKo": {"C":1.0}, "AQo": {"C":1.0}, "AJo": {"C":0.7,"F":0.3}, "ATo": {"C":0.3, "F":0.7}
                }
            }
        },
        "6max": {
            "UTG": { // RFI PUSH
                "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":1.0}, "88": {"P":0.7, "F":0.3}, "77": {"P":0.4, "F":0.6},
                "AKs": {"P":1.0}, "AQs": {"P":1.0}, "AJs": {"P":1.0}, "ATs": {"P":0.7, "F":0.3}, "A9s": {"P":0.4, "F":0.6},
                "AKo": {"P":1.0}, "AQo": {"P":1.0}, "AJo": {"P":0.5, "F":0.5}
            },
             "MP": { // Placeholder - Looser than UTG
                "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":1.0}, "88": {"P":1.0}, "77": {"P":0.7, "F":0.3}, "66": {"P":0.5, "F":0.5},
                "AKs": {"P":1.0}, "AQs": {"P":1.0}, "AJs": {"P":1.0}, "ATs": {"P":1.0}, "A9s": {"P":0.7, "F":0.3}, "A8s": {"P":0.4, "F":0.6},
                "AKo": {"P":1.0}, "AQo": {"P":1.0}, "AJo": {"P":0.8, "F":0.2}, "ATo": {"P":0.4, "F":0.6},
                 "KQs": {"P":1.0}, "KJs": {"P":0.7, "F":0.3}, "KTs": {"P":0.4, "F":0.6}
            },
             "CO": { // Placeholder - Looser than MP
                "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":1.0}, "88": {"P":1.0}, "77": {"P":1.0}, "66": {"P":0.8, "F":0.2}, "55": {"P":0.6, "F":0.4},
                "A2s+": {"P":1.0}, "K8s+": {"P":1.0}, "Q9s+": {"P":1.0}, "J9s+":{"P":1.0}, "T9s": {"P":0.8, "F":0.2},
                "A5o+": {"P":1.0}, "K9o+": {"P":1.0}, "QTo+": {"P":1.0}, "JTo": {"P":0.6, "F":0.4}
            },
            "BTN": { // RFI PUSH
                "AA": {"P":1.0}, /*...*/ "22": {"P":1.0},
                "A2s+": {"P":1.0}, "K2s+": {"P":1.0}, "Q5s+": {"P":1.0}, "J7s+": {"P":1.0}, "T7s+": {"P":1.0}, "97s+": {"P":1.0}, "86s+": {"P":1.0}, "76s": {"P":1.0}, "65s": {"P":0.8, "F": 0.2},
                "A2o+": {"P":1.0}, "K8o+": {"P":1.0}, "Q9o+": {"P":1.0}, "J9o+": {"P":1.0}, "T9o": {"P":0.8, "F": 0.2}
            },
             "SB": { // RFI PUSH
                "AA": {"P":1.0}, /*...*/ "22": {"P":1.0},
                "A2s+": {"P":1.0}, "K2s+": {"P":1.0}, "Q2s+": {"P":1.0}, "J5s+": {"P":1.0}, "T6s+": {"P":1.0}, "96s+": {"P":1.0}, "86s+": {"P":1.0}, "75s+": {"P":1.0}, "65s": {"P":1.0}, "54s": {"P":0.8, "F":0.2},
                "A2o+": {"P":1.0}, "K5o+": {"P":1.0}, "Q8o+": {"P":1.0}, "J8o+": {"P":1.0}, "T8o+": {"P":1.0}, "98o": {"P":0.7, "F":0.3}
             },
            "BB": {
                // BB RFI not possible
                "vs_BTN_Push": { // BB CALL vs BTN Push
                    "AA": {"C":1.0}, "KK": {"C":1.0}, "QQ": {"C":1.0}, "JJ": {"C":1.0}, "TT": {"C":1.0},"99": {"C":0.9,"F":0.1},"88": {"C":0.7,"F":0.3},"77": {"C":0.5,"F":0.5},"66":{"C":0.3,"F":0.7},
                    "AKs": {"C":1.0}, "AQs": {"C":1.0}, "AJs": {"C":1.0}, "ATs": {"C":0.9,"F":0.1},"A9s": {"C":0.7,"F":0.3},"A8s": {"C":0.5,"F":0.5},
                    "AKo": {"C":1.0}, "AQo": {"C":1.0}, "AJo": {"C":0.8,"F":0.2}, "ATo": {"C":0.6,"F":0.4},
                    "KQs": {"C":1.0}, "KJs": {"C":0.7,"F":0.3}
                }
             }
        }
    }
};

// --- Hjelpefunksjoner (MODIFISERT FOR RFI-STRUKTUR) ---

/**
 * Henter GTO-handlingsfrekvenser for en gitt hånd i en gitt situasjon.
 * Håndterer at RFI-data ligger direkte under posisjonen, mens vs_...-data ligger under scenario-nøkkelen.
 * @param {string} stackDepth - '40bb' eller '10bb'
 * @param {number} numPlayers - 9 eller 6
 * @param {string} position - Posisjonsnavn (f.eks. 'UTG', 'BTN')
 * @param {string} scenario - Scenario-navn ('RFI', 'vs_UTG_RFI', etc.)
 * @param {string} handKey - Hånd-nøkkel (f.eks. 'AKs', '77', 'T9o')
 * @returns {object} Objekt med handlingsfrekvenser (f.eks. {"R": 1.0} eller {"3B": 0.7, "C": 0.3}), eller {"F": 1.0} hvis ikke funnet.
 */
function getGtoAction(stackDepth, numPlayers, position, scenario, handKey) {
    try {
        let rangeDataForScenario;
        // Få tak i basisdata for posisjonen først
        const basePositionData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position];

        if (!basePositionData) {
            // console.warn(`Posisjonsdata ikke funnet: ${stackDepth}, ${numPlayers}max, ${position}`);
            return { "F": 1.0 }; // Posisjon ikke funnet
        }

        // Sjekk om det er RFI-scenario
        if (scenario === "RFI") {
            // For RFI, range-dataen er direkte under posisjonen
            rangeDataForScenario = basePositionData;
        } else {
            // For andre scenarioer (vs_...), se etter scenario-nøkkelen under posisjonen
            rangeDataForScenario = basePositionData[scenario];
        }

        // Nå, se etter handKey i den relevante range-dataen
        if (rangeDataForScenario && rangeDataForScenario[handKey]) {
            return rangeDataForScenario[handKey];
        }

        // Hvis scenario-data eller hånd ikke finnes, default til Fold
        // console.warn(`Hand/Scenario data ikke funnet: ${handKey} in ${scenario}`);
        return { "F": 1.0 };
    } catch (e) {
        console.error("Error fetching GTO action:", e, stackDepth, numPlayers, position, scenario, handKey);
        return { "F": 1.0 };
    }
}

/**
 * Henter hele GTO-rangen for en gitt situasjon, og fyller ut med Fold for manglende hender.
 * Håndterer at RFI-data ligger direkte under posisjonen, mens vs_...-data ligger under scenario-nøkkelen.
 * @param {string} stackDepth - '40bb' eller '10bb'
 * @param {number} numPlayers - 9 eller 6
 * @param {string} position - Posisjonsnavn (f.eks. 'UTG', 'BTN')
 * @param {string} scenario - Scenario-navn ('RFI', 'vs_UTG_RFI', etc.)
 * @returns {object} Et objekt som mapper hver mulig håndnøkkel ('AA', 'AKs', etc.) til handlingsfrekvenser, eller et tomt objekt ved feil.
 */
function getFullRange(stackDepth, numPlayers, position, scenario) {
     try {
        let baseRangeDataForScenario;
        // Få tak i basisdata for posisjonen
        const basePositionData = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position];

        if (!basePositionData) {
            console.warn(`Posisjonsdata ikke funnet for full range: ${stackDepth}, ${numPlayers}max, ${position}`);
            return {}; // Posisjon ikke funnet
        }

        // Sjekk om det er RFI-scenario
        if (scenario === "RFI") {
             // For RFI, range-dataen er direkte under posisjonen
            baseRangeDataForScenario = basePositionData;
        } else {
             // For andre scenarioer (vs_...), se etter scenario-nøkkelen under posisjonen
            baseRangeDataForScenario = basePositionData[scenario] || {}; // Bruk tom {} hvis scenarioet mangler
        }

        // Bygg den komplette rangen basert på den funnede dataen
        const completeRange = {};
        const ranksRev = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        ranksRev.forEach((r1, i) => {
            ranksRev.forEach((r2, j) => {
                let key;
                if (i === j) key = r1 + r2;
                else if (i < j) key = r1 + r2 + 's';
                else key = r2 + r1 + 'o';
                // Bruk baseRangeDataForScenario som ble funnet over
                completeRange[key] = baseRangeDataForScenario[key] || { "F": 1.0 }; // Default Fold
            });
        });
        return completeRange;
    } catch (e) {
        console.error("Error fetching full range:", e, stackDepth, numPlayers, position, scenario);
        return {};
    }
}
