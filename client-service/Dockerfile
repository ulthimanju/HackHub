# syntax=docker/dockerfile:1
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY client-service/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY client-service/ .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY client-service/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]