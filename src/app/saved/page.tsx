"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "../NavBar";
import BookmarkButton from "../BookmarkButton";
import VoteButton from "../VoteButton";
import { HNItem, getAge, getDomain, sanitizeUrl } from "../hn";

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
  const [ids, setIds] = useState<number[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const bookmarkIds = getBookmarkIds();
    Promise.all(bookmarkIds.map(fetchItem)).then((results) => {
      if (cancelled) return;
      setIds(bookmarkIds);
      setStories(results.filter(Boolean) as HNItem[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleUnsave(id: number) {
    setStories((prev) => prev.filter((s) => s.id !== id));
    setIds((prev) => prev?.filter((i) => i !== id) ?? null);
  }

  return (
    <>
      <NavBar />
      <main className="page-main">
        <div className="context">
          <span className="range-name"><b>Saved</b></span>
          <span className="count">{loading ? "—" : `${stories.length} links`}</span>
        </div>

        {loading && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", padding: "40px 0", textAlign: "center" }}>
            loading...
          </div>
        )}

        {!loading && ids?.length === 0 && (
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
                  <VoteButton id={story.id} score={story.score} />
                  <BookmarkButton id={story.id} className="save-btn" onUnsave={() => handleUnsave(story.id)} />
                  <div>
                    <p className="ttl">
                      <a
                        href={sanitizeUrl(story.url) ?? `https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {story.title}
                      </a>
                      {domain && <span className="dom">{domain}</span>}
                    </p>
                    <div className="meta">
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
