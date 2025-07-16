# Этап 1: Сборка Angular-приложения
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Этап 2: Nginx
FROM nginx:stable-alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html
# COPY default.conf /etc/nginx/conf.d/default.conf
# COPY ../nginx/nginx.conf /etc/nginx/nginx.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
