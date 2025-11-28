/******************************************************
 * CONFIGURACIÓN DE LA MÁQUINA DE TURING
 * 
 * Define las constantes, estados y función de transición
 * para el simulador de MT que emula un AFD.
 ******************************************************/

// Conjunto de estados
export const START_STATE = "q0";
export const ACCEPT_STATES = new Set(["q_admin", "q_guest", "q_user_accept"]);
export const REJECT_STATE = "q_dead";
export const BLANK = "_"; // símbolo blanco al final de la cinta

// Función de transición δ codificada como objeto de objetos.
// TRANSITIONS[estado][símbolo] = { nextState, move }
// move: "R" (derecha) o "S" (quedarse)
// IMPORTANTE: Nunca escribimos, solo leemos y movemos.
// AFD para: (admin | guest | user)
export const TRANSITIONS = {
  // Estado inicial: según el primer carácter decidimos a qué rama ir
  q0: {
    "a": { nextState: "q_a", move: "R" },   // posible "admin"
    "g": { nextState: "q_g", move: "R" },   // posible "guest"
    "u": { nextState: "q_u", move: "R" },   // posible "user"
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  // Rama "admin"
  q_a: {
    "d": { nextState: "q_ad", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_ad: {
    "m": { nextState: "q_adm", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_adm: {
    "i": { nextState: "q_admi", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_admi: {
    "n": { nextState: "q_admin", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  // Estado donde ya leímos "admin"
  q_admin: {
    [BLANK]: { nextState: "q_admin", move: "S" }, // se queda, ya aceptamos
    DEFAULT: { nextState: REJECT_STATE, move: "R" } // cualquier extra => rechazo
  },
  // Rama "guest"
  q_g: {
    "u": { nextState: "q_gu", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_gu: {
    "e": { nextState: "q_gue", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_gue: {
    "s": { nextState: "q_gues", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_gues: {
    "t": { nextState: "q_guest", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_guest: {
    [BLANK]: { nextState: "q_guest", move: "S" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  // Rama "user"
  q_u: {
    "s": { nextState: "q_us", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_us: {
    "e": { nextState: "q_use", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_use: {
    "r": { nextState: "q_user_accept", move: "R" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  q_user_accept: {
    [BLANK]: { nextState: "q_user_accept", move: "S" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  },
  // Estado de rechazo / trampa
  [REJECT_STATE]: {
    [BLANK]: { nextState: REJECT_STATE, move: "S" },
    DEFAULT: { nextState: REJECT_STATE, move: "R" }
  }
};

