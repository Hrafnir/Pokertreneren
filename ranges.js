// ranges.js - V2 Ranges (Integrert BTN RFI, bruker konsistent struktur)
// R: Raise/Bet, C: Call, F: Fold, 3B: 3-Bet, P: Push/All-in
// MERK: Representative standard-ranger, ikke solver-perfekte.

// Initialiser GTO_RANGES hvis den ikke finnes (sikkerhetsnett)
var GTO_RANGES = GTO_RANGES || {};

GTO_RANGES["40bb"] = GTO_RANGES["40bb"] || {};
GTO_RANGES["40bb"]["9max"] = GTO_RANGES["40bb"]["9max"] || {};
GTO_RANGES["40bb"]["6max"] = GTO_RANGES["40bb"]["6max"] || {};
GTO_RANGES["10bb"] = GTO_RANGES["10bb"] || {};
GTO_RANGES["10bb"]["9max"] = GTO_RANGES["10bb"]["9max"] || {};
GTO_RANGES["10bb"]["6max"] = GTO_RANGES["10bb"]["6max"] || {};


// === 40BB RANGES ===

// --- 9max 40bb ---
GTO_RANGES["40bb"]["9max"]["UTG"] = GTO_RANGES["40bb"]["9max"]["UTG"] || {};
GTO_RANGES["40bb"]["9max"]["UTG"]["RFI"] = {
    "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 0.9, "F": 0.1}, "88": {"R": 0.6, "F": 0.4}, "77": {"R": 0.3, "F": 0.7},
    "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 0.8, "F": 0.2}, "A5s": {"R": 0.5, "F": 0.5}, "A4s": {"R": 0.2, "F": 0.8},
    "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 0.3, "F": 0.7},
    "KQs": {"R": 1.0}, "KJs": {"R": 0.7, "F": 0.3}, "KTs": {"R": 0.4, "F": 0.6},
    "QJs": {"R": 0.6, "F": 0.4}, "QTs": {"R": 0.2, "F": 0.8},
    "JTs": {"R": 0.4, "F": 0.6}
};

GTO_RANGES["40bb"]["9max"]["UTG+1"] = GTO_RANGES["40bb"]["9max"]["UTG+1"] || {};
GTO_RANGES["40bb"]["9max"]["UTG+1"]["RFI"] = {
    "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 0.9, "F": 0.1}, "77": {"R": 0.7, "F": 0.3}, "66": {"R": 0.4, "F": 0.6},
    "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 0.6, "F": 0.4},"A8s": {"R": 0.2, "F": 0.8},"A5s": {"R": 1.0}, "A4s": {"R": 0.8, "F": 0.2},
    "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 0.8, "F": 0.2}, "ATo": {"R": 0.3, "F": 0.7},
    "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 0.9, "F": 0.1}, "K9s": {"R": 0.3, "F": 0.7},
    "KQo": {"R": 0.4, "F": 0.6},
    "QJs": {"R": 1.0}, "QTs": {"R": 0.6, "F": 0.4},
    "JTs": {"R": 0.8, "F": 0.2},
    "T9s": {"R": 0.4, "F": 0.6}
};

GTO_RANGES["40bb"]["9max"]["MP"] = GTO_RANGES["40bb"]["9max"]["MP"] || {};
GTO_RANGES["40bb"]["9max"]["MP"]["RFI"] = {
     "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 0.8, "F": 0.2}, "55": {"R": 0.5, "F": 0.5},
     "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 0.6, "F": 0.4}, "A7s": {"R": 0.3, "F": 0.7}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.7, "F": 0.3}, "A2s": {"R": 0.4, "F": 0.6},
     "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.9, "F": 0.1}, "A9o": {"R": 0.2, "F": 0.8},
     "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.8, "F": 0.2},
     "KQo": {"R": 1.0}, "KJo": {"R": 0.6, "F": 0.4}, "KTo": {"R": 0.3, "F": 0.7},
     "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 0.7, "F": 0.3},
     "JTs": {"R": 1.0}, "J9s": {"R": 0.8, "F": 0.2},
     "T9s": {"R": 1.0}, "T8s": {"R": 0.4, "F": 0.6},
     "98s": {"R": 0.6, "F": 0.4}
};

GTO_RANGES["40bb"]["9max"]["MP+1"] = GTO_RANGES["40bb"]["9max"]["MP+1"] || {};
GTO_RANGES["40bb"]["9max"]["MP+1"]["RFI"] = { // Kopi av MP
     "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 0.8, "F": 0.2}, "55": {"R": 0.5, "F": 0.5},
     "AKs": {"R": 1.0}, "AQs": {"R": 1.0}, "AJs": {"R": 1.0}, "ATs": {"R": 1.0}, "A9s": {"R": 1.0}, "A8s": {"R": 0.6, "F": 0.4}, "A7s": {"R": 0.3, "F": 0.7}, "A5s": {"R": 1.0}, "A4s": {"R": 1.0}, "A3s": {"R": 0.7, "F": 0.3}, "A2s": {"R": 0.4, "F": 0.6},
     "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 0.9, "F": 0.1}, "A9o": {"R": 0.2, "F": 0.8},
     "KQs": {"R": 1.0}, "KJs": {"R": 1.0}, "KTs": {"R": 1.0}, "K9s": {"R": 0.8, "F": 0.2},
     "KQo": {"R": 1.0}, "KJo": {"R": 0.6, "F": 0.4}, "KTo": {"R": 0.3, "F": 0.7},
     "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 0.7, "F": 0.3},
     "JTs": {"R": 1.0}, "J9s": {"R": 0.8, "F": 0.2},
     "T9s": {"R": 1.0}, "T8s": {"R": 0.4, "F": 0.6},
     "98s": {"R": 0.6, "F": 0.4}
};

GTO_RANGES["40bb"]["9max"]["HJ"] = GTO_RANGES["40bb"]["9max"]["HJ"] || {};
GTO_RANGES["40bb"]["9max"]["HJ"]["RFI"] = {
     "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 0.8, "F": 0.2}, "44": {"R": 0.5, "F": 0.5}, "33": {"R": 0.3, "F": 0.7},"22": {"R": 0.3, "F": 0.7},
     "Axs": {"R": 1.0}, "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.8, "F": 0.2}, "A8o": {"R": 0.5, "F": 0.5},"A7o": {"R": 0.2, "F": 0.8},
     "Kxs": {"R": 1.0}, "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 1.0}, "K9o": {"R": 0.5, "F": 0.5},
     "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "Q8s": {"R": 0.4, "F": 0.6}, "QJo": {"R": 1.0}, "QTo": {"R": 0.7, "F": 0.3},
     "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.7, "F": 0.3},
     "T9s": {"R": 1.0}, "T8s": {"R": 1.0}, "T7s": {"R": 0.3, "F": 0.7},
     "98s": {"R": 1.0}, "97s": {"R": 0.5, "F": 0.5},
     "87s": {"R": 1.0}, "86s": {"R": 0.2, "F": 0.8},
     "76s": {"R": 0.9, "F": 0.1},
     "65s": {"R": 0.6, "F": 0.4}
};

GTO_RANGES["40bb"]["9max"]["CO"] = GTO_RANGES["40bb"]["9max"]["CO"] || {};
GTO_RANGES["40bb"]["9max"]["CO"]["RFI"] = {
     "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 1.0}, "44": {"R": 0.8, "F": 0.2}, "33": {"R": 0.5, "F": 0.5},"22": {"R": 0.5, "F": 0.5},
     "Axs": {"R": 1.0}, "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 1.0}, "A8o": {"R": 0.7, "F": 0.3},"A7o": {"R": 0.4, "F": 0.6},"A6o": {"R": 0.2, "F": 0.8},"A5o": {"R": 0.3, "F": 0.7},"A4o": {"R": 0.2, "F": 0.8},
     "Kxs": {"R": 1.0}, "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 1.0}, "K9o": {"R": 0.8, "F": 0.2}, "K8o": {"R": 0.3, "F": 0.7},
     "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "Q8s": {"R": 0.6, "F": 0.4},"Q7s": {"R": 0.2, "F": 0.8}, "QJo": {"R": 1.0}, "QTo": {"R": 1.0}, "Q9o": {"R": 0.3, "F": 0.7},
     "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.9, "F": 0.1}, "J7s": {"R": 0.3, "F": 0.7},
     "T9s": {"R": 1.0}, "T8s": {"R": 1.0}, "T7s": {"R": 0.7, "F": 0.3},
     "98s": {"R": 1.0}, "97s": {"R": 1.0}, "96s": {"R": 0.2, "F": 0.8},
     "87s": {"R": 1.0}, "86s": {"R": 0.7, "F": 0.3},
     "76s": {"R": 1.0}, "75s": {"R": 0.4, "F": 0.6},
     "65s": {"R": 1.0},
     "54s": {"R": 0.8, "F": 0.2}
};
// --- Vs RFI ---
GTO_RANGES["40bb"]["9max"]["CO"]["vs_UTG_RFI"] = {
     "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.6, "C": 0.4}, "JJ": {"C": 1.0}, "TT": {"C": 0.9, "F": 0.1}, "99": {"C": 0.5, "F": 0.5}, "88":{"C": 0.2, "F": 0.8},
     "AKs": {"3B": 1.0}, "AQs": {"3B": 0.3, "C": 0.7}, "AJs": {"C": 1.0}, "ATs":{"C": 0.6, "F": 0.4},
     "AKo": {"3B": 0.7, "C": 0.3}, "AQo": {"C": 0.8, "F": 0.2},
     "KQs": {"C": 1.0}, "KJs": {"C": 0.5, "F": 0.5}
};

// **** START NY BTN RFI ****
GTO_RANGES["40bb"]["9max"]["BTN"] = GTO_RANGES["40bb"]["9max"]["BTN"] || {};
GTO_RANGES["40bb"]["9max"]["BTN"]["RFI"] = {
    "22": {"R": 1}, "33": {"R": 1}, "44": {"R": 1}, "55": {"R": 1}, "66": {"R": 1}, "77": {"R": 1}, "88": {"R": 1}, "99": {"R": 1},
    "TT": {"R": 1}, "JJ": {"R": 1}, "QQ": {"R": 1}, "KK": {"R": 1}, "AA": {"R": 1},
    "A2s": {"R": 1}, "A3s": {"R": 1}, "A4s": {"R": 1}, "A5s": {"R": 1}, "A6s": {"R": 1}, "A7s": {"R": 1}, "A8s": {"R": 1}, "A9s": {"R": 1}, "ATs": {"R": 1}, "AJs": {"R": 1}, "AQs": {"R": 1}, "AKs": {"R": 1},
    "KQs": {"R": 1}, "KJs": {"R": 1}, "KTs": {"R": 1}, "K9s": {"F": 0.3, "R": 0.7}, // Mixed K9s
    "QJs": {"R": 1}, "QTs": {"R": 1}, "Q9s": {"F": 0.3, "R": 0.7}, // Mixed Q9s
    "JTs": {"R": 1}, "J9s": {"F": 0.3, "R": 0.7}, // Mixed J9s
    "T9s": {"R": 1}, "98s": {"R": 1}, "87s": {"R": 1},
    "A7o": {"R": 1}, "A8o": {"R": 1}, "A9o": {"R": 1}, "ATo": {"R": 1}, "AJo": {"R": 1}, "AQo": {"R": 1}, "AKo": {"R": 1},
    "KTo": {"R": 1}, "KJo": {"R": 1}, "KQo": {"R": 1},
    "QTo": {"R": 1}, "QJo": {"R": 1},
    "JTo": {"R": 1}
    // Andre hender er default Fold (ikke inkludert i objektet)
};
// **** SLUTT NY BTN RFI ****

// --- Vs RFI for BTN (Beholder eksisterende) ---
GTO_RANGES["40bb"]["9max"]["BTN"]["vs_UTG_RFI"] = {
    "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 0.7, "C": 0.3}, "JJ": {"C": 1.0}, "TT": {"C": 0.9, "F": 0.1}, "99": {"C": 0.6, "F": 0.4}, "88": {"C": 0.3, "F": 0.7},
    "AKs": {"3B": 0.9, "C": 0.1}, "AQs": {"C": 1.0}, "AJs": {"C": 0.8, "F": 0.2}, "ATs": {"C": 0.5, "F": 0.5}, "A5s": {"3B": 0.3, "F": 0.7},
    "AKo": {"C": 1.0}, "AQo": {"C": 0.6, "F": 0.4},
    "KQs": {"C": 1.0}, "KJs": {"C": 0.6, "F": 0.4}
};
GTO_RANGES["40bb"]["9max"]["BTN"]["vs_CO_RFI"] = {
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
};


GTO_RANGES["40bb"]["9max"]["SB"] = GTO_RANGES["40bb"]["9max"]["SB"] || {};
GTO_RANGES["40bb"]["9max"]["SB"]["RFI"] = {
     "AA": {"R": 1.0}, "KK": {"R": 1.0}, "QQ": {"R": 1.0}, "JJ": {"R": 1.0}, "TT": {"R": 1.0}, "99": {"R": 1.0}, "88": {"R": 1.0}, "77": {"R": 1.0}, "66": {"R": 1.0}, "55": {"R": 0.8, "F": 0.2}, "44": {"R": 0.6, "F": 0.4},"33": {"R": 0.4, "F": 0.6},"22": {"R": 0.4, "F": 0.6},
     "Axs": {"R": 1.0}, "AKo": {"R": 1.0}, "AQo": {"R": 1.0}, "AJo": {"R": 1.0}, "ATo": {"R": 1.0}, "A9o": {"R": 0.8, "F": 0.2},"A8o": {"R": 0.5, "F": 0.5},"A7o": {"R": 0.3, "F": 0.7},"A5o": {"R": 0.4, "F": 0.6},"A4o": {"R": 0.2, "F": 0.8},
     "Kxs": {"R": 1.0}, "KQo": {"R": 1.0}, "KJo": {"R": 1.0}, "KTo": {"R": 0.9, "F": 0.1},"K9o": {"R": 0.4, "F": 0.6},
     "QJs": {"R": 1.0}, "QTs": {"R": 1.0}, "Q9s": {"R": 1.0}, "QJo": {"R": 0.7, "F": 0.3},
     "JTs": {"R": 1.0}, "J9s": {"R": 1.0}, "J8s": {"R": 0.5, "F": 0.5},
     "T9s": {"R": 1.0}, "T8s": {"R": 0.7, "F": 0.3},
     "98s": {"R": 1.0},
     "87s": {"R": 0.8, "F": 0.2},
     "76s": {"R": 0.6, "F": 0.4},
     "65s": {"R": 0.4, "F": 0.6}
};

GTO_RANGES["40bb"]["9max"]["BB"] = GTO_RANGES["40bb"]["9max"]["BB"] || {};
// BB har ikke RFI scenario
GTO_RANGES["40bb"]["9max"]["BB"]["vs_BTN_RFI"] = {
     "AA": {"3B": 1.0}, "KK": {"3B": 1.0}, "QQ": {"3B": 1.0}, "JJ": {"3B": 0.7, "C": 0.3}, "TT": {"3B": 0.4, "C": 0.6}, "99": {"C": 1.0}, "88": {"C": 1.0}, "77": {"C": 1.0},"66": {"C": 1.0},"55": {"C": 1.0},"44": {"C": 1.0},"33": {"C": 1.0},"22": {"C": 1.0},
     "AKs": {"3B": 1.0}, "AQs": {"3B": 1.0}, "AJs": {"3B": 0.8, "C": 0.2}, "ATs": {"3B": 0.5, "C": 0.5}, "A9s": {"C": 1.0}, "A8s": {"C": 1.0},"A7s": {"C": 1.0},"A6s": {"C": 1.0},"A5s": {"3B": 0.3, "C": 0.7},"A4s": {"C": 1.0},"A3s": {"C": 1.0},"A2s": {"C": 1.0},
     "AKo": {"3B": 1.0}, "AQo": {"3B": 0.7, "C": 0.3}, "AJo": {"C": 1.0}, "ATo": {"C": 1.0}, "A9o": {"C": 1.0},"A8o": {"C": 0.8, "F": 0.2},"A7o": {"C": 0.5, "F": 0.5},"A6o": {"C": 0.3, "F": 0.7},"A5o": {"C": 0.3, "F": 0.7},"A4o": {"C": 0.2, "F": 0.8},"A3o": {"C": 0.2, "F": 0.8},"A2o": {"C": 0.2, "F": 0.8},
     "KQs": {"3B": 0.4, "C": 0.6}, "KJs": {"C": 1.0}, "KTs": {"C": 1.0}, "K9s": {"C": 1.0}, "K8s": {"C": 1.0},"K7s": {"C": 1.0},"K6s": {"C": 0.7, "F": 0.3},"K5s": {"C": 0.4, "F": 0.6},
     "KQo": {"C": 1.0}, "KJo": {"C": 1.0}, "KTo": {"C": 1.0}, "K9o": {"C": 0.8, "F": 0.2},
     "QJs": {"C": 1.0}, "QTs": {"C": 1.0}, "Q9s": {"C": 1.0}, "Q8s": {"C": 0.5, "F": 0.5}, "QJo": {"C": 1.0}, "QTo": {"C": 0.9, "F": 0.1},
     "JTs": {"C": 1.0}, "J9s": {"C": 1.0}, "J8s": {"C": 0.8, "F": 0.2},
     "T9s": {"C": 1.0}, "T8s": {"C": 1.0}, "T7s": {"C": 0.5, "F": 0.5},
     "98s": {"C": 1.0}, "97s": {"C": 0.9, "F": 0.1},
     "87s": {"C": 1.0}, "86s": {"C": 0.7, "F": 0.3},
     "76s": {"C": 1.0}, "75s": {"C": 0.4, "F": 0.6},
     "65s": {"C": 1.0},
     "54s": {"C": 0.9, "F": 0.1}
};

// --- 6max 40bb ---
// (Placeholders/kopier - må defineres skikkelig)
GTO_RANGES["40bb"]["6max"]["UTG"] = GTO_RANGES["40bb"]["6max"]["UTG"] || {};
GTO_RANGES["40bb"]["6max"]["UTG"]["RFI"] = GTO_RANGES["40bb"]["9max"]["MP"]["RFI"]; // ~MP 9max

GTO_RANGES["40bb"]["6max"]["MP"] = GTO_RANGES["40bb"]["6max"]["MP"] || {};
GTO_RANGES["40bb"]["6max"]["MP"]["RFI"] = GTO_RANGES["40bb"]["9max"]["HJ"]["RFI"]; // ~HJ 9max

GTO_RANGES["40bb"]["6max"]["CO"] = GTO_RANGES["40bb"]["6max"]["CO"] || {};
GTO_RANGES["40bb"]["6max"]["CO"]["RFI"] = GTO_RANGES["40bb"]["9max"]["CO"]["RFI"];

GTO_RANGES["40bb"]["6max"]["BTN"] = GTO_RANGES["40bb"]["6max"]["BTN"] || {};
GTO_RANGES["40bb"]["6max"]["BTN"]["RFI"] = GTO_RANGES["40bb"]["9max"]["BTN"]["RFI"]; // Bruker samme BTN range foreløpig
GTO_RANGES["40bb"]["6max"]["BTN"]["vs_UTG_RFI"] = GTO_RANGES["40bb"]["9max"]["BTN"]["vs_CO_RFI"]; // ~BTN vs CO 9max

GTO_RANGES["40bb"]["6max"]["SB"] = GTO_RANGES["40bb"]["6max"]["SB"] || {};
GTO_RANGES["40bb"]["6max"]["SB"]["RFI"] = GTO_RANGES["40bb"]["9max"]["SB"]["RFI"];

GTO_RANGES["40bb"]["6max"]["BB"] = GTO_RANGES["40bb"]["6max"]["BB"] || {};
GTO_RANGES["40bb"]["6max"]["BB"]["vs_BTN_RFI"] = GTO_RANGES["40bb"]["9max"]["BB"]["vs_BTN_RFI"]; // Bruker samme BB vs BTN


// === 10BB RANGES ===

// --- 9max 10bb ---
GTO_RANGES["10bb"]["9max"]["UTG"] = GTO_RANGES["10bb"]["9max"]["UTG"] || {};
GTO_RANGES["10bb"]["9max"]["UTG"]["RFI"] = {
    "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":0.8,"F":0.2}, "99": {"P":0.6,"F":0.4}, "88": {"P":0.3,"F":0.7},
    "AKs": {"P":1.0}, "AQs": {"P":0.9,"F":0.1}, "AJs":{"P":0.7, "F":0.3}, "ATs": {"P":0.4, "F":0.6},
    "AKo": {"P":1.0}, "AQo": {"P":0.5, "F":0.5}
};
// ... (Legg til andre 9max 10bb posisjoner/scenarioer her)
GTO_RANGES["10bb"]["9max"]["BTN"] = GTO_RANGES["10bb"]["9max"]["BTN"] || {};
GTO_RANGES["10bb"]["9max"]["BTN"]["RFI"] = {
    "AA": {"P":1.0},"KK": {"P":1.0},"QQ": {"P":1.0},"JJ": {"P":1.0},"TT": {"P":1.0},"99": {"P":1.0},"88": {"P":1.0},"77": {"P":1.0},"66": {"P":1.0},"55": {"P":1.0},"44": {"P":0.8,"F":0.2},"33": {"P":0.6,"F":0.4},"22": {"P":0.6,"F":0.4},
    "A2s+": {"P":1.0}, "K7s+": {"P":1.0}, "Q8s+": {"P":1.0}, "J8s+":{"P":1.0}, "T8s+": {"P":1.0}, "98s": {"P":0.7, "F": 0.3},
    "A2o+": {"P":1.0}, "K9o+":{"P":1.0}, "QTo+": {"P":1.0}, "JTo": {"P":0.8, "F": 0.2}
};
GTO_RANGES["10bb"]["9max"]["BB"] = GTO_RANGES["10bb"]["9max"]["BB"] || {};
GTO_RANGES["10bb"]["9max"]["BB"]["vs_BTN_Push"] = { // Endret scenario-navn for klarhet
    "AA": {"C":1.0}, "KK": {"C":1.0}, "QQ": {"C":1.0}, "JJ": {"C":1.0}, "TT": {"C":0.9,"F":0.1},"99": {"C":0.8,"F":0.2},"88": {"C":0.6,"F":0.4},"77": {"C":0.4,"F":0.6},
    "AKs": {"C":1.0}, "AQs": {"C":1.0}, "AJs": {"C":1.0}, "ATs": {"C":0.8,"F":0.2},"A9s": {"C":0.5,"F":0.5},
    "AKo": {"C":1.0}, "AQo": {"C":1.0}, "AJo": {"C":0.7,"F":0.3}, "ATo": {"C":0.3, "F":0.7}
};


// --- 6max 10bb ---
GTO_RANGES["10bb"]["6max"]["UTG"] = GTO_RANGES["10bb"]["6max"]["UTG"] || {};
GTO_RANGES["10bb"]["6max"]["UTG"]["RFI"] = {
    "AA": {"P":1.0}, "KK": {"P":1.0}, "QQ": {"P":1.0}, "JJ": {"P":1.0}, "TT": {"P":1.0},"99": {"P":1.0}, "88": {"P":0.7, "F":0.3}, "77": {"P":0.4, "F":0.6},
    "AKs": {"P":1.0}, "AQs": {"P":1.0}, "AJs": {"P":1.0}, "ATs": {"P":0.7, "F":0.3}, "A9s": {"P":0.4, "F":0.6},
    "AKo": {"P":1.0}, "AQo": {"P":1.0}, "AJo": {"P":0.5, "F":0.5}
};
// ... (Legg til andre 6max 10bb posisjoner/scenarioer her)
GTO_RANGES["10bb"]["6max"]["BTN"] = GTO_RANGES["10bb"]["6max"]["BTN"] || {};
GTO_RANGES["10bb"]["6max"]["BTN"]["RFI"] = {
    "AA": {"P":1.0}, "22": {"P":1.0}, /* Fyll ut resten basert på plotter */
    "A2s+": {"P":1.0}, "K2s+": {"P":1.0}, "Q5s+": {"P":1.0}, "J7s+": {"P":1.0}, "T7s+": {"P":1.0}, "97s+": {"P":1.0}, "86s+": {"P":1.0}, "76s": {"P":1.0}, "65s": {"P":0.8, "F": 0.2},
    "A2o+": {"P":1.0}, "K8o+": {"P":1.0}, "Q9o+": {"P":1.0}, "J9o+": {"P":1.0}, "T9o": {"P":0.8, "F": 0.2}
};
GTO_RANGES["10bb"]["6max"]["BB"] = GTO_RANGES["10bb"]["6max"]["BB"] || {};
GTO_RANGES["10bb"]["6max"]["BB"]["vs_BTN_Push"] = { // Endret scenario-navn for klarhet
    "AA": {"C":1.0}, "KK": {"C":1.0}, "QQ": {"C":1.0}, "JJ": {"C":1.0}, "TT": {"C":1.0},"99": {"C":0.9,"F":0.1},"88": {"C":0.7,"F":0.3},"77": {"C":0.5,"F":0.5},"66":{"C":0.3,"F":0.7},
    "AKs": {"C":1.0}, "AQs": {"C":1.0}, "AJs": {"C":1.0}, "ATs": {"C":0.9,"F":0.1},"A9s": {"C":0.7,"F":0.3},"A8s": {"C":0.5,"F":0.5},
    "AKo": {"C":1.0}, "AQo": {"C":1.0}, "AJo": {"C":0.8,"F":0.2}, "ATo": {"C":0.6,"F":0.4},
    "KQs": {"C":1.0}, "KJs": {"C":0.7,"F":0.3}
};


// === HJELPEFUNKSJONER (JUSTERT FOR KONSISTENT STRUKTUR) ===

/**
 * Henter GTO-handlingsfrekvenser. Forventer nå ALLTID scenario-nøkkelen.
 * @returns {object} Objekt med handlingsfrekvenser, eller {"F": 1.0} hvis ikke funnet.
 */
function getGtoAction(stackDepth, numPlayers, position, scenario, handKey) {
    try {
        // Direkte oppslag med scenario-nøkkel
        const rangeDataForScenario = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario];

        if (rangeDataForScenario && rangeDataForScenario[handKey]) {
            return rangeDataForScenario[handKey];
        }

        // Hvis range for scenario, eller spesifikk hånd mangler -> Fold
        // console.warn(`GTO Action not found for: ${stackDepth}, ${numPlayers}max, ${position}, ${scenario}, ${handKey}. Defaulting Fold.`);
        return { "F": 1.0 };
    } catch (e) {
        console.error("Error fetching GTO action:", e, stackDepth, numPlayers, position, scenario, handKey);
        return { "F": 1.0 }; // Feilsikker Fold
    }
}

/**
 * Henter hele GTO-rangen for en gitt situasjon. Forventer nå ALLTID scenario-nøkkelen.
 * @returns {object} Komplett range-objekt, eller tomt objekt ved feil.
 */
function getFullRange(stackDepth, numPlayers, position, scenario) {
     try {
        // Direkte oppslag med scenario-nøkkel
        const baseRangeDataForScenario = GTO_RANGES[stackDepth]?.[`${numPlayers}max`]?.[position]?.[scenario] || {}; // Bruk tom {} hvis scenario mangler

        // Bygg komplett range
        const completeRange = {};
        const ranksRev = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        ranksRev.forEach((r1, i) => {
            ranksRev.forEach((r2, j) => {
                let key;
                if (i === j) key = r1 + r2;
                else if (i < j) key = r1 + r2 + 's';
                else key = r2 + r1 + 'o';
                completeRange[key] = baseRangeDataForScenario[key] || { "F": 1.0 }; // Default Fold for hender som ikke er definert
            });
        });
        return completeRange;
    } catch (e) {
        console.error("Error fetching full range:", e, stackDepth, numPlayers, position, scenario);
        return {}; // Returner tomt objekt ved feil
    }
}

console.log("ranges.js loaded and processed."); // Bekreftelse på at filen er lastet
