# HTTP Client — Frontend

React + TypeScript frontend for the HTTP Client portfolio project. See the [root README](../README.md) for full project documentation.

## Stack

- React 18
- TypeScript 5
- Vite 5
- Zustand (state management)
- Axios
- react-syntax-highlighter

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm test         # Vitest unit tests
```

Requires a `.env.local` file:

```env
VITE_HTTPREQUEST=http://localhost:3001/api/requests
VITE_HTTPREQUESTLOGIN=http://localhost:3001/api/login
```
