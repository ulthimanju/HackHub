#!/usr/bin/env node
'use strict';

/**
 * gemini-cli analyze wrapper
 *
 * Uses the official @google/gemini-cli binary (OAuth — no API key required).
 * Credentials are pre-stored in /root/.gemini/ by running:
 *   docker run -it -v gemini-credentials:/root/.gemini gemini-cli:latest gemini auth login
 *
 * Usage: gemini-cli analyze --path <dir> --prompt <text> [--format json]
 */

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

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

// ── Constants ────────────────────────────────────────────────────────────────
// Gemini 2.0 Flash supports ~1M token context; 500KB ≈ 125K tokens
const MAX_CHARS = 500_000;

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  // Step 1: Bundle the repository with repomix
  const tmpFile = path.join(os.tmpdir(), `ehub-bundle-${Date.now()}.txt`);
  try {
    execSync(`repomix --output "${tmpFile}" "${repoPath}"`, { stdio: 'pipe' });
  } catch (err) {
    const msg = err.stderr ? err.stderr.toString() : err.message;
    console.error('repomix failed:', msg);
    process.exit(1);
  }

  let bundled = fs.readFileSync(tmpFile, 'utf8');
  fs.unlinkSync(tmpFile);

  if (bundled.length > MAX_CHARS) {
    bundled = bundled.substring(0, MAX_CHARS) + '\n\n[... CONTENT TRUNCATED ...]';
  }

  // Step 2: Build full prompt and pipe to official `gemini` CLI via stdin
  // The CLI reads from stdin when it is not a TTY (non-interactive mode).
  const fullPrompt = `${prompt}\n\nREPOSITORY CONTENT:\n${bundled}`;

  const result = spawnSync('gemini', [], {
    input:     fullPrompt,
    encoding:  'utf8',
    maxBuffer: 100 * 1024 * 1024, // 100 MB — large repos can produce big bundles
    timeout:   180_000,            // 3-minute hard timeout
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } // suppress ANSI codes in output
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

