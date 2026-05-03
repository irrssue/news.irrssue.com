import { NextRequest, NextResponse } from "next/server";
import { fetchStories, fetchStoriesByRange, Feed, TimeRange } from "../../hn";

const VALID_FEEDS: Feed[] = ["top", "new", "best", "ask", "show", "job"];
const VALID_RANGES: TimeRange[] = ["today", "week", "month", "all"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const feed = searchParams.get("feed") ?? "top";
  const range = searchParams.get("range") ?? "today";
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const count = 30;

  if (!VALID_FEEDS.includes(feed as Feed) && !VALID_RANGES.includes(range as TimeRange)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  try {
    let stories: HNItem[];
    if (feed === "top" && VALID_RANGES.includes(range as TimeRange)) {
      stories = await fetchStoriesByRange(range as TimeRange, offset + count);
      stories = stories.slice(offset);
    } else if (VALID_FEEDS.includes(feed as Feed)) {
      stories = await fetchStories(feed as Feed, offset + count);
      stories = stories.slice(offset);
    } else {
      stories = [];
    }

    return NextResponse.json({ stories, nextOffset: offset + stories.length });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
