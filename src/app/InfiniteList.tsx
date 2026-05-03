"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HNItem } from "./hn";
import StoryRow from "./StoryRow";

export default function InfiniteList({
  initialStories,
  feed,
  range,
  titleLinksToComments,
}: {
  initialStories: HNItem[];
  feed: string;
  range?: string;
  titleLinksToComments?: boolean;
}) {
  const [stories, setStories] = useState<HNItem[]>(initialStories);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialStories.length);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);

    const params = new URLSearchParams({
      feed,
      offset: String(offsetRef.current),
    });
    if (range) params.set("range", range);

    try {
      const res = await fetch(`/api/stories?${params}`);
      const data = await res.json();
      if (!data.stories || data.stories.length === 0) {
        setDone(true);
      } else {
        setStories((prev) => [...prev, ...data.stories]);
        offsetRef.current += data.stories.length;
        if (data.stories.length < 30) setDone(true);
      }
    } catch {
      // silently fail — user can scroll again
    } finally {
      setLoading(false);
    }
  }, [loading, done, feed, range]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  function toggleComments(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <div className="listA">
        {stories.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            expanded={expandedId === story.id}
            onToggleComments={() => toggleComments(story.id)}
            titleLinksToComments={titleLinksToComments}
          />
        ))}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />

      {loading && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#4a4a4a",
            textAlign: "center",
            padding: "20px 0 40px",
            letterSpacing: "0.06em",
          }}
        >
          loading...
        </div>
      )}

      {done && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#333",
            textAlign: "center",
            padding: "20px 0 40px",
            letterSpacing: "0.06em",
          }}
        >
          — end —
        </div>
      )}
    </>
  );
}
