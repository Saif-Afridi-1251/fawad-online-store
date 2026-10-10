import { env } from "cloudflare:workers";

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
}

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

export interface StoreDatabase {
  prepare(query: string): D1Statement;
  batch<T = unknown>(statements: D1Statement[]): Promise<T[]>;
}

export function getDb() {
  const database = (env as unknown as { DB?: StoreDatabase }).DB;
  if (!database) {
    throw new Error("Store database is unavailable.");
  }
  return database;
}
