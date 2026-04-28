import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchStory, fetchThreadComments, getAge, getDomain } from "../../hn";
import CommentsThread from "./CommentsThread";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const storyId = parseInt(id, 10);
  if (isNaN(storyId)) notFound();

  const [story, comments] = await Promise.all([
    fetchStory(storyId),
    fetchThreadComments(storyId),
  ]);

  if (!story) notFound();

  const age = getAge(story.time);
  const domain = getDomain(story.url);

  return (
    <main style={{ maxWidth: 740, margin: "0 auto", padding: "52px 28px 96px" }}>
      {/* Breadcrumb */}
      <nav
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "#444",
          marginBottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Link href="/" style={{ color: "#666", transition: "color 0.1s" }}
          onMouseEnter={undefined}
        >
          Reads
        </Link>
        <span style={{ color: "#2a2a2a" }}>/</span>
        <Link href="/" style={{ color: "#555" }}>Front page</Link>
        <span style={{ color: "#2a2a2a" }}>/</span>
        <span style={{ color: "#333" }}>thread</span>
      </nav>

      {/* Story hero */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "0 32px",
          marginBottom: 32,
          paddingBottom: 32,
          borderBottom: "1px solid #191919",
        }}
      >
        {/* Score */}
        <div style={{ paddingTop: 6 }}>
          <div
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(52px, 8vw, 72px)",
              fontWeight: 900,
              lineHeight: 1,
              color: "#e8e8e8",
              letterSpacing: "-0.02em",
            }}
          >
            {story.score}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#3d3d3d",
              marginTop: 6,
            }}
          >
            points · {age}
          </div>
        </div>

        {/* Title + meta */}
        <div style={{ paddingTop: 8 }}>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#e2e2e2",
              marginBottom: 12,
              letterSpacing: "-0.01em",
            }}
          >
            {story.url ? (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {story.title}
              </a>
            ) : (
              story.title
            )}
          </h1>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "#3d3d3d",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#555" }}>{domain}</span>
            <span style={{ color: "#2a2a2a" }}>·</span>
            <span style={{ color: "#3a3a3a" }}>by</span>
            <span style={{ color: "#666", fontWeight: 500 }}>{story.by}</span>
            <span style={{ color: "#2a2a2a" }}>·</span>
            <span style={{ color: "#444" }}>{age}</span>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <CommentsThread
        comments={comments}
        storyAuthor={story.by}
        totalCount={story.descendants ?? 0}
      />
    </main>
  );
}
