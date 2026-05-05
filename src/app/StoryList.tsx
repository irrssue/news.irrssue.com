"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HNItem } from "./hn";
import InfiniteList from "./InfiniteList";

export default function StoryList({
  stories,
  label = "Front page",
  titleLinksToComments,
  range = "today",
  showRangeFilter = false,
  feed = "top",
}: {
  stories: HNItem[];
  label?: string;
  titleLinksToComments?: boolean;
  range?: "today" | "week" | "month" | "all";
  showRangeFilter?: boolean;
  feed?: string;
}) {
  const [count, setCount] = useState(stories.length);
  const [pending, startTransition] = useTransition();
  const [pendingRange, setPendingRange] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hn-count", { detail: count }));
  }, [count]);

  function handleRangeClick(k: "today" | "week" | "month" | "all") {
    if (k === range) return;
    setPendingRange(k);
    startTransition(() => {
      router.push(k === "today" ? "/" : `/?t=${k}`);
    });
  }

  return (
    <>
      <div className="page-head">
        <div className="lhs">
          <h1>{label}</h1>
          <span className="meta">{count} links</span>
        </div>
        {showRangeFilter && (
          <div className="filters">
            {(["today", "week", "month", "all"] as const).map((k) => {
              const isActive = pending ? pendingRange === k : range === k;
              return (
                <button
                  key={k}
                  onClick={() => handleRangeClick(k)}
                  className={isActive ? "on" : ""}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  {k === "all" ? "all-time" : k}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ opacity: pending ? 0.4 : 1, transition: "opacity 0.15s" }}>
        <InfiniteList
          initialStories={stories}
          feed={feed}
          range={range}
          titleLinksToComments={titleLinksToComments}
          onCountChange={setCount}
        />
      </div>
    </>
  );
}
