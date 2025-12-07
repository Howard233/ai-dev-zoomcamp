# syntax=docker/dockerfile:1

FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN npm install --prefix backend --omit=dev && \
    npm install --prefix frontend

COPY . .
RUN npm run build --prefix frontend

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=4000

COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/frontend/dist /app/frontend/dist

EXPOSE 4000
CMD ["npm", "run", "start", "--prefix", "backend"]
