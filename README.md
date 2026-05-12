# HTTP Client — Portfolio Project

A web-based HTTP client inspired by Postman, built as a portfolio project and deployed on a Raspberry Pi. Users can compose and send HTTP requests from the browser without hitting CORS restrictions, since the frontend proxies all traffic through the backend.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Stack](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs) ![Stack](https://img.shields.io/badge/Express-4-000000?logo=express) ![Stack](https://img.shields.io/badge/MariaDB-11-003545?logo=mariadb) ![Stack](https://img.shields.io/badge/Docker-ARM64-2496ED?logo=docker)

---

## Features

- **Multi-tab interface** — open multiple requests simultaneously, each with its own state
- **Request editor** — method selector, URL bar with domain dropdown, headers, query params, and body
- **Body types** — JSON, form-data (with file upload), x-www-form-urlencoded, raw, GraphQL
- **Environment variables** — define `{{key}}` variables per environment, resolved before sending
- **History** — last 100 requests persisted in localStorage, isolated per user account
- **Collections** — save and organize requests, persist across sessions
- **Export as cURL** — one-click copy of the current request as a `curl` command
- **Response viewer** — syntax-highlighted body, headers tab, status badge, response time and size
- **JWT authentication** — login required to use the app
- **Role-based URL access** — guest users can only reach a curated whitelist of public APIs; admin users can reach any URL
- **Admin panel** — promote/demote users, delete accounts
- **Per-user data isolation** — localStorage keys namespaced by username so sessions don't bleed into each other
- **Docker support** — single-container deployment with external MariaDB

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Zustand |
| Backend | Node.js 20, Express 4, Axios, Multer |
| Database | MariaDB + Sequelize ORM |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Testing | Jest + Supertest (backend), Vitest (frontend) |
| Deploy | Docker (node:20-alpine, ARM64) |

---

## Allowed Public APIs (guest users)

| API | Base URL |
|---|---|
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` |
| PokéAPI | `https://pokeapi.co` |
| HTTPBin | `https://httpbin.org` |
| GitHub API | `https://api.github.com` |
| ReqRes | `https://reqres.in` |
| DummyJSON | `https://dummyjson.com` |
| Random User | `https://randomuser.me` |
| SWAPI | `https://swapi.dev` |
| Open-Meteo | `https://api.open-meteo.com` |
| REST Countries | `https://restcountries.com` |
| Dog API | `https://dog.ceo` |
| Dad Jokes | `https://icanhazdadjoke.com` |

Admin accounts can reach any URL.

---

## Project Structure

```
HTTP-Requests - portfolio/
├── backend/
│   ├── controllers/      # Express route handlers
│   ├── models/           # Sequelize models
│   ├── utils/            # Config, middleware, logger
│   ├── tests/
│   │   ├── unit/         # Pure function tests (no DB)
│   │   └── integration/  # Supertest tests (real MariaDB)
│   └── index.js
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── services/     # API calls, localStorage services
│       ├── store/        # Zustand store
│       ├── types/        # Shared TypeScript interfaces
│       └── utils/        # cURL exporter, env resolution
├── Dockerfile
└── docker-compose.yml
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- MariaDB instance running

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on PORT (default 3001)
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # or create manually (see below)
npm install
npm run dev                        # starts on http://localhost:5173
```

`.env.local` for frontend development:

```env
VITE_HTTPREQUEST=http://localhost:3001/api/requests
VITE_HTTPREQUESTLOGIN=http://localhost:3001/api/login
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3001`) |
| `SECRET` | JWT signing secret |
| `DATABASE_URL` | MariaDB connection string — `mariadb://user:pass@host:3306/db` |
| `DATABASE_TEST_URL` | MariaDB connection string for integration tests |

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `VITE_HTTPREQUEST` | Backend proxy endpoint URL |
| `VITE_HTTPREQUESTLOGIN` | Backend login endpoint URL |

---

## Docker Deployment

The included `Dockerfile` is a multi-stage build:
1. **Stage 1** — builds the React frontend (`npm run build`)
2. **Stage 2** — copies the compiled `dist/` into the Express server and serves it as static files

```bash
# Build image
docker build -t http-client .

# Run with docker compose (configure .env first)
docker compose up -d
```

The app expects MariaDB to be running externally (not managed by Docker Compose).

---

## Running Tests

```bash
# Backend unit tests (no DB required)
cd backend && npm run test:unit

# Backend integration tests (requires DATABASE_TEST_URL)
cd backend && npm run test:integration

# Frontend tests
cd frontend && npm test
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/login` | — | Login, returns JWT |
| `POST` | `/api/requests` | JWT | Proxy an HTTP request |
| `GET` | `/api/requests/allowed-domains` | — | List of whitelisted domains |
| `GET` | `/api/users` | Admin JWT | List all users |
| `DELETE` | `/api/users/:id` | Admin JWT | Delete a user |
| `PATCH` | `/api/users/:id` | Admin JWT | Toggle admin status |
