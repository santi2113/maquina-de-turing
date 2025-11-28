# Simulador de Máquina de Turing para Validación de Regex

## Integrantes
-  juan david ocampo   santiago suaza builes 

## Fase 1: El Plano (Teoría y Diseño)

### 1. El Problema (Regex)

**Regex elegido:** `^(admin|guest|user)$`

**Justificación:** Este regex valida que la cadena sea exactamente una de tres palabras: "admin", "guest" o "user". Es un formato comúnmente usado en sistemas de autenticación y control de acceso para definir tipos de usuarios. Es un lenguaje regular (puede ser reconocido por un AFD), es práctico y comúnmente usado en formularios web, y el AFD resultante es manejable.

### 2. El Autómata Finito Determinista (AFD)

#### Estados (Q)
- `q0`: Estado inicial
- `q_a, q_ad, q_adm, q_admi`: Estados intermedios para reconocer "admin"
- `q_admin`: Estado de aceptación para "admin"
- `q_g, q_gu, q_gue, q_gues`: Estados intermedios para reconocer "guest"
- `q_guest`: Estado de aceptación para "guest"
- `q_u, q_us, q_use`: Estados intermedios para reconocer "user"
- `q_user_accept`: Estado de aceptación para "user"
- `q_dead`: Estado de rechazo (trampa)

#### Alfabeto (Σ)
`{a, d, m, i, n, g, u, e, s, t, r, _}` donde `_` representa el símbolo blanco (fin de cadena). Cualquier otro carácter también forma parte del alfabeto (pero lleva a rechazo).

#### Estado Inicial
`q0`

#### Estados Finales (F)
`{q_admin, q_guest, q_user_accept}`

#### Diagrama del AFD

El diagrama visual del AFD está disponible en la interfaz web del simulador.

### 3. La Máquina de Turing (MT)

#### Restricciones de la MT
- El cabezal **nunca se mueve a la izquierda** (solo derecha R o se mantiene S)
- La MT **nunca escribe un símbolo diferente** al que leyó (solo lee y mueve)

#### Tabla de Transición de la MT

La tabla de transición completa está disponible en la interfaz web del simulador, donde se muestra de forma interactiva y visual.

**Manejo del símbolo blanco (_):**
- El símbolo blanco `_` se lee cuando `headPosition >= tape.length` (fin de cadena)
- La MT acepta cuando está en un estado de aceptación (`q_admin`, `q_guest`, `q_user_accept`) y lee el símbolo blanco
- La MT rechaza cuando entra al estado `q_dead` o cuando hay caracteres adicionales después de llegar a un estado de aceptación

**Leyenda:**
- `R`: Mover cabezal a la derecha
- `S`: No mover cabezal (permanecer en la misma posición)
- `*`: Cualquier símbolo
- `(mismo)`: Escribir el mismo símbolo que se leyó

## Fase 2: El Repositorio

**URL del repositorio:** https://github.com/santi2113/maquina-de-turing

**URL de GitHub Pages:** https://santi2113.github.io/maquina-de-turing/

> **Nota:** Para activar GitHub Pages:
> 1. Ve a Settings → Pages en tu repositorio de GitHub
> 2. En "Source", selecciona "Deploy from a branch"
> 3. Branch: `main`, Folder: `/ (root)`
> 4. Guarda y espera unos minutos
> 5. Tu sitio estará disponible en la URL de arriba

## Fase 3: Estructura del Proyecto

El proyecto está organizado de forma modular usando módulos ES6:

```
maquina de turing/
├── index.html          # Estructura HTML de la interfaz
├── style.css           # Estilos CSS
├── main.js             # Punto de entrada - inicializa la aplicación
├── config.js           # Configuración: constantes, estados y TRANSITIONS
├── turing-machine.js   # Clase TuringMachine - lógica de la MT
├── ui.js               # Clase UI - interfaz de usuario y renderizado
└── visualization.js    # Funciones para generar tabla y diagrama AFD
```

### Descripción de Archivos

- **`config.js`**: Contiene todas las constantes (estados, alfabeto) y la función de transición `TRANSITIONS`
- **`turing-machine.js`**: Implementa la clase `TuringMachine` con la lógica de ejecución (métodos `loadTape()`, `reset()`, `step()`)
- **`ui.js`**: Maneja toda la interfaz de usuario, renderizado y eventos
- **`visualization.js`**: Genera dinámicamente la tabla de transición y el diagrama del AFD
- **`main.js`**: Archivo principal que inicializa y conecta todos los módulos

## Fase 4: Análisis del Código

### Pregunta 1: "¿Dónde está la Cinta de su MT?"
La cinta está representada por el array `tape` en la clase `TuringMachine` (archivo `turing-machine.js`), que almacena los caracteres de la cadena de entrada.

### Pregunta 2: "¿Dónde está el Cabezal?"
El cabezal está representado por la variable `headPosition` en la clase `TuringMachine` (archivo `turing-machine.js`), que indica la posición actual en la cinta (índice del array).

### Pregunta 3: "¿Dónde está el Registro de Estado?"
El estado actual está almacenado en la variable `currentState` en la clase `TuringMachine` (archivo `turing-machine.js`), un string como "q0", "q_admin", "q_dead", etc.

### Pregunta 4: "Muéstrenme la Tabla de Reglas / Función de Transición."
Está implementada como el objeto `TRANSITIONS` en `config.js`, que mapea `(estado, símbolo) → (nuevo_estado, movimiento)`. Cada estado tiene transiciones para símbolos específicos y una transición `DEFAULT` para símbolos no reconocidos. La tabla completa se muestra visualmente en la interfaz web del simulador.

### Pregunta 5: "¿Qué parte de su código es el 'motor' que ejecuta una regla?"
El método `step()` de la clase `TuringMachine` (archivo `turing-machine.js`) es el motor que:
- Lee el símbolo actual bajo el cabezal
- Consulta la tabla de transición (`TRANSITIONS` de `config.js`)
- Actualiza el estado y mueve el cabezal
- Determina si acepta o rechaza

### Pregunta 6: "Su MT emula un AFD. ¿Qué tendrían que cambiar en su código (step() y TRANSITIONS) para que su máquina pudiera resolver un problema que un AFD no puede, como {a^n b^n}?"
Para resolver problemas que un AFD no puede resolver, se necesitarían los siguientes cambios en `turing-machine.js` y `config.js`:
- Permitir movimiento a la izquierda del cabezal (añadir `move: 'L'` en las transiciones de `TRANSITIONS`)
- Permitir escribir símbolos diferentes a los leídos (añadir campo `writeSymbol` en las transiciones y modificar `step()` para escribir en la cinta)
- Usar la cinta para memoria adicional, no solo lectura lineal
- Con estos cambios se podría implementar lenguajes no regulares, como `{a^n b^n | n ≥ 0}`

## Cómo Ejecutar el Proyecto

1. **Servidor local simple:**
   ```bash
   python -m http.server 8000
   ```
   Luego abrir en el navegador: `http://localhost:8000`

2. **O usar cualquier servidor HTTP estático** (Live Server de VSCode, etc.)

3. **Interfaz web:**
   - Ingresar una cadena (admin, guest o user)
   - Clic en "Cargar"
   - Usar "Paso" para ejecutar paso a paso o "Ejecutar" para automático
   - Al aceptar una cadena válida, se muestran automáticamente:
     - Diagrama visual del AFD
     - Tabla de transición completa
     - Diseño de la MT que emula el AFD
