/**
 * Dev server launcher — spawns API, Worker, and Web processes
 * without relying on cmd.exe (cross-platform, no shell: true).
 */
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const node = process.execPath;

// Resolve vite bin — may be hoisted to root or in packages/web
function resolveViteBin() {
  const candidates = [
    resolve(root, 'node_modules/vite/bin/vite.js'),
    resolve(root, 'packages/web/node_modules/vite/bin/vite.js'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error('Could not find vite binary. Run npm install first.');
}

const colors = {
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
};

const procs = [
  {
    name: 'API',
    color: colors.yellow,
    args: ['--import', 'tsx', '--watch', resolve(root, 'packages/api/src/index.ts')],
    cwd: root,
  },
  {
    name: 'WORKER',
    color: colors.green,
    args: ['--import', 'tsx', '--watch', resolve(root, 'packages/worker/src/index.ts')],
    cwd: root,
  },
  {
    name: 'WEB',
    color: colors.cyan,
    args: [resolveViteBin(), '--port', '4010', '--host', '127.0.0.1'],
    cwd: resolve(root, 'packages/web'),
  },
];

const children = [];

function prefix(name, color, line) {
  return `${color}[${name}]${colors.reset} ${line}`;
}

for (const p of procs) {
  const child = spawn(node, p.args, {
    cwd: p.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  child.stdout.on('data', (data) => {
    for (const line of data.toString().split('\n')) {
      if (line.trim()) process.stdout.write(prefix(p.name, p.color, line) + '\n');
    }
  });

  child.stderr.on('data', (data) => {
    for (const line of data.toString().split('\n')) {
      if (line.trim()) process.stderr.write(prefix(p.name, p.color, line) + '\n');
    }
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      process.stderr.write(
        prefix(p.name, colors.red, `exited with code ${code}`) + '\n'
      );
      // Kill all other processes
      for (const c of children) {
        try { c.kill('SIGTERM'); } catch {}
      }
      process.exit(code);
    }
  });

  children.push(child);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  for (const c of children) {
    try { c.kill('SIGTERM'); } catch {}
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  for (const c of children) {
    try { c.kill('SIGTERM'); } catch {}
  }
  process.exit(0);
});

console.log(`${colors.dim}Armsrace Monitor — dev server starting...${colors.reset}\n`);
