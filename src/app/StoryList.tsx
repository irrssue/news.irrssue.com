"use client";

import { useState } from "react";
import { HNItem } from "./hn";
import InfiniteList from "./InfiniteList";

const RANGE_LABEL: Record<string, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  all: "All-time",
};

export default function StoryList({
  stories,
  label,
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

  const heading = showRangeFilter
    ? RANGE_LABEL[range] ?? "Today"
    : label ?? "";

  const suffix = showRangeFilter ? "top stories" : "";

  return (
    <>
      <div className="context">
        <span className="range-name">
          {heading && <b>{heading}</b>}
          {suffix}
        </span>
        <span className="count">{count} links · refreshed just now</span>
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
