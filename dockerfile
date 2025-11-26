# ==========================================
# Etapa 1: Builder (Construcción)
# ==========================================
FROM node:25.0.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG REACT_APP_JDOWNLOADER_EMAIL
ARG REACT_APP_JDOWNLOADER_PASSWORD
ARG REACT_APP_JDOWNLOADER_DEVICE_NAME
ENV REACT_APP_JDOWNLOADER_EMAIL=$REACT_APP_JDOWNLOADER_EMAIL
ENV REACT_APP_JDOWNLOADER_PASSWORD=$REACT_APP_JDOWNLOADER_PASSWORD
ENV REACT_APP_JDOWNLOADER_DEVICE_NAME=$REACT_APP_JDOWNLOADER_DEVICE_NAME

RUN npm run build

# ==========================================
# Etapa 2: Runner (Producción)
# ==========================================
FROM node:25.0.0-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 4000
CMD ["serve", "-s", "build", "-l", "4000"]