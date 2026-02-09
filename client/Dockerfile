# syntax=docker/dockerfile:1
# Этап 1: Сборка Angular-приложения (BuildKit: DOCKER_BUILDKIT=1 для кэша npm)
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
# Кэш npm между сборками; npm ci быстрее и детерминирован при наличии package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build --prod

# Этап 2: Nginx
FROM nginx:stable-alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
