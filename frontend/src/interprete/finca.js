// Simulación de la finca: el estado y las reglas de cada acción.
// JavaScript puro, sin Skulpt: se puede probar con `node --test`.
//
// Coordenadas: (0,0) es la esquina superior izquierda; "norte" resta 1 a y.

export const DIRECCIONES = {
  norte: { dx: 0, dy: -1 },
  sur: { dx: 0, dy: 1 },
  este: { dx: 1, dy: 0 },
  oeste: { dx: -1, dy: 0 },
};

// Error de las reglas de la finca (chocar con la cerca, cosechar grano verde...).
// ejecutar.js lo convierte en un error de Python con tipo "MovimientoInvalido".
export class ErrorFinca extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "MovimientoInvalido";
  }
}

const clave = (x, y) => `${x},${y}`;

function casillaVacia() {
  return { planta: null, maduro: false, seca: false, cosechado: false };
}

// Crea el estado de trabajo a partir del estadoInicial de un nivel (no lo modifica).
export function crearFinca(ancho, alto, estadoInicial) {
  const casillas = new Map();
  for (const c of estadoInicial.casillas ?? []) {
    casillas.set(clave(c.x, c.y), {
      planta: c.planta ?? null,
      maduro: Boolean(c.maduro),
      seca: Boolean(c.seca),
      cosechado: Boolean(c.cosechado),
    });
  }
  return {
    ancho,
    alto,
    trabajadores: estadoInicial.trabajadores.map((t) => ({ x: t.x, y: t.y, canasto: 0 })),
    casillas,
  };
}

export function casilla(finca, x, y) {
  return finca.casillas.get(clave(x, y)) ?? casillaVacia();
}

function trabajador(finca, quien) {
  const t = finca.trabajadores[quien];
  if (!t) throw new ErrorFinca(`no existe el trabajador ${quien}`);
  return t;
}

function casillaDe(finca, t) {
  const k = clave(t.x, t.y);
  if (!finca.casillas.has(k)) finca.casillas.set(k, casillaVacia());
  return finca.casillas.get(k);
}

// --- Acciones: cambian la finca ---

export function mover(finca, dir, quien = 0) {
  const d = DIRECCIONES[dir];
  if (!d) {
    throw new ErrorFinca(`"${dir}" no es una dirección; usa "norte", "sur", "este" u "oeste"`);
  }
  const t = trabajador(finca, quien);
  const nx = t.x + d.dx;
  const ny = t.y + d.dy;
  if (nx < 0 || ny < 0 || nx >= finca.ancho || ny >= finca.alto) {
    throw new ErrorFinca(`el trabajador chocó con la cerca al moverse al ${dir}`);
  }
  t.x = nx;
  t.y = ny;
}

export function sembrar(finca, quien = 0) {
  const c = casillaDe(finca, trabajador(finca, quien));
  if (c.planta) throw new ErrorFinca("ya hay un cafeto en esta casilla");
  c.planta = "cafeto";
  c.maduro = false;
  c.cosechado = false;
}

export function regar(finca, quien = 0) {
  casillaDe(finca, trabajador(finca, quien)).seca = false;
}

export function cosechar(finca, quien = 0) {
  const t = trabajador(finca, quien);
  const c = casillaDe(finca, t);
  if (!c.planta) throw new ErrorFinca("aquí no hay ningún cafeto para cosechar");
  if (c.cosechado) throw new ErrorFinca("este cafeto ya lo cosechaste");
  if (!c.maduro) throw new ErrorFinca("el grano de este cafeto todavía está verde");
  c.maduro = false;
  c.cosechado = true;
  t.canasto += 1;
}

// --- Consultas: no cambian la finca ni generan acción ---

export function tierraSeca(finca, quien = 0) {
  const t = trabajador(finca, quien);
  return casilla(finca, t.x, t.y).seca;
}

export function granoMaduro(finca, quien = 0) {
  const t = trabajador(finca, quien);
  const c = casilla(finca, t.x, t.y);
  return Boolean(c.planta) && c.maduro;
}

export function posicion(finca, quien = 0) {
  const t = trabajador(finca, quien);
  return [t.x, t.y];
}

export function canasto(finca, quien = 0) {
  return trabajador(finca, quien).canasto;
}

// Estado en el mismo formato que estadoInicial, para el JSON de resultado.
// Solo incluye las casillas que tienen algo.
export function exportarEstado(finca) {
  const casillas = [];
  for (const [k, c] of finca.casillas) {
    if (!c.planta && !c.seca) continue;
    const [x, y] = k.split(",").map(Number);
    casillas.push({ x, y, planta: c.planta, maduro: c.maduro, seca: c.seca, cosechado: c.cosechado });
  }
  casillas.sort((a, b) => a.y - b.y || a.x - b.x);
  return {
    trabajadores: finca.trabajadores.map((t) => ({ x: t.x, y: t.y, canasto: t.canasto })),
    casillas,
  };
}
