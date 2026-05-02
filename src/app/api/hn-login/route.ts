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
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const html = await res.text();
  // On failure HN re-renders the login form; on success it doesn't
  const isSuccess = !html.includes('name="pw"');

  return NextResponse.json({ ok: isSuccess });
}
