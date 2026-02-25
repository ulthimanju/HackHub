#!/usr/bin/env node
'use strict';

/**
 * gemini-cli analyze wrapper
 *
 * Uses the official @google/gemini-cli binary (OAuth — no API key required).
 * Credentials are pre-stored in /root/.gemini/ by running:
 *   docker run -it -v gemini-credentials:/root/.gemini gemini-cli:latest gemini auth login
 *
 * Gemini CLI can analyze an entire directory natively — no bundling needed.
 *
 * Usage: gemini-cli analyze --path <dir> --prompt <text> [--format json]
 */

const { spawnSync } = require('child_process');

// ── Argument parsing ─────────────────────────────────────────────────────────
const argv = process.argv.slice(2);

if (argv[0] !== 'analyze') {
  console.error('Usage: gemini-cli analyze --path <dir> --prompt <text> [--format json]');
  process.exit(1);
}

const getArg = (flag) => {
  const idx = argv.indexOf(flag);
  return idx !== -1 ? argv[idx + 1] : null;
};

const repoPath = getArg('--path');
const prompt   = getArg('--prompt');

if (!repoPath || !prompt) {
  console.error('--path and --prompt are required');
  process.exit(1);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  // Gemini CLI analyzes the directory directly — pass prompt via stdin.
  // The CLI reads from stdin when it is not a TTY (non-interactive mode).
  const result = spawnSync('gemini', [], {
    input:   prompt,
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
    timeout:   300_000, // 5-minute timeout for large codebases
    cwd: repoPath,      // run from within the repo so gemini sees all files
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }
  });

  if (result.status !== 0 || result.error) {
    const errMsg = result.stderr || result.error?.message || 'Unknown error';
    console.error('Gemini CLI failed:', errMsg);
    process.exit(1);
  }

  // Output raw text — AiService extracts the JSON block from it
  process.stdout.write(result.stdout);
}

main();

