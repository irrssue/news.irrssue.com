/**
 * In-memory rate limiter. Resets on server restart — acceptable for personal use.
 * 5 login attempts per IP per 15 minutes.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface Entry {
  count: number;
  window_start: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.window_start > WINDOW_MS) {
    store.set(ip, { count: 1, window_start: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

// Submission limiter — tighter than login. 3 submissions / 10 min per IP.
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;
const SUBMIT_MAX = 3;
const submitStore = new Map<string, Entry>();

export function checkSubmitRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = submitStore.get(ip);

  if (!entry || now - entry.window_start > SUBMIT_WINDOW_MS) {
    submitStore.set(ip, { count: 1, window_start: now });
    return { allowed: true };
  }

  if (entry.count >= SUBMIT_MAX) return { allowed: false };

  entry.count++;
  return { allowed: true };
}

// Vote limiter — generous, voting is a light action. 60 votes / 5 min per IP.
const VOTE_WINDOW_MS = 5 * 60 * 1000;
const VOTE_MAX = 60;
const voteStore = new Map<string, Entry>();

export function checkVoteRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = voteStore.get(ip);

  if (!entry || now - entry.window_start > VOTE_WINDOW_MS) {
    voteStore.set(ip, { count: 1, window_start: now });
    return { allowed: true };
  }

  if (entry.count >= VOTE_MAX) return { allowed: false };

  entry.count++;
  return { allowed: true };
}
