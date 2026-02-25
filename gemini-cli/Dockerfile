FROM node:22-alpine

# Install @google/gemini-cli globally — provides the `gemini` binary.
# OAuth credentials are mounted at runtime from the `gemini-credentials` volume.
RUN npm install -g @google/gemini-cli

# Run gemini directly; callers pass flags like: gemini -p "prompt @/src/teamId"
ENTRYPOINT ["gemini"]
