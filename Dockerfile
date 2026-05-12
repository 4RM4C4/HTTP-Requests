# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# VITE_* build-time env vars passed as build args
ARG VITE_HTTPREQUEST
ARG VITE_HTTPREQUESTLOGIN
ENV VITE_HTTPREQUEST=$VITE_HTTPREQUEST
ENV VITE_HTTPREQUESTLOGIN=$VITE_HTTPREQUESTLOGIN

RUN npm run build

# Stage 2: Production backend + built frontend
FROM node:20-alpine AS production

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Copy built frontend into backend's dist/ folder (Express serves it as static)
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 3001

CMD ["node", "index.js"]
