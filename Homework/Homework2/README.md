# Homework 2 – Collaborative Coding Platform

## Project layout

```
Homework2/
├── backend/     # Express + Socket.IO server
├── frontend/    # Vite + React client with Monaco editor + sandbox runner
├── OpenAPI/     # API contract (interview-platform.yaml)
└── package.json # Root scripts (concurrently)
```

## Prerequisites

- Node.js 18+

## Install dependencies

```bash
# from Homework/Homework2
npm install          # installs root dev tools (concurrently)
cd backend && npm install
cd ../frontend && npm install
```

Frontend accepts `VITE_API_BASE_URL` (see `.env.example`). Backend uses `PORT` and `CLIENT_URL`.

## Development

```bash
npm run dev
```

This uses `concurrently` to run:

- `npm run dev --prefix backend` → Express/Socket.IO on :4000
- `npm run dev --prefix frontend` → Vite dev server on :5173

You can still start them individually with `npm run dev:backend` or `npm run dev:frontend`.

## Code execution

- JavaScript / TypeScript snippets run inside an isolated iframe sandbox that never hits the server.
- Python support is powered by [Pyodide](https://pyodide.org/) (Python → WASM) so the code executes entirely in the browser. See `frontend/src/lib/pythonRunner.js`.

## Docker

Build + run the combined container (Node 20 slim base, serves built frontend via Express backend):

```bash
docker build -t interview-platform .
docker run --rm -p 4000:4000 interview-platform
```

The container runs `npm run start --prefix backend`, serves the API on port 4000, and hosts the Vite build from `/frontend/dist`.

## Tests

Vitest integration suite exercises the backend session API end-to-end (controller + store) without spinning up sockets:

```bash
cd backend
npm test
```

## Production build

```bash
cd frontend && npm run build
```

Backend is a lightweight Node server (no build step required).
