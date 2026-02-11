# syntax=docker/dockerfile:1
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules/.cache \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY angular.json tsconfig*.json ./
COPY src src/

COPY . .

RUN --mount=type=cache,target=/app/node_modules/.cache \
    npm run build --prod

FROM nginx:stable-alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
