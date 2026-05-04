import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteIrrssueSession } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(_req: NextRequest) {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (sid) deleteIrrssueSession(sid);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
