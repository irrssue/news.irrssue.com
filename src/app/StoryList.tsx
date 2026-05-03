"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <>
      <div className="page-head">
        <div className="lhs">
          <h1>{label}</h1>
          <span className="meta">{count} links</span>
        </div>
        {showRangeFilter && (
          <div className="filters">
            {(["today", "week", "month", "all"] as const).map((k) => (
              <Link
                key={k}
                href={k === "today" ? "/" : `/?t=${k}`}
                className={range === k ? "on" : ""}
              >
                {k === "all" ? "all-time" : k}
              </Link>
            ))}
          </div>
        )}
      </div>

      <InfiniteList
        initialStories={stories}
        feed={feed}
        range={range}
        titleLinksToComments={titleLinksToComments}
        onCountChange={setCount}
      />
    </>
  );
}
