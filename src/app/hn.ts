const BASE = "https://hacker-news.firebaseio.com/v0";

export interface HNItem {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  descendants?: number;
  time: number;
}

export interface HNComment {
  id: number;
  by: string;
  text: string;
  time: number;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
  children: HNComment[];
}

export function getAge(unixTime: number): string {
  const seconds = Math.floor(Date.now() / 1000) - unixTime;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function getDomain(url?: string): string {
  if (!url) return "news.ycombinator.com";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export type Feed =
  | "top"
  | "new"
  | "best"
  | "ask"
  | "show"
  | "job";

const FEED_ENDPOINT: Record<Feed, string> = {
  top: "topstories",
  new: "newstories",
  best: "beststories",
  ask: "askstories",
  show: "showstories",
  job: "jobstories",
};

export async function fetchStories(feed: Feed, count = 30): Promise<HNItem[]> {
  const idsRes = await fetch(`${BASE}/${FEED_ENDPOINT[feed]}.json`, {
    next: { revalidate: 300 },
  });
  const ids: number[] = await idsRes.json();
  const top = ids.slice(0, count);

  const items = await Promise.all(
    top.map((id) =>
      fetch(`${BASE}/item/${id}.json`, { next: { revalidate: 300 } }).then(
        (r) => r.json() as Promise<HNItem>
      )
    )
  );

  return items.filter(Boolean);
}

export async function fetchTopStories(count = 30): Promise<HNItem[]> {
  return fetchStories("top", count);
}

export async function fetchStory(id: number): Promise<HNItem | null> {
  const res = await fetch(`${BASE}/item/${id}.json`, { next: { revalidate: 300 } });
  const item = await res.json();
  return item ?? null;
}

async function fetchComment(id: number, depth = 0): Promise<HNComment | null> {
  if (depth > 5) return null;
  const res = await fetch(`${BASE}/item/${id}.json`, { next: { revalidate: 60 } });
  const item = await res.json();
  if (!item || item.deleted || item.dead || !item.text) return null;

  const children: HNComment[] = [];
  if (item.kids?.length) {
    const childResults = await Promise.all(
      item.kids.slice(0, 8).map((kid: number) => fetchComment(kid, depth + 1))
    );
    children.push(...childResults.filter(Boolean) as HNComment[]);
  }

  return { ...item, children };
}

export async function fetchComments(storyId: number): Promise<HNComment[]> {
  const res = await fetch(`${BASE}/item/${storyId}.json`);
  const story = await res.json();
  if (!story?.kids?.length) return [];

  const top = story.kids.slice(0, 20);
  const results = await Promise.all(top.map((id: number) => fetchComment(id)));
  return results.filter(Boolean) as HNComment[];
}

export async function fetchThreadComments(storyId: number): Promise<HNComment[]> {
  const res = await fetch(`${BASE}/item/${storyId}.json`, { next: { revalidate: 60 } });
  const story = await res.json();
  if (!story?.kids?.length) return [];

  const top = story.kids.slice(0, 40);
  const results = await Promise.all(top.map((id: number) => fetchComment(id)));
  return results.filter(Boolean) as HNComment[];
}
