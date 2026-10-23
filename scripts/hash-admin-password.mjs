#!/usr/bin/env node
// Generates the value for ADMIN_PASSWORD_HASH.
//
//   node scripts/hash-admin-password.mjs
//
// Reads the password from a prompt rather than argv, so it never lands in your
// shell history or in the process list.

import { createInterface } from "node:readline/promises";
import { randomBytes, scryptSync } from "node:crypto";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout, terminal: true });

// Suppress echo while typing.
const write = stdout.write.bind(stdout);
let muted = false;
stdout.write = (chunk, ...rest) => (muted ? true : write(chunk, ...rest));

const promise = rl.question("New admin password: ");
muted = true;
const password = (await promise).trim();
muted = false;
stdout.write("\n");
rl.close();

if (password.length < 12) {
  console.error("Use at least 12 characters. This guards patient data.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

console.log("\nAdd these to the server's .env:\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("hex")}`);
console.log("\nRotating ADMIN_SESSION_SECRET signs everyone out immediately.\n");
