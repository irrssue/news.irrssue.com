import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getValidHNCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  if (process.env.NODE_ENV === "production" && proto !== "https") {
    return NextResponse.json({ ok: false, error: "HTTPS required" }, { status: 400 });
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  let title: string, url: string, text: string;
  try {
    const body = await req.json();
    title = (body.title ?? "").trim();
    url = (body.url ?? "").trim();
    text = (body.text ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
  }
  if (title.length > 80) {
    return NextResponse.json({ ok: false, error: "Title must be 80 characters or fewer" }, { status: 400 });
  }
  if (!url && !text) {
    return NextResponse.json({ ok: false, error: "URL or text is required" }, { status: 400 });
  }
  if (url && text) {
    return NextResponse.json({ ok: false, error: "Submit either a URL or text, not both" }, { status: 400 });
  }
  if (url) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid URL" }, { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ ok: false, error: "URL must use http or https" }, { status: 400 });
    }
  }

  let hnCookie: string;
  try {
    hnCookie = getValidHNCookie(sessionUser.hn_session_id);
  } catch {
    return NextResponse.json({ ok: false, error: "Session expired. Please sign in again." }, { status: 401 });
  }

  // Fetch HN submit page to get CSRF fnid token
  let fnid: string;
  try {
    const submitPage = await fetch("https://news.ycombinator.com/submit", {
      headers: {
        Cookie: `user=${hnCookie}`,
        "User-Agent": "Mozilla/5.0 (compatible; minimal-hn-reader/1.0)",
      },
    });
    const html = await submitPage.text();
    const match = html.match(/name="fnid"\s+value="([^"]+)"/);
    if (!match) {
      return NextResponse.json({ ok: false, error: "Could not get submit token from HN" }, { status: 502 });
    }
    fnid = match[1];
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach Hacker News" }, { status: 502 });
  }

  // Submit to HN
  const formData = new URLSearchParams({ fnid, fnop: "submit-page", title });
  if (url) formData.set("url", url);
  if (text) formData.set("text", text);

  let hnRes: Response;
  try {
    hnRes = await fetch("https://news.ycombinator.com/r", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `user=${hnCookie}`,
        "User-Agent": "Mozilla/5.0 (compatible; minimal-hn-reader/1.0)",
      },
      body: formData.toString(),
      redirect: "manual",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach Hacker News" }, { status: 502 });
  }

  // HN redirects to the new story page on success
  const location = hnRes.headers.get("location") ?? "";
  if ((hnRes.status >= 300 && hnRes.status < 400) && (location.includes("item?id=") || location === "newest")) {
    const idMatch = location.match(/item\?id=(\d+)/);
    return NextResponse.json({ ok: true, storyId: idMatch?.[1] ?? null });
  }

  // Check response body for error messages
  const body = await hnRes.text().catch(() => "");
  if (body.includes("You're submitting too fast")) {
    return NextResponse.json({ ok: false, error: "Submitting too fast. Wait a bit and try again." }, { status: 429 });
  }
  if (body.includes("already been submitted")) {
    return NextResponse.json({ ok: false, error: "This URL has already been submitted recently." }, { status: 409 });
  }

  return NextResponse.json({ ok: false, error: "Submission failed. Try again." }, { status: 500 });
}
