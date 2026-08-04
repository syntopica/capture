#!/usr/bin/env node
//
// Mint a capture token. Prints the token once and the SQL that stores its
// digest; the token itself is never written anywhere by this script.
//
// Usage: node scripts/mint-token.mjs "iphone"

import { createHash, randomBytes } from 'node:crypto'

const label = process.argv[2]
if (!label) {
  console.error('usage: node scripts/mint-token.mjs "<label>"')
  process.exit(2)
}

// 32 bytes of urlsafe base64. It travels in an Authorization header and lives
// in a Shortcuts plist, so it has to survive copy-paste without quoting.
const token = randomBytes(32).toString('base64url')
const digest = createHash('sha256').update(token).digest('hex')

console.log(`token (copy it now, it is not stored):\n${token}\n`)
console.log(
  `INSERT INTO capture_tokens (token_sha256, label) VALUES ('${digest}', '${label.replaceAll("'", "''")}');`,
)
