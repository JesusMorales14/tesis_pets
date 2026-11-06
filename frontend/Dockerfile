# syntax=docker/dockerfile:1
# 1) Compila la SPA  2) La sirve con Nginx (imagen final sin Node).
FROM node:25-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx ng build --configuration production

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
# Plantilla: la imagen sustituye ${API_UPSTREAM} al arrancar.
ENV API_UPSTREAM=http://api:8000
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/www /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
