// Pruebas de la simulación de la finca (sin Skulpt).
// Correr desde frontend/:  node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import * as F from "../src/interprete/finca.js";

const nueva = () =>
  F.crearFinca(3, 2, {
    trabajadores: [{ x: 0, y: 0 }],
    casillas: [
      { x: 1, y: 0, planta: "cafeto", maduro: true },
      { x: 2, y: 0, planta: "cafeto", maduro: false, seca: true },
    ],
  });

test("mover: norte resta 1 a y y este suma 1 a x", () => {
  const f = nueva();
  F.mover(f, "sur");
  F.mover(f, "este");
  assert.deepEqual(F.posicion(f), [1, 1]);
  F.mover(f, "norte");
  assert.deepEqual(F.posicion(f), [1, 0]);
});

test("mover: chocar con la cerca es error y no mueve", () => {
  const f = nueva();
  assert.throws(() => F.mover(f, "oeste"), { name: "MovimientoInvalido", message: /cerca/ });
  assert.deepEqual(F.posicion(f), [0, 0]);
});

test("mover: dirección inválida es error", () => {
  assert.throws(() => F.mover(nueva(), "arriba"), /no es una dirección/);
});

test("sembrar: en casilla vacía sí, donde ya hay cafeto no", () => {
  const f = nueva();
  F.sembrar(f);
  assert.equal(F.casilla(f, 0, 0).planta, "cafeto");
  assert.throws(() => F.sembrar(f), /ya hay un cafeto/);
});

test("cosechar: maduro suma al canasto; verde o vacío es error", () => {
  const f = nueva();
  assert.throws(() => F.cosechar(f), /no hay ningún cafeto/);
  F.mover(f, "este");
  assert.equal(F.granoMaduro(f), true);
  F.cosechar(f);
  assert.equal(F.canasto(f), 1);
  assert.equal(F.granoMaduro(f), false);
  assert.throws(() => F.cosechar(f), /ya lo cosechaste/);
  assert.equal(F.casilla(f, 1, 0).cosechado, true);
  F.mover(f, "este");
  assert.throws(() => F.cosechar(f), /verde/);
});

test("regar quita lo seco", () => {
  const f = nueva();
  F.mover(f, "este");
  F.mover(f, "este");
  assert.equal(F.tierraSeca(f), true);
  F.regar(f);
  assert.equal(F.tierraSeca(f), false);
});

test("crearFinca no modifica el estado inicial del nivel", () => {
  const inicial = { trabajadores: [{ x: 0, y: 0 }], casillas: [{ x: 0, y: 0, planta: null, seca: true }] };
  const f = F.crearFinca(2, 1, inicial);
  F.regar(f);
  F.mover(f, "este");
  assert.deepEqual(inicial, { trabajadores: [{ x: 0, y: 0 }], casillas: [{ x: 0, y: 0, planta: null, seca: true }] });
});

test("exportarEstado: formato del contrato, solo casillas con algo", () => {
  const f = nueva();
  F.mover(f, "este");
  F.cosechar(f);
  assert.deepEqual(F.exportarEstado(f), {
    trabajadores: [{ x: 1, y: 0, canasto: 1 }],
    casillas: [
      { x: 1, y: 0, planta: "cafeto", maduro: false, seca: false, cosechado: true },
      { x: 2, y: 0, planta: "cafeto", maduro: false, seca: true, cosechado: false },
    ],
  });
});
