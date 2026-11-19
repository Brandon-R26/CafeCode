# Contrato entre el intérprete y el juego

Este archivo es el acuerdo entre las tres partes. Mientras se respete, cada quien puede
avanzar sin esperar a los demás. **Si alguien necesita cambiarlo, lo propone en el grupo
antes de tocar código.**

> Versión 0.1 (19 nov 2026) — borrador de la parte 2, abierto a cambios esta semana.

## 1. Lo que el estudiante puede usar en Python

Funciones disponibles sin `import` (las va desbloqueando cada nivel):

| Función | Qué hace | ¿Genera acción? |
|---|---|---|
| `mover(dir)` | Mueve al trabajador una casilla. `dir`: `"norte"`, `"sur"`, `"este"`, `"oeste"` | Sí |
| `sembrar()` | Siembra un cafeto en la casilla actual | Sí |
| `regar()` | Riega la casilla actual | Sí |
| `cosechar()` | Corta el café de la casilla actual, si está maduro | Sí |
| `tierra_seca()` | `True` si la casilla actual necesita agua | No (consulta) |
| `grano_maduro()` | `True` si el cafeto de la casilla actual está listo | No (consulta) |
| `posicion()` | Devuelve `(x, y)` del trabajador | No (consulta) |

Las consultas necesitan saber cómo está la finca **mientras** corre el código, así que el
intérprete (parte 2) lleva una simulación del estado y le aplica cada acción en el momento.
Al mismo tiempo va guardando la lista de acciones para que el juego (parte 1) la anime
después.

## 2. Resultado de ejecutar el código (parte 2 → parte 1)

```json
{
  "acciones": [
    { "tipo": "mover",    "dir": "este", "linea": 2 },
    { "tipo": "sembrar",                 "linea": 3 },
    { "tipo": "regar",                   "linea": 4 }
  ],
  "estadoFinal": { "...": "el mismo formato que estadoInicial del nivel" },
  "exito": false,
  "error": { "tipo": "NameError", "linea": 5, "mensaje": "name 'sembar' is not defined" }
}
```

- `tipo` de acción: `mover`, `sembrar`, `regar`, `cosechar`. Si hace falta otra, se agrega aquí.
- `linea` sirve para resaltar en el editor la línea que se está ejecutando.
- `error` es `null` si no hubo error. Si lo hubo, `acciones` trae lo que alcanzó a hacer
  antes de fallar, y el juego lo anima igual.
- `exito` lo calcula el verificador del nivel sobre `estadoFinal`.
- Tiempo máximo de ejecución: 2 s o 1000 acciones. Pasado eso, `error.tipo` es
  `"LimiteDeTiempo"` (casi siempre un ciclo infinito).

## 3. Formato de un nivel (parte 2 lo escribe; parte 3 lo sirve en `/niveles`)

```json
{
  "id": 4,
  "titulo": "La primera hilera",
  "concepto": "ciclos",
  "ancho": 5,
  "alto": 5,
  "estadoInicial": {
    "trabajador": { "x": 0, "y": 0 },
    "casillas": [ { "x": 0, "y": 0, "planta": null, "seca": true } ]
  },
  "objetivo": "Siembra los 5 cafetos de la primera hilera.",
  "funciones": ["mover", "sembrar"],
  "estructurasPermitidas": ["for", "while"],
  "verificador": "hilera_sembrada",
  "pistas": ["...", "...", "..."],
  "granos": 30
}
```

- Las `pistas` las redacta la parte 3 junto con el diccionario de errores.
- `granos` es la recompensa al completarlo; el backend la suma al progreso.
