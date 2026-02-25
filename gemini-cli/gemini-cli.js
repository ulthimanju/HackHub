#!/usr/bin/env node
'use strict';

const { execSync }             = require('child_process');
const { GoogleGenerativeAI }   = require('@google/generative-ai');
const fs                        = require('fs');
const os                        = require('os');
const path                      = require('path');

// ── Argument parsing ─────────────────────────────────────────────────────────
const argv = process.argv.slice(2); // e.g. ['analyze', '--path', '...', '--prompt', '...', '--format', 'json']

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

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || !apiKey.trim()) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// ── Constants ────────────────────────────────────────────────────────────────
// Gemini 2.0 Flash supports 1M token context; 500KB of text ≈ 125K tokens — safe limit
const MAX_CHARS = 500_000;
const MODEL     = 'gemini-2.0-flash';

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Step 1: Bundle the repository with repomix for clean LLM input
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

  // Step 2: Call Gemini
  const genAI     = new GoogleGenerativeAI(apiKey.trim());
  const model     = genAI.getGenerativeModel({ model: MODEL });
  const fullPrompt = `${prompt}\n\nREPOSITORY CONTENT:\n${bundled}`;

  const result = await model.generateContent(fullPrompt);
  const text   = result.response.text()
    .replace(/```json/g, '').replace(/```/g, '').trim();

  // Output raw text — AiService will extract the JSON block
  process.stdout.write(text + '\n');
}

main().catch(err => {
  console.error('Gemini CLI error:', err.message);
  process.exit(1);
});
