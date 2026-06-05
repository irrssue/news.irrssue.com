import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getValidHNCookie } from "@/lib/session";
import { checkVoteRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

const HN_UA = "Mozilla/5.0 (compatible; minimal-hn-reader/1.0)";

export async function POST(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  if (process.env.NODE_ENV === "production" && proto !== "https") {
    return NextResponse.json({ ok: false, error: "HTTPS required" }, { status: 400 });
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  if (!checkVoteRateLimit(getClientIp(req)).allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many votes. Slow down." },
      { status: 429 }
    );
  }

  let id: number, dir: "up" | "un";
  try {
    const body = await req.json();
    id = Number(body.id);
    dir = body.dir === "un" ? "un" : "up";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid story id" }, { status: 400 });
  }

  let hnCookie: string;
  try {
    hnCookie = getValidHNCookie(sessionUser.hn_session_id);
  } catch {
    return NextResponse.json({ ok: false, error: "Session expired. Please sign in again." }, { status: 401 });
  }

  // Fetch the item page (logged in) to scrape the per-item, per-user vote auth token.
  // HN embeds it in the vote link: vote?id=ID&how=up&auth=TOKEN
  let html: string;
  try {
    const page = await fetch(`https://news.ycombinator.com/item?id=${id}`, {
      headers: { Cookie: `user=${hnCookie}`, "User-Agent": HN_UA },
    });
    html = await page.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach Hacker News" }, { status: 502 });
  }

  // Look for the vote link matching the requested direction for this item.
  // Falls back to grabbing the auth token from any up-vote link for this id.
  const authRe = new RegExp(
    `vote\\?id=${id}&amp;how=${dir}&amp;auth=([0-9a-f]+)`,
    "i"
  );
  let auth = html.match(authRe)?.[1];

  if (!auth) {
    // If the directional link is absent, derive the token from the up link.
    const fallback = html.match(
      new RegExp(`vote\\?id=${id}&amp;how=(?:up|un)&amp;auth=([0-9a-f]+)`, "i")
    );
    auth = fallback?.[1];
  }

  if (!auth) {
    // No vote link present means: not logged in, already in that state, or item locked.
    if (!/id="(?:up|un)_\d+"/.test(html) && !html.includes("logout")) {
      return NextResponse.json({ ok: false, error: "Session expired. Please sign in again." }, { status: 401 });
    }
    return NextResponse.json(
      { ok: false, error: "Voting not available for this story." },
      { status: 409 }
    );
  }

  // Fire the vote. HN responds 200/302 with no useful body.
  try {
    const voteRes = await fetch(
      `https://news.ycombinator.com/vote?id=${id}&how=${dir}&auth=${auth}`,
      {
        headers: { Cookie: `user=${hnCookie}`, "User-Agent": HN_UA },
        redirect: "manual",
      }
    );
    if (voteRes.status >= 400) {
      return NextResponse.json({ ok: false, error: "Vote rejected by HN" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach Hacker News" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, dir });
}
