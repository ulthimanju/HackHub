FROM node:22-alpine

# repomix bundles the repo; @google/gemini-cli handles auth + model calls
RUN npm install -g repomix @google/gemini-cli

WORKDIR /app
COPY gemini-cli.js ./gemini-cli.js

# Shell wrapper so the binary is callable as `gemini-cli <args>`
RUN printf '#!/bin/sh\nexec node /app/gemini-cli.js "$@"\n' > /usr/local/bin/gemini-cli \
    && chmod +x /usr/local/bin/gemini-cli
