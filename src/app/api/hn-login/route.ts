import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const body = new URLSearchParams({
    acct: username,
    pw: password,
    goto: "news",
  });

  const res = await fetch("https://news.ycombinator.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (compatible; minimal-hackernews)",
    },
    body: body.toString(),
    redirect: "manual",
  });

  // HN returns 302 on success (redirect to /news), 200 with re-rendered form on failure.
  const setCookie = res.headers.get("set-cookie") ?? "";
  const isSuccess =
    (res.status >= 300 && res.status < 400) || /\buser=/.test(setCookie);

  return NextResponse.json({ ok: isSuccess });
}
