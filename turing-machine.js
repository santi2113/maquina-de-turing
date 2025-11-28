/******************************************************
 * LÓGICA DE LA MÁQUINA DE TURING
 * 
 * Contiene la implementación del motor de la MT
 ******************************************************/

import { START_STATE, ACCEPT_STATES, REJECT_STATE, BLANK, TRANSITIONS } from './config.js';

/**
 * Clase que representa la Máquina de Turing
 */
export class TuringMachine {
  constructor() {
    // La Cinta (array de caracteres)
    this.tape = [];
    
    // Posición del cabezal (índice dentro de tape)
    this.headPosition = 0;
    
    // Estado actual q
    this.currentState = START_STATE;
    
    // Banderas de control
    this.halted = false;   // ¿La MT ya terminó?
    this.accepted = false; // ¿La cadena fue aceptada?
    
    // Callbacks para actualizar la UI
    this.onStateChange = null;
    this.onTapeChange = null;
    this.onResultChange = null;
    this.onTapeLoad = null;
  }

  /**
   * Carga una nueva cadena en la cinta y deja la MT en estado inicial.
   */
  loadTape(input) {
    this.reset();
    this.tape = input.split(""); // la cinta es una lista de caracteres
    if (this.onTapeLoad) {
      this.onTapeLoad();
    }
    this.notifyChanges();
  }

  /**
   * Reinicia la máquina a su estado inicial (sin cambiar la cinta).
   */
  reset() {
    this.headPosition = 0;
    this.currentState = START_STATE;
    this.halted = false;
    this.accepted = false;
    this.notifyChanges();
  }

  /**
   * Ejecuta UN paso de la MT (función "motor").
   * Aquí es donde se aplica la función de transición δ.
   */
  step() {
    if (this.halted) {
      return;
    }

    // 1. Leer símbolo bajo el cabezal
    const symbol = this.headPosition < this.tape.length ? this.tape[this.headPosition] : BLANK;

    // 2. Buscar la regla δ(q, símbolo)
    const stateTransitions = TRANSITIONS[this.currentState] || {};
    let transition = stateTransitions[symbol];
    if (!transition) {
      // Si no hay regla específica para ese símbolo, usamos DEFAULT
      transition = stateTransitions.DEFAULT;
    }
    if (!transition) {
      // Si ni siquiera hay DEFAULT, nos vamos al estado de rechazo
      this.currentState = REJECT_STATE;
      this.halted = true;
      this.accepted = false;
      this.notifyChanges();
      return;
    }

    // 3. Aplicar transición: actualizar estado y mover cabezal
    this.currentState = transition.nextState;

    // Por construcción, NUNCA escribimos en la cinta, solo nos movemos
    if (transition.move === "R") {
      this.headPosition += 1; // solo derecha
    } else if (transition.move === "S") {
      // no mover (stay)
    }

    // 4. Verificar si debemos detener la máquina
    if (ACCEPT_STATES.has(this.currentState)) {
      // Si estamos en un estado de aceptación, verificamos si realmente llegamos al fin de la cadena
      // El símbolo blanco solo se lee cuando headPosition >= tape.length (fin de cadena)
      const isAtEnd = this.headPosition >= this.tape.length;
      if (isAtEnd) {
        // Solo aceptamos si realmente llegamos al fin de la cadena
        this.halted = true;
        this.accepted = true;
      } else {
        // Si hay más caracteres después de llegar a un estado de aceptación, rechazamos
        this.halted = true;
        this.accepted = false;
        this.currentState = REJECT_STATE;
      }
    }

    if (this.currentState === REJECT_STATE) {
      this.halted = true;
      this.accepted = false;
    }

    // 5. Actualizar interfaz
    this.notifyChanges();
  }

  /**
   * Notifica a los callbacks sobre cambios en el estado
   */
  notifyChanges() {
    if (this.onStateChange) {
      this.onStateChange(this.currentState, this.headPosition);
    }
    if (this.onTapeChange) {
      this.onTapeChange(this.tape, this.headPosition, this.halted);
    }
    if (this.onResultChange) {
      this.onResultChange(this.halted, this.accepted);
    }
  }

  /**
   * Obtiene el estado actual de la máquina
   */
  getState() {
    return {
      tape: [...this.tape],
      headPosition: this.headPosition,
      currentState: this.currentState,
      halted: this.halted,
      accepted: this.accepted
    };
  }
}

