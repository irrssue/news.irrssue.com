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

export async function fetchTopStories(count = 30): Promise<HNItem[]> {
  const idsRes = await fetch(`${BASE}/topstories.json`, {
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
