/******************************************************
 * VISUALIZACIÓN
 * 
 * Genera la tabla de transición y el diagrama del AFD
 ******************************************************/

import { TRANSITIONS, ACCEPT_STATES, REJECT_STATE, START_STATE, BLANK } from './config.js';

/**
 * Genera la tabla de transición dinámicamente desde TRANSITIONS
 */
export function generateTransitionTable() {
  const tbody = document.getElementById("transitionTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  // Obtener todos los estados ordenados
  const states = Object.keys(TRANSITIONS).sort();

  states.forEach(state => {
    const stateTransitions = TRANSITIONS[state];
    const symbols = Object.keys(stateTransitions).filter(s => s !== "DEFAULT");

    // Si hay transición DEFAULT, la agregamos también
    if (stateTransitions.DEFAULT) {
      symbols.push("DEFAULT");
    }

    symbols.forEach(symbol => {
      const transition = stateTransitions[symbol];
      if (!transition) return;

      const row = document.createElement("tr");
      
      // Estado actual
      const stateCell = document.createElement("td");
      stateCell.textContent = state;
      if (ACCEPT_STATES.has(state)) {
        stateCell.classList.add("state-accept");
      } else if (state === REJECT_STATE) {
        stateCell.classList.add("state-reject");
      }
      row.appendChild(stateCell);

      // Símbolo leído
      const symbolCell = document.createElement("td");
      symbolCell.innerHTML = symbol === "DEFAULT" ? "<code>otro</code>" : `<code>${symbol === BLANK ? "_" : symbol}</code>`;
      row.appendChild(symbolCell);

      // Símbolo escrito (siempre el mismo)
      const writeCell = document.createElement("td");
      writeCell.innerHTML = "<code>(mismo)</code>";
      row.appendChild(writeCell);

      // Movimiento
      const moveCell = document.createElement("td");
      const moveSpan = document.createElement("span");
      moveSpan.textContent = transition.move;
      moveSpan.classList.add("move-symbol");
      moveCell.appendChild(moveSpan);
      row.appendChild(moveCell);

      // Estado siguiente
      const nextStateCell = document.createElement("td");
      let nextStateText = transition.nextState;
      if (ACCEPT_STATES.has(transition.nextState)) {
        nextStateText += " (ACEPTA)";
        nextStateCell.classList.add("state-accept");
      } else if (transition.nextState === REJECT_STATE) {
        nextStateText += " (RECHAZA)";
        nextStateCell.classList.add("state-reject");
      }
      nextStateCell.textContent = nextStateText;
      row.appendChild(nextStateCell);

      tbody.appendChild(row);
    });
  });
}

/**
 * Genera el diagrama visual del AFD usando SVG
 */
export function generateAFDDiagram() {
  const svg = document.getElementById("afdSvg");
  if (!svg) return;

  // Limpiar SVG
  svg.innerHTML = "";

  // Definir marcador de flecha
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", "0 0, 10 3, 0 6");
  polygon.setAttribute("fill", "#333");
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Definir posiciones de los estados
  const statePositions = {
    q0: { x: 100, y: 300 },
    q_a: { x: 250, y: 150 },
    q_ad: { x: 400, y: 150 },
    q_adm: { x: 550, y: 150 },
    q_admi: { x: 700, y: 150 },
    q_admin: { x: 850, y: 150 },
    q_g: { x: 250, y: 300 },
    q_gu: { x: 400, y: 300 },
    q_gue: { x: 550, y: 300 },
    q_gues: { x: 700, y: 300 },
    q_guest: { x: 850, y: 300 },
    q_u: { x: 250, y: 450 },
    q_us: { x: 400, y: 450 },
    q_use: { x: 550, y: 450 },
    q_user_accept: { x: 700, y: 450 },
    q_dead: { x: 1000, y: 300 }
  };

  // Dibujar transiciones (flechas)
  const transitions = [
    { from: "q0", to: "q_a", label: "a" },
    { from: "q_a", to: "q_ad", label: "d" },
    { from: "q_ad", to: "q_adm", label: "m" },
    { from: "q_adm", to: "q_admi", label: "i" },
    { from: "q_admi", to: "q_admin", label: "n" },
    { from: "q_admin", to: "q_admin", label: "_", self: true },
    { from: "q0", to: "q_g", label: "g" },
    { from: "q_g", to: "q_gu", label: "u" },
    { from: "q_gu", to: "q_gue", label: "e" },
    { from: "q_gue", to: "q_gues", label: "s" },
    { from: "q_gues", to: "q_guest", label: "t" },
    { from: "q_guest", to: "q_guest", label: "_", self: true },
    { from: "q0", to: "q_u", label: "u" },
    { from: "q_u", to: "q_us", label: "s" },
    { from: "q_us", to: "q_use", label: "e" },
    { from: "q_use", to: "q_user_accept", label: "r" },
    { from: "q_user_accept", to: "q_user_accept", label: "_", self: true },
    // Transiciones a q_dead (simplificadas)
    { from: "q0", to: "q_dead", label: "otro", dashed: true },
  ];

  transitions.forEach(trans => {
    const fromPos = statePositions[trans.from];
    const toPos = statePositions[trans.to];
    if (!fromPos || !toPos) return;

    let path;
    if (trans.self) {
      // Auto-loop mejorado
      const cx = fromPos.x;
      const cy = fromPos.y - 40;
      path = `M ${cx - 25} ${cy} A 25 25 0 1 1 ${cx + 25} ${cy}`;
    } else {
      // Flecha normal
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (dx / len) * 40;
      const offsetY = (dy / len) * 40;
      path = `M ${fromPos.x + offsetX} ${fromPos.y + offsetY} L ${toPos.x - offsetX} ${toPos.y - offsetY}`;
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", path);
    line.setAttribute("class", "transition-arrow");
    if (trans.dashed) {
      line.setAttribute("stroke-dasharray", "5,5");
      line.setAttribute("stroke", "#999");
    }
    line.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(line);

    // Etiqueta de la transición con fondo blanco para legibilidad
    if (!trans.self) {
      const labelX = (fromPos.x + toPos.x) / 2;
      const labelY = (fromPos.y + toPos.y) / 2 - 10;
      
      // Fondo blanco para la etiqueta
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("x", labelX - 15);
      bg.setAttribute("y", labelY - 12);
      bg.setAttribute("width", 30);
      bg.setAttribute("height", 18);
      bg.setAttribute("fill", "white");
      bg.setAttribute("stroke", "none");
      svg.appendChild(bg);
      
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", labelX);
      text.setAttribute("y", labelY);
      text.setAttribute("class", "transition-label");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", trans.dashed ? "#999" : "#333");
      text.setAttribute("font-weight", "bold");
      text.textContent = trans.label;
      svg.appendChild(text);
    } else {
      // Etiqueta para auto-loop con fondo
      const labelX = fromPos.x;
      const labelY = fromPos.y - 55;
      
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("x", labelX - 10);
      bg.setAttribute("y", labelY - 12);
      bg.setAttribute("width", 20);
      bg.setAttribute("height", 18);
      bg.setAttribute("fill", "white");
      bg.setAttribute("stroke", "none");
      svg.appendChild(bg);
      
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", labelX);
      text.setAttribute("y", labelY);
      text.setAttribute("class", "transition-label");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-weight", "bold");
      text.textContent = trans.label;
      svg.appendChild(text);
    }
  });

  // Dibujar estados (círculos)
  Object.keys(statePositions).forEach(state => {
    const pos = statePositions[state];
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", 35);
    
    if (state === START_STATE) {
      circle.setAttribute("class", "state-node initial");
    } else if (ACCEPT_STATES.has(state)) {
      circle.setAttribute("class", "state-node accept");
    } else if (state === REJECT_STATE) {
      circle.setAttribute("class", "state-node reject");
    } else {
      circle.setAttribute("class", "state-node");
    }
    
    svg.appendChild(circle);

    // Etiqueta del estado
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", pos.x);
    text.setAttribute("y", pos.y + 4);
    text.setAttribute("class", "state-label");
    text.textContent = state;
    svg.appendChild(text);
  });

  // Indicador de estado inicial (flecha pequeña)
  const initialArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  initialArrow.setAttribute("d", `M ${statePositions.q0.x - 70} ${statePositions.q0.y} L ${statePositions.q0.x - 45} ${statePositions.q0.y}`);
  initialArrow.setAttribute("stroke", "#48bb78");
  initialArrow.setAttribute("stroke-width", "3");
  initialArrow.setAttribute("marker-end", "url(#arrowhead)");
  svg.appendChild(initialArrow);
}

