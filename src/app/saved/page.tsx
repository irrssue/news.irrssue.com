"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "../NavBar";
import BookmarkButton from "../BookmarkButton";
import { HNItem, getAge, getDomain } from "../hn";

const KEY = "hn-bookmarks";
const BASE = "https://hacker-news.firebaseio.com/v0";

function getBookmarkIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(`${BASE}/item/${id}.json`);
    return await res.json();
  } catch {
    return null;
  }
}

export default function SavedPage() {
  const [stories, setStories] = useState<HNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const bookmarkIds = getBookmarkIds();
    setIds(bookmarkIds);
    if (bookmarkIds.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(bookmarkIds.map(fetchItem)).then((results) => {
      setStories(results.filter(Boolean) as HNItem[]);
      setLoading(false);
    });
  }, []);

  function handleUnsave(id: number) {
    setStories((prev) => prev.filter((s) => s.id !== id));
    setIds((prev) => prev.filter((i) => i !== id));
  }

  return (
    <>
      <NavBar count={stories.length} />
      <main className="page-main">
        <div className="context">
          <span className="range-name"><b>Saved</b>links</span>
          <span className="count">{loading ? "—" : `${stories.length} links`}</span>
        </div>

        {loading && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", padding: "40px 0", textAlign: "center" }}>
            loading...
          </div>
        )}

        {!loading && ids.length === 0 && (
          <div className="empty-thread">
            no saved stories yet — bookmark something first
          </div>
        )}

        {!loading && stories.length > 0 && (
          <div className="listA">
            {stories.map((story, i) => {
              const age = getAge(story.time);
              const domain = getDomain(story.url);
              const cmtCount = story.descendants ?? 0;
              return (
                <div className="row" key={story.id}>
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  <BookmarkButton id={story.id} className="save-btn" onUnsave={() => handleUnsave(story.id)} />
                  <div>
                    <p className="ttl">
                      <a
                        href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {story.title}
                      </a>
                      {domain && <span className="dom">{domain}</span>}
                    </p>
                    <div className="meta">
                      <span className="pts"><b>{story.score}</b> points</span>
                      <span className="sep">·</span>
                      <span className="by">by <b>{story.by}</b></span>
                      <span className="sep">·</span>
                      <span>{age}</span>
                    </div>
                  </div>
                  <Link href={`/story/${story.id}`} className="cmts" aria-label={`${cmtCount} comments`}>
                    <b>{cmtCount}</b>
                    comments
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
