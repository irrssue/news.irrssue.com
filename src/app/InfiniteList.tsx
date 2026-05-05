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
  const loadingRef = useRef(false);
  const doneRef = useRef(false);

  // Sync when server sends fresh initialStories after range change
  const prevRangeRef = useRef(range);
  useEffect(() => {
    if (range !== prevRangeRef.current) {
      prevRangeRef.current = range;
      setStories(initialStories);
      setDone(false);
      setExpandedId(null);
      offsetRef.current = initialStories.length;
      loadingRef.current = false;
      doneRef.current = false;
      onCountChange?.(initialStories.length);
    }
  }, [range, initialStories, onCountChange]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
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
        doneRef.current = true;
        setDone(true);
      } else {
        setStories((prev) => {
          const next = [...prev, ...data.stories];
          onCountChange?.(next.length);
          return next;
        });
        offsetRef.current += data.stories.length;
        if (data.stories.length < 30) {
          doneRef.current = true;
          setDone(true);
        }
      }
    } catch {
      // silently fail — user can scroll again
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [feed, range]);

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
        {stories.map((story, i) => (
          <StoryRow
            key={story.id}
            story={story}
            index={i}
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
