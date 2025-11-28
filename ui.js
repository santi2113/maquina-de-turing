/******************************************************
 * INTERFAZ DE USUARIO
 * 
 * Maneja el renderizado y la interacción con el usuario
 ******************************************************/

import { BLANK } from './config.js';
import { generateTransitionTable, generateAFDDiagram } from './visualization.js';

/**
 * Clase que maneja la interfaz de usuario
 */
export class UI {
  constructor(machine) {
    this.machine = machine;
    this.runIntervalId = null;
    
    // Referencias a elementos del DOM
    this.elements = {
      inputString: null,
      btnLoad: null,
      btnStep: null,
      btnRun: null,
      btnReset: null,
      tapeContainer: null,
      stateDisplay: null,
      resultDisplay: null
    };
    
    this.initializeElements();
    this.setupEventListeners();
    this.setupMachineCallbacks();
  }

  initializeElements() {
    this.elements.inputString = document.getElementById("inputString");
    this.elements.btnLoad = document.getElementById("btnLoad");
    this.elements.btnStep = document.getElementById("btnStep");
    this.elements.btnRun = document.getElementById("btnRun");
    this.elements.btnReset = document.getElementById("btnReset");
    this.elements.tapeContainer = document.getElementById("tapeContainer");
    this.elements.stateDisplay = document.getElementById("stateDisplay");
    this.elements.resultDisplay = document.getElementById("resultDisplay");
  }

  setupEventListeners() {
    if (!this.elements.inputString || !this.elements.btnLoad) return;

    this.elements.btnLoad.addEventListener("click", () => {
      const value = this.elements.inputString.value.trim();
      this.machine.loadTape(value);
      if (value.length === 0) {
        this.showMessage("Cinta vacía. Solo se aceptan: admin, guest, user.", "info");
      } else {
        this.showMessage(`Cinta cargada: "${value}"`, "info");
      }
    });

    // Permitir cargar con Enter
    this.elements.inputString.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const value = this.elements.inputString.value.trim();
        this.machine.loadTape(value);
        if (value.length === 0) {
          this.showMessage("Cinta vacía. Solo se aceptan: admin, guest, user.", "info");
        } else {
          this.showMessage(`Cinta cargada: "${value}"`, "info");
        }
      }
    });

    this.elements.btnStep?.addEventListener("click", () => {
      this.machine.step();
    });

    this.elements.btnRun?.addEventListener("click", () => {
      this.toggleRun();
    });

    this.elements.btnReset?.addEventListener("click", () => {
      this.machine.reset();
    });
  }

  setupMachineCallbacks() {
    this.machine.onStateChange = (state, headPosition) => {
      this.renderState(state, headPosition);
      this.updateButtons();
    };

    this.machine.onTapeChange = (tape, headPosition, halted) => {
      this.renderTape(tape, headPosition, halted);
      this.updateButtons();
    };

    this.machine.onResultChange = (halted, accepted) => {
      this.renderResult(halted, accepted);
      this.updateButtons();
    };
    
    // Ocultar visualizaciones cuando se carga una nueva cinta
    this.machine.onTapeLoad = () => {
      this.hideVisualizations();
    };
  }

  /**
   * Muestra y genera las visualizaciones (tabla y diagrama)
   */
  showVisualizations() {
    generateTransitionTable();
    generateAFDDiagram();
    const visualSections = document.querySelectorAll('.visual-section');
    visualSections.forEach(section => {
      section.style.display = 'block';
    });
  }

  /**
   * Oculta las visualizaciones
   */
  hideVisualizations() {
    const visualSections = document.querySelectorAll('.visual-section');
    visualSections.forEach(section => {
      section.style.display = 'none';
    });
  }

  /**
   * Pintar la cinta y la posición del cabezal.
   */
  renderTape(tape, headPosition, halted) {
    if (!this.elements.tapeContainer) return;

    this.elements.tapeContainer.innerHTML = "";

    // Si la cinta está vacía, igual mostramos un BLANK
    const displayTape = tape.length > 0 ? tape : [];

    // Pintamos cada símbolo
    displayTape.forEach((symbol, index) => {
      const cell = document.createElement("span");
      cell.textContent = symbol;
      cell.classList.add("tape-cell");
      if (index === headPosition && !halted) {
        cell.classList.add("tape-head");
      }
      this.elements.tapeContainer.appendChild(cell);
    });

    // Representar la celda BLANK al final (solo visual)
    const blankIndex = displayTape.length;
    const blankCell = document.createElement("span");
    blankCell.textContent = BLANK;
    blankCell.classList.add("tape-cell", "tape-blank");
    if (blankIndex === headPosition && !halted) {
      blankCell.classList.add("tape-head");
    }
    this.elements.tapeContainer.appendChild(blankCell);
  }

  /**
   * Mostrar el estado actual de la MT.
   */
  renderState(state, headPosition) {
    if (!this.elements.stateDisplay) return;
    this.elements.stateDisplay.textContent = `Estado actual: ${state} | Posición del cabezal: ${headPosition}`;
  }

  /**
   * Mostrar el resultado (aceptado / rechazado / ejecutando).
   */
  renderResult(halted, accepted) {
    if (!this.elements.resultDisplay) return;

    if (!halted) {
      this.elements.resultDisplay.textContent = "Estado: ejecutando...";
      this.elements.resultDisplay.className = "result running";
      return;
    }

    if (accepted) {
      this.elements.resultDisplay.textContent = 'Resultado: CADENA ACEPTADA ✅ (admin | guest | user)';
      this.elements.resultDisplay.className = "result accepted";
      
      // Generar visualizaciones solo si fue aceptada
      this.showVisualizations();
    } else {
      this.elements.resultDisplay.textContent = "Resultado: CADENA RECHAZADA ❌";
      this.elements.resultDisplay.className = "result rejected";
      
      // Ocultar visualizaciones si fue rechazada
      this.hideVisualizations();
    }
  }

  /**
   * Mostrar mensajes informativos.
   */
  showMessage(text, type = "info") {
    if (!this.elements.resultDisplay) return;
    this.elements.resultDisplay.textContent = text;
    this.elements.resultDisplay.className = "result";
    this.elements.resultDisplay.classList.add(type);
  }

  /**
   * Actualiza el estado de los botones según el estado de la máquina.
   */
  updateButtons() {
    if (!this.elements.btnStep || !this.elements.btnRun || !this.elements.btnReset) return;

    const state = this.machine.getState();
    const hasTape = state.tape.length > 0;
    const isRunning = this.runIntervalId !== null;

    // Botón Paso: habilitado si hay cinta y no está detenida
    this.elements.btnStep.disabled = !hasTape || state.halted;

    // Botón Ejecutar: habilitado si hay cinta y no está detenida
    this.elements.btnRun.disabled = !hasTape || state.halted;
    this.elements.btnRun.textContent = isRunning ? "Pausar" : "Ejecutar";

    // Botón Reiniciar: habilitado si hay cinta
    this.elements.btnReset.disabled = !hasTape;
  }

  /**
   * Ejecuta la MT automáticamente hasta que se detenga.
   */
  toggleRun() {
    if (this.runIntervalId) {
      // Si ya está corriendo, la pausamos
      this.stopRun();
      this.updateButtons();
      return;
    }

    const state = this.machine.getState();
    if (state.halted) {
      // Si ya está detenida, no tiene sentido correr
      return;
    }

    this.runIntervalId = setInterval(() => {
      const currentState = this.machine.getState();
      if (currentState.halted) {
        this.stopRun();
        this.updateButtons();
        return;
      }
      this.machine.step();
    }, 400); // velocidad de ejecución (ms por paso)
    
    this.updateButtons();
  }

  /**
   * Detiene el modo "Run".
   */
  stopRun() {
    if (this.runIntervalId) {
      clearInterval(this.runIntervalId);
      this.runIntervalId = null;
    }
    this.updateButtons();
  }
}

