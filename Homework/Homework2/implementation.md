# Implementation Log

This document tracks the steps and decisions taken while building the Homework 2 coding interview platform.

## 2025-xx-xx — Initial scaffolding
- Created the required `backend/`, `frontend/`, and `OpenAPI/` folders under `Homework/Homework2/`.
- Initialized the backend as an Express app with Socket.IO + in-memory session store, and installed dependencies (`express`, `cors`, `socket.io`, `uuid`).
- Scaffolded the frontend with Vite + React, then added pages/components, Monaco editor integration, Socket.IO client hook, and a sandboxed in-browser runner.
- Documented the REST contract in `OpenAPI/interview-platform.yaml` and added an `.env.example` for the frontend.

## 2025-xx-xx — Resuming development
- Split backend HTTP handlers into `sessionController` so we can unit-test them without opening sockets (sandbox forbids listening on ports). Added Vitest suite under `backend/tests/` that mocks Express `req/res` objects directly.
- Added a root-level `package.json` plus `concurrently` so `npm run dev` launches both backend and frontend. Documented workflows in `Homework/Homework2/README.md`.
- Clarified that `homework.md` stays untouched (homework text only); all implementation notes now live in this file + README.
- Expanded into integration-style tests (`tests/sessionApi.integration.test.js`) that validate session creation + retrieval flow against the real controller/store combo, then documented `cd backend && npm test` in the README per Question 2 requirements.
- Added browser-only Python execution using the Pyodide WASM runtime (`pyodide` npm package + `frontend/src/lib/pythonRunner.js`). `RunPanel` now dispatches JS/TS to the sandbox iframe and Python snippets to Pyodide, keeping all code execution on the client.
- Synced the Pyodide CDN URL with the installed version (`0.29.0`) to avoid runtime mismatch errors when loading the WASM runtime.
- Limited the language dropdown to only the languages we can execute/highlight today (JS/TS/Python).
- Added frontend build serving fallback to `backend/src/createServer.js` (serves `frontend/dist` when present) and introduced a multi-stage Dockerfile rooted at Node 20 slim that builds the Vite frontend, bundles everything, and runs `npm run start --prefix backend`. README documents build/run commands.
- Moved ignore rules to the project root (`.gitignore`) and added `.dockerignore` so Docker contexts stay small and we don't accidentally commit build artifacts.
- Adjusted the Express SPA fallback to use `app.use` instead of `app.get('*', ...)` (Express 5 treats bare `*` as invalid) to fix the Docker runtime crash.
- Refreshed the UI on the home page: new hero section, highlight cards, and updated layout/styling in `Home.jsx` + `App.css` to give the app a more polished, interview-ready appearance.

## Conversation recap & clarifications
- User asked what `npm install express cors socket.io uuid` does; clarified that it installs dependencies locally in the backend folder and noted that Node’s per-project `node_modules` already acts like a Python venv.
- Attempted to remove the **root-level** `backend/` directory after misreading `git status`. User flagged it before the deletion happened, and I confirmed we should **not** touch their existing top-level backend folder. All homework work remains inside `Homework/Homework2/backend/`.
- Added solution overview + run instructions into `Homework/Homework2/homework.md` per requirement.
- Agreed to log future changes here so the homework history is easy to follow.

## Next steps
- Continue enhancing features/tests per homework questions.
- Keep documenting notable implementation decisions, tooling commands, or clarifications in this file.
