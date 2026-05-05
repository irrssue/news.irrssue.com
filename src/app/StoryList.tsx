"use client";

import { HNItem } from "./hn";
import InfiniteList from "./InfiniteList";

export default function StoryList({
  stories,
  titleLinksToComments,
  range = "today",
  feed = "top",
}: {
  stories: HNItem[];
  label?: string;
  titleLinksToComments?: boolean;
  range?: "today" | "week" | "month" | "all";
  showRangeFilter?: boolean;
  feed?: string;
}) {
  return (
    <InfiniteList
      initialStories={stories}
      feed={feed}
      range={range}
      titleLinksToComments={titleLinksToComments}
    />
  );
}
