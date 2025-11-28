/******************************************************
 * ARCHIVO PRINCIPAL
 * 
 * Inicializa la aplicación y conecta todos los módulos
 ******************************************************/

import { TuringMachine } from './turing-machine.js';
import { UI } from './ui.js';

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Crear instancia de la máquina de Turing
  const machine = new TuringMachine();
  
  // Crear instancia de la interfaz de usuario
  const ui = new UI(machine);
  
  // Ocultar las secciones visuales al inicio
  ui.hideVisualizations();
  
  // Estado inicial
  machine.reset();
});

