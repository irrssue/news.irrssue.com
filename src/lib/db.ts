/**
 * Lightweight JSON file store. Runs server-side only.
 * Stores: hn_sessions + irrssue_sessions.
 * For a personal homeserver this avoids a Postgres/SQLite dependency.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), ".data");
const DB_FILE = join(DATA_DIR, "sessions.json");

export interface HNSession {
  id: string;
  hn_username: string;
  encrypted_cookie: string;
  cookie_iv: string;
  cookie_auth_tag: string;
  created_at: string;
  last_used_at: string;
}

export interface IrrssueSession {
  id: string;
  hn_session_id: string;
  created_at: string;
  last_used_at: string;
}

interface DB {
  hn_sessions: HNSession[];
  irrssue_sessions: IrrssueSession[];
}

function load(): DB {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) return { hn_sessions: [], irrssue_sessions: [] };
  try {
    return JSON.parse(readFileSync(DB_FILE, "utf8")) as DB;
  } catch {
    return { hn_sessions: [], irrssue_sessions: [] };
  }
}

function save(db: DB): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2), { mode: 0o600 });
}

export function upsertHNSession(
  hn_username: string,
  encrypted_cookie: string,
  cookie_iv: string,
  cookie_auth_tag: string
): HNSession {
  const db = load();
  const now = new Date().toISOString();
  const existing = db.hn_sessions.find(s => s.hn_username === hn_username);
  if (existing) {
    existing.encrypted_cookie = encrypted_cookie;
    existing.cookie_iv = cookie_iv;
    existing.cookie_auth_tag = cookie_auth_tag;
    existing.last_used_at = now;
    save(db);
    return existing;
  }
  const entry: HNSession = {
    id: randomBytes(16).toString("hex"),
    hn_username,
    encrypted_cookie,
    cookie_iv,
    cookie_auth_tag,
    created_at: now,
    last_used_at: now,
  };
  db.hn_sessions.push(entry);
  save(db);
  return entry;
}

export function getHNSession(hn_session_id: string): HNSession | null {
  return load().hn_sessions.find(s => s.id === hn_session_id) ?? null;
}

export function touchHNSession(hn_session_id: string): void {
  const db = load();
  const s = db.hn_sessions.find(s => s.id === hn_session_id);
  if (s) { s.last_used_at = new Date().toISOString(); save(db); }
}

export function invalidateHNSession(hn_session_id: string): void {
  const db = load();
  const idx = db.hn_sessions.findIndex(s => s.id === hn_session_id);
  if (idx !== -1) {
    db.hn_sessions.splice(idx, 1);
    db.irrssue_sessions = db.irrssue_sessions.filter(s => s.hn_session_id !== hn_session_id);
    save(db);
  }
}

export function createIrrssueSession(hn_session_id: string): IrrssueSession {
  const db = load();
  const now = new Date().toISOString();
  // One irrssue session per HN session — replace if exists
  db.irrssue_sessions = db.irrssue_sessions.filter(s => s.hn_session_id !== hn_session_id);
  const session: IrrssueSession = {
    id: randomBytes(32).toString("hex"),
    hn_session_id,
    created_at: now,
    last_used_at: now,
  };
  db.irrssue_sessions.push(session);
  save(db);
  return session;
}

export function getIrrssueSession(session_id: string): IrrssueSession | null {
  return load().irrssue_sessions.find(s => s.id === session_id) ?? null;
}

export function deleteIrrssueSession(session_id: string): void {
  const db = load();
  db.irrssue_sessions = db.irrssue_sessions.filter(s => s.id !== session_id);
  save(db);
}
