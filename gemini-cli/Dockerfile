FROM node:22-slim

# Install @google/gemini-cli globally — provides the `gemini` binary.
# OAuth credentials are mounted at runtime from the `gemini-credentials` volume.
RUN npm install -g @google/gemini-cli

# Host code is mounted here at runtime.
WORKDIR /app

# Run gemini directly; callers pass flags like: gemini -p "prompt @/src/teamId"
ENTRYPOINT ["gemini"]
