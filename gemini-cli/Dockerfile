FROM node:22-alpine

# repomix bundles the repo into LLM-friendly text before calling Gemini
RUN npm install -g repomix

WORKDIR /app
COPY package.json ./
RUN npm install

COPY gemini-cli.js ./gemini-cli.js

# Shell wrapper so the binary is callable as `gemini-cli <args>`
RUN printf '#!/bin/sh\nexec node /app/gemini-cli.js "$@"\n' > /usr/local/bin/gemini-cli \
    && chmod +x /usr/local/bin/gemini-cli
