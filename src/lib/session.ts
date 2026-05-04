import { cookies } from "next/headers";
import { decryptCookie } from "./crypto";
import { getIrrssueSession, getHNSession, touchHNSession, invalidateHNSession } from "./db";

export const SESSION_COOKIE = "mhn_sid";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  hn_username: string;
  irrssue_session_id: string;
  hn_session_id: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (!sid) return null;

  const isession = getIrrssueSession(sid);
  if (!isession) return null;

  const hnsession = getHNSession(isession.hn_session_id);
  if (!hnsession) return null;

  return {
    hn_username: hnsession.hn_username,
    irrssue_session_id: isession.id,
    hn_session_id: hnsession.id,
  };
}

export function getValidHNCookie(hn_session_id: string): string {
  const hnsession = getHNSession(hn_session_id);
  if (!hnsession) throw new Error("HN session not found");
  touchHNSession(hn_session_id);
  return decryptCookie(
    hnsession.encrypted_cookie,
    hnsession.cookie_iv,
    hnsession.cookie_auth_tag
  );
}

export function invalidateHNCookie(hn_session_id: string): void {
  invalidateHNSession(hn_session_id);
}
