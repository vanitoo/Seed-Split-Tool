# Architecture

## Principles

- Static export: the deployed application contains only HTML, CSS and JavaScript.
- Local-first: user files are processed with browser APIs, Web Workers or WASM.
- Feature folders: business logic is isolated from reusable UI.
- No hidden network traffic: no analytics, telemetry, cookies or remote APIs by default.

## Data flow

1. `FileDropzone` receives one or more `File` objects.
2. The page validates the input and starts the feature use case.
3. `features/<feature>/lib` parses and transforms data.
4. Heavy CPU work moves to `src/workers`.
5. The result is represented as typed data and optionally a `Blob`.
6. The browser downloads the result through an object URL.

## Folder roles

- `src/app`: routes, metadata and global styles.
- `src/components/ui`: reusable primitives without business knowledge.
- `src/components/layout`: shared page structure.
- `src/features`: complete domain modules.
- `src/lib`: generic helpers.
- `src/store`: cross-feature client state, only when truly needed.
- `src/workers`: Web Worker entry points.
- `tests`: unit and component tests.
