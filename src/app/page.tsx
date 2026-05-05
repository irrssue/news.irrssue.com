import { fetchStoriesByRange, TimeRange } from "./hn";
import StoryList from "./StoryList";
import NavBar from "./NavBar";

const VALID: TimeRange[] = ["today", "week", "month", "all"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const range: TimeRange = VALID.includes(t as TimeRange)
    ? (t as TimeRange)
    : "today";

  const stories = await fetchStoriesByRange(range, 30);

  return (
    <>
      <NavBar count={stories.length} />
      <main className="page-main">
        <StoryList stories={stories} range={range} showRangeFilter />
      </main>
    </>
  );
}
