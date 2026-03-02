/**
 * Telegram MTProto Session Generator
 *
 * Run once to generate a TELEGRAM_SESSION string for use in .env:
 *   npm run telegram:auth
 *
 * Prerequisites:
 *   1. Create a Telegram app at https://my.telegram.org/apps
 *   2. Copy your api_id and api_hash into .env:
 *        TELEGRAM_API_ID=your_api_id
 *        TELEGRAM_API_HASH=your_api_hash
 *   3. Run this script and follow the prompts.
 *   4. Copy the printed session string into .env as TELEGRAM_SESSION.
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/StringSession.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load .env from repo root
const envPath = path.resolve(process.cwd(), '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = val;
    }
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log('\n  Armsrace Monitor — Telegram Session Generator');
  console.log('  ───────────────────────────────────────────────\n');

  const apiIdStr = process.env.TELEGRAM_API_ID;
  const apiHash = process.env.TELEGRAM_API_HASH;

  if (!apiIdStr || !apiHash) {
    console.error('  ERROR: TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env');
    console.error('  Visit https://my.telegram.org/apps to create an application.\n');
    process.exit(1);
  }

  const apiId = parseInt(apiIdStr, 10);
  if (isNaN(apiId)) {
    console.error('  ERROR: TELEGRAM_API_ID must be a number.\n');
    process.exit(1);
  }

  console.log(`  API ID:   ${apiId}`);
  console.log(`  API Hash: ${apiHash.slice(0, 8)}...`);
  console.log();

  const session = new StringSession('');
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 3,
    autoReconnect: false,
  });

  await client.start({
    phoneNumber: async () => {
      const phone = await rl.question('  Enter your phone number (e.g. +14155551234): ');
      return phone.trim();
    },
    password: async () => {
      const pwd = await rl.question('  Enter your 2FA password (leave blank if none): ');
      return pwd;
    },
    phoneCode: async () => {
      const code = await rl.question('  Enter the code sent to your Telegram app: ');
      return code.trim();
    },
    onError: (err) => {
      console.error('\n  Auth error:', err.message);
    },
  });

  const sessionString = client.session.save() as unknown as string;
  await client.disconnect();
  rl.close();

  console.log('\n  ✓ Authentication successful!\n');
  console.log('  Add the following line to your .env file:\n');
  console.log(`  TELEGRAM_SESSION=${sessionString}\n`);

  // Offer to write it directly
  const envFile = path.resolve(process.cwd(), '../../.env');
  if (fs.existsSync(envFile)) {
    let content = fs.readFileSync(envFile, 'utf8');
    if (content.includes('TELEGRAM_SESSION=')) {
      content = content.replace(/^TELEGRAM_SESSION=.*$/m, `TELEGRAM_SESSION=${sessionString}`);
      fs.writeFileSync(envFile, content, 'utf8');
      console.log('  .env updated automatically with the new session.\n');
    } else {
      console.log('  (Could not auto-update .env — paste the line above manually.)\n');
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('\n  Fatal error:', err);
  process.exit(1);
});
