# TESTAMENT

A surreal, browser-based 3D cathedral built with Three.js and TypeScript. Seven connected spaces reinterpret the Bible through impossible architecture, twelve cyborg witnesses, optional esoteric puzzles, a calico cat, and independently evolving sound and world phenomena.

[Play the published game](https://testament-exodus-protocol-carse.pilednacre1.chatgpt.site/)

## Run locally

With Node.js and pnpm installed:

```sh
pnpm install
pnpm build
pnpm test
pnpm dev
```

Open the printed address, normally `http://127.0.0.1:4173/`. Rebuild after editing TypeScript; the server serves `dist/` without a compilation watcher. The existing compiled build is also committed.

## Controls

- WASD: walk; mouse: look. Click the scene to request mouse capture.
- Left click: examine a nearby table, disciple or angel.
- 1–3: send the corresponding companion home or recall them. The throne room has its own rules.
- R: continuous walking; Escape: release the mouse and pause.
- Touch: drag to look, tap to examine, use the on-screen movement controls.

World and puzzle progress are saved in the browser. The pause menu has one master volume slider.

## Project layout

- `src/`: world simulation, room layouts, procedural geometry, audio, puzzles and interface controllers.
- `public/`: browser entry, styles, worklet score and bundled art.
- `dist/`: compiled static site, including the vendored Three.js module.
- `tests/`: Node test suites and local-only browser review fixtures.
- `docs/`: architecture, design records, source credits, verification and release history.
- `IMPLEMENTATION_PLAN.md`: durable implementation and acceptance record.

The room layouts are shared by rendering, movement and interaction. Witness behavior is modeled separately from its audio and visual presentation. Review fixtures are served locally by `scripts/serve.mjs` and are excluded from the published static directory.

See [architecture](docs/ARCHITECTURE.md), [seven rooms and homes](docs/SEVEN_ROOMS.md), [witness phenomena](docs/WITNESS_PHENOMENA.md), and [art and scripture sources](docs/ART_AND_NARRATION.md). Asset attribution is also available inside the game.

## Publishing

The existing Sites project is identified in `.openai/hosting.json`; its static directory is `dist/`. Publishing a GitHub commit does not automatically update the hosted game.
