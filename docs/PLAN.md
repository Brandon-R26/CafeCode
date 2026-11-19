# Plan de CafeCode

**Meta:** presentar el MVP en la semana 9 del curso (**7–10 de diciembre**). Si no se expone,
el proyecto no vale nada, y su nota se pondera con el Examen II.

## Qué vamos a construir

Una página web donde el estudiante escribe Python en un editor, aprieta "Ejecutar" y ve a su
trabajador hacer en el cafetal lo que el código le dijo. Ocho niveles, del más simple a POO:

| Nivel | Concepto | Qué lo vuelve necesario |
|---|---|---|
| 1 | Secuencia | Mover al trabajador y sembrar la primera mata |
| 2 | Variables | Contar los quintales cosechados |
| 3 | Condicionales | Cortar solo el grano maduro; regar solo si está seca |
| 4 | Ciclos | Sembrar una hilera entera sin repetir 10 líneas |
| 5 | Funciones | Reutilizar "recorrer la finca" |
| 6 | Listas | Llevar el inventario |
| 7 | Clases y objetos | Una cuadrilla de cortadores, cada uno con su canasto |
| 8 | Herencia | Catuaí y Parainema heredan de `Cafeto` |

Gamificación: granos de café como moneda (se ganan al cosechar, se gastan en mejoras y en
pistas del tutor), insignias, ranking por eficiencia y la roya como amenaza.

## Decisiones ya tomadas

| Qué | Decisión | Por qué |
|---|---|---|
| Plataforma | Web | Se juega con un link; nadie del grupo sabe Unity |
| Motor 2D | **Phaser** | Tilemaps y sprites en JavaScript, corre junto a Skulpt sin puentes |
| Interfaz | **React + Vite**, editor **CodeMirror** | |
| Python en el navegador | **Skulpt** | Ejecuta el código del estudiante sin servidor |
| Backend | **Node.js + Express**, API documentada con **Swagger** | Lo vimos en la semana 4 |
| Base de datos | **PostgreSQL** | |
| Despliegue | **Docker** (`docker-compose`) | Semana 6 del curso |
| Tutor de IA | Nivel gratuito de **Groq o Gemini**, llamado desde el backend | Costo $0 |
| Gráficos | Paquetes **Kenney** (kenney.nl, licencia CC0) | Gratis, no hay que dibujar |

## Cómo encajan las partes

```
 [Editor CodeMirror] --código--> [Intérprete Skulpt + simulación]  (parte 2)
                                          |
                                lista de acciones (JSON)
                                          v
                               [Escena de Phaser anima]             (parte 1)
                                          |
                               nivel superado, granos
                                          v
                [API Express + PostgreSQL + tutor de IA]            (parte 3)
```

El formato exacto de lo que pasa entre partes está en [contrato.md](contrato.md). **Es lo
primero que hay que leer.** Con el contrato acordado, cada parte avanza por su lado y se
prueba con datos de mentira hasta que las otras estén listas.

## Las tres partes

Brandon toma la **parte 2**. Luis y Carlos escogen entre la **1** y la **3**.

### Parte 1 — Motor del juego e interfaz

Todo lo que se ve.

- Proyecto React + Vite y la escena de Phaser con el cafetal en cuadrícula.
- El trabajador y sus animaciones: caminar, sembrar, regar, cosechar.
- **Animar una lista de acciones**, una por una, resaltando en el editor la línea que se ejecuta.
- La pantalla del nivel: editor, botón Ejecutar, objetivo, mensajes de error y pistas.
- Mapa de niveles con los bloqueados y desbloqueados, granos, insignias y ranking.
- Login simple y llamadas a la API de la parte 3.

**Bueno para quien:** le guste lo visual y JavaScript/React.

### Parte 2 — Intérprete de Python y niveles (Brandon)

- Skulpt en la página, con las funciones `mover`, `sembrar`, `regar`, `cosechar` y las consultas.
- Simulación del estado de la finca mientras corre el código.
- Límite de tiempo para cortar los ciclos infinitos.
- Diseño de los 8 niveles (estado inicial, objetivo) y el verificador de cada uno.

### Parte 3 — Backend, tutor de IA y Docker

- API REST con Express: usuarios, progreso, granos, niveles y ranking, documentada con Swagger.
- PostgreSQL: el modelo de datos y los scripts para crear las tablas.
- **Tutor de IA en tres capas:** (1) pistas escritas por nivel y un diccionario que traduce
  los errores de Python al español, (2) un LLM gratuito llamado desde el backend con un
  prompt que no regala la solución, (3) si la API falla, se vuelve a la capa 1.
- La redacción de las **pistas de cada nivel** y el **diccionario de errores**.
- `docker-compose` con la API y la base de datos.

**Bueno para quien:** le guste el backend. Es la parte más alineada con lo que evalúa el
curso: REST, Swagger, Docker y luego Kubernetes.

## Calendario

| Semana | Parte 1 | Parte 2 | Parte 3 |
|---|---|---|---|
| **1 · 18–24 nov** | Vite + React + Phaser; el trabajador recorre una lista de acciones escrita a mano | Skulpt corre un `for` y produce la lista correcta; los 8 niveles en papel | Express + PostgreSQL en Docker; `/usuarios`, `/progreso`, `/niveles`; Swagger validado |
| **2 · 25 nov–1 dic** | Pantalla del nivel completa; errores y pistas en pantalla | Niveles 1–5 jugables y sus verificadores | Granos y progreso guardados; diccionario de errores en español |
| **3 · 2–6 dic** | Mapa de niveles, insignias, ranking, login | Niveles 6–8 (listas y POO) | Tutor de IA con respaldo; pistas de los 8 niveles; ranking |
| **4 · 7–10 dic** | Pulir y presentar | Pruebas con estudiantes, ajustar dificultad | Pruebas y presentar |

**Hito del domingo 24 de noviembre:** el código escrito en el editor mueve al trabajador en
pantalla (partes 1 y 2 juntas) y la API responde dentro de Docker. Si eso funciona, lo más
riesgoso del proyecto ya está resuelto.

## Reglas de trabajo

- **Ramas:** cada quien trabaja en la suya (`parte1-motor`, `parte2-interprete`,
  `parte3-backend`) y se integra a `main` con Pull Request. `main` siempre debe funcionar.
- **Commits** pequeños y con mensaje que diga qué cambió.
- **Nunca subir la API key** del modelo de IA ni contraseñas. Van en `.env`, que está en el
  `.gitignore`. En el repo se deja `.env.example` sin valores.
- **El contrato no se cambia sin avisar** en el grupo.
- **Cada quien tiene que poder explicar su parte y cómo se conecta con las otras.** El
  proyecto está sujeto a defensa y la exposición es obligatoria.
- Si algo se atrasa, se dice el mismo día, no el domingo.

## Lo que falta decidir

1. Quién toma la parte 1 y quién la 3.
2. Proveedor del tutor de IA (Groq o Gemini): lo decide quien tome la parte 3 al probar
   las cuotas gratuitas.
