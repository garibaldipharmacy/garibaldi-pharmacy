// Loader shim for the built-in SQLite module.
//
// Why this exists: `node:sqlite` is new enough that Node reports it in
// `module.builtinModules` only in its prefixed form (`"node:sqlite"`), not as a
// bare `"sqlite"`. Bundlers written before it landed normalise the specifier by
// stripping the `node:` prefix and then look for bare `"sqlite"`, which is not in
// the list, so they conclude it is an npm package and try to resolve it from
// node_modules. It is not there, and the build or the test run fails with
// "Failed to load url sqlite".
//
// Resolving it through `createRequire` at runtime keeps the specifier out of the
// static module graph entirely, so no bundler ever has an opinion about it. The
// specifier is assembled rather than written as a literal so that aggressive
// static analysis cannot "helpfully" rewrite it back.
//
// This whole file can be deleted once the toolchain understands `node:sqlite`.

import { createRequire } from "node:module";

const nodeRequire = createRequire(import.meta.url);
const SQLITE_MODULE = ["node", "sqlite"].join(":");

interface StatementSync {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
}

export interface SqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): StatementSync;
  close(): void;
}

interface SqliteModule {
  DatabaseSync: new (path: string) => SqliteDatabase;
}

const sqlite = nodeRequire(SQLITE_MODULE) as SqliteModule;

export const DatabaseSync = sqlite.DatabaseSync;
