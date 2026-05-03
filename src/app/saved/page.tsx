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
      <NavBar />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 40px 96px" }}>
        <div className="page-head">
          <div className="lhs">
            <h1>Saved</h1>
            <span className="meta">{loading ? "—" : `${stories.length} links`}</span>
          </div>
        </div>

        {loading && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", padding: "40px 0" }}>
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
            {stories.map((story) => {
              const age = getAge(story.time);
              const domain = getDomain(story.url);
              const cmtCount = story.descendants ?? 0;
              return (
                <div className="row" key={story.id}>
                  <BookmarkButton id={story.id} onUnsave={() => handleUnsave(story.id)} />
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
                      <b>{story.score}</b>
                      <span>points</span>
                      <span className="sep">·</span>
                      <span>by {story.by}</span>
                      <span className="sep">·</span>
                      <span>{age}</span>
                    </div>
                  </div>
                  <Link href={`/story/${story.id}`} className="cmts" aria-label={`${cmtCount} comments`}>
                    <b>{cmtCount}</b> comments
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
